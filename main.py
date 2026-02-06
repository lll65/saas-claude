from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Depends
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
    # Si Railway crash encore, remplace "u2net" par "u2netp"
    session = new_session("u2net") 
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

app = FastAPI(title="PhotoVinted API Premium", version="1.2")

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
        
        with Image.open(BytesIO(contents)) as pre_img:
            pre_img = ImageOps.exif_transpose(pre_img)
            if pre_img.mode != "RGB":
                pre_img = pre_img.convert("RGB")
            
            pre_img.thumbnail((2000, 2000), Image.Resampling.LANCZOS)
            
            prep_buffer = BytesIO()
            pre_img.save(prep_buffer, format="PNG")
            optimized_contents = prep_buffer.getvalue()

        print("🔄 Suppression du fond Premium...")
        image_without_bg = remove(optimized_contents, session=session)
        
        item = Image.open(BytesIO(image_without_bg)).convert("RGBA")
        item.thumbnail((950, 950), Image.Resampling.LANCZOS)

        shadow = item.copy()
        shadow = shadow.filter(ImageFilter.GaussianBlur(radius=20))
        
        canvas_size = (1080, 1080)
        final_img = Image.new("RGBA", canvas_size, (255, 255, 255, 255))
        
        item_pos = ((canvas_size[0] - item.size[0]) // 2, (canvas_size[1] - item.size[1]) // 2)
        shadow_pos = (item_pos[0] + 10, item_pos[1] + 15)
        
        final_img.paste(shadow, shadow_pos, shadow)
        final_img.paste(item, item_pos, item)
        
        final_img = final_img.convert("RGB")
        
        final_img = ImageEnhance.Brightness(final_img).enhance(1.25)
        final_img = ImageEnhance.Contrast(final_img).enhance(1.20)
        final_img = ImageEnhance.Color(final_img).enhance(1.15)
        final_img = ImageEnhance.Sharpness(final_img).enhance(1.60)
        
        filename = f"{uuid.uuid4()}.png"
        filepath = os.path.join(UPLOAD_DIR, filename)
        final_img.save(filepath, "PNG", optimize=False)
        
        print(f"✅ SUCCÈS PREMIUM: {filename}")
        
        return JSONResponse({
            "status": "success",
            "filename": filename,
            "url": f"/image/{filename}"
        })
    
    except Exception as e:
        print(f"❌ ERREUR SERVEUR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.get("/image/{filename}")
async def get_image(filename: str):
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Image non trouvée")
    return FileResponse(filepath, media_type="image/png")

# --- LA ROUTE QUI MANQUAIT (CORRIGÉE) ---
@app.post("/create-checkout-session")
async def create_checkout_session(_: bool = Depends(verify_api_key)):
    try:
        checkout_session = stripe.checkout.Session.create(
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
        print(f"❌ ERREUR STRIPE: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Important: Railway utilise 0.0.0.0
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)