from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.exceptions import HTTPException as StarletteHTTPException
from pydantic import BaseModel
import os, uuid, json, time
from io import BytesIO
from PIL import Image, ImageEnhance
import stripe
import psycopg2
import psycopg2.extras
import httpx
from dotenv import load_dotenv
from rembg import remove
import bcrypt as _bcrypt
from jose import JWTError, jwt

# Support HEIC/HEIF (photos iPhone)
try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
    print("[STARTUP] ✅ HEIC/HEIF supporté")
except ImportError:
    print("[STARTUP] ⚠️ pillow-heif non installé — HEIC non supporté")
from datetime import datetime, timedelta
from collections import defaultdict
import threading

load_dotenv()

# ─────────────────────────────────────────────
#  CONFIG
# ─────────────────────────────────────────────
STRIPE_SECRET_KEY     = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
SECRET_KEY            = os.getenv("JWT_SECRET", "change-moi-avec-un-vrai-secret-long")
FRONTEND_URL          = os.getenv("FRONTEND_URL", "https://pixglow.app")
ALGORITHM             = "HS256"
TOKEN_EXPIRE_DAYS     = 30
FREE_IMAGES_PER_IP    = 5
UPLOAD_DIR            = "output"
MAX_FILE_SIZE_MB      = 15
ALLOWED_TYPES         = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"}
IMAGE_TTL_HOURS       = 24  # supprime les images après 24h
ANTHROPIC_API_KEY     = os.getenv("ANTHROPIC_API_KEY", "")

_raw_db_url  = os.getenv("DATABASE_URL", "")
DATABASE_URL = _raw_db_url.replace("postgres://", "postgresql://", 1) if _raw_db_url.startswith("postgres://") else _raw_db_url

os.makedirs(UPLOAD_DIR, exist_ok=True)
stripe.api_key = STRIPE_SECRET_KEY
security = HTTPBearer(auto_error=False)

# ─────────────────────────────────────────────
#  RATE LIMITER simple en mémoire
# ─────────────────────────────────────────────
_rate_store: dict = defaultdict(list)
_rate_lock         = threading.Lock()

def rate_limit(ip: str, max_calls: int = 10, window_sec: int = 60):
    """Bloque une IP si elle dépasse max_calls requêtes dans window_sec."""
    now = time.time()
    with _rate_lock:
        calls = [t for t in _rate_store[ip] if now - t < window_sec]
        if len(calls) >= max_calls:
            raise HTTPException(429, "Trop de requêtes. Attendez 1 minute et réessayez.")
        calls.append(now)
        _rate_store[ip] = calls

# ─────────────────────────────────────────────
#  APP + CORS (origine exacte, pas "*")
# ─────────────────────────────────────────────
app = FastAPI(title="PixGlow API", version="2.3")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

CORS_HEADERS = {"Access-Control-Allow-Origin": "https://www.pixglow.app"}

# ─────────────────────────────────────────────
#  HANDLERS D'ERREUR
# ─────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exc(request: Request, exc: Exception):
    print(f"[ERREUR] {type(exc).__name__}: {exc}")
    return JSONResponse(status_code=500, content={"detail": f"Erreur serveur: {str(exc)}"}, headers=CORS_HEADERS)

@app.exception_handler(StarletteHTTPException)
async def http_exc(request: Request, exc: StarletteHTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail}, headers=CORS_HEADERS)

# ─────────────────────────────────────────────
#  POSTGRESQL
# ─────────────────────────────────────────────
def get_db():
    if not DATABASE_URL:
        raise HTTPException(503, "DATABASE_URL manquante dans les variables Railway.")
    try:
        return psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
    except psycopg2.OperationalError as e:
        raise HTTPException(503, f"Base de données inaccessible: {e}")

