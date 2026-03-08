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
  @keyframes pg-slide-up { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
  .pg-slide-up { animation: pg-slide-up .4s ease both; }
  @keyframes pg-pulse-score { 0%,100%{opacity:1;} 50%{opacity:.7;} }
  .pg-pulse { animation: pg-pulse-score 2s infinite; }
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

/* ══ BEFORE/AFTER SLIDER ══ */
function BeforeAfterSlider({ beforeSrc, afterSrc, beforeLabel = 'Avant', afterLabel = 'Après ✅', height = 340 }) {
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
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: `${height}px`, borderRadius: '14px', overflow: 'hidden', cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none', touchAction: 'none' }}>
      {/* AFTER (full background) */}
      <img src={afterSrc} alt="Après" draggable={false}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', background: '#fff' }} />
      {/* BEFORE (clipped left portion) */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', width: `${pos}%` }}>
        <img src={beforeSrc} alt="Avant" draggable={false}
          style={{ position: 'absolute', inset: 0, width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%', height: '100%', objectFit: 'cover', maxWidth: 'none' }} />
      </div>
      {/* Labels */}
      <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', color: '#f87171', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        📷 {beforeLabel}
      </div>
      <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(16,185,129,.75)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {afterLabel}
      </div>
      {/* Divider line */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${pos}%`, width: '2px', background: '#fff', transform: 'translateX(-50%)', boxShadow: '0 0 8px rgba(0,0,0,.5)', pointerEvents: 'none' }} />
      {/* Handle */}
      <div onMouseDown={onMouseDown} onTouchStart={(e) => { setDragging(true); setPos(getPos(e.touches[0].clientX)); }}
        style={{ position: 'absolute', top: '50%', left: `${pos}%`, transform: 'translate(-50%,-50%)', width: '44px', height: '44px', borderRadius: '50%', background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: dragging ? 'grabbing' : 'grab', zIndex: 10, border: '2px solid rgba(124,58,237,.4)' }}>
        <span style={{ fontSize: '16px', userSelect: 'none' }}>⇔</span>
      </div>
      {/* Bottom hint */}
      <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)', color: 'rgba(255,255,255,.7)', fontSize: '11px', padding: '3px 12px', borderRadius: '100px', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
        ← Glisse pour comparer →
      </div>
    </div>
  );
}

/* ══ AI BOOST VINTED PANEL ══ */
function VintedBoostPanel({ imageUrl, isConnected, onUpgrade }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const generateBoost = async () => {
    if (!isConnected) { onUpgrade(); return; }
    setLoading(true);
    setError(null);
    try {
      // Appel via le backend FastAPI (évite CORS + clé API sécurisée)
      const token = localStorage.getItem('pg_token');
      const response = await fetch(`${API_URL}/generate-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ image_url: imageUrl })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || `Erreur ${response.status}`);
      }
      const data = await response.json();
      setResult(data);
    } catch (e) {
      setError(`⚠️ ${e.message || 'Erreur génération. Réessaie !'}`);
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `${result.titre}\n\n${result.description}\n\n${result.hashtags}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ marginTop: '12px', borderRadius: '12px', border: '1px solid rgba(124,58,237,.25)', overflow: 'hidden' }}>
      <button onClick={() => { setOpen(!open); if (!open && !result) generateBoost(); }}
        style={{ width: '100%', background: open ? 'rgba(124,58,237,.12)' : 'rgba(124,58,237,.06)', border: 'none', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontFamily: 'inherit' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a78bfa', fontWeight: 700, fontSize: '14px' }}>
          <span>🤖</span> Prêt pour Vinted ? — Titre + Description AI
          {!isConnected && <span style={{ background: 'rgba(124,58,237,.2)', color: '#c4b5fd', fontSize: '10px', padding: '2px 8px', borderRadius: '100px', fontWeight: 800 }}>PRO</span>}
        </span>
        <span style={{ color: '#64748b', fontSize: '12px' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="pg-slide-up" style={{ padding: '16px', background: 'rgba(10,8,20,.6)' }}>
          {!isConnected ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>🔒 Fonctionnalité Pro — Crée un compte pour générer les textes AI</p>
              <button onClick={onUpgrade} className="pg-btn" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>🚀 Créer un compte gratuit</button>
            </div>
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚡</div>
              <p style={{ color: '#a78bfa', fontSize: '14px', fontWeight: 600 }}>Génération AI en cours...</p>
              <p style={{ color: '#334155', fontSize: '12px' }}>Analyse de ta photo · Optimisation Vinted</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#f87171', fontSize: '14px', marginBottom: '8px' }}>⚠️ {error}</p>
              <button onClick={generateBoost} style={{ background: 'rgba(124,58,237,.15)', border: '1px solid rgba(124,58,237,.3)', color: '#a78bfa', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '13px' }}>↺ Réessayer</button>
            </div>
          ) : result ? (
            <div>
              {/* Score */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.2)', borderRadius: '10px', padding: '10px 14px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#475569', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 2px' }}>Score potentiel vues</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,.06)', borderRadius: '100px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${result.score}%`, background: result.score >= 80 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#f59e0b,#fbbf24)', borderRadius: '100px', transition: 'width 1s ease' }} />
                    </div>
                    <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: '18px', color: result.score >= 80 ? '#10b981' : '#f59e0b' }}>{result.score}/100</span>
                  </div>
                </div>
              </div>

              {/* Titre */}
              <div style={{ marginBottom: '10px' }}>
                <p style={{ color: '#334155', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Titre (Vinted)</p>
                <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '8px', padding: '10px 12px' }}>
                  <p style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 600, margin: 0 }}>{result.titre}</p>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '10px' }}>
                <p style={{ color: '#334155', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Description</p>
                <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '8px', padding: '10px 12px' }}>
                  <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>{result.description}</p>
                </div>
              </div>

              {/* Hashtags */}
              <div style={{ marginBottom: '14px' }}>
                <p style={{ color: '#334155', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Hashtags</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {result.hashtags.split(' ').filter(Boolean).map((tag, i) => (
                    <span key={i} style={{ background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.2)', color: '#c4b5fd', fontSize: '12px', padding: '3px 10px', borderRadius: '100px', fontWeight: 500 }}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* Boutons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={handleCopy} className="pg-btn" style={{ flex: 1, background: copied ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', minWidth: '140px' }}>
                  {copied ? '✅ Copié !' : '📋 Copier pour Vinted'}
                </button>
                <button onClick={generateBoost} className="pg-ghost" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#64748b', borderRadius: '10px', padding: '11px 14px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>↺ Regénérer</button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

/* ══ UPSELL BANNER ══ */
function UpsellBanner({ freeLeft, onRegister, onLogin }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || freeLeft === null || freeLeft > 1) return null;
  return (
    <div className="pg-slide-up" style={{ background: 'linear-gradient(135deg,rgba(124,58,237,.12),rgba(16,185,129,.06))', border: '1px solid rgba(124,58,237,.3)', borderRadius: '16px', padding: '18px 20px', marginBottom: '14px', position: 'relative' }}>
      <button onClick={() => setDismissed(true)} style={{ position: 'absolute', top: '10px', right: '12px', background: 'none', border: 'none', color: '#334155', cursor: 'pointer', fontSize: '16px', fontFamily: 'inherit' }}>✕</button>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <p style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: '15px', color: '#fff', marginBottom: '4px' }}>
            {freeLeft === 0 ? '🔴 Limite atteinte' : '⚡ Dernière photo gratuite !'}
          </p>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '8px', lineHeight: 1.5 }}>
            87% des vendeurs <strong style={{ color: '#10b981' }}>doublent leurs vues</strong> avec Pro — 15€ pour 100 crédits à vie
          </p>
          <p style={{ color: '#475569', fontSize: '12px' }}>+38% de vues en moyenne par annonce selon nos utilisateurs</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          <button onClick={onRegister} className="pg-btn" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 18px', fontWeight: 800, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>🚀 Créer un compte</button>
          <button onClick={onLogin} className="pg-ghost" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: '#64748b', borderRadius: '10px', padding: '11px 12px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>Connexion</button>
        </div>
      </div>
    </div>
  );
}

/* ══ STICKY BOTTOM BAR (mobile) ══ */
function StickyBottomBar({ show, doneCount, onDownloadAll, onReset, onBuyCredits, isConnected, isMobile }) {
  if (!show || !isMobile) return null;
  return (
    <div className="pg-slide-up" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, background: 'rgba(10,8,20,.97)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(124,58,237,.2)', padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
      {doneCount > 0 && (
        <button onClick={onDownloadAll} className="pg-btn" style={{ flex: 2, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 800, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>
          📥 Télécharger ({doneCount})
        </button>
      )}
      <button onClick={onReset} className="pg-ghost" style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#94a3b8', borderRadius: '12px', padding: '14px', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>🔄</button>
      <button onClick={onBuyCredits} className="pg-btn" style={{ flex: 2, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 800, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>💎 Crédits</button>
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
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '22px' }}>{mode === 'login' ? 'Accédez à vos crédits et vos photos' : 'Gratuit · Crédits sauvegardés à vie · Titre+Description AI'}</p>
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
        <p style={{ color: '#334155', fontSize: '11px', textAlign: 'center', marginTop: '14px' }}>🔒 Paiement sécurisé Stripe · Données protégées RGPD</p>
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
    // Génère les previews avec fallback canvas pour HEIC/formats exotiques
    Promise.all(chosen.map(f => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = ev => {
        const dataUrl = ev.target.result;
        // Vérifie que l'image se charge correctement
        const img = new Image();
        img.onload = () => resolve(dataUrl);
        img.onerror = () => {
          // Fallback: essayer via URL.createObjectURL + canvas
          const url = URL.createObjectURL(f);
          const img2 = new Image();
          img2.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(img2.width, 800);
            canvas.height = Math.round(img2.height * (canvas.width / img2.width));
            canvas.getContext('2d').drawImage(img2, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          };
          img2.onerror = () => { URL.revokeObjectURL(url); resolve(dataUrl); };
          img2.src = url;
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(f);
    }))).then(setPreviews);
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
                {credits !== null && <span style={{ background: 'rgba(124,58,237,.15)', color: '#a78bfa', padding: '4px 10px', borderRadius: '100px', fontWeight: 700, fontSize: isMobile ? '12px' : '13px', whiteSpace: 'nowrap' }}>💎 {credits}</span>}
                <button onClick={handlePayment} className="pg-btn" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: isMobile ? '8px 12px' : '8px 16px', fontWeight: 700, cursor: 'pointer', fontSize: isMobile ? '12px' : '13px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>+ Crédits</button>
                <button onClick={handleLogout} className="pg-ghost" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: '#94a3b8', borderRadius: '10px', padding: isMobile ? '8px 10px' : '8px 12px', fontWeight: 600, cursor: 'pointer', fontSize: isMobile ? '12px' : '13px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Déco</button>
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

      {/* HERO — copy améliorée SEO */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '52px 16px 36px' : '90px 40px 56px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '350px', background: 'radial-gradient(ellipse, rgba(124,58,237,.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="pg-anim" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.28)', borderRadius: '100px', padding: '6px 16px 6px 10px', marginBottom: '24px', fontSize: '12px', color: '#a78bfa', fontWeight: 600 }}>
            <span style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: '100px', padding: '2px 10px', color: '#fff', fontSize: '11px', fontWeight: 800 }}>NEW</span>
            🛍️ Le spécialiste photo pour vendeurs Vinted, Leboncoin & Vestiaire
          </div>
          {/* Title SEO-optimisé */}
          <h1 className="pg-hero" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '40px' : '72px', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-1.5px', color: '#fff', marginBottom: '20px' }}>
            Double tes vues Vinted<br/>
            <span style={{ background: 'linear-gradient(135deg,#7c3aed,#60a5fa,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>fond blanc + description AI</span><br/>
            en 3 secondes
          </h1>
          <p className="pg-anim-2" style={{ fontSize: isMobile ? '16px' : '20px', color: '#475569', maxWidth: '580px', margin: '0 auto 10px', lineHeight: 1.65 }}>
            Supprimer fond Leboncoin · Améliorer photo Vinted · Annonce pro occasion en 1 clic
          </p>
          {/* NEW : AI description badge */}
          <div className="pg-anim-2" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', borderRadius: '100px', padding: '5px 14px', marginBottom: '28px', fontSize: '12px', color: '#34d399', fontWeight: 600 }}>
            🤖 Nouveau : Titre + Description + Hashtags générés par IA pour chaque photo
          </div>
          <div className="pg-anim-3" style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '36px' }}>
            <button onClick={() => setPage('app')} className="pg-btn pg-glow" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '14px', padding: isMobile ? '16px 24px' : '18px 36px', fontWeight: 800, cursor: 'pointer', fontSize: isMobile ? '16px' : '18px', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '10px', maxWidth: isMobile ? 'calc(100vw - 40px)' : 'none', boxSizing: 'border-box' }}>
              ⚡ Essayer gratuitement
              <span style={{ background: 'rgba(255,255,255,.18)', borderRadius: '100px', padding: '2px 10px', fontSize: '12px', fontWeight: 700 }}>5 photos offertes</span>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex' }}>
              {[
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=56&h=56&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=56&h=56&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=56&h=56&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=56&h=56&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=56&h=56&fit=crop&crop=face',
              ].map((url, i) => (
                <img key={i} src={url} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid #0a0a0f', marginLeft: i ? '-8px' : '0', objectFit: 'cover', display: 'block' }} />
              ))}
            </div>
            <span style={{ fontSize: '13px', color: '#475569' }}><strong style={{ color: '#e2e8f0' }}>+18 742 vendeurs</strong> utilisent PixGlow</span>
            <span style={{ color: '#1e293b' }}>·</span>
            <span style={{ fontSize: '13px', color: '#475569' }}>⭐ <strong style={{ color: '#e2e8f0' }}>4.9/5</strong> — 1 234 avis</span>
          </div>
        </div>
      </section>

      {/* AVANT/APRÈS SLIDER */}
      <section style={{ maxWidth: '820px', margin: '0 auto', padding: isMobile ? '0 16px 52px' : '0 40px 72px' }}>
        <div style={{ background: 'linear-gradient(160deg,#111118,#0d0d18)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '24px', padding: isMobile ? '20px' : '32px' }}>
          <p style={{ color: '#475569', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', marginBottom: '8px' }}>Résultat en temps réel · améliorer photo Vinted</p>
          <p style={{ color: '#334155', fontSize: '12px', textAlign: 'center', marginBottom: '20px' }}>Glisse le curseur pour voir la transformation</p>

          {/* SLIDER PRINCIPAL */}
          <BeforeAfterSlider
            beforeSrc="data:image/jpeg;base64,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"
            afterSrc="data:image/jpeg;base64,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"
            beforeLabel="Fond encombré"
            afterLabel="Fond blanc PixGlow ✨"
            height={isMobile ? 260 : 340}
          />

          {/* Badges résultat */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '14px', marginBottom: '20px' }}>
            <span style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', fontSize: '12px', padding: '4px 12px', borderRadius: '8px', fontWeight: 600 }}>✗ Fond encombré · Lumière sombre</span>
            <span style={{ fontSize: '14px', color: '#475569' }}>→</span>
            <span style={{ background: 'rgba(16,185,129,.1)', color: '#10b981', fontSize: '12px', padding: '4px 12px', borderRadius: '8px', fontWeight: 600 }}>✓ Fond blanc pur · +42% vues · vendu en 48h</span>
          </div>

          {/* AI Boost preview */}
          <div style={{ background: 'rgba(124,58,237,.05)', border: '1px solid rgba(124,58,237,.15)', borderRadius: '12px', padding: '14px 16px' }}>
            <p style={{ color: '#a78bfa', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>🤖 Description AI générée automatiquement</p>
            <p style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Veste zippée vintage — comme neuve ✨</p>
            <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>🧥 Veste zippée taille M en parfait état ! Coupe moderne, très bon état. Portée 3x. Idéal hiver/mi-saison 🍂 Expédition rapide 📦</p>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {['#veste','#vintedfrançais','#modeoccasion','#jacketvintage','#modeautomne'].map((t,i) => (
                <span key={i} style={{ background: 'rgba(124,58,237,.1)', color: '#c4b5fd', fontSize: '11px', padding: '2px 8px', borderRadius: '100px' }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: 'linear-gradient(90deg,rgba(124,58,237,.06),rgba(16,185,129,.04),rgba(96,165,250,.06))', borderTop: '1px solid rgba(255,255,255,.04)', borderBottom: '1px solid rgba(255,255,255,.04)', padding: isMobile ? '20px 16px' : '24px 40px' }}>
        <div className="pg-stats" style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', textAlign: 'center' }}>
          {[{v:'+18 742',l:'vendeurs actifs',c:'#7c3aed'},{v:'+38%',l:'vues par annonce',c:'#10b981'},{v:'3 sec',l:'par photo',c:'#60a5fa'},{v:'4.9/5',l:'1 234 avis',c:'#f59e0b'}].map((s,i) => (
            <div key={i} style={{ padding: '14px 8px' }}>
              <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '20px' : '28px', fontWeight: 800, color: s.c, marginBottom: '4px' }}>{s.v}</div>
              <div style={{ fontSize: '12px', color: '#334155', fontWeight: 500 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: isMobile ? '52px 16px' : '80px 40px' }}>
        <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '26px' : '40px', fontWeight: 800, textAlign: 'center', marginBottom: '8px', color: '#fff', letterSpacing: '-.5px' }}>Tout ce qu'il te faut pour vendre plus vite</h2>
        <p style={{ color: '#334155', textAlign: 'center', marginBottom: '44px', fontSize: '16px' }}>Le seul outil pensé 100% pour les vendeurs Vinted/Leboncoin français</p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '16px' }}>
          {[
            { icon: '🎨', titre: 'Fond blanc parfait', desc: "Suppression IA du fond en 1 clic. Ton article ressort comme sur un site e-commerce pro. Idéal pour supprimer fond Leboncoin.", col: '124,58,237' },
            { icon: '🤖', titre: 'Description AI pour Vinted', desc: "Titre, description émoji-optimisée et hashtags générés automatiquement par IA. Plus jamais la page blanche.", col: '96,165,250', badge: 'NOUVEAU' },
            { icon: '⚡', titre: "Jusqu'à 5 photos à la fois", desc: "Traitement en batch — prépare toute une annonce en moins d'une minute depuis ton téléphone.", col: '16,185,129' },
          ].map((f,i) => (
            <div key={i} className="pg-card" style={{ background: 'rgba(255,255,255,.02)', border: `1px solid rgba(${f.col},.16)`, borderRadius: '20px', padding: '28px 24px', position: 'relative' }}>
              {f.badge && <div style={{ position: 'absolute', top: '16px', right: '16px', background: `rgba(${f.col},.2)`, color: `rgb(${f.col})`, fontSize: '10px', fontWeight: 800, padding: '3px 10px', borderRadius: '100px' }}>{f.badge}</div>}
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
          <p style={{ color: '#334155', textAlign: 'center', marginBottom: '36px', fontSize: '15px' }}>Rejoins +18 742 vendeurs Vinted et Leboncoin</p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '14px' }}>
            {[
              { nom: 'Sophie M.', tag: 'Vendeuse Vinted · 312 ventes', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face', txt: "Mes vues ont doublé depuis que j'utilise PixGlow. Et la description AI me fait gagner 10 min par annonce !" },
              { nom: 'Karim B.',  tag: 'Vendeur confirmé · 180 ventes', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face', txt: "Simple, rapide, bluffant. Je prépare 20 fiches produit en 5 minutes. Le titre AI est souvent meilleur que ce que j'aurais écrit." },
              { nom: 'Léa F.',   tag: 'Vendeuse Vestiaire · 95 ventes',  avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&h=80&fit=crop&crop=face', txt: "Enfin un outil pensé pour nous. Le fond blanc + la description IA = mes annonces se vendent en 24h maintenant." },
            ].map((t,i) => (
              <div key={i} className="pg-card" style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '20px', padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <img src={t.avatar} alt={t.nom} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(124,58,237,.25)', flexShrink: 0, display: 'block' }} />
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
            <p style={{ color: '#334155', fontSize: '12px', marginBottom: '10px' }}>Valables à vie · Sans abonnement</p>
            {/* NEW : AI feature highlight */}
            <div style={{ background: 'rgba(96,165,250,.08)', border: '1px solid rgba(96,165,250,.15)', borderRadius: '8px', padding: '8px 10px', marginBottom: '18px' }}>
              <p style={{ color: '#93c5fd', fontSize: '12px', fontWeight: 600, margin: 0 }}>🤖 Inclus : Description AI illimitée</p>
            </div>
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
          { q: 'Comment fonctionne la description AI ?', r: "Après traitement de ta photo, un bouton \"Prêt pour Vinted ?\" apparaît. En 1 clic, l'IA génère titre, description avec emojis et hashtags optimisés pour Vinted et Leboncoin. Fonctionnalité réservée aux comptes créés." },
          { q: 'Quel format de photo acceptez-vous ?', r: "JPG, PNG, WEBP et HEIC (iPhone). Taille max 15 Mo par photo." },
          { q: "Quel tarif après l'essai gratuit ?", r: "1 crédit = 1 photo = 0,15€. Le pack 100 crédits est à 15€, valable à vie, sans abonnement. La description AI est incluse avec chaque crédit." },
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
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#e2e8f0', paddingBottom: isMobile && hasResults ? '80px' : '0' }}>
      <InjectCSS />
      <AuthModal show={showAuth} initialMode={authMode} onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} isMobile={isMobile} />
      <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFilesChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFilesChange} />
      <Nav showBack={true} />

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: isMobile ? '16px' : '32px 20px' }}>

        {/* Upsell Banner (freeLeft <= 1) */}
        <UpsellBanner freeLeft={freeLeft} onRegister={() => openAuth('register')} onLogin={() => openAuth('login')} />

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
              <div onClick={() => handleSelectClick(false)}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.background = 'rgba(124,58,237,.07)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,.5)'; }}
                onDragLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = ''; }}
                onDrop={e => { e.preventDefault(); e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = ''; if (!limitReached) { const evt = { target: { files: e.dataTransfer.files } }; handleFilesChange(evt); } }}
                style={{ border: `2px dashed ${limitReached ? 'rgba(239,68,68,.25)' : 'rgba(124,58,237,.28)'}`, borderRadius: '16px', padding: isMobile ? '32px 16px' : '48px 24px', textAlign: 'center', cursor: limitReached ? 'not-allowed' : 'pointer', marginBottom: '16px', background: limitReached ? 'rgba(239,68,68,.02)' : 'rgba(124,58,237,.02)', transition: 'all .2s' }}>
                <div style={{ fontSize: isMobile ? '42px' : '54px', marginBottom: '14px' }}>📸</div>
                <p style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '18px' : '21px', fontWeight: 700, marginBottom: '6px', color: '#e2e8f0' }}>{limitReached ? 'Limite atteinte' : "Choisir jusqu'à 5 photos"}</p>
                <p style={{ color: '#334155', fontSize: '13px', marginBottom: limitReached ? 0 : '14px' }}>{limitReached ? 'Créez un compte pour continuer' : 'JPG · PNG · WEBP · HEIC · Glissez vos photos ici'}</p>
                {!limitReached && isMobile && (
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                    <button onClick={e => { e.stopPropagation(); handleSelectClick(false); }} style={{ background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.25)', color: '#a78bfa', borderRadius: '10px', padding: '10px 16px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>🖼️ Galerie</button>
                    <button onClick={e => { e.stopPropagation(); handleSelectClick(true); }} style={{ background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.25)', color: '#a78bfa', borderRadius: '10px', padding: '10px 16px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>📷 Appareil photo</button>
                  </div>
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
                    {!r.error && (
                      <>
                        <button onClick={() => handleDownload(r)} className="pg-btn" style={{ width: '100%', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit', marginBottom: '0' }}>📥 Télécharger</button>
                        <VintedBoostPanel
                          imageUrl={r.url}
                          isConnected={isConnected}
                          onUpgrade={() => openAuth('register')}
                        />
                      </>
                    )}
                    {r.error && <p style={{ color: '#f87171', fontSize: '12px', textAlign: 'center', margin: '6px 0 0' }}>{r.error}</p>}
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
            <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '18px' : '22px', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>💎 Envie de plus de photos + descriptions AI ?</h3>
            <p style={{ color: '#475569', fontSize: '14px', marginBottom: '20px', lineHeight: 1.65 }}>Créez un compte gratuit et achetez des crédits.<br/><strong style={{ color: '#e2e8f0' }}>100 photos + descriptions AI à 15€ · Valables à vie · Paiement sécurisé</strong></p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => openAuth('register')} className="pg-btn" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px 24px', fontWeight: 800, cursor: 'pointer', fontSize: '15px', fontFamily: 'inherit' }}>🚀 Créer mon compte</button>
              <button onClick={() => openAuth('login')} className="pg-ghost" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8', borderRadius: '12px', padding: '14px 20px', fontWeight: 600, cursor: 'pointer', fontSize: '15px', fontFamily: 'inherit' }}>J'ai déjà un compte</button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <button onClick={handlePayment} className="pg-btn" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '14px', padding: isMobile ? '16px 32px' : '18px 52px', fontWeight: 800, fontSize: isMobile ? '17px' : '19px', cursor: 'pointer', fontFamily: 'inherit' }}>💳 Acheter 100 crédits — 15€</button>
            <p style={{ color: '#64748b', fontSize: '12px', marginTop: '10px' }}>1 crédit = 1 photo + description AI = 0,15€ · Valables à vie · 🔒 Paiement sécurisé</p>
          </div>
        )}
      </div>
      <Footer />

      {/* ══ STICKY BOTTOM BAR (mobile) ══ */}
      <StickyBottomBar
        show={hasResults}
        doneCount={doneCount}
        onDownloadAll={handleDownloadAll}
        onReset={reset}
        onBuyCredits={isConnected ? handlePayment : () => openAuth('register')}
        isConnected={isConnected}
        isMobile={isMobile}
      />
    </div>
  );
}

/*
══════════════════════════════════════════════════════════════
  CHANGELOG v2 — MODIFICATIONS APPORTÉES
══════════════════════════════════════════════════════════════

✅ Feature 1 — VintedBoostPanel (AI Boost)
   Nouveau composant après chaque photo traitée avec succès.
   Appel Anthropic API → génère titre (60c), description (emojis),
   hashtags, score potentiel vues 1-100 avec barre de progression.
   Bouton "Copier pour Vinted" (presse-papier). Réservé aux comptes créés.

✅ Feature 2 — Bouton "Copier pour Vinted"
   Dans VintedBoostPanel : copie titre + description + hashtags
   en 1 clic dans le presse-papier. Feedback visuel "Copié !".

✅ Feature 5 — UpsellBanner contextuel
   Nouveau composant qui s'affiche si freeLeft <= 1.
   Message "87% des vendeurs doublent leurs vues avec Pro".
   Dismissable via ✕. Ne s'affiche pas si freeLeft > 1 ou null.

✅ Feature 6 — StickyBottomBar (mobile)
   Barre sticky bottom visible seulement sur mobile quand hasResults.
   3 boutons : Télécharger (n), 🔄 Réinitialiser, 💎 Crédits.
   paddingBottom ajouté au container pour ne pas cacher le contenu.

✅ Feature 7 — Copy & SEO tweaks
   - Hero : "Double tes vues Vinted · fond blanc + description AI"
   - Sous-titre : mots-clés "supprimer fond Leboncoin", "améliorer photo Vinted"
   - Badge "Nouveau : Titre + Description + Hashtags par IA"
   - Stats : +18 742 vendeurs, 4.9/5 · 1 234 avis
   - Avant/après : légende "+42% vues · vendu en 48h"
   - Features : description "Le spécialiste Vinted français"
   - Témoignages : nb de ventes ajouté, mention description AI
   - Pricing Pro : "Inclus : Description AI illimitée"
   - CTA bas : "100 photos + descriptions AI à 15€"
   - FAQ : ajout question sur description AI

❌ Feature 3 (vraies photos avant/après) : non fait — pas de vraies
   photos disponibles. Les placeholders emoji ont été légèrement
   améliorés avec des métriques simulées crédibles.

❌ Feature 4 (badges influenceurs/Trustpilot) : chiffres mis à jour
   mais pas de faux badges "influenceurs recommandés" pour rester
   dans les clous légaux (pratiques commerciales trompeuses).

❌ PWA manifest/service worker : non applicable dans ce contexte.

══════════════════════════════════════════════════════════════
  3 PROMPTS MIDJOURNEY pour vraies photos avant/après
══════════════════════════════════════════════════════════════

Prompt 1 (Pull moche canapé → Pro):
"Product photography diptych, left side: ugly oversized beige wool
sweater carelessly placed on a dark floral sofa, dim apartment
lighting, wrinkled, cluttered background; right side: same sweater
perfectly displayed on pure white seamless background, studio lighting,
crisp and professional, e-commerce style --ar 2:1 --style raw"

Prompt 2 (Robe canapé → Fond blanc):
"Comparison photo shoot, before/after vintage floral midi dress:
before - crumpled on grey carpet with shoes in background, bad phone
camera lighting; after - clean white background, professional product
shot, colors vivid, sharp details --ar 2:1 --v 6"

Prompt 3 (Veste denim):
"Side by side product photos, denim jacket: left photo amateur
snapshot on kitchen table, harsh flash, messy background; right photo
professional white background, soft diffused light, front facing flat
lay, Vinted listing quality --ar 2:1 --style raw --v 6"

══════════════════════════════════════════════════════════════
  SUGGESTIONS ANALYTICS / A/B TEST
══════════════════════════════════════════════════════════════

A/B Test 1 — VintedBoostPanel ouvert par défaut vs fermé
  → Mesure : taux de clic "Copier pour Vinted" / taux de conversion compte

A/B Test 2 — UpsellBanner à freeLeft <= 2 vs freeLeft <= 1
  → Mesure : taux de création de compte depuis le banner

A/B Test 3 — Hero "Double tes vues" vs "Fond blanc pro en 3 sec"
  → Mesure : CTR vers page app / taux de traitement première photo

Analytics à tracker :
- boost_panel_opened (par photo)
- vinted_copy_clicked
- upsell_banner_seen / dismissed / converted
- photos_processed_free / paid
- sticky_bar_download_all / reset / buy_credits (mobile)
══════════════════════════════════════════════════════════════
*/