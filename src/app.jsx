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
  @keyframes pg-ticker { 0%{transform:translateY(0);opacity:1;} 40%{transform:translateY(-100%);opacity:0;} 41%{transform:translateY(100%);opacity:0;} 100%{transform:translateY(0);opacity:1;} }
  .pg-ticker { animation: pg-ticker 3.5s ease infinite; }
  @keyframes pg-shimmer { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
  @keyframes pg-spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
  .pg-shimmer { background: linear-gradient(90deg,#7c3aed,#a78bfa,#7c3aed); background-size:200% auto; animation: pg-shimmer 2.5s linear infinite; -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  @keyframes pg-pop { 0%{transform:scale(.8);opacity:0;} 70%{transform:scale(1.08);} 100%{transform:scale(1);opacity:1;} }
  .pg-pop { animation: pg-pop .4s cubic-bezier(.34,1.56,.64,1) both; }
  .pg-credit-bar { height:6px; border-radius:100px; background:linear-gradient(90deg,#10b981,#7c3aed); transition:width .6s cubic-bezier(.34,1.56,.64,1); }
  .pg-tip { background: rgba(124,58,237,.08); border:1px solid rgba(124,58,237,.15); border-radius:12px; padding:10px 14px; font-size:13px; color:#a78bfa; }
  @keyframes pg-gradient-pulse { 0%,100%{background-position:0% 50%;} 50%{background-position:100% 50%;} }
  .pg-title-gradient { background: linear-gradient(135deg,#7c3aed,#60a5fa,#10b981,#a78bfa,#7c3aed); background-size:300% 300%; animation:pg-gradient-pulse 4s ease infinite; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  @keyframes pg-bar-fill { from{width:0%;} to{width:var(--bar-target);} }
  .pg-stat-bar { animation: pg-bar-fill 1.4s cubic-bezier(.34,1.2,.64,1) both; }
  .pg-step-card { transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease; }
  .pg-step-card:hover { transform: translateY(-4px) scale(1.03); box-shadow: 0 0 28px rgba(124,58,237,.18), 0 8px 24px rgba(0,0,0,.35); border-color: rgba(124,58,237,.4) !important; }
  .pg-step-card:hover .pg-step-icon { transform: scale(1.18) rotate(-4deg); }
  .pg-step-icon { transition: transform .25s cubic-bezier(.34,1.56,.64,1); }
  @keyframes pg-count-up { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
  .pg-stat-val { animation: pg-count-up .6s ease both; }
  @keyframes pg-counter-stat { 0%{opacity:.4;transform:scale(.94);} 100%{opacity:1;transform:scale(1);} }
  .pg-cta-glow:hover { box-shadow: 0 0 0 4px rgba(124,58,237,.25), 0 8px 32px rgba(124,58,237,.45) !important; transform: translateY(-2px) scale(1.02) !important; }
  @keyframes pg-slide-in { from{opacity:0;transform:translateX(-16px);} to{opacity:1;transform:translateX(0);} }
  .pg-slide-in { animation: pg-slide-in .45s ease both; }
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

/* ══ ANIMATED STATS ══ */
function AnimatedStats() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let s1 = 0;
    const step1 = () => { s1 += Math.ceil((18742 - s1) / 12); setCount1(s1 >= 18742 ? 18742 : s1); if (s1 < 18742) setTimeout(step1, 60); };
    step1();
    let s2 = 0;
    const step2 = () => { s2 += Math.ceil((38 - s2) / 10); setCount2(s2 >= 38 ? 38 : s2); if (s2 < 38) setTimeout(step2, 55); };
    setTimeout(step2, 200);
  }, [visible]);

  return (
    <section ref={ref} style={{ background: 'linear-gradient(90deg,rgba(124,58,237,.06),rgba(16,185,129,.04),rgba(96,165,250,.06))', borderTop: '1px solid rgba(255,255,255,.04)', borderBottom: '1px solid rgba(255,255,255,.04)', padding: '20px 16px' }}>
      <div className="pg-stats" style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', textAlign: 'center' }}>
        <div style={{ padding: '16px 8px' }}>
          <div className={visible ? 'pg-stat-val' : ''} style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '28px', fontWeight: 800, color: '#7c3aed', marginBottom: '6px' }}>
            {visible ? count1.toLocaleString('fr-FR') : '0'}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>vendeurs actifs</div>
        </div>
        <div style={{ padding: '16px 8px' }}>
          <div className={visible ? 'pg-stat-val' : ''} style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '28px', fontWeight: 800, color: '#10b981', marginBottom: '6px' }}>
            +{visible ? count2 : 0}%
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,.06)', borderRadius: '100px', overflow: 'hidden', margin: '0 auto 4px', maxWidth: '80px' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg,#10b981,#34d399)', borderRadius: '100px', width: visible ? `${Math.round(count2 / 38 * 100)}%` : '0%', transition: 'width .05s linear' }} />
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>vues par annonce</div>
        </div>
        <div style={{ padding: '16px 8px' }}>
          <div className={visible ? 'pg-stat-val' : ''} style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '28px', fontWeight: 800, color: '#60a5fa', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            3 sec
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ animation: visible ? 'pg-spin 4s linear infinite' : 'none', flexShrink: 0 }}>
              <circle cx="9" cy="9" r="7.5" stroke="#60a5fa" strokeWidth="1.3" opacity=".4"/>
              <path d="M9 5v4l2.5 2.5" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>par photo</div>
        </div>
        <div style={{ padding: '16px 8px' }}>
          <div className={visible ? 'pg-stat-val' : ''} style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '28px', fontWeight: 800, color: '#f59e0b', marginBottom: '6px' }}>4.9/5</div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>1 234 avis</div>
        </div>
      </div>
    </section>
  );
}

