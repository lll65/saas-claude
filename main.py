from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Depends
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
from io import BytesIO
from PIL import Image, ImageEnhance
import stripe
from dotenv import load_dotenv

# Import rembg SANS onnxruntime
try:
    from rembg import remove
    REMBG_AVAILABLE = True
except:
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

        # Suppression du fond avec Rembg
        if REMBG_AVAILABLE:
            try:
                image_without_bg = remove(contents, alpha_matting=True, alpha_matting_foreground_threshold=270, alpha_matting_background_threshold=20)
                image = Image.open(BytesIO(image_without_bg)).convert("RGBA")
            except:
                image = Image.open(BytesIO(contents)).convert("RGBA")
        else:
            image = Image.open(BytesIO(contents)).convert("RGBA")
        
        image.thumbnail((900, 900), Image.Resampling.LANCZOS)
        
        padding = 90
        new_size = (image.size[0] + padding * 2, image.size[1] + padding * 2)
        canvas = Image.new("RGBA", new_size, (255, 255, 255, 255))
        canvas.paste(image, (padding, padding), image)
        
        background = Image.new("RGB", canvas.size, (255, 255, 255))
        background.paste(canvas, (0, 0), canvas)
        
        enhancer = ImageEnhance.Brightness(background)
        background = enhancer.enhance(1.25)
        
        enhancer = ImageEnhance.Contrast(background)
        background = enhancer.enhance(1.25)
        
        enhancer = ImageEnhance.Color(background)
        background = enhancer.enhance(1.30)
        
        enhancer = ImageEnhance.Sharpness(background)
        background = enhancer.enhance(1.25)
        
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
                        "name": "PhotoVinted Pro - 100 images",
                        "description": "Traitement illimité pour 30 jours",
                    },
                    "unit_amount": 1500,
                },
                "quantity": 1,
            }],
            success_url="http://localhost:3000?payment=success",
            cancel_url="http://localhost:3000?payment=cancel",
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

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