@app.on_event("startup")
async def startup_event():
    print(f"[STARTUP] PixGlow v2.3 — DB: {'OK' if DATABASE_URL else 'MANQUANTE'}")
    try:
        conn = get_db(); cur = conn.cursor()
        cur.execute("""CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL, credits INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
        )""")
        cur.execute("""CREATE TABLE IF NOT EXISTS ip_usage (
            ip TEXT PRIMARY KEY, count INTEGER DEFAULT 0
        )""")
        conn.commit(); cur.close(); conn.close()
        print("[STARTUP] ✅ Tables OK")
    except Exception as e:
        print(f"[STARTUP] ⚠️ DB: {e}")
    # Lance le nettoyage automatique des images
    _schedule_cleanup()

# ─────────────────────────────────────────────
#  NETTOYAGE AUTO DES IMAGES (toutes les 6h)
# ─────────────────────────────────────────────
def _cleanup_images():
    cutoff = time.time() - IMAGE_TTL_HOURS * 3600
    try:
        for fname in os.listdir(UPLOAD_DIR):
            fpath = os.path.join(UPLOAD_DIR, fname)
            if os.path.isfile(fpath) and os.path.getmtime(fpath) < cutoff:
                os.remove(fpath)
        print(f"[CLEANUP] Images > {IMAGE_TTL_HOURS}h supprimées")
    except Exception as e:
        print(f"[CLEANUP] Erreur: {e}")

def _schedule_cleanup():
    def loop():
        while True:
            time.sleep(6 * 3600)
            _cleanup_images()
    t = threading.Thread(target=loop, daemon=True)
    t.start()

# ─────────────────────────────────────────────
#  UTILITAIRES AUTH
# ─────────────────────────────────────────────
class AuthBody(BaseModel):
    email: str
    password: str

def hash_password(p: str) -> str:
    return _bcrypt.hashpw(p.encode("utf-8")[:72], _bcrypt.gensalt(12)).decode()

def verify_password(p: str, h: str) -> bool:
    return _bcrypt.checkpw(p.encode("utf-8")[:72], h.encode())

def create_token(email: str) -> str:
    exp = datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": email, "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials: return None
    try:
        return jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM]).get("sub")
    except JWTError:
        return None

def get_ip_count(ip: str) -> int:
    try:
        conn = get_db(); cur = conn.cursor()
        cur.execute("SELECT count FROM ip_usage WHERE ip = %s", (ip,))
        row = cur.fetchone(); cur.close(); conn.close()
        return row["count"] if row else 0
    except: return 0

def increment_ip(ip: str):
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT count FROM ip_usage WHERE ip = %s", (ip,))
    row = cur.fetchone()
    if not row:
        cur.execute("INSERT INTO ip_usage (ip, count) VALUES (%s, 1)", (ip,))
        conn.commit(); cur.close(); conn.close(); return True, 1
    count = row["count"]
    if count >= FREE_IMAGES_PER_IP:
        cur.close(); conn.close(); return False, count
    cur.execute("UPDATE ip_usage SET count = count + 1 WHERE ip = %s", (ip,))
    conn.commit(); cur.close(); conn.close(); return True, count + 1

class DescriptionRequest(BaseModel):
    image_url: str = ""

# ─────────────────────────────────────────────
#  ROUTES
# ─────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "version": "2.3", "db": bool(DATABASE_URL)}

@app.get("/health")
def health():
    try:
        conn = get_db(); cur = conn.cursor()
        cur.execute("SELECT COUNT(*) as n FROM users")
        n = cur.fetchone()["n"]; cur.close(); conn.close()
        return {"status": "ok", "db": "connected", "users": n}
    except Exception as e:
        return JSONResponse({"status": "error", "db": str(e)}, status_code=503)

@app.get("/free-remaining")
async def free_remaining(request: Request):
    ip = request.client.host
    used = get_ip_count(ip)
    return {"remaining": max(0, FREE_IMAGES_PER_IP - used), "used": used, "max": FREE_IMAGES_PER_IP}

