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

load_dotenv()

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "sk_test_xxx")
API_KEY = os.getenv("API_KEY", "test_key_12345")
REMOVEBG_API_KEY = os.getenv("REMOVEBG_API_KEY", "")
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

def verify_api_key(x_api_key: str = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return True

@app.get("/")
def root():
    return {"status": "running", "service": "remove.bg"}

@app.post("/enhance")
async def enhance_photo(file: UploadFile = File(...), x_api_key: str = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    try:
        contents = await file.read()
        
        # ÉTAPE 1: Charger l'image originale
        original_image = Image.open(BytesIO(contents))
        original_width, original_height = original_image.size
        
        print(f"Image originale: {original_width}x{original_height}")
        
        # ÉTAPE 2: Compresser pour Remove.bg (max 2000px)
        compressed_image = original_image.copy()
        if original_width > 2000 or original_height > 2000:
            compressed_image.thumbnail((2000, 2000), Image.Resampling.LANCZOS)
            print(f"Compressée pour Remove.bg: {compressed_image.size}")
        
        # Sauver en JPG compressé temporaire
        temp_buffer = BytesIO()
        compressed_image.save(temp_buffer, format="JPEG", quality=85)
        temp_buffer.seek(0)
        compressed_contents = temp_buffer.getvalue()
        
        # ÉTAPE 3: Envoyer à Remove.bg
        response = requests.post(
            'https://api.remove.bg/v1.0/removebg',
            files={'image_file': ('image.jpg', compressed_contents)},
            data={'size': 'auto'},
            headers={'X-API-Key': REMOVEBG_API_KEY},
            timeout=30
        )
        
        if response.status_code == 200:
            image = Image.open(BytesIO(response.content)).convert("RGBA")
            print("✅ Remove.bg succès")
        else:
            print(f"❌ Remove.bg erreur {response.status_code}")
            image = original_image.convert("RGBA")
        
        # ÉTAPE 4: Redimensionner à la VRAIE taille originale
        if image.size != (original_width, original_height):
            image = image.resize((original_width, original_height), Image.Resampling.LANCZOS)
            print(f"Redimensionnée à: {image.size}")
        
        # ÉTAPE 5: Ajouter padding blanc
        padding = 90
        new_size = (original_width + padding * 2, original_height + padding * 2)
        canvas = Image.new("RGBA", new_size, (255, 255, 255, 255))
        canvas.paste(image, (padding, padding), image)
        
        background = Image.new("RGB", canvas.size, (255, 255, 255))
        background.paste(canvas, (0, 0), canvas)
        
        # ÉTAPE 6: Enhancement léger
        enhancer = ImageEnhance.Brightness(background)
        background = enhancer.enhance(1.40)  # Était 1.25 (trop!)
        enhancer = ImageEnhance.Contrast(background)
        background = enhancer.enhance(1.10)  # Était 1.30 (trop!)
        enhancer = ImageEnhance.Color(background)
        background = enhancer.enhance(1.40)  # Était 1.30 (trop!)
        enhancer = ImageEnhance.Sharpness(background)
        background = enhancer.enhance(1.85)  # Était 1.35 (trop!)
        
        
        
        filename = f"{uuid.uuid4()}.png"
        filepath = os.path.join(UPLOAD_DIR, filename)
        background.save(filepath, "PNG", quality=95)
        
        print(f"✅ Image sauvegardée: {filename}")
        
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
                    "product_data": {"name": "100 Crédits PhotoVinted"},
                    "unit_amount": 1500,
                },
                "quantity": 1,
            }],
            success_url="https://saas-claude-gk14uhyae-lohangottardi-5625s-projects.vercel.app/?payment=success",
            cancel_url="https://saas-claude-gk14uhyae-lohangottardi-5625s-projects.vercel.app/?payment=cancel",
        )
        return {"checkout_url": session.url, "session_id": session.id}
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

