import React, { useState, useRef, useEffect, useCallback } from 'react';

const API_URL = "https://web-production-f1129.up.railway.app";
const MAX_SIMULTANEOUS = 5;

// Global CSS with vars for dark/light
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
  }
  [data-theme="light"] {
    --bg: #f9fafb;
    --card-bg: rgba(0,0,0,0.02);
    --card-border: rgba(0,0,0,0.07);
    --text-primary: #111827;
    --text-sub: #475569;
    --text-muted: #94a3b8;
  }
  body { background: var(--bg); color: var(--text-primary); font-family: 'DM Sans', system-ui, sans-serif; margin: 0; -webkit-font-smoothing: antialiased; }
  .pg-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; border: none; cursor: pointer; font-family: inherit; font-weight: 700; }
  .pg-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(124,58,237,0.2); }
  .pg-card { transition: transform 0.22s ease, box-shadow 0.22s ease; border-radius: 20px; padding: 24px; background: var(--card-bg); border: 1px solid var(--card-border); }
  .pg-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(124,58,237,0.1); }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .pg-anim { animation: fadeUp 0.5s ease both; }
  /* Add more animations as in your code */
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

// ─── NAV COMPONENT ───
function Nav({ isConnected, credits, isMobile, onLogin, onRegister, onLogout, onApp, onLanding, onHelp, isDark, toggleDark }) {
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg)', borderBottom: '1px solid var(--card-border)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div onClick={onLanding} style={{ cursor: 'pointer', fontFamily: 'Bricolage Grotesque', fontWeight: 900, fontSize: '1.5rem', color: 'var(--accent-violet)' }}>PixGlow</div>
      <div style={{ display: 'flex', gap: '16px' }}>
        <button onClick={onHelp} style={{ background: 'none', border: none, color: 'var(--text-sub)', cursor: 'pointer' }}>Aide</button>
        <button onClick={toggleDark} style={{ background: 'none', border: none, color: 'var(--text-sub)', cursor: 'pointer' }}>{isDark ? '☀️' : '🌙'}</button>
        {isConnected ? (
          <>
            <span style={{ color: 'var(--accent-violet)' }}>{credits} crédits</span>
            <button onClick={onLogout} style={{ color: 'var(--text-sub)' }}>Déconnexion</button>
          </>
        ) : (
          <button onClick={onLogin} style={{ background: 'var(--accent-violet)', color: '#fff', padding: '8px 16px', borderRadius: '12px' }}>Connexion</button>
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
    const handleMove = (e) => dragging.current && handleMove(e.touches ? e.touches[0].clientX : e.clientX);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });
    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
    };
  }, [handleMove]);

  return (
    <div ref={ref} style={{ position: 'relative', height: '400px', cursor: 'ew-resize' }} 
      onMouseDown={(e) => { dragging.current = true; handleMove(e.clientX); }}
      onTouchStart={(e) => { dragging.current = true; handleMove(e.touches[0].clientX); }}>
      <img src="https://i.ibb.co/0nBbWnq/shirt-before.jpg" alt="Before" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${pos}%`, overflow: 'hidden' }}>
        <img src="https://i.ibb.co/5GwYpTj/shirt-after.jpg" alt="After" style={{ position: 'absolute', left: 0, width: ref.current ? ref.current.clientWidth : '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${pos}%`, width: '2px', background: '#fff', transform: 'translateX(-50%)' }} />
      <div style={{ position: 'absolute', top: '50%', left: `${pos}%`, transform: 'translate(-50%, -50%)', background: '#fff', borderRadius: '50%', padding: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}>↔</div>
    </div>
  );
}

// ─── MAIN APP ───
export default function PixGlow() {
  const [page, setPage] = useState('landing');
  const [isDark, setIsDark] = useState(true);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [credits, setCredits] = useState(null);
  const [freeLeft, setFreeLeft] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const fileInputRef = useRef(null);

  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const navProps = {
    isConnected,
    credits,
    isMobile,
    onLogin: () => { setAuthMode('login'); setShowAuth(true); },
    onRegister: () => { setAuthMode('register'); setShowAuth(true); },
    onLogout: () => { setIsConnected(false); setPage('landing'); },
    onApp: () => setPage('app'),
    onLanding: () => setPage('landing'),
    onHelp: () => setPage('help'),
    isDark,
    toggleDark: () => setIsDark(!isDark),
  };

  if (page === 'landing') return (
    <div>
      <InjectCSS />
      <Nav {...navProps} />
      <section style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', fontFamily: 'Bricolage Grotesque', fontWeight: 900 }}>
          Double tes vues Vinted en 3 secondes
        </h1>
        <p style={{ fontSize: '1.5rem', maxWidth: '600px', margin: '20px auto' }}>Fond blanc pro, luminosité studio – vends plus vite sans effort.</p>
        <button onClick={() => setPage('app')} style={{ background: 'var(--accent-violet)', color: '#fff', padding: '16px 32px', fontSize: '1.2rem', borderRadius: '12px', border: 'none' }}>Essayer gratuit</button>
      </section>
      <section style={{ padding: '60px 20px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem' }}>Avant / Après</h2>
        <BeforeAfterSlider />
      </section>
      {/* Add stats, features, testimonials, pricing, FAQ as in previous, but improved layouts */}
      {/* ... */}
    </div>
  );

  if (page === 'app') return (
    <div>
      <InjectCSS />
      <Nav {...navProps} />
      {/* Upload page with drag/drop, previews, progress */}
      <section style={{ padding: '40px 20px' }}>
        <h2>Dépose tes photos</h2>
        <div style={{ border: '2px dashed var(--accent-violet)', padding: '40px', textAlign: 'center' }} onClick={() => fileInputRef.current.click()} >
          <p>Glisse ou clique pour ajouter jusqu'à 5 photos</p>
          <input ref={fileInputRef} type="file" multiple hidden onChange={(e) => setFiles(Array.from(e.target.files)) } />
        </div>
        {/* Previews grid */}
        {previews.map((preview, i) => <img key={i} src={preview} alt="" style={{ width: '100px' }} />)}
        <button onClick={handleUpload} disabled={loading}>Améliorer</button>
        {loading && <div>Progress: {progress}%</div>}
        {/* Results with download */}
      </section>
    </div>
  );

  // Add help, legal pages similarly.
  // For auth: modal as in your code.
}