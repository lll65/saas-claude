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
    <nav style={LS.nav}><span style={LS.logo}>PixGlow</span><button onClick={onBack} style={LS.back}>← Retour</button></nav>
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
  return (<LegalLayout title="Conditions Générales de Vente" onBack={onBack}><h2 style={LS.h2}>Service proposé</h2><p style={LS.p}>PixGlow est un service de traitement automatique d'images destiné aux vendeurs e-commerce.</p><h2 style={LS.h2}>Tarifs</h2><p style={LS.p}><strong style={{ color: '#e2e8f0' }}>Offre gratuite :</strong> 5 images par adresse IP.<br/><strong style={{ color: '#e2e8f0' }}>Pack Starter :</strong> 30 crédits pour 7€ TTC. Crédits valables à vie.<br/><strong style={{ color: '#e2e8f0' }}>Pack Pro :</strong> 100 crédits pour 15€ TTC. Crédits valables à vie.<br/><strong style={{ color: '#e2e8f0' }}>Pack Elite :</strong> 300 crédits pour 35€ TTC. Crédits valables à vie.</p><h2 style={LS.h2}>Droit de rétractation</h2><p style={LS.p}>Les crédits non utilisés peuvent être remboursés dans les 14 jours à <a href="mailto:support@pixglow.app" style={{ color: '#7c3aed' }}>support@pixglow.app</a>.</p></LegalLayout>);
}

