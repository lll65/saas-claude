from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Query
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
import requests
from io import BytesIO
from PIL import Image, ImageEnhance
import stripe
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "sk_test_xxx")
API_KEY = os.getenv("API_KEY", "test_key_12345")
REMOVEBG_API_KEY = os.getenv("REMOVEBG_API_KEY", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

UPLOAD_DIR = "output"
os.makedirs(UPLOAD_DIR, exist_ok=True)

stripe.api_key = STRIPE_SECRET_KEY

# Connexion Supabase
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Supabase connecté")
except Exception as e:
    print(f"❌ Erreur Supabase: {e}")
    supabase = None

app = FastAPI(title="PhotoBoost API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def verify_api_key(x_api_key: str = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return True

@app.get("/")
def root():
    return {"status": "running", "service": "remove.bg"}

@app.post("/register")
async def register(email: str = Query(None), password: str = Query(None)):
    """Enregistre un nouvel utilisateur"""
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email et password requis")
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Database unavailable")
    
    try:
        # Vérifie si l'email existe déjà
        response = supabase.table("users").select("*").eq("email", email).execute()
        if response.data:
            raise HTTPException(status_code=400, detail="Email déjà utilisé")
        
        # Crée un nouvel utilisateur
        new_user = {
            "email": email,
            "password": password,
            "credits": 5
        }
        supabase.table("users").insert(new_user).execute()
        
        return {"status": "success", "message": "Utilisateur créé"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login")
async def login(email: str = Query(None), password: str = Query(None)):
    """Vérifie l'identifiant et retourne les crédits"""
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email et password requis")
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Database unavailable")
    
    try:
        # Cherche l'utilisateur
        response = supabase.table("users").select("*").eq("email", email).eq("password", password).execute()
        
        if not response.data:
            raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
        
        user = response.data[0]
        return {
            "status": "success",
            "email": user["email"],
            "credits": user["credits"]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/enhance")
async def enhance_photo(file: UploadFile = File(...), email: str = Query(None), x_api_key: str = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    if not email:
        raise HTTPException(status_code=400, detail="Email required")
    
    try:
        # Vérifie les crédits
        if supabase:
            response = supabase.table("users").select("credits").eq("email", email).execute()
            if not response.data or response.data[0]["credits"] <= 0:
                raise HTTPException(status_code=402, detail="Crédits insuffisants")
        
        contents = await file.read()
        
        # Charger l'image originale
        original_image = Image.open(BytesIO(contents))
        original_width, original_height = original_image.size
        
        # Compresser pour Remove.bg
        compressed_image = original_image.copy()
        if original_width > 2000 or original_height > 2000:
            compressed_image.thumbnail((2000, 2000), Image.Resampling.LANCZOS)
        
        temp_buffer = BytesIO()
        compressed_image.save(temp_buffer, format="JPEG", quality=85)
        temp_buffer.seek(0)
        compressed_contents = temp_buffer.getvalue()
        
        # Remove.bg API
        response = requests.post(
            'https://api.remove.bg/v1.0/removebg',
            files={'image_file': ('image.jpg', compressed_contents)},
            data={'size': 'auto'},
            headers={'X-API-Key': REMOVEBG_API_KEY},
            timeout=30
        )
        
        if response.status_code == 200:
            image = Image.open(BytesIO(response.content)).convert("RGBA")
        else:
            image = original_image.convert("RGBA")
        
        # Redimensionner à la vraie taille
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
        
        # Décrémenter les crédits
        if supabase:
            current_credits = supabase.table("users").select("credits").eq("email", email).execute().data[0]["credits"]
            supabase.table("users").update({"credits": current_credits - 1}).eq("email", email).execute()
        
        return JSONResponse({
            "status": "success",
            "filename": filename,
            "url": f"/image/{filename}"
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
                    "product_data": {"name": "100 Crédits PhotoBoost"},
                    "unit_amount": 1500,
                },
                "quantity": 1,
            }],
            success_url="https://photoboost.com/?payment=success&email=" + email,
            cancel_url="https://photoboost.com/?payment=cancel",
        )
        return {"checkout_url": session.url, "session_id": session.id}
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/webhook")
async def stripe_webhook(request):
    """Ajoute les crédits après paiement"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.getenv("STRIPE_WEBHOOK_SECRET", "")
        )
    except:
        return JSONResponse({"error": "webhook_error"}, status_code=400)
    
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        email = session.get("customer_email")
        
        if email and supabase:
            current = supabase.table("users").select("credits").eq("email", email).execute().data[0]["credits"]
            supabase.table("users").update({"credits": current + 100}).eq("email", email).execute()
    
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)