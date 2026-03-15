from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.exceptions import HTTPException as StarletteHTTPException
from pydantic import BaseModel
import os, uuid, json, time, base64, secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from io import BytesIO
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np
import stripe
import psycopg2
import psycopg2.extras
import httpx
from dotenv import load_dotenv
from rembg import remove
import bcrypt as _bcrypt
from jose import JWTError, jwt

# Support HEIC/HEIF (photos iPhone)
try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
    print("[STARTUP] ✅ HEIC/HEIF supporté")
except ImportError:
    print("[STARTUP] ⚠️ pillow-heif non installé — HEIC non supporté")
from datetime import datetime, timedelta
from collections import defaultdict
import threading

import re as _re
import hashlib as _hashlib
from datetime import date as _date

load_dotenv()

# ─────────────────────────────────────────────
#  CONFIG
# ─────────────────────────────────────────────
STRIPE_SECRET_KEY     = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
SECRET_KEY            = os.getenv("JWT_SECRET", "change-moi-avec-un-vrai-secret-long")
FRONTEND_URL          = os.getenv("FRONTEND_URL", "https://pixglow.app")
ALGORITHM             = "HS256"
TOKEN_EXPIRE_DAYS     = 30
FREE_IMAGES_PER_IP    = 5
UPLOAD_DIR            = "output"
MAX_FILE_SIZE_MB      = 15
# image/jpg est un alias non-officiel de image/jpeg, envoyé par certains Android/Samsung
ALLOWED_TYPES         = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"}
IMAGE_TTL_HOURS       = 24
GROQ_API_KEY          = os.getenv("GROQ_API_KEY", "")
SMTP_HOST             = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT             = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER             = os.getenv("SMTP_USER", "")
SMTP_PASS             = os.getenv("SMTP_PASS", "")
SMTP_FROM             = os.getenv("SMTP_FROM", SMTP_USER)
RESEND_API_KEY        = os.getenv("RESEND_API_KEY", "")      # Alternative à SMTP (resend.com)
EMAIL_ENABLED         = bool(SMTP_USER and SMTP_PASS) or bool(RESEND_API_KEY)

_raw_db_url  = os.getenv("DATABASE_URL", "")
DATABASE_URL = _raw_db_url.replace("postgres://", "postgresql://", 1) if _raw_db_url.startswith("postgres://") else _raw_db_url

os.makedirs(UPLOAD_DIR, exist_ok=True)
stripe.api_key = STRIPE_SECRET_KEY
security = HTTPBearer(auto_error=False)

# ─────────────────────────────────────────────
#  RATE LIMITER simple en mémoire
# ─────────────────────────────────────────────
_rate_store: dict = defaultdict(list)
_rate_lock         = threading.Lock()

def rate_limit(ip: str, max_calls: int = 10, window_sec: int = 60):
    now = time.time()
    with _rate_lock:
        calls = [t for t in _rate_store[ip] if now - t < window_sec]
        if len(calls) >= max_calls:
            raise HTTPException(429, "Trop de requêtes. Attendez 1 minute et réessayez.")
        calls.append(now)
        _rate_store[ip] = calls

# ─────────────────────────────────────────────
#  APP + CORS
# ─────────────────────────────────────────────
app = FastAPI(title="PixGlow API", version="2.5")

# ── Origines autorisées ───────────────────────────────────────────────────────
# En production : CORS_ALLOWED_ORIGINS=https://www.pixglow.app,https://pixglow.app
# Pour Vercel previews : CORS_ALLOWED_ORIGINS=* (ou laisser vide → regex Vercel)
# ─────────────────────────────────────────────────────────────────────────────
_env_extra = os.getenv("CORS_ALLOWED_ORIGINS", "")

ALLOWED_ORIGINS = [
    "https://pixglow.app",
    "https://www.pixglow.app",
    "http://localhost:3000",
    "http://localhost:5173",
]
ALLOW_ALL_ORIGINS = False

if _env_extra == "*":
    ALLOW_ALL_ORIGINS = True
elif _env_extra:
    for _o in _env_extra.split(","):
        _o = _o.strip()
        if _o and _o not in ALLOWED_ORIGINS:
            ALLOWED_ORIGINS.append(_o)

# Accepte toutes les URLs preview Vercel (pattern *lohangottardi*.vercel.app)
# et toutes les URLs saas-claude*.vercel.app
ALLOW_ORIGIN_REGEX = r"https://[a-zA-Z0-9][a-zA-Z0-9\-]*\.vercel\.app"

def _origin_allowed(origin: str) -> bool:
    """Vérifie si une origine est autorisée (liste OU regex OU wildcard)."""
    if not origin:
        return False
    if ALLOW_ALL_ORIGINS:
        return True
    if origin in ALLOWED_ORIGINS:
        return True
    if _re.match(ALLOW_ORIGIN_REGEX, origin):
        return True
    return False

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if ALLOW_ALL_ORIGINS else ALLOWED_ORIGINS,
    allow_origin_regex=None if ALLOW_ALL_ORIGINS else ALLOW_ORIGIN_REGEX,
    allow_credentials=not ALLOW_ALL_ORIGINS,   # credentials incompatible avec wildcard *
    allow_methods=["*"],
    allow_headers=["*"],
)

