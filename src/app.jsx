import React, { useState, useRef, useEffect, useCallback } from 'react';

const API_URL = "https://web-production-f1129.up.railway.app";
const MAX_SIMULTANEOUS = 5;

// Global CSS optimized
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
    --error-red: #ef4444;
    --success-green: #16a34a;
  }
  [data-theme="light"] {
    --bg: #f9fafb;
    --card-bg: rgba(0,0,0,0.02);
    --card-border: rgba(0,0,0,0.07);
    --text-primary: #111827;
    --text-sub: #475569;
    --text-muted: #94a3b8;
    --success-green: #16a34a;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text-primary); font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; scroll-behavior: smooth; }
  .pg-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; cursor: pointer; font-family: inherit; font-weight: 700; border: none; border-radius: 12px; padding: 12px 24px; }
  .pg-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
  .pg-card { transition: transform 0.22s ease, box-shadow 0.22s ease; border-radius: 20px; background: var(--card-bg); border: 1px solid var(--card-border); padding: 24px; }
  .pg-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(124,58,237,0.1); }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .pg-anim { animation: fadeUp 0.5s ease both; }
  .compare-slider { position: relative; overflow: hidden; cursor: ew-resize; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
  .compare-handle { position: absolute; top: 0; bottom: 0; width: 4px; background: #fff; z-index: 10; transform: translateX(-50%); box-shadow: 0 0 16px rgba(0,0,0,0.4); }
  .compare-handle::before { content: '◀ ▶'; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 44px; height: 44px; border-radius: 50%; background: var(--accent-violet); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
  .faq-item { border: 1px solid var(--card-border); border-radius: 14px; overflow: hidden; margin-bottom: 10px; }
  .faq-q { cursor: pointer; padding: 16px 20px; background: var(--card-bg); display: flex; justify-content: space-between; font-weight: 600; }
  .faq-a { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; padding: 0 20px; color: var(--text-sub); }
  .faq-a.open { max-height: 300px; padding: 16px 20px; }
  @media (max-width: 640px) { h1 { font-size: 2.5rem; } }
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

// ─── NAV ───
function Nav({ isConnected, credits, isMobile, onLogin, onRegister, onLogout, onApp, onLanding, onHelp, isDark, toggleDark }) {
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg)', borderBottom: '1px solid var(--card-border)', padding: isMobile ? '12px 16px' : '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div onClick={onLanding} style={{ cursor: 'pointer', fontFamily: 'Bricolage Grotesque', fontWeight: 900, fontSize: '1.5rem', color: 'var(--accent-violet)' }}>PixGlow</div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <button onClick={onHelp} style={{ background: 'none', border: none, color: 'var(--text-sub)', cursor: 'pointer', fontSize: '1rem' }}>Aide</button>
        <button onClick={toggleDark} style={{ background: 'none', border: none, color: 'var(--text-sub)', cursor: 'pointer', fontSize: '1rem' }}>{isDark ? '☀️' : '🌙'}</button>
        {isConnected ? (
          <>
            <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}> {credits} crédits</span>
            <button onClick={onLogout} style={{ background: 'none', border: none, color: 'var(--text-sub)', cursor: 'pointer' }}>Déconnexion</button>
          </>
        ) : (
          <>
            <button onClick={onLogin} style={{ background: 'none', border: none, color: 'var(--text-sub)', cursor: 'pointer' }}>Connexion</button>
            <button onClick={onRegister} className="pg-btn" style={{ background: 'var(--accent-violet)', color: '#fff' }}>S'inscrire</button>
          </>
        )}
      </div>
    </nav>
  );
}