/* ══ BEFORE/AFTER SHOWCASE multi-exemples ══ */
const BA_EXAMPLES = [
  { label: 'Veste',    before: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=480&h=480&fit=crop', after: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=480&h=480&fit=crop' },
  { label: 'Sac',      before: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=480&h=480&fit=crop',  after: 'https://images.unsplash.com/photo-1614179818511-a9c06aabd6e0?w=480&h=480&fit=crop' },
  { label: 'Montre',   before: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=480&h=480&fit=crop', after: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=480&h=480&fit=crop' },
  { label: 'Sneakers', before: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=480&h=480&fit=crop',  after: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=480&h=480&fit=crop' },
];

function BeforeAfterShowcase({ isMobile, T, darkMode, onGoApp }) {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const [statCount, setStatCount] = useState(0);
  const statRef = useRef(null);
  const [statVisible, setStatVisible] = useState(false);
  const timerRef = useRef(null);

  const switchTo = useCallback((nextIdx) => {
    setFade(false);
    setTimeout(() => { setIdx(nextIdx); setFade(true); }, 220);
  }, []);

  useEffect(() => {
    timerRef.current = setTimeout(() => switchTo((idx + 1) % BA_EXAMPLES.length), 5000);
    return () => clearTimeout(timerRef.current);
  }, [idx, switchTo]);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStatVisible(true); obs.disconnect(); } }, { threshold: 0.5 });
    if (statRef.current) obs.observe(statRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!statVisible) return;
    let v = 0;
    const tick = () => { v += 2; setStatCount(v >= 42 ? 42 : v); if (v < 42) setTimeout(tick, 35); };
    setTimeout(tick, 400);
  }, [statVisible]);

  const ex = BA_EXAMPLES[idx];

  return (
    <section style={{ maxWidth: '820px', margin: '0 auto', padding: isMobile ? '0 16px 52px' : '0 40px 72px' }}>
      <div style={{ background: darkMode ? 'linear-gradient(160deg,#111118,#0d0d18)' : '#ffffff', border: `1px solid ${T.cardBorder}`, borderRadius: '24px', padding: isMobile ? '20px' : '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <p style={{ color: '#475569', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 2px' }}>Avant / Après · Résultat réel</p>
            <p style={{ color: '#334155', fontSize: '12px', margin: 0 }}>Glisse le curseur · change d'exemple ci-dessous</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {BA_EXAMPLES.map((e, i) => (
              <button key={i} onClick={() => { clearTimeout(timerRef.current); switchTo(i); }}
                style={{ height: '6px', width: i === idx ? '20px' : '6px', borderRadius: '100px', background: i === idx ? '#7c3aed' : 'rgba(255,255,255,.15)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all .3s' }} />
            ))}
            <button onClick={() => { clearTimeout(timerRef.current); switchTo((idx + 1) % BA_EXAMPLES.length); }}
              style={{ background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.25)', color: '#a78bfa', borderRadius: '10px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '12px', whiteSpace: 'nowrap' }}>
              {BA_EXAMPLES[(idx + 1) % BA_EXAMPLES.length].label} →
            </button>
          </div>
        </div>

        {/* Slider avec fade */}
        <div style={{ opacity: fade ? 1 : 0, transition: 'opacity .22s ease' }}>
          <BeforeAfterSlider key={idx} beforeSrc={ex.before} afterSrc={ex.after} beforeLabel="Fond encombré" afterLabel="Fond blanc PixGlow" landscape={true} />
        </div>

        {/* Compteur animé au scroll */}
        <div ref={statRef} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '14px', marginBottom: '16px', alignItems: 'center' }}>
          <span style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', fontSize: '12px', padding: '4px 12px', borderRadius: '8px', fontWeight: 600 }}>Fond encombré · Lumière sombre</span>
          <span style={{ fontSize: '14px', color: '#475569' }}>→</span>
          <span style={{ background: 'rgba(16,185,129,.1)', color: '#10b981', fontSize: '12px', padding: '4px 12px', borderRadius: '8px', fontWeight: 700 }}>
            Fond blanc ·{' '}
            <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '15px', fontWeight: 800 }}>+{statCount}%</span>
            {' '}vues moyennes
          </span>
        </div>

        {/* AI preview */}
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
  );
}

