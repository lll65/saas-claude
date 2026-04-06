from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException
from pydantic import BaseModel
import os, uuid, json, time, base64, secrets
from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from io import BytesIO
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import numpy as np
import stripe
import psycopg2
import psycopg2.extras
import psycopg2.sql
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
if SECRET_KEY == "change-moi-avec-un-vrai-secret-long":
    print("[WARNING] ⚠️  JWT_SECRET non configuré — utilisez une vraie clé secrète en production !")
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
CRON_SECRET           = os.getenv("CRON_SECRET", "")         # Clé secrète pour les endpoints cron
ADMIN_EMAIL           = os.getenv("ADMIN_EMAIL", "")          # Email admin pour le panneau d'administration

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
        # Referral system
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT")
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS referrals_given INTEGER DEFAULT 0")
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by TEXT")
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS referrals_month_key TEXT DEFAULT ''")
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS parrain_notif INTEGER DEFAULT 0")
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP")
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP")
        # Table pour les inscriptions en attente de vérification email
        # L'utilisateur n'est créé dans users qu'après avoir cliqué le lien
        cur.execute("""
            CREATE TABLE IF NOT EXISTS pending_registrations (
                email TEXT PRIMARY KEY,
                password_hash TEXT NOT NULL,
                verification_token TEXT NOT NULL,
                referred_by TEXT,
                expires_at TIMESTAMP NOT NULL
            )
        """)
        # Nettoyage des inscriptions expirées
        cur.execute("DELETE FROM pending_registrations WHERE expires_at < NOW()")
        # ── Affiliation ──────────────────────────────────────────────────────
        cur.execute("""
            CREATE TABLE IF NOT EXISTS affiliates (
                id SERIAL PRIMARY KEY,
                code TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                commission_rate FLOAT DEFAULT 20.0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS affiliate_conversions (
                id SERIAL PRIMARY KEY,
                affiliate_code TEXT NOT NULL,
                user_email TEXT NOT NULL,
                type TEXT NOT NULL,
                plan TEXT,
                amount_cents INTEGER DEFAULT 0,
                commission_cents INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS influencer_ref TEXT")
        cur.execute("ALTER TABLE pending_registrations ADD COLUMN IF NOT EXISTS influencer_ref TEXT")
        # Generate referral codes for existing users who don't have one
        cur.execute("SELECT email FROM users WHERE referral_code IS NULL")
        for u in cur.fetchall():
            code = secrets.token_hex(4).upper()
            cur.execute("UPDATE users SET referral_code = %s WHERE email = %s AND referral_code IS NULL", (code, u["email"]))
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
#  LISSAGE DES PLIS — filtre bilatéral approximé multi-échelle
# ─────────────────────────────────────────────
def reduce_wrinkles(img: Image.Image, strength: float = 0.65) -> Image.Image:
    """
    Lissage intelligent des plis par décomposition fréquentielle multi-échelle.
    - Cible les plis (fréquences moyennes) sans flouter les contours du vêtement.
    - Préserve la texture du tissu (hautes fréquences fines).
    - Aucune dépendance externe : numpy + Pillow uniquement.
    """
    mode = img.mode
    work = img.convert("RGB")
    arr = np.array(work, dtype=np.float32)

    # 3 niveaux de flou pour décomposer les fréquences spatiales
    fine   = np.array(work.filter(ImageFilter.GaussianBlur(radius=2)),  dtype=np.float32)
    medium = np.array(work.filter(ImageFilter.GaussianBlur(radius=5)),  dtype=np.float32)
    coarse = np.array(work.filter(ImageFilter.GaussianBlur(radius=10)), dtype=np.float32)

    # Fréquences moyennes = zone des plis (différence entre flou moyen et flou fort)
    mid_freq  = np.abs(fine - coarse).mean(axis=2, keepdims=True)
    # Hautes fréquences = contours nets, texture fine du tissu
    high_freq = np.abs(arr - fine).mean(axis=2, keepdims=True)

    mid_max  = mid_freq.max()
    high_max = high_freq.max()
    if mid_max < 1e-6:
        return img

    # Carte des plis : zones à variation moyenne élevée
    wrinkle_map = np.clip(mid_freq / (mid_max * 0.45), 0, 1)
    # Protection des contours nets : on ne lisse pas les bords du vêtement
    edge_guard  = np.clip(high_freq / (high_max * 0.35 + 1e-6), 0, 1)

    # Masque final : plis détectés MOINS les contours à préserver
    smooth_mask = wrinkle_map * (1.0 - edge_guard * 0.85)

    # Fusion : l'original avec le flou moyen, pondéré par le masque
    blended = arr * (1.0 - smooth_mask * strength) + medium * (smooth_mask * strength)
    blended = np.clip(blended, 0, 255).astype(np.uint8)

    result = Image.fromarray(blended, "RGB")
    if mode == "RGBA":
        result = result.convert("RGBA")
    return result

# ─────────────────────────────────────────────
#  ÉCLAIRAGE STUDIO PRO
# ─────────────────────────────────────────────
def apply_studio_lighting(img_rgba: Image.Image, intensity: float = 0.35) -> Image.Image:
    """Simule un éclairage studio professionnel sur le sujet (image RGBA, fond transparent)."""
    arr = np.array(img_rgba, dtype=np.float32)   # H, W, 4
    rgb = arr[:, :, :3]
    alpha = arr[:, :, 3] / 255.0                 # 0-1

    h, w = rgb.shape[:2]
    Y, X = np.mgrid[0:h, 0:w]
    xn = X / max(w - 1, 1)
    yn = Y / max(h - 1, 1)

    # Lumière principale (key light) : haut-gauche, chaude
    key_dist = np.sqrt((xn - 0.25) ** 2 + (yn - 0.05) ** 2)
    key = np.exp(-key_dist * 1.6)

    # Lumière de remplissage (rim light) : côté droit, douce
    rim_dist = np.sqrt((xn - 1.0) ** 2 + (yn - 0.5) ** 2)
    rim = np.exp(-rim_dist * 2.2) * 0.35

    # Normalise → plage [-shadow, +highlight]
    raw = key + rim
    rmin, rmax = raw.min(), raw.max()
    if rmax - rmin < 1e-6:
        return img_rgba
    norm = (raw - rmin) / (rmax - rmin)           # 0-1
    light_effect = norm * (intensity + 0.12 * intensity) - 0.12 * intensity

    light_3d = light_effect[:, :, np.newaxis]      # broadcast sur RGB
    mask_3d = alpha[:, :, np.newaxis]              # appliqué seulement au sujet

    result_rgb = rgb + light_3d * rgb * mask_3d
    result_rgb = np.clip(result_rgb, 0, 255).astype(np.uint8)

    result = np.concatenate([result_rgb, arr[:, :, 3:4].astype(np.uint8)], axis=2)
    return Image.fromarray(result, "RGBA")

# ─────────────────────────────────────────────
#  UTILITAIRES AUTH
# ─────────────────────────────────────────────
class AuthBody(BaseModel):
    email: str
    password: str
    referral_code: str | None = None
    influencer_ref: str | None = None

class AffiliateLoginBody(BaseModel):
    email: str
    password: str

class AffiliateCreateBody(BaseModel):
    code: str
    name: str
    email: str
    password: str
    commission_rate: float = 20.0

class AffiliatePatchBody(BaseModel):
    name: str | None = None
    commission_rate: float | None = None
    is_active: bool | None = None
    password: str | None = None

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

def create_affiliate_token(code: str) -> str:
    exp = datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": code, "type": "affiliate", "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)

def get_current_affiliate(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials: return None
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "affiliate": return None
        return payload.get("sub")
    except JWTError:
        return None

def mask_email(email: str) -> str:
    parts = email.split("@")
    if len(parts) != 2: return "***"
    local = parts[0]
    return local[:2] + "***@" + parts[1]

MAX_REFERRALS_PER_MONTH = 10

def _current_month_key() -> str:
    return datetime.utcnow().strftime("%Y%m")

def _can_refer(cur, referral_code: str) -> bool:
    """Return True if the referrer can still earn a credit this month."""
    cur.execute("SELECT referrals_given, referrals_month_key FROM users WHERE referral_code = %s", (referral_code,))
    r = cur.fetchone()
    if not r: return False
    mk = _current_month_key()
    count = r["referrals_given"] if r["referrals_month_key"] == mk else 0
    return count < MAX_REFERRALS_PER_MONTH

def _apply_referral_credit(cur, referral_code: str):
    """Give +5 credits to referrer, reset monthly counter if needed."""
    mk = _current_month_key()
    cur.execute("""
        UPDATE users SET
            credits = credits + 5,
            referrals_given = CASE WHEN referrals_month_key = %s THEN referrals_given + 1 ELSE 1 END,
            referrals_month_key = %s,
            parrain_notif = parrain_notif + 1
        WHERE referral_code = %s
          AND (referrals_month_key != %s OR referrals_given < %s)
    """, (mk, mk, referral_code, mk, MAX_REFERRALS_PER_MONTH))

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
    tone: str = "casual"  # casual | streetwear | luxe | pro
    taille: str = ""
    etat: str = ""
    matiere: str = ""
    defauts: str = ""

# ─────────────────────────────────────────────
#  ROUTES
# ─────────────────────────────────────────────
@app.get("/health-api")
def root():
    return {"status": "ok", "version": "2.5", "db": bool(DATABASE_URL)}

@app.get("/")
def serve_index():
    index = os.path.join(os.path.dirname(__file__), "dist", "index.html")
    if os.path.exists(index):
        return FileResponse(index)
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
    # Validate referral code
    ref_code = body.referral_code.strip().upper() if body.referral_code else None
    if ref_code:
        cur.execute("SELECT email FROM users WHERE referral_code = %s", (ref_code,))
        referrer = cur.fetchone()
        if not referrer or referrer["email"] == email:
            ref_code = None  # invalid or self-referral
    # Validate influencer affiliate ref
    inf_ref = body.influencer_ref.strip().upper() if body.influencer_ref else None
    if inf_ref:
        cur.execute("SELECT code FROM affiliates WHERE code = %s AND is_active = TRUE", (inf_ref,))
        if not cur.fetchone():
            inf_ref = None
    verification_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=48)
    # Stocke dans pending — le compte réel sera créé uniquement à la vérification
    cur.execute(
        """INSERT INTO pending_registrations (email, password_hash, verification_token, referred_by, influencer_ref, expires_at)
           VALUES (%s, %s, %s, %s, %s, %s)
           ON CONFLICT (email) DO UPDATE
             SET password_hash = EXCLUDED.password_hash,
                 verification_token = EXCLUDED.verification_token,
                 referred_by = EXCLUDED.referred_by,
                 influencer_ref = EXCLUDED.influencer_ref,
                 expires_at = EXCLUDED.expires_at""",
        (email, hash_password(body.password), verification_token, ref_code, inf_ref, expires_at)
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
        cur2.execute("SELECT referred_by FROM users WHERE email=%s", (email,))
        row2 = cur2.fetchone()
        bonus = 5 if row2 and row2["referred_by"] else 0
        cur2.execute("UPDATE users SET email_verified=TRUE, credits=%s, verification_token=NULL WHERE email=%s", (5 + bonus, email))
        if row2 and row2["referred_by"] and _can_refer(cur2, row2["referred_by"]):
            _apply_referral_credit(cur2, row2["referred_by"])
        conn2.commit(); cur2.close(); conn2.close()
        return {"status": "success", "token": create_token(email), "credits": 5 + bonus}
    return {"status": "success", "verification_required": True}

@app.post("/login")
async def login(body: AuthBody, request: Request):
    rate_limit(get_real_ip(request), max_calls=10, window_sec=600)
    email = body.email.strip().lower()
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cur.fetchone()
    if not user:
        # Vérifie si une inscription est en attente de vérification
        cur.execute("SELECT password_hash FROM pending_registrations WHERE email = %s AND expires_at > NOW()", (email,))
        pending = cur.fetchone()
        cur.close(); conn.close()
        if pending and verify_password(body.password, pending["password_hash"]):
            raise HTTPException(403, "EMAIL_NOT_VERIFIED")
        raise HTTPException(401, "Email ou mot de passe incorrect")
    cur.close(); conn.close()
    if not verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Email ou mot de passe incorrect")
    if not user["email_verified"]:
        # Générer un token si le compte a été créé avant le système de vérification
        token_to_use = user["verification_token"]
        if not token_to_use:
            token_to_use = secrets.token_urlsafe(32)
            conn2 = get_db(); cur2 = conn2.cursor()
            cur2.execute("UPDATE users SET verification_token=%s WHERE email=%s", (token_to_use, email))
            conn2.commit(); cur2.close(); conn2.close()
        verify_url = f"{FRONTEND_URL}?verify={token_to_use}"
        html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0d0d1a;color:#e2e8f0;border-radius:16px;">
      <h1 style="color:#a78bfa;font-size:28px;margin-bottom:8px;">✨ PixGlow</h1>
      <h2 style="font-size:20px;color:#fff;margin-bottom:16px;">Confirmez votre adresse email</h2>
      <p style="color:#94a3b8;line-height:1.6;">Voici un nouveau lien pour confirmer votre email et recevoir vos <strong style="color:#34d399;">5 crédits offerts</strong>.</p>
      <a href="{verify_url}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:16px;">Confirmer mon email →</a>
      <p style="color:#475569;font-size:12px;">Lien valable 48h. Si vous n'avez pas créé de compte PixGlow, ignorez cet email.</p>
    </div>"""
        send_email(email, "Confirmez votre email — PixGlow", html)
        raise HTTPException(403, "EMAIL_NOT_VERIFIED")
    return {"status": "success", "token": create_token(email), "credits": user["credits"]}

@app.get("/my-referral")
async def get_my_referral(current_user: str = Depends(get_current_user)):
    if not current_user: raise HTTPException(401, "Non authentifié")
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT referral_code, referrals_given, referrals_month_key FROM users WHERE email = %s", (current_user,))
    user = cur.fetchone()
    code = user["referral_code"]
    if not code:
        code = secrets.token_hex(4).upper()
        cur.execute("UPDATE users SET referral_code = %s WHERE email = %s", (code, current_user))
        conn.commit()
    mk = _current_month_key()
    monthly_count = user["referrals_given"] if user["referrals_month_key"] == mk else 0
    cur.close(); conn.close()
    return {"code": code, "referrals_given": monthly_count, "max_referrals": MAX_REFERRALS_PER_MONTH}

@app.get("/me")
async def get_me(current_user: str = Depends(get_current_user)):
    if not current_user: raise HTTPException(401, "Non authentifié")
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT credits, parrain_notif FROM users WHERE email = %s", (current_user,))
    user = cur.fetchone()
    if not user: cur.close(); conn.close(); raise HTTPException(404, "Utilisateur introuvable")
    notif = user["parrain_notif"] or 0
    if notif > 0:
        cur.execute("UPDATE users SET parrain_notif = 0 WHERE email = %s", (current_user,))
        conn.commit()
    cur.close(); conn.close()
    return {"email": current_user, "credits": user["credits"], "parrain_notif": notif, "is_admin": bool(ADMIN_EMAIL and current_user == ADMIN_EMAIL)}

@app.get("/verify-email/{token}")
async def verify_email(token: str):
    conn = get_db(); cur = conn.cursor()

    # 1. Cherche dans les inscriptions en attente (nouveau flux)
    cur.execute("SELECT email, password_hash, referred_by, influencer_ref, expires_at FROM pending_registrations WHERE verification_token = %s", (token,))
    pending = cur.fetchone()
    if pending:
        if pending["expires_at"] < datetime.utcnow():
            cur.execute("DELETE FROM pending_registrations WHERE verification_token = %s", (token,))
            conn.commit(); cur.close(); conn.close()
            raise HTTPException(400, "Lien de vérification expiré. Veuillez vous réinscrire.")
        email = pending["email"]
        ref_code = pending["referred_by"]
        inf_ref = pending.get("influencer_ref")
        bonus = 5 if ref_code and _can_refer(cur, ref_code) else 0
        new_ref_code = secrets.token_hex(4).upper()
        cur.execute(
            "INSERT INTO users (email, password_hash, credits, email_verified, verification_token, referral_code, referred_by, influencer_ref) VALUES (%s, %s, %s, TRUE, NULL, %s, %s, %s) RETURNING credits",
            (email, pending["password_hash"], 5 + bonus, new_ref_code, ref_code, inf_ref)
        )
        row = cur.fetchone()
        if ref_code and bonus:
            _apply_referral_credit(cur, ref_code)
        # Enregistre la conversion d'inscription pour l'affilié
        if inf_ref:
            cur.execute(
                "INSERT INTO affiliate_conversions (affiliate_code, user_email, type) VALUES (%s, %s, 'signup')",
                (inf_ref, email)
            )
        cur.execute("DELETE FROM pending_registrations WHERE email = %s", (email,))
        conn.commit(); cur.close(); conn.close()
        return {"status": "verified", "token": create_token(email), "credits": row["credits"], "email": email, "bonus": bonus}

    # 2. Compatibilité : anciens comptes non vérifiés déjà dans users
    cur.execute("SELECT email, email_verified, referred_by FROM users WHERE verification_token = %s", (token,))
    user = cur.fetchone()
    if not user:
        cur.close(); conn.close()
        raise HTTPException(400, "Lien de vérification invalide ou expiré.")
    if user["email_verified"]:
        cur.close(); conn.close()
        return {"status": "already_verified"}
    ref_code = user["referred_by"]
    bonus = 5 if ref_code and _can_refer(cur, ref_code) else 0
    cur.execute(
        "UPDATE users SET email_verified=TRUE, credits=%s, verification_token=NULL WHERE verification_token=%s RETURNING email, credits",
        (5 + bonus, token,)
    )
    row = cur.fetchone()
    if ref_code and bonus:
        _apply_referral_credit(cur, ref_code)
    conn.commit(); cur.close(); conn.close()
    email = row["email"]
    return {"status": "verified", "token": create_token(email), "credits": row["credits"], "email": email, "bonus": bonus}

class ForgotPasswordBody(BaseModel):
    email: str

class ResetPasswordBody(BaseModel):
    token: str
    password: str

class ResendVerifBody(BaseModel):
    email: str
    password: str

@app.post("/resend-verification")
async def resend_verification(body: ResendVerifBody, request: Request):
    rate_limit(get_real_ip(request), max_calls=5, window_sec=3600)
    email = body.email.strip().lower()
    conn = get_db(); cur = conn.cursor()

    # Nouveau flux : inscription en attente
    cur.execute("SELECT password_hash, verification_token, expires_at FROM pending_registrations WHERE email = %s", (email,))
    pending = cur.fetchone()
    if pending:
        if not verify_password(body.password, pending["password_hash"]):
            cur.close(); conn.close()
            raise HTTPException(401, "Email ou mot de passe incorrect")
        token = secrets.token_urlsafe(32)
        new_expires = datetime.utcnow() + timedelta(hours=48)
        cur.execute("UPDATE pending_registrations SET verification_token=%s, expires_at=%s WHERE email=%s", (token, new_expires, email))
        conn.commit(); cur.close(); conn.close()
        verify_url = f"{FRONTEND_URL}?verify={token}"
        html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0d0d1a;color:#e2e8f0;border-radius:16px;">
      <h1 style="color:#a78bfa;font-size:28px;margin-bottom:8px;">✨ PixGlow</h1>
      <h2 style="font-size:20px;color:#fff;margin-bottom:16px;">Confirmez votre adresse email</h2>
      <p style="color:#94a3b8;line-height:1.6;">Voici un nouveau lien pour confirmer votre email et recevoir vos <strong style="color:#34d399;">5 crédits offerts</strong>.</p>
      <a href="{verify_url}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:16px;">Confirmer mon email →</a>
      <p style="color:#475569;font-size:12px;">Lien valable 48h. Si vous n'avez pas créé de compte PixGlow, ignorez cet email.</p>
    </div>"""
        send_email(email, "Confirmez votre email — PixGlow", html)
        return {"status": "sent"}

    # Compatibilité : anciens comptes non vérifiés déjà dans users
    cur.execute("SELECT email_verified, verification_token, password_hash FROM users WHERE email = %s", (email,))
    user = cur.fetchone(); cur.close(); conn.close()
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Email ou mot de passe incorrect")
    if user["email_verified"]:
        return {"status": "already_verified"}
    token = user["verification_token"]
    if not token:
        # Regénérer un token si absent
        token = secrets.token_urlsafe(32)
        conn2 = get_db(); cur2 = conn2.cursor()
        cur2.execute("UPDATE users SET verification_token=%s WHERE email=%s", (token, email))
        conn2.commit(); cur2.close(); conn2.close()
    verify_url = f"{FRONTEND_URL}?verify={token}"
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0d0d1a;color:#e2e8f0;border-radius:16px;">
      <h1 style="color:#a78bfa;font-size:28px;margin-bottom:8px;">✨ PixGlow</h1>
      <h2 style="font-size:20px;color:#fff;margin-bottom:16px;">Confirmez votre adresse email</h2>
      <p style="color:#94a3b8;line-height:1.6;">Voici un nouveau lien pour confirmer votre email et recevoir vos <strong style="color:#34d399;">5 crédits offerts</strong>.</p>
      <a href="{verify_url}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:16px;">Confirmer mon email →</a>
      <p style="color:#475569;font-size:12px;">Lien valable 48h.</p>
    </div>"""
    send_email(email, "Confirmez votre email — PixGlow", html)
    return {"status": "sent"}

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
    # Fallback par extension si le content-type est générique (ex: application/octet-stream envoyé par certains navigateurs/OS pour HEIC)
    if content_type not in ALLOWED_TYPES:
        ext = (file.filename or "").rsplit(".", 1)[-1].lower()
        ext_to_type = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp", "heic": "image/heic", "heif": "image/heif"}
        content_type = ext_to_type.get(ext, content_type)
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"Format non supporté ({file.content_type}). Utilisez JPG, PNG, WEBP ou HEIC.")

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
        orig = ImageOps.exif_transpose(orig)  # corrige la rotation EXIF des photos mobiles
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

        tmp_rgb = tmp.convert("RGB") if tmp.mode != "RGB" else tmp
        tmp_smooth = reduce_wrinkles(tmp_rgb, strength=0.75)

        no_bg = remove(tmp_smooth)
        no_bg = apply_studio_lighting(no_bg)

        bg_img = Image.new("RGB", (proc_w, proc_h), (255, 255, 255))
        bg_img.paste(no_bg, (0, 0), no_bg if no_bg.mode == "RGBA" else None)

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
                "UPDATE users SET credits = credits - 1, last_used_at = NOW() WHERE email = %s RETURNING credits",
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
            success_url=f"{FRONTEND_URL}/?payment=success&credits={plan['credits']}",
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
        # Validate credits from PLANS dict (not from metadata, which could be tampered)
        plan_name_meta = metadata.get("plan", "")
        plan_data = PLANS.get(plan_name_meta)
        credits_to_add = plan_data["credits"] if plan_data else 30
        if email:
            try:
                conn = get_db(); cur = conn.cursor()
                cur.execute("UPDATE users SET credits = credits + %s WHERE email = %s RETURNING credits", (credits_to_add, email))
                result = cur.fetchone()
                # Enregistre la conversion de paiement pour l'affilié
                plan_name = metadata.get("plan", "?")
                plan_amount_map = {"starter": 700, "pro": 1299, "elite": 2900}
                amount_cents = plan_amount_map.get(plan_name, 0)
                cur.execute("SELECT influencer_ref FROM users WHERE email = %s", (email,))
                user_row = cur.fetchone()
                if user_row and user_row.get("influencer_ref"):
                    inf_ref = user_row["influencer_ref"]
                    cur.execute("SELECT commission_rate FROM affiliates WHERE code = %s AND is_active = TRUE", (inf_ref,))
                    aff_row = cur.fetchone()
                    if aff_row:
                        commission_cents = int(amount_cents * aff_row["commission_rate"] / 100)
                        cur.execute(
                            "INSERT INTO affiliate_conversions (affiliate_code, user_email, type, plan, amount_cents, commission_cents) VALUES (%s, %s, 'payment', %s, %s, %s)",
                            (inf_ref, email, plan_name, amount_cents, commission_cents)
                        )
                conn.commit(); cur.close(); conn.close()
                import datetime
                plan_name = metadata.get("plan", "?")
                total_credits = result['credits'] if result else '?'
                print(f"[WEBHOOK] ✅ +{credits_to_add} crédits ({plan_name}) → {email} (total: {total_credits})")
                price_map    = {"starter": "7,00 €", "pro": "12,99 €", "elite": "29,00 €"}
                ht_map       = {"starter": "5,84 €", "pro": "10,83 €", "elite": "24,17 €"}
                tva_map      = {"starter": "1,16 €", "pro": "2,16 €",  "elite": "4,83 €"}
                price_str    = price_map.get(plan_name, "—")
                ht_str       = ht_map.get(plan_name, "—")
                tva_str      = tva_map.get(plan_name, "—")
                invoice_num  = f"PG-{datetime.datetime.utcnow().strftime('%Y%m%d')}-{obj.get('id','???')[-6:].upper()}"
                invoice_date = datetime.datetime.utcnow().strftime('%d/%m/%Y')
                plan_label_map = {"starter": "Pack Starter — 30 crédits", "pro": "Pack Pro — 100 crédits", "elite": "Pack Elite — 300 crédits"}
                plan_label   = plan_label_map.get(plan_name, plan_name)
                receipt_html = f"""<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
  <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:28px 32px;text-align:center">
    <h1 style="margin:0;font-size:26px;font-weight:800;color:#fff">PixGlow</h1>
    <p style="margin:6px 0 0;color:rgba(255,255,255,.85);font-size:13px">Facture de vente</p>
  </div>
  <div style="padding:28px 32px">
    <table style="width:100%;font-size:13px;color:#64748b;margin-bottom:24px;border-collapse:collapse">
      <tr><td style="padding:3px 0">N° Facture</td><td style="text-align:right;font-weight:700;color:#111">{invoice_num}</td></tr>
      <tr><td style="padding:3px 0">Date</td><td style="text-align:right;color:#111">{invoice_date}</td></tr>
      <tr><td style="padding:3px 0">Client</td><td style="text-align:right;color:#111">{email}</td></tr>
    </table>
    <table style="width:100%;font-size:13px;color:#64748b;margin-bottom:8px;border-collapse:collapse">
      <tr><td style="padding:3px 0">Vendeur</td><td style="text-align:right;color:#111">PixGlow — Entrepreneur individuel</td></tr>
      <tr><td style="padding:3px 0">Contact</td><td style="text-align:right;color:#111">pixglow.support@proton.me</td></tr>
    </table>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <thead><tr style="background:#f8fafc"><th style="text-align:left;padding:10px 12px;color:#475569;font-weight:600;border-radius:6px 0 0 6px">Description</th><th style="text-align:right;padding:10px 12px;color:#475569;font-weight:600">Crédits</th><th style="text-align:right;padding:10px 12px;color:#475569;font-weight:600;border-radius:0 6px 6px 0">Montant</th></tr></thead>
      <tbody>
        <tr><td style="padding:12px;color:#111;font-weight:600">{plan_label}<br><span style="font-weight:400;color:#64748b;font-size:12px">Traitement photo IA — valables à vie</span></td><td style="padding:12px;text-align:right;color:#7c3aed;font-weight:800">+{credits_to_add}</td><td style="padding:12px;text-align:right;font-weight:700;color:#111">{ht_str}</td></tr>
      </tbody>
    </table>
    <table style="width:100%;font-size:13px;color:#64748b;margin-top:12px;border-collapse:collapse">
      <tr><td style="padding:4px 12px">Sous-total HT</td><td style="text-align:right;padding:4px 12px">{ht_str}</td></tr>
      <tr><td style="padding:4px 12px">TVA 20 %</td><td style="text-align:right;padding:4px 12px">{tva_str}</td></tr>
      <tr style="border-top:2px solid #e2e8f0"><td style="padding:10px 12px;font-weight:800;color:#111;font-size:15px">Total TTC</td><td style="text-align:right;padding:10px 12px;font-weight:800;color:#7c3aed;font-size:15px">{price_str}</td></tr>
    </table>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin-bottom:20px">
      <p style="margin:0;font-size:13px;color:#15803d;font-weight:700">✅ {credits_to_add} crédits ajoutés · Solde actuel : {total_credits} crédits</p>
    </div>
    <p style="color:#94a3b8;font-size:11px;line-height:1.6;margin:0">Conformément à l'art. L221-28 12° du Code de la consommation, le droit de rétractation ne s'applique pas aux prestations numériques immédiatement exécutées. Paiement traité par Stripe. En cas de question : <a href="mailto:pixglow.support@proton.me" style="color:#7c3aed">pixglow.support@proton.me</a></p>
  </div>
</div></body></html>"""
                send_email(email, f"Facture PixGlow n° {invoice_num} — {price_str}", receipt_html)
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

    TONE_INSTRUCTIONS = {
        "casual":     "Ton décontracté et accessible, vocabulaire simple et quotidien. Cible l'acheteur lambda qui cherche un bon plan.",
        "streetwear": "Ton urbain et branché. Utilise le vocabulaire streetwear actuel (fit, drip, collab, drop, hype, fire, slay...). Cible les fans de mode urbaine et les acheteurs tendance.",
        "luxe":       "Ton élégant et premium, vocabulaire raffiné. Mets en valeur la qualité des matières, le prestige et les détails haut de gamme. Cible une clientèle exigeante.",
        "pro":        "Ton professionnel et factuel, description structurée et nette. Cible les acheteurs cherchant une tenue professionnelle, smart casual ou de bureau.",
    }
    tone_key = body.tone if body.tone in TONE_INSTRUCTIONS else "casual"
    tone_instruction = TONE_INSTRUCTIONS[tone_key]

    # Build user-provided context section
    user_info_parts = []
    if body.taille:
        user_info_parts.append(f"Taille : {body.taille}")
    if body.etat:
        user_info_parts.append(f"État : {body.etat}")
    if body.matiere:
        user_info_parts.append(f"Matière : {body.matiere}")
    if body.defauts:
        user_info_parts.append(f"Défauts signalés par le vendeur : {body.defauts}")
    user_info_section = ""
    if user_info_parts:
        user_info_section = "\nINFOS FOURNIES PAR LE VENDEUR (à intégrer OBLIGATOIREMENT dans la description) :\n" + "\n".join(f"- {p}" for p in user_info_parts) + "\n"

    tone_examples = {
        "casual":     "ex: 'Top vraiment sympa, parfait pour tous les jours ! 😊 Couleur canon, trop confortable.'",
        "streetwear": "ex: 'Pièce ultra fire 🔥 Ce fit est straight drip, collab hype qui claque grave.'",
        "luxe":       "ex: 'Pièce d'exception ✨ Tissu noble et raffiné, coupe impeccable, finitions irréprochables.'",
        "pro":        "ex: 'Article de qualité, coupe structurée et sobre. Idéal pour un environnement professionnel ou smart casual.'",
    }
    tone_example = tone_examples.get(tone_key, tone_examples["casual"])

    prompt = f"""Tu es expert vente Vinted France. Analyse PRÉCISÉMENT CE vêtement/article visible sur la photo.

⚠️ TON IMPOSÉ : {tone_key.upper()} — {tone_instruction}
La description DOIT refléter ce ton. {tone_example}

Génère UNIQUEMENT ce JSON valide (sans markdown, sans texte autour). Remplace CHAQUE valeur par une évaluation réelle basée sur l'image :
{{"titre":"STRING — marque si visible + couleur + type article, max 60 chars","description":"STRING — 80 à 150 mots RÉDIGÉS avec le TON {tone_key.upper()} ci-dessus. Structure: 1)caractéristiques visibles 2)points forts 3)état 4)phrase finale Idéal pour...","hashtags":"STRING — exactement 5 hashtags: #Vinted + #marque + #couleur + #style + #tag_populaire","score":INTEGER_CALCULE,"categorie":"STRING — un parmi: vetement|chaussures|accessoires|sacs|bijoux|montres|sport|maison","prix_estime":"STRING — fourchette réaliste ex: 15-25€","conseils_photo":"STRING — 2-3 conseils si score<65, sinon chaîne vide","score_details":{{"photo":INTEGER_CALCULE,"titre":INTEGER_CALCULE,"description":INTEGER_CALCULE,"tendance":0}},"conseils":{{"titre":"STRING — conseil précis et actionnable pour améliorer CE titre spécifique","description":"STRING — conseil précis et actionnable pour améliorer CETTE description","photo":"STRING — conseil précis et actionnable pour améliorer la photo de CET article"}}}}
{user_info_section}
RÈGLES DE CALCUL DES SCORES (OBLIGATOIRE — NE JAMAIS COPIER DES VALEURS EXEMPLES) :
- score (INTEGER entre 50 et 95) : évalue objectivement selon l'article VU sur la photo
  → Article basique/inconnu = 52 à 64 | Bon état sans marque = 65 à 74 | Marque connue bon état = 75 à 87 | Rare/tendance/neuf = 88 à 95
  → INTERDIT de mettre 72, 75 ou 85 par défaut — calcule vraiment
- score_details.photo (INTEGER 0-25) : qualité réelle de la photo (netteté, éclairage, fond, cadrage)
- score_details.titre (INTEGER 0-25) : évalue le titre que TU vas générer (précision, présence marque, longueur)
- score_details.description (INTEGER 0-25) : évalue la description que TU vas générer (richesse, structure, accroche)
- La somme photo+titre+description doit être proche du score total (tendance=0 toujours)

RÈGLES DESCRIPTION :
- Décris UNIQUEMENT ce qui est visible — ne suppose rien
- Titre : marque en premier si visible, sinon couleur + type précis
- LANGAGE CERTAIN : jamais "semble être", "probablement", "peut-être"
- TAILLE : utilise celle du vendeur si fournie, sinon NE MENTIONNE PAS LA TAILLE
- Prix : fourchette réaliste selon marque, état, catégorie
- conseils.titre/description/photo : conseils SPÉCIFIQUES à CET article, pas génériques

RAPPEL TON {tone_key.upper()} : {tone_instruction}"""

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
                            "max_tokens": 800,
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
            score = max(50, min(98, int(parsed.get("score", 75))))
            prix = str(parsed.get("prix_estime", "")).strip()[:30]
            # Fallback prix si l'IA ne l'a pas renvoyé
            if not prix:
                cat = str(parsed.get("categorie", "vetement"))
                prix = {"chaussures": "15-30€", "sacs": "12-25€", "bijoux": "5-12€", "montres": "20-50€", "accessoires": "5-15€", "sport": "10-25€", "maison": "5-20€"}.get(cat, "8-15€")
            cat = str(parsed.get("categorie", "vetement"))
            # Compute prix_vente_rapide: lower bound of prix_estime for quick sale
            prix_vente_rapide = prix
            import re as _re2
            m = _re2.search(r'(\d+)', prix)
            if m:
                lower = int(m.group(1))
                prix_vente_rapide = f"{lower}€"
            # Compute probabilite_vente from score + category
            cat_bonus = {"vetement": 8, "chaussures": 6, "sacs": 10, "bijoux": 5, "montres": 3, "accessoires": 5, "sport": 7, "maison": 4}
            prob = min(95, max(45, round(score * 0.75 + 15) + cat_bonus.get(cat, 5)))
            # Parse score_details (4 criteria each /25)
            raw_sd = parsed.get("score_details", {})
            sd_photo = max(0, min(25, int(raw_sd.get("photo", 0)) if str(raw_sd.get("photo", "")).lstrip("-").isdigit() else 0))
            sd_titre = max(0, min(25, int(raw_sd.get("titre", 0)) if str(raw_sd.get("titre", "")).lstrip("-").isdigit() else 0))
            sd_desc  = max(0, min(25, int(raw_sd.get("description", 0)) if str(raw_sd.get("description", "")).lstrip("-").isdigit() else 0))
            # If AI didn't return details, distribute score evenly across 3 criteria
            if sd_photo + sd_titre + sd_desc == 0:
                third = score // 3
                sd_photo = min(25, third + (score % 3))
                sd_titre = min(25, third)
                sd_desc  = min(25, score - sd_photo - sd_titre)
            # Parse per-criterion AI advice
            raw_conseils = parsed.get("conseils", {})
            ai_conseil_titre = str(raw_conseils.get("titre", ""))[:300] if isinstance(raw_conseils, dict) else ""
            ai_conseil_desc  = str(raw_conseils.get("description", ""))[:300] if isinstance(raw_conseils, dict) else ""
            ai_conseil_photo = str(raw_conseils.get("photo", ""))[:300] if isinstance(raw_conseils, dict) else ""
            return {
                "titre": str(parsed.get("titre", "Article en bon état"))[:80],
                "description": str(parsed.get("description", "Bel article 📦"))[:600],
                "hashtags": str(parsed.get("hashtags", "#vinted #modeoccasion"))[:500],
                "score": score,
                "categorie": cat,
                "prix_estime": prix,
                "prix_vente_rapide": prix_vente_rapide,
                "probabilite_vente": prob,
                "conseils_photo": str(parsed.get("conseils_photo", ""))[:300] if score < 65 else "",
                "score_details": {"photo": sd_photo, "titre": sd_titre, "description": sd_desc, "tendance": 0},
                "conseils": {"titre": ai_conseil_titre, "description": ai_conseil_desc, "photo": ai_conseil_photo},
                "tone": tone_key,
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

def _week_key(category: str, titre: str = "") -> str:
    # Cache par jour + article pour des tendances spécifiques à chaque article
    today = _date.today()
    base = f"{today.strftime('%Y-%m-%d')}-{category.lower()[:20]}"
    if titre:
        import hashlib
        titre_hash = hashlib.md5(titre.encode('utf-8')).hexdigest()[:8]
        return f"{base}-{titre_hash}"
    return base

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

    cache_key = _week_key(body.category, body.titre)
    now = time.time()

    import random as _random_mod
    with _trends_lock:
        cached = _trends_cache.get(cache_key)
        if cached and not body.force_refresh and now < cached["expires_at"]:
            # Retourne un échantillon aléatoire différent à chaque appel pour varier les suggestions
            all_t = cached.get("all_trends", [])
            if all_t:
                selected = _random_mod.sample(all_t, min(6, len(all_t)))
                return {
                    "trends": selected,
                    "categorie": cached.get("categorie", body.category),
                    "maj": str(_date.today()),
                    "cache_key": cache_key
                }
            return cached["data"]

    article_context = ""
    if body.titre:
        article_context = f"\nArticle analysé : \"{body.titre}\""
    if body.description:
        article_context += f"\nDescription : \"{body.description[:120]}\""

    prompt = f"""Tu es expert SEO Vinted France. Tu analyses les tendances de recherche réelles sur Vinted.
Date : {_date.today().strftime('%d/%m/%Y')}.
Catégorie : {body.category}{article_context}

MISSION : Génère 12 expressions de recherche que des acheteurs Vinted tapent cette semaine pour trouver CET article précis.

Règles STRICTES :
- LONGUEUR : 2 à 4 mots maximum (ex: "ralph lauren noir", "doudoune brillante oversize", "puffer jacket Y2K")
- Chaque expression doit combiner des attributs RÉELS de cet article (marque exacte, couleur exacte, matière, type précis) — pas des termes génériques
- INTERDIT : expressions vagues comme "mode vintage", "style tendance", "bonne affaire" — chaque mot doit refléter un attribut visible de l'article
- Mix obligatoire : 3-4 combos marque + attribut visible (ex: "Coach cuir noir", "Coach ceinture homme"), 3-4 orientés style/tendance actuelle combinant 2+ caractéristiques de l'article, 2-3 orientés matière/couleur/coupe exacte de l'article, 1-2 orientés occasion/usage cohérents avec l'article
- Impacts réalistes et variés entre +80% et +380%
- RAISON : explique en 5-8 mots POURQUOI cette expression booste spécifiquement CET article (ex: "combo marque+couleur ultra cherché sur Vinted", "matière laquée très tendance cet hiver", "type d'article + marque = recherche fréquente"). PAS de raison générique.

Réponds UNIQUEMENT avec ce JSON exact (sans markdown, sans texte avant ou après) :
{{"trends":[{{"word":"doudoune brillante","impact":"+280%","raison":"matière laquée très tendance cet hiver","score_plus":"+8"}},{{"word":"ralph lauren noir","impact":"+320%","raison":"combo marque+couleur ultra cherché sur Vinted","score_plus":"+10"}},...12 items total],"category_used":"{body.category}"}}"""

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "llama-3.3-70b-versatile",
                    "max_tokens": 900,
                    "temperature": 1.05,
                    "messages": [{"role": "user", "content": prompt}]
                }
            )
            resp.raise_for_status()
            text = resp.json()["choices"][0]["message"]["content"]
            text = _re.sub(r"```json|```", "", text).strip()
            parsed = json.loads(text)

            raw_trends = parsed.get("trends", [])[:12]
            all_trends = []
            for t in raw_trends:
                word = t.get("word") or t.get("mot", "tendance")
                all_trends.append({
                    "mot":       word,
                    "word":      word,
                    "boost":     t.get("impact") or t.get("boost", "+100%"),
                    "impact":    t.get("impact") or t.get("boost", "+100%"),
                    "raison":    t.get("raison", ""),
                    "score_plus": t.get("score_plus", ""),
                })

            # Stocker les 12 en cache, retourner 6 aléatoires à chaque appel
            with _trends_lock:
                _trends_cache[cache_key] = {
                    "all_trends": all_trends,
                    "categorie": parsed.get("category_used") or body.category,
                    "expires_at": now + 24 * 3600  # Renouvellement quotidien
                }

        # Sélection aléatoire de 6 parmi les 12
        import random as _random_mod
        selected = _random_mod.sample(all_trends, min(6, len(all_trends)))

        result = {
            "trends": selected,
            "categorie": parsed.get("category_used") or body.category,
            "maj": str(_date.today()),
            "cache_key": cache_key
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
    new_score = min(98, body.current_score + 8)
    prompt = f"""Tu es expert vente Vinted France. Score actuel : {body.current_score}/100.
Mots-tendance viraux cette semaine à intégrer : {mots}

Analyse l'image et génère EXACTEMENT ce JSON (sans markdown, sans texte autour) :
{{"titre":"titre percutant avec 1-2 mots tendance, max 60 caractères","description":"description vendeuse optimisée SEO Vinted en 3 parties : 1) caractéristiques précises de l'article (type, couleur, matière, coupe) avec les mots tendance intégrés naturellement 2) points forts qui donnent envie d'acheter (détails visibles, logo, finitions) 3) état visible. Utilise 2-3 emojis. Entre 80 et 150 mots.","hashtags":"#tag1 #tag2 #tag3 #tag4 #tag5 #tag6 #tag7 #tag8 #tag9 #tag10","score":{new_score},"amelioration":"+{new_score - body.current_score} pts — mots tendance intégrés","prix_estime":"CALCULE_ICI"}}

RÈGLES OBLIGATOIRES :
- Titre : intègre 1 ou 2 des mots tendance de façon naturelle et percutante (ex si mot tendance = "puffer noir oversize" → titre = "Ralph Lauren puffer noir oversize")
- Description : les mots tendance doivent apparaître dans le texte de façon fluide, pas forcée. La description doit donner ENVIE d'acheter, pas juste décrire.
- prix_estime : remplace "CALCULE_ICI" par une vraie fourchette Vinted selon marque + état visibles (ex: "80-120€" doudoune Ralph Lauren). JAMAIS vide.
- hashtags : TOUJOURS exactement 10 hashtags, les mots tendance inclus en premier
- Langage certain : n'écris JAMAIS "semble", "paraît", "probablement", "peut-être" — uniquement ce que tu vois avec certitude"""

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
                            "max_tokens": 800,
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
            boost_prix = str(parsed.get("prix_estime", "")).strip()
            if not boost_prix or boost_prix == "CALCULE_ICI":
                boost_prix = ""  # frontend will keep existing prix_estime
            return {
                "titre": str(parsed.get("titre", ""))[:80],
                "description": str(parsed.get("description", ""))[:600],
                "hashtags": str(parsed.get("hashtags", ""))[:500],
                "score": max(body.current_score, min(98, int(parsed.get("score", body.current_score + 8)))),
                "amelioration": str(parsed.get("amelioration", f"+8 pts")),
                "prix_estime": boost_prix[:30],
            }
    except json.JSONDecodeError:
        raise HTTPException(500, "Erreur parsing réponse AI — réessaie")
    except Exception as e:
        print(f"[generate-boosted] {type(e).__name__}: {e}")
        raise HTTPException(500, f"Erreur boost: {str(e)}")

class SuggestionRequest(BaseModel):
    message: str

@app.post("/suggestion")
async def receive_suggestion(body: SuggestionRequest):
    msg = body.message.strip()
    if not msg or len(msg) < 5:
        raise HTTPException(400, "Message trop court.")
    if len(msg) > 2000:
        raise HTTPException(400, "Message trop long (max 2000 caractères).")
    if RESEND_API_KEY:
        html = f"<h2>💡 Suggestion PixGlow</h2><p style='white-space:pre-wrap'>{msg}</p>"
        _send_via_resend("pixglow.support@proton.me", "💡 Nouvelle suggestion PixGlow", html)
    return {"status": "ok"}

# ── Cron : rappel crédits inutilisés ─────────────────────────────────────────
@app.post("/cron/remind-credits")
async def cron_remind_credits(request: Request):
    """
    Envoie un email de rappel aux utilisateurs vérifés qui ont des crédits
    inutilisés depuis >= 7 jours et n'ont pas reçu de rappel depuis >= 30 jours.
    Appelable par un cron externe (ex: cron-job.org) avec le header X-Cron-Secret.
    """
    if not CRON_SECRET:
        raise HTTPException(503, "CRON_SECRET non configuré")
    if request.headers.get("X-Cron-Secret") != CRON_SECRET:
        raise HTTPException(403, "Non autorisé")
    if not EMAIL_ENABLED:
        raise HTTPException(503, "Email non configuré")

    conn = get_db(); cur = conn.cursor()
    try:
        cur.execute("""
            SELECT email, credits FROM users
            WHERE email_verified = TRUE
              AND credits > 0
              AND created_at < NOW() - INTERVAL '7 days'
              AND (last_used_at IS NULL OR last_used_at < NOW() - INTERVAL '7 days')
              AND (reminder_sent_at IS NULL OR reminder_sent_at < NOW() - INTERVAL '30 days')
        """)
        users_to_remind = cur.fetchall()
    finally:
        cur.close(); conn.close()

    sent = 0
    for u in users_to_remind:
        email, credits = u["email"], u["credits"]
        credit_word = "crédit" if credits == 1 else "crédits"
        html = f"""
        <div style="background:#0f172a;padding:32px;font-family:sans-serif;max-width:480px;margin:auto;border-radius:16px">
          <h2 style="font-size:20px;color:#fff;margin-bottom:16px;">Vous avez {credits} {credit_word} qui vous attendent ✨</h2>
          <p style="color:#94a3b8;line-height:1.6;">
            Votre compte PixGlow dispose encore de <strong style="color:#34d399;">{credits} {credit_word}</strong> non utilisés.
            Transformez vos photos en images fond blanc professionnel en quelques secondes.
          </p>
          <a href="{FRONTEND_URL}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:16px;">
            Utiliser mes crédits →
          </a>
          <p style="color:#475569;font-size:12px;margin-top:24px;">
            Vous recevez cet email car vous avez un compte PixGlow avec des crédits disponibles.<br>
            <a href="{FRONTEND_URL}/unsubscribe?email={email}" style="color:#475569;">Se désabonner</a>
          </p>
        </div>"""
        ok = send_email(email, f"Vous avez {credits} {credit_word} PixGlow inutilisés", html)
        if ok:
            conn2 = get_db(); cur2 = conn2.cursor()
            try:
                cur2.execute("UPDATE users SET reminder_sent_at = NOW() WHERE email = %s", (email,))
                conn2.commit()
            finally:
                cur2.close(); conn2.close()
            sent += 1

    print(f"[CRON] Rappels crédits : {sent}/{len(users_to_remind)} emails envoyés")
    return {"sent": sent, "total_eligible": len(users_to_remind)}


# ── Admin Panel ──────────────────────────────────────────────────────────────
def require_admin(email: Optional[str] = Depends(get_current_user)):
    if not ADMIN_EMAIL:
        raise HTTPException(503, "Panel admin non configuré (ADMIN_EMAIL manquant)")
    if email != ADMIN_EMAIL:
        raise HTTPException(403, "Accès réservé à l'administrateur")
    return email

@app.get("/admin/users")
async def admin_get_users(
    sort_by: str = "created_at",
    order: str = "desc",
    limit: int = 100,
    offset: int = 0,
    search: str = "",
    admin: str = Depends(require_admin)
):
    valid_sorts = {"created_at", "email", "credits", "last_used_at", "referrals_given"}
    if sort_by not in valid_sorts:
        sort_by = "created_at"
    order_sql = "DESC" if order == "desc" else "ASC"
    conn = get_db(); cur = conn.cursor()
    try:
        where_clause = psycopg2.sql.SQL("")
        params = []
        if search:
            where_clause = psycopg2.sql.SQL("WHERE email ILIKE %s")
            params.append(f"%{search}%")
        query = psycopg2.sql.SQL("""
            SELECT id, email, credits, created_at, last_used_at,
                   email_verified, referral_code, referrals_given, referred_by
            FROM users
            {where}
            ORDER BY {sort_col} {order_dir}
            LIMIT %s OFFSET %s
        """).format(
            where=where_clause,
            sort_col=psycopg2.sql.Identifier(sort_by),
            order_dir=psycopg2.sql.SQL(order_sql),
        )
        cur.execute(query, params + [limit, offset])
        users = cur.fetchall()
        count_query = psycopg2.sql.SQL("SELECT COUNT(*) as n FROM users {where}").format(where=where_clause)
        cur.execute(count_query, params)
        total = cur.fetchone()["n"]
    finally:
        cur.close(); conn.close()
    return {
        "users": [dict(u) for u in users],
        "total": total,
        "limit": limit,
        "offset": offset,
    }

@app.get("/admin/analytics")
async def admin_analytics(admin: str = Depends(require_admin)):
    conn = get_db(); cur = conn.cursor()
    try:
        # Totaux globaux
        cur.execute("SELECT COUNT(*) as n FROM users")
        total_users = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) as n FROM users WHERE email_verified = TRUE")
        verified_users = cur.fetchone()["n"]
        cur.execute("SELECT COALESCE(SUM(credits),0) as n FROM users")
        total_credits = cur.fetchone()["n"]
        cur.execute("SELECT value FROM stats WHERE key = 'total_photos'")
        row = cur.fetchone()
        total_photos = row["value"] if row else 0
        # Inscriptions par jour (30 derniers jours)
        cur.execute("""
            SELECT DATE(created_at) as day, COUNT(*) as count
            FROM users
            WHERE created_at >= NOW() - INTERVAL '30 days'
            GROUP BY DATE(created_at)
            ORDER BY day ASC
        """)
        signups_by_day = [{"day": str(r["day"]), "count": r["count"]} for r in cur.fetchall()]
        # Utilisateurs actifs (last_used_at dans les 7 derniers jours)
        cur.execute("SELECT COUNT(*) as n FROM users WHERE last_used_at >= NOW() - INTERVAL '7 days'")
        active_7d = cur.fetchone()["n"]
        cur.execute("SELECT COUNT(*) as n FROM users WHERE last_used_at >= NOW() - INTERVAL '30 days'")
        active_30d = cur.fetchone()["n"]
        # Top utilisateurs par crédits
        cur.execute("SELECT email, credits FROM users ORDER BY credits DESC LIMIT 10")
        top_by_credits = [dict(r) for r in cur.fetchall()]
        # Inscriptions ce mois
        cur.execute("SELECT COUNT(*) as n FROM users WHERE created_at >= DATE_TRUNC('month', NOW())")
        signups_this_month = cur.fetchone()["n"]
        # Inscriptions aujourd'hui
        cur.execute("SELECT COUNT(*) as n FROM users WHERE DATE(created_at) = CURRENT_DATE")
        signups_today = cur.fetchone()["n"]
    finally:
        cur.close(); conn.close()
    return {
        "total_users": total_users,
        "verified_users": verified_users,
        "total_credits_in_system": int(total_credits),
        "total_photos_processed": total_photos,
        "active_7d": active_7d,
        "active_30d": active_30d,
        "signups_today": signups_today,
        "signups_this_month": signups_this_month,
        "signups_by_day": signups_by_day,
        "top_by_credits": top_by_credits,
    }