// ─── BEFORE/AFTER SLIDER ───
function BeforeAfterSlider() {
  const [pos, setPos] = useState(50);
  const ref = useRef(null);
  const dragging = useRef(false);

  const handleMove = useCallback((clientX) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  useEffect(() => {
    const handleUp = () => dragging.current = false;
    const handleGlobalMove = (e) => dragging.current && handleMove(e.touches ? e.touches[0].clientX : e.clientX);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('touchmove', handleGlobalMove, { passive: false });
    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('touchmove', handleGlobalMove);
    };
  }, [handleMove]);

  return (
    <div ref={ref} className="compare-slider" style={{ height: '400px', position: 'relative' }}
      onMouseDown={(e) => { dragging.current = true; handleMove(e.clientX); }}
      onTouchStart={(e) => { dragging.current = true; handleMove(e.touches[0].clientX); }}>
      {/* After (full) */}
      <img src="[image:0]" alt="After" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} />
      {/* Before (clipped to left */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${pos}%`, overflow: 'hidden' }}>
        <img src="[image:3]" alt="Before" style={{ position: 'absolute', left: 0, width: ref.current ? ref.current.clientWidth : '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      {/* Handle */}
      <div className="compare-handle" style={{ left: `${pos}%` }} />
    </div>
  );
}

// ─── MAIN ───
export default function PixGlow() {
  // States as in your code
  // ...

  // Landing page
  if (page === 'landing') return (
    <div>
      <InjectCSS />
      <Nav {...navProps} />
      <section style={{ padding: '100px 20px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Bricolage Grotesque', fontWeight: 900, fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', lineHeight: 1.1 }}>
          Double tes vues Vinted<br /> en 3 secondes
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-sub)', maxWidth: '600px', margin: '24px auto' }}>Fond blanc pro, luminosité studio – vends plus vite sans studio photo.</p>
        <button onClick={() => setPage('app')} className="pg-btn" style={{ background: 'var(--accent-violet)', color: '#fff', fontSize: '1.1rem' }}>Essayer gratuit – 5 photos</button>
      </section>
      <section style={{ padding: '60px 20px' }}>
        <h2 style={{ textAlign: 'center', fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: '2.25rem', marginBottom: '32px' }}>Avant / Après</h2>
        <BeforeAfterSlider />
      </section>
      {/* Add sections for stats, features, testimonials, pricing, FAQ with similar pro styles */}
      {/* For example: */}
      <section style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: '2.25rem' }}>Stats</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '32px auto' }}>
          <div className="pg-card">
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--accent-green)' }}>+38%</div>
            <p>vues par annonce</p>
          </div>
          {/* Add more */}
        </div>
      </section>
      {/* Pricing */}
      <section style={{ padding: '60px 20px' }}>
        <h2 style={{ textAlign: 'center', fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: '2.25rem' }}>Tarifs simples</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', maxWidth: '800px', margin: '32px auto', justifyContent: 'center' }}>
          <div className="pg-card" style={{ width: '300px' }}>
            <h3>Gratuit</h3>
            <p style={{ fontSize: '3rem', color: 'var(--accent-green)' }}>5 photos</p>
            <button onClick={() => setPage('app')} className="pg-btn" style={{ background: 'var(--accent-green)', color: '#fff' }}>Essayer</button>
          </div>
          <div className="pg-card" style={{ width: '300px', border: '2px solid var(--accent-violet)' }}>
            <h3>Pro</h3>
            <p style={{ fontSize: '3rem', color: 'var(--accent-violet)' }}>15€</p>
            <p>100 crédits (0,15€/photo)</p>
            <button className="pg-btn" style={{ background: 'var(--accent-violet)', color: '#fff' }}>Acheter</button>
          </div>
        </div>
      </section>
      {/* ... */}
    </div>
  );

  // App page (upload)
  if (page === 'app') return (
    <div>
      <InjectCSS />
      <Nav {...navProps} />
      <section style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: '2rem' }}>Améliore tes photos Vinted</h2>
        <div style={{ border: '2px dashed var(--accent-violet)', borderRadius: '16px', padding: '40px', textAlign: 'center', marginBottom: '32px', transition: 'border-color 0.2s' }} onClick={() => fileInputRef.current.click()} onDragOver={(e) => e.target.style.borderColor = 'var(--accent-green)'} onDragLeave={(e) => e.target.style.borderColor = 'var(--accent-violet)'} onDrop={(e) => { e.preventDefault(); setFiles(Array.from(e.dataTransfer.files)); }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>Glisse ou clique pour ajouter jusqu'à 5 photos</p>
          <p style={{ color: 'var(--text-sub)' }}>JPG, PNG, WEBP – max 15Mo/photo</p>
          <input ref={fileInputRef} type="file" multiple accept="image/*" hidden onChange={(e) => setFiles(Array.from(e.target.files)) } />
        </div>
        {previews.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {previews.map((preview, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={preview} alt="" style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                {loading && i < progress && <div style={{ position: 'absolute', inset: 0, background: 'rgba(16,185,129,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>✅</div>}
              </div>
            ))}
          </div>
        )}
        <button onClick={handleUpload} disabled={loading || !files.length} className="pg-btn" style={{ width: '100%', background: 'var(--accent-violet)', color: '#fff', fontSize: '1.1rem' }}>
          {loading ? 'Amélioration en cours...' : 'Améliorer photos'}
        </button>
        {results.map((r, i) => (
          <div key={i} style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <img src={r.original} alt="Before" style={{ borderRadius: '12px' }} />
            <img src={r.url} alt="After" style={{ borderRadius: '12px', background: '#fff' }} />
          </div>
        ))}
      </section>
    </div>
  );

  // ... Add help, legal as components.
}