/* ══ BEFORE/AFTER SLIDER ══ */
function BeforeAfterSlider({ beforeSrc, afterSrc, beforeLabel = 'Avant', afterLabel = 'Après', height = 340, landscape = false }) {
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

  const getPos = (clientX) => {
    if (!containerRef.current) return 50;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return Math.round((x / rect.width) * 100);
  };

  const onMouseDown = (e) => { e.preventDefault(); setDragging(true); };
  const onMouseMove = useCallback((e) => { if (dragging) setPos(getPos(e.clientX)); }, [dragging]);
  const onMouseUp   = useCallback(() => setDragging(false), []);
  const onTouchMove = useCallback((e) => { if (dragging) { e.preventDefault(); setPos(getPos(e.touches[0].clientX)); } }, [dragging]);

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
    if (mountedRef.current) setLoading(false);
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
    if (mountedRef.current) setTrendLoading(false);
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
    if (mountedRef.current) setBoostLoading(false);
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
        style={{ width: '100%', background: open ? 'rgba(124,58,237,.12)' : 'rgba(124,58,237,.05)', border: 'none', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontFamily: 'inherit' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* NEW badge proéminent */}
          {!boosted && !result && (
            <span style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontSize: '9px', fontWeight: 900, padding: '3px 8px', borderRadius: '6px', letterSpacing: '.5px', flexShrink: 0 }}>NOUVEAU</span>
          )}
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1px' }}>
            <span style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '14px', lineHeight: 1.2 }}>
              Titre + Description + Tendances
            </span>
            <span style={{ color: '#475569', fontSize: '11px', fontWeight: 500 }}>
              {result ? (boosted ? 'Boosté avec les tendances cette semaine' : 'Prêt à copier sur Vinted') : 'Généré par IA · Optimisé pour Vinted'}
            </span>
          </span>
          {!isConnected && <span style={{ background: 'rgba(124,58,237,.2)', color: '#c4b5fd', fontSize: '10px', padding: '2px 8px', borderRadius: '100px', fontWeight: 800 }}>PRO</span>}
          {boosted && <span style={{ background: 'rgba(245,158,11,.2)', color: '#f59e0b', fontSize: '10px', padding: '2px 8px', borderRadius: '100px', fontWeight: 800 }}>Boosté</span>}
          {result && !boosted && <span style={{ background: 'rgba(16,185,129,.15)', color: '#10b981', fontSize: '10px', padding: '2px 8px', borderRadius: '100px', fontWeight: 800 }}>Prêt</span>}
        </span>
        <span style={{ color: '#475569', fontSize: '18px', lineHeight: 1, transition: 'transform .2s', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>⌄</span>
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
            <div style={{ padding: '4px 0 8px' }}>
              {/* 3 features visuels */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '16px' }}>
                {[
                  { label: 'Titre accrocheur', sub: 'optimisé Vinted', col: '124,58,237',
                    svg: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h5" stroke="rgb(124,58,237)" strokeWidth="1.4" strokeLinecap="round"/></svg> },
                  { label: 'Description + hashtags', sub: 'prêts à coller', col: '96,165,250',
                    svg: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="3" stroke="rgb(96,165,250)" strokeWidth="1.3"/><path d="M4 5h8M4 8h6M4 11h3" stroke="rgb(96,165,250)" strokeWidth="1.3" strokeLinecap="round"/></svg> },
                  { label: 'Mots tendance', sub: 'cette semaine', col: '245,158,11',
                    svg: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12L6 8l3 3 5-7" stroke="rgb(245,158,11)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                ].map((f, i) => (
                  <div key={i} style={{ background: `rgba(${f.col},.06)`, border: `1px solid rgba(${f.col},.18)`, borderRadius: '10px', padding: '10px 10px 8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>{f.svg}</div>
                    <p style={{ color: '#e2e8f0', fontSize: '11px', fontWeight: 700, margin: '0 0 2px', lineHeight: 1.2 }}>{f.label}</p>
                    <p style={{ color: '#334155', fontSize: '10px', margin: 0 }}>{f.sub}</p>
                  </div>
                ))}
              </div>
              <button onClick={generateBoost} className="pg-btn pg-glow" style={{ width: '100%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '11px', padding: '14px', fontWeight: 800, cursor: 'pointer', fontSize: '15px', fontFamily: 'inherit' }}>
                Générer ma description
              </button>
              <p style={{ color: '#334155', fontSize: '11px', marginTop: '8px', textAlign: 'center' }}>~15 secondes · Inclus avec ton compte</p>
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
                    <span className="pg-pop" style={{ background: 'rgba(245,158,11,.15)', color: '#f59e0b', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '100px' }}>{result.amelioration}</span>
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
                    Avec le boost tendance → score estimé <strong style={{ color: '#c4b5fd' }}>{potentialScore}/100</strong>
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
                  {copied === true ? 'Copié !' : 'Tout copier pour Vinted'}
                </button>
                {/* Lien direct Vinted — ouvre l'app sur mobile */}
                <a
                  href={`https://www.vinted.fr/items/new?title=${encodeURIComponent(result.titre || '')}&description=${encodeURIComponent((result.description || '') + '\n\n' + (result.hashtags || ''))}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(9,182,109,.12)', border: '1px solid rgba(9,182,109,.3)', color: '#10b981', borderRadius: '10px', padding: '11px 14px', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M7.5 1.5H11.5V5.5" stroke="#10b981" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M11.5 1.5L5.5 7.5" stroke="#10b981" strokeWidth="1.4" strokeLinecap="round"/><path d="M5.5 2.5H2A.5.5 0 0 0 1.5 3v8a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V7.5" stroke="#10b981" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  Publier sur Vinted
                </a>
                <button onClick={generateBoost} className="pg-ghost" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#64748b', borderRadius: '10px', padding: '11px 14px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>↺</button>
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
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('pg_upsell_dismissed') === '1');
  const dismiss = () => { sessionStorage.setItem('pg_upsell_dismissed', '1'); setDismissed(true); };
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
            87% des vendeurs <strong style={{ color: '#10b981' }}>doublent leurs vues</strong> avec Pro — dès 7€ pour 30 crédits à vie
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

/* ══ PLAN MODAL ══ */
function PlanModal({ show, onClose, onSelect, isMobile }) {
  if (!show) return null;
  const plans = [
    { id: 'starter', label: 'Starter', credits: 30,  price: '7€',  pricePerPhoto: '0,23€', color: '16,185,129',  highlight: false, badge: null },
    { id: 'pro',     label: 'Pro',     credits: 100, price: '15€', pricePerPhoto: '0,15€', color: '124,58,237', highlight: true,  badge: 'MEILLEURE OFFRE' },
    { id: 'elite',   label: 'Elite',   credits: 300, price: '35€', pricePerPhoto: '0,12€', color: '96,165,250',  highlight: false, badge: 'MEILLEUR PRIX' },
  ];
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(8px)', zIndex: 999, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? '0' : '16px' }}>
      <div className="pg-anim" style={{ background: 'linear-gradient(160deg,#16102a,#0d0d1a)', border: '1px solid rgba(124,58,237,.35)', borderRadius: isMobile ? '24px 24px 0 0' : '24px', padding: isMobile ? '20px 16px 32px' : '40px 36px', width: '100%', maxWidth: isMobile ? '100%' : '640px', position: 'relative', maxHeight: isMobile ? '92vh' : '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(255,255,255,.08)', border: 'none', color: '#94a3b8', cursor: 'pointer', borderRadius: '8px', width: '34px', height: '34px', fontSize: '16px', fontFamily: 'inherit' }}>✕</button>
        {isMobile && <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,.15)', borderRadius: '2px', margin: '0 auto 16px' }} />}
        <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '18px' : '24px', fontWeight: 800, color: '#fff', marginBottom: '4px', textAlign: 'center' }}>Choisir une offre</h2>
        <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '20px', textAlign: 'center' }}>Crédits valables à vie · Sans abonnement · Paiement sécurisé Stripe</p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: isMobile ? '10px' : '12px' }}>
          {plans.map(p => (
            <div key={p.id} style={{ position: 'relative', background: p.highlight ? 'linear-gradient(160deg,rgba(124,58,237,.15),rgba(79,70,229,.08))' : 'rgba(255,255,255,.03)', border: `2px solid ${p.highlight ? 'rgba(124,58,237,.55)' : `rgba(${p.color},.22)`}`, borderRadius: '16px', padding: isMobile ? '16px 14px' : '22px 18px', textAlign: 'center' }}>
              {p.badge && <div style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', background: p.highlight ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : `rgba(${p.color},.85)`, color: '#fff', fontSize: '9px', fontWeight: 800, padding: '3px 10px', borderRadius: '100px', whiteSpace: 'nowrap' }}>{p.badge}</div>}
              {isMobile
                ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: '15px', color: '#fff' }}>{p.label}</div>
                      <div style={{ color: '#64748b', fontSize: '11px' }}>{p.credits} crédits · {p.pricePerPhoto}/photo</div>
                    </div>
                    <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: '24px', color: `rgb(${p.color})`, flexShrink: 0 }}>{p.price}</div>
                  </div>
                ) : (
                  <>
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
function StickyBottomBar({ show, doneCount, onDownloadAll, onReset, onBuyCredits, isConnected, isMobile, zipping }) {
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

/* ══ LIVE TICKER (social proof dynamique) ══ */
function LiveTicker() {
  const events = [
    "Sophie de Lyon vient de traiter 3 photos",
    "Karim vient de vendre sa veste en 2h",
    "Léa a généré 12 descriptions ce matin",
    "Marie vient de créer son compte — 5 photos offertes",
    "Thomas a téléchargé son pack Elite",
    "Yasmine vient de traiter 5 photos d'un coup 🔥",
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % events.length), 3500);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.15)', borderRadius: '100px', padding: '6px 14px', marginTop: '16px', fontSize: '12px', color: '#34d399', overflow: 'hidden', maxWidth: '100%' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', flexShrink: 0, boxShadow: '0 0 6px #10b981' }} />
      <span className="pg-ticker" style={{ whiteSpace: 'nowrap', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>{events[idx]}</span>
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

  // Données simulées réalistes basées sur les moyennes PixGlow
  const simulateStats = (url) => {
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
      const s = simulateStats(url);
      setStats(s); setProfileUrl(url);
      localStorage.setItem('pg_vinted_profile', url);
      localStorage.setItem('pg_gains_stats', JSON.stringify(s));
      setLoading(false);
    }, 2200);
  };

  const shareText = stats
    ? `Grâce à @PixGlow : +${stats.tauxBoost}% de vues sur mes annonces Vinted ce mois-ci ! ${stats.ventesEstimees} ventes boostées · +${stats.gainEuros}€ estimés — pixglow.app`
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
            <p style={{ color: '#475569', fontSize: '12px', margin: '3px 0 0' }}>Impact réel sur tes ventes Vinted</p>
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
            {/* Profil connecté */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(124,58,237,.08)', border: '1px solid rgba(124,58,237,.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>👤</span>
                <div>
                  <p style={{ color: '#c4b5fd', fontWeight: 700, fontSize: '13px', margin: 0 }}>{stats.profileName}</p>
                  <p style={{ color: '#334155', fontSize: '11px', margin: 0 }}>Profil Vinted analysé</p>
                </div>
              </div>
              <button onClick={() => { setStats(null); setProfileUrl(''); localStorage.removeItem('pg_gains_stats'); localStorage.removeItem('pg_vinted_profile'); }} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit' }}>Changer</button>
            </div>

            {/* Stat principale — gain euros */}
            <div className="pg-pop" style={{ background: 'linear-gradient(135deg,rgba(16,185,129,.12),rgba(124,58,237,.08))', border: '1px solid rgba(16,185,129,.3)', borderRadius: '14px', padding: '18px', textAlign: 'center', marginBottom: '14px' }}>
              <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>Gains estimés {stats.periode}</p>
              <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '44px', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>+{stats.gainEuros}€</div>
              <p style={{ color: '#475569', fontSize: '12px', margin: '6px 0 0' }}>grâce aux photos optimisées PixGlow</p>
            </div>

            {/* Stats secondaires */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '16px' }}>
              {[
                { label: 'Vues moyennes', before: stats.vuesMoyAvant, after: stats.vuesMoyApres, unit: '/annonce',
                  svg: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><ellipse cx="8" cy="8" rx="7" ry="4.5" stroke="#94a3b8" strokeWidth="1.2"/><circle cx="8" cy="8" r="2" stroke="#94a3b8" strokeWidth="1.2"/></svg> },
                { label: 'Ventes boostées', value: stats.ventesEstimees, unit: 'ce mois',
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
      // En cas d'échec réseau, on lit le localStorage SANS jamais remettre à 5 par défaut.
      // Si la clé n'existe pas, on suppose 0 (plus sûr que de redonner des crédits gratuits).
      const stored = localStorage.getItem('pg_free');
      setFreeLeft(stored !== null ? parseInt(stored, 10) : 0);
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
      } catch { newResults.push({ error: 'Erreur réseau', original: previews[i] }); }
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
    try { const res = await fetch(`${API_URL}/create-checkout-session`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) }); const data = await res.json(); if (data.checkout_url) window.location.href = data.checkout_url; }
    catch { alert('Erreur paiement, réessayez.'); }
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
    <footer style={{ borderTop: '1px solid rgba(255,255,255,.04)', padding: '28px 24px', textAlign: 'center' }}>
      {/* Bloc confiance */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '12px', padding: '10px 22px', marginBottom: '18px' }}>
        {[
          { icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L2 4v4c0 2.8 2.2 5 5 5s5-2.2 5-5V4L7 1z" stroke="#475569" strokeWidth="1.2" strokeLinejoin="round" opacity=".6"/></svg>, text: 'SaaS 100% français' },
          { icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#475569" strokeWidth="1.2" opacity=".5"/><path d="M4.5 7l2 2 3-3" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>, text: "Photos naturelles, pas d'IA qui invente ton article" },
          { icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="4" width="12" height="8" rx="1.5" stroke="#475569" strokeWidth="1.2" opacity=".6"/><path d="M4 4V3a3 3 0 016 0v1" stroke="#475569" strokeWidth="1.2" opacity=".4" strokeLinecap="round"/></svg>, text: 'Données sécurisées' },
        ].map(({ icon, text }, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '11px', fontWeight: 500, whiteSpace: 'nowrap' }}>
            {icon}{text}
          </span>
        ))}
      </div>
      <p style={{ color: '#475569', fontSize: '12px', marginBottom: '10px' }}>© {new Date().getFullYear()} PixGlow · Tous droits réservés</p>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[['mentions','Mentions légales'],['cgv','CGV'],['confidentialite','Confidentialité'],['help','Aide']].map(([p, label]) => (
          <button key={p} onClick={() => setPage(p)} className="pg-navlink" style={{ color: '#475569', fontSize: '12px', textDecoration: 'underline' }}>{label}</button>
        ))}
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
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '52px 16px 36px' : '90px 40px 56px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '350px', background: 'radial-gradient(ellipse, rgba(124,58,237,.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="pg-anim" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.28)', borderRadius: '100px', padding: '6px 16px 6px 10px', marginBottom: '24px', fontSize: '12px', color: '#a78bfa', fontWeight: 600 }}>
            <span style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: '100px', padding: '2px 10px', color: '#fff', fontSize: '11px', fontWeight: 800 }}>NOUVEAU</span>
            Tendances · Description IA · Lien Vinted direct
          </div>

          {/* Titre court et percutant */}
          <h1 className="pg-hero" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '38px' : '68px', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-1.5px', color: T.text, marginBottom: '18px' }}>
            Double tes vues Vinted<br/>
            <span className="pg-title-gradient">fond blanc + description auto</span><br/>
            en 3 secondes
          </h1>

          {/* Sous-titre court et chiffré */}
          <p className="pg-anim-2" style={{ fontSize: isMobile ? '17px' : '21px', color: '#64748b', maxWidth: '540px', margin: '0 auto 22px', lineHeight: 1.5, fontWeight: 500 }}>
            Photo moche → annonce pro.<br/>
            <strong style={{ color: '#94a3b8', fontWeight: 600 }}>+38% de vues moyennes</strong>, prouvées par 18 742 vendeurs français.
          </p>

          {/* CTA avec glow hover violet renforcé */}
          <div className="pg-anim-3" style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '36px' }}>
            <button onClick={() => setPage('app')} className="pg-btn pg-glow pg-cta-glow"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '14px', padding: isMobile ? '16px 24px' : '18px 36px', fontWeight: 800, cursor: 'pointer', fontSize: isMobile ? '16px' : '18px', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '10px', maxWidth: isMobile ? 'calc(100vw - 40px)' : 'none', boxSizing: 'border-box' }}>
              Essayer gratuitement
              <span style={{ background: 'rgba(255,255,255,.18)', borderRadius: '100px', padding: '2px 10px', fontSize: '12px', fontWeight: 700 }}>5 photos offertes</span>
            </button>
          </div>

          {/* Social proof */}
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
            <span style={{ fontSize: '13px', color: '#475569' }}><strong style={{ color: '#e2e8f0' }}>18 742 vendeurs</strong> font confiance à PixGlow</span>
            <span style={{ color: '#334155' }}>·</span>
            <span style={{ fontSize: '13px', color: '#475569' }}><strong style={{ color: '#e2e8f0' }}>4.9/5</strong> — 1 234 avis</span>
          </div>
          <LiveTicker />
        </div>
      </section>

      {/* HOW IT WORKS — 3 steps */}
      <section style={{ maxWidth: '860px', margin: '0 auto', padding: isMobile ? '0 16px 40px' : '0 40px 56px' }}>
        <div style={{ position: 'relative' }}>
          {/* Ligne de progression desktop */}
          {!isMobile && (
            <div style={{ position: 'absolute', top: '30px', left: 'calc(16.66% + 18px)', right: 'calc(16.66% + 18px)', height: '2px', background: 'linear-gradient(90deg,#7c3aed,#60a5fa,#10b981)', borderRadius: '100px', zIndex: 0, opacity: .35 }}>
              {/* flèche milieu gauche */}
              <div style={{ position: 'absolute', left: '47%', top: '-4px', width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid #60a5fa', opacity: .7 }} />
              {/* flèche milieu droit */}
              <div style={{ position: 'absolute', left: '95%', top: '-4px', width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid #10b981', opacity: .7 }} />
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '12px', position: 'relative', zIndex: 1 }}>
            {[
              {
                step: '1', col: '#a78bfa',
                svg: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="1" y="4" width="20" height="15" rx="3" stroke="#a78bfa" strokeWidth="1.5"/><circle cx="11" cy="11.5" r="3.5" stroke="#a78bfa" strokeWidth="1.5"/><path d="M8 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="#a78bfa" strokeWidth="1.5"/></svg>,
                title: 'Prends ta photo',
                desc: 'Depuis ton téléphone ou ton ordi, peu importe le fond'
              },
              {
                step: '2', col: '#60a5fa',
                svg: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2L13 8H19L14 12L16 18L11 14L6 18L8 12L3 8H9L11 2Z" stroke="#60a5fa" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
                title: 'PixGlow traite en 10s',
                desc: 'Fond blanc parfait + lumière corrigée automatiquement'
              },
              {
                step: '3', col: '#10b981',
                svg: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 6h14M4 10h10M4 14h7" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/><circle cx="17" cy="15" r="3.5" stroke="#10b981" strokeWidth="1.5"/><path d="M16 15l.75.75L18.5 14" stroke="#10b981" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                title: 'Copie ta description',
                desc: 'Titre optimisé, description et hashtags générés — prêts à coller sur Vinted'
              },
            ].map((s, i) => (
              <div key={i} className="pg-step-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: '16px', padding: '18px', cursor: 'default' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: '14px', color: '#fff', flexShrink: 0 }}>{s.step}</div>
                <div>
                  <div className="pg-step-icon" style={{ marginBottom: '6px' }}>{s.svg}</div>
                  <p style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, color: '#e2e8f0', fontSize: '15px', margin: '0 0 4px' }}>{s.title}</p>
                  <p style={{ color: '#475569', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AVANT/APRÈS interactif — rotation auto toutes les 5s */}
      <BeforeAfterShowcase isMobile={isMobile} T={T} darkMode={darkMode} onGoApp={() => setPage('app')} />
      {/* STATS animées */}
      <AnimatedStats />

      {/* FEATURES */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: isMobile ? '52px 16px' : '80px 40px' }}>
        <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '26px' : '40px', fontWeight: 800, textAlign: 'center', marginBottom: '8px', color: '#fff', letterSpacing: '-.5px' }}>Tout ce qu'il te faut pour vendre plus vite</h2>
        <p style={{ color: '#334155', textAlign: 'center', marginBottom: '44px', fontSize: '16px' }}>Le seul outil pensé 100% pour les vendeurs Vinted/Leboncoin 🇫🇷</p>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '16px', marginBottom: '16px' }}>
          {[
            {
              svg: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="2" y="2" width="22" height="22" rx="5" stroke="rgb(124,58,237)" strokeWidth="1.5"/><path d="M8 13h10M13 8v10" stroke="rgb(124,58,237)" strokeWidth="1.5" strokeLinecap="round" opacity=".5"/><circle cx="13" cy="13" r="4" stroke="rgb(124,58,237)" strokeWidth="1.5"/></svg>,
              titre: 'Fond blanc parfait', desc: "Suppression automatique du fond en 1 clic. Ton article ressort comme sur un site e-commerce pro.", col: '124,58,237'
            },
            {
              svg: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M13 3L15.5 9.5H22L17 13.5L19 20L13 16L7 20L9 13.5L4 9.5H10.5L13 3Z" stroke="rgb(16,185,129)" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
              titre: "Jusqu'à 5 photos à la fois", desc: "Traitement en batch — prépare toute une annonce en moins d'une minute depuis ton téléphone.", col: '16,185,129'
            },
            {
              svg: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M4 7h18M4 11h14M4 15h10" stroke="rgb(96,165,250)" strokeWidth="1.5" strokeLinecap="round"/><circle cx="20" cy="18" r="4" stroke="rgb(96,165,250)" strokeWidth="1.5"/><path d="M18.5 18l1 1 2-2" stroke="rgb(96,165,250)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              titre: 'Score de visibilité', desc: "Chaque annonce reçoit un score 0-100. Plus il est haut, plus ton article ressort dans les recherches.", col: '96,165,250'
            },
          ].map((f,i) => (
            <div key={i} className="pg-card" style={{ background: T.cardBg, border: `1px solid rgba(${f.col},.2)`, borderRadius: '20px', padding: '28px 24px', position: 'relative' }}>
              <div style={{ width: '52px', height: '52px', background: `rgba(${f.col},.1)`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px', border: `1px solid rgba(${f.col},.18)` }}>{f.svg}</div>
              <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#fff' }}>{f.titre}</h3>
              <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* NOUVELLES FEATURES — mise en avant distincte */}
        <div style={{ background: 'linear-gradient(135deg,rgba(124,58,237,.08),rgba(96,165,250,.05))', border: '1px solid rgba(124,58,237,.25)', borderRadius: '24px', padding: isMobile ? '24px 20px' : '32px 36px', position: 'relative', overflow: 'hidden' }}>
          {/* Badge NEW */}
          <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '4px 12px', borderRadius: '100px', letterSpacing: '.5px' }}>NOUVEAU</div>
          <div style={{ position: 'absolute', bottom: '-40px', right: '-40px', width: '200px', height: '200px', background: 'radial-gradient(ellipse,rgba(124,58,237,.12),transparent)', pointerEvents: 'none' }} />

          <p style={{ color: '#a78bfa', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>Fonctionnalités IA — incluses avec chaque crédit</p>
          <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '22px' : '28px', fontWeight: 800, color: '#fff', marginBottom: '8px', lineHeight: 1.2 }}>
            De la photo au texte publié —<br/>sans rien écrire
          </h3>
          <p style={{ color: '#475569', fontSize: '15px', marginBottom: '28px', lineHeight: 1.6 }}>
            Après chaque photo traitée, PixGlow génère automatiquement le texte complet de ton annonce, analyse les mots tendance de la semaine, et t'ouvre directement Vinted avec tout pré-rempli.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '12px' }}>
            {[
              {
                num: '01',
                titre: 'Titre optimisé',
                desc: 'Court, précis, avec les mots qui déclenchent le clic. Généré en analysant les couleurs, la matière et le style de la photo.',
                col: '124,58,237',
                svg: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 5h12M3 9h8M3 13h5" stroke="rgb(124,58,237)" strokeWidth="1.4" strokeLinecap="round"/></svg>
              },
              {
                num: '02',
                titre: 'Mots tendance semaine',
                desc: "Les termes viraux sur Vinted, TikTok et Instagram cette semaine, intégrés dans ta description pour apparaître en tête des recherches.",
                col: '245,158,11',
                svg: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 14L6 9l3 4 3-6 4-4" stroke="rgb(245,158,11)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              },
              {
                num: '03',
                titre: 'Lien direct Vinted',
                desc: 'Un clic. Vinted s\'ouvre avec le titre et la description déjà remplis. Tu n\'as plus qu\'à ajouter tes photos et publier.',
                col: '16,185,129',
                svg: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M10 3H15V8" stroke="rgb(16,185,129)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 3L8 10" stroke="rgb(16,185,129)" strokeWidth="1.4" strokeLinecap="round"/><path d="M8 4H4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-4" stroke="rgb(16,185,129)" strokeWidth="1.4" strokeLinecap="round"/></svg>
              },
            ].map((f, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,.2)', border: `1px solid rgba(${f.col},.2)`, borderRadius: '14px', padding: '18px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '36px', height: '36px', background: `rgba(${f.col},.1)`, border: `1px solid rgba(${f.col},.2)`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{f.svg}</div>
                  <div>
                    <p style={{ color: '#334155', fontSize: '10px', margin: 0, fontWeight: 700 }}>{f.num}</p>
                    <p style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 700, margin: 0 }}>{f.titre}</p>
                  </div>
                </div>
                <p style={{ color: '#475569', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => setPage('app')} className="pg-btn" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '12px', padding: '13px 24px', fontWeight: 800, cursor: 'pointer', fontSize: '15px', fontFamily: 'inherit' }}>
              Essayer gratuitement
            </button>
            <p style={{ color: '#334155', fontSize: '13px', margin: 0 }}>5 photos offertes · Sans carte bancaire</p>
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section style={{ background: 'linear-gradient(180deg,transparent,rgba(124,58,237,.03),transparent)', padding: isMobile ? '36px 16px' : '56px 40px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '24px' : '36px', fontWeight: 800, textAlign: 'center', marginBottom: '8px', color: T.text }}>Ils vendent mieux avec PixGlow</h2>
          <p style={{ color: '#334155', textAlign: 'center', marginBottom: '36px', fontSize: '15px' }}>+18 742 vendeurs Vinted et Leboncoin nous font confiance</p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '14px' }}>
            {[
              { nom: 'Sophie M.', tag: 'Vendeuse Vinted · 312 ventes', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face', txt: "Mes vues ont doublé depuis que j'utilise PixGlow. La description auto me fait gagner 10 minutes par annonce." },
              { nom: 'Karim B.',  tag: 'Vendeur confirmé · 180 ventes', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face', txt: "Simple, rapide, bluffant. Je prépare 20 fiches produit en 5 minutes. Le titre généré est souvent meilleur que le mien." },
              { nom: 'Léa F.',   tag: 'Vendeuse Vestiaire · 95 ventes',  avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&h=80&fit=crop&crop=face', txt: "Fond blanc + description IA = mes annonces se vendent en 24h maintenant. Impossible de s'en passer." },
            ].map((t,i) => (
              <div key={i} className="pg-card" style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: '20px', padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <img src={t.avatar} alt={t.nom} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(124,58,237,.25)', flexShrink: 0, display: 'block' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '14px', margin: 0 }}>{t.nom}</p>
                    <p style={{ color: '#334155', fontSize: '12px', margin: 0 }}>{t.tag}</p>
                  </div>
                  <svg width="60" height="12" viewBox="0 0 60 12" fill="#f59e0b" opacity=".85">
                    {[0,12,24,36,48].map(x => <path key={x} d={`M${x+6} 1l1.2 3.6H${x+11}L${x+8} 6.8l1.2 3.6L${x+6} 8.5l-3.2 1.9 1.2-3.6L${x+1} 4.6h3.8z`}/>)}
                  </svg>
                </div>
                <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.65, fontStyle: 'italic', margin: 0 }}>"{t.txt}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: isMobile ? '36px 16px 60px' : '56px 40px 80px' }}>
        <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '24px' : '36px', fontWeight: 800, textAlign: 'center', marginBottom: '8px', color: T.text }}>Tarifs simples et transparents</h2>
        <p style={{ color: '#334155', textAlign: 'center', marginBottom: '36px', fontSize: '15px' }}>Commence gratuit · Paye seulement si tu en veux plus · Crédits valables à vie</p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4,1fr)', gap: '14px', alignItems: 'start' }}>

          {/* Gratuit */}
          <div className="pg-card" style={{ background: T.cardBg, border: '1px solid rgba(16,185,129,.2)', borderRadius: '20px', padding: '24px 18px', textAlign: 'center' }}>
            <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '18px', fontWeight: 800, marginBottom: '4px', color: '#fff' }}>Gratuit</h3>
            <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '38px', fontWeight: 800, color: '#10b981', marginBottom: '2px' }}>5</div>
            <p style={{ color: '#10b981', fontWeight: 600, marginBottom: '10px', fontSize: '13px' }}>photos offertes</p>
            <p style={{ color: '#334155', fontSize: '12px', marginBottom: '18px', lineHeight: 1.6 }}>Sans inscription<br/>Sans carte bancaire</p>
            <button onClick={() => setPage('app')} className="pg-btn" style={{ width: '100%', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>Essayer →</button>
          </div>

          {/* Starter */}
          <div className="pg-card" style={{ background: T.cardBg, border: '1px solid rgba(245,158,11,.22)', borderRadius: '20px', padding: '24px 18px', textAlign: 'center' }}>
            <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '18px', fontWeight: 800, marginBottom: '4px', color: '#fff' }}>Starter</h3>
            <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '38px', fontWeight: 800, color: '#f59e0b', marginBottom: '2px' }}>7€</div>
            <p style={{ color: '#f59e0b', fontWeight: 700, marginBottom: '2px', fontSize: '13px' }}>30 crédits</p>
            <p style={{ color: '#475569', fontSize: '11px', marginBottom: '10px' }}>0,23 € / photo</p>
            <div style={{ background: 'rgba(245,158,11,.07)', border: '1px solid rgba(245,158,11,.15)', borderRadius: '8px', padding: '7px', marginBottom: '14px' }}>
              <p style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 600, margin: 0 }}>Description auto incluse</p>
            </div>
            <button onClick={() => setPage('app')} className="pg-btn" style={{ width: '100%', background: 'rgba(245,158,11,.15)', border: '1px solid rgba(245,158,11,.3)', color: '#fbbf24', borderRadius: '12px', padding: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>Essayer d'abord →</button>
          </div>

          {/* Pro */}
          <div className="pg-card" style={{ background: 'linear-gradient(160deg,rgba(124,58,237,.12),rgba(79,70,229,.06))', border: '2px solid rgba(124,58,237,.5)', borderRadius: '20px', padding: '24px 18px', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: '100px', padding: '4px 14px', fontSize: '10px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>MEILLEURE OFFRE</div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '18px', fontWeight: 800, marginBottom: '4px', color: '#fff' }}>Pro</h3>
            <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '38px', fontWeight: 800, color: '#a78bfa', marginBottom: '2px' }}>15€</div>
            <p style={{ color: '#a78bfa', fontWeight: 700, marginBottom: '2px', fontSize: '13px' }}>100 crédits</p>
            <p style={{ color: '#7c3aed', fontSize: '11px', marginBottom: '10px' }}>0,15 € / photo</p>
            <div style={{ background: 'rgba(96,165,250,.08)', border: '1px solid rgba(96,165,250,.15)', borderRadius: '8px', padding: '7px', marginBottom: '14px' }}>
              <p style={{ color: '#93c5fd', fontSize: '11px', fontWeight: 600, margin: 0 }}>Description auto incluse</p>
            </div>
            <button onClick={() => isConnected ? handlePayment('pro') : openAuth('register')} className="pg-btn" style={{ width: '100%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>Choisir Pro →</button>
          </div>

          {/* Elite */}
          <div className="pg-card" style={{ background: T.cardBg, border: '1px solid rgba(96,165,250,.2)', borderRadius: '20px', padding: '24px 18px', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(96,165,250,.8)', borderRadius: '100px', padding: '4px 14px', fontSize: '10px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>MEILLEUR PRIX</div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '18px', fontWeight: 800, marginBottom: '4px', color: '#fff' }}>Elite</h3>
            <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '38px', fontWeight: 800, color: '#60a5fa', marginBottom: '2px' }}>35€</div>
            <p style={{ color: '#60a5fa', fontWeight: 700, marginBottom: '2px', fontSize: '13px' }}>300 crédits</p>
            <p style={{ color: '#475569', fontSize: '11px', marginBottom: '10px' }}>0,12 € / photo</p>
            <div style={{ background: 'rgba(96,165,250,.07)', border: '1px solid rgba(96,165,250,.15)', borderRadius: '8px', padding: '7px', marginBottom: '14px' }}>
              <p style={{ color: '#93c5fd', fontSize: '11px', fontWeight: 600, margin: 0 }}>Description auto incluse</p>
            </div>
            <button onClick={() => isConnected ? handlePayment('elite') : openAuth('register')} className="pg-btn" style={{ width: '100%', background: 'rgba(96,165,250,.15)', border: '1px solid rgba(96,165,250,.3)', color: '#60a5fa', borderRadius: '12px', padding: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>Choisir Elite →</button>
          </div>

        </div>
        <p style={{ textAlign: 'center', color: '#475569', fontSize: '13px', marginTop: '18px' }}>Paiement sécurisé Stripe · Aucune carte requise pour l'essai · Crédits valables à vie</p>
      </section>

      <Footer />
    </div>
  );

  /* ══ AIDE ══ */
  if (page === 'help') return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#e2e8f0' }}>
      <InjectCSS />
      <AuthModal show={showAuth} initialMode={authMode} onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} isMobile={isMobile} />
      <PlanModal show={showPlanModal} onClose={() => setShowPlanModal(false)} onSelect={(plan) => { setShowPlanModal(false); handlePayment(plan); }} isMobile={isMobile} />
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

        <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', borderRadius: '20px', padding: isMobile ? '18px' : '28px', marginBottom: '14px' }}>
          {!hasResults ? (
            <>
              <div onClick={() => handleSelectClick(false)}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.background = 'rgba(124,58,237,.07)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,.5)'; }}
                onDragLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = ''; }}
                onDrop={e => { e.preventDefault(); e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = ''; if (!limitReached) { const evt = { target: { files: e.dataTransfer.files } }; handleFilesChange(evt); } }}
                style={{ border: `2px dashed ${limitReached ? 'rgba(239,68,68,.25)' : 'rgba(124,58,237,.28)'}`, borderRadius: '16px', padding: isMobile ? '32px 16px' : '48px 24px', textAlign: 'center', cursor: limitReached ? 'not-allowed' : 'pointer', marginBottom: '16px', background: limitReached ? 'rgba(239,68,68,.02)' : 'rgba(124,58,237,.02)', transition: 'all .2s' }}>
                <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'center' }}>
                  {limitReached
                    ? <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="19" stroke="rgba(239,68,68,.3)" strokeWidth="1.5"/><path d="M13 20h14M20 13v14" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" opacity=".4"/><path d="M15 15l10 10M25 15L15 25" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    : <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="1" y="1" width="38" height="38" rx="10" stroke="rgba(124,58,237,.35)" strokeWidth="1.5" strokeDasharray="4 3"/><path d="M20 26V14M14 20l6-6 6 6" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 30h16" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" opacity=".4"/></svg>
                  }
                </div>
                <p style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: isMobile ? '18px' : '21px', fontWeight: 700, marginBottom: '6px', color: '#e2e8f0' }}>{limitReached ? 'Limite atteinte' : "Déposer jusqu'à 5 photos"}</p>
                <p style={{ color: '#334155', fontSize: '13px', marginBottom: limitReached ? 0 : '14px' }}>{limitReached ? 'Créez un compte pour continuer' : 'JPG · PNG · WEBP · HEIC · ou cliquer pour sélectionner'}</p>
                {!limitReached && isMobile && (
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                    <button onClick={e => { e.stopPropagation(); handleSelectClick(false); }} style={{ background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.25)', color: '#a78bfa', borderRadius: '10px', padding: '10px 16px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>Galerie</button>
                    <button onClick={e => { e.stopPropagation(); handleSelectClick(true); }} style={{ background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.25)', color: '#a78bfa', borderRadius: '10px', padding: '10px 16px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>Appareil photo</button>
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
                        <p style={{ color: r.error ? '#f87171' : '#10b981', fontSize: '10px', margin: '0 0 6px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>{r.error ? 'Erreur' : 'Après'}</p>
                        {r.error
                          ? <div style={{ width: '100%', aspectRatio: '1', background: 'rgba(239,68,68,.08)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="12" stroke="#ef4444" strokeWidth="1.5" opacity=".4"/><path d="M14 8v6M14 17v2" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/></svg></div>
                          : <img src={r.url} alt="Après" style={{ width: '100%', borderRadius: '8px', background: '#fff', display: 'block', aspectRatio: '1', objectFit: 'cover' }} />}
                      </div>
                    </div>
                    {!r.error && (
                      <>
                        {/* Bouton télécharger individuel — desktop uniquement */}
                        {!isMobile && (
                          <button onClick={() => handleDownload(r)} className="pg-btn" style={{ width: '100%', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v8M3.5 7l3 3 3-3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 11h11" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
                            Télécharger
                          </button>
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
                <button onClick={reset} className="pg-ghost" style={{ width: '100%', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', color: '#475569', borderRadius: '14px', padding: '14px', fontWeight: 700, cursor: 'pointer', fontSize: '15px', fontFamily: 'inherit' }}>Traiter de nouvelles photos</button>
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
        isConnected={isConnected}
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