def _cors_headers(request: Request) -> dict:
    """Headers CORS corrects pour les exception handlers (middleware ne les gère pas)."""
    origin = request.headers.get("origin", "")
    if ALLOW_ALL_ORIGINS:
        return {"Access-Control-Allow-Origin": "*"}
    if _origin_allowed(origin):
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
        }
    # Repli sur le domaine principal — le navigateur bloquera de toute façon
    return {
        "Access-Control-Allow-Origin": "https://www.pixglow.app",
        "Access-Control-Allow-Credentials": "true",
    }

# (CORS_HEADERS supprimé — utiliser _cors_headers(request) à la place)

# ─────────────────────────────────────────────
#  HANDLERS D'ERREUR
# ─────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exc(request: Request, exc: Exception):
    print(f"[ERREUR] {type(exc).__name__}: {exc}")
    return JSONResponse(status_code=500, content={"detail": f"Erreur serveur: {str(exc)}"}, headers=_cors_headers(request))

@app.exception_handler(StarletteHTTPException)
async def http_exc(request: Request, exc: StarletteHTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail}, headers=_cors_headers(request))

# ─────────────────────────────────────────────
#  POSTGRESQL
# ─────────────────────────────────────────────
def get_db():
    if not DATABASE_URL:
        raise HTTPException(503, "DATABASE_URL manquante dans les variables Railway.")
    try:
        return psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
    except psycopg2.OperationalError as e:
        raise HTTPException(503, f"Base de données inaccessible: {e}")

@app.on_event("startup")
async def startup_event():
    print(f"[STARTUP] PixGlow v2.5 — DB: {'OK' if DATABASE_URL else 'MANQUANTE'}")
    try:
        conn = get_db(); cur = conn.cursor()
        cur.execute("""CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL, credits INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
        )""")
        cur.execute("""CREATE TABLE IF NOT EXISTS ip_usage (
            ip TEXT PRIMARY KEY, count INTEGER DEFAULT 0, first_used TIMESTAMP DEFAULT NOW()
        )""")
        # Track total photos processed for real stats
        cur.execute("""CREATE TABLE IF NOT EXISTS stats (
            key TEXT PRIMARY KEY, value INTEGER DEFAULT 0
        )""")
        cur.execute("""INSERT INTO stats (key, value) VALUES ('total_photos', 0) ON CONFLICT (key) DO NOTHING""")
        # Add first_used column if it doesn't exist yet (migration for existing deployments)
        cur.execute("""
            ALTER TABLE ip_usage ADD COLUMN IF NOT EXISTS first_used TIMESTAMP DEFAULT NOW()
        """)
        # Email verification & password reset columns / tables
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE")
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token TEXT")
        cur.execute("""CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            used BOOLEAN DEFAULT FALSE
        )""")
        conn.commit(); cur.close(); conn.close()
        print("[STARTUP] ✅ Tables OK")
    except Exception as e:
        print(f"[STARTUP] ⚠️ DB: {e}")
    _schedule_cleanup()

# ─────────────────────────────────────────────
#  EMAIL
# ─────────────────────────────────────────────
import re as _email_re

def _extract_email_addr(addr: str) -> str:
    """Extrait l'adresse email brute depuis 'Nom <email@ex.com>' ou 'email@ex.com'."""
    m = _email_re.search(r'<([^>]+)>', addr)
    return m.group(1).strip() if m else addr.strip()

def _send_via_resend(to: str, subject: str, html: str) -> bool:
    """Envoi via API Resend (resend.com) — plus fiable que SMTP."""
    try:
        import httpx as _httpx
        from_addr = SMTP_FROM if SMTP_FROM else "PixGlow <onboarding@resend.dev>"
        r = _httpx.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
            json={"from": from_addr, "to": [to], "subject": subject, "html": html},
            timeout=15
        )
        if r.status_code in (200, 201):
            print(f"[EMAIL/Resend] ✅ Envoyé à {to}")
            return True
        print(f"[EMAIL/Resend] ❌ {r.status_code} : {r.text}")
        return False
    except Exception as e:
        print(f"[EMAIL/Resend] ❌ Exception : {e}")
        return False

def _send_email_sync(to: str, subject: str, html: str):
    """Envoi SMTP synchrone — appelé dans un thread pour ne pas bloquer."""
    if RESEND_API_KEY:
        return _send_via_resend(to, subject, html)
    from_addr = SMTP_FROM if SMTP_FROM else SMTP_USER
    from_display = f"PixGlow <{_extract_email_addr(from_addr)}>" if '<' not in from_addr else from_addr
    from_raw = _extract_email_addr(from_display)
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = from_display
        msg["To"]      = to
        msg.attach(MIMEText(html, "html"))
        if SMTP_PORT == 465:
            import ssl
            ctx = ssl.create_default_context()
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=15, context=ctx) as server:
                server.login(SMTP_USER, SMTP_PASS)
                server.sendmail(from_raw, to, msg.as_string())
        else:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(SMTP_USER, SMTP_PASS)
                server.sendmail(from_raw, to, msg.as_string())
        print(f"[EMAIL/SMTP] ✅ Envoyé à {to} : {subject}")
        return True
    except Exception as e:
        print(f"[EMAIL/SMTP] ❌ Erreur envoi à {to} : {e}")
        return False

def send_email(to: str, subject: str, html: str) -> bool:
    """Lance l'envoi dans un thread. Retourne True si SMTP configuré (pas garanti livré)."""
    if not EMAIL_ENABLED:
        print(f"[EMAIL] SMTP non configuré — email ignoré pour {to} : {subject}")
        return False
    t = threading.Thread(target=_send_email_sync, args=(to, subject, html), daemon=True)
    t.start()
    return True

