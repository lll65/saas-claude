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
    print("⏳ Chargement du modèle Rembg...")
    # Utilisation d'un modèle plus léger si besoin (u2netp) ou standard (u2net)
    session = new_session("u2netp") # Plus rapide et léger pour Railway 
    print("✅ REMBG CHARGÉ AVEC SUCCÈS")
except ImportError as e:
    print(f"❌ REMBG N'A PAS PU CHARGER: {e}")
    REMBG_AVAILABLE = False

load_dotenv()

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "sk_test_4eC39HqLyjWDarhtT1l1kKt")
API_KEY = os.getenv("API_KEY", "test_key_12345")
FRONTEND_URL = "https://saas-claude-7v6m08lui-lohangottardi-5625s-projects.vercel.app"

UPLOAD_DIR = "output"
os.makedirs(UPLOAD_DIR, exist_ok=True)

stripe.api_key = STRIPE_SECRET_KEY

app = FastAPI(title="PhotoVinted API", version="1.1")

# --- CORS (CONFIGURÉ POUR TOUTES LES ORIGINES) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=False, 
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
        if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
            raise HTTPException(status_code=400, detail="JPG ou PNG uniquement")

        contents = await file.read()
        
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Image > 10MB")

        # --- OPTIMISATION PRÉ-TRAITEMENT ---
        # On ouvre l'image pour la réduire si elle est trop massive (gain de RAM énorme)
        with Image.open(BytesIO(contents)) as pre_img:
            # Conversion en RGB pour le traitement initial
            if pre_img.mode != "RGB":
                pre_img = pre_img.convert("RGB")
            
            # Si l'image dépasse 1500px, on la réduit pour économiser le serveur
            pre_img.thumbnail((1500, 1500), Image.Resampling.LANCZOS)
            
            prep_buffer = BytesIO()
            pre_img.save(prep_buffer, format="JPEG", quality=90)
            optimized_contents = prep_buffer.getvalue()

        print("🔄 Suppression du fond (Image optimisée)...")
        # On passe l'image optimisée à rembg
        image_without_bg = remove(optimized_contents, session=session)
        
        # On travaille sur l'image sans fond
        image = Image.open(BytesIO(image_without_bg)).convert("RGBA")
        
        # Redimensionnement final pour le rendu (900px pour le sujet)
        image.thumbnail((900, 900), Image.Resampling.LANCZOS)
        
        # --- COMPOSITION ---
        padding = 90
        new_size = (image.size[0] + padding * 2, image.size[1] + padding * 2)
        canvas = Image.new("RGBA", new_size, (255, 255, 255, 255))
        canvas.paste(image, (padding, padding), image)
        
        # Fond blanc final
        final_img = Image.new("RGB", canvas.size, (255, 255, 255))
        final_img.paste(canvas, (0, 0), canvas)
        
        # --- AMÉLIORATIONS VISUELLES ---
        final_img = ImageEnhance.Brightness(final_img).enhance(1.15)
        final_img = ImageEnhance.Contrast(final_img).enhance(1.15)
        final_img = ImageEnhance.Color(final_img).enhance(1.20)
        final_img = ImageEnhance.Sharpness(final_img).enhance(1.10)
        
        # Redimensionnement standard 1080x1080 (Format Vinted/Insta)
        final_img = final_img.resize((1080, 1080), Image.Resampling.LANCZOS)
        
        filename = f"{uuid.uuid4()}.png"
        filepath = os.path.join(UPLOAD_DIR, filename)
        final_img.save(filepath, "PNG")
        
        print(f"✅ SUCCÈS: {filename}")
        
        return JSONResponse({
            "status": "success",
            "filename": filename,
            "url": f"/image/{filename}"
        })
    
    except Exception as e:
        print(f"❌ ERREUR SERVEUR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors du traitement: {str(e)}")

@app.get("/image/{filename}")
async def get_image(filename: str):
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Image non trouvée")
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
                        "description": "Amélioration automatique de 100 photos",
                    },
                    "unit_amount": 1500,
                },
                "quantity": 1,
            }],
            success_url=f"{FRONTEND_URL}/?payment=success",
            cancel_url=f"{FRONTEND_URL}/?payment=cancel",
        )
        return {"checkout_url": session_stripe.url, "session_id": session_stripe.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)