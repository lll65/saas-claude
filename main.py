import os
import stripe
from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from supabase import create_client, Client
from rembg import remove

# --- CONFIGURATION ---
load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
API_KEY = os.getenv("API_KEY", "test_key_12345")
FRONTEND_URL = os.getenv("FRONTEND_URL", "*")

# Supabase
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

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

# --- LOGIQUE CRÉDITS ---

def ensure_user_exists(email: str):
    # On cherche si l'email existe
    res = supabase.table("profiles").select("*").eq("email", email).execute()
    if not res.data:
        # Si non, on le crée avec 5 crédits
        supabase.table("profiles").insert({"email": email, "credits": 5}).execute()
    return True

# --- ROUTES ---

@app.post("/create-checkout-session")
async def create_checkout_session(email: str, _: bool = Depends(verify_api_key)):
    try:
        # On s'assure que l'utilisateur est dans la base avant de payer
        ensure_user_exists(email)
        
        session = stripe.checkout.Session.create(
            customer_email=email,
            payment_method_types=['card'],
            line_items=[{'price_data': {'currency': 'eur', 'product_data': {'name': '100 Crédits'}, 'unit_amount': 1500}, 'quantity': 1}],
            mode='payment',
            success_url=f"{FRONTEND_URL}/?payment=success",
            cancel_url=f"{FRONTEND_URL}/?canceled=true",
        )
        return {"checkout_url": session.url}
    except Exception as e:
        print(f"Erreur Stripe: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/enhance")
async def enhance_image(file: UploadFile = File(...), x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401)
    try:
        input_image = await file.read()
        # Supprime le fond (c'est ça que /enhance doit faire)
        output_image = remove(input_image)
        
        # Ici, par simplicité pour ton test, on renvoie une URL fictive ou un succès
        # Pour un vrai stockage d'image, il faudrait Supabase Storage
        return {"status": "success", "url": "https://via.placeholder.com/500", "filename": "result.png"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except:
        return JSONResponse({"status": "error"}, status_code=400)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        email = session.get("customer_email")
        if email:
            # On récupère les crédits actuels
            res = supabase.table("profiles").select("credits").eq("email", email).execute()
            if res.data:
                new_total = res.data[0]["credits"] + 100
                supabase.table("profiles").update({"credits": new_total}).eq("email", email).execute()
    return {"status": "success"}