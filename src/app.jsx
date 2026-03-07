import React, { useState, useRef, useEffect } from 'react';

/* ─── PAGES LÉGALES (intégrées directement) ─── */
const LS = {
  page: { background: 'linear-gradient(135deg,#0a0a0f,#111118)', minHeight: '100vh', color: '#e2e8f0', fontFamily: "'DM Sans',system-ui,sans-serif" },
  nav:  { padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,.05)', background: 'rgba(10,10,15,.95)', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '20px', fontWeight: 800, color: '#fff' },
  wrap: { maxWidth: '760px', margin: '0 auto', padding: '40px 20px' },
  h1:   { fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '32px', fontWeight: 800, color: '#fff', marginBottom: '6px' },
  h2:   { fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '18px', fontWeight: 700, color: '#7c3aed', margin: '28px 0 8px' },
  p:    { color: '#64748b', lineHeight: 1.8, fontSize: '15px', marginBottom: '12px' },
  back: { background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', fontFamily: 'inherit' },
};
const LegalLayout = ({ title, onBack, children }) => (
  <div style={LS.page}>
    <nav style={LS.nav}>
      <span style={LS.logo}>✨ PixGlow</span>
      <button onClick={onBack} style={LS.back}>← Retour</button>
    </nav>
    <div style={LS.wrap}>
      <h1 style={LS.h1}>{title}</h1>
      <p style={{ ...LS.p, fontSize: '13px', color: '#334155', marginBottom: '28px' }}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
      {children}
    </div>
  </div>
);
function MentionsLegales({ onBack }) {
  return (
    <LegalLayout title="Mentions légales" onBack={onBack}>
      <h2 style={LS.h2}>Éditeur du site</h2>
      <p style={LS.p}>Le site pixglow.app est édité par un entrepreneur individuel.<br/>Email : <a href="mailto:support@pixglow.app" style={{ color: '#7c3aed' }}>support@pixglow.app</a></p>
      <h2 style={LS.h2}>Hébergement</h2>
      <p style={LS.p}><strong style={{ color: '#e2e8f0' }}>Railway Corp</strong> — 548 Market St, San Francisco, CA 94104, USA</p>
      <h2 style={LS.h2}>Propriété intellectuelle</h2>
      <p style={LS.p}>L'ensemble du contenu de PixGlow est protégé par le droit d'auteur. Toute reproduction sans autorisation est interdite.</p>
      <h2 style={LS.h2}>Traitement des paiements</h2>
      <p style={LS.p}>Les paiements sont traités par <strong style={{ color: '#e2e8f0' }}>Stripe Inc.</strong>, certifié PCI-DSS. PixGlow ne stocke aucune donnée bancaire.</p>
      <h2 style={LS.h2}>Responsabilité</h2>
      <p style={LS.p}>PixGlow ne saurait être tenu responsable des dommages liés à l'utilisation du service. Le service est fourni "en l'état", sans garantie de disponibilité continue.</p>
    </LegalLayout>
  );
}
function PolitiqueConfidentialite({ onBack }) {
  return (
    <LegalLayout title="Politique de confidentialité" onBack={onBack}>
      <p style={{ ...LS.p, color: '#334155' }}>Conformément au RGPD — Règlement Général sur la Protection des Données</p>
      <h2 style={LS.h2}>Données collectées</h2>
      <p style={LS.p}>Lors de la création d'un compte : adresse email, mot de passe (chiffré), adresse IP (quota gratuit), images uploadées (supprimées après 24h).</p>
      <h2 style={LS.h2}>Finalité du traitement</h2>
      <p style={LS.p}>Gestion de votre compte et crédits · Traitement des paiements via Stripe · Prévention des abus</p>
      <h2 style={LS.h2}>Durée de conservation</h2>
      <p style={LS.p}>Données de compte : conservées tant que le compte est actif · Images uploadées : <strong style={{ color: '#e2e8f0' }}>supprimées après 24 heures</strong> · Données IP : 30 jours</p>
      <h2 style={LS.h2}>Partage des données</h2>
      <p style={LS.p}>Nous ne vendons jamais vos données. Partagées uniquement avec <strong style={{ color: '#e2e8f0' }}>Stripe</strong> (paiements) et <strong style={{ color: '#e2e8f0' }}>Railway</strong> (hébergement).</p>
      <h2 style={LS.h2}>Vos droits (RGPD)</h2>
      <p style={LS.p}>Accès, rectification, effacement et portabilité de vos données. Contact : <a href="mailto:support@pixglow.app" style={{ color: '#7c3aed' }}>support@pixglow.app</a></p>
      <h2 style={LS.h2}>Cookies</h2>
      <p style={LS.p}>Aucun cookie de tracking. Un token d'authentification est stocké localement pour maintenir votre session.</p>
    </LegalLayout>
  );
}
function CGV({ onBack }) {
  return (
    <LegalLayout title="Conditions Générales de Vente" onBack={onBack}>
      <h2 style={LS.h2}>Service proposé</h2>
      <p style={LS.p}>PixGlow est un service de traitement automatique d'images (suppression du fond, amélioration luminosité) destiné aux vendeurs de plateformes e-commerce.</p>
      <h2 style={LS.h2}>Tarifs</h2>
      <p style={LS.p}><strong style={{ color: '#e2e8f0' }}>Offre gratuite :</strong> 5 images par adresse IP, sans inscription.<br/><strong style={{ color: '#e2e8f0' }}>Pack Pro :</strong> 100 crédits pour 15€ TTC (0,15€/image). Crédits valables à vie et non remboursables une fois utilisés.</p>
      <h2 style={LS.h2}>Paiement</h2>
      <p style={LS.p}>Paiement en une seule fois, par carte bancaire, via Stripe. Les crédits sont ajoutés immédiatement après confirmation du paiement.</p>
      <h2 style={LS.h2}>Droit de rétractation</h2>
      <p style={LS.p}>Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux contenus numériques dont l'exécution a commencé. Les crédits non utilisés peuvent être remboursés dans les 14 jours à <a href="mailto:support@pixglow.app" style={{ color: '#7c3aed' }}>support@pixglow.app</a>.</p>
      <h2 style={LS.h2}>Litiges</h2>
      <p style={LS.p}>En cas de litige, contactez-nous d'abord. À défaut d'accord amiable, les tribunaux français sont compétents. Droit applicable : droit français.</p>
    </LegalLayout>
  );
}

const API_URL = "https://web-production-f1129.up.railway.app";
const MAX_SIMULTANEOUS = 5;

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=DM+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  body { background: #0a0a0f; font-family: 'DM Sans', system-ui, sans-serif; }
  .pg-card { transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease; }
  .pg-card:hover { transform: translateY(-3px) scale(1.025); box-shadow: 0 0 32px rgba(124,58,237,.2), 0 8px 32px rgba(0,0,0,.4); border-color: rgba(124,58,237,.45) !important; }
  .pg-btn { transition: transform .15s ease, box-shadow .15s ease, filter .15s ease; }
  .pg-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(124,58,237,.4); filter: brightness(1.1); }
  .pg-btn:active { transform: scale(.97); }
  .pg-ghost { transition: background .15s, color .15s, border-color .15s; }
  .pg-ghost:hover { background: rgba(255,255,255,.1) !important; color: #fff !important; border-color: rgba(255,255,255,.3) !important; }
  .pg-navlink { background: none; border: none; cursor: pointer; font-family: inherit; transition: color .15s; }
  .pg-navlink:hover { color: #e2e8f0 !important; }
  .pg-input { padding: 14px 16px; border-radius: 12px; border: 1px solid rgba(124,58,237,.3); font-size: 16px; background: rgba(15,10,30,.8); color: #fff; outline: none; width: 100%; display: block; font-family: inherit; transition: border-color .2s, box-shadow .2s; }
  .pg-input:focus { border-color: rgba(124,58,237,.7); box-shadow: 0 0 0 3px rgba(124,58,237,.15); }
  .pg-tab { border: none; border-radius: 8px; padding: 10px; font-weight: 700; cursor: pointer; font-size: 14px; font-family: inherit; transition: all .15s; }
  @keyframes pg-fadeup { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  .pg-anim { animation: pg-fadeup .55s ease both; }
  .pg-anim-2 { animation: pg-fadeup .55s .1s ease both; }
  .pg-anim-3 { animation: pg-fadeup .55s .2s ease both; }
  @keyframes pg-check { 0%{transform:scale(0) rotate(-12deg);opacity:0;} 60%{transform:scale(1.2);opacity:1;} 100%{transform:scale(1);opacity:1;} }
  .pg-check { animation: pg-check .45s ease both; }
  @keyframes pg-glow { 0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,.35);} 50%{box-shadow:0 0 0 12px rgba(124,58,237,0);} }
  .pg-glow { animation: pg-glow 2.4s infinite; }
  @media(max-width:600px) { .pg-hero { font-size: 36px !important; } .pg-stats { grid-template-columns: 1fr 1fr !important; } }
`;

function InjectCSS() {
  useEffect(() => {
    const el = document.createElement('style');
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
  return null;
}

/* ─── AUTH MODAL ─── */
function AuthModal({ show, initialMode, onClose, onSuccess, isMobile }) {
  const [mode, setMode] = useState(initialMode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => { if (show) { setMode(initialMode || 'login'); setErrMsg(''); } }, [show, initialMode]);
  if (!show) return null;

  const handleSubmit = async () => {
    setErrMsg('');
    if (!email.includes('@')) { setErrMsg('Entrez un email valide'); return; }
    if (password.length < 6) { setErrMsg('Mot de passe : minimum 6 caractères'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim().toLowerCase(), password }) });
      const data = await res.json();
      if (!res.ok) { setErrMsg(data.detail || 'Identifiants incorrects'); setLoading(false); return; }
      localStorage.setItem('pg_token', data.token);
      localStorage.setItem('pg_email', email.trim().toLowerCase());
      onSuccess(email.trim().toLowerCase(), data.credits);
    } catch { setErrMsg('Impossible de contacter le serveur.'); }
    finally { setLoading(false); }
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(8px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="pg-anim" style={{ background: 'linear-gradient(160deg,#16102a,#0d0d1a)', border: '1px solid rgba(124,58,237,.35)', borderRadius: '24px', padding: isMobile ? '28px 20px' : '44px', width: '100%', maxWidth: '420px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(255,255,255,.08)', border: 'none', color: '#94a3b8', cursor: 'pointer', borderRadius: '8px', width: '34px', height: '34px', fontSize: '16px', fontFamily: 'inherit' }}>✕</button>
        <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{mode === 'login' ? '👋 Bon retour !' : '🚀 Créer mon compte'}</h2>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '22px' }}>{mode === 'login' ? 'Accédez à vos crédits et vos photos' : 'Gratuit · Crédits sauvegardés à vie'}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(0,0,0,.4)', borderRadius: '12px', padding: '4px', marginBottom: '22px' }}>
          {['login','register'].map(m => (
            <button key={m} className="pg-tab" onClick={() => { setMode(m); setErrMsg(''); }} style={{ background: mode === m ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'transparent', color: mode === m ? '#fff' : '#64748b' }}>
              {m === 'login' ? 'Se connecter' : "S'inscrire"}
            </button>
          ))}
        </div>
        <input className="pg-input" type="email" placeholder="Votre adresse email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} autoFocus autoComplete="email" style={{ marginBottom: '12px', borderColor: errMsg ? 'rgba(239,68,68,.5)' : undefined }} />
        <input className="pg-input" type="password" placeholder="Mot de passe (min. 6 caractères)" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} style={{ marginBottom: '16px', borderColor: errMsg ? 'rgba(239,68,68,.5)' : undefined }} />
        {errMsg && <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', color: '#f87171', fontSize: '13px' }}>⚠️ {errMsg}</div>}
        <button className="pg-btn pg-glow" disabled={loading} onClick={handleSubmit} style={{ width: '100%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '12px', padding: '15px', fontWeight: 800, fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? .7 : 1 }}>
          {loading ? '⏳ En cours...' : mode === 'login' ? '→ Me connecter' : '→ Créer mon compte'}
        </button>
        <p style={{ color: '#334155', fontSize: '11px', textAlign: 'center', marginTop: '14px' }}>🔒 Paiement sécurisé Stripe · Données protégées</p>
      </div>
    </div>
  );
}

/* ─── COMPOSANT PRINCIPAL ─── */
export default function PixGlow() {
  const [page, setPage] = useState('landing');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [credits, setCredits] = useState(null);
  const [freeLeft, setFreeLeft] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const getToken = () => localStorage.getItem('pg_token');
  const authHeaders = () => { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; };

  useEffect(() => { const fn = () => setIsMobile(window.innerWidth < 768); window.addEventListener('resize', fn); return () => window.removeEventListener('resize', fn); }, []);

  useEffect(() => {
    const token = getToken(); const savedEmail = localStorage.getItem('pg_email');
    if (token && savedEmail) {
      setUserEmail(savedEmail); setIsConnected(true);
      fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { if (d.credits !== undefined) setCredits(d.credits); }).catch(() => {});
    }
    fetch(`${API_URL}/free-remaining`).then(r => r.json()).then(d => { if (d.remaining !== undefined) { setFreeLeft(d.remaining); localStorage.setItem('pg_free', d.remaining); } }).catch(() => setFreeLeft(parseInt(localStorage.getItem('pg_free') || '5')));
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success' && token) {
      setTimeout(() => { fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { if (d.credits !== undefined) { setCredits(d.credits); alert(`✅ Paiement confirmé ! ${d.credits} crédits disponibles.`); window.history.replaceState({}, '', window.location.pathname); } }); }, 2000);
    }
  }, []);

  const openAuth = (mode) => { setAuthMode(mode); setShowAuth(true); };
  const handleAuthSuccess = (email, userCredits) => { setUserEmail(email); setCredits(userCredits); setIsConnected(true); setShowAuth(false); setPage('app'); };
  const handleLogout = () => { ['pg_token','pg_email'].forEach(k => localStorage.removeItem(k)); setUserEmail(''); setCredits(null); setIsConnected(false); setPage('landing'); };
  const limitReached = !isConnected && freeLeft !== null && freeLeft <= 0;
  const canSelect = () => isConnected || freeLeft === null || freeLeft > 0;

  const handleSelectClick = (useCamera = false) => {
    if (!canSelect()) { setError(!isConnected ? 'Vos 5 photos gratuites ont été utilisées. Créez un compte pour continuer.' : 'Crédits épuisés.'); return; }
    setError(null);
    if (useCamera) cameraInputRef.current?.click(); else fileInputRef.current?.click();
  };

  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    const available = isConnected ? (credits ?? 999) : (freeLeft ?? 5);
    const maxAllowed = Math.min(selected.length, MAX_SIMULTANEOUS, Math.max(available, 1));
    const chosen = selected.slice(0, maxAllowed);
    if (selected.length > maxAllowed) setError(`Maximum ${maxAllowed} photo(s) selon vos crédits disponibles.`); else setError(null);
    setFiles(chosen); setResults([]); setProgress(0);
    Promise.all(chosen.map(f => new Promise(resolve => { const r = new FileReader(); r.onload = ev => resolve(ev.target.result); r.readAsDataURL(f); }))).then(setPreviews);
  };

  const handleUpload = async () => {
    if (!files.length) { setError('Sélectionnez au moins une photo'); return; }
    if (!isConnected && freeLeft !== null && freeLeft <= 0) { setError('Vos 5 photos gratuites ont été utilisées.'); return; }
    if (isConnected && credits !== null && credits < files.length) { setError(`Crédits insuffisants : ${credits} crédit(s) pour ${files.length} photo(s).`); return; }
    setLoading(true); setError(null); setResults([]); setProgress(0);
    let currentFreeLeft = freeLeft; const newResults = [];
    for (let i = 0; i < files.length; i++) {
      setProgress(i + 1);
      try {
        const form = new FormData(); form.append('file', files[i]);
        const res = await fetch(`${API_URL}/enhance`, { method: 'POST', headers: authHeaders(), body: form });
        const data = await res.json();
        if (!res.ok) { newResults.push({ error: data.detail || 'Erreur', original: previews[i] }); }
        else {
          newResults.push({ url: `${API_URL}${data.url}`, filename: data.filename, original: previews[i] });
          if (data.credits_left !== null && data.credits_left !== undefined) setCredits(data.credits_left);
          else { currentFreeLeft = Math.max(0, (currentFreeLeft ?? 5) - 1); setFreeLeft(currentFreeLeft); localStorage.setItem('pg_free', currentFreeLeft); }
        }
      } catch { newResults.push({ error: 'Erreur réseau', original: previews[i] }); }
      setResults([...newResults]);
    }
    setLoading(false);
  };

  const handleDownload = (r) => { const a = document.createElement('a'); a.href = r.url; a.download = r.filename; a.click(); };
  const handleDownloadAll = () => results.filter(r => !r.error).forEach(handleDownload);
  const reset = () => { setFiles([]); setPreviews([]); setResults([]); setError(null); setProgress(0); };
  const handlePayment = async () => {
    const token = getToken(); if (!token) { openAuth('login'); return; }
    try { const res = await fetch(`${API_URL}/create-checkout-session`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); const data = await res.json(); if (data.checkout_url) window.location.href = data.checkout_url; }
    catch { alert('Erreur paiement, réessayez.'); }
  };

  const doneCount = results.filter(r => !r.error).length;
  const hasResults = results.length > 0 && results.length === files.length && !loading;

  if (page === 'mentions') return <><InjectCSS /><MentionsLegales onBack={() => setPage('landing')} /></>;
  if (page === 'confidentialite') return <><InjectCSS /><PolitiqueConfidentialite onBack={() => setPage('landing')} /></>;
  if (page === 'cgv') return <><InjectCSS /><CGV onBack={() => setPage('landing')} /></>;

  const Nav = ({ showBack = false }) => (
    <nav style={{ padding: isMobile ? '14px 16px' : '18px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,.05)', background: 'rgba(10,10,15,.95)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setPage('landing')}>
        <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>✨</div>
        <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '20px', fontWeight: 800, color: '#fff' }}>PixGlow</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {showBack ? (
          <>
            {isConnected ? (
              <>
                {credits !== null && <span style={{ background: 'rgba(124,58,237,.15)', color: '#a78bfa', padding: '4px 12px', borderRadius: '100px', fontWeight: 700, fontSize: '13px' }}>💎 {credits} crédits</span>}
                <button onClick={handlePayment} className="pg-btn" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: '8px 16px', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>+ Crédits</button>
                <button onClick={handleLogout} className="pg-ghost" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: '#64748b', borderRadius: '10px', padding: '8px 12px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>Déco</button>
              </>
            ) : (
              <>
                <button onClick={() => openAuth('login')} className="pg-ghost" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8', borderRadius: '10px', padding: '10px 16px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>Connexion</button>
                <button onClick={() => setPage('landing')} className="pg-ghost" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)', color: '#64748b', borderRadius: '10px', padding: '10px 14px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>← Accueil</button>
              </>
            )}
          </>
        ) : (
          <>
            <button onClick={() => setPage('help')} className="pg-navlink" style={{ color: '#64748b', fontSize: '14px', padding: '0 6px' }}>Aide</button>
            {isConnected
              ? <button onClick={() => setPage('app')} className="pg-btn" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>Mon espace →</button>
              : <>
                  <button onClick={() => openAuth('login')} className="pg-ghost" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8', borderRadius: '10px', padding: '10px 16px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>Connexion</button>
                  <button onClick={() => setPage('app')} className="pg-btn" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>{isMobile ? 'Commencer' : 'Commencer gratuitement'}</button>
                </>}
          </>
        )}
      </div>
    </nav>
  );

  const Footer = () => (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,.04)', padding: '28px 24px', textAlign: 'center' }}>
      <p style={{ color: '#1a1a2e', fontSize: '12px', marginBottom: '10px' }}>© {new Date().getFullYear()} PixGlow · Tous droits réservés</p>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[['mentions','Mentions légales'],['cgv','CGV'],['confidentialite','Confidentialité'],['help','Aide']].map(([p, label]) => (
          <button key={p} onClick={() => setPage(p)} className="pg-navlink" style={{ color: '#1e293b', fontSize: '12px', textDecoration: 'underline' }}>{label}</button>
        ))}
      </div>
    </footer>
  );

  /* ══ LANDING ══ */
  if (page === 'landing') return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#e2e8f0', overflowX: 'hidden' }}>
      <InjectCSS />
      <AuthModal show={showAuth} initialMode={authMode} onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} isMobile={isMobile} />
      <Nav />

      {/* HERO */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '52px 16px 36px' : '90px 40px 56px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '350px', background: 'radial-gradient(ellipse, rgba(124,58,237,.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="pg-anim" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.28)', borderRadius: '100px', padding: '6px 16px 6px 10px', marginBottom: '24px', fontSize: '12px', color: '#a78bfa', fontWeight: 600 }}>
            <span style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: '100px', padding: '2px 10px', color: '#fff', fontSize: '11px', fontWeight: 800 }}>NEW</span>
            🛍️ Conçu pour les vendeurs Vinted, Leboncoin & Vestiaire
          </div>
          <h1 className="pg-hero" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '40px' : '72px', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-1.5px', color: '#fff', marginBottom: '20px' }}>
            Transforme tes photos<br/>
            <span style={{ background: 'linear-gradient(135deg,#7c3aed,#60a5fa,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>en annonces pro</span><br/>
            en 3 secondes
          </h1>
          <p className="pg-anim-2" style={{ fontSize: isMobile ? '16px' : '20px', color: '#475569', maxWidth: '520px', margin: '0 auto 28px', lineHeight: 1.65 }}>
            Suppression du fond automatique · Fond blanc parfait · Luminosité studio
          </p>
          <div className="pg-anim-3" style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '36px' }}>
            <button onClick={() => setPage('app')} className="pg-btn pg-glow" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '14px', padding: isMobile ? '16px 24px' : '18px 36px', fontWeight: 800, cursor: 'pointer', fontSize: isMobile ? '16px' : '18px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
              ⚡ Essayer gratuitement
              <span style={{ background: 'rgba(255,255,255,.18)', borderRadius: '100px', padding: '2px 10px', fontSize: '12px', fontWeight: 700 }}>5 photos offertes</span>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex' }}>
              {['#6d28d9','#4f46e5','#0891b2','#059669','#7c3aed'].map((c,i) => (
                <div key={i} style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, border: '2px solid #0a0a0f', marginLeft: i ? '-7px' : '0' }} />
              ))}
            </div>
            <span style={{ fontSize: '13px', color: '#475569' }}><strong style={{ color: '#e2e8f0' }}>+12 000 vendeurs</strong> utilisent PixGlow</span>
            <span style={{ color: '#1e293b' }}>·</span>
            <span style={{ fontSize: '13px', color: '#475569' }}>⭐ <strong style={{ color: '#e2e8f0' }}>4.9/5</strong> satisfaction</span>
          </div>
        </div>
      </section>

      {/* AVANT/APRÈS */}
      <section style={{ maxWidth: '820px', margin: '0 auto', padding: isMobile ? '0 16px 52px' : '0 40px 72px' }}>
        <div style={{ background: 'linear-gradient(160deg,#111118,#0d0d18)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '24px', padding: isMobile ? '20px' : '32px' }}>
          <p style={{ color: '#1e293b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', marginBottom: '20px' }}>Résultat en temps réel</p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr auto 1fr', alignItems: 'center', gap: isMobile ? '16px' : '24px' }}>
            <div>
              <p style={{ color: '#334155', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>📷 Avant</p>
              <div style={{ borderRadius: '14px', background: 'linear-gradient(135deg,#1a1a2e,#16213e)', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '70px', border: '1px solid rgba(255,255,255,.05)', overflow: 'hidden', position: 'relative' }}>
                <span style={{ filter: 'grayscale(.3)' }}>👗</span>
              </div>
              <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>✗ Fond encombré</span>
                <span style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>✗ Lumière sombre</span>
              </div>
            </div>
            <div style={{ textAlign: 'center', fontSize: isMobile ? '28px' : '38px', color: '#7c3aed', transform: isMobile ? 'rotate(90deg)' : 'none' }}>→</div>
            <div>
              <p style={{ color: '#10b981', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>✅ Après PixGlow</p>
              <div style={{ borderRadius: '14px', background: '#fff', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '70px', border: '2px solid rgba(16,185,129,.35)', boxShadow: '0 0 36px rgba(16,185,129,.1)' }}>👗</div>
              <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(16,185,129,.1)', color: '#10b981', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>✓ Fond blanc pur</span>
                <span style={{ background: 'rgba(16,185,129,.1)', color: '#10b981', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>✓ Qualité studio</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: 'linear-gradient(90deg,rgba(124,58,237,.06),rgba(16,185,129,.04),rgba(96,165,250,.06))', borderTop: '1px solid rgba(255,255,255,.04)', borderBottom: '1px solid rgba(255,255,255,.04)', padding: isMobile ? '20px 16px' : '24px 40px' }}>
        <div className="pg-stats" style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', textAlign: 'center' }}>
          {[{v:'+12 000',l:'vendeurs actifs',c:'#7c3aed'},{v:'+38%',l:'vues par annonce',c:'#10b981'},{v:'3 sec',l:'par photo',c:'#60a5fa'},{v:'5⭐',l:'satisfaction',c:'#f59e0b'}].map((s,i) => (
            <div key={i} style={{ padding: '14px 8px' }}>
              <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '20px' : '28px', fontWeight: 800, color: s.c, marginBottom: '4px' }}>{s.v}</div>
              <div style={{ fontSize: '12px', color: '#334155', fontWeight: 500 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: isMobile ? '52px 16px' : '80px 40px' }}>
        <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '26px' : '40px', fontWeight: 800, textAlign: 'center', marginBottom: '8px', color: '#fff', letterSpacing: '-.5px' }}>Tout ce qu'il te faut pour vendre plus</h2>
        <p style={{ color: '#334155', textAlign: 'center', marginBottom: '44px', fontSize: '16px' }}>Conçu pour être ultra-rapide sur mobile</p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '16px' }}>
          {[
            { icon: '🎨', titre: 'Fond blanc parfait', desc: "Suppression IA du fond en 1 clic. Ton article ressort comme sur un site e-commerce professionnel.", col: '124,58,237' },
            { icon: '✨', titre: 'Luminosité & netteté', desc: "Contraste, couleurs et netteté optimisés automatiquement. Chaque photo devient plus attirante.", col: '96,165,250' },
            { icon: '⚡', titre: "Jusqu'à 5 photos à la fois", desc: "Traitement en batch — prépare toute une annonce en moins d'une minute depuis ton téléphone.", col: '16,185,129' },
          ].map((f,i) => (
            <div key={i} className="pg-card" style={{ background: 'rgba(255,255,255,.02)', border: `1px solid rgba(${f.col},.16)`, borderRadius: '20px', padding: '28px 24px' }}>
              <div style={{ width: '52px', height: '52px', background: `rgba(${f.col},.1)`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', marginBottom: '18px', border: `1px solid rgba(${f.col},.18)` }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#fff' }}>{f.titre}</h3>
              <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section style={{ background: 'linear-gradient(180deg,transparent,rgba(124,58,237,.03),transparent)', padding: isMobile ? '36px 16px' : '56px 40px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '24px' : '36px', fontWeight: 800, textAlign: 'center', marginBottom: '8px', color: '#fff' }}>Ils vendent mieux avec PixGlow</h2>
          <p style={{ color: '#334155', textAlign: 'center', marginBottom: '36px', fontSize: '15px' }}>Rejoins des milliers de vendeurs Vinted</p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '14px' }}>
            {[
              { nom: 'Sophie M.', tag: 'Vendeuse Vinted', av: '👩', txt: "Mes vues ont doublé depuis que j'utilise PixGlow. Mes annonces font vraiment pro, les acheteurs font plus confiance." },
              { nom: 'Karim B.',  tag: 'Vendeur confirmé', av: '🧔', txt: "Simple, rapide, bluffant. Je prépare 20 fiches produit en 5 minutes. C'est devenu mon outil numéro 1." },
              { nom: 'Léa F.',   tag: 'Vendeuse Vestiaire', av: '👧', txt: "Enfin un outil pensé pour nous. Le fond blanc change tout pour les acheteurs, mes articles semblent neufs." },
            ].map((t,i) => (
              <div key={i} className="pg-card" style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '20px', padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `hsl(${230+i*30},45%,32%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{t.av}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '14px', margin: 0 }}>{t.nom}</p>
                    <p style={{ color: '#334155', fontSize: '12px', margin: 0 }}>{t.tag}</p>
                  </div>
                  <span style={{ color: '#f59e0b', fontSize: '12px' }}>⭐⭐⭐⭐⭐</span>
                </div>
                <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.65, fontStyle: 'italic', margin: 0 }}>"{t.txt}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ maxWidth: '680px', margin: '0 auto', padding: isMobile ? '36px 16px 60px' : '56px 40px 80px' }}>
        <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '24px' : '36px', fontWeight: 800, textAlign: 'center', marginBottom: '8px', color: '#fff' }}>Tarif simple et transparent</h2>
        <p style={{ color: '#334155', textAlign: 'center', marginBottom: '36px', fontSize: '15px' }}>Commence gratuit, paye seulement si tu en veux plus</p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
          <div className="pg-card" style={{ background: 'rgba(16,185,129,.04)', border: '1px solid rgba(16,185,129,.2)', borderRadius: '20px', padding: '28px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '32px', marginBottom: '10px' }}>🎁</p>
            <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '20px', fontWeight: 800, marginBottom: '6px', color: '#fff' }}>Gratuit</h3>
            <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '44px', fontWeight: 800, color: '#10b981', marginBottom: '4px' }}>5</div>
            <p style={{ color: '#10b981', fontWeight: 600, marginBottom: '14px', fontSize: '14px' }}>photos offertes</p>
            <p style={{ color: '#334155', fontSize: '13px', marginBottom: '22px', lineHeight: 1.6 }}>Sans inscription<br/>Sans carte bancaire</p>
            <button onClick={() => setPage('app')} className="pg-btn" style={{ width: '100%', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 800, cursor: 'pointer', fontSize: '15px', fontFamily: 'inherit' }}>Essayer maintenant →</button>
          </div>
          <div className="pg-card" style={{ background: 'linear-gradient(160deg,rgba(124,58,237,.1),rgba(79,70,229,.06))', border: '2px solid rgba(124,58,237,.4)', borderRadius: '20px', padding: '28px 24px', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: '100px', padding: '4px 16px', fontSize: '11px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>⭐ MEILLEURE OFFRE</div>
            <p style={{ fontSize: '32px', marginBottom: '10px' }}>💎</p>
            <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '20px', fontWeight: 800, marginBottom: '6px', color: '#fff' }}>Pro</h3>
            <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '44px', fontWeight: 800, color: '#a78bfa', marginBottom: '4px' }}>15€</div>
            <p style={{ color: '#a78bfa', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>100 crédits · 0,15€/photo</p>
            <p style={{ color: '#334155', fontSize: '12px', marginBottom: '22px' }}>Valables à vie · Sans abonnement</p>
            <button onClick={() => openAuth('register')} className="pg-btn" style={{ width: '100%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 800, cursor: 'pointer', fontSize: '15px', fontFamily: 'inherit' }}>Acheter les crédits →</button>
          </div>
        </div>
        <p style={{ textAlign: 'center', color: '#1a1a2e', fontSize: '13px', marginTop: '18px' }}>🔒 Paiement sécurisé Stripe · Aucune carte requise pour l'essai</p>
      </section>

      <Footer />
    </div>
  );

  /* ══ AIDE ══ */
  if (page === 'help') return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#e2e8f0' }}>
      <InjectCSS />
      <Nav />
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: isMobile ? '32px 16px' : '60px 40px' }}>
        <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '28px' : '40px', fontWeight: 800, marginBottom: '6px', color: '#fff' }}>Centre d'aide</h1>
        <p style={{ color: '#334155', marginBottom: '36px' }}>Tout ce que tu dois savoir sur PixGlow</p>
        {[
          { q: 'Comment fonctionnent les 5 photos gratuites ?', r: "Chaque adresse IP bénéficie de 5 traitements gratuits, sans inscription ni carte bancaire. Ils sont comptés sur nos serveurs et ne se réinitialisent jamais." },
          { q: 'Quel format de photo acceptez-vous ?', r: "JPG, PNG, WEBP et HEIC (iPhone). Taille max 15 Mo par photo." },
          { q: 'Que faire si ma photo ne se traite pas bien ?', r: "Les meilleurs résultats s'obtiennent avec un sujet clairement visible, bien éclairé. Essayez avec une autre photo ou un fond contrasté." },
          { q: "Quel tarif après l'essai gratuit ?", r: "1 crédit = 1 photo = 0,15€. Le pack 100 crédits est à 15€, valable à vie, sans abonnement." },
          { q: 'Comment fonctionnent les crédits ?', r: "Les crédits sont liés à votre compte email et valables à vie. Ils ne périment jamais." },
          { q: 'Est-ce que mes photos sont conservées ?', r: "Non. Vos photos sont supprimées automatiquement de nos serveurs après 24 heures." },
        ].map((item,i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', borderRadius: '14px', padding: '20px 22px', marginBottom: '10px' }}>
            <p style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: '8px', fontSize: '15px' }}>❓ {item.q}</p>
            <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.65, margin: 0 }}>{item.r}</p>
          </div>
        ))}
        <div style={{ background: 'rgba(124,58,237,.07)', border: '1px solid rgba(124,58,237,.18)', borderRadius: '14px', padding: '20px', marginTop: '18px', textAlign: 'center' }}>
          <p style={{ color: '#a78bfa', fontWeight: 700, marginBottom: '6px' }}>Une autre question ?</p>
          <p style={{ color: '#475569', fontSize: '14px', margin: 0 }}>Contactez-nous : <a href="mailto:support@pixglow.app" style={{ color: '#7c3aed' }}>support@pixglow.app</a></p>
        </div>
      </div>
    </div>
  );

  /* ══ APP ══ */
  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#e2e8f0' }}>
      <InjectCSS />
      <AuthModal show={showAuth} initialMode={authMode} onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} isMobile={isMobile} />
      <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFilesChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFilesChange} />
      <Nav showBack={true} />

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: isMobile ? '16px' : '32px 20px' }}>

        {/* Compteur */}
        {!isConnected && freeLeft !== null && (
          <div className="pg-anim" style={{ background: limitReached ? 'rgba(239,68,68,.06)' : 'rgba(255,255,255,.02)', border: `1px solid ${limitReached ? 'rgba(239,68,68,.2)' : 'rgba(255,255,255,.05)'}`, borderRadius: '16px', padding: '18px 22px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ color: '#334155', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: '4px' }}>Photos gratuites restantes</p>
              <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '38px', fontWeight: 800, color: limitReached ? '#ef4444' : '#10b981', lineHeight: 1 }}>{freeLeft}/5</div>
              {limitReached && <p style={{ color: '#f87171', fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>🔴 Vos 5 photos gratuites ont été utilisées</p>}
            </div>
            {limitReached && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => openAuth('register')} className="pg-btn" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>🚀 Créer un compte</button>
                <button onClick={() => openAuth('login')} className="pg-ghost" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8', borderRadius: '10px', padding: '11px 16px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>J'ai déjà un compte</button>
              </div>
            )}
          </div>
        )}

        {/* Zone upload / résultats */}
        <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', borderRadius: '20px', padding: isMobile ? '18px' : '28px', marginBottom: '14px' }}>
          {!hasResults ? (
            <>
              <div onClick={() => handleSelectClick(false)} onDragOver={e => { e.preventDefault(); e.currentTarget.style.background = 'rgba(124,58,237,.07)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,.5)'; }} onDragLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = ''; }} onDrop={e => { e.preventDefault(); e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = ''; if (!limitReached) { const evt = { target: { files: e.dataTransfer.files } }; handleFilesChange(evt); } }}
                style={{ border: `2px dashed ${limitReached ? 'rgba(239,68,68,.25)' : 'rgba(124,58,237,.28)'}`, borderRadius: '16px', padding: isMobile ? '32px 16px' : '48px 24px', textAlign: 'center', cursor: limitReached ? 'not-allowed' : 'pointer', marginBottom: '16px', background: limitReached ? 'rgba(239,68,68,.02)' : 'rgba(124,58,237,.02)', transition: 'all .2s' }}>
                <div style={{ fontSize: isMobile ? '42px' : '54px', marginBottom: '14px' }}>📸</div>
                <p style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '18px' : '21px', fontWeight: 700, marginBottom: '6px', color: '#e2e8f0' }}>{limitReached ? 'Limite atteinte' : "Choisir jusqu'à 5 photos"}</p>
                <p style={{ color: '#334155', fontSize: '13px', marginBottom: limitReached ? 0 : '14px' }}>{limitReached ? 'Créez un compte pour continuer' : 'JPG · PNG · WEBP · HEIC · Glissez vos photos ici'}</p>
                {!limitReached && isMobile && (
                  <button onClick={e => { e.stopPropagation(); handleSelectClick(true); }} style={{ marginTop: '4px', background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.25)', color: '#a78bfa', borderRadius: '10px', padding: '10px 18px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>📷 Prendre une photo</button>
                )}
              </div>

              {previews.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ color: '#475569', fontSize: '13px', marginBottom: '10px', fontWeight: 600 }}>{previews.length} photo{previews.length > 1 ? 's' : ''} sélectionnée{previews.length > 1 ? 's' : ''}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(previews.length, isMobile ? 3 : 5)},1fr)`, gap: '8px' }}>
                    {previews.map((src, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={src} alt={`Photo ${i+1}`} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '10px', border: '2px solid rgba(124,58,237,.2)', display: 'block' }} />
                        {loading && i < progress && <div className="pg-check" style={{ position: 'absolute', inset: 0, background: 'rgba(16,185,129,.25)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>✅</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && <div style={{ background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.22)', borderRadius: '12px', padding: '12px 16px', marginBottom: '14px', color: '#f87171', fontSize: '14px', textAlign: 'center' }}>⚠️ {error}</div>}

              {loading && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#475569', fontSize: '13px', fontWeight: 600 }}>Traitement IA en cours...</span>
                    <span style={{ color: '#7c3aed', fontWeight: 800, fontSize: '14px' }}>{progress}/{files.length}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: '100px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ background: 'linear-gradient(90deg,#7c3aed,#60a5fa,#10b981)', height: '100%', width: `${(progress/files.length)*100}%`, borderRadius: '100px', transition: 'width .4s ease' }} />
                  </div>
                  <p style={{ color: '#1e293b', fontSize: '12px', textAlign: 'center', marginTop: '6px' }}>~10–15 secondes par photo</p>
                </div>
              )}

              {!limitReached && (
                <button onClick={handleUpload} disabled={!files.length || loading} className={files.length && !loading ? 'pg-btn' : ''}
                  style={{ width: '100%', border: 'none', fontWeight: 800, borderRadius: '14px', padding: '18px', fontSize: isMobile ? '17px' : '19px', cursor: files.length && !loading ? 'pointer' : 'not-allowed', background: files.length && !loading ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,.03)', color: files.length && !loading ? '#fff' : '#1e293b', fontFamily: 'inherit', transition: 'all .2s' }}>
                  {loading ? `⏳ Photo ${progress}/${files.length} en cours...` : files.length ? `⚡ Améliorer ${files.length} photo${files.length > 1 ? 's' : ''}` : '← Sélectionnez des photos ci-dessus'}
                </button>
              )}
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 className="pg-check" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '18px', fontWeight: 800, color: '#10b981', margin: 0 }}>✅ {doneCount}/{results.length} photo{doneCount > 1 ? 's' : ''} améliorée{doneCount > 1 ? 's' : ''}</h3>
                {doneCount > 1 && <button onClick={handleDownloadAll} className="pg-btn" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>📥 Tout télécharger</button>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: '14px', marginBottom: '14px' }}>
                {results.map((r, i) => (
                  <div key={i} style={{ background: r.error ? 'rgba(239,68,68,.05)' : 'rgba(16,185,129,.03)', border: `1px solid ${r.error ? 'rgba(239,68,68,.18)' : 'rgba(16,185,129,.18)'}`, borderRadius: '14px', padding: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                      <div>
                        <p style={{ color: '#334155', fontSize: '10px', margin: '0 0 6px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Avant</p>
                        <img src={r.original} alt="Avant" style={{ width: '100%', borderRadius: '8px', display: 'block', aspectRatio: '1', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <p style={{ color: r.error ? '#f87171' : '#10b981', fontSize: '10px', margin: '0 0 6px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>{r.error ? 'Erreur' : 'Après ✅'}</p>
                        {r.error
                          ? <div style={{ width: '100%', aspectRatio: '1', background: 'rgba(239,68,68,.08)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>⚠️</div>
                          : <img src={r.url} alt="Après" style={{ width: '100%', borderRadius: '8px', background: '#fff', display: 'block', aspectRatio: '1', objectFit: 'cover' }} />}
                      </div>
                    </div>
                    {!r.error && <button onClick={() => handleDownload(r)} className="pg-btn" style={{ width: '100%', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>📥 Télécharger</button>}
                    {r.error   && <p style={{ color: '#f87171', fontSize: '12px', textAlign: 'center', margin: '6px 0 0' }}>{r.error}</p>}
                  </div>
                ))}
              </div>
              <button onClick={reset} className="pg-ghost" style={{ width: '100%', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', color: '#475569', borderRadius: '14px', padding: '14px', fontWeight: 700, cursor: 'pointer', fontSize: '15px', fontFamily: 'inherit' }}>🔄 Traiter de nouvelles photos</button>
            </>
          )}
        </div>

        {/* CTA bas */}
        {!isConnected ? (
          <div style={{ background: 'linear-gradient(160deg,rgba(124,58,237,.07),rgba(79,70,229,.04))', border: '1px solid rgba(124,58,237,.18)', borderRadius: '20px', padding: isMobile ? '22px 18px' : '30px 36px', textAlign: 'center' }}>
            <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '18px' : '22px', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>💎 Envie de plus de photos ?</h3>
            <p style={{ color: '#475569', fontSize: '14px', marginBottom: '20px', lineHeight: 1.65 }}>Créez un compte gratuit et achetez des crédits.<br/><strong style={{ color: '#e2e8f0' }}>100 photos à 15€ · Valables à vie · Paiement sécurisé</strong></p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => openAuth('register')} className="pg-btn" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px 24px', fontWeight: 800, cursor: 'pointer', fontSize: '15px', fontFamily: 'inherit' }}>🚀 Créer mon compte</button>
              <button onClick={() => openAuth('login')} className="pg-ghost" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8', borderRadius: '12px', padding: '14px 20px', fontWeight: 600, cursor: 'pointer', fontSize: '15px', fontFamily: 'inherit' }}>J'ai déjà un compte</button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <button onClick={handlePayment} className="pg-btn" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '14px', padding: isMobile ? '16px 32px' : '18px 52px', fontWeight: 800, fontSize: isMobile ? '17px' : '19px', cursor: 'pointer', fontFamily: 'inherit' }}>💳 Acheter 100 crédits — 15€</button>
            <p style={{ color: '#1a1a2e', fontSize: '12px', marginTop: '10px' }}>1 crédit = 1 photo = 0,15€ · Valables à vie · 🔒 Paiement sécurisé</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}