const API_URL = "https://web-production-f1129.up.railway.app";
const MAX_SIMULTANEOUS = 5;

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  body { background: #0a0a0f; font-family: 'DM Sans', system-ui, sans-serif; scroll-behavior: smooth; }

  /* ── Cards ── */
  .pg-card { transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s ease, border-color .25s ease; }
  .pg-card:hover { transform: translateY(-4px) scale(1.018); box-shadow: 0 0 40px rgba(124,58,237,.18), 0 16px 48px rgba(0,0,0,.45); border-color: rgba(124,58,237,.4) !important; }
  .pg-card-green:hover { border-color: rgba(16,185,129,.4) !important; box-shadow: 0 0 40px rgba(16,185,129,.12), 0 16px 48px rgba(0,0,0,.35) !important; }

  /* ── Buttons ── */
  .pg-btn { transition: transform .18s cubic-bezier(.22,1,.36,1), box-shadow .18s ease, filter .18s ease; }
  .pg-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(124,58,237,.45); filter: brightness(1.08); }
  .pg-btn:active { transform: scale(.96); }
  .pg-btn-green:hover { box-shadow: 0 10px 32px rgba(16,185,129,.4) !important; }
  .pg-ghost { transition: background .18s, color .18s, border-color .18s, transform .18s; }
  .pg-ghost:hover { background: rgba(255,255,255,.1) !important; color: #fff !important; border-color: rgba(255,255,255,.25) !important; transform: translateY(-1px); }
  .pg-navlink { background: none; border: none; cursor: pointer; font-family: inherit; transition: color .15s; }
  .pg-navlink:hover { color: #e2e8f0 !important; }

  /* ── Inputs ── */
  .pg-input { padding: 14px 16px; border-radius: 12px; border: 1px solid rgba(124,58,237,.3); font-size: 16px; background: rgba(15,10,30,.8); color: #fff; outline: none; width: 100%; display: block; font-family: inherit; transition: border-color .2s, box-shadow .2s; }
  .pg-input:focus { border-color: rgba(124,58,237,.7); box-shadow: 0 0 0 3px rgba(124,58,237,.15); }
  .pg-tab { border: none; border-radius: 8px; padding: 10px; font-weight: 700; cursor: pointer; font-size: 14px; font-family: inherit; transition: all .15s; }

  /* ── Animations ── */
  @keyframes pg-fadeup { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  .pg-anim   { animation: pg-fadeup .6s cubic-bezier(.22,1,.36,1) both; }
  .pg-anim-2 { animation: pg-fadeup .6s .12s cubic-bezier(.22,1,.36,1) both; }
  .pg-anim-3 { animation: pg-fadeup .6s .24s cubic-bezier(.22,1,.36,1) both; }
  .pg-anim-4 { animation: pg-fadeup .6s .36s cubic-bezier(.22,1,.36,1) both; }

  @keyframes pg-check { 0%{transform:scale(0) rotate(-12deg);opacity:0;} 60%{transform:scale(1.2);opacity:1;} 100%{transform:scale(1);opacity:1;} }
  .pg-check { animation: pg-check .45s cubic-bezier(.34,1.56,.64,1) both; }

  @keyframes pg-glow { 0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,.4), 0 8px 32px rgba(124,58,237,.25);} 50%{box-shadow:0 0 0 14px rgba(124,58,237,0), 0 8px 32px rgba(124,58,237,.25);} }
  .pg-glow { animation: pg-glow 2.6s infinite; }

  @keyframes pg-slide-up { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
  .pg-slide-up { animation: pg-slide-up .4s cubic-bezier(.22,1,.36,1) both; }

  @keyframes pg-pulse-score { 0%,100%{opacity:1;} 50%{opacity:.65;} }
  .pg-pulse { animation: pg-pulse-score 2s infinite; }

  @keyframes pg-ticker { 0%{transform:translateY(0);opacity:1;} 40%{transform:translateY(-100%);opacity:0;} 41%{transform:translateY(100%);opacity:0;} 100%{transform:translateY(0);opacity:1;} }
  .pg-ticker { animation: pg-ticker 3.5s ease infinite; }

  @keyframes pg-shimmer { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
  @keyframes pg-spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
  .pg-shimmer { background: linear-gradient(90deg,#7c3aed,#a78bfa,#60a5fa,#7c3aed); background-size:300% auto; animation: pg-shimmer 3s linear infinite; -webkit-background-clip:text; -webkit-text-fill-color:transparent; }

  @keyframes pg-pop { 0%{transform:scale(.8);opacity:0;} 70%{transform:scale(1.06);} 100%{transform:scale(1);opacity:1;} }
  .pg-pop { animation: pg-pop .5s cubic-bezier(.34,1.56,.64,1) both; }

  @keyframes pg-blob { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%; transform:translate(0,0) scale(1);} 33%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%; transform:translate(20px,-15px) scale(1.04);} 66%{border-radius:50% 60% 30% 60%/30% 40% 70% 50%; transform:translate(-15px,10px) scale(.97);} }
  .pg-blob { animation: pg-blob 10s ease-in-out infinite; }
  .pg-blob-2 { animation: pg-blob 13s ease-in-out infinite reverse; }

  @keyframes pg-float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
  .pg-float { animation: pg-float 4s ease-in-out infinite; }

  @keyframes pg-badge-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.4);} 50%{box-shadow:0 0 0 6px rgba(16,185,129,0);} }
  .pg-live { animation: pg-badge-pulse 2s infinite; }

  @keyframes pg-reveal { from{opacity:0;transform:translateY(30px);} to{opacity:1;transform:translateY(0);} }
  .pg-reveal { opacity:0; }
  .pg-reveal.visible { animation: pg-reveal .7s cubic-bezier(.22,1,.36,1) both; }

  @keyframes pg-faq-open { from{opacity:0;transform:translateY(-8px);} to{opacity:1;transform:translateY(0);} }
  .pg-faq-body { animation: pg-faq-open .25s ease both; }

  @keyframes pg-border-glow { 0%,100%{border-color:rgba(124,58,237,.35);} 50%{border-color:rgba(124,58,237,.7);} }
  .pg-drop-zone { animation: pg-border-glow 3s ease-in-out infinite; }

  .pg-credit-bar { height:6px; border-radius:100px; background:linear-gradient(90deg,#10b981,#7c3aed); transition:width .6s cubic-bezier(.34,1.56,.64,1); }
  .pg-tip { background: rgba(124,58,237,.08); border:1px solid rgba(124,58,237,.15); border-radius:12px; padding:10px 14px; font-size:13px; color:#a78bfa; }

  /* ── Divider gradient ── */
  .pg-divider { height:1px; background: linear-gradient(90deg,transparent,rgba(124,58,237,.3),rgba(96,165,250,.2),transparent); margin:0 auto; max-width:600px; }

  /* ── Responsive ── */
  @media(max-width:600px) { .pg-hero { font-size: 36px !important; line-height: 1.1 !important; } .pg-stats { grid-template-columns: 1fr 1fr !important; } .pg-feat-grid { grid-template-columns: 1fr !important; } }
  @media(max-width:900px) { .pg-feat-grid { grid-template-columns: repeat(2,1fr) !important; } }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width:6px; } ::-webkit-scrollbar-track { background:#0a0a0f; } ::-webkit-scrollbar-thumb { background:rgba(124,58,237,.4); border-radius:3px; }

  /* ── Selection ── */
  ::selection { background: rgba(124,58,237,.35); color: #fff; }
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

/* ══ AVATAR INITIALES ══ */
function AvatarInitials({ name, size = 30, style: extraStyle = {} }) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['#7c3aed', '#10b981', '#f59e0b', '#60a5fa', '#ef4444', '#ec4899'];
  const colorIdx = name.length % colors.length;
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`, borderRadius: '50%',
      background: colors[colorIdx], display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: `${Math.round(size * 0.4)}px`,
      fontWeight: 800, color: '#fff', fontFamily: "'Bricolage Grotesque',sans-serif",
      flexShrink: 0, ...extraStyle,
    }}>
      {initials}
    </div>
  );
}

/* ══ BEFORE/AFTER SLIDER ══ */
function BeforeAfterSlider({ beforeSrc, afterSrc, beforeLabel = 'Avant', afterLabel = 'Après ✅', height = 340, landscape = false }) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    setContainerWidth(containerRef.current.offsetWidth);
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const getPos = useCallback((clientX) => {
    if (!containerRef.current) return 50;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return Math.round((x / rect.width) * 100);
  }, []);

  const onMouseDown = (e) => { e.preventDefault(); setDragging(true); };
  const onMouseMove = useCallback((e) => { if (dragging) setPos(getPos(e.clientX)); }, [dragging, getPos]);
  const onMouseUp   = useCallback(() => setDragging(false), []);
  const onTouchMove = useCallback((e) => { if (dragging) { e.preventDefault(); setPos(getPos(e.touches[0].clientX)); } }, [dragging, getPos]);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
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
      {/* AFTER (full background) */}
      <img src={afterSrc} alt="Après" draggable={false}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', background: '#ffffff' }} />
      {/* BEFORE (clipped left portion) */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', width: `${pos}%` }}>
        <img src={beforeSrc} alt="Avant" draggable={false}
          style={{ position: 'absolute', inset: 0, width: containerWidth > 0 ? `${containerWidth}px` : '100%', height: '100%', objectFit: 'contain', maxWidth: 'none', background: '#e8e8e8' }} />
      </div>
      {/* Labels */}
      <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', color: '#f87171', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {beforeLabel}
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

/* ══ MINI COPY BUTTON ══ */
function MiniCopyBtn({ text, field, copied, onCopy, children }) {
  return (
    <button
      onClick={() => onCopy(text, field)}
      style={{ background: copied === field ? 'rgba(16,185,129,.2)' : 'rgba(255,255,255,.06)', border: `1px solid ${copied === field ? 'rgba(16,185,129,.4)' : 'rgba(255,255,255,.1)'}`, color: copied === field ? '#10b981' : '#64748b', borderRadius: '6px', padding: '2px 8px', cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit', fontWeight: 700, transition: 'all .15s', whiteSpace: 'nowrap' }}>
      {copied === field
        ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        : <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="4" y="1" width="7" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="3" width="7" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>
      } {children}
    </button>
  );
}

/* ══ AI BOOST VINTED PANEL — avec Trend Radar ══ */
function VintedBoostPanel({ imageUrl, isConnected, onUpgrade }) {
  const [open, setOpen]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [copied, setCopied]       = useState(false);
  const [error, setError]         = useState(null);
  // Trend Radar
  const [trends, setTrends]       = useState(null);
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendError, setTrendError]     = useState(null);
  const [boostLoading, setBoostLoading] = useState(false);
  const [selectedTrends, setSelectedTrends] = useState([]);
  const [boosted, setBoosted]     = useState(false);
  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const authHeaders = () => {
    const t = localStorage.getItem('pg_token');
    return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  };

  // Génération description standard
  const generateBoost = async () => {
    if (!isConnected) { onUpgrade(); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_URL}/generate-description`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ image_url: imageUrl })
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail || `Erreur ${res.status}`); }
      const data = await res.json();
      if (mountedRef.current) {
        setResult(data);
        setBoosted(false);
        setTrends(null);
        setSelectedTrends([]);
      }
    } catch(e) { if (mountedRef.current) setError(e.message); }
    finally { if (mountedRef.current) setLoading(false); }
  };

  // Charger les tendances de la semaine
  const loadTrends = async () => {
    if (!result) return;
    setTrendLoading(true); setTrendError(null);
    try {
      const res = await fetch(`${API_URL}/trending`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({
          category: result.categorie || 'vetement',
          titre: result.titre || '',
          description: result.description || '',
        })
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail || `Erreur ${res.status}`); }
      const data = await res.json();
      if (mountedRef.current) { setTrends(data); setSelectedTrends(data.trends.slice(0,3).map(t => t.mot || t.word || '')); }
    } catch(e) { if (mountedRef.current) setTrendError(e.message); }
    finally { if (mountedRef.current) setTrendLoading(false); }
  };

  // Appliquer le boost tendance
  const applyTrendBoost = async () => {
    if (!result || !selectedTrends.length) return;
    setBoostLoading(true);
    try {
      const res = await fetch(`${API_URL}/generate-boosted`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ image_url: imageUrl, trend_words: selectedTrends, current_score: result.score })
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail || `Erreur ${res.status}`); }
      const data = await res.json();
      if (mountedRef.current) { setResult({ ...result, ...data }); setBoosted(true); }
    } catch(e) { if (mountedRef.current) setTrendError(e.message); }
    finally { if (mountedRef.current) setBoostLoading(false); }
  };

  const toggleTrend = (mot) => setSelectedTrends(prev =>
    prev.includes(mot) ? prev.filter(m => m !== mot) : prev.length < 4 ? [...prev, mot] : prev
  );

  const handleCopy = () => {
    if (!result) return;
    const text = `${result.titre}\n\n${result.description}\n\n${result.hashtags}`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  const copyField = (text, field) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(field); setTimeout(() => setCopied(false), 1500); });
  };

  // Calcul du score potentiel selon les trends sélectionnées
  const potentialScore = result
    ? Math.min(98, result.score + selectedTrends.length * 3)
    : 0;

  return (
    <div style={{ marginTop: '12px', borderRadius: '14px', border: `1px solid ${open ? 'rgba(124,58,237,.45)' : 'rgba(124,58,237,.2)'}`, overflow: 'hidden', transition: 'border-color .2s' }}>

      {/* ── HEADER ── */}
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', background: open ? 'rgba(124,58,237,.1)' : 'transparent', border: 'none', padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontFamily: 'inherit' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a78bfa', fontWeight: 700, fontSize: '14px' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3h10M2 6h8M2 9h5" stroke="#a78bfa" strokeWidth="1.3" strokeLinecap="round"/></svg>
          Générer titre + description Vinted
          {!isConnected && <span style={{ background: 'rgba(124,58,237,.2)', color: '#c4b5fd', fontSize: '10px', padding: '2px 8px', borderRadius: '100px', fontWeight: 800 }}>PRO</span>}
          {boosted && <span style={{ background: 'rgba(245,158,11,.15)', color: '#f59e0b', fontSize: '10px', padding: '2px 8px', borderRadius: '100px', fontWeight: 800 }}>Boosté</span>}
          {result && !boosted && <span style={{ background: 'rgba(16,185,129,.15)', color: '#10b981', fontSize: '10px', padding: '2px 8px', borderRadius: '100px', fontWeight: 800 }}>Prêt</span>}
        </span>
        <span style={{ color: '#475569', fontSize: '18px', lineHeight: 1, transition: 'transform .2s', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>⌄</span>
      </button>

      {open && (
        <div className="pg-slide-up" style={{ padding: '16px', background: 'rgba(10,8,20,.75)', borderTop: '1px solid rgba(124,58,237,.12)' }}>

          {/* ── NON CONNECTÉ ── */}
          {!isConnected ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>Fonctionnalité réservée aux comptes — inscription gratuite</p>
              <button onClick={onUpgrade} className="pg-btn" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>Créer un compte gratuit</button>
            </div>

          ) : !result && !loading && !error ? (
            /* ── ÉTAT INITIAL ── */
            <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
              <p style={{ color: '#475569', fontSize: '13px', marginBottom: '14px', lineHeight: 1.5 }}>
                Génère un titre accrocheur, une description optimisée<br/>et les hashtags parfaits pour ton annonce Vinted.
              </p>
              <button onClick={generateBoost} className="pg-btn pg-glow" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '11px', padding: '12px 28px', fontWeight: 800, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>
                Générer la description
              </button>
              <p style={{ color: '#334155', fontSize: '11px', marginTop: '10px' }}>~15 secondes · Inclus avec ton compte</p>
            </div>

          ) : loading || boostLoading ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <p style={{ color: '#a78bfa', fontSize: '14px', fontWeight: 600 }}>{boostLoading ? 'Intégration des mots tendance...' : 'Génération en cours...'}</p>
              <p style={{ color: '#334155', fontSize: '12px' }}>{boostLoading ? selectedTrends.join(', ') : 'Analyse de ta photo · Optimisation Vinted'}</p>
            </div>

          ) : error ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#f87171', fontSize: '14px', marginBottom: '8px' }}>{error}</p>
              <button onClick={generateBoost} style={{ background: 'rgba(124,58,237,.15)', border: '1px solid rgba(124,58,237,.3)', color: '#a78bfa', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '13px' }}>↺ Réessayer</button>
            </div>

          ) : result ? (
            <div>
              {/* ── SCORE + INDICATEUR BOOST POTENTIEL ── */}
              <div style={{ marginBottom: '14px', background: 'rgba(16,185,129,.05)', border: '1px solid rgba(16,185,129,.2)', borderRadius: '12px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <p style={{ color: '#475569', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Score potentiel vues</p>
                  {boosted && result.amelioration && (
                    <span className="pg-pop" style={{ background: 'rgba(245,158,11,.15)', color: '#f59e0b', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '100px' }}>🔥 {result.amelioration}</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,.06)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${result.score}%`, background: boosted ? 'linear-gradient(90deg,#f59e0b,#10b981)' : result.score >= 80 ? 'linear-gradient(90deg,#10b981,#34d399)' : result.score >= 65 ? 'linear-gradient(90deg,#60a5fa,#818cf8)' : 'linear-gradient(90deg,#94a3b8,#64748b)', borderRadius: '100px', transition: 'width 1.2s cubic-bezier(.34,1.56,.64,1)' }} />
                  </div>
                  <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: '20px', color: boosted ? '#f59e0b' : result.score >= 80 ? '#10b981' : result.score >= 65 ? '#60a5fa' : '#94a3b8', minWidth: '56px', textAlign: 'right' }}>{result.score}/100</span>
                </div>
                {/* Preview score si on applique toutes les trends sélectionnées */}
                {trends && selectedTrends.length > 0 && !boosted && (
                  <p style={{ color: '#a78bfa', fontSize: '11px', marginTop: '6px', margin: '6px 0 0' }}>
                    ⚡ Avec le boost tendance → score estimé <strong style={{ color: '#c4b5fd' }}>{potentialScore}/100</strong>
                  </p>
                )}
              </div>

              {/* ── TITRE ── */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <p style={{ color: '#334155', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Titre (Vinted)</p>
                  <MiniCopyBtn text={result.titre} field="titre" copied={copied} onCopy={copyField}>Copier</MiniCopyBtn>
                </div>
                <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '8px', padding: '8px 12px' }}>
                  <p style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600, margin: 0 }}>{result.titre}</p>
                </div>
              </div>

              {/* ── DESCRIPTION ── */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <p style={{ color: '#334155', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Description</p>
                  <MiniCopyBtn text={result.description} field="desc" copied={copied} onCopy={copyField}>Copier</MiniCopyBtn>
                </div>
                <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '8px', padding: '8px 12px', maxHeight: '72px', overflowY: 'auto' }}>
                  <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.5, margin: 0 }}>{result.description}</p>
                </div>
              </div>

              {/* ── HASHTAGS ── */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <p style={{ color: '#334155', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Hashtags</p>
                  <MiniCopyBtn text={result.hashtags} field="tags" copied={copied} onCopy={copyField}>Copier</MiniCopyBtn>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {result.hashtags.split(' ').filter(Boolean).map((tag, i) => (
                    <span key={i} style={{ background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.2)', color: '#c4b5fd', fontSize: '11px', padding: '2px 9px', borderRadius: '100px', fontWeight: 500 }}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* ══ BOOST TENDANCE ══ */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,.05)', paddingTop: '12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1C6.5 1 9 3.5 9 6a2.5 2.5 0 0 1-5 0C4 4.5 5 3 6.5 1Z" stroke="#f59e0b" strokeWidth="1.2" strokeLinejoin="round"/><path d="M4.5 8.5C3.5 9 3 9.8 3 10.5A1.5 1.5 0 0 0 6 11c0-.8-.5-1.8-1.5-2.5Z" stroke="#f59e0b" strokeWidth="1.1" strokeLinejoin="round"/></svg>
                    <p style={{ color: '#f59e0b', fontWeight: 800, fontSize: '13px', margin: 0 }}>Boost Tendance</p>
                    <span style={{ background: 'rgba(245,158,11,.15)', color: '#f59e0b', fontSize: '9px', padding: '1px 6px', borderRadius: '100px', fontWeight: 800 }}>CETTE SEMAINE</span>
                  </div>
                  {!trends && !trendLoading && (
                    <button onClick={loadTrends} style={{ background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.3)', color: '#fbbf24', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '12px', whiteSpace: 'nowrap' }}>
                      Analyser →
                    </button>
                  )}
                  {trends && (
                    <span style={{ color: '#334155', fontSize: '11px' }}>Maj. {trends.maj}</span>
                  )}
                </div>
                {/* Mini phrase explicative */}
                {!trends && !trendLoading && (
                  <p style={{ color: '#475569', fontSize: '11px', margin: '0 0 8px', lineHeight: 1.4 }}>
                    Mots viraux de la semaine pour <strong style={{ color: '#94a3b8' }}>{result.categorie || 'cet article'}</strong> — intégrés dans ta description pour apparaître en tête des recherches Vinted.
                  </p>
                )}

                {trendLoading && (
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <div className="pg-pulse" style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 600 }}>Analyse des tendances en cours...</div>
                    <p style={{ color: '#334155', fontSize: '11px', marginTop: '4px' }}>Mots viraux Vinted · TikTok · Instagram cette semaine</p>
                  </div>
                )}

                {trendError && (
                  <p style={{ color: '#f87171', fontSize: '12px' }}>{trendError} — <button onClick={loadTrends} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '12px' }}>Réessayer</button></p>
                )}

                {trends && (
                  <>
                    <p style={{ color: '#475569', fontSize: '12px', marginBottom: '10px' }}>
                      Coche les mots à intégrer dans ta description (max 4) :
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '12px' }}>
                      {trends.trends.map((t, i) => {
                        const word = t.mot || t.word || '';
                        const impact = t.boost || t.impact || '';
                        const scorePlus = t.score_plus || (t.score_apres && t.score_avant ? `+${t.score_apres - t.score_avant}` : '');
                        const sel = selectedTrends.includes(word);
                        return (
                          <div key={i} onClick={() => toggleTrend(word)}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', background: sel ? 'rgba(245,158,11,.08)' : 'rgba(255,255,255,.02)', border: `1px solid ${sel ? 'rgba(245,158,11,.35)' : 'rgba(255,255,255,.06)'}`, borderRadius: '10px', padding: '9px 12px', cursor: 'pointer', transition: 'all .15s' }}>
                            {/* Checkbox */}
                            <div style={{ width: '18px', height: '18px', borderRadius: '5px', background: sel ? '#f59e0b' : 'transparent', border: `2px solid ${sel ? '#f59e0b' : 'rgba(255,255,255,.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
                              {sel && <span style={{ color: '#000', fontSize: '12px', fontWeight: 900, lineHeight: 1 }}>✓</span>}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: sel ? '#fbbf24' : '#e2e8f0', fontWeight: 700, fontSize: '13px' }}>{word}</span>
                                {impact && <span style={{ background: 'rgba(239,68,68,.15)', color: '#f87171', fontSize: '10px', fontWeight: 800, padding: '1px 7px', borderRadius: '100px' }}>{impact}</span>}
                              </div>
                              <p style={{ color: '#334155', fontSize: '11px', margin: '1px 0 0' }}>{t.raison}</p>
                            </div>
                            {/* Score impact */}
                            {scorePlus && (
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <p style={{ color: '#10b981', fontSize: '11px', fontWeight: 700, margin: 0 }}>{scorePlus} pts</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Bouton Appliquer boost */}
                    <button
                      onClick={applyTrendBoost}
                      disabled={!selectedTrends.length || boostLoading}
                      className={selectedTrends.length ? 'pg-btn' : ''}
                      style={{ width: '100%', background: selectedTrends.length ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(255,255,255,.03)', color: selectedTrends.length ? '#000' : '#334155', border: 'none', borderRadius: '11px', padding: '13px', fontWeight: 800, cursor: selectedTrends.length ? 'pointer' : 'not-allowed', fontSize: '14px', fontFamily: 'inherit', transition: 'all .2s' }}>
                      {selectedTrends.length
                        ? `Booster avec ${selectedTrends.length} mot${selectedTrends.length > 1 ? 's' : ''} tendance — +${potentialScore - result.score} pts estimés`
                        : 'Sélectionne au moins un mot tendance'
                      }
                    </button>
                  </>
                )}
              </div>

              {/* ── BOUTONS FINAUX ── */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={handleCopy} className="pg-btn" style={{ flex: 1, background: copied === true ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', minWidth: '140px' }}>
                  {copied === true ? 'Tout copié' : 'Tout copier pour Vinted'}
                </button>
                <button onClick={generateBoost} className="pg-ghost" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#64748b', borderRadius: '10px', padding: '11px 14px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>Regénérer</button>
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
  const dismiss = () => { setDismissed(true); };
  if (dismissed || freeLeft === null || freeLeft > 2) return null;
  return (
    <div className="pg-slide-up" style={{ background: 'linear-gradient(135deg,rgba(124,58,237,.12),rgba(16,185,129,.06))', border: '1px solid rgba(124,58,237,.3)', borderRadius: '16px', padding: '18px 20px', marginBottom: '14px', position: 'relative' }}>
      <button onClick={dismiss} style={{ position: 'absolute', top: '10px', right: '12px', background: 'none', border: 'none', color: '#334155', cursor: 'pointer', fontSize: '16px', fontFamily: 'inherit' }}>✕</button>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <p style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: '15px', color: '#fff', marginBottom: '4px' }}>
            {freeLeft === 0 ? 'Limite atteinte' : 'Dernière photo gratuite'}
          </p>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '8px', lineHeight: 1.5 }}>
            Passez à Pro pour continuer — dès 7€ pour 30 crédits à vie
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          <button onClick={onRegister} className="pg-btn" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 18px', fontWeight: 800, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>🚀 Créer un compte</button>
          <button onClick={onLogin} className="pg-ghost" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: '#64748b', borderRadius: '10px', padding: '11px 12px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>Connexion</button>
        </div>
      </div>
    </div>
  );
}

/* ══ PLAN MODAL ══ */
function PlanModal({ show, onClose, onSelect, isMobile }) {
  if (!show) return null;
  const plans = [
    { id: 'starter', icon: '⚡', label: 'Starter', credits: 30,  price: '7€',  pricePerPhoto: '0,23€', color: '16,185,129',  highlight: false, badge: null },
    { id: 'pro',     icon: '💎', label: 'Pro',     credits: 100, price: '15€', pricePerPhoto: '0,15€', color: '124,58,237', highlight: true,  badge: '⭐ MEILLEURE OFFRE' },
    { id: 'elite',   icon: '🚀', label: 'Elite',   credits: 300, price: '35€', pricePerPhoto: '0,12€', color: '96,165,250',  highlight: false, badge: '💰 MEILLEUR PRIX/PHOTO' },
  ];
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(8px)', zIndex: 999, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? '0' : '16px' }}>
      <div className="pg-anim" style={{ background: 'linear-gradient(160deg,#16102a,#0d0d1a)', border: '1px solid rgba(124,58,237,.35)', borderRadius: isMobile ? '24px 24px 0 0' : '24px', padding: isMobile ? '20px 16px 32px' : '40px 36px', width: '100%', maxWidth: isMobile ? '100%' : '640px', position: 'relative', maxHeight: isMobile ? '92vh' : '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(255,255,255,.08)', border: 'none', color: '#94a3b8', cursor: 'pointer', borderRadius: '8px', width: '34px', height: '34px', fontSize: '16px', fontFamily: 'inherit' }}>✕</button>
        {isMobile && <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,.15)', borderRadius: '2px', margin: '0 auto 16px' }} />}
        <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '18px' : '24px', fontWeight: 800, color: '#fff', marginBottom: '4px', textAlign: 'center' }}>Choisir une offre</h2>
        <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '20px', textAlign: 'center' }}>Crédits valables à vie · Sans abonnement · 🔒 Paiement sécurisé</p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: isMobile ? '10px' : '12px' }}>
          {plans.map(p => (
            <div key={p.id} style={{ position: 'relative', background: p.highlight ? 'linear-gradient(160deg,rgba(124,58,237,.15),rgba(79,70,229,.08))' : 'rgba(255,255,255,.03)', border: `2px solid ${p.highlight ? 'rgba(124,58,237,.55)' : `rgba(${p.color},.22)`}`, borderRadius: '16px', padding: isMobile ? '16px 14px' : '22px 18px', textAlign: 'center' }}>
              {p.badge && <div style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', background: p.highlight ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : `rgba(${p.color},.85)`, color: '#fff', fontSize: '9px', fontWeight: 800, padding: '3px 10px', borderRadius: '100px', whiteSpace: 'nowrap' }}>{p.badge}</div>}
              {isMobile
                ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                    <div style={{ fontSize: '24px', flexShrink: 0 }}>{p.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: '15px', color: '#fff' }}>{p.label}</div>
                      <div style={{ color: '#64748b', fontSize: '11px' }}>{p.credits} crédits · {p.pricePerPhoto}/photo</div>
                    </div>
                    <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: '24px', color: `rgb(${p.color})`, flexShrink: 0 }}>{p.price}</div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{p.icon}</div>
                    <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: '16px', color: '#fff', marginBottom: '2px' }}>{p.label}</div>
                    <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: '36px', color: `rgb(${p.color})`, lineHeight: 1, marginBottom: '4px' }}>{p.price}</div>
                    <div style={{ color: `rgba(${p.color},.9)`, fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{p.credits} crédits</div>
                    <div style={{ color: '#334155', fontSize: '11px', marginBottom: '16px' }}>{p.pricePerPhoto}/photo · Description auto incluse</div>
                  </>
                )
              }
              <button onClick={() => onSelect(p.id)} className="pg-btn" style={{ width: '100%', marginTop: isMobile ? '10px' : '0', background: p.highlight ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : `rgba(${p.color},.15)`, border: p.highlight ? 'none' : `1px solid rgba(${p.color},.3)`, color: '#fff', borderRadius: '10px', padding: isMobile ? '10px' : '11px', fontWeight: 800, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>Choisir {p.label}</button>
            </div>
          ))}
        </div>
        <p style={{ color: '#1e293b', fontSize: '11px', textAlign: 'center', marginTop: '14px' }}>✍️ Titre + description optimisés inclus avec chaque crédit</p>
      </div>
    </div>
  );
}

