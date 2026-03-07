import React, { useState, useRef, useEffect, useCallback } from 'react';

const API_URL = "https://web-production-f1129.up.railway.app";
const MAX_SIMULTANEOUS = 5;

// ─── GLOBAL CSS ───
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
  :root {
    --bg: #0a0a0f;
    --card-bg: rgba(255,255,255,0.02);
    --card-border: rgba(255,255,255,0.06);
    --text-primary: #ffffff;
    --text-sub: #64748b;
    --text-muted: #334155;
    --accent-violet: #7c3aed;
    --accent-green: #10b981;
    --accent-blue: #60a5fa;
  }
  [data-theme="light"] {
    --bg: #f8f8ff;
    --card-bg: rgba(0,0,0,0.02);
    --card-border: rgba(0,0,0,0.07);
    --text-primary: #0a0a0f;
    --text-sub: #475569;
    --text-muted: #94a3b8;
  }
  body { background: var(--bg); color: var(--text-primary); font-family: 'DM Sans', system-ui, sans-serif; margin:0; }
  .pg-btn { transition: all .18s ease; }
  .pg-btn:hover { transform: translateY(-2px); filter: brightness(1.08); }
  .pg-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(124,58,237,.18); }
  .pg-anim { animation: fadeUp .55s ease both; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  .compare-slider { position:relative; overflow:hidden; cursor:ew-resize; border-radius:16px; }
  .compare-handle { position:absolute; top:0; bottom:0; width:4px; background:#fff; z-index:10; transform:translateX(-50%); box-shadow:0 0 16px rgba(0,0,0,.4); }
  .compare-handle::before { content:'◀ ▶'; position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:44px; height:44px; border-radius:50%; background:var(--accent-violet); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:14px; box-shadow:0 4px 12px rgba(0,0,0,.3); }
  .faq-q { cursor:pointer; padding:16px 20px; background:var(--card-bg); border-bottom:1px solid var(--card-border); display:flex; justify-content:space-between; font-weight:600; }
  .faq-a { max-height:0; overflow:hidden; transition:max-height .3s ease, padding .3s ease; padding:0 20px; color:var(--text-sub); }
  .faq-a.open { max-height:300px; padding:16px 20px; }
  @media(max-width:640px) { h1 { font-size:2.8rem !important; } }
`;

// Inject CSS
function InjectCSS() {
  useEffect(() => {
    const el = document.createElement('style');
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
  return null;
}

// ─── COMPARE SLIDER ───
function CompareSlider() {
  const [pos, setPos] = useState(50);
  const ref = useRef(null);
  const dragging = useRef(false);

  const move = useCallback((clientX) => {
    if (!ref.current) return;
    const { left, width } = ref.current.getBoundingClientRect();
    setPos(Math.max(5, Math.min(95, ((clientX - left) / width) * 100)));
  }, []);

  useEffect(() => {
    const up = () => dragging.current = false;
    const mv = (e) => dragging.current && move(e.touches ? e.touches[0].clientX : e.clientX);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    window.addEventListener('mousemove', mv);
    window.addEventListener('touchmove', mv, { passive: true });
    return () => {
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchend', up);
      window.removeEventListener('mousemove', mv);
      window.removeEventListener('touchmove', mv);
    };
  }, [move]);

  return (
    <div ref={ref} className="compare-slider" style={{ aspectRatio: '4/3', maxWidth: '520px', margin: '0 auto' }}
      onMouseDown={(e) => { dragging.current = true; move(e.clientX); }}
      onTouchStart={(e) => { dragging.current = true; move(e.touches[0].clientX); }}>
      {/* Après — fond blanc */}
      <div style={{ position: 'absolute', inset: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Après" style={{ maxHeight: '90%', objectFit: 'contain' }} />
      </div>
      {/* Avant — clip gauche */}
      <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - pos}% 0 0)`, overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1581655353564-df123a1eb820?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Avant" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div className="compare-handle" style={{ left: `${pos}%` }} />
    </div>
  );
}

