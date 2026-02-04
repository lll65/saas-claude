from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Depends
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
from io import BytesIO
from PIL import Image, ImageEnhance
import stripe
from dotenv import load_dotenv

# REMBG - TRÈS IMPORTANT
try:
    from rembg import remove, new_session
    REMBG_AVAILABLE = True
    # Force le téléchargement du modèle au démarrage
    print("⏳ Téléchargement du modèle Rembg...")
    session = new_session()
    print("✅ REMBG CHARGÉ AVEC SUCCÈS")
except ImportError as e:
    print(f"❌ REMBG N'A PAS PU CHARGER: {e}")
    REMBG_AVAILABLE = False

load_dotenv()

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "sk_test_4eC39HqLyjWDarhtT1l1kKt")
API_KEY = os.getenv("API_KEY", "test_key_12345")
UPLOAD_DIR = "output"
os.makedirs(UPLOAD_DIR, exist_ok=True)

stripe.api_key = STRIPE_SECRET_KEY

app = FastAPI(title="PhotoVinted API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

        # ========== REMBG SUPPRESSION DE FOND ==========
        print(f"📸 Rembg disponible: {REMBG_AVAILABLE}")
        
        if REMBG_AVAILABLE:  # <-- Ligne 65
            try:
                print("🔄 Suppression du fond avec Rembg...")
                image_without_bg = remove(
                    contents,
                    alpha_matting=False,
                    only_mask=False,
                    post_process_mask=True,
                    session=session
                )
                image = Image.open(BytesIO(image_without_bg)).convert("RGBA")
                print("✅ Fond supprimé avec succès")
            except Exception as e:
                print(f"❌ Erreur Rembg: {e}")
                print("📸 Utilisation de l'image originale")
                image = Image.open(BytesIO(contents)).convert("RGBA")


        else:
            print("⚠️ Rembg non disponible, image originale utilisée")
            image = Image.open(BytesIO(contents)).convert("RGBA")

        # ========== RESIZE ==========
        print("📐 Resize...")
        image.thumbnail((900, 900), Image.Resampling.LANCZOS)
        
        # ========== PADDING BLANC ==========
        print("🟩 Ajout du padding blanc...")
        padding = 90
        new_size = (image.size[0] + padding * 2, image.size[1] + padding * 2)
        canvas = Image.new("RGBA", new_size, (255, 255, 255, 255))
        canvas.paste(image, (padding, padding), image)
        
        # ========== FOND BLANC PUR ==========
        print("⚪ Conversion en fond blanc...")
        background = Image.new("RGB", canvas.size, (255, 255, 255))
        background.paste(canvas, (0, 0), canvas)
        
        # ========== AMÉLIORATIONS ==========
        print("✨ Amélioration de l'image...")
        
        # Brightness
        enhancer = ImageEnhance.Brightness(background)
        background = enhancer.enhance(1.15)
        print("  ✓ Brightness +15%")
        
        # Contrast
        enhancer = ImageEnhance.Contrast(background)
        background = enhancer.enhance(1.30)
        print("  ✓ Contrast +30%")
        
        # Color saturation
        enhancer = ImageEnhance.Color(background)
        background = enhancer.enhance(1.25)
        print("  ✓ Saturation +25%")
        
        # Sharpness
        enhancer = ImageEnhance.Sharpness(background)
        background = enhancer.enhance(1.20)
        print("  ✓ Sharpness +20%")
        
        # ========== RESIZE FINAL ==========
        print("📏 Resize final 1080x1080...")
        background = background.resize((1080, 1080), Image.Resampling.LANCZOS)
        
        # ========== SAUVEGARDE ==========
        print("💾 Sauvegarde...")
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
        print(f"❌ ERREUR COMPLÈTE: {str(e)}")
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
        session = stripe.checkout.Session.create(
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
            success_url="https://saas-claude-52pzfkh3b-lohangottardi-5625s-projects.vercel.app/?payment=success",
            cancel_url="https://saas-claude-52pzfkh3b-lohangottardi-5625s-projects.vercel.app/?payment=cancel",
        )
        return {"checkout_url": session.url, "session_id": session.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/success")
def success_page():
    return {"status": "payment_success"}

@app.get("/cancel")
def cancel_page():
    return {"status": "payment_canceled"}

@app.get("/verify-payment/{session_id}")
def verify_payment(session_id: str, _: bool = Depends(verify_api_key)):
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        if session.payment_status == "paid":
            return {
                "status": "success",
                "credits": 100,
                "message": "100 crédits ajoutés!"
            }
        return {"status": "pending"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)