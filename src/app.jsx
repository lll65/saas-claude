import React, { useState, useRef, useEffect } from 'react';

const API_URL = "https://web-production-f1129.up.railway.app";

export default function PixGlow() {
  const [page, setPage]               = useState('landing');
  const [file, setFile]               = useState(null);
  const [preview, setPreview]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState(null);
  const [credits, setCredits]         = useState(null);
  const [freeLeft, setFreeLeft]       = useState(5);
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isMobile, setIsMobile]       = useState(window.innerWidth < 768);
  const fileInputRef   = useRef(null);
  const cameraInputRef = useRef(null);

  /* ── helpers ── */
  const getToken = () => localStorage.getItem('pg_token');

  const authHeaders = () => {
    const t = getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  /* ── resize ── */
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  /* ── init ── */
  useEffect(() => {
    const saved = parseInt(localStorage.getItem('pg_free') || '5');
    setFreeLeft(saved);

    const token = getToken();
    const savedEmail = localStorage.getItem('pg_email');
    if (token && savedEmail) {
      setEmail(savedEmail);
      setIsConnected(true);
      fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => { if (d.credits !== undefined) setCredits(d.credits); })
        .catch(() => {});
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success' && token) {
      setTimeout(() => {
        fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.json())
          .then(d => {
            if (d.credits !== undefined) {
              setCredits(d.credits);
              alert(`✅ Paiement confirmé !\nVous avez maintenant ${d.credits} crédits disponibles.`);
              window.history.replaceState({}, '', window.location.pathname);
            }
          });
      }, 2000);
    }
  }, []);

  /* ── auth ── */
  const handleAuth = async (mode) => {
    if (!email.includes('@'))    { alert('Entrez un email valide');                   return; }
    if (password.length < 6)     { alert('Le mot de passe doit faire 6 caractères minimum'); return; }
    try {
      const res  = await fetch(`${API_URL}/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) { alert(data.detail || 'Erreur'); return; }
      localStorage.setItem('pg_token', data.token);
      localStorage.setItem('pg_email', email);
      setCredits(data.credits);
      setIsConnected(true);
      setPage('app');
    } catch { alert('Erreur réseau, réessayez.'); }
  };

  const handleLogout = () => {
    ['pg_token','pg_email'].forEach(k => localStorage.removeItem(k));
    setEmail(''); setPassword(''); setCredits(null);
    setIsConnected(false); setPage('landing');
  };

  /* ── upload ── */
  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f); setResult(null); setError(null);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleUpload = async () => {
    if (!file)                              { setError('Sélectionnez une photo');                      return; }
    if (!isConnected && freeLeft <= 0)      { setError('Limite gratuite atteinte → créez un compte'); return; }
    if (isConnected && credits !== null && credits <= 0) { setError('Crédits épuisés → rechargez');  return; }

    setLoading(true); setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res  = await fetch(`${API_URL}/enhance`, { method: 'POST', headers: authHeaders(), body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'Erreur traitement'); setLoading(false); return; }

      setResult({ filename: data.filename, url: `${API_URL}${data.url}` });

      if (data.credits_left !== null && data.credits_left !== undefined) {
        setCredits(data.credits_left);
      } else {
        const n = freeLeft - 1;
        setFreeLeft(n);
        localStorage.setItem('pg_free', n);
      }
    } catch { setError('Erreur réseau, réessayez.'); }
    finally { setLoading(false); }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = result.url; a.download = result.filename; a.click();
  };

  const handlePayment = async () => {
    const token = getToken();
    if (!token) { alert('Connectez-vous d\'abord'); return; }
    try {
      const res  = await fetch(`${API_URL}/create-checkout-session`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.checkout_url) window.location.href = data.checkout_url;
    } catch { alert('Erreur paiement, réessayez.'); }
  };

  /* ── styles ── */
  const S = {
    page: {
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      minHeight: '100vh', color: '#fff', fontFamily: "'Inter', sans-serif"
    },
    nav: {
      padding: isMobile ? '14px 18px' : '18px 48px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 100
    },
    logo: { margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 800, cursor: 'pointer', letterSpacing: '-0.5px' },
    btn: (bg, extra = {}) => ({
      background: bg, color: '#fff', border: 'none', borderRadius: '10px',
      padding: '11px 22px', fontWeight: 700, cursor: 'pointer', fontSize: '14px',
      transition: 'opacity .2s', ...extra
    }),
    card: (extra = {}) => ({
      background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(148,163,184,0.12)',
      borderRadius: '16px', padding: isMobile ? '20px' : '28px',
      backdropFilter: 'blur(10px)', ...extra
    }),
  };

  /* ════════════════════════════════════════════
     LANDING
  ════════════════════════════════════════════ */
  if (page === 'landing') return (
    <div style={S.page}>
      <nav style={S.nav}>
        <h1 style={S.logo}>✨ PixGlow</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => setPage('help')}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>
            Aide
          </button>
          <button onClick={() => setPage('app')} style={S.btn('linear-gradient(135deg,#3b82f6,#1d4ed8)')}>
            {isMobile ? 'Commencer' : 'Commencer gratuitement →'}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '40px 18px' : '80px 40px', textAlign: 'center' }}>

        {/* Badge niche */}
        <div style={{ display: 'inline-block', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.35)', borderRadius: '24px', padding: '6px 18px', marginBottom: '24px', fontSize: '13px', color: '#93c5fd', fontWeight: 600 }}>
          🛍️ Conçu pour les vendeurs Vinted, Leboncoin & Vestiaire
        </div>

        {/* Titre */}
        <h2 style={{ fontSize: isMobile ? '36px' : '62px', fontWeight: 900, margin: '0 0 18px 0', background: 'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1, letterSpacing: '-1px' }}>
          Photos fond blanc<br/>en 1 clic
        </h2>
        <p style={{ fontSize: isMobile ? '16px' : '20px', color: '#94a3b8', maxWidth: '560px', margin: '0 auto 16px auto', lineHeight: 1.6 }}>
          Suppression automatique du fond, luminosité parfaite,<br/>
          <strong style={{ color: '#e2e8f0' }}>qualité studio pour tes articles Vinted.</strong>
        </p>
        <p style={{ color: '#22c55e', fontWeight: 700, fontSize: '15px', marginBottom: '48px' }}>
          ✅ 5 photos gratuites — aucune carte bancaire requise
        </p>

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '16px', marginBottom: '56px' }}>
          {[
            { icon: '🎨', titre: 'Fond blanc parfait', desc: 'Ton article ressort comme sur un site e-commerce professionnel', color: '59,130,246' },
            { icon: '✨', titre: 'Luminosité & netteté', desc: 'Contraste et couleurs optimisés automatiquement à chaque image', color: '167,139,250' },
            { icon: '⚡', titre: 'Résultat en 10 sec', desc: 'Plus besoin de Photoshop ou d\'application complexe', color: '34,197,94' },
          ].map((f, i) => (
            <div key={i} style={{ background: `rgba(${f.color},0.07)`, border: `1px solid rgba(${f.color},0.22)`, borderRadius: '14px', padding: '24px 20px' }}>
              <div style={{ fontSize: '38px', marginBottom: '14px' }}>{f.icon}</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: 700 }}>{f.titre}</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Avant / Après */}
        <div style={{ ...S.card(), maxWidth: '680px', margin: '0 auto 52px auto' }}>
          <p style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 18px 0', fontWeight: 600 }}>Exemple de résultat</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 36px 1fr', alignItems: 'center', gap: '12px' }}>
            {/* Avant */}
            <div style={{ background: 'linear-gradient(135deg,#1e293b,#334155)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
              <div style={{ height: '110px', background: 'linear-gradient(135deg,#334155,#475569)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px' }}>👗</div>
              <p style={{ color: '#64748b', fontSize: '11px', margin: '10px 0 0 0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Avant</p>
            </div>
            <div style={{ fontSize: '22px', textAlign: 'center', color: '#3b82f6', fontWeight: 900 }}>→</div>
            {/* Après */}
            <div style={{ background: '#fff', borderRadius: '10px', padding: '16px', textAlign: 'center', border: '2px solid #22c55e' }}>
              <div style={{ height: '110px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px', border: '1px solid #e2e8f0' }}>👗</div>
              <p style={{ color: '#16a34a', fontSize: '11px', margin: '10px 0 0 0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Après — Fond blanc ✅</p>
            </div>
          </div>
        </div>

        {/* Témoignages */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '14px', maxWidth: '900px', margin: '0 auto 52px auto' }}>
          {[
            { nom: 'Sophie M.', stars: '⭐⭐⭐⭐⭐', texte: "Mes vues ont doublé sur Vinted depuis que j'utilise PixGlow. Mes photos font vraiment pro !" },
            { nom: 'Karim B.', stars: '⭐⭐⭐⭐⭐', texte: "Simple, rapide, bluffant. Je prépare 20 fiches produit en 5 minutes." },
            { nom: 'Léa F.', stars: '⭐⭐⭐⭐⭐', texte: "Enfin un outil pensé pour Vinted. Le fond blanc change vraiment tout pour les acheteurs." },
          ].map((t, i) => (
            <div key={i} style={{ ...S.card(), textAlign: 'left' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px' }}>{t.stars}</p>
              <p style={{ color: '#cbd5e1', fontSize: '14px', margin: '0 0 12px 0', lineHeight: 1.6, fontStyle: 'italic' }}>"{t.texte}"</p>
              <p style={{ color: '#60a5fa', fontSize: '13px', margin: 0, fontWeight: 700 }}>— {t.nom}</p>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', maxWidth: '640px', margin: '0 auto 48px auto' }}>
          {/* Gratuit */}
          <div style={{ ...S.card({ border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.06)' }), textAlign: 'center' }}>
            <p style={{ fontSize: '28px', margin: '0 0 6px 0' }}>🎁</p>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px' }}>Gratuit</h3>
            <p style={{ color: '#22c55e', fontWeight: 700, fontSize: '22px', margin: '0 0 8px 0' }}>5 photos</p>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 16px 0' }}>Sans inscription<br/>Sans carte bancaire</p>
            <button onClick={() => setPage('app')} style={S.btn('linear-gradient(135deg,#22c55e,#16a34a)', { width: '100%' })}>Essayer maintenant</button>
          </div>
          {/* Pro */}
          <div style={{ ...S.card({ border: '2px solid rgba(59,130,246,0.5)', background: 'rgba(59,130,246,0.08)' }), textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', borderRadius: '20px', padding: '3px 14px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>MEILLEURE OFFRE</div>
            <p style={{ fontSize: '28px', margin: '0 0 6px 0' }}>💎</p>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px' }}>Pro</h3>
            <p style={{ color: '#60a5fa', fontWeight: 700, fontSize: '22px', margin: '0 0 4px 0' }}>15€</p>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 4px 0' }}>100 crédits · 0,15€/photo</p>
            <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 16px 0' }}>Valables à vie</p>
            <button onClick={() => setPage('app')} style={S.btn('linear-gradient(135deg,#3b82f6,#1d4ed8)', { width: '100%' })}>Acheter les crédits</button>
          </div>
        </div>

        {/* FAQ rapide */}
        <p style={{ color: '#475569', fontSize: '14px' }}>
          Des questions ? <button onClick={() => setPage('help')} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}>Consultez notre aide</button>
        </p>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════
     AIDE
  ════════════════════════════════════════════ */
  if (page === 'help') return (
    <div style={S.page}>
      <nav style={S.nav}>
        <h1 style={S.logo} onClick={() => setPage('landing')}>✨ PixGlow</h1>
        <button onClick={() => setPage('landing')} style={S.btn('#334155')}>← Accueil</button>
      </nav>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: isMobile ? '24px 18px' : '52px 40px' }}>
        <h1 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 800, marginBottom: '32px' }}>Centre d'aide</h1>
        <div style={S.card()}>
          {[
            { q: "Combien de photos gratuites ?", r: "5 photos gratuites par adresse IP, sans inscription ni carte bancaire." },
            { q: "Quel tarif après l'essai ?", r: "1 crédit = 1 photo = 0,15€. Le pack 100 crédits est à 15€, valable à vie." },
            { q: "Mes crédits expirent-ils ?", r: "Non. Vos crédits sont sauvegardés sur nos serveurs et ne disparaissent jamais." },
            { q: "Quels formats sont acceptés ?", r: "JPG, PNG, WEBP. Taille recommandée : moins de 10 Mo." },
            { q: "Est-ce adapté à Vinted ?", r: "Oui, c'est la raison d'être de PixGlow. Les photos fond blanc augmentent significativement les clics et les ventes sur Vinted." },
            { q: "Le paiement est-il sécurisé ?", r: "Oui, 100%. Le paiement est traité par Stripe, le standard mondial de la sécurité bancaire en ligne." },
            { q: "Comment contacter le support ?", r: "Écrivez à support@pixglow.app — réponse garantie en moins de 24h." },
          ].map((faq, i, arr) => (
            <div key={i} style={{ paddingBottom: '20px', marginBottom: '20px', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
              <h3 style={{ color: '#60a5fa', margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700 }}>{faq.q}</h3>
              <p style={{ color: '#cbd5e1', margin: 0, fontSize: '15px', lineHeight: 1.65 }}>{faq.r}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════
     APP
  ════════════════════════════════════════════ */
  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <h1 style={S.logo} onClick={() => setPage('landing')}>✨ PixGlow</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isConnected && <span style={{ color: '#64748b', fontSize: '13px', display: isMobile ? 'none' : 'block' }}>{email}</span>}
          {isConnected
            ? <button onClick={handleLogout} style={S.btn('#ef4444')}>Déconnexion</button>
            : <button onClick={() => setPage('landing')} style={S.btn('#334155')}>← Accueil</button>}
        </div>
      </nav>

      <div style={{ maxWidth: '840px', margin: '0 auto', padding: isMobile ? '16px' : '32px 20px' }}>

        {/* ─ COMPTEUR ─ */}
        <div style={{
          background: credits !== null
            ? 'linear-gradient(135deg,rgba(34,197,94,.13),rgba(34,197,94,.06))'
            : freeLeft > 0
              ? 'linear-gradient(135deg,rgba(251,146,60,.13),rgba(251,146,60,.06))'
              : 'linear-gradient(135deg,rgba(239,68,68,.13),rgba(239,68,68,.06))',
          border: `1px solid ${credits !== null ? 'rgba(34,197,94,.3)' : freeLeft > 0 ? 'rgba(251,146,60,.3)' : 'rgba(239,68,68,.3)'}`,
          borderRadius: '16px', padding: '22px 20px', marginBottom: '18px', textAlign: 'center'
        }}>
          <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>
            {credits !== null ? 'Crédits disponibles' : 'Photos gratuites restantes'}
          </p>
          <p style={{ fontSize: isMobile ? '44px' : '56px', fontWeight: 900, color: credits !== null ? '#22c55e' : freeLeft > 0 ? '#fb923c' : '#ef4444', margin: 0, lineHeight: 1 }}>
            {credits !== null ? credits : `${freeLeft}/5`}
          </p>
          {!isConnected && freeLeft === 0 && (
            <p style={{ color: '#f87171', fontSize: '14px', margin: '10px 0 0 0', fontWeight: 600 }}>
              Limite atteinte — inscrivez-vous pour continuer ↓
            </p>
          )}
        </div>

        {/* ─ UPLOAD / RÉSULTAT ─ */}
        <div style={{ ...S.card(), marginBottom: '18px' }}>
          <input ref={fileInputRef}   type="file" accept="image/*"                   onChange={handleFileChange} style={{ display: 'none' }} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />

          {!result ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <button onClick={() => fileInputRef.current?.click()}
                  style={{ background: 'rgba(59,130,246,.12)', border: '2px solid rgba(59,130,246,.4)', borderRadius: '12px', padding: '20px 12px', color: '#60a5fa', cursor: 'pointer', fontWeight: 700, fontSize: '15px' }}>
                  📁 Galerie
                </button>
                <button onClick={() => cameraInputRef.current?.click()}
                  style={{ background: 'rgba(167,139,250,.12)', border: '2px solid rgba(167,139,250,.4)', borderRadius: '12px', padding: '20px 12px', color: '#c4b5fd', cursor: 'pointer', fontWeight: 700, fontSize: '15px' }}>
                  📷 Appareil photo
                </button>
              </div>

              {preview && (
                <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                  <img src={preview} alt="Aperçu" style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px', border: '2px solid rgba(59,130,246,.35)' }} />
                  <p style={{ color: '#94a3b8', fontSize: '13px', margin: '8px 0 0 0' }}>Photo sélectionnée ✅</p>
                </div>
              )}

              {error && (
                <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#f87171', fontSize: '14px', textAlign: 'center' }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || loading}
                style={{
                  width: '100%', border: 'none', fontWeight: 800, borderRadius: '12px',
                  padding: '18px', fontSize: '18px', cursor: file && !loading ? 'pointer' : 'not-allowed',
                  background: file && !loading
                    ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)'
                    : 'rgba(71,85,105,.6)',
                  color: '#fff', transition: 'all .2s'
                }}
              >
                {loading ? '⏳ Traitement en cours...' : file ? '⚡ Améliorer ma photo' : '← Sélectionnez une photo d\'abord'}
              </button>

              {loading && (
                <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', marginTop: '10px' }}>
                  Suppression du fond + optimisation · environ 10–15 secondes
                </p>
              )}
            </>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                <div style={{ background: 'rgba(15,23,42,.6)', borderRadius: '12px', padding: '14px' }}>
                  <p style={{ color: '#64748b', fontSize: '11px', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Avant</p>
                  <img src={preview} alt="Avant" style={{ width: '100%', borderRadius: '8px' }} />
                </div>
                <div style={{ background: '#fff', borderRadius: '12px', padding: '14px', border: '2px solid #22c55e' }}>
                  <p style={{ color: '#16a34a', fontSize: '11px', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Après ✅</p>
                  <img src={result.url} alt="Après" style={{ width: '100%', borderRadius: '8px' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button onClick={handleDownload} style={S.btn('linear-gradient(135deg,#22c55e,#16a34a)', { padding: '14px', fontSize: '15px' })}>
                  📥 Télécharger
                </button>
                <button
                  onClick={() => { setFile(null); setPreview(null); setResult(null); setError(null); }}
                  style={S.btn('rgba(71,85,105,.7)', { padding: '14px', fontSize: '15px' })}
                >
                  🔄 Nouvelle photo
                </button>
              </div>
            </>
          )}
        </div>

        {/* ─ AUTH / ACHAT ─ */}
        {!isConnected ? (
          <div style={{ ...S.card({ border: '2px solid rgba(59,130,246,.25)', background: 'linear-gradient(135deg,rgba(59,130,246,.1),rgba(167,139,250,.08))' }) }}>
            <h2 style={{ textAlign: 'center', fontWeight: 800, fontSize: isMobile ? '19px' : '22px', margin: '0 0 6px 0' }}>
              Créez un compte gratuit pour acheter des crédits
            </h2>
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', margin: '0 0 22px 0' }}>
              Vos crédits sont sauvegardés à vie · Paiement sécurisé Stripe
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <input type="email"    placeholder="Votre email"              value={email}    onChange={e => setEmail(e.target.value)}
                style={{ padding: '14px', borderRadius: '10px', border: '1px solid rgba(59,130,246,.35)', fontSize: '15px', background: 'rgba(15,23,42,.8)', color: '#fff', boxSizing: 'border-box' }} />
              <input type="password" placeholder="Mot de passe (min. 6 car.)" value={password} onChange={e => setPassword(e.target.value)}
                style={{ padding: '14px', borderRadius: '10px', border: '1px solid rgba(59,130,246,.35)', fontSize: '15px', background: 'rgba(15,23,42,.8)', color: '#fff', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={() => handleAuth('login')}    style={S.btn('linear-gradient(135deg,#22c55e,#16a34a)', { padding: '14px', fontSize: '15px' })}>Se connecter</button>
              <button onClick={() => handleAuth('register')} style={S.btn('linear-gradient(135deg,#f97316,#c2410c)', { padding: '14px', fontSize: '15px' })}>S'inscrire</button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ color: '#94a3b8', marginBottom: '18px', fontSize: '15px' }}>
              Augmentez vos ventes Vinted avec plus de crédits 🚀
            </p>
            <button onClick={handlePayment} style={{
              ...S.btn('linear-gradient(135deg,#3b82f6,#1d4ed8)'),
              padding: isMobile ? '16px 32px' : '20px 56px',
              fontSize: isMobile ? '17px' : '20px',
              boxShadow: '0 10px 30px rgba(59,130,246,.35)',
              borderRadius: '14px'
            }}>
              💳 Acheter 100 crédits — 15€
            </button>
            <p style={{ color: '#475569', marginTop: '12px', fontSize: '13px' }}>
              1 crédit = 1 photo = 0,15€ · Valables à vie · 🔒 Paiement sécurisé
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
