from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Depends, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
from io import BytesIO
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import stripe
from dotenv import load_dotenv

# --- CONFIGURATION REMBG ---
try:
    from rembg import remove, new_session
    REMBG_AVAILABLE = True
    print("⏳ Chargement du modèle Rembg...")
    session = new_session("u2net") 
    print("✅ REMBG CHARGÉ AVEC SUCCÈS")
except ImportError as e:
    print(f"❌ REMBG N'A PAS PU CHARGER: {e}")
    REMBG_AVAILABLE = False

load_dotenv()

# Configuration Variables
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "sk_test_4eC39HqLyjWDarhtT1l1kKt")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "") # À récupérer sur le dashboard Stripe
API_KEY = os.getenv("API_KEY", "test_key_12345")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://saas-claude-7v6m08lui-lohangottardi-5625s-projects.vercel.app")

UPLOAD_DIR = "output"
os.makedirs(UPLOAD_DIR, exist_ok=True)

stripe.api_key = STRIPE_SECRET_KEY

app = FastAPI(title="PhotoVinted API Premium", version="1.3")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=False, 
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SIMULATION BASE DE DONNÉES (À remplacer par Supabase/PostgreSQL) ---
# Format: {"email@test.com": 100}
user_credits = {} 

def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return True

@app.get("/")
def root():
    return {"status": "running", "rembg": REMBG_AVAILABLE}

@app.post("/enhance")
async def enhance_photo(file: UploadFile = File(...), x_api_key: str = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    try:
        import requests
        
        contents = await file.read()
        
        # REMOVE.BG API - MEILLEUR QUE REMBG
        REMOVEBG_API_KEY = os.getenv("REMOVEBG_API_KEY", "")
        
        response = requests.post(
            'https://api.remove.bg/v1.0/removebg',
            files={'image_file': ('image.png', contents)},
            data={'size': 'auto'},
            headers={'X-API-Key': REMOVEBG_API_KEY},
            timeout=30
        )
        
        if response.status_code == 200:
            image = Image.open(BytesIO(response.content)).convert("RGBA")
        else:
            image = Image.open(BytesIO(contents)).convert("RGBA")
        
        # Traitement identique
        image.thumbnail((900, 900), Image.Resampling.LANCZOS)
        padding = 90
        new_size = (image.size[0] + padding * 2, image.size[1] + padding * 2)
        canvas = Image.new("RGBA", new_size, (255, 255, 255, 255))
        canvas.paste(image, (padding, padding), image)
        
        background = Image.new("RGB", canvas.size, (255, 255, 255))
        background.paste(canvas, (0, 0), canvas)
        
        enhancer = ImageEnhance.Brightness(background)
        background = enhancer.enhance(1.20)
        enhancer = ImageEnhance.Contrast(background)
        background = enhancer.enhance(1.25)
        enhancer = ImageEnhance.Color(background)
        background = enhancer.enhance(1.25)
        enhancer = ImageEnhance.Sharpness(background)
        background = enhancer.enhance(1.20)
        
        background = background.resize((1080, 1080), Image.Resampling.LANCZOS)
        
        filename = f"{uuid.uuid4()}.png"
        filepath = os.path.join(UPLOAD_DIR, filename)
        background.save(filepath, "PNG", quality=95)
        
        return JSONResponse({
            "status": "success",
            "filename": filename,
            "url": f"/image/{filename}"
        })
    
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@app.get("/image/{filename}")
async def get_image(filename: str):
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Image non trouvée")
    return FileResponse(filepath, media_type="image/png")

# --- STRIPE CHECKOUT ---
@app.post("/create-checkout-session")
async def create_checkout_session(email: str, _: bool = Depends(verify_api_key)):
    try:
        checkout_session = stripe.checkout.Session.create(
            customer_email=email, # Lie le paiement à l'utilisateur
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'product_data': {'name': '100 Crédits PhotoVinted'},
                    'unit_amount': 1500,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f"{FRONTEND_URL}/?success=true",
            cancel_url=f"{FRONTEND_URL}/?canceled=true",
        )
        return {"checkout_url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- WEBHOOK STRIPE (L'AUTOMATISATION DES CRÉDITS) ---
@app.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_email = session.get("customer_email")
        
        # On ajoute les crédits ici
        if user_email:
            current = user_credits.get(user_email, 0)
            user_credits[user_email] = current + 100
            print(f"💰 CRÉDITS AJOUTÉS pour {user_email}: 100")

    return JSONResponse({"status": "success"})

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)