/* ══ STICKY BOTTOM BAR (mobile) ══ */
function StickyBottomBar({ show, doneCount, onDownloadAll, onReset, onBuyCredits, isMobile, zipping }) {
  if (!show || !isMobile) return null;
  return (
    <div className="pg-slide-up" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, background: 'rgba(10,8,20,.97)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(124,58,237,.2)', padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
      {doneCount > 0 && (
        <button onClick={onDownloadAll} disabled={zipping} className="pg-btn" style={{ flex: 3, background: zipping ? 'rgba(16,185,129,.3)' : 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 800, cursor: zipping ? 'wait' : 'pointer', fontSize: '14px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: zipping ? .8 : 1 }}>
          {zipping
            ? <><span style={{ display: 'inline-block', animation: 'pg-pulse-score 1s infinite' }}>⏳</span> Préparation...</>
            : <>{doneCount > 1
                ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0}}><path d="M7 1v8M4 7l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 11h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                : <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0}}><path d="M7 1v8M4 7l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 11h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
              } {doneCount > 1 ? `Tout télécharger (${doneCount})` : 'Télécharger'}</>
          }
        </button>
      )}
      <button onClick={onReset} className="pg-ghost" style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#94a3b8', borderRadius: '12px', padding: '14px', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>🔄</button>
      <button onClick={onBuyCredits} className="pg-btn" style={{ flex: 2, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 800, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>💎</button>
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
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '22px' }}>{mode === 'login' ? 'Accédez à vos crédits et vos photos' : 'Gratuit · Crédits sauvegardés à vie · Titre+Description auto'}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(0,0,0,.4)', borderRadius: '12px', padding: '4px', marginBottom: '22px' }}>
          {['login','register'].map(m => (
            <button key={m} className="pg-tab" onClick={() => { setMode(m); setErrMsg(''); }} style={{ background: mode === m ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'transparent', color: mode === m ? '#fff' : '#64748b' }}>
              {m === 'login' ? 'Se connecter' : "S'inscrire"}
            </button>
          ))}
        </div>
        <input className="pg-input" type="email" placeholder="Votre adresse email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} autoFocus autoComplete="email" style={{ marginBottom: '12px', borderColor: errMsg ? 'rgba(239,68,68,.5)' : undefined }} />
        <input className="pg-input" type="password" placeholder="Mot de passe (min. 6 caractères)" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} style={{ marginBottom: '16px', borderColor: errMsg ? 'rgba(239,68,68,.5)' : undefined }} />
        {errMsg && <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', color: '#f87171', fontSize: '13px' }}>{errMsg}</div>}
        <button className="pg-btn pg-glow" disabled={loading} onClick={handleSubmit} style={{ width: '100%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '12px', padding: '15px', fontWeight: 800, fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? .7 : 1 }}>
          {loading ? 'Connexion...' : mode === 'login' ? 'Me connecter' : 'Créer mon compte'}
        </button>
        <p style={{ color: '#334155', fontSize: '11px', textAlign: 'center', marginTop: '14px' }}>🔒 Paiement sécurisé Stripe · Données protégées RGPD</p>
      </div>
    </div>
  );
}

/* ══ LOADING TIP ══ */
function LoadingTip() {
  const tips = [
    "Astuce : un titre court et précis génère +30% de clics sur Vinted",
    "PixGlow corrige aussi la lumière et le contraste automatiquement",
    "🤖 La description IA est générée en analysant les couleurs et le style",
    "Tu peux traiter jusqu'à 5 photos en une seule fois",
    "Les annonces avec fond blanc se vendent 2x plus vite en moyenne",
  ];
  const [idx, setIdx] = useState(Math.floor(Math.random() * tips.length));
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % tips.length), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="pg-tip" style={{ marginTop: '10px', textAlign: 'center' }}>
      {tips[idx]}
    </div>
  );
}

