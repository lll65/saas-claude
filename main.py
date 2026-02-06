from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Depends
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
from io import BytesIO
from PIL import Image, ImageEnhance
import stripe
from dotenv import load_dotenv

# --- CONFIGURATION REMBG ---
try:
    from rembg import remove, new_session
    REMBG_AVAILABLE = True
    print("⏳ Téléchargement du modèle Rembg...")
    session = new_session("u2net") # Chargement au démarrage pour éviter les délais au premier appel
    print("✅ REMBG CHARGÉ AVEC SUCCÈS")
except ImportError as e:
    print(f"❌ REMBG N'A PAS PU CHARGER: {e}")
    REMBG_AVAILABLE = False

load_dotenv()

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "sk_test_4eC39HqLyjWDarhtT1l1kKt")
API_KEY = os.getenv("API_KEY", "test_key_12345")
# Votre URL Vercel actuelle pour les redirections Stripe
FRONTEND_URL = "https://saas-claude-7v6m08lui-lohangottardi-5625s-projects.vercel.app"

UPLOAD_DIR = "output"
os.makedirs(UPLOAD_DIR, exist_ok=True)

stripe.api_key = STRIPE_SECRET_KEY

app = FastAPI(title="PhotoVinted API", version="1.0")

# --- CORRECTION CORS (CRITIQUE) ---
# On liste les origines autorisées explicitement pour éviter les erreurs de sécurité
origins = [
    FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:5173", # Standard pour Vite
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], # Autorise 'x-api-key' et 'content-type'
)

def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return True

@app.get("/")
def root():
    return {"status": "running", "rembg": REMBG_AVAILABLE}

@app.post("/enhance")
async def enhance_photo(file: UploadFile = File(...), _: bool = Depends(verify_api_key)):
    try:
        if file.content_type not in ["image/jpeg", "image/png"]:
            raise HTTPException(status_code=400, detail="JPG ou PNG uniquement")

        contents = await file.read()
        
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Image > 10MB")

        print("🔄 Suppression du fond...")
        # On utilise la session globale créée au démarrage pour plus de rapidité
        image_without_bg = remove(contents, session=session)
        image = Image.open(BytesIO(image_without_bg)).convert("RGBA")
        
        image.thumbnail((900, 900), Image.Resampling.LANCZOS)
        
        padding = 90
        new_size = (image.size[0] + padding * 2, image.size[1] + padding * 2)
        canvas = Image.new("RGBA", new_size, (255, 255, 255, 255))
        canvas.paste(image, (padding, padding), image)
        
        background = Image.new("RGB", canvas.size, (255, 255, 255))
        background.paste(canvas, (0, 0), canvas)
        
        # Améliorations visuelles
        background = ImageEnhance.Brightness(background).enhance(1.20)
        background = ImageEnhance.Contrast(background).enhance(1.25)
        background = ImageEnhance.Color(background).enhance(1.25)
        background = ImageEnhance.Sharpness(background).enhance(1.20)
        
        background = background.resize((1080, 1080), Image.Resampling.LANCZOS)
        
        filename = f"{uuid.uuid4()}.png"
        filepath = os.path.join(UPLOAD_DIR, filename)
        background.save(filepath, "PNG", quality=95)
        
        print(f"✅ SUCCÈS: {filename}")
        
        return JSONResponse({
            "status": "success",
            "filename": filename,
            "url": f"/image/{filename}"
        })
    
    except Exception as e:
        print(f"❌ ERREUR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/image/{filename}")
async def get_image(filename: str):
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(filepath, media_type="image/png")

@app.post("/create-checkout-session")
def create_checkout_session(_: bool = Depends(verify_api_key)):
    try:
        session_stripe = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="payment",
            line_items=[{
                "price_data": {
                    "currency": "eur",
                    "product_data": {
                        "name": "PhotoVinted - 100 crédits",
                        "description": "100 images à améliorer",
                    },
                    "unit_amount": 1500,
                },
                "quantity": 1,
            }],
            # Utilisation de FRONTEND_URL pour garantir la redirection correcte
            success_url=f"{FRONTEND_URL}/?payment=success",
            cancel_url=f"{FRONTEND_URL}/?payment=cancel",
        )
        return {"checkout_url": session_stripe.url, "session_id": session_stripe.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ... (Reste des routes inchangé)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)