# ─────────────────────────────────────────────
#  NETTOYAGE AUTO DES IMAGES (toutes les 6h)
# ─────────────────────────────────────────────
def _cleanup_images():
    cutoff = time.time() - IMAGE_TTL_HOURS * 3600
    try:
        for fname in os.listdir(UPLOAD_DIR):
            fpath = os.path.join(UPLOAD_DIR, fname)
            if os.path.isfile(fpath) and os.path.getmtime(fpath) < cutoff:
                os.remove(fpath)
        print(f"[CLEANUP] Images > {IMAGE_TTL_HOURS}h supprimées")
    except Exception as e:
        print(f"[CLEANUP] Erreur images: {e}")
    # Purge IP usage entries older than 30 days (conformité politique de confidentialité)
    try:
        conn = get_db(); cur = conn.cursor()
        cur.execute("DELETE FROM ip_usage WHERE first_used < NOW() - INTERVAL '30 days'")
        deleted = cur.rowcount
        conn.commit(); cur.close(); conn.close()
        if deleted: print(f"[CLEANUP] {deleted} entrées IP > 30j supprimées")
    except Exception as e:
        print(f"[CLEANUP] Erreur purge IP: {e}")
    # Purge expired/used password reset tokens
    try:
        conn = get_db(); cur = conn.cursor()
        cur.execute("DELETE FROM password_reset_tokens WHERE expires_at < NOW() OR used = TRUE")
        deleted = cur.rowcount
        conn.commit(); cur.close(); conn.close()
        if deleted: print(f"[CLEANUP] {deleted} tokens reset expirés supprimés")
    except Exception as e:
        print(f"[CLEANUP] Erreur purge tokens: {e}")

def _schedule_cleanup():
    def loop():
        while True:
            time.sleep(6 * 3600)
            _cleanup_images()
    t = threading.Thread(target=loop, daemon=True)
    t.start()

# ─────────────────────────────────────────────
#  LISSAGE DES PLIS
# ─────────────────────────────────────────────
def reduce_wrinkles(img: Image.Image, strength: float = 0.45) -> Image.Image:
    mode = img.mode
    work = img.convert("RGB")
    arr = np.array(work, dtype=np.float32)
    pil_smooth = work.filter(ImageFilter.GaussianBlur(radius=4))
    smooth = np.array(pil_smooth, dtype=np.float32)
    pil_base = work.filter(ImageFilter.GaussianBlur(radius=8))
    base = np.array(pil_base, dtype=np.float32)
    diff = np.abs(smooth - base)
    diff_gray = diff.mean(axis=2, keepdims=True)
    max_diff = diff_gray.max()
    if max_diff > 0:
        wrinkle_map = np.clip(diff_gray / (max_diff * 0.6), 0, 1)
    else:
        return img
    blended = arr * (1 - wrinkle_map * strength) + smooth * (wrinkle_map * strength)
    blended = np.clip(blended, 0, 255).astype(np.uint8)
    result = Image.fromarray(blended, "RGB")
    if mode == "RGBA":
        result = result.convert("RGBA")
    return result

# ─────────────────────────────────────────────
#  UTILITAIRES AUTH
# ─────────────────────────────────────────────
class AuthBody(BaseModel):
    email: str
    password: str

def hash_password(p: str) -> str:
    return _bcrypt.hashpw(p.encode("utf-8")[:72], _bcrypt.gensalt(12)).decode()

def verify_password(p: str, h: str) -> bool:
    return _bcrypt.checkpw(p.encode("utf-8")[:72], h.encode())

def create_token(email: str) -> str:
    exp = datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": email, "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials: return None
    try:
        return jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM]).get("sub")
    except JWTError:
        return None

def get_real_ip(request: Request) -> str:
    PRIVATE_PREFIXES = ("100.64.", "10.", "172.16.", "172.17.", "172.18.", "172.19.",
                        "172.20.", "172.21.", "172.22.", "172.23.", "172.24.", "172.25.",
                        "172.26.", "172.27.", "172.28.", "172.29.", "172.30.", "172.31.",
                        "192.168.", "127.", "::1", "fc", "fd")

    def is_public(ip: str) -> bool:
        return ip and not any(ip.startswith(p) for p in PRIVATE_PREFIXES)

    cf_ip = request.headers.get("CF-Connecting-IP", "").strip()
    if is_public(cf_ip):
        return cf_ip

    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        for ip in (ip.strip() for ip in forwarded.split(",")):
            if is_public(ip):
                return ip

    real_ip = request.headers.get("X-Real-IP", "").strip()
    if is_public(real_ip):
        return real_ip

    return request.client.host if request.client else "unknown"

def get_ip_count(ip: str) -> int:
    """Lecture seule du compteur IP. Ne jamais utiliser pour autoriser/bloquer."""
    conn = get_db(); cur = conn.cursor()
    try:
        cur.execute("SELECT count FROM ip_usage WHERE ip = %s", (ip,))
        row = cur.fetchone()
        return row["count"] if row else 0
    except:
        return 0
    finally:
        cur.close(); conn.close()

