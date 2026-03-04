from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import os, uuid, json
from io import BytesIO
from PIL import Image, ImageEnhance
import stripe
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from rembg import remove
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

load_dotenv()

# ─────────────────────────────────────────────
#  CONFIG
# ─────────────────────────────────────────────
STRIPE_SECRET_KEY    = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET= os.getenv("STRIPE_WEBHOOK_SECRET", "")
SECRET_KEY           = os.getenv("JWT_SECRET", "change-moi-avec-un-vrai-secret-long")
DATABASE_URL         = os.getenv("DATABASE_URL", "")       # Railway injecte ça automatiquement
FRONTEND_URL         = os.getenv("FRONTEND_URL", "https://pixglow.app")
ALGORITHM            = "HS256"
TOKEN_EXPIRE_DAYS    = 30
FREE_IMAGES_PER_IP   = 5
UPLOAD_DIR           = "output"

os.makedirs(UPLOAD_DIR, exist_ok=True)
stripe.api_key = STRIPE_SECRET_KEY
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security    = HTTPBearer(auto_error=False)

app = FastAPI(title="PixGlow API", version="2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
#  POSTGRESQL
# ─────────────────────────────────────────────
def get_db():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id            SERIAL PRIMARY KEY,
            email         TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            credits       INTEGER DEFAULT 0,
            created_at    TIMESTAMP DEFAULT NOW()
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS ip_usage (
            ip    TEXT PRIMARY KEY,
            count INTEGER DEFAULT 0
        )
    """)
    conn.commit()
    cur.close()
    conn.close()

try:
    init_db()
    print("[DB] PostgreSQL connecté ✅")
except Exception as e:
    print(f"[DB] Erreur connexion : {e}")

# ─────────────────────────────────────────────
#  SCHEMAS
# ─────────────────────────────────────────────
class AuthBody(BaseModel):
    email: str
    password: str

# ─────────────────────────────────────────────
#  UTILITAIRES
# ─────────────────────────────────────────────
def hash_password(p: str) -> str:
    return pwd_context.hash(p)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None

def check_ip_limit(ip: str) -> tuple[bool, int]:
    conn = get_db()
    cur  = conn.cursor()
    cur.execute("SELECT count FROM ip_usage WHERE ip = %s", (ip,))
    row = cur.fetchone()
    if row is None:
        cur.execute("INSERT INTO ip_usage (ip, count) VALUES (%s, 1)", (ip,))
        conn.commit(); cur.close(); conn.close()
        return True, 1
    count = row["count"]
    if count >= FREE_IMAGES_PER_IP:
        cur.close(); conn.close()
        return False, count
    cur.execute("UPDATE ip_usage SET count = count + 1 WHERE ip = %s", (ip,))
    conn.commit(); cur.close(); conn.close()
    return True, count + 1

# ─────────────────────────────────────────────
#  ROUTES
# ─────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "service": "PixGlow v2", "db": "PostgreSQL"}


@app.post("/register")
async def register(body: AuthBody):
    if "@" not in body.email:
        raise HTTPException(400, "Email invalide")
    if len(body.password) < 6:
        raise HTTPException(400, "Mot de passe trop court (minimum 6 caractères)")
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = %s", (body.email,))
    if cur.fetchone():
        cur.close(); conn.close()
        raise HTTPException(400, "Cet email est déjà utilisé")
    cur.execute(
        "INSERT INTO users (email, password_hash, credits) VALUES (%s, %s, 0)",
        (body.email, hash_password(body.password))
    )
    conn.commit(); cur.close(); conn.close()
    return {"status": "success", "token": create_token(body.email), "credits": 0}


@app.post("/login")
async def login(body: AuthBody):
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE email = %s", (body.email,))
    user = cur.fetchone()
    cur.close(); conn.close()
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Email ou mot de passe incorrect")
    return {"status": "success", "token": create_token(body.email), "credits": user["credits"]}


@app.get("/me")
async def get_me(current_user: str = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(401, "Non authentifié")
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT credits FROM users WHERE email = %s", (current_user,))
    user = cur.fetchone()
    cur.close(); conn.close()
    if not user:
        raise HTTPException(404, "Utilisateur introuvable")
    return {"email": current_user, "credits": user["credits"]}


@app.post("/enhance")
async def enhance_photo(
    file: UploadFile = File(...),
    request: Request = None,
    current_user: str = Depends(get_current_user)
):
    conn = get_db(); cur = conn.cursor()

    # Vérification crédits / limite IP
    if current_user:
        cur.execute("SELECT credits FROM users WHERE email = %s", (current_user,))
        user = cur.fetchone()
        if not user or user["credits"] <= 0:
            cur.close(); conn.close()
            raise HTTPException(402, "Crédits insuffisants. Rechargez votre compte.")
    else:
        allowed, used = check_ip_limit(request.client.host)
        if not allowed:
            cur.close(); conn.close()
            raise HTTPException(
                429,
                f"Limite gratuite atteinte ({used}/{FREE_IMAGES_PER_IP}). "
                "Créez un compte pour acheter des crédits."
            )

    try:
        contents = await file.read()
        orig = Image.open(BytesIO(contents))
        w, h = orig.size

        # Redimensionner si nécessaire pour rembg
        tmp = orig.copy()
        if w > 2000 or h > 2000:
            tmp.thumbnail((2000, 2000), Image.Resampling.LANCZOS)

        # Suppression fond (rembg)
        img = remove(tmp)

        # Retour à la taille originale
        if img.size != (w, h):
            img = img.resize((w, h), Image.Resampling.LANCZOS)

        # Fond blanc + padding
        pad = 90
        canvas = Image.new("RGBA", (w + pad*2, h + pad*2), (255, 255, 255, 255))
        canvas.paste(img, (pad, pad), img)
        bg = Image.new("RGB", canvas.size, (255, 255, 255))
        bg.paste(canvas, (0, 0), canvas)

        # Améliorations
        bg = ImageEnhance.Brightness(bg).enhance(1.10)
        bg = ImageEnhance.Contrast(bg).enhance(1.10)
        bg = ImageEnhance.Color(bg).enhance(1.05)
        bg = ImageEnhance.Sharpness(bg).enhance(1.05)

        filename = f"{uuid.uuid4()}.png"
        bg.save(os.path.join(UPLOAD_DIR, filename), "PNG", quality=95)

        credits_left = None
        if current_user:
            cur.execute(
                "UPDATE users SET credits = credits - 1 WHERE email = %s RETURNING credits",
                (current_user,)
            )
            credits_left = cur.fetchone()["credits"]
            conn.commit()

        cur.close(); conn.close()
        return JSONResponse({
            "status":       "success",
            "filename":     filename,
            "url":          f"/image/{filename}",
            "credits_left": credits_left
        })

    except Exception as e:
        cur.close(); conn.close()
        print(f"[ERREUR enhance] {e}")
        return JSONResponse({"error": str(e)}, status_code=500)


@app.get("/image/{filename}")
async def get_image(filename: str):
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(404, "Image introuvable")
    return FileResponse(filepath, media_type="image/png")


@app.post("/create-checkout-session")
async def create_checkout_session(current_user: str = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(401, "Connexion requise")
    try:
        session = stripe.checkout.Session.create(
            customer_email=current_user,
            payment_method_types=["card"],
            mode="payment",
            line_items=[{
                "price_data": {
                    "currency": "eur",
                    "product_data": {"name": "100 Crédits PixGlow"},
                    "unit_amount": 1500,
                },
                "quantity": 1,
            }],
            success_url=f"{FRONTEND_URL}/?payment=success",
            cancel_url=f"{FRONTEND_URL}/?payment=cancel",
            metadata={"email": current_user}
        )
        return {"checkout_url": session.url}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig     = request.headers.get("stripe-signature")

    if STRIPE_WEBHOOK_SECRET:
        try:
            event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
        except Exception:
            return JSONResponse({"error": "Signature invalide"}, status_code=400)
    else:
        try:
            event = json.loads(payload)
        except Exception:
            return JSONResponse({"error": "Payload invalide"}, status_code=400)

    if event["type"] == "checkout.session.completed":
        obj   = event["data"]["object"]
        email = obj.get("customer_email") or obj.get("metadata", {}).get("email")
        if email:
            conn = get_db(); cur = conn.cursor()
            cur.execute(
                "UPDATE users SET credits = credits + 100 WHERE email = %s",
                (email,)
            )
            conn.commit(); cur.close(); conn.close()
            print(f"[WEBHOOK] ✅ 100 crédits → {email}")

    return {"status": "success"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))