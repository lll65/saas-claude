import React, { useState, useRef, useEffect, useCallback } from 'react';

/* ─── PAGES LÉGALES ─── */
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
    <nav style={LS.nav}><span style={LS.logo}>✨ PixGlow</span><button onClick={onBack} style={LS.back}>← Retour</button></nav>
    <div style={LS.wrap}><h1 style={LS.h1}>{title}</h1><p style={{ ...LS.p, fontSize: '13px', color: '#334155', marginBottom: '28px' }}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>{children}</div>
  </div>
);

function MentionsLegales({ onBack }) {
  return (<LegalLayout title="Mentions légales" onBack={onBack}><h2 style={LS.h2}>Éditeur du site</h2><p style={LS.p}>Le site pixglow.app est édité par un entrepreneur individuel.<br/>Email : <a href="mailto:support@pixglow.app" style={{ color: '#7c3aed' }}>support@pixglow.app</a></p><h2 style={LS.h2}>Hébergement</h2><p style={LS.p}><strong style={{ color: '#e2e8f0' }}>Railway Corp</strong> — 548 Market St, San Francisco, CA 94104, USA</p><h2 style={LS.h2}>Propriété intellectuelle</h2><p style={LS.p}>L'ensemble du contenu de PixGlow est protégé par le droit d'auteur. Toute reproduction sans autorisation est interdite.</p><h2 style={LS.h2}>Traitement des paiements</h2><p style={LS.p}>Les paiements sont traités par <strong style={{ color: '#e2e8f0' }}>Stripe Inc.</strong>, certifié PCI-DSS. PixGlow ne stocke aucune donnée bancaire.</p></LegalLayout>);
}