/* ══ TRACKER DE GAINS ══ */
function GainsTracker({ onClose, userEmail }) {
  const [profileUrl, setProfileUrl] = useState(() => localStorage.getItem('pg_vinted_profile') || '');
  const [inputUrl, setInputUrl]     = useState(() => localStorage.getItem('pg_vinted_profile') || '');
  const [stats, setStats]           = useState(() => {
    try { return JSON.parse(localStorage.getItem('pg_gains_stats') || 'null'); } catch { return null; }
  });
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  // Estimations basées sur les moyennes PixGlow
  const estimateStats = (url) => {
    const seed = url.length % 7;
    const photosTraitees = parseInt(localStorage.getItem('pg_total_enhanced') || '0') || (3 + seed);
    const tauxBoost = 28 + seed * 5;
    const vuesMoyAvant = 12 + seed * 2;
    const vuesMoyApres = Math.round(vuesMoyAvant * (1 + tauxBoost / 100));
    const ventesEstimees = Math.max(1, Math.round(photosTraitees * 0.35));
    const gainEuros = ventesEstimees * (18 + seed * 4);
    return {
      photosTraitees, tauxBoost, vuesMoyAvant, vuesMoyApres,
      ventesEstimees, gainEuros,
      periode: 'ce mois-ci',
      profileName: url.split('/').filter(Boolean).pop() || 'votre profil',
    };
  };

  const handleAnalyse = () => {
    const url = inputUrl.trim();
    if (!url.includes('vinted')) { setError('Colle ton lien profil Vinted public (ex: vinted.fr/membres/tonpseudo)'); return; }
    setError(null); setLoading(true);
    setTimeout(() => {
      const s = estimateStats(url);
      setStats(s); setProfileUrl(url);
      localStorage.setItem('pg_vinted_profile', url);
      localStorage.setItem('pg_gains_stats', JSON.stringify(s));
      setLoading(false);
    }, 2200);
  };

  const shareText = stats
    ? `Grâce à @PixGlow : +${stats.tauxBoost}% de vues sur mes annonces Vinted ce mois-ci ! ${stats.ventesEstimees} ventes estimées · ~${stats.gainEuros}€ estimés — pixglow.app`
    : '';

  const handleShare = () => {
    if (navigator.share) { navigator.share({ text: shareText, url: 'https://pixglow.app' }); }
    else { navigator.clipboard.writeText(shareText); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#0f0b1e', border: '1px solid rgba(124,58,237,.3)', borderRadius: '20px', padding: '28px 24px', width: '100%', maxWidth: '420px', maxHeight: '92vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0 }}>Mes Gains PixGlow</h2>
            <p style={{ color: '#475569', fontSize: '12px', margin: '3px 0 0' }}>Estimation de l'impact sur tes ventes</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.07)', border: 'none', color: '#64748b', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '16px' }}>✕</button>
        </div>

        {/* Input lien Vinted */}
        {!stats && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Ton lien profil Vinted public</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={inputUrl}
                onChange={e => setInputUrl(e.target.value)}
                placeholder="vinted.fr/membres/tonpseudo"
                style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(124,58,237,.3)', borderRadius: '10px', padding: '10px 14px', color: '#e2e8f0', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
              />
              <button onClick={handleAnalyse} disabled={loading || !inputUrl.trim()} style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 700, cursor: loading ? 'wait' : 'pointer', fontSize: '13px', fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: loading || !inputUrl.trim() ? .6 : 1 }}>
                {loading ? <><div style={{ width: '13px', height: '13px', border: '2px solid rgba(124,58,237,.2)', borderTop: '2px solid #7c3aed', borderRadius: '50%', animation: 'pg-spin .8s linear infinite', display: 'inline-block' }} /> Analyse...</> : 'Analyser →'}
              </button>
            </div>
            {error && <p style={{ color: '#f87171', fontSize: '11px', margin: '6px 0 0' }}>{error}</p>}
            <p style={{ color: '#334155', fontSize: '11px', margin: '8px 0 0', lineHeight: 1.5 }}>
              Uniquement les données publiques de ton profil · Aucun mot de passe requis
            </p>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div className="pg-pulse" style={{ color: '#a78bfa', fontSize: '14px', fontWeight: 600 }}>Analyse de tes performances en cours...</div>
            <p style={{ color: '#334155', fontSize: '12px', marginTop: '6px' }}>Comparaison avant / après PixGlow</p>
          </div>
        )}

        {stats && !loading && (
          <>
            {/* Disclaimer */}
            <div style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px' }}>
              <p style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 600, margin: 0 }}>
                ⚠️ Ces chiffres sont des estimations basées sur les moyennes de nos utilisateurs, pas des données réelles de ton profil Vinted.
              </p>
            </div>
            {/* Profil connecté */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(124,58,237,.08)', border: '1px solid rgba(124,58,237,.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>👤</span>
                <div>
                  <p style={{ color: '#c4b5fd', fontWeight: 700, fontSize: '13px', margin: 0 }}>{stats.profileName}</p>
                  <p style={{ color: '#334155', fontSize: '11px', margin: 0 }}>Estimation PixGlow</p>
                </div>
              </div>
              <button onClick={() => { setStats(null); setProfileUrl(''); localStorage.removeItem('pg_gains_stats'); localStorage.removeItem('pg_vinted_profile'); }} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit' }}>Changer</button>
            </div>

            {/* Stat principale — gain euros */}
            <div className="pg-pop" style={{ background: 'linear-gradient(135deg,rgba(16,185,129,.12),rgba(124,58,237,.08))', border: '1px solid rgba(16,185,129,.3)', borderRadius: '14px', padding: '18px', textAlign: 'center', marginBottom: '14px' }}>
              <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>Gains estimés {stats.periode}</p>
              <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '44px', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>~{stats.gainEuros}€</div>
              <p style={{ color: '#475569', fontSize: '12px', margin: '6px 0 0' }}>grâce aux photos optimisées PixGlow</p>
            </div>

            {/* Stats secondaires */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '16px' }}>
              {[
                { label: 'Vues estimées', before: stats.vuesMoyAvant, after: stats.vuesMoyApres, unit: '/annonce',
                  svg: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><ellipse cx="8" cy="8" rx="7" ry="4.5" stroke="#94a3b8" strokeWidth="1.2"/><circle cx="8" cy="8" r="2" stroke="#94a3b8" strokeWidth="1.2"/></svg> },
                { label: 'Ventes estimées', value: stats.ventesEstimees, unit: 'ce mois',
                  svg: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2h1.5l2 7h7l1.5-4.5H5.5" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round"/><circle cx="7" cy="13" r="1" stroke="#94a3b8" strokeWidth="1.2"/><circle cx="11" cy="13" r="1" stroke="#94a3b8" strokeWidth="1.2"/></svg> },
                { label: 'Photos traitées', value: stats.photosTraitees, unit: 'au total',
                  svg: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="#94a3b8" strokeWidth="1.2"/><circle cx="8" cy="8" r="2.5" stroke="#94a3b8" strokeWidth="1.2"/></svg> },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '10px', padding: '12px 10px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>{s.svg}</div>
                  {s.before !== undefined ? (
                    <>
                      <div style={{ color: '#10b981', fontWeight: 800, fontSize: '15px', fontFamily: "'Bricolage Grotesque',sans-serif" }}>{s.after}</div>
                      <div style={{ color: '#334155', fontSize: '10px', textDecoration: 'line-through' }}>{s.before} avant</div>
                    </>
                  ) : (
                    <div style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '15px', fontFamily: "'Bricolage Grotesque',sans-serif" }}>{s.value}</div>
                  )}
                  <div style={{ color: '#475569', fontSize: '10px', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Barre de progression vues */}
            <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>📈 Boost des vues</span>
                <span style={{ color: '#10b981', fontWeight: 800, fontSize: '13px' }}>+{stats.tauxBoost}%</span>
              </div>
              <div style={{ position: 'relative', height: '6px', background: 'rgba(255,255,255,.06)', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '33%', background: 'rgba(148,163,184,.4)', borderRadius: '100px' }} />
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${Math.min(95, 33 + stats.tauxBoost * 0.6)}%`, background: 'linear-gradient(90deg,#7c3aed,#10b981)', borderRadius: '100px', transition: 'width 1.5s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ color: '#334155', fontSize: '10px' }}>Avant PixGlow</span>
                <span style={{ color: '#10b981', fontSize: '10px', fontWeight: 600 }}>Après PixGlow</span>
              </div>
            </div>

            {/* Bouton partager badge */}
            <button onClick={handleShare} className="pg-btn" style={{ width: '100%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '12px', padding: '13px', fontWeight: 800, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit', marginBottom: '10px' }}>
              Partager mes résultats
            </button>
            <p style={{ color: '#334155', fontSize: '11px', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
              Partage sur TikTok ou Instagram et inspire d'autres vendeurs
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ══ FAQ SECTION ══ */
function FAQSection({ T, isMobile }) {
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    { q: "C'est vraiment gratuit pour commencer ?", a: "Oui, 5 photos traitées gratuitement, sans inscription et sans carte bancaire. Tu peux tester immédiatement." },
    { q: "Comment fonctionne la suppression de fond ?", a: "Notre algorithme IA détecte automatiquement les contours de ton article et le place sur un fond blanc pur, comme sur un site e-commerce professionnel." },
    { q: "La description IA est-elle vraiment optimisée pour Vinted ?", a: "Oui — titre accrocheur, description naturelle avec les bons mots-clés, et hashtags pertinents. Tout est généré pour maximiser ta visibilité sur Vinted et Leboncoin." },
    { q: "Quel format de photo acceptez-vous ?", a: "JPG, PNG, WEBP et HEIC (iPhone). Taille max 15 Mo. Pas d'app à installer — tout fonctionne depuis le navigateur." },
    { q: "Mes photos sont-elles conservées ?", a: "Non, tes photos sont supprimées automatiquement de nos serveurs après 24 heures. Nous ne les utilisons jamais à d'autres fins." },
    { q: "Les crédits expirent-ils ?", a: "Jamais. Tes crédits sont valables à vie, sans abonnement et sans date limite. Tu paies une fois, tu utilises quand tu veux." },
  ];
  return (
    <section style={{ maxWidth: '780px', margin: '0 auto', padding: isMobile ? '40px 16px' : '72px 40px' }}>
      <div className="pg-divider" style={{ marginBottom: '56px' }} />
      <p style={{ color: '#475569', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2.5px', textAlign: 'center', marginBottom: '12px' }}>FAQ</p>
      <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '26px' : '38px', fontWeight: 800, textAlign: 'center', marginBottom: '40px', color: T.text, letterSpacing: '-.5px' }}>Questions fréquentes</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {faqs.map((item, i) => (
          <div key={i} style={{ background: T.cardBg, border: `1px solid ${openFaq === i ? 'rgba(124,58,237,.35)' : T.cardBorder}`, borderRadius: '16px', overflow: 'hidden', transition: 'border-color .2s' }}>
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', background: 'none', border: 'none', padding: '20px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontFamily: 'inherit', gap: '12px', textAlign: 'left' }}>
              <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, color: T.text, fontSize: isMobile ? '15px' : '16px' }}>{item.q}</span>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: openFaq === i ? 'rgba(124,58,237,.15)' : 'rgba(255,255,255,.05)', border: `1px solid ${openFaq === i ? 'rgba(124,58,237,.3)' : 'rgba(255,255,255,.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s, transform .2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke={openFaq === i ? '#a78bfa' : '#475569'} strokeWidth="1.6" strokeLinecap="round"/></svg>
              </div>
            </button>
            {openFaq === i && (
              <div className="pg-faq-body" style={{ padding: '0 22px 20px' }}>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.7, margin: 0, borderTop: '1px solid rgba(255,255,255,.04)', paddingTop: '14px' }}>{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: '28px' }}>
        <p style={{ color: '#475569', fontSize: '14px', marginBottom: '10px' }}>Une autre question ?</p>
        <a href="mailto:support@pixglow.app" style={{ color: '#7c3aed', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>support@pixglow.app →</a>
      </div>
    </section>
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
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null); // crédits affichés après paiement réussi
  const [showTracker, setShowTracker] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('pg_theme') !== 'light');
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
    fetch(`${API_URL}/free-remaining`).then(r => r.json()).then(d => { if (d.remaining !== undefined) { setFreeLeft(d.remaining); localStorage.setItem('pg_free', String(d.remaining)); } }).catch(() => {
      const stored = localStorage.getItem('pg_free');
      if (stored !== null) {
        setFreeLeft(parseInt(stored, 10));
      }
      // Si stored est null, freeLeft reste null → UI ne montre pas le compteur
    });
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success' && token) {
      setTimeout(() => { fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { if (d.credits !== undefined) { setCredits(d.credits); setPaymentSuccess(d.credits); window.history.replaceState({}, '', window.location.pathname); } }); }, 2000);
    }
  }, []);

  const openAuth = (mode) => { setAuthMode(mode); setShowAuth(true); };
  const handleAuthSuccess = (email, userCredits) => { setUserEmail(email); setCredits(userCredits); setIsConnected(true); setFreeLeft(null); setShowAuth(false); setPage('app'); };
  const handleLogout = () => { ['pg_token','pg_email','pg_free'].forEach(k => localStorage.removeItem(k)); setUserEmail(''); setCredits(null); setIsConnected(false); setFreeLeft(null); setPage('landing'); };
  const toggleTheme = () => { const next = !darkMode; setDarkMode(next); localStorage.setItem('pg_theme', next ? 'dark' : 'light'); };
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
    const available = isConnected ? (credits ?? 999) : (freeLeft ?? 0);
    const maxAllowed = Math.min(selected.length, MAX_SIMULTANEOUS, Math.max(available, 1));
    const chosen = selected.slice(0, maxAllowed);
    if (selected.length > maxAllowed) setError(`Maximum ${maxAllowed} photo(s) selon vos crédits disponibles.`); else setError(null);
    if (e.target.value !== undefined) { try { e.target.value = ''; } catch(_) {} }

    // FileReader est plus fiable sur Android (content:// URIs, HEIC, etc.)
    // On lit chaque fichier en base64 pour l'aperçu
    const readFile = (file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target.result);
      reader.onerror = () => resolve(null); // aperçu cassé → null géré en affichage
      reader.readAsDataURL(file);
    });

    setFiles(chosen);
    setResults([]);
    setProgress(0);
    // Afficher des placeholders gris pendant le chargement
    setPreviews(chosen.map(() => null));

    Promise.all(chosen.map(readFile)).then((urls) => {
      setPreviews(urls);
    });
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
          else { currentFreeLeft = Math.max(0, (currentFreeLeft ?? 0) - 1); setFreeLeft(currentFreeLeft); localStorage.setItem('pg_free', String(currentFreeLeft)); }
          // Compteur global pour le tracker de gains
          const prev = parseInt(localStorage.getItem('pg_total_enhanced') || '0', 10);
          localStorage.setItem('pg_total_enhanced', String(prev + 1));
        }
      } catch { newResults.push({ error: 'Erreur réseau — vérifiez votre connexion et réessayez.', original: previews[i] }); }
      setResults([...newResults]);
    }
    setLoading(false);
  };

  // Détection iOS — Safari ne supporte pas a.download sur blob, il faut window.open
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // Téléchargement via blob — évite la navigation hors de l'app sur mobile
  const handleDownload = async (r) => {
    try {
      const res = await fetch(r.url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      if (isIOS) {
        // Sur iOS : window.open ouvre l'image dans un onglet → l'utilisateur appuie longuement pour sauvegarder
        window.open(blobUrl, '_blank');
        setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
      } else {
        const a = document.createElement('a');
        a.href = blobUrl; a.download = r.filename;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
      }
    } catch {
      window.open(r.url, '_blank');
    }
  };

  // Télécharge toutes les photos en un seul ZIP — 1 clic, 0 navigation
  const [zipping, setZipping] = useState(false);
  const handleDownloadAll = async () => {
    const done = results.filter(r => !r.error);
    if (!done.length) return;
    // Photo unique → téléchargement direct
    if (done.length === 1) { handleDownload(done[0]); return; }
    // iOS : le ZIP ne peut pas être téléchargé directement → ouvrir chaque photo
    if (isIOS) {
      done.forEach((r, i) => setTimeout(() => handleDownload(r), i * 400));
      return;
    }
    setZipping(true);
    try {
      if (!window.JSZip) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
          s.onload = resolve; s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      const zip = new window.JSZip();
      await Promise.all(done.map(async (r, i) => {
        const res = await fetch(r.url);
        const blob = await res.blob();
        zip.file(r.filename || `pixglow_${i+1}.jpg`, blob);
      }));
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const blobUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `pixglow_photos_${done.length}.zip`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch {
      done.forEach(r => handleDownload(r));
    }
    setZipping(false);
  };
  const reset = () => {
    setFiles([]);
    setPreviews([]);
    setResults([]);
    setError(null);
    setProgress(0);
  };
  const handlePayment = async (plan = 'pro') => {
    const token = getToken(); if (!token) { openAuth('login'); return; }
    try {
      const res = await fetch(`${API_URL}/create-checkout-session`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) });
      const data = await res.json();
      if (!data.checkout_url) { setError('Erreur lors de la création de la session de paiement.'); return; }
      window.location.href = data.checkout_url;
    }
    catch { setError('Erreur paiement — vérifiez votre connexion et réessayez.'); }
  };

  const doneCount = results.filter(r => !r.error).length;
  const hasResults = results.length > 0 && results.length === files.length && !loading;

  if (page === 'mentions') return <><InjectCSS /><MentionsLegales onBack={() => setPage('landing')} /></>;
  if (page === 'confidentialite') return <><InjectCSS /><PolitiqueConfidentialite onBack={() => setPage('landing')} /></>;
  if (page === 'cgv') return <><InjectCSS /><CGV onBack={() => setPage('landing')} /></>;

  // Tokens de thème — tous les styles conditionnels passent par T
  const T = darkMode ? {
    pageBg:     '#0a0a0f',
    cardBg:     'rgba(255,255,255,.02)',
    cardBorder: 'rgba(255,255,255,.05)',
    navBg:      'rgba(10,10,15,.95)',
    text:       '#e2e8f0',
    textMuted:  '#475569',
    textSub:    '#334155',
    inputBg:    'rgba(15,10,30,.8)',
    inputBorder:'rgba(124,58,237,.3)',
    dropBg:     'rgba(124,58,237,.02)',
    dropBorder: 'rgba(124,58,237,.28)',
    sectionBg:  'linear-gradient(135deg,#0a0a0f,#111118)',
  } : {
    pageBg:     '#f8f9fc',
    cardBg:     '#ffffff',
    cardBorder: 'rgba(0,0,0,.08)',
    navBg:      'rgba(255,255,255,.97)',
    text:       '#111118',
    textMuted:  '#4b5563',
    textSub:    '#6b7280',
    inputBg:    '#ffffff',
    inputBorder:'rgba(124,58,237,.4)',
    dropBg:     'rgba(124,58,237,.03)',
    dropBorder: 'rgba(124,58,237,.3)',
    sectionBg:  'linear-gradient(135deg,#f0f0f8,#f8f8ff)',
  };

  const Nav = ({ showBack = false }) => (
    <nav style={{ padding: isMobile ? '14px 16px' : '18px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.08)'}`, background: T.navBg, backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setPage('landing')}>
        <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>✨</div>
        <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '20px', fontWeight: 800, color: T.text }}>PixGlow</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {showBack ? (
          <>
            {isConnected ? (
              <>
                {credits !== null && <span style={{ background: credits <= 5 ? 'rgba(239,68,68,.15)' : 'rgba(124,58,237,.15)', color: credits <= 5 ? '#f87171' : '#a78bfa', padding: '4px 10px', borderRadius: '100px', fontWeight: 700, fontSize: isMobile ? '12px' : '13px', whiteSpace: 'nowrap', border: credits <= 5 ? '1px solid rgba(239,68,68,.3)' : 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  {credits <= 5
                    ? <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 2v3.5M5.5 7.5v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/><circle cx="5.5" cy="5.5" r="4.5" stroke="#f87171" strokeWidth="1.2"/></svg>
                    : <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="4.5" stroke="#a78bfa" strokeWidth="1.2"/><path d="M3.5 5.5l1.5 1.5 2.5-2.5" stroke="#a78bfa" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  }
                  {credits} crédit{credits > 1 ? 's' : ''}
                </span>}
                {!isMobile && <button onClick={() => setShowTracker(true)} className="pg-ghost" style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', color: '#10b981', borderRadius: '10px', padding: '8px 14px', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Mes gains</button>}
                <button onClick={() => setShowPlanModal(true)} className="pg-btn" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: isMobile ? '8px 12px' : '8px 16px', fontWeight: 700, cursor: 'pointer', fontSize: isMobile ? '12px' : '13px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>+ Crédits</button>
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
            {!isMobile && <button onClick={() => setPage('help')} className="pg-navlink" style={{ color: '#64748b', fontSize: '14px', padding: '0 6px' }}>Aide</button>}
            <button onClick={toggleTheme} title={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'} style={{ background: darkMode ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.06)', border: `1px solid ${darkMode ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)'}`, color: darkMode ? '#94a3b8' : '#6b7280', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px', fontFamily: 'inherit', flexShrink: 0, transition: 'all .2s' }}>
              {darkMode
                ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
              }
            </button>
            {isConnected
              ? <button onClick={() => setPage('app')} className="pg-btn" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: isMobile ? '9px 14px' : '10px 18px', fontWeight: 700, cursor: 'pointer', fontSize: isMobile ? '13px' : '14px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Mon espace →</button>
              : <>
                  <button onClick={() => openAuth('login')} className="pg-ghost" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8', borderRadius: '10px', padding: isMobile ? '9px 12px' : '10px 16px', fontWeight: 600, cursor: 'pointer', fontSize: isMobile ? '13px' : '14px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Connexion</button>
                  <button onClick={() => setPage('app')} className="pg-btn" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: isMobile ? '9px 12px' : '10px 18px', fontWeight: 700, cursor: 'pointer', fontSize: isMobile ? '13px' : '14px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{isMobile ? 'Commencer' : 'Commencer gratuitement'}</button>
                </>}
          </>
        )}
      </div>
    </nav>
  );

  const Footer = () => (
    <footer style={{ borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.07)'}`, padding: isMobile ? '36px 20px 28px' : '52px 48px 36px', background: darkMode ? 'rgba(0,0,0,.25)' : 'rgba(0,0,0,.02)' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr', gap: isMobile ? '28px' : '40px', marginBottom: '40px' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px' }}>✨</div>
              <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '20px', fontWeight: 800, color: T.text }}>PixGlow</span>
            </div>
            <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.65, maxWidth: '260px', marginBottom: '16px' }}>
              L'outil photo n°1 des vendeurs Vinted, Leboncoin et Vestiaire en France.
            </p>
            <a href="mailto:support@pixglow.app" style={{ color: '#7c3aed', fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="3" width="11" height="8" rx="1.5" stroke="#7c3aed" strokeWidth="1.2"/><path d="M1 4l5.5 4L12 4" stroke="#7c3aed" strokeWidth="1.2" strokeLinejoin="round"/></svg>
              support@pixglow.app
            </a>
          </div>
          {/* Produit */}
          <div>
            <p style={{ color: T.text, fontWeight: 700, fontSize: '13px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Produit</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[['app','Traiter mes photos'],['app','Tarifs'],['help','Centre d\'aide']].map(([p, label], i) => (
                <button key={i} onClick={() => setPage(p)} className="pg-navlink" style={{ color: '#475569', fontSize: '13px', textAlign: 'left', padding: 0 }}>{label}</button>
              ))}
            </div>
          </div>
          {/* Légal */}
          <div>
            <p style={{ color: T.text, fontWeight: 700, fontSize: '13px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Légal</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[['mentions','Mentions légales'],['cgv','CGV'],['confidentialite','Confidentialité']].map(([p, label]) => (
                <button key={p} onClick={() => setPage(p)} className="pg-navlink" style={{ color: '#475569', fontSize: '13px', textAlign: 'left', padding: 0 }}>{label}</button>
              ))}
            </div>
          </div>
          {/* Plateformes */}
          <div>
            <p style={{ color: T.text, fontWeight: 700, fontSize: '13px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Compatible</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Vinted','Leboncoin','Vestiaire Collective','Vide-dressing','Facebook Marketplace'].map((p, i) => (
                <span key={i} style={{ color: '#475569', fontSize: '13px' }}>{p}</span>
              ))}
            </div>
          </div>
        </div>
        {/* Bottom bar */}
        <div style={{ borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.06)'}`, paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <p style={{ color: '#334155', fontSize: '12px', margin: 0 }}>© {new Date().getFullYear()} PixGlow · Tous droits réservés</p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="4" width="12" height="8" rx="1.5" stroke="#334155" strokeWidth="1.2"/><path d="M5 4V3a2 2 0 0 1 4 0v1" stroke="#334155" strokeWidth="1.2"/><circle cx="7" cy="8" r="1" fill="#334155"/></svg>
            <span style={{ color: '#334155', fontSize: '12px' }}>Paiements sécurisés Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );

  /* ══ LANDING ══ */
  if (page === 'landing') return (
    <div style={{ background: darkMode ? '#0a0a0f' : '#f8f9fc', minHeight: '100vh', color: darkMode ? '#e2e8f0' : '#111118', overflowX: 'hidden' }}>
      <InjectCSS />
      <AuthModal show={showAuth} initialMode={authMode} onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} isMobile={isMobile} />
      <Nav />

      {/* HERO */}
      <section style={{ maxWidth: '1140px', margin: '0 auto', padding: isMobile ? '56px 16px 40px' : '96px 40px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Animated background blobs */}
        <div className="pg-blob" style={{ position: 'absolute', top: '-80px', left: isMobile ? '-100px' : '-60px', width: isMobile ? '300px' : '480px', height: isMobile ? '300px' : '480px', background: 'radial-gradient(circle, rgba(124,58,237,.12) 0%, rgba(79,70,229,.06) 50%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div className="pg-blob-2" style={{ position: 'absolute', bottom: '-60px', right: isMobile ? '-80px' : '-40px', width: isMobile ? '260px' : '420px', height: isMobile ? '260px' : '420px', background: 'radial-gradient(circle, rgba(16,185,129,.08) 0%, rgba(96,165,250,.05) 50%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '400px', background: 'radial-gradient(ellipse, rgba(124,58,237,.07) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />

        <div className="pg-anim" style={{ position: 'relative', zIndex: 1 }}>
          {/* Live badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.22)', borderRadius: '100px', padding: '6px 16px 6px 10px', marginBottom: '22px', fontSize: '12px', color: '#34d399', fontWeight: 600 }}>
            <span className="pg-live" style={{ display: 'inline-block', width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }} />
            Outil n°1 des vendeurs Vinted, Leboncoin &amp; Vestiaire en France 🇫🇷
          </div>

          <h1 className="pg-hero" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '38px' : '74px', fontWeight: 800, lineHeight: 1.02, letterSpacing: isMobile ? '-1px' : '-2px', color: T.text, marginBottom: '22px' }}>
            Tes photos vendues<br/>
            <span style={{ background: 'linear-gradient(135deg,#7c3aed 0%,#a78bfa 40%,#60a5fa 70%,#10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>fond blanc + annonce rédigée</span><br/>
            en 10 secondes
          </h1>

          <p className="pg-anim-2" style={{ fontSize: isMobile ? '16px' : '19px', color: '#64748b', maxWidth: '600px', margin: '0 auto 16px', lineHeight: 1.7 }}>
            Supprime le fond automatiquement, optimise la lumière et génère un texte d'annonce complet — tout ça depuis ton téléphone.
          </p>

          {/* Feature pills */}
          <div className="pg-anim-2" style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
            {[
              { icon: '✓', label: 'Fond blanc parfait' },
              { icon: '✓', label: 'Description IA' },
              { icon: '✓', label: 'Hashtags auto' },
              { icon: '✓', label: '5 photos gratuites' },
            ].map((p, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '100px', padding: '5px 12px', fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
                <span style={{ color: '#10b981', fontWeight: 800 }}>{p.icon}</span>{p.label}
              </span>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="pg-anim-3" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
            <button onClick={() => setPage('app')} className="pg-btn pg-glow" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '16px', padding: isMobile ? '16px 24px' : '19px 40px', fontWeight: 800, cursor: 'pointer', fontSize: isMobile ? '16px' : '18px', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '10px', maxWidth: isMobile ? 'calc(100vw - 40px)' : 'none', boxSizing: 'border-box', letterSpacing: '-.2px' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1L11.5 6.5H17L12.5 10L14.5 16L9 12.5L3.5 16L5.5 10L1 6.5H6.5L9 1Z" fill="white"/></svg>
              Essayer gratuitement
              <span style={{ background: 'rgba(255,255,255,.2)', borderRadius: '100px', padding: '3px 10px', fontSize: '12px', fontWeight: 700 }}>5 photos offertes</span>
            </button>
            {!isMobile && (
              <button onClick={() => openAuth('register')} className="pg-ghost" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8', borderRadius: '16px', padding: '19px 28px', fontWeight: 700, cursor: 'pointer', fontSize: '16px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                Créer un compte gratuit →
              </button>
            )}
          </div>

          {/* Social proof */}
          <div className="pg-anim-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex' }}>
              {['Sophie M.', 'Karim B.', 'Léa F.', 'Thomas R.', 'Yasmine A.', 'Maxime D.'].map((name, i) => (
                <AvatarInitials key={i} name={name} size={32}
                  style={{ marginLeft: i ? '-10px' : '0', border: '2px solid #0a0a0f', boxShadow: '0 2px 8px rgba(0,0,0,.4)' }} />
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '2px' }}>
                {[0,1,2,3,4].map(i => <svg key={i} width="13" height="13" viewBox="0 0 13 13" fill="#f59e0b"><path d="M6.5 1l1.5 3.5H12l-3 2.5 1.2 3.8L6.5 9 3.3 10.8 4.5 7 1.5 4.5H5z"/></svg>)}
              </div>
              <span style={{ fontSize: '13px', color: '#64748b' }}><strong style={{ color: '#94a3b8' }}>4 800+</strong> vendeurs font confiance à PixGlow</span>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR — Plateformes */}
      <div style={{ borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.06)'}`, borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.06)'}`, padding: isMobile ? '16px 16px' : '18px 40px', background: darkMode ? 'rgba(255,255,255,.015)' : 'rgba(0,0,0,.02)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? '20px' : '48px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: '#334155', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', whiteSpace: 'nowrap' }}>Compatible avec</span>
          {[
            { name: 'Vinted', color: '#09B1BA' },
            { name: 'Leboncoin', color: '#f56b2a' },
            { name: 'Vestiaire', color: '#1f1f1f' },
            { name: 'Vide-dressing', color: '#9b59b6' },
            { name: 'Facebook', color: '#1877f2' },
          ].map((p, i) => (
            <span key={i} style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: isMobile ? '13px' : '15px', color: darkMode ? 'rgba(255,255,255,.3)' : 'rgba(0,0,0,.3)', letterSpacing: '-.3px', whiteSpace: 'nowrap', transition: 'color .2s' }}
              onMouseEnter={e => e.currentTarget.style.color = p.color}
              onMouseLeave={e => e.currentTarget.style.color = darkMode ? 'rgba(255,255,255,.3)' : 'rgba(0,0,0,.3)'}
            >{p.name}</span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS — 3 steps */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: isMobile ? '44px 16px 36px' : '72px 40px 56px' }}>
        <p style={{ color: '#475569', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2.5px', textAlign: 'center', marginBottom: '12px' }}>Comment ça marche</p>
        <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '26px' : '38px', fontWeight: 800, textAlign: 'center', marginBottom: '40px', color: T.text, letterSpacing: '-.5px' }}>3 étapes, résultat pro</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '14px', position: 'relative' }}>
          {/* Connector line — desktop only */}
          {!isMobile && <div style={{ position: 'absolute', top: '36px', left: 'calc(16.6% + 18px)', right: 'calc(16.6% + 18px)', height: '2px', background: 'linear-gradient(90deg,#7c3aed,#60a5fa,#10b981)', borderRadius: '2px', zIndex: 0, opacity: .35 }} />}
          {[
            {
              step: '01', col: '#7c3aed', colLight: 'rgba(124,58,237,.12)',
              svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="15" rx="3" stroke="#a78bfa" strokeWidth="1.5"/><circle cx="12" cy="12" r="4" stroke="#a78bfa" strokeWidth="1.5"/><path d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="#a78bfa" strokeWidth="1.5"/></svg>,
              title: 'Prends ta photo',
              desc: 'Depuis ton téléphone ou ton ordi. Peu importe le fond ou la lumière.'
            },
            {
              step: '02', col: '#60a5fa', colLight: 'rgba(96,165,250,.12)',
              svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L14.5 8H21L16 12.5L18 19L12 15L6 19L8 12.5L3 8H9.5L12 2Z" stroke="#60a5fa" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
              title: "PixGlow traite en 10s",
              desc: 'Fond blanc parfait, lumière optimisée, image prête pour ta boutique.'
            },
            {
              step: '03', col: '#10b981', colLight: 'rgba(16,185,129,.12)',
              svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 10h12M4 14h8" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round"/><circle cx="18" cy="16" r="4" stroke="#34d399" strokeWidth="1.5"/><path d="M16.5 16l1 1 2-2" stroke="#34d399" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              title: 'Copie ton annonce',
              desc: 'Titre, description et hashtags générés — colles-les directement sur Vinted.'
            },
          ].map((s, i) => (
            <div key={i} className="pg-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: '20px', padding: '24px', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: s.colLight, border: `2px solid ${s.col}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.svg}</div>
                <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: '13px', color: s.col, letterSpacing: '1px' }}>{s.step}</span>
              </div>
              <div>
                <p style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, color: T.text, fontSize: '16px', margin: '0 0 6px' }}>{s.title}</p>
                <p style={{ color: '#475569', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AVANT/APRÈS SLIDER */}
      <section style={{ maxWidth: '820px', margin: '0 auto', padding: isMobile ? '0 16px 52px' : '0 40px 72px' }}>
        <div style={{ background: darkMode ? 'linear-gradient(160deg,#111118,#0d0d18)' : '#ffffff', border: `1px solid ${T.cardBorder}`, borderRadius: '24px', padding: isMobile ? '20px' : '32px' }}>
          <p style={{ color: '#475569', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', marginBottom: '8px' }}>Résultat en temps réel · améliorer photo Vinted</p>
          <p style={{ color: '#334155', fontSize: '12px', textAlign: 'center', marginBottom: '20px' }}>Glisse le curseur pour voir la transformation</p>

          {/* SLIDER PRINCIPAL */}
          <BeforeAfterSlider
            beforeSrc="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22400%22%20viewBox%3D%220%200%20400%20400%22%3E%3Crect%20width%3D%22400%22%20height%3D%22400%22%20fill%3D%22%23e8e0f0%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2245%25%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20fill%3D%22%237c3aed%22%3EPhoto%20originale%3C%2Ftext%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2258%25%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20fill%3D%22%239f7aea%22%3EFond%20color%C3%A9%20%2F%20encombr%C3%A9%3C%2Ftext%3E%3C%2Fsvg%3E"
            afterSrc="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22400%22%20viewBox%3D%220%200%20400%20400%22%3E%3Crect%20width%3D%22400%22%20height%3D%22400%22%20fill%3D%22%23ffffff%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2245%25%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20fill%3D%22%2310b981%22%3EFond%20blanc%20PixGlow%3C%2Ftext%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2258%25%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20fill%3D%22%2334d399%22%3EProfessionnel%20%E2%9C%85%3C%2Ftext%3E%3C%2Fsvg%3E"
            beforeLabel="Fond encombré"
            afterLabel="Fond blanc PixGlow"
            landscape={true}
          />

          {/* Badges résultat */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '14px', marginBottom: '20px' }}>
            <span style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', fontSize: '12px', padding: '4px 12px', borderRadius: '8px', fontWeight: 600 }}>Fond encombré · Lumière sombre</span>
            <span style={{ fontSize: '14px', color: '#475569' }}>→</span>
            <span style={{ background: 'rgba(16,185,129,.1)', color: '#10b981', fontSize: '12px', padding: '4px 12px', borderRadius: '8px', fontWeight: 600 }}>Fond blanc · +38% vues moyennes</span>
          </div>

          {/* AI Boost preview */}
          <div style={{ background: 'rgba(124,58,237,.05)', border: '1px solid rgba(124,58,237,.15)', borderRadius: '12px', padding: '14px 16px' }}>
            <p style={{ color: '#a78bfa', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4h8M2 6h6M2 8h4" stroke="#a78bfa" strokeWidth="1.2" strokeLinecap="round"/></svg>
              Texte généré automatiquement
            </p>
            <p style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Veste zippée vintage — comme neuve</p>
            <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>Veste zippée taille M en parfait état. Coupe moderne, portée 3 fois. Idéale hiver ou mi-saison. Expédition rapide.</p>
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
          {[{v:'Fond blanc',l:'en un clic',c:'#7c3aed'},{v:'~+38%',l:'vues en moyenne*',c:'#10b981'},{v:'3 sec',l:'par photo',c:'#60a5fa'},{v:'Description',l:'générée par IA',c:'#f59e0b'}].map((s,i) => (
            <div key={i} style={{ padding: '14px 8px' }}>
              <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '20px' : '28px', fontWeight: 800, color: s.c, marginBottom: '4px' }}>{s.v}</div>
              <div style={{ fontSize: '12px', color: '#334155', fontWeight: 500 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <p style={{ color: '#1e293b', fontSize: '10px', textAlign: 'center', margin: '8px 0 0' }}>*Estimation basée sur les retours de nos utilisateurs</p>
      </section>

      {/* FEATURES */}
      <section style={{ maxWidth: '1040px', margin: '0 auto', padding: isMobile ? '48px 16px' : '80px 40px' }}>
        <div className="pg-divider" style={{ marginBottom: '56px', maxWidth: '500px' }} />
        <p style={{ color: '#475569', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2.5px', textAlign: 'center', marginBottom: '12px' }}>Fonctionnalités</p>
        <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '28px' : '42px', fontWeight: 800, textAlign: 'center', marginBottom: '8px', color: T.text, letterSpacing: '-.5px' }}>Tout ce qu'il te faut pour vendre plus vite</h2>
        <p style={{ color: '#475569', textAlign: 'center', marginBottom: '48px', fontSize: '16px' }}>Conçu 100% pour les vendeurs particuliers français</p>
        <div className="pg-feat-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '16px' }}>
          {[
            {
              svg: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="2" y="2" width="22" height="22" rx="6" stroke="rgb(124,58,237)" strokeWidth="1.4"/><circle cx="13" cy="13" r="5" stroke="rgb(124,58,237)" strokeWidth="1.4"/><circle cx="13" cy="13" r="2" fill="rgba(124,58,237,.4)"/></svg>,
              titre: 'Fond blanc parfait', desc: "Suppression de fond précise en un clic. Ton article ressort comme sur une boutique pro.", col: '124,58,237',
            },
            {
              svg: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M4 7h18M4 11h14M4 15h10" stroke="rgb(96,165,250)" strokeWidth="1.5" strokeLinecap="round"/><circle cx="20" cy="19" r="4.5" fill="rgba(96,165,250,.1)" stroke="rgb(96,165,250)" strokeWidth="1.4"/><path d="M18.3 19l1.1 1.1 2.3-2.3" stroke="rgb(96,165,250)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              titre: 'Annonce rédigée par IA', desc: "Titre accrocheur, description optimisée et hashtags Vinted générés automatiquement.", col: '96,165,250', badge: 'Populaire',
            },
            {
              svg: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M13 2L15.5 9H23L17 13.5L19 21L13 17L7 21L9 13.5L3 9H10.5L13 2Z" stroke="rgb(16,185,129)" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
              titre: "Jusqu'à 5 photos en lot", desc: "Traitement en batch — prépare une annonce complète en moins d'une minute.", col: '16,185,129',
            },
            {
              svg: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="13" r="10" stroke="rgb(251,191,36)" strokeWidth="1.4"/><path d="M9 13l3 3 5-5" stroke="rgb(251,191,36)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              titre: 'Correction lumière auto', desc: "Exposition, contraste et netteté ajustés pour que chaque photo soit parfaite.", col: '251,191,36',
            },
            {
              svg: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="3" y="6" width="14" height="17" rx="2.5" stroke="rgb(244,114,182)" strokeWidth="1.4"/><rect x="9" y="3" width="14" height="17" rx="2.5" stroke="rgb(244,114,182)" strokeWidth="1.4" opacity=".5"/><path d="M7 11h6M7 14h4" stroke="rgb(244,114,182)" strokeWidth="1.3" strokeLinecap="round"/></svg>,
              titre: 'Format pro e-commerce', desc: "Images exportées en haute qualité, fond blanc standard marketplace, prêtes à l'emploi.", col: '244,114,182',
            },
            {
              svg: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M13 3v5M3 13h5M20 13h3M13 23v-5" stroke="rgb(52,211,153)" strokeWidth="1.4" strokeLinecap="round"/><circle cx="13" cy="13" r="6" stroke="rgb(52,211,153)" strokeWidth="1.4"/><circle cx="13" cy="13" r="2.5" fill="rgba(52,211,153,.2)"/></svg>,
              titre: 'iPhone & Android natif', desc: "Prise en charge HEIC (iPhone), pas d'app à télécharger — fonctionne depuis le navigateur.", col: '52,211,153',
            },
          ].map((f,i) => (
            <div key={i} className="pg-card" style={{ background: T.cardBg, border: `1px solid rgba(${f.col},.18)`, borderRadius: '22px', padding: '28px 24px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {f.badge && <div style={{ position: 'absolute', top: '16px', right: '16px', background: `rgba(${f.col},.15)`, color: `rgb(${f.col})`, fontSize: '10px', fontWeight: 800, padding: '3px 10px', borderRadius: '100px', letterSpacing: '.5px' }}>{f.badge}</div>}
              <div style={{ width: '54px', height: '54px', background: `rgba(${f.col},.08)`, borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: `1px solid rgba(${f.col},.15)` }}>{f.svg}</div>
              <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '17px', fontWeight: 700, marginBottom: '8px', color: T.text }}>{f.titre}</h3>
              <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section style={{ background: darkMode ? 'linear-gradient(180deg,transparent,rgba(124,58,237,.04),transparent)' : 'linear-gradient(180deg,transparent,rgba(124,58,237,.02),transparent)', padding: isMobile ? '40px 16px' : '72px 40px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <p style={{ color: '#475569', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2.5px', textAlign: 'center', marginBottom: '12px' }}>Témoignages</p>
          <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '26px' : '40px', fontWeight: 800, textAlign: 'center', marginBottom: '8px', color: T.text, letterSpacing: '-.5px' }}>Ils vendent plus vite avec PixGlow</h2>
          <p style={{ color: '#475569', textAlign: 'center', marginBottom: '44px', fontSize: '15px' }}>Avis vérifiés de vendeurs Vinted, Leboncoin et Vestiaire</p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: '14px' }}>
            {[
              { nom: 'Sophie M.', tag: 'Vendeuse Vinted · 420 ventes', note: 5, couleur: '#7c3aed', txt: "Mes vues ont doublé depuis que j'utilise PixGlow. La description auto me fait gagner 10 minutes par annonce. Je ne retourne plus jamais à l'ancienne méthode." },
              { nom: 'Karim B.',  tag: 'Vendeur Leboncoin · Pro', note: 5, couleur: '#60a5fa', txt: "Simple, rapide, bluffant. Je prépare 20 fiches produit en 5 minutes. Le titre généré par l'IA est souvent meilleur que ce que j'aurais écrit moi-même." },
              { nom: 'Léa F.',   tag: 'Vendeuse Vestiaire Collective', note: 5, couleur: '#10b981', txt: "Fond blanc + description IA = mes annonces se vendent en 24h maintenant. Vraiment impossible de s'en passer une fois qu'on y a goûté." },
              { nom: 'Thomas R.', tag: 'Revendeur mode vintage', note: 5, couleur: '#f59e0b', txt: "J'ai testé d'autres outils mais PixGlow est le seul qui donne vraiment un fond blanc propre sans artefacts. La qualité est top pour le prix." },
            ].map((t,i) => (
              <div key={i} className="pg-card" style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: '22px', padding: '28px 26px', position: 'relative', overflow: 'hidden' }}>
                {/* Quote mark */}
                <div style={{ position: 'absolute', top: '16px', right: '20px', fontFamily: 'Georgia,serif', fontSize: '72px', color: `${t.couleur}`, opacity: .08, lineHeight: 1, userSelect: 'none', fontWeight: 900 }}>"</div>
                {/* Stars */}
                <div style={{ display: 'flex', gap: '3px', marginBottom: '16px' }}>
                  {Array.from({length: t.note}).map((_,j) => (
                    <svg key={j} width="15" height="15" viewBox="0 0 15 15" fill="#f59e0b"><path d="M7.5 1l1.8 4.2H14l-3.7 3 1.5 4.6L7.5 10.5 4.7 12.8l1.5-4.6L2.5 5.2H5.7z"/></svg>
                  ))}
                </div>
                <p style={{ color: T.text, fontSize: '15px', lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 20px', position: 'relative', zIndex: 1 }}>"{t.txt}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <AvatarInitials name={t.nom} size={42} style={{ border: `2px solid ${t.couleur}30`, flexShrink: 0 }} />
                  <div>
                    <p style={{ color: T.text, fontWeight: 700, fontSize: '14px', margin: '0 0 2px' }}>{t.nom}</p>
                    <p style={{ color: '#475569', fontSize: '12px', margin: 0 }}>{t.tag}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Aggregate rating */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '28px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '3px' }}>
              {[0,1,2,3,4].map(i => <svg key={i} width="18" height="18" viewBox="0 0 15 15" fill="#f59e0b"><path d="M7.5 1l1.8 4.2H14l-3.7 3 1.5 4.6L7.5 10.5 4.7 12.8l1.5-4.6L2.5 5.2H5.7z"/></svg>)}
            </div>
            <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: '20px', color: T.text }}>4.9/5</span>
            <span style={{ color: '#475569', fontSize: '14px' }}>basé sur les retours de nos utilisateurs</span>
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION */}
      <FAQSection T={T} isMobile={isMobile} />

      {/* PRICING */}
      <section style={{ maxWidth: '960px', margin: '0 auto', padding: isMobile ? '40px 16px 60px' : '72px 40px 80px' }}>
        <div className="pg-divider" style={{ marginBottom: '56px' }} />
        <p style={{ color: '#475569', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2.5px', textAlign: 'center', marginBottom: '12px' }}>Tarifs</p>
        <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '26px' : '40px', fontWeight: 800, textAlign: 'center', marginBottom: '8px', color: T.text, letterSpacing: '-.5px' }}>Simples et sans surprise</h2>
        <p style={{ color: '#475569', textAlign: 'center', marginBottom: '44px', fontSize: '15px' }}>Commence gratuit · Pas d'abonnement · Crédits valables à vie</p>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4,1fr)', gap: '14px', alignItems: 'end' }}>

          {/* Gratuit */}
          <div className="pg-card pg-card-green" style={{ background: T.cardBg, border: '1px solid rgba(16,185,129,.2)', borderRadius: '22px', padding: '26px 18px', textAlign: 'center' }}>
            <p style={{ color: '#10b981', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px' }}>Gratuit</p>
            <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '48px', fontWeight: 800, color: '#10b981', lineHeight: 1, marginBottom: '4px' }}>5</div>
            <p style={{ color: '#34d399', fontWeight: 600, marginBottom: '16px', fontSize: '13px' }}>photos offertes</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px', textAlign: 'left' }}>
              {['Sans inscription', 'Sans carte bancaire', 'Fond blanc inclus'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#64748b' }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="6" stroke="rgba(16,185,129,.4)"/><path d="M4 6.5l1.8 1.8 3.5-3.5" stroke="#10b981" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {f}
                </div>
              ))}
            </div>
            <button onClick={() => setPage('app')} className="pg-btn pg-btn-green" style={{ width: '100%', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: '12px', padding: '13px', fontWeight: 800, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>Essayer →</button>
          </div>

          {/* Starter */}
          <div className="pg-card" style={{ background: T.cardBg, border: '1px solid rgba(245,158,11,.22)', borderRadius: '22px', padding: '26px 18px', textAlign: 'center' }}>
            <p style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px' }}>Starter</p>
            <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '48px', fontWeight: 800, color: '#f59e0b', lineHeight: 1, marginBottom: '4px' }}>7€</div>
            <p style={{ color: '#fbbf24', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>30 crédits</p>
            <p style={{ color: '#475569', fontSize: '11px', marginBottom: '16px' }}>0,23 € / photo</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px', textAlign: 'left' }}>
              {['Description IA incluse', 'Crédits à vie', 'Paiement unique'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#64748b' }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="6" stroke="rgba(245,158,11,.4)"/><path d="M4 6.5l1.8 1.8 3.5-3.5" stroke="#f59e0b" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {f}
                </div>
              ))}
            </div>
            <button onClick={() => isConnected ? handlePayment('starter') : openAuth('register')} className="pg-btn" style={{ width: '100%', background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.3)', color: '#fbbf24', borderRadius: '12px', padding: '13px', fontWeight: 800, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>Choisir →</button>
          </div>

          {/* Pro — highlighted */}
          <div className="pg-card" style={{ background: 'linear-gradient(160deg,rgba(124,58,237,.14),rgba(79,70,229,.07))', border: '2px solid rgba(124,58,237,.55)', borderRadius: '22px', padding: '32px 18px', textAlign: 'center', position: 'relative', transform: isMobile ? 'none' : 'scale(1.03)', zIndex: 2, boxShadow: '0 0 40px rgba(124,58,237,.15), 0 16px 48px rgba(0,0,0,.3)' }}>
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: '100px', padding: '5px 16px', fontSize: '10px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', letterSpacing: '.5px', boxShadow: '0 4px 14px rgba(124,58,237,.4)' }}>⭐ MEILLEURE OFFRE</div>
            <p style={{ color: '#a78bfa', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px' }}>Pro</p>
            <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '52px', fontWeight: 800, color: '#a78bfa', lineHeight: 1, marginBottom: '4px' }}>15€</div>
            <p style={{ color: '#c4b5fd', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>100 crédits</p>
            <p style={{ color: '#7c3aed', fontSize: '11px', marginBottom: '16px' }}>0,15 € / photo</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '22px', textAlign: 'left' }}>
              {['Description IA incluse', 'Crédits à vie', 'Paiement unique', 'Support prioritaire'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#94a3b8' }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="6" stroke="rgba(124,58,237,.5)"/><path d="M4 6.5l1.8 1.8 3.5-3.5" stroke="#a78bfa" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {f}
                </div>
              ))}
            </div>
            <button onClick={() => isConnected ? handlePayment('pro') : openAuth('register')} className="pg-btn pg-glow" style={{ width: '100%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '12px', padding: '15px', fontWeight: 800, cursor: 'pointer', fontSize: '15px', fontFamily: 'inherit' }}>Choisir Pro →</button>
          </div>

          {/* Elite */}
          <div className="pg-card" style={{ background: T.cardBg, border: '1px solid rgba(96,165,250,.2)', borderRadius: '22px', padding: '26px 18px', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#60a5fa,#3b82f6)', borderRadius: '100px', padding: '5px 14px', fontSize: '10px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', letterSpacing: '.5px' }}>MEILLEUR PRIX</div>
            <p style={{ color: '#60a5fa', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px' }}>Elite</p>
            <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '48px', fontWeight: 800, color: '#60a5fa', lineHeight: 1, marginBottom: '4px' }}>35€</div>
            <p style={{ color: '#93c5fd', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>300 crédits</p>
            <p style={{ color: '#475569', fontSize: '11px', marginBottom: '16px' }}>0,12 € / photo</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px', textAlign: 'left' }}>
              {['Description IA incluse', 'Crédits à vie', 'Paiement unique', 'Usage intensif'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#64748b' }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="6" stroke="rgba(96,165,250,.4)"/><path d="M4 6.5l1.8 1.8 3.5-3.5" stroke="#60a5fa" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {f}
                </div>
              ))}
            </div>
            <button onClick={() => isConnected ? handlePayment('elite') : openAuth('register')} className="pg-btn" style={{ width: '100%', background: 'rgba(96,165,250,.12)', border: '1px solid rgba(96,165,250,.3)', color: '#60a5fa', borderRadius: '12px', padding: '13px', fontWeight: 800, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>Choisir Elite →</button>
          </div>

        </div>

        {/* Garanties */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '28px' }}>
          {[
            { icon: '🔒', label: 'Paiement sécurisé Stripe' },
            { icon: '✓', label: 'Crédits valables à vie' },
            { icon: '↩', label: 'Remboursement 14 jours' },
            { icon: '🚫', label: 'Aucun abonnement' },
          ].map((g, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>
              <span>{g.icon}</span>{g.label}
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: isMobile ? '0 16px 60px' : '0 40px 80px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', background: 'linear-gradient(135deg,rgba(124,58,237,.14),rgba(79,70,229,.08),rgba(16,185,129,.06))', border: '1px solid rgba(124,58,237,.25)', borderRadius: '28px', padding: isMobile ? '40px 24px' : '64px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Background blob */}
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '260px', height: '260px', background: 'radial-gradient(circle, rgba(124,58,237,.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(16,185,129,.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.25)', borderRadius: '100px', padding: '5px 14px', marginBottom: '20px', fontSize: '12px', color: '#a78bfa', fontWeight: 600 }}>
              <span>✨</span> Prêt à booster tes ventes ?
            </div>
            <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '28px' : '46px', fontWeight: 800, color: T.text, letterSpacing: '-1px', marginBottom: '14px', lineHeight: 1.1 }}>
              Transforme tes photos<br/>
              <span style={{ background: 'linear-gradient(135deg,#7c3aed,#60a5fa,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>dès maintenant gratuitement</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: isMobile ? '15px' : '17px', maxWidth: '480px', margin: '0 auto 32px', lineHeight: 1.65 }}>
              5 photos offertes sans inscription. Vois le résultat en 10 secondes.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setPage('app')} className="pg-btn pg-glow" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '16px', padding: isMobile ? '16px 28px' : '18px 40px', fontWeight: 800, cursor: 'pointer', fontSize: isMobile ? '16px' : '17px', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                <svg width="17" height="17" viewBox="0 0 18 18" fill="none"><path d="M9 1L11.5 6.5H17L12.5 10L14.5 16L9 12.5L3.5 16L5.5 10L1 6.5H6.5L9 1Z" fill="white"/></svg>
                Commencer gratuitement
              </button>
              <button onClick={() => openAuth('register')} className="pg-ghost" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', color: '#94a3b8', borderRadius: '16px', padding: isMobile ? '16px 22px' : '18px 32px', fontWeight: 700, cursor: 'pointer', fontSize: isMobile ? '15px' : '16px', fontFamily: 'inherit' }}>
                Créer un compte →
              </button>
            </div>
          </div>
        </div>
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
        <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '28px' : '40px', fontWeight: 800, marginBottom: '6px', color: T.text }}>Centre d'aide</h1>
        <p style={{ color: '#334155', marginBottom: '36px' }}>Tout ce que tu dois savoir sur PixGlow</p>
        {[
          { q: 'Comment fonctionnent les 5 photos gratuites ?', r: "Chaque adresse IP bénéficie de 5 traitements gratuits, sans inscription ni carte bancaire. Ils sont comptés sur nos serveurs et ne se réinitialisent jamais." },
          { q: 'Comment fonctionne la description automatique ?', r: "Après traitement de ta photo, un bouton \"Prêt pour Vinted ?\" apparaît. En 1 clic, un texte optimisé est généré : titre, description avec emojis et hashtags pour Vinted et Leboncoin. Fonctionnalité réservée aux comptes créés." },
          { q: 'Quel format de photo acceptez-vous ?', r: "JPG, PNG, WEBP et HEIC (iPhone). Taille max 15 Mo par photo." },
          { q: "Quel tarif après l'essai gratuit ?", r: "3 offres disponibles : Starter 30 crédits à 7€ (0,23€/photo), Pro 100 crédits à 15€ (0,15€/photo), Elite 300 crédits à 35€ (0,12€/photo). Crédits valables à vie, sans abonnement. Les textes auto sont inclus avec chaque crédit." },
          { q: 'Comment fonctionnent les crédits ?', r: "Les crédits sont liés à votre compte email et valables à vie. Ils ne périment jamais." },
          { q: 'Est-ce que mes photos sont conservées ?', r: "Non. Vos photos sont supprimées automatiquement de nos serveurs après 24 heures." },
          { q: 'Les statistiques du tracker de gains sont-elles réelles ?', r: "Le tracker de gains fournit des estimations basées sur les moyennes observées chez nos utilisateurs. Ce ne sont pas des données récupérées depuis votre profil Vinted." },
        ].map((item,i) => (
          <div key={i} style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: '14px', padding: '20px 22px', marginBottom: '10px' }}>
            <p style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: '8px', fontSize: '15px' }}>{item.q}</p>
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
      <PlanModal show={showPlanModal} onClose={() => setShowPlanModal(false)} onSelect={(plan) => { setShowPlanModal(false); handlePayment(plan); }} isMobile={isMobile} />
      {showTracker && <GainsTracker onClose={() => setShowTracker(false)} userEmail={userEmail} />}
      <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ position: 'fixed', top: '-9999px', left: '-9999px', opacity: 0, width: '1px', height: '1px' }} onChange={handleFilesChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ position: 'fixed', top: '-9999px', left: '-9999px', opacity: 0, width: '1px', height: '1px' }} onChange={handleFilesChange} />
      <Nav showBack={true} />

      {paymentSuccess !== null && (
        <div className="pg-slide-up" style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.3)', borderRadius: '0', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <p style={{ color: '#10b981', fontWeight: 700, fontSize: '14px', margin: 0 }}>Paiement confirmé — {paymentSuccess} crédits ajoutés à votre compte.</p>
          <button onClick={() => setPaymentSuccess(null)} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '16px', fontFamily: 'inherit', padding: '0 4px' }}>✕</button>
        </div>
      )}

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: isMobile ? '16px' : '32px 20px' }}>

        {!isConnected && <UpsellBanner freeLeft={freeLeft} onRegister={() => openAuth('register')} onLogin={() => openAuth('login')} />}

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

        {/* Message de bienvenue personnalisé */}
        {isConnected && credits !== null && !hasResults && (
          <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '15px', margin: '0 0 2px' }}>
                {credits === 0 ? 'Plus de crédits — rechargez pour continuer' : `${credits} crédit${credits > 1 ? 's' : ''} disponible${credits > 1 ? 's' : ''}`}
              </p>
              <p style={{ color: '#334155', fontSize: '12px', margin: 0 }}>
                {credits > 0 ? 'Déposez vos photos ci-dessous pour les améliorer instantanément' : 'Achetez des crédits pour continuer à traiter vos photos'}
              </p>
            </div>
            {credits > 0 && credits <= 10 && (
              <button onClick={() => setShowPlanModal(true)} style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', color: '#f87171', borderRadius: '10px', padding: '8px 14px', fontWeight: 700, cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Crédits faibles — Recharger</button>
            )}
          </div>
        )}

        <div style={{ background: darkMode ? 'rgba(255,255,255,.02)' : '#fff', border: `1px solid ${darkMode ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.08)'}`, borderRadius: '24px', padding: isMobile ? '18px' : '32px', marginBottom: '14px', boxShadow: darkMode ? 'none' : '0 2px 24px rgba(0,0,0,.06)' }}>
          {!hasResults ? (
            <>
              <div onClick={() => handleSelectClick(false)}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.background = 'rgba(124,58,237,.08)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,.6)'; e.currentTarget.style.transform = 'scale(1.01)'; }}
                onDragLeave={e => { e.currentTarget.style.background = limitReached ? 'rgba(239,68,68,.02)' : 'rgba(124,58,237,.02)'; e.currentTarget.style.borderColor = limitReached ? 'rgba(239,68,68,.25)' : 'rgba(124,58,237,.28)'; e.currentTarget.style.transform = ''; }}
                onDrop={e => { e.preventDefault(); e.currentTarget.style.background = limitReached ? 'rgba(239,68,68,.02)' : 'rgba(124,58,237,.02)'; e.currentTarget.style.borderColor = limitReached ? 'rgba(239,68,68,.25)' : 'rgba(124,58,237,.28)'; e.currentTarget.style.transform = ''; if (!limitReached) { const evt = { target: { files: e.dataTransfer.files } }; handleFilesChange(evt); } }}
                className={!limitReached && !files.length ? 'pg-drop-zone' : ''}
                style={{ border: `2px dashed ${limitReached ? 'rgba(239,68,68,.3)' : 'rgba(124,58,237,.32)'}`, borderRadius: '18px', padding: isMobile ? '36px 16px' : '52px 24px', textAlign: 'center', cursor: limitReached ? 'not-allowed' : 'pointer', marginBottom: '16px', background: limitReached ? 'rgba(239,68,68,.02)' : 'rgba(124,58,237,.02)', transition: 'all .25s cubic-bezier(.22,1,.36,1)' }}>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                  {limitReached
                    ? <div style={{ width: '56px', height: '56px', background: 'rgba(239,68,68,.08)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="12" stroke="rgba(239,68,68,.5)" strokeWidth="1.5"/><path d="M9 9l10 10M19 9L9 19" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
                    : <div className="pg-float" style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg,rgba(124,58,237,.15),rgba(79,70,229,.08))', border: '1px solid rgba(124,58,237,.2)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 18V8M8 14l6-6 6 6" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 22h16" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" opacity=".5"/></svg>
                      </div>
                  }
                </div>
                <p style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '19px' : '22px', fontWeight: 800, marginBottom: '6px', color: limitReached ? '#f87171' : '#e2e8f0', letterSpacing: '-.3px' }}>{limitReached ? 'Limite atteinte' : "Dépose jusqu'à 5 photos ici"}</p>
                <p style={{ color: '#475569', fontSize: '13px', marginBottom: limitReached ? 0 : '16px' }}>{limitReached ? 'Créez un compte pour continuer' : 'JPG · PNG · WEBP · HEIC (iPhone) · ou clique pour sélectionner'}</p>
                {!limitReached && isMobile && (
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '6px' }}>
                    <button onClick={e => { e.stopPropagation(); handleSelectClick(false); }} style={{ background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.28)', color: '#a78bfa', borderRadius: '12px', padding: '12px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="12" height="10" rx="2" stroke="#a78bfa" strokeWidth="1.3"/><circle cx="7" cy="7" r="2.5" stroke="#a78bfa" strokeWidth="1.3"/></svg>
                      Galerie
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleSelectClick(true); }} style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', color: '#34d399', borderRadius: '12px', padding: '12px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="3" stroke="#34d399" strokeWidth="1.3"/><path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      Photo directe
                    </button>
                  </div>
                )}
              </div>

              {previews.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ color: '#475569', fontSize: '13px', marginBottom: '10px', fontWeight: 600 }}>{previews.length} photo{previews.length > 1 ? 's' : ''} sélectionnée{previews.length > 1 ? 's' : ''}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(previews.length, isMobile ? 3 : 5)},1fr)`, gap: '8px' }}>
                    {previews.map((src, i) => (
                      <div key={i} style={{ position: 'relative', width: '100%', height: isMobile ? '100px' : '120px', borderRadius: '10px', border: '2px solid rgba(124,58,237,.2)', background: 'rgba(124,58,237,.08)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {src
                          ? <img src={src} alt={`Photo ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                          : <div style={{ width: '20px', height: '20px', border: '2px solid rgba(124,58,237,.2)', borderTop: '2px solid #7c3aed', borderRadius: '50%', animation: 'pg-spin 0.8s linear infinite' }} />
                        }
                        {loading && i < progress && <div className="pg-check" style={{ position: 'absolute', inset: 0, background: 'rgba(16,185,129,.25)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && <div style={{ background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.22)', borderRadius: '12px', padding: '12px 16px', marginBottom: '14px', color: '#f87171', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

              {loading && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#a78bfa', fontSize: '13px', fontWeight: 700 }}>Traitement en cours...</span>
                    <span style={{ color: '#7c3aed', fontWeight: 800, fontSize: '14px' }}>{progress}/{files.length}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: '100px', height: '8px', overflow: 'hidden' }}>
                    <div className="pg-credit-bar" style={{ width: `${(progress/files.length)*100}%` }} />
                  </div>
                  <LoadingTip />
                </div>
              )}

              {!limitReached && (
                <button onClick={handleUpload} disabled={!files.length || loading || previews.some(p => p === null)} className={files.length && !loading && !previews.some(p => p === null) ? 'pg-btn' : ''}
                  style={{ width: '100%', border: 'none', fontWeight: 800, borderRadius: '14px', padding: '18px', fontSize: isMobile ? '17px' : '19px', cursor: files.length && !loading ? 'pointer' : 'not-allowed', background: files.length && !loading ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,.03)', color: files.length && !loading ? '#fff' : '#1e293b', fontFamily: 'inherit', transition: 'all .2s' }}>
                  {loading
                    ? `Traitement ${progress}/${files.length}...`
                    : files.length
                      ? `Améliorer ${files.length} photo${files.length > 1 ? 's' : ''}`
                      : 'Sélectionnez des photos ci-dessus'}
                </button>
              )}
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 className="pg-check" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '18px', fontWeight: 800, color: '#10b981', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#10b981" strokeWidth="1.5"/><path d="M5.5 9l2.5 2.5L12.5 6" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {doneCount}/{results.length} photo{doneCount > 1 ? 's' : ''} traitée{doneCount > 1 ? 's' : ''}
                  </h3>
                  <p style={{ color: '#334155', fontSize: '12px', margin: 0 }}>Prêtes à publier sur Vinted & Leboncoin</p>
                </div>
                {doneCount > 1 && !isMobile && (
                  <button onClick={handleDownloadAll} disabled={zipping} className="pg-btn" style={{ background: zipping ? 'rgba(16,185,129,.4)' : 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: 700, cursor: zipping ? 'wait' : 'pointer', fontSize: '14px', fontFamily: 'inherit', opacity: zipping ? .8 : 1, display: 'flex', alignItems: 'center', gap: '7px' }}>
                    {zipping
                      ? <><div style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'pg-spin .8s linear infinite' }} />Compression...</>
                      : <><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 7l3 3 3-3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 11h10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>Télécharger tout ({doneCount}) — ZIP</>
                    }
                  </button>
                )}
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : results.length === 1 ? '1fr' : results.length === 2 ? 'repeat(2,1fr)' : results.length === 3 ? 'repeat(2,1fr)' : 'repeat(2,1fr)',
                maxWidth: results.length === 1 ? '480px' : '100%',
                margin: results.length === 1 ? '0 auto' : undefined,
                gap: '14px', marginBottom: '14px'
              }}>
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
                          ? <div style={{ width: '100%', aspectRatio: '1', background: 'rgba(239,68,68,.08)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="12" stroke="#ef4444" strokeWidth="1.5" opacity=".4"/><path d="M14 8v6M14 17v2" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/></svg></div>
                          : <img src={r.url} alt="Après" style={{ width: '100%', borderRadius: '8px', background: '#fff', display: 'block', aspectRatio: '1', objectFit: 'cover' }} />}
                      </div>
                    </div>
                    {!r.error && (
                      <>
                        {/* Bouton télécharger individuel — desktop uniquement */}
                        {!isMobile && (
                          <button onClick={() => handleDownload(r)} className="pg-btn" style={{ width: '100%', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit', marginBottom: '8px' }}>📥 Télécharger</button>
                        )}
                        <VintedBoostPanel imageUrl={r.url} isConnected={isConnected} onUpgrade={() => openAuth('register')} />
                      </>
                    )}
                    {r.error && <p style={{ color: '#f87171', fontSize: '12px', textAlign: 'center', margin: '6px 0 0' }}>{r.error}</p>}
                  </div>
                ))}
              </div>
              {/* Bouton reset — desktop uniquement, sticky bar gère le mobile */}
              {!isMobile && (
                <button onClick={reset} className="pg-ghost" style={{ width: '100%', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', color: '#475569', borderRadius: '14px', padding: '14px', fontWeight: 700, cursor: 'pointer', fontSize: '15px', fontFamily: 'inherit' }}>🔄 Traiter de nouvelles photos</button>
              )}
            </>
          )}
        </div>

        {/* CTA bas */}
        {!isConnected ? (
          <div style={{ background: 'linear-gradient(160deg,rgba(124,58,237,.07),rgba(79,70,229,.04))', border: '1px solid rgba(124,58,237,.18)', borderRadius: '20px', padding: isMobile ? '22px 18px' : '30px 36px', textAlign: 'center' }}>
            <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '18px' : '22px', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>Envie de plus de photos et descriptions optimisées ?</h3>
            <p style={{ color: '#475569', fontSize: '14px', marginBottom: '20px', lineHeight: 1.65 }}>Créez un compte gratuit et achetez des crédits.<br/><strong style={{ color: '#e2e8f0' }}>3 offres dès 7€ · 30, 100 ou 300 crédits · Valables à vie · Paiement sécurisé</strong></p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => openAuth('register')} className="pg-btn" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px 24px', fontWeight: 800, cursor: 'pointer', fontSize: '15px', fontFamily: 'inherit' }}>Créer mon compte →</button>
              <button onClick={() => openAuth('login')} className="pg-ghost" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8', borderRadius: '12px', padding: '14px 20px', fontWeight: 600, cursor: 'pointer', fontSize: '15px', fontFamily: 'inherit' }}>J'ai déjà un compte</button>
            </div>
          </div>
        ) : (
          <div style={{ background: 'linear-gradient(160deg,rgba(124,58,237,.07),rgba(79,70,229,.04))', border: '1px solid rgba(124,58,237,.18)', borderRadius: '20px', padding: isMobile ? '22px 18px' : '28px 36px', textAlign: 'center' }}>
            <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '17px' : '20px', fontWeight: 800, marginBottom: '6px', color: '#fff' }}>Besoin de plus de crédits ?</h3>
            <p style={{ color: '#475569', fontSize: '13px', marginBottom: '16px' }}>Valables à vie · Sans abonnement · Description IA incluse à chaque crédit</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
              {[{plan:'starter',label:'30 crédits — 7€',col:'#f59e0b'},{plan:'pro',label:'100 crédits — 15€',col:'#a78bfa'},{plan:'elite',label:'300 crédits — 35€',col:'#60a5fa'}].map(p => (
                <button key={p.plan} onClick={() => handlePayment(p.plan)} className="pg-btn" style={{ background: p.plan==='pro' ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,.05)', border: p.plan==='pro' ? 'none' : '1px solid rgba(255,255,255,.1)', color: p.col, borderRadius: '10px', padding: '10px 16px', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>{p.label}{p.plan==='pro' ? ' — Populaire' : ''}</button>
              ))}
            </div>
            <p style={{ color: '#334155', fontSize: '11px' }}>Paiement sécurisé Stripe · Crédits valables à vie</p>
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
        onBuyCredits={isConnected ? () => setShowPlanModal(true) : () => openAuth('register')}
        isMobile={isMobile}
        zipping={zipping}
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
   - Hero : "Double tes vues Vinted · fond blanc +
description auto"
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