@app.post("/register")
async def register(body: AuthBody, request: Request):
    # Rate limit : max 5 inscriptions par IP par heure
    rate_limit(request.client.host, max_calls=5, window_sec=3600)
    email = body.email.strip().lower()
    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(400, "Email invalide")
    if len(body.password) < 6:
        raise HTTPException(400, "Mot de passe trop court (minimum 6 caractères)")
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cur.fetchone():
        cur.close(); conn.close()
        raise HTTPException(400, "Cet email est déjà utilisé. Essayez de vous connecter.")
    cur.execute("INSERT INTO users (email, password_hash, credits) VALUES (%s, %s, 0)",
                (email, hash_password(body.password)))
    conn.commit(); cur.close(); conn.close()
    return {"status": "success", "token": create_token(email), "credits": 0}

@app.post("/login")
async def login(body: AuthBody, request: Request):
    # Rate limit : max 10 tentatives par IP par 10 minutes
    rate_limit(request.client.host, max_calls=10, window_sec=600)
    email = body.email.strip().lower()
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cur.fetchone(); cur.close(); conn.close()
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Email ou mot de passe incorrect")
    return {"status": "success", "token": create_token(email), "credits": user["credits"]}

@app.get("/me")
async def get_me(current_user: str = Depends(get_current_user)):
    if not current_user: raise HTTPException(401, "Non authentifié")
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT credits FROM users WHERE email = %s", (current_user,))
    user = cur.fetchone(); cur.close(); conn.close()
    if not user: raise HTTPException(404, "Utilisateur introuvable")
    return {"email": current_user, "credits": user["credits"]}

@app.post("/enhance")
async def enhance_photo(
    file: UploadFile = File(...),
    request: Request = None,
    current_user: str = Depends(get_current_user)
):
    # ── Validation du fichier
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"Format non supporté ({file.content_type}). Utilisez JPG, PNG ou WEBP.")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"Fichier trop lourd (max {MAX_FILE_SIZE_MB} Mo).")

    # Vérification crédits / quota IP
    conn = get_db(); cur = conn.cursor()
    if current_user:
        cur.execute("SELECT credits FROM users WHERE email = %s", (current_user,))
        user = cur.fetchone()
        if not user or user["credits"] <= 0:
            cur.close(); conn.close()
            raise HTTPException(402, "Crédits insuffisants. Rechargez votre compte.")
    else:
        allowed, used = increment_ip(request.client.host)
        if not allowed:
            cur.close(); conn.close()
            raise HTTPException(429, f"Limite gratuite atteinte ({used}/{FREE_IMAGES_PER_IP}). Créez un compte pour continuer.")

    try:
        orig = Image.open(BytesIO(contents))
        # Convertir en RGB si nécessaire (HEIC, RGBA, palette...)
        if orig.mode not in ("RGB", "RGBA"):
            orig = orig.convert("RGBA" if "transparency" in orig.info else "RGB")

        w, h = orig.size

        # Pour rembg : on travaille sur une version max 1500px (plus rapide)
        # mais on garde l'original pour le résultat final en haute qualité
        PROCESS_MAX = 1500
        if w > PROCESS_MAX or h > PROCESS_MAX:
            scale = PROCESS_MAX / max(w, h)
            proc_w, proc_h = int(w * scale), int(h * scale)
            tmp = orig.resize((proc_w, proc_h), Image.Resampling.LANCZOS)
        else:
            tmp = orig.copy()
            proc_w, proc_h = w, h

        # Suppression du fond
        no_bg = remove(tmp)

        # Remettre à la taille originale si on avait réduit
        if (proc_w, proc_h) != (w, h):
            no_bg = no_bg.resize((w, h), Image.Resampling.LANCZOS)

        # Fond blanc avec padding proportionnel (5% de chaque côté)
        pad = max(40, int(min(w, h) * 0.05))
        canvas = Image.new("RGBA", (w + pad*2, h + pad*2), (255, 255, 255, 255))
        canvas.paste(no_bg, (pad, pad), no_bg if no_bg.mode == "RGBA" else None)
        bg = Image.new("RGB", canvas.size, (255, 255, 255))
        bg.paste(canvas, (0, 0), canvas)

        # Améliorations légères
        bg = ImageEnhance.Brightness(bg).enhance(1.08)
        bg = ImageEnhance.Contrast(bg).enhance(1.08)
        bg = ImageEnhance.Color(bg).enhance(1.05)
        bg = ImageEnhance.Sharpness(bg).enhance(1.05)

        filename = f"{uuid.uuid4()}.png"
        # Qualité maximale — pas de compression agressive
        bg.save(os.path.join(UPLOAD_DIR, filename), "PNG", optimize=False)

        credits_left = None
        if current_user:
            cur.execute("UPDATE users SET credits = credits - 1 WHERE email = %s RETURNING credits", (current_user,))
            credits_left = cur.fetchone()["credits"]
            conn.commit()
        cur.close(); conn.close()
        return JSONResponse({"status": "success", "filename": filename, "url": f"/image/{filename}", "credits_left": credits_left})
    except HTTPException:
        raise
    except Exception as e:
        cur.close(); conn.close()
        print(f"[ERREUR enhance] {e}")
        raise HTTPException(500, f"Erreur traitement image: {str(e)}")