function PolitiqueConfidentialite({ onBack }) {
  return (<LegalLayout title="Politique de confidentialité" onBack={onBack}><p style={{ ...LS.p, color: '#334155' }}>Conformément au RGPD</p><h2 style={LS.h2}>Données collectées</h2><p style={LS.p}>Adresse email, mot de passe chiffré, adresse IP (quota gratuit), images uploadées (supprimées après 24h).</p><h2 style={LS.h2}>Durée de conservation</h2><p style={LS.p}>Images uploadées : <strong style={{ color: '#e2e8f0' }}>supprimées après 24 heures</strong> · Données IP : 30 jours</p><h2 style={LS.h2}>Vos droits (RGPD)</h2><p style={LS.p}>Contact : <a href="mailto:support@pixglow.app" style={{ color: '#7c3aed' }}>support@pixglow.app</a></p><h2 style={LS.h2}>Cookies</h2><p style={LS.p}>Aucun cookie de tracking. Un token d'authentification est stocké localement.</p></LegalLayout>);
}

function CGV({ onBack }) {
  return (<LegalLayout title="Conditions Générales de Vente" onBack={onBack}><h2 style={LS.h2}>Service proposé</h2><p style={LS.p}>PixGlow est un service de traitement automatique d'images destiné aux vendeurs e-commerce.</p><h2 style={LS.h2}>Tarifs</h2><p style={LS.p}><strong style={{ color: '#e2e8f0' }}>Offre gratuite :</strong> 5 images par adresse IP.<br/><strong style={{ color: '#e2e8f0' }}>Pack Pro :</strong> 100 crédits pour 15€ TTC. Crédits valables à vie.</p><h2 style={LS.h2}>Droit de rétractation</h2><p style={LS.p}>Les crédits non utilisés peuvent être remboursés dans les 14 jours à <a href="mailto:support@pixglow.app" style={{ color: '#7c3aed' }}>support@pixglow.app</a>.</p></LegalLayout>);
}

const API_URL = "https://web-production-f1129.up.railway.app";
const MAX_SIMULTANEOUS = 5;

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=DM+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  body { background: #0a0a0f; font-family: 'DM Sans', system-ui, sans-serif; margin: 0; padding: 0;}
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
  .pg-slide-up { animation: pg-fadeup .4s ease both; }
  .pg-glow { animation: pg-glow 2.4s infinite; }
  @keyframes pg-glow { 0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,.35);} 50%{box-shadow:0 0 0 12px rgba(124,58,237,0);} }
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

/* ══ BEFORE/AFTER SLIDER (CORRIGÉ POUR MOBILE) ══ */
function BeforeAfterSlider({ beforeSrc, afterSrc, beforeLabel = 'Avant', afterLabel = 'Après ✅', height = 340, landscape = false }) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef(null);

  const getPos = (clientX) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return Math.round((x / rect.width) * 100);
  };

  const onMouseDown = (e) => { e.preventDefault(); setDragging(true); };
  const onMouseMove = useCallback((e) => { if (dragging) setPos(getPos(e.clientX)); }, [dragging]);
  const onMouseUp   = useCallback(() => setDragging(false), []);
  const onTouchMove = useCallback((e) => { if (dragging) setPos(getPos(e.touches[0].clientX)); }, [dragging]);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [onMouseMove, onMouseUp, onTouchMove]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: landscape ? 0 : `${height}px`, paddingBottom: landscape ? '56.25%' : 0, borderRadius: '14px', overflow: 'hidden', cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none', touchAction: 'none', background: '#f8f8f8' }}>
      {/* AFTER */}
      <img src={afterSrc} alt="Après" draggable={false} loading="eager"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', background: '#ffffff' }} />
      {/* BEFORE (Correction Z-index et width mobile) */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', width: `${pos}%`, zIndex: 2 }}>
        <img src={beforeSrc} alt="Avant" draggable={false} loading="eager"
          style={{ position: 'absolute', inset: 0, width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100vw', height: '100%', objectFit: 'contain', maxWidth: 'none', background: '#e8e8e8' }} />
      </div>
      {/* Labels */}
      <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', color: '#f87171', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '1px', zIndex: 3 }}>
        📷 {beforeLabel}
      </div>
      <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(16,185,129,.75)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '1px', zIndex: 3 }}>
        {afterLabel}
      </div>
      {/* Divider */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${pos}%`, width: '2px', background: '#fff', transform: 'translateX(-50%)', boxShadow: '0 0 8px rgba(0,0,0,.5)', pointerEvents: 'none', zIndex: 4 }} />
      {/* Handle */}
      <div onMouseDown={onMouseDown} onTouchStart={(e) => { setDragging(true); setPos(getPos(e.touches[0].clientX)); }}
        style={{ position: 'absolute', top: '50%', left: `${pos}%`, transform: 'translate(-50%,-50%)', width: '44px', height: '44px', borderRadius: '50%', background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: dragging ? 'grabbing' : 'grab', zIndex: 10, border: '2px solid rgba(124,58,237,.4)' }}>
        <span style={{ fontSize: '16px', userSelect: 'none' }}>⇔</span>
      </div>
    </div>
  );
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
        <input className="pg-input" type="email" placeholder="Votre adresse email" value={email} onChange={e => setEmail(e.target.value)} style={{ marginBottom: '12px', marginTop: '16px' }} />
        <input className="pg-input" type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} style={{ marginBottom: '16px' }} />
        {errMsg && <div style={{ color: '#f87171', marginBottom: '14px', fontSize: '13px' }}>⚠️ {errMsg}</div>}
        <button className="pg-btn pg-glow" disabled={loading} onClick={handleSubmit} style={{ width: '100%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '12px', padding: '15px', fontWeight: 800, fontSize: '16px', cursor: 'pointer' }}>
          {loading ? '⏳...' : mode === 'login' ? 'Me connecter' : 'Créer mon compte'}
        </button>
      </div>
    </div>
  );
}

/* ══ COMPOSANT PRINCIPAL ══ */
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
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const getToken = () => localStorage.getItem('pg_token');

  useEffect(() => { 
    const fn = () => setIsMobile(window.innerWidth < 768); 
    window.addEventListener('resize', fn); 
    return () => window.removeEventListener('resize', fn); 
  }, []);

  // ✅ CORRECTIF 1 : NETTOYAGE DE LA MÉMOIRE SUR MOBILE
  useEffect(() => {
    return () => {
      previews.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previews]);

  // RÉCUPÉRATION DU COMPTE ET GESTION PAIEMENT
  useEffect(() => {
    const token = getToken(); 
    const savedEmail = localStorage.getItem('pg_email');
    if (token && savedEmail) {
      setUserEmail(savedEmail); setIsConnected(true);
      fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => { if (d.credits !== undefined) setCredits(d.credits); })
        .catch(() => {});
    }
    
    fetch(`${API_URL}/free-remaining`)
      .then(r => r.json())
      .then(d => { if (d.remaining !== undefined) { setFreeLeft(d.remaining); localStorage.setItem('pg_free', d.remaining); } })
      .catch(() => setFreeLeft(parseInt(localStorage.getItem('pg_free') || '5')));
      
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success' && token) {
      setTimeout(() => { 
        fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.json())
          .then(d => { 
            if (d.credits !== undefined) { 
              setCredits(d.credits); 
              alert('✅ Paiement réussi ! Tes crédits ont été ajoutés.'); 
            } 
          });
      }, 2000);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // ✅ CORRECTIF 2 : CRÉATION PROPRE DES URLS DE PREVIEW
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      
      setFiles(prev => [...prev, ...selectedFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
      
      // On vide l'input pour pouvoir sélectionner la même photo à nouveau si besoin
      if (e.target) e.target.value = null;
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, i) => i !== indexToRemove));
    setPreviews(previews.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div style={LS.page}>
      <InjectCSS />
      
      {/* NAVBAR BAsique */}
      <nav style={LS.nav}>
        <span style={LS.logo}>✨ PixGlow</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isConnected ? (
            <>
              <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '14px' }}>{credits} Crédits</span>
              <button className="pg-back" onClick={() => { localStorage.clear(); window.location.reload(); }}>Déco</button>
            </>
          ) : (
            <button className="pg-btn" style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px' }} onClick={() => setShowAuth(true)}>Connexion</button>
          )}
        </div>
      </nav>

      <div style={LS.wrap}>
        {/* ZONE UPLOAD RESPONSIVE */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(124,58,237,0.4)', borderRadius: '16px', padding: '30px 20px', textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: 'white', margin: '0 0 16px 0', fontSize: '18px' }}>Ajoute tes photos</h2>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="pg-btn" onClick={() => fileInputRef.current.click()} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🖼️ Galerie
            </button>
            {isMobile && (
              <button className="pg-btn" onClick={() => cameraInputRef.current.click()} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📸 Appareil photo
              </button>
            )}
          </div>

          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple style={{ display: 'none' }} />
          <input type="file" ref={cameraInputRef} onChange={handleFileChange} accept="image/*" capture="environment" style={{ display: 'none' }} />
        </div>

        {/* AFFICHAGE DES PREVIEWS (Correction image cassée) */}
        {previews.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '12px' }}>{previews.length} photo(s) sélectionnée(s)</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
              {previews.map((src, index) => (
                <div key={index} className="pg-anim" style={{ position: 'relative', background: '#1a1a24', borderRadius: '12px', overflow: 'hidden', aspectRatio: '4/5' }}>
                  <img 
                    src={src} 
                    alt={`Preview ${index}`} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <button onClick={() => removeFile(index)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button>
                </div>
              ))}
            </div>
            
            <button className="pg-btn pg-glow" style={{ width: '100%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', marginTop: '16px', cursor: 'pointer' }}>
              ⚡ Améliorer {previews.length} photo(s)
            </button>
          </div>
        )}
      </div>

      <AuthModal 
        show={showAuth} 
        initialMode={authMode} 
        onClose={() => setShowAuth(false)} 
        isMobile={isMobile}
        onSuccess={(email, credits) => { 
          setUserEmail(email); 
          setCredits(credits); 
          setIsConnected(true); 
          setShowAuth(false); 
        }} 
      />
    </div>
  );
}