// ─── MAIN COMPONENT ───
export default function PixGlow() {
  const [page, setPage] = useState('landing');
  const [isDark, setIsDark] = useState(true);
  // ... (garde tes states existants : files, previews, results, credits, freeLeft, etc.)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('pg_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // ─── LANDING ───
  if (page === 'landing') return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <InjectCSS />
      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(16px)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: 900, color: '#7c3aed' }}>PixGlow</div>
        <div>
          <button onClick={() => setIsDark(d => !d)} style={{ marginRight: '16px' }}>{isDark ? '☀️' : '🌙'}</button>
          <button onClick={() => setPage('app')} style={{ background: 'var(--accent-violet)', color: '#fff', padding: '10px 20px', borderRadius: '12px', border: 'none' }}>Commencer</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2.8rem, 8vw, 5.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px' }}>
          Double tes vues Vinted<br />
          <span style={{ background: 'linear-gradient(90deg, #7c3aed, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>en 3 secondes</span>
        </h1>
        <p style={{ fontSize: '1.3rem', color: 'var(--text-sub)', maxWidth: '600px', margin: '0 auto 32px' }}>
          Fond blanc pro · Luminosité studio · Vends 30 % plus vite — 5 photos gratuites sans CB
        </p>
        <button onClick={() => setPage('app')} style={{ background: 'var(--accent-violet)', color: '#fff', padding: '16px 40px', fontSize: '1.2rem', borderRadius: '16px', border: 'none', fontWeight: 700 }}>
          Essayer gratuitement →
        </button>
      </section>

      {/* Compare Slider */}
      <section style={{ padding: '40px 20px', background: 'rgba(124,58,237,0.05)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>Avant / Après en direct</h2>
        <CompareSlider />
      </section>

      {/* Stats */}
      <section style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '40px' }}>Les chiffres parlent</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
          {['+38% vues par annonce', '3 sec par photo', '+30% taux de vente', '12k+ vendeurs'].map((stat, i) => (
            <div key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: i % 2 === 0 ? 'var(--accent-violet)' : 'var(--accent-green)' }}>{stat.split(' ')[0]}</div>
              <div style={{ color: 'var(--text-sub)' }}>{stat.split(' ').slice(1).join(' ')}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '60px 20px', background: 'rgba(16,185,129,0.03)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Tarif simple</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'center' }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--accent-green)', borderRadius: '20px', padding: '32px', width: '320px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.8rem' }}>Gratuit</h3>
            <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--accent-green)' }}>5</div>
            <p>photos offertes</p>
            <button onClick={() => setPage('app')} style={{ marginTop: '24px', background: 'var(--accent-green)', color: '#fff', padding: '14px 32px', borderRadius: '12px', border: 'none', fontWeight: 700 }}>
              Essayer maintenant
            </button>
          </div>
          <div style={{ background: 'linear-gradient(135deg, var(--accent-violet), #4f46e5)', color: '#fff', borderRadius: '20px', padding: '32px', width: '320px', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', background: '#fff', color: 'var(--accent-violet)', padding: '8px 20px', borderRadius: '100px', fontWeight: 700 }}>Meilleure offre</div>
            <h3 style={{ fontSize: '1.8rem' }}>Pro</h3>
            <div style={{ fontSize: '4rem', fontWeight: 900 }}>15€</div>
            <p>100 crédits · 0,15€/photo</p>
            <button style={{ marginTop: '24px', background: '#fff', color: 'var(--accent-violet)', padding: '14px 32px', borderRadius: '12px', border: 'none', fontWeight: 700 }}>
              Acheter crédits →
            </button>
          </div>
        </div>
      </section>

      {/* FAQ, Footer, etc. — garde tes composants existants */}
    </div>
  );

  // ... (garde tes autres pages : app, help, legal)
}