@app.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: int, admin: str = Depends(require_admin)):
    conn = get_db(); cur = conn.cursor()
    try:
        cur.execute("SELECT email FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        if not user:
            raise HTTPException(404, "Utilisateur introuvable")
        if user["email"] == ADMIN_EMAIL:
            raise HTTPException(400, "Impossible de supprimer le compte admin")
        cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
    finally:
        cur.close(); conn.close()
    return {"status": "deleted"}

@app.patch("/admin/users/{user_id}/credits")
async def admin_update_credits(user_id: int, body: dict, admin: str = Depends(require_admin)):
    credits = body.get("credits")
    if credits is None or not isinstance(credits, int) or credits < 0:
        raise HTTPException(400, "Valeur de crédits invalide")
    conn = get_db(); cur = conn.cursor()
    try:
        cur.execute("UPDATE users SET credits = %s WHERE id = %s RETURNING email", (credits, user_id))
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "Utilisateur introuvable")
        conn.commit()
    finally:
        cur.close(); conn.close()
    return {"status": "updated", "credits": credits}

# ─────────────────────────────────────────────
#  AFFILIATION
# ─────────────────────────────────────────────

@app.post("/affiliate/login")
async def affiliate_login(body: AffiliateLoginBody):
    email = body.email.strip().lower()
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT code, name, password_hash, commission_rate, is_active FROM affiliates WHERE email = %s", (email,))
    aff = cur.fetchone()
    cur.close(); conn.close()
    if not aff or not verify_password(body.password, aff["password_hash"]):
        raise HTTPException(401, "Email ou mot de passe incorrect")
    if not aff["is_active"]:
        raise HTTPException(403, "Ce compte affilié est désactivé")
    token = create_affiliate_token(aff["code"])
    return {"token": token, "code": aff["code"], "name": aff["name"], "commission_rate": aff["commission_rate"]}