@app.get("/image/{filename}")
async def get_image(filename: str):
    filename = os.path.basename(filename)  # sécurité anti path-traversal
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(404, "Image introuvable ou expirée")
    return FileResponse(filepath, media_type="image/png")

@app.post("/create-checkout-session")
async def create_checkout_session(current_user: str = Depends(get_current_user)):
    if not current_user: raise HTTPException(401, "Connexion requise")
    try:
        session = stripe.checkout.Session.create(
            customer_email=current_user,
            payment_method_types=["card"],
            mode="payment",
            line_items=[{"price_data": {"currency": "eur",
                "product_data": {"name": "100 Crédits PixGlow",
                    "description": "1 crédit = 1 photo avec fond blanc. Valables à vie."},
                "unit_amount": 1500}, "quantity": 1}],
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
    # ── Webhook OBLIGATOIREMENT vérifié en production
    if not STRIPE_WEBHOOK_SECRET:
        return JSONResponse({"error": "STRIPE_WEBHOOK_SECRET non configuré"}, status_code=500)
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        print("[WEBHOOK] ❌ Signature invalide — tentative de fraude ?")
        return JSONResponse({"error": "Signature invalide"}, status_code=400)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

    if event["type"] == "checkout.session.completed":
        obj   = event["data"]["object"]
        email = (obj.get("customer_email") or obj.get("metadata", {}).get("email", "")).strip().lower()
        if email:
            try:
                conn = get_db(); cur = conn.cursor()
                cur.execute("UPDATE users SET credits = credits + 100 WHERE email = %s RETURNING credits", (email,))
                result = cur.fetchone()
                conn.commit(); cur.close(); conn.close()
                print(f"[WEBHOOK] ✅ 100 crédits → {email} (total: {result['credits'] if result else '?'})")
            except Exception as e:
                print(f"[WEBHOOK] ❌ Erreur DB: {e}")
    return {"status": "success"}

@app.post("/generate-description")
async def generate_description(
    body: DescriptionRequest,
    current_user: str = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(401, "Connexion requise pour générer une description AI")

    if not ANTHROPIC_API_KEY:
        raise HTTPException(503, "ANTHROPIC_API_KEY manquante")

    prompt = """Tu es un expert en vente sur Vinted et Leboncoin. Génère :
1. Un titre accrocheur max 60 caractères
2. Une description 150-250 caractères avec emojis
3. 10 hashtags
4. Un score potentiel vues entre 60 et 98

Réponds uniquement en JSON :
{"titre":"...","description":"...","hashtags":"#tag1 #tag2","score":85}"""

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-3-haiku-20240307",
                    "max_tokens": 400,
                    "messages": [
                        {"role": "user", "content": prompt}
                    ]
                }
            )

            data = response.json()
            text = "".join(block.get("text", "") for block in data.get("content", []))
            text = text.strip()

            import json as _json
            parsed = _json.loads(text)

            return parsed

    except Exception as e:
        print(f"[generate-description] {e}")
        raise HTTPException(500, "Erreur génération AI")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))