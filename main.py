import os
import stripe
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Config
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
API_KEY = os.getenv("API_KEY", "test_key_12345")
FRONTEND_URL = os.getenv("FRONTEND_URL", "*")

# Supabase init (on essaye, mais on ne bloque pas le site si ça rate)
try:
    supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
except:
    supabase = None

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.post("/create-checkout-session")
async def create_checkout_session(email: str, x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401)
    
    try:
        # On tente d'enregistrer l'email, mais on ignore l'erreur si ça rate
        if supabase:
            try:
                supabase.table("profiles").upsert({"email": email, "credits": 5}, on_conflict="email").execute()
            except Exception as e:
                print(f"Erreur Supabase ignorée : {e}")

        # LA REDIRECTION STRIPE
        session = stripe.checkout.Session.create(
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
        return {"checkout_url": session.url}
    except Exception as e:
        return {"error": str(e)}, 500

@app.post("/enhance")
async def enhance_placeholder():
    # Route temporaire pour éviter la 404
    return {"status": "success", "url": "https://via.placeholder.com/500"}