import os
import uuid
import stripe
from io import BytesIO
from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Depends, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
from dotenv import load_dotenv
from supabase import create_client, Client

# --- CONFIGURATION ---
load_dotenv()

# Stripe
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
stripe.api_key = STRIPE_SECRET_KEY

# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Securité
API_KEY = os.getenv("API_KEY", "test_key_12345")
FRONTEND_URL = os.getenv("FRONTEND_URL", "*")

# Rembg
try:
    from rembg import remove, new_session
    REMBG_AVAILABLE = True
    session = new_session("u2net")
except Exception as e:
    REMBG_AVAILABLE = False

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return True

# --- LOGIQUE CRÉDITS SUPABASE ---

def get_user_credits(email: str):
    # Cherche l'utilisateur dans la table profiles
    res = supabase.table("profiles").select("credits").eq("email", email).execute()
    if len(res.data) == 0:
        # Si nouveau, on crée le profil avec 5 crédits gratuits
        new_user = supabase.table("profiles").insert({"email": email, "credits": 5}).execute()
        return 5
    return res.data[0]["credits"]

def add_user_credits(email: str, amount: int):
    current = get_user_credits(email)
    supabase.table("profiles").update({"credits": current + amount}).eq("email", email).execute()

# --- ROUTES ---

@app.post("/create-checkout-session")
async def create_checkout_session(email: str, _: bool = Depends(verify_api_key)):
    try:
        checkout_session = stripe.checkout.Session.create(
            customer_email=email,
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
            success_url=f"{FRONTEND_URL}/?payment=success",
            cancel_url=f"{FRONTEND_URL}/?canceled=true",
        )
        return {"checkout_url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except Exception:
        return JSONResponse({"status": "error"}, status_code=400)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        email = session.get("customer_email")
        if email:
            add_user_credits(email, 100)
            print(f"💰 100 Crédits ajoutés à {email}")

    return {"status": "success"}

# Note: Pour la route /enhance, tu pourras ajouter une vérification de crédits Supabase ici plus tard.