@app.get("/affiliate/stats")
async def affiliate_stats(aff_code: str = Depends(get_current_affiliate)):
    if not aff_code:
        raise HTTPException(401, "Token affilié requis")
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT code, name, email, commission_rate FROM affiliates WHERE code = %s", (aff_code,))
    aff = cur.fetchone()
    if not aff:
        cur.close(); conn.close()
        raise HTTPException(404, "Affilié introuvable")
    # Conversions
    cur.execute("""
        SELECT type, user_email, plan, amount_cents, commission_cents, created_at
        FROM affiliate_conversions
        WHERE affiliate_code = %s
        ORDER BY created_at DESC
        LIMIT 200
    """, (aff_code,))
    convs = cur.fetchall()
    cur.close(); conn.close()
    signups = [c for c in convs if c["type"] == "signup"]
    payments = [c for c in convs if c["type"] == "payment"]
    total_revenue = sum(c["amount_cents"] for c in payments)
    total_commission = sum(c["commission_cents"] for c in payments)
    return {
        "code": aff["code"],
        "name": aff["name"],
        "email": aff["email"],
        "commission_rate": aff["commission_rate"],
        "link": f"{FRONTEND_URL}/?ref={aff['code']}",
        "signups": len(signups),
        "paid_conversions": len(payments),
        "total_revenue_cents": total_revenue,
        "commission_owed_cents": total_commission,
        "conversions": [
            {
                "type": c["type"],
                "user_email": mask_email(c["user_email"]),
                "plan": c.get("plan"),
                "amount_cents": c["amount_cents"],
                "commission_cents": c["commission_cents"],
                "created_at": c["created_at"].isoformat() if c["created_at"] else None
            }
            for c in convs
        ]
    }

