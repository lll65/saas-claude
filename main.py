from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Query, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
import json
from io import BytesIO
from PIL import Image, ImageEnhance
import stripe
from dotenv import load_dotenv
from rembg import remove
import hmac
import hashlib

load_dotenv()

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "sk_test_xxx")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
API_KEY = os.getenv("API_KEY", "test_key_12345")

UPLOAD_DIR = "output"
IP_TRACKER_FILE = "ip_tracker.json"
USERS_FILE = "users.json"
os.makedirs(UPLOAD_DIR, exist_ok=True)

stripe.api_key = STRIPE_SECRET_KEY

app = FastAPI(title="PixGlow API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== IP TRACKER =====
def load_ip_tracker():
    try:
        with open(IP_TRACKER_FILE, 'r') as f:
            return json.load(f)
    except:
        return {}

def save_ip_tracker(tracker):
    with open(IP_TRACKER_FILE, 'w') as f:
        json.dump(tracker, f)

def check_ip_limit(client_ip: str, max_images: int = 5):
    tracker = load_ip_tracker()
    
    if client_ip not in tracker:
        tracker[client_ip] = {"count": 0}
    
    ip_data = tracker[client_ip]
    
    if ip_data["count"] >= max_images:
        save_ip_tracker(tracker)
        return False, ip_data["count"], max_images
    
    ip_data["count"] += 1
    save_ip_tracker(tracker)
    return True, ip_data["count"], max_images

# ===== USERS DB =====
def load_users():
    try:
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    except:
        return {}

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

# ===== ROUTES =====

@app.get("/")
def root():
    return {"status": "running", "service": "PixGlow with Rembg"}

@app.post("/register")
async def register(email: str = Query(None), password: str = Query(None)):
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email et password requis")
    
    if "@" not in email:
        raise HTTPException(status_code=400, detail="Email invalide")
    
    users = load_users()
    
    if email in users:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    users[email] = {
        "password": password,
        "credits": 0
    }
    save_users(users)
    
    return {"status": "success", "message": "Utilisateur créé"}

@app.post("/login")
async def login(email: str = Query(None), password: str = Query(None)):
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email et password requis")
    
    users = load_users()
    
    if email not in users:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    user = users[email]
    if user["password"] != password:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    return {
        "status": "success",
        "email": email,
        "credits": user["credits"]
    }

@app.post("/enhance")
async def enhance_photo(file: UploadFile = File(...), email: str = Query(None), x_api_key: str = Header(None), request: Request = None):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    client_ip = request.client.host
    users = load_users()
    
    # Vérifier les crédits
    if email and email in users:
        user = users[email]
        if user["credits"] <= 0:
            raise HTTPException(status_code=402, detail="Crédits insuffisants")
    else:
        allowed, used, limit = check_ip_limit(client_ip, max_images=5)
        if not allowed:
            raise HTTPException(status_code=429, detail=f"Limite gratuite atteinte: {used}/{limit}")
    
    try:
        contents = await file.read()
        
        # Charger l'image originale
        original_image = Image.open(BytesIO(contents))
        original_width, original_height = original_image.size
        
        # Redimensionner temporairement pour Rembg si trop gros
        temp_image = original_image.copy()
        if original_width > 2000 or original_height > 2000:
            temp_image.thumbnail((2000, 2000), Image.Resampling.LANCZOS)
        
        # REMBG - Retirer le fond (GRATUIT!)
        image = remove(temp_image)
        
        # Redimensionner à la taille originale
        if image.size != (original_width, original_height):
            image = image.resize((original_width, original_height), Image.Resampling.LANCZOS)
        
        # Ajouter padding blanc
        padding = 90
        new_size = (original_width + padding * 2, original_height + padding * 2)
        canvas = Image.new("RGBA", new_size, (255, 255, 255, 255))
        canvas.paste(image, (padding, padding), image)
        
        background = Image.new("RGB", canvas.size, (255, 255, 255))
        background.paste(canvas, (0, 0), canvas)
        
        # Enhancement léger
        enhancer = ImageEnhance.Brightness(background)
        background = enhancer.enhance(1.10)
        enhancer = ImageEnhance.Contrast(background)
        background = enhancer.enhance(1.10)
        enhancer = ImageEnhance.Color(background)
        background = enhancer.enhance(1.05)
        enhancer = ImageEnhance.Sharpness(background)
        background = enhancer.enhance(1.05)
        
        filename = f"{uuid.uuid4()}.png"
        filepath = os.path.join(UPLOAD_DIR, filename)
        background.save(filepath, "PNG", quality=95)
        
        # Décrémenter les crédits si payant
        if email and email in users:
            users[email]["credits"] -= 1
            save_users(users)
            credits_left = users[email]["credits"]
        else:
            credits_left = None
        
        return JSONResponse({
            "status": "success",
            "filename": filename,
            "url": f"/image/{filename}",
            "credits_left": credits_left
        })
    
    except Exception as e:
        print(f"ERROR: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)

@app.get("/image/{filename}")
async def get_image(filename: str):
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(filepath, media_type="image/png")

@app.post("/create-checkout-session")
async def create_checkout_session(email: str = Query(None), x_api_key: str = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    if not email:
        raise HTTPException(status_code=400, detail="Email required")
    
    try:
        session = stripe.checkout.Session.create(
            customer_email=email,
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
            success_url="https://pixglow.app/?payment=success&email=" + email,
            cancel_url="https://pixglow.app/?payment=cancel",
            metadata={"email": email}
        )
        return {"checkout_url": session.url, "session_id": session.id}
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/webhook")
async def stripe_webhook(request: Request):
    """Webhook Stripe - Ajoute 100 crédits après paiement réussi"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    print(f"[WEBHOOK] Reçu webhook Stripe")
    print(f"[WEBHOOK] Signature: {sig_header}")
    
    # Si pas de webhook secret, accepter quand même (development)
    if STRIPE_WEBHOOK_SECRET:
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
            print(f"[WEBHOOK] ✅ Signature valide")
        except ValueError:
            print(f"[WEBHOOK] ❌ Invalid payload")
            return JSONResponse({"error": "Invalid payload"}, status_code=400)
        except stripe.error.SignatureVerificationError:
            print(f"[WEBHOOK] ❌ Invalid signature")
            return JSONResponse({"error": "Invalid signature"}, status_code=400)
    else:
        # Mode dev: parser le JSON directement
        try:
            event = json.loads(payload)
            print(f"[WEBHOOK] Mode dev (pas de webhook secret)")
        except:
            return JSONResponse({"error": "Invalid payload"}, status_code=400)
    
    print(f"[WEBHOOK] Type: {event.get('type')}")
    
    # Traiter le paiement réussi
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        email = session.get("customer_email")
        
        print(f"[WEBHOOK] ✅ Paiement réussi pour: {email}")
        
        users = load_users()
        if email and email in users:
            # Ajouter 100 crédits
            users[email]["credits"] += 100
            save_users(users)
            print(f"[WEBHOOK] ✅ Crédits ajoutés! Total: {users[email]['credits']}")
        else:
            print(f"[WEBHOOK] ⚠️ Email {email} non trouvé dans la base")
    
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)