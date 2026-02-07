import os
import stripe
import io
from fastapi import FastAPI, HTTPException, Header, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from dotenv import load_dotenv
from supabase import create_client, Client
from rembg import remove

load_dotenv()

# --- CONFIGURATION ---
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
API_KEY = os.getenv("API_KEY", "test_key_12345")
FRONTEND_URL = os.getenv("FRONTEND_URL", "*")

# Initialisation Supabase (si les clés manquent, le serveur ne crash pas)
try:
    supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
except Exception as e:
    print(f"⚠️ Supabase non connecté: {e}")
    supabase = None

app = FastAPI()

# --- SÉCURITÉ CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permet à n'importe quel site (Vercel) de parler à ton API
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTES ---

@app.post("/create-checkout-session")
async def create_checkout_session(email: str, x_api_key: str = Header(...)):
    """Lance le paiement Stripe et crée le profil utilisateur"""
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Clé API invalide")
    
    try:
        # On tente de créer l'utilisateur dans Supabase avant le paiement
        if supabase:
            try:
                supabase.table("profiles").upsert({"email": email, "credits": 5}, on_conflict="email").execute()
            except:
                pass # Si la DB rate, on laisse quand même l'utilisateur payer

        # Création de la session Stripe
        session = stripe.checkout.Session.create(
            customer_email=email,
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'product_data': {'name': '100 Crédits PhotoVinted'},
                    'unit_amount': 1500, # 15.00€
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f"{FRONTEND_URL}/?payment=success",
            cancel_url=f"{FRONTEND_URL}/?canceled=true",
        )
        return {"checkout_url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/enhance")
async def enhance_image(file: UploadFile = File(...), x_api_key: str = Header(...)):
    """Traite l'image (retrait de fond)"""
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401)
    try:
        input_data = await file.read()
        output_data = remove(input_data) # Moteur de retrait de fond
        return Response(content=output_data, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/webhook")
async def stripe_webhook(request: Request):
    """Reçoit le signal de Stripe pour ajouter les crédits"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except:
        return JSONResponse({"status": "error"}, status_code=400)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        email = session.get("customer_email")
        if email and supabase:
            # On récupère les crédits actuels pour ajouter 100
            res = supabase.table("profiles").select("credits").eq("email", email).execute()
            if res.data:
                new_total = res.data[0]["credits"] + 100
                supabase.table("profiles").update({"credits": new_total}).eq("email", email).execute()
                print(f"✅ 100 crédits ajoutés à {email}")

    return {"status": "success"}