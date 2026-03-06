import React, { useState, useRef, useEffect, useCallback } from 'react';

const API_URL = "https://web-production-f1129.up.railway.app";
const MAX_SIMULTANEOUS = 5; // max photos en même temps

/* ═══════════════════════════════════════════════════════════
   MODAL AUTH — définie EN DEHORS du composant principal
   (évite la perte de focus à chaque frappe)
═══════════════════════════════════════════════════════════ */
function AuthModal({ show, onClose, onSuccess, isMobile }) {
  const [mode, setMode]         = useState('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [errMsg, setErrMsg]     = useState('');

  if (!show) return null;

  const handleSubmit = async () => {
    setErrMsg('');
    if (!email.includes('@'))  { setErrMsg('Entrez un email valide');                         return; }
    if (password.length < 6)   { setErrMsg('Le mot de passe doit faire minimum 6 caractères'); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) { setErrMsg(data.detail || 'Identifiants incorrects'); setLoading(false); return; }
      localStorage.setItem('pg_token', data.token);
      localStorage.setItem('pg_email', email);
      onSuccess(email, data.credits);
    } catch {
      setErrMsg('Impossible de contacter le serveur. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: '14px 16px', borderRadius: '10px',
    border: `1px solid ${errMsg ? 'rgba(239,68,68,.5)' : 'rgba(59,130,246,.35)'}`,
    fontSize: '16px', background: 'rgba(15,23,42,0.95)', color: '#fff',
    outline: 'none', boxSizing: 'border-box', width: '100%', display: 'block'
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    >
      <div style={{ background: 'linear-gradient(135deg,#1e293b,#0f172a)', border: '1px solid rgba(59,130,246,.35)', borderRadius: '20px', padding: isMobile ? '28px 22px' : '40px', width: '100%', maxWidth: '440px', position: 'relative' }}>
        
        {/* Fermer */}
        <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(71,85,105,.6)', border: 'none', color: '#94a3b8', cursor: 'pointer', borderRadius: '8px', width: '32px', height: '32px', fontSize: '16px', fontWeight: 700 }}>✕</button>

        <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 800, color: '#fff' }}>
          {mode === 'login' ? '👋 Bon retour !' : '🚀 Créer mon compte'}
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 22px 0' }}>
          {mode === 'login' ? 'Connectez-vous pour accéder à vos crédits' : 'Inscription gratuite · Crédits sauvegardés à vie'}
        </p>

        {/* Onglets */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(15,23,42,.9)', borderRadius: '10px', padding: '4px', marginBottom: '22px' }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setErrMsg(''); }}
              style={{ background: mode === m ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)' : 'transparent', color: mode === m ? '#fff' : '#64748b', border: 'none', borderRadius: '8px', padding: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', transition: 'all .2s' }}>
              {m === 'login' ? 'Se connecter' : "S'inscrire"}
            </button>
          ))}
        </div>

        {/* Champs — NE PAS mettre dans un sous-composant pour garder le focus */}
        <div style={{ marginBottom: '14px' }}>
          <input
            type="email"
            placeholder="Votre adresse email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoFocus
            style={{ ...inputStyle, marginBottom: '12px' }}
          />
          <input
            type="password"
            placeholder="Mot de passe (minimum 6 caractères)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={inputStyle}
          />
        </div>

        {errMsg && (
          <div style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', color: '#fca5a5', fontSize: '14px' }}>
            ⚠️ {errMsg}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: '100%', background: loading ? '#334155' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)', color: '#fff', border: 'none', borderRadius: '10px', padding: '15px', fontWeight: 800, fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer', boxSizing: 'border-box' }}>
          {loading ? '⏳ En cours...' : mode === 'login' ? '→ Se connecter' : '→ Créer mon compte'}
        </button>

        <p style={{ color: '#475569', fontSize: '12px', textAlign: 'center', margin: '14px 0 0 0' }}>
          🔒 Paiement sécurisé Stripe · Vos données sont protégées
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
═══════════════════════════════════════════════════════════ */
export default function PixGlow() {
  const [page, setPage]               = useState('landing');
  const [files, setFiles]             = useState([]);      // tableau de fichiers
  const [previews, setPreviews]       = useState([]);      // tableau de previews
  const [currentIdx, setCurrentIdx]   = useState(0);      // photo affichée
  const [loading, setLoading]         = useState(false);
  const [results, setResults]         = useState([]);      // tableau de résultats
  const [error, setError]             = useState(null);
  const [progress, setProgress]       = useState(0);       // ex: 2/4
  const [credits, setCredits]         = useState(null);
  const [freeLeft, setFreeLeft]       = useState(5);
  const [email, setEmail]             = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isMobile, setIsMobile]       = useState(window.innerWidth < 768);
  const [showAuth, setShowAuth]       = useState(false);
  const fileInputRef   = useRef(null);
  const cameraInputRef = useRef(null);

  const getToken = () => localStorage.getItem('pg_token');
  const authHeaders = () => { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; };

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  useEffect(() => {
    setFreeLeft(parseInt(localStorage.getItem('pg_free') || '5'));
    const token = getToken();
    const savedEmail = localStorage.getItem('pg_email');
    if (token && savedEmail) {
      setEmail(savedEmail); setIsConnected(true);
      fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => { if (d.credits !== undefined) setCredits(d.credits); }).catch(() => {});
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success' && token) {
      setTimeout(() => {
        fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.json()).then(d => {
            if (d.credits !== undefined) { setCredits(d.credits); alert(`✅ Paiement confirmé ! ${d.credits} crédits disponibles.`); window.history.replaceState({}, '', window.location.pathname); }
          });
      }, 2000);
    }
  }, []);

  /* ── Auth callback ── */
  const handleAuthSuccess = (userEmail, userCredits) => {
    setEmail(userEmail); setCredits(userCredits); setIsConnected(true);
    setShowAuth(false); setPage('app');
  };

  const handleLogout = () => {
    ['pg_token','pg_email'].forEach(k => localStorage.removeItem(k));
    setEmail(''); setCredits(null); setIsConnected(false); setPage('landing');
  };

  /* ── Sélection de fichiers (multi) ── */
  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    // Respect du maximum
    const available = isConnected ? (credits ?? 0) : freeLeft;
    const maxAllowed = Math.min(selected.length, MAX_SIMULTANEOUS, available > 0 ? available : MAX_SIMULTANEOUS);
    const chosen = selected.slice(0, maxAllowed);

    if (selected.length > maxAllowed) {
      setError(`Maximum ${maxAllowed} photos sélectionnées (limite : ${MAX_SIMULTANEOUS} simultanées et crédits disponibles).`);
    } else {
      setError(null);
    }

    setFiles(chosen); setResults([]); setProgress(0); setCurrentIdx(0);
    // Générer les previews
    const readers = chosen.map(f => new Promise(resolve => {
      const r = new FileReader();
      r.onload = ev => resolve(ev.target.result);
      r.readAsDataURL(f);
    }));
    Promise.all(readers).then(prev => setPreviews(prev));
  };

  /* ── Upload (toutes les photos, une par une) ── */
  const handleUpload = async () => {
    if (!files.length)                                        { setError('Sélectionnez au moins une photo');            return; }
    if (!isConnected && freeLeft <= 0)                        { setError('Limite gratuite atteinte. Créez un compte.'); return; }
    if (isConnected && credits !== null && credits < files.length) { setError(`Crédits insuffisants. Vous avez ${credits} crédit(s) pour ${files.length} photo(s).`); return; }

    setLoading(true); setError(null); setResults([]); setProgress(0);

    const newResults = [];
    let currentFreeLeft = freeLeft;
    let currentCredits = credits;

    for (let i = 0; i < files.length; i++) {
      setProgress(i + 1);
      try {
        const form = new FormData();
        form.append('file', files[i]);
        const res  = await fetch(`${API_URL}/enhance`, { method: 'POST', headers: authHeaders(), body: form });
        const data = await res.json();
        if (!res.ok) {
          newResults.push({ error: data.detail || 'Erreur', original: previews[i] });
        } else {
          newResults.push({ url: `${API_URL}${data.url}`, filename: data.filename, original: previews[i] });
          if (data.credits_left !== null && data.credits_left !== undefined) {
            currentCredits = data.credits_left;
            setCredits(data.credits_left);
          } else {
            currentFreeLeft = currentFreeLeft - 1;
            setFreeLeft(currentFreeLeft);
            localStorage.setItem('pg_free', currentFreeLeft);
          }
        }
      } catch {
        newResults.push({ error: 'Erreur réseau', original: previews[i] });
      }
      setResults([...newResults]);
    }
    setLoading(false); setCurrentIdx(0);
  };

  const handleDownload = (r) => {
    const a = document.createElement('a'); a.href = r.url; a.download = r.filename; a.click();
  };

  const handleDownloadAll = () => results.filter(r => !r.error).forEach(r => handleDownload(r));

  const handlePayment = async () => {
    const token = getToken();
    if (!token) { setShowAuth(true); return; }
    try {
      const res = await fetch(`${API_URL}/create-checkout-session`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.checkout_url) window.location.href = data.checkout_url;
    } catch { alert('Erreur paiement, réessayez.'); }
  };

  const reset = () => { setFiles([]); setPreviews([]); setResults([]); setError(null); setProgress(0); };

  /* ── Styles ── */
  const S = {
    page: { background: 'linear-gradient(135deg,#0f172a,#1e293b)', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui,sans-serif' },
    nav:  { padding: isMobile ? '14px 18px' : '18px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 },
    logo: { margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 800, cursor: 'pointer' },
    btn:  (bg, ex={}) => ({ background: bg, color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 22px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', ...ex }),
    card: (ex={}) => ({ background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '16px', padding: isMobile ? '20px' : '28px', backdropFilter: 'blur(10px)', ...ex }),
  };

  /* ════════════════════════════════════════════
     LANDING
  ════════════════════════════════════════════ */
  if (page === 'landing') return (
    <div style={S.page}>
      <AuthModal show={showAuth} onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} isMobile={isMobile} />
      <nav style={S.nav}>
        <h1 style={S.logo}>✨ PixGlow</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => setPage('help')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>Aide</button>
          {isConnected
            ? <button onClick={() => setPage('app')} style={S.btn('linear-gradient(135deg,#3b82f6,#1d4ed8)')}>Mon espace →</button>
            : <>
                <button onClick={() => setShowAuth(true)} style={S.btn('rgba(51,65,85,0.8)', { border: '1px solid rgba(148,163,184,0.2)' })}>Connexion</button>
                <button onClick={() => setPage('app')}    style={S.btn('linear-gradient(135deg,#3b82f6,#1d4ed8)')}>Commencer gratuitement</button>
              </>}
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '40px 18px' : '80px 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(59,130,246,.12)', border: '1px solid rgba(59,130,246,.35)', borderRadius: '24px', padding: '6px 18px', marginBottom: '24px', fontSize: '13px', color: '#93c5fd', fontWeight: 600 }}>
          🛍️ Conçu pour les vendeurs Vinted, Leboncoin & Vestiaire
        </div>
        <h2 style={{ fontSize: isMobile ? '36px' : '62px', fontWeight: 900, margin: '0 0 18px 0', background: 'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>
          Photos fond blanc<br/>en 1 clic
        </h2>
        <p style={{ fontSize: isMobile ? '16px' : '20px', color: '#94a3b8', maxWidth: '560px', margin: '0 auto 16px auto', lineHeight: 1.6 }}>
          Suppression automatique du fond, luminosité parfaite,<br/>
          <strong style={{ color: '#e2e8f0' }}>qualité studio pour tes articles Vinted.</strong>
        </p>
        <p style={{ color: '#22c55e', fontWeight: 700, fontSize: '15px', marginBottom: '48px' }}>
          ✅ 5 photos gratuites — aucune carte bancaire requise
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '16px', marginBottom: '56px' }}>
          {[
            { icon: '🎨', titre: 'Fond blanc parfait', desc: 'Ton article ressort comme sur un site e-commerce professionnel', color: '59,130,246' },
            { icon: '✨', titre: 'Luminosité & netteté', desc: 'Contraste et couleurs optimisés automatiquement à chaque image', color: '167,139,250' },
            { icon: '⚡', titre: 'Jusqu\'à 5 photos à la fois', desc: 'Traitement simultané pour aller encore plus vite', color: '34,197,94' },
          ].map((f, i) => (
            <div key={i} style={{ background: `rgba(${f.color},.07)`, border: `1px solid rgba(${f.color},.22)`, borderRadius: '14px', padding: '24px 20px' }}>
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
            <div style={{ background: 'linear-gradient(135deg,#1e293b,#334155)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
              <div style={{ height: '110px', background: 'linear-gradient(135deg,#334155,#475569)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px' }}>👗</div>
              <p style={{ color: '#64748b', fontSize: '11px', margin: '10px 0 0 0', fontWeight: 600, textTransform: 'uppercase' }}>Avant</p>
            </div>
            <div style={{ fontSize: '22px', color: '#3b82f6', fontWeight: 900, textAlign: 'center' }}>→</div>
            <div style={{ background: '#fff', borderRadius: '10px', padding: '16px', textAlign: 'center', border: '2px solid #22c55e' }}>
              <div style={{ height: '110px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px', border: '1px solid #e2e8f0' }}>👗</div>
              <p style={{ color: '#16a34a', fontSize: '11px', margin: '10px 0 0 0', fontWeight: 700, textTransform: 'uppercase' }}>Après — Fond blanc ✅</p>
            </div>
          </div>
        </div>

        {/* Témoignages */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '14px', maxWidth: '900px', margin: '0 auto 52px auto' }}>
          {[
            { nom: 'Sophie M.', texte: "Mes vues ont doublé sur Vinted depuis que j'utilise PixGlow. Mes photos font vraiment pro !" },
            { nom: 'Karim B.', texte: "Simple, rapide, bluffant. Je prépare 20 fiches produit en 5 minutes." },
            { nom: 'Léa F.',   texte: "Enfin un outil pensé pour Vinted. Le fond blanc change vraiment tout pour les acheteurs." },
          ].map((t, i) => (
            <div key={i} style={{ ...S.card(), textAlign: 'left' }}>
              <p style={{ margin: '0 0 4px 0' }}>⭐⭐⭐⭐⭐</p>
              <p style={{ color: '#cbd5e1', fontSize: '14px', margin: '0 0 12px 0', lineHeight: 1.6, fontStyle: 'italic' }}>"{t.texte}"</p>
              <p style={{ color: '#60a5fa', fontSize: '13px', margin: 0, fontWeight: 700 }}>— {t.nom}</p>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', maxWidth: '640px', margin: '0 auto 40px auto' }}>
          <div style={{ ...S.card({ border: '1px solid rgba(34,197,94,.3)', background: 'rgba(34,197,94,.06)' }), textAlign: 'center' }}>
            <p style={{ fontSize: '28px', margin: '0 0 6px 0' }}>🎁</p>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px' }}>Gratuit</h3>
            <p style={{ color: '#22c55e', fontWeight: 700, fontSize: '22px', margin: '0 0 8px 0' }}>5 photos</p>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 16px 0' }}>Sans inscription<br/>Sans carte bancaire</p>
            <button onClick={() => setPage('app')} style={S.btn('linear-gradient(135deg,#22c55e,#16a34a)', { width: '100%' })}>Essayer maintenant</button>
          </div>
          <div style={{ ...S.card({ border: '2px solid rgba(59,130,246,.5)', background: 'rgba(59,130,246,.08)' }), textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', borderRadius: '20px', padding: '3px 14px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>MEILLEURE OFFRE</div>
            <p style={{ fontSize: '28px', margin: '0 0 6px 0' }}>💎</p>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px' }}>Pro</h3>
            <p style={{ color: '#60a5fa', fontWeight: 700, fontSize: '22px', margin: '0 0 4px 0' }}>15€</p>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 4px 0' }}>100 crédits · 0,15€/photo</p>
            <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 16px 0' }}>Valables à vie</p>
            <button onClick={() => setShowAuth(true)} style={S.btn('linear-gradient(135deg,#3b82f6,#1d4ed8)', { width: '100%' })}>Acheter les crédits</button>
          </div>
        </div>
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
            { q: "Combien de photos gratuites ?",     r: "5 photos gratuites par adresse IP, sans inscription ni carte bancaire." },
            { q: "Combien de photos à la fois ?",     r: `Jusqu'à ${MAX_SIMULTANEOUS} photos simultanément. Elles sont traitées automatiquement les unes après les autres.` },
            { q: "Quel tarif après l'essai ?",        r: "1 crédit = 1 photo = 0,15€. Le pack 100 crédits est à 15€, valable à vie." },
            { q: "Mes crédits expirent-ils ?",        r: "Non. Vos crédits sont sauvegardés sur nos serveurs et ne disparaissent jamais." },
            { q: "Quels formats sont acceptés ?",     r: "JPG, PNG, WEBP. Taille recommandée : moins de 10 Mo par photo." },
            { q: "Est-ce adapté à Vinted ?",          r: "Oui, c'est la raison d'être de PixGlow. Les photos fond blanc augmentent significativement les clics et les ventes sur Vinted." },
            { q: "Le paiement est-il sécurisé ?",    r: "Oui, 100%. Le paiement est traité par Stripe, le standard mondial de la sécurité bancaire en ligne." },
            { q: "Comment contacter le support ?",   r: "Écrivez à support@pixglow.app — réponse garantie en moins de 24h." },
          ].map((faq, i, arr) => (
            <div key={i} style={{ paddingBottom: '20px', marginBottom: '20px', borderBottom: i < arr.length-1 ? '1px solid rgba(255,255,255,.07)' : 'none' }}>
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
  const doneCount    = results.filter(r => !r.error).length;
  const hasResults   = results.length > 0;
  const allDone      = hasResults && results.length === files.length;

  return (
    <div style={S.page}>
      <AuthModal show={showAuth} onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} isMobile={isMobile} />

      <nav style={S.nav}>
        <h1 style={S.logo} onClick={() => setPage('landing')}>✨ PixGlow</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isConnected && !isMobile && <span style={{ color: '#64748b', fontSize: '13px' }}>{email}</span>}
          {isConnected
            ? <button onClick={handleLogout} style={S.btn('#ef4444')}>Déconnexion</button>
            : <>
                <button onClick={() => setShowAuth(true)} style={S.btn('rgba(51,65,85,0.8)', { border: '1px solid rgba(148,163,184,0.2)' })}>Connexion</button>
                <button onClick={() => setPage('landing')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}>← Accueil</button>
              </>}
        </div>
      </nav>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: isMobile ? '16px' : '32px 20px' }}>

        {/* ─ COMPTEUR ─ */}
        <div style={{
          background: credits !== null ? 'linear-gradient(135deg,rgba(34,197,94,.13),rgba(34,197,94,.06))' : freeLeft > 0 ? 'linear-gradient(135deg,rgba(251,146,60,.13),rgba(251,146,60,.06))' : 'linear-gradient(135deg,rgba(239,68,68,.13),rgba(239,68,68,.06))',
          border: `1px solid ${credits !== null ? 'rgba(34,197,94,.3)' : freeLeft > 0 ? 'rgba(251,146,60,.3)' : 'rgba(239,68,68,.3)'}`,
          borderRadius: '16px', padding: '20px', marginBottom: '18px', textAlign: 'center'
        }}>
          <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>
            {credits !== null ? 'Crédits disponibles' : 'Photos gratuites restantes'}
          </p>
          <p style={{ fontSize: isMobile ? '40px' : '52px', fontWeight: 900, color: credits !== null ? '#22c55e' : freeLeft > 0 ? '#fb923c' : '#ef4444', margin: 0, lineHeight: 1 }}>
            {credits !== null ? credits : `${freeLeft}/5`}
          </p>
        </div>

        {/* ─ UPLOAD ─ */}
        <div style={{ ...S.card(), marginBottom: '18px' }}>
          {/* Input fichiers — MULTIPLE activé */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesChange}
            style={{ display: 'none' }}
          />
          {/* Input caméra — UNIQUEMENT mobile, PAS de multiple (limitation hardware) */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFilesChange}
            style={{ display: 'none' }}
          />

          {!allDone ? (
            <>
              {/* Boutons sélection */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr', gap: '12px', marginBottom: previews.length ? '18px' : '0' }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{ background: 'rgba(59,130,246,.12)', border: '2px solid rgba(59,130,246,.4)', borderRadius: '12px', padding: '22px 12px', color: '#60a5fa', cursor: 'pointer', fontWeight: 700, fontSize: '16px' }}>
                  📁 Choisir {isMobile ? '' : `jusqu'à ${MAX_SIMULTANEOUS} photos`}
                </button>
                {/* Caméra : SEULEMENT sur mobile */}
                {isMobile && (
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    style={{ background: 'rgba(167,139,250,.12)', border: '2px solid rgba(167,139,250,.4)', borderRadius: '12px', padding: '22px 12px', color: '#c4b5fd', cursor: 'pointer', fontWeight: 700, fontSize: '16px' }}>
                    📷 Prendre une photo
                  </button>
                )}
              </div>

              {/* Indication max — desktop seulement */}
              {!isMobile && (
                <p style={{ color: '#475569', fontSize: '13px', textAlign: 'center', margin: '10px 0 0 0' }}>
                  Maximum {MAX_SIMULTANEOUS} photos simultanément · JPG, PNG, WEBP
                </p>
              )}

              {/* Grille de previews */}
              {previews.length > 0 && (
                <div style={{ marginTop: '18px' }}>
                  <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 12px 0', fontWeight: 600 }}>
                    {previews.length} photo{previews.length > 1 ? 's' : ''} sélectionnée{previews.length > 1 ? 's' : ''}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(previews.length, isMobile ? 3 : 5)}, 1fr)`, gap: '8px', marginBottom: '18px' }}>
                    {previews.map((src, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={src} alt={`Photo ${i+1}`} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px', border: '2px solid rgba(59,130,246,.3)' }} />
                        {/* Badge progression si en cours */}
                        {loading && i < progress && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(34,197,94,.25)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>✅</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#f87171', fontSize: '14px', textAlign: 'center' }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Barre de progression */}
              {loading && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>Traitement en cours...</span>
                    <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: '13px' }}>{progress}/{files.length}</span>
                  </div>
                  <div style={{ background: 'rgba(51,65,85,.6)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ background: 'linear-gradient(90deg,#3b82f6,#a78bfa)', height: '100%', width: `${(progress / files.length) * 100}%`, borderRadius: '8px', transition: 'width .4s ease' }} />
                  </div>
                  <p style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', marginTop: '6px' }}>~10–15 secondes par photo</p>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!files.length || loading}
                style={{ width: '100%', border: 'none', fontWeight: 800, borderRadius: '12px', padding: '18px', fontSize: '18px', cursor: files.length && !loading ? 'pointer' : 'not-allowed', background: files.length && !loading ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)' : 'rgba(71,85,105,.6)', color: '#fff' }}>
                {loading
                  ? `⏳ Photo ${progress}/${files.length} en cours...`
                  : files.length
                    ? `⚡ Améliorer ${files.length} photo${files.length > 1 ? 's' : ''}`
                    : '← Sélectionnez des photos'}
              </button>
            </>
          ) : (
            /* ─ RÉSULTATS ─ */
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#22c55e' }}>
                  ✅ {doneCount}/{results.length} photo{doneCount > 1 ? 's' : ''} améliorée{doneCount > 1 ? 's' : ''}
                </h3>
                {doneCount > 1 && (
                  <button onClick={handleDownloadAll} style={S.btn('linear-gradient(135deg,#22c55e,#16a34a)', { padding: '8px 16px', fontSize: '13px' })}>
                    📥 Tout télécharger
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: '16px', marginBottom: '18px' }}>
                {results.map((r, i) => (
                  <div key={i} style={{ background: r.error ? 'rgba(239,68,68,.08)' : 'rgba(15,23,42,.6)', border: `1px solid ${r.error ? 'rgba(239,68,68,.3)' : 'rgba(34,197,94,.25)'}`, borderRadius: '12px', padding: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                      <div>
                        <p style={{ color: '#64748b', fontSize: '10px', margin: '0 0 6px 0', textTransform: 'uppercase', fontWeight: 700 }}>Avant</p>
                        <img src={r.original} alt="Avant" style={{ width: '100%', borderRadius: '6px' }} />
                      </div>
                      <div>
                        <p style={{ color: r.error ? '#f87171' : '#16a34a', fontSize: '10px', margin: '0 0 6px 0', textTransform: 'uppercase', fontWeight: 700 }}>
                          {r.error ? 'Erreur' : 'Après ✅'}
                        </p>
                        {r.error
                          ? <div style={{ width: '100%', aspectRatio: '1', background: 'rgba(239,68,68,.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>⚠️</div>
                          : <img src={r.url} alt="Après" style={{ width: '100%', borderRadius: '6px', background: '#fff' }} />}
                      </div>
                    </div>
                    {!r.error && (
                      <button onClick={() => handleDownload(r)} style={S.btn('linear-gradient(135deg,#22c55e,#16a34a)', { width: '100%', padding: '10px', fontSize: '13px', boxSizing: 'border-box' })}>
                        📥 Télécharger
                      </button>
                    )}
                    {r.error && <p style={{ color: '#f87171', fontSize: '12px', margin: '6px 0 0 0', textAlign: 'center' }}>{r.error}</p>}
                  </div>
                ))}
              </div>

              <button onClick={reset} style={S.btn('rgba(71,85,105,.7)', { width: '100%', padding: '14px', fontSize: '15px', boxSizing: 'border-box' })}>
                🔄 Traiter de nouvelles photos
              </button>
            </>
          )}
        </div>

        {/* ─ SECTION BAS ─ */}
        {!isConnected ? (
          <div style={{ background: 'linear-gradient(135deg,rgba(59,130,246,.1),rgba(167,139,250,.08))', border: '1px solid rgba(59,130,246,.25)', borderRadius: '16px', padding: isMobile ? '22px 18px' : '28px 36px', textAlign: 'center' }}>
            <p style={{ fontSize: '20px', margin: '0 0 6px 0' }}>💎</p>
            <h3 style={{ margin: '0 0 8px 0', fontSize: isMobile ? '18px' : '20px', fontWeight: 800 }}>Envie de plus de photos ?</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 20px 0', lineHeight: 1.6 }}>
              Créez un compte gratuit et achetez des crédits.<br/>
              <strong style={{ color: '#e2e8f0' }}>100 photos à 15€ · Valables à vie · Paiement sécurisé</strong>
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setShowAuth(true)} style={S.btn('linear-gradient(135deg,#3b82f6,#1d4ed8)', { padding: '13px 30px', fontSize: '15px', boxShadow: '0 6px 20px rgba(59,130,246,.3)' })}>
                🚀 Créer mon compte gratuitement
              </button>
              <button onClick={() => setShowAuth(true)} style={S.btn('rgba(51,65,85,0.8)', { padding: '13px 24px', fontSize: '15px', border: '1px solid rgba(148,163,184,0.2)' })}>
                J'ai déjà un compte
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ color: '#94a3b8', marginBottom: '18px', fontSize: '15px' }}>Augmentez vos ventes Vinted avec plus de crédits 🚀</p>
            <button onClick={handlePayment} style={{ ...S.btn('linear-gradient(135deg,#3b82f6,#1d4ed8)'), padding: isMobile ? '16px 32px' : '20px 56px', fontSize: isMobile ? '17px' : '19px', boxShadow: '0 10px 30px rgba(59,130,246,.35)', borderRadius: '14px' }}>
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