def increment_ip(ip: str):
    """
    Incrémente le compteur IP de façon atomique.
    Retourne (allowed: bool, new_count: int).
    À appeler APRÈS un traitement réussi pour ne pas brûler de crédit sur une erreur.
    """
    conn = get_db(); cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO ip_usage (ip, count, first_used) VALUES (%s, 1, NOW())
            ON CONFLICT (ip) DO UPDATE
                SET count = ip_usage.count + 1
            WHERE ip_usage.count < %s
            RETURNING count
        """, (ip, FREE_IMAGES_PER_IP))
        row = cur.fetchone()
        conn.commit()
        if row:
            return True, row["count"]
        # La condition WHERE a échoué → déjà au maximum
        cur.execute("SELECT count FROM ip_usage WHERE ip = %s", (ip,))
        current = cur.fetchone()
        return False, current["count"] if current else FREE_IMAGES_PER_IP
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close(); conn.close()

def _increment_total_photos(conn, cur):
    """Increment global photo counter for real stats."""
    try:
        cur.execute("UPDATE stats SET value = value + 1 WHERE key = 'total_photos'")
    except:
        pass  # Non-critical, don't break the enhance flow

class DescriptionRequest(BaseModel):
    image_url: str = ""

# ─────────────────────────────────────────────
#  ROUTES
# ─────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "version": "2.5", "db": bool(DATABASE_URL)}

@app.get("/health")
def health():
    try:
        conn = get_db(); cur = conn.cursor()
        cur.execute("SELECT COUNT(*) as n FROM users")
        n = cur.fetchone()["n"]; cur.close(); conn.close()
        return {"status": "ok", "db": "connected", "users": n}
    except Exception as e:
        return JSONResponse({"status": "error", "db": str(e)}, status_code=503)

# ─────────────────────────────────────────────
#  REAL PUBLIC STATS — used by frontend landing page
#  Returns ACTUAL numbers from the database
# ─────────────────────────────────────────────
@app.get("/public-stats")
async def public_stats():
    """
    Returns real, verified stats for the landing page.
    No fake numbers — only what's actually in the DB.
    """
    try:
        conn = get_db(); cur = conn.cursor()
        # Real user count
        cur.execute("SELECT COUNT(*) as n FROM users")
        user_count = cur.fetchone()["n"]
        # Real total photos processed
        cur.execute("SELECT value FROM stats WHERE key = 'total_photos'")
        row = cur.fetchone()
        total_photos = row["value"] if row else 0
        cur.close(); conn.close()
        return {
            "users": user_count,
            "photos_processed": total_photos,
        }
    except Exception as e:
        return {"users": 0, "photos_processed": 0}

@app.get("/free-remaining")
async def free_remaining(request: Request):
    ip = get_real_ip(request)
    used = get_ip_count(ip)
    return {"remaining": max(0, FREE_IMAGES_PER_IP - used), "used": used, "max": FREE_IMAGES_PER_IP}

@app.post("/register")
async def register(body: AuthBody, request: Request):
    rate_limit(get_real_ip(request), max_calls=5, window_sec=3600)
    email = body.email.strip().lower()
    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(400, "Email invalide")
    if len(body.password) < 6:
        raise HTTPException(400, "Mot de passe trop court (minimum 6 caractères)")
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cur.fetchone():
        cur.close(); conn.close()
        raise HTTPException(400, "Cet email est déjà utilisé. Essayez de vous connecter.")
    verification_token = secrets.token_urlsafe(32)
    cur.execute(
        "INSERT INTO users (email, password_hash, credits, email_verified, verification_token) VALUES (%s, %s, 0, FALSE, %s)",
        (email, hash_password(body.password), verification_token)
    )
    conn.commit(); cur.close(); conn.close()
    # Send verification email
    verify_url = f"{FRONTEND_URL}?verify={verification_token}"
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0d0d1a;color:#e2e8f0;border-radius:16px;">
      <h1 style="color:#a78bfa;font-size:28px;margin-bottom:8px;">✨ PixGlow</h1>
      <h2 style="font-size:20px;color:#fff;margin-bottom:16px;">Confirmez votre adresse email</h2>
      <p style="color:#94a3b8;line-height:1.6;">Vous avez créé un compte PixGlow. Cliquez sur le bouton ci-dessous pour confirmer votre email et recevoir vos <strong style="color:#34d399;">5 crédits offerts</strong>.</p>
      <a href="{verify_url}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:16px;">Confirmer mon email →</a>
      <p style="color:#475569;font-size:12px;">Lien valable 48h. Si vous n'avez pas créé de compte PixGlow, ignorez cet email.</p>
    </div>"""
    send_email(email, "Confirmez votre email — PixGlow", html)
    if not EMAIL_ENABLED:
        # Dev mode: auto-login without verification
        conn2 = get_db(); cur2 = conn2.cursor()
        cur2.execute("UPDATE users SET email_verified=TRUE, credits=5, verification_token=NULL WHERE email=%s", (email,))
        conn2.commit(); cur2.close(); conn2.close()
        return {"status": "success", "token": create_token(email), "credits": 5}
    return {"status": "success", "verification_required": True}

@app.post("/login")
async def login(body: AuthBody, request: Request):
    rate_limit(get_real_ip(request), max_calls=10, window_sec=600)
    email = body.email.strip().lower()
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cur.fetchone(); cur.close(); conn.close()
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Email ou mot de passe incorrect")
    return {"status": "success", "token": create_token(email), "credits": user["credits"]}

@app.get("/me")
async def get_me(current_user: str = Depends(get_current_user)):
    if not current_user: raise HTTPException(401, "Non authentifié")
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT credits FROM users WHERE email = %s", (current_user,))
    user = cur.fetchone(); cur.close(); conn.close()
    if not user: raise HTTPException(404, "Utilisateur introuvable")
    return {"email": current_user, "credits": user["credits"]}

