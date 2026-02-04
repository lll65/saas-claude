from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Depends
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
from io import BytesIO
from PIL import Image, ImageEnhance
import stripe
from dotenv import load_dotenv

# Import de rembg
try:
    from rembg import remove
    REMBG_AVAILABLE = True
    print("✅ rembg est disponible !")
except Exception as e:
    print(f"❌ Erreur lors de l'import de rembg : {e}")
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
    return {"status": "running", "rembg_available": REMBG_AVAILABLE}

@app.post("/enhance")
async def enhance_photo(file: UploadFile = File(...), _: bool = Depends(verify_api_key)):
    try:
        print("📌 Début du traitement de l'image...")

        if file.content_type not in ["image/jpeg", "image/png"]:
            raise HTTPException(status_code=400, detail="Seuls les fichiers JPG ou PNG sont acceptés.")

        contents = await file.read()
        print(f"📌 Taille de l'image : {len(contents) / (1024 * 1024):.2f} Mo")

        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="L'image dépasse 10 Mo.")

        # Traitement avec rembg
        if REMBG_AVAILABLE:
            try:
                print("🔍 Suppression du fond avec rembg...")
                image_without_bg = remove(contents)
                print("✅ Fond supprimé avec succès !")
                image = Image.open(BytesIO(image_without_bg)).convert("RGBA")
            except Exception as e:
                print(f"❌ Erreur avec rembg : {e}")
                image = Image.open(BytesIO(contents)).convert("RGBA")
        else:
            print("⚠️ rembg n'est pas disponible, utilisation de l'image originale.")
            image = Image.open(BytesIO(contents)).convert("RGBA")

        # Sauvegarde une copie de l'image avant traitement pour comparaison
        test_filename = f"test_{uuid.uuid4()}.png"
        test_filepath = os.path.join(UPLOAD_DIR, test_filename)
        Image.open(BytesIO(contents)).save(test_filepath, "PNG")
        print(f"📌 Image de test sauvegardée : {test_filename}")

        # Suite du traitement...
        image.thumbnail((900, 900), Image.Resampling.LANCZOS)
        # ... (le reste de ton code)

        return JSONResponse({
            "status": "success",
            "filename": filename,
            "url": f"/image/{filename}",
            "test_image_url": f"/image/{test_filename}"  # Pour comparer
        })

    except Exception as e:
        print(f"❌ Erreur dans enhance_photo : {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne : {str(e)}")


@app.get("/image/{filename}")
async def get_image(filename: str):
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Image non trouvée.")
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
                "message": "100 crédits ajoutés !"
            }
        return {"status": "pending"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