@app.post("/admin/affiliates")
async def admin_create_affiliate(body: AffiliateCreateBody, admin: str = Depends(require_admin)):
    code = body.code.strip().upper()
    if not code or len(code) < 2:
        raise HTTPException(400, "Code trop court (minimum 2 caractères)")
    conn = get_db(); cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO affiliates (code, name, email, password_hash, commission_rate) VALUES (%s, %s, %s, %s, %s)",
            (code, body.name.strip(), body.email.strip().lower(), hash_password(body.password), body.commission_rate)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        if "unique" in str(e).lower():
            raise HTTPException(400, "Ce code ou cet email est déjà utilisé")
        raise HTTPException(500, str(e))
    finally:
        cur.close(); conn.close()
    return {"status": "created", "code": code, "link": f"{FRONTEND_URL}/?ref={code}"}

@app.get("/admin/affiliates")
async def admin_list_affiliates(admin: str = Depends(require_admin)):
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT code, name, email, commission_rate, is_active, created_at FROM affiliates ORDER BY created_at DESC")
    affs = cur.fetchall()
    result = []
    for a in affs:
        cur.execute("""
            SELECT
                COUNT(*) FILTER (WHERE type='signup') as signups,
                COUNT(*) FILTER (WHERE type='payment') as paid_conversions,
                COALESCE(SUM(amount_cents) FILTER (WHERE type='payment'), 0) as revenue_cents,
                COALESCE(SUM(commission_cents) FILTER (WHERE type='payment'), 0) as commission_cents
            FROM affiliate_conversions WHERE affiliate_code = %s
        """, (a["code"],))
        stats = cur.fetchone()
        result.append({
            "code": a["code"],
            "name": a["name"],
            "email": a["email"],
            "commission_rate": a["commission_rate"],
            "is_active": a["is_active"],
            "created_at": a["created_at"].isoformat() if a["created_at"] else None,
            "link": f"{FRONTEND_URL}/?ref={a['code']}",
            "signups": stats["signups"] if stats else 0,
            "paid_conversions": stats["paid_conversions"] if stats else 0,
            "revenue_cents": stats["revenue_cents"] if stats else 0,
            "commission_cents": stats["commission_cents"] if stats else 0,
        })
    cur.close(); conn.close()
    return result

