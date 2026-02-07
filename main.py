from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Depends, Query
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
from io import BytesIO
from PIL import Image, ImageEnhance
import stripe
from dotenv import load_dotenv

try:
    from rembg import remove, new_session
    REMBG_AVAILABLE = True
except:
    REMBG_AVAILABLE = False

load_dotenv()

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "sk_test_xxx")
API_KEY = os.getenv("API_KEY", "test_key_12345")
UPLOAD_DIR = "output"
os.makedirs(UPLOAD_DIR, exist_ok=True)

stripe.api_key = STRIPE_SECRET_KEY

app = FastAPI()

# CORS - PERMISSIF TOTAL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def verify_api_key(x_api_key: str = Header(None)):
    if not x_api_key or x_api_key != API_KEY:
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
        contents = await file.read()
        
        # REMBG
        if REMBG_AVAILABLE:
            try:
                session = new_session("u2net")
                image_without_bg = remove(contents, session=session)
                image = Image.open(BytesIO(image_without_bg)).convert("RGBA")
            except:
                image = Image.open(BytesIO(contents)).convert("RGBA")
        else:
            image = Image.open(BytesIO(contents)).convert("RGBA")
        
        # Traitement
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
        raise HTTPException(status_code=404)
    return FileResponse(filepath, media_type="image/png")

@app.post("/create-checkout-session")
async def create_checkout_session(email: str = Query(None), x_api_key: str = Header(None)):
    print(f"DEBUG: email={email}, api_key={x_api_key}")
    
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
                    "product_data": {"name": "100 Crédits"},
                    "unit_amount": 1500,
                },
                "quantity": 1,
            }],
            success_url="https://saas-claude-gk14uhyae-lohangottardi-5625s-projects.vercel.app/?payment=success",
            cancel_url="https://saas-claude-gk14uhyae-lohangottardi-5625s-projects.vercel.app/?payment=cancel",
        )
        return {"checkout_url": session.url}
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)