@app.get("/verify-email/{token}")
async def verify_email(token: str):
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT email, email_verified FROM users WHERE verification_token = %s", (token,))
    user = cur.fetchone()
    if not user:
        cur.close(); conn.close()
        raise HTTPException(400, "Lien de vérification invalide ou expiré.")
    if user["email_verified"]:
        cur.close(); conn.close()
        return {"status": "already_verified"}
    cur.execute(
        "UPDATE users SET email_verified=TRUE, credits=5, verification_token=NULL WHERE verification_token=%s RETURNING email, credits",
        (token,)
    )
    row = cur.fetchone()
    conn.commit(); cur.close(); conn.close()
    email = row["email"]
    return {"status": "verified", "token": create_token(email), "credits": row["credits"], "email": email}

class ForgotPasswordBody(BaseModel):
    email: str

class ResetPasswordBody(BaseModel):
    token: str
    password: str

@app.post("/forgot-password")
async def forgot_password(body: ForgotPasswordBody, request: Request):
    rate_limit(get_real_ip(request), max_calls=5, window_sec=3600)
    email = body.email.strip().lower()
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    user = cur.fetchone()
    if not user:
        cur.close(); conn.close()
        # On ne révèle pas si l'email existe
        return {"status": "sent"}
    token = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(hours=1)
    cur.execute(
        "INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (%s, %s, %s)",
        (email, token, expires)
    )
    conn.commit(); cur.close(); conn.close()
    reset_url = f"{FRONTEND_URL}?reset={token}"
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0d0d1a;color:#e2e8f0;border-radius:16px;">
      <h1 style="color:#a78bfa;font-size:28px;margin-bottom:8px;">✨ PixGlow</h1>
      <h2 style="font-size:20px;color:#fff;margin-bottom:16px;">Réinitialisation de votre mot de passe</h2>
      <p style="color:#94a3b8;line-height:1.6;">Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous.</p>
      <a href="{reset_url}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:16px;">Réinitialiser mon mot de passe →</a>
      <p style="color:#475569;font-size:12px;">Lien valable 1h. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
    </div>"""
    email_sent = send_email(email, "Réinitialisation de mot de passe — PixGlow", html)
    return {"status": "sent", "email_sent": email_sent}

@app.post("/reset-password")
async def reset_password(body: ResetPasswordBody, request: Request):
    rate_limit(get_real_ip(request), max_calls=10, window_sec=3600)
    if len(body.password) < 6:
        raise HTTPException(400, "Mot de passe trop court (minimum 6 caractères)")
    conn = get_db(); cur = conn.cursor()
    cur.execute(
        "SELECT email FROM password_reset_tokens WHERE token=%s AND used=FALSE AND expires_at > NOW()",
        (body.token,)
    )
    row = cur.fetchone()
    if not row:
        cur.close(); conn.close()
        raise HTTPException(400, "Lien invalide ou expiré. Faites une nouvelle demande.")
    email = row["email"]
    cur.execute("UPDATE users SET password_hash=%s WHERE email=%s", (hash_password(body.password), email))
    cur.execute("UPDATE password_reset_tokens SET used=TRUE WHERE token=%s", (body.token,))
    conn.commit(); cur.close(); conn.close()
    return {"status": "success", "token": create_token(email)}

@app.post("/enhance")
async def enhance_photo(
    file: UploadFile = File(...),
    request: Request = None,
    current_user: str = Depends(get_current_user)
):
    # ── 1. Validation fichier (aucune DB, aucun quota consommé) ──────────────
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"Format non supporté ({content_type}). Utilisez JPG, PNG, WEBP ou HEIC.")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"Fichier trop lourd (max {MAX_FILE_SIZE_MB} Mo).")

    # ── 2. Vérification quota — lecture seule, RIEN n'est consommé ici ───────
    ip = None
    if current_user:
        conn = get_db(); cur = conn.cursor()
        try:
            cur.execute("SELECT credits FROM users WHERE email = %s", (current_user,))
            user = cur.fetchone()
            if not user or user["credits"] <= 0:
                raise HTTPException(402, "Crédits insuffisants. Rechargez votre compte.")
        finally:
            cur.close(); conn.close()
    else:
        ip = get_real_ip(request)
        used = get_ip_count(ip)          # lecture seule — ne consomme RIEN
        if used >= FREE_IMAGES_PER_IP:
            raise HTTPException(429, f"Limite gratuite atteinte ({used}/{FREE_IMAGES_PER_IP}). Créez un compte pour continuer.")

    # ── 3. Traitement image — le quota n'est débité QU'APRÈS le succès ───────
    filename = None
    try:
        orig = Image.open(BytesIO(contents))
        if orig.mode not in ("RGB", "RGBA"):
            orig = orig.convert("RGBA" if "transparency" in orig.info else "RGB")

        w, h = orig.size
        PROCESS_MAX = 1500
        if w > PROCESS_MAX or h > PROCESS_MAX:
            scale = PROCESS_MAX / max(w, h)
            proc_w, proc_h = int(w * scale), int(h * scale)
            tmp = orig.resize((proc_w, proc_h), Image.Resampling.LANCZOS)
        else:
            tmp = orig.copy()
            proc_w, proc_h = w, h

        tmp_rgb = tmp.convert("RGB") if tmp.mode == "RGBA" else tmp
        tmp_smooth = reduce_wrinkles(tmp_rgb, strength=0.75)
        if tmp.mode == "RGBA":
            r, g, b = tmp_smooth.split()
            _, _, _, a = tmp.split()
            tmp_smooth = Image.merge("RGBA", (r, g, b, a))

        no_bg = remove(tmp_smooth)

        if (proc_w, proc_h) != (w, h):
            no_bg = no_bg.resize((w, h), Image.Resampling.LANCZOS)

        pad = max(40, int(min(w, h) * 0.05))
        canvas = Image.new("RGBA", (w + pad*2, h + pad*2), (255, 255, 255, 255))
        canvas.paste(no_bg, (pad, pad), no_bg if no_bg.mode == "RGBA" else None)
        bg_img = Image.new("RGB", canvas.size, (255, 255, 255))
        bg_img.paste(canvas, (0, 0), canvas)

        bg_img = ImageEnhance.Brightness(bg_img).enhance(1.04)
        bg_img = ImageEnhance.Contrast(bg_img).enhance(1.04)
        bg_img = ImageEnhance.Color(bg_img).enhance(1.06)
        bg_img = ImageEnhance.Sharpness(bg_img).enhance(1.08)

        filename = f"{uuid.uuid4()}.png"
        bg_img.save(os.path.join(UPLOAD_DIR, filename), "PNG", optimize=False)

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERREUR enhance processing] {type(e).__name__}: {e}")
        # Image processing échoue → AUCUN crédit consommé (quota pas encore débité)
        raise HTTPException(500, f"Erreur traitement image: {str(e)}")

    # ── 4. Débit quota UNIQUEMENT après traitement réussi ────────────────────
    credits_left = None
    free_remaining = None
    conn = get_db(); cur = conn.cursor()
    try:
        _increment_total_photos(conn, cur)
        if current_user:
            cur.execute(
                "UPDATE users SET credits = credits - 1 WHERE email = %s RETURNING credits",
                (current_user,)
            )
            row = cur.fetchone()
            credits_left = row["credits"] if row else None
        else:
            # Incrémente IP seulement maintenant (traitement a réussi)
            allowed, new_count = increment_ip(ip)
            if not allowed:
                # Race condition rare : une autre requête concurrente a consommé le dernier crédit.
                # L'image a quand même été traitée → on la retourne mais on signale 0 restants.
                free_remaining = 0
            else:
                free_remaining = max(0, FREE_IMAGES_PER_IP - new_count)
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"[ERREUR enhance commit] {type(e).__name__}: {e}")
        # Le traitement a réussi, on retourne quand même l'image même si le DB commit a raté
    finally:
        cur.close(); conn.close()

    return JSONResponse({
        "status": "success",
        "filename": filename,
        "url": f"/image/{filename}",
        "credits_left": credits_left,
        "free_remaining": free_remaining,   # retourné pour les utilisateurs anonymes
    })

@app.get("/image/{filename}")
async def get_image(filename: str):
    filename = os.path.basename(filename)
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(404, "Image introuvable ou expirée")
    return FileResponse(filepath, media_type="image/png")

class CheckoutBody(BaseModel):
    plan: str = "pro"

PLANS = {
    "starter": {"credits": 30,  "amount": 700,  "name": "Pack Starter - 30 Credits PixGlow"},
    "pro":     {"credits": 100, "amount": 1299, "name": "Pack Pro - 100 Credits PixGlow"},
    "elite":   {"credits": 300, "amount": 2900, "name": "Pack Elite - 300 Credits PixGlow"},
}

@app.post("/create-checkout-session")
async def create_checkout_session(body: CheckoutBody, current_user: str = Depends(get_current_user)):
    if not current_user: raise HTTPException(401, "Connexion requise")
    plan = PLANS.get(body.plan)
    if not plan: raise HTTPException(400, f"Plan inconnu : {body.plan}. Choisissez starter, pro ou elite.")
    try:
        session = stripe.checkout.Session.create(
            customer_email=current_user,
            payment_method_types=["card"],
            mode="payment",
            line_items=[{"price_data": {"currency": "eur",
                "product_data": {"name": plan["name"],
                    "description": f"{plan['credits']} credits - 1 credit = 1 photo fond blanc - Valables a vie."},
                "unit_amount": plan["amount"]}, "quantity": 1}],
            success_url=f"{FRONTEND_URL}/?payment=success",
            cancel_url=f"{FRONTEND_URL}/?payment=cancel",
            metadata={"email": current_user, "plan": body.plan, "credits": str(plan["credits"])}
        )
        return {"checkout_url": session.url}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig     = request.headers.get("stripe-signature")
    if not STRIPE_WEBHOOK_SECRET:
        return JSONResponse({"error": "STRIPE_WEBHOOK_SECRET non configuré"}, status_code=500)
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        print("[WEBHOOK] ❌ Signature invalide")
        return JSONResponse({"error": "Signature invalide"}, status_code=400)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

    if event["type"] == "checkout.session.completed":
        obj      = event["data"]["object"]
        email    = (obj.get("customer_email") or obj.get("metadata", {}).get("email", "")).strip().lower()
        metadata = obj.get("metadata", {})
        try:
            credits_to_add = int(metadata.get("credits", 100))
        except (ValueError, TypeError):
            credits_to_add = 100
        if email:
            try:
                conn = get_db(); cur = conn.cursor()
                cur.execute("UPDATE users SET credits = credits + %s WHERE email = %s RETURNING credits", (credits_to_add, email))
                result = cur.fetchone()
                conn.commit(); cur.close(); conn.close()
                plan_name = metadata.get("plan", "?")
                print(f"[WEBHOOK] ✅ +{credits_to_add} crédits ({plan_name}) → {email} (total: {result['credits'] if result else '?'})")
            except Exception as e:
                print(f"[WEBHOOK] ❌ Erreur DB: {e}")
    return {"status": "success"}


# ─────────────────────────────────────────────
#  GÉNÉRATION DESCRIPTION AI — GROQ
# ─────────────────────────────────────────────
@app.post("/generate-description")
async def generate_description(
    body: DescriptionRequest,
    current_user: str = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(401, "Connexion requise pour générer une description AI")
    if not GROQ_API_KEY:
        raise HTTPException(503, "GROQ_API_KEY manquante.")

    filename = os.path.basename(body.image_url.split("?")[0])
    local_path = os.path.join(UPLOAD_DIR, filename)

    if not os.path.exists(local_path):
        raise HTTPException(404, "Image introuvable sur le serveur (expirée ?). Retraitez la photo.")
    with open(local_path, "rb") as f:
        image_b64 = base64.b64encode(f.read()).decode("utf-8")
    image_data_url = f"data:image/png;base64,{image_b64}"

    prompt = """Tu es expert vente Vinted France. Analyse CE vêtement/article précis sur la photo et génère UNIQUEMENT ce JSON (sans markdown, sans texte autour) :
{"titre":"titre accrocheur max 60 caractères basé sur ce que tu vois","description":"2-3 phrases avec emojis, ton naturel et vendeur, décris précisément l'article visible","hashtags":"#tag1 #tag2 #tag3 #tag4 #tag5 #tag6 #tag7 #tag8 #tag9 #tag10","score":72,"categorie":"vetement|chaussures|accessoires|sacs|bijoux|montres|sport|maison"}

IMPORTANT pour le score : évalue HONNÊTEMENT entre 50 et 95 selon la qualité visible de l'article (état, marque, style, tendance actuelle). Ne mets JAMAIS 85 par défaut. Un article basique = 55-65, bon état sans marque = 65-75, marque connue bon état = 75-88, rare/tendance/neuf = 88-95."""

    VISION_MODELS = [
        "meta-llama/llama-4-scout-17b-16e-instruct",
        "llama-3.2-11b-vision-preview",
        "llama-3.2-90b-vision-preview",
    ]

    try:
        last_error = None
        resp = None
        async with httpx.AsyncClient(timeout=45) as client:
            for model in VISION_MODELS:
                try:
                    resp = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {GROQ_API_KEY}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": model,
                            "max_tokens": 500,
                            "messages": [{
                                "role": "user",
                                "content": [
                                    {"type": "image_url", "image_url": {"url": image_data_url}},
                                    {"type": "text", "text": prompt}
                                ]
                            }]
                        }
                    )
                    if resp.status_code == 200:
                        break
                    last_error = f"Model {model} → HTTP {resp.status_code}"
                    resp = None
                except Exception as me:
                    last_error = f"Model {model} → {me}"
                    resp = None
            if resp is None:
                raise HTTPException(503, f"Tous les modèles vision indisponibles: {last_error}")
            resp.raise_for_status()
            data = resp.json()
            text = data["choices"][0]["message"]["content"]
            text = _re.sub(r'```json|```', '', text).strip()
            parsed = json.loads(text)
            return {
                "titre": str(parsed.get("titre", "Article en bon état"))[:80],
                "description": str(parsed.get("description", "Bel article 📦"))[:300],
                "hashtags": str(parsed.get("hashtags", "#vinted #modeoccasion"))[:500],
                "score": max(60, min(98, int(parsed.get("score", 75)))),
                "categorie": str(parsed.get("categorie", "vetement"))
            }
    except HTTPException:
        raise
    except json.JSONDecodeError:
        raise HTTPException(500, "Erreur parsing réponse AI — réessaie")
    except Exception as e:
        print(f"[generate-description] {type(e).__name__}: {e}")
        raise HTTPException(500, f"Erreur génération: {str(e)}")


# ─────────────────────────────────────────────
#  TRENDING KEYWORDS
# ─────────────────────────────────────────────
_trends_cache: dict = {}
_trends_lock = threading.Lock()

def _week_key(category: str) -> str:
    week = _date.today().isocalendar()
    return f"{week[0]}-W{week[1]:02d}-{category.lower()[:20]}"

class TrendRequest(BaseModel):
    category: str = "mode"
    titre: str = ""
    description: str = ""
    force_refresh: bool = False

@app.post("/trending")
async def get_trending(
    body: TrendRequest,
    current_user: str = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(401, "Connexion requise.")
    if not GROQ_API_KEY:
        raise HTTPException(503, "GROQ_API_KEY manquante.")

    cache_key = _week_key(body.category)
    now = time.time()

    with _trends_lock:
        cached = _trends_cache.get(cache_key)
        if cached and not body.force_refresh and now < cached["expires_at"]:
            return cached["data"]

    article_context = ""
    if body.titre:
        article_context = f"\nArticle analysé : \"{body.titre}\""
    if body.description:
        article_context += f"\nDescription : \"{body.description[:120]}\""

    prompt = f"""Tu es expert tendances Vinted/Instagram/TikTok France.
Semaine du {_date.today().strftime('%d/%m/%Y')}.
Catégorie précise : {body.category}{article_context}

Retourne UNIQUEMENT 6 mots-clés/expressions courtes qui explosent VRAIMENT cette semaine ET qui sont 100% cohérents avec CET article précis.

Règles STRICTES :
- Compatibles avec la catégorie ET avec l'article décrit ci-dessus
- Expressions courtes (1-3 mots max), concrètes, cherchées par des acheteurs réels cette semaine
- Mélange : matières tendance, styles viraux TikTok, caractéristiques physiques recherchées, termes d'esthétique actuels
- Si l'article a des caractéristiques visibles (couleur, matière, marque), intègre-les dans les suggestions

Réponds UNIQUEMENT avec ce JSON exact (sans markdown, sans texte avant ou après) :
{{"trends":[{{"word":"bracelet cuir","impact":"+280%","raison":"retour cuir chaud printemps","score_plus":"+8"}},{{"word":"exemple2","impact":"+180%","raison":"viral TikTok cette semaine","score_plus":"+6"}},...6 items total],"category_used":"{body.category}"}}"""

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "llama-3.3-70b-versatile",
                    "max_tokens": 600,
                    "temperature": 0.7,
                    "messages": [{"role": "user", "content": prompt}]
                }
            )
            resp.raise_for_status()
            text = resp.json()["choices"][0]["message"]["content"]
            text = _re.sub(r"```json|```", "", text).strip()
            parsed = json.loads(text)

            raw_trends = parsed.get("trends", [])[:6]
            normalized = []
            for t in raw_trends:
                word = t.get("word") or t.get("mot", "tendance")
                normalized.append({
                    "mot":       word,
                    "word":      word,
                    "boost":     t.get("impact") or t.get("boost", "+100%"),
                    "impact":    t.get("impact") or t.get("boost", "+100%"),
                    "raison":    t.get("raison", ""),
                    "score_plus": t.get("score_plus", ""),
                })

            result = {
                "trends": normalized,
                "categorie": parsed.get("category_used") or parsed.get("categorie_detectee", body.category),
                "maj": str(_date.today()),
                "cache_key": cache_key
            }

            with _trends_lock:
                _trends_cache[cache_key] = {
                    "data": result,
                    "expires_at": now + 7 * 24 * 3600
                }

            return result

    except json.JSONDecodeError:
        raise HTTPException(500, "Erreur parsing tendances — réessaie")
    except Exception as e:
        print(f"[trending] {type(e).__name__}: {e}")
        raise HTTPException(500, f"Erreur tendances: {str(e)}")