@app.patch("/admin/affiliates/{code}")
async def admin_patch_affiliate(code: str, body: AffiliatePatchBody, admin: str = Depends(require_admin)):
    code = code.upper()
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT id FROM affiliates WHERE code = %s", (code,))
    if not cur.fetchone():
        cur.close(); conn.close()
        raise HTTPException(404, "Affilié introuvable")
    updates = []
    values = []
    if body.name is not None:
        updates.append("name = %s"); values.append(body.name.strip())
    if body.commission_rate is not None:
        updates.append("commission_rate = %s"); values.append(body.commission_rate)
    if body.is_active is not None:
        updates.append("is_active = %s"); values.append(body.is_active)
    if body.password is not None:
        updates.append("password_hash = %s"); values.append(hash_password(body.password))
    if not updates:
        cur.close(); conn.close()
        return {"status": "nothing_to_update"}
    values.append(code)
    cur.execute(f"UPDATE affiliates SET {', '.join(updates)} WHERE code = %s", values)
    conn.commit(); cur.close(); conn.close()
    return {"status": "updated"}

@app.delete("/admin/affiliates/{code}")
async def admin_delete_affiliate(code: str, admin: str = Depends(require_admin)):
    code = code.upper()
    conn = get_db(); cur = conn.cursor()
    cur.execute("DELETE FROM affiliates WHERE code = %s RETURNING code", (code,))
    if not cur.fetchone():
        conn.rollback(); cur.close(); conn.close()
        raise HTTPException(404, "Affilié introuvable")
    conn.commit(); cur.close(); conn.close()
    return {"status": "deleted"}

# ── Serve React SPA (doit être après toutes les routes API) ──────────────────
_dist = os.path.join(os.path.dirname(__file__), "dist")
if os.path.exists(_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def spa_fallback(full_path: str):
        # Sert les fichiers statiques racine (favicon.svg, icon-512.png, etc.)
        candidate = os.path.join(_dist, full_path)
        if full_path and os.path.isfile(candidate):
            return FileResponse(candidate)
        return FileResponse(os.path.join(_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