class BoostRequest(BaseModel):
    image_url: str
    trend_words: list
    current_score: int = 75

@app.post("/generate-boosted")
async def generate_boosted(
    body: BoostRequest,
    current_user: str = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(401, "Connexion requise.")
    if not GROQ_API_KEY:
        raise HTTPException(503, "GROQ_API_KEY manquante.")

    filename = os.path.basename(body.image_url.split("?")[0])
    local_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(local_path):
        raise HTTPException(404, "Image introuvable. Retraitez la photo.")

    with open(local_path, "rb") as f:
        image_b64 = base64.b64encode(f.read()).decode("utf-8")
    image_data_url = f"data:image/png;base64,{image_b64}"

    mots = ", ".join(body.trend_words[:6])
    prompt = f"""Tu es expert vente Vinted France. Score actuel : {body.current_score}/100.
Mots-tendance à INTÉGRER naturellement : {mots}
Ces mots sont viraux cette semaine. Intègre-les dans le titre et les hashtags obligatoirement.

Génère UNIQUEMENT ce JSON (sans markdown) :
{{"titre":"titre avec mot-tendance max 60 caractères","description":"2-3 phrases naturelles avec emojis et mots tendance","hashtags":"#tag1 #tag2 ... (inclure les mots tendance comme hashtags)","score":{min(98, body.current_score + 8)},"amelioration":"+{min(98, body.current_score + 8) - body.current_score} pts — mots tendance intégrés"}}"""

    try:
        last_error = None
        resp = None
        async with httpx.AsyncClient(timeout=45) as client:
            for model in ["meta-llama/llama-4-scout-17b-16e-instruct", "llama-3.2-11b-vision-preview", "llama-3.2-90b-vision-preview"]:
                try:
                    resp = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                        json={
                            "model": model,
                            "max_tokens": 500,
                            "messages": [{
                                "role": "user",
                                "content": [
                                    {"type": "image_url", "image_url": {"url": image_data_url}},
                                    {"type": "text", "text": prompt}
                                ]
                            }]
                        }
                    )
                    if resp.status_code == 200:
                        break
                    last_error = f"Model {model} → HTTP {resp.status_code}"
                    resp = None
                except Exception as me:
                    last_error = f"Model {model} → {me}"
                    resp = None
            if resp is None:
                raise HTTPException(503, f"Modèles vision indisponibles: {last_error}")
            resp.raise_for_status()
            text = resp.json()["choices"][0]["message"]["content"]
            text = _re.sub(r"```json|```", "", text).strip()
            parsed = json.loads(text)
            return {
                "titre": str(parsed.get("titre", ""))[:80],
                "description": str(parsed.get("description", ""))[:300],
                "hashtags": str(parsed.get("hashtags", ""))[:500],
                "score": max(body.current_score, min(98, int(parsed.get("score", body.current_score + 8)))),
                "amelioration": str(parsed.get("amelioration", f"+8 pts"))
            }
    except json.JSONDecodeError:
        raise HTTPException(500, "Erreur parsing réponse AI — réessaie")
    except Exception as e:
        print(f"[generate-boosted] {type(e).__name__}: {e}")
        raise HTTPException(500, f"Erreur boost: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
