import React, { useState, useRef, useEffect } from 'react';

const API_URL = "https://web-production-f1129.up.railway.app";
const API_KEY = "test_key_12345";

export default function PixGlow() {
  const [page, setPage] = useState('landing');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [credits, setCredits] = useState(null);
  const [freeImagesLeft, setFreeImagesLeft] = useState(5);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const savedFree = parseInt(localStorage.getItem('photoboost_free_left') || "5");
    setFreeImagesLeft(savedFree);

    const savedEmail = localStorage.getItem('photoboost_email');
const savedPassword = localStorage.getItem('photoboost_password');

if (savedEmail && savedPassword) {
  setEmail(savedEmail);
  setIsConnected(true);
  
  // 🔥 Récupère TOUJOURS les crédits du serveur au reload
  fetch(`${API_URL}/login?email=${encodeURIComponent(savedEmail)}&password=${encodeURIComponent(savedPassword)}`, {
    method: "POST",
    headers: { "x-api-key": API_KEY }
  })
  .then(r => r.json())
  .then(data => {
    if (data.status === "success") {
      setCredits(data.credits); // ✅ Du SERVEUR = JAMAIS PERTE!
      localStorage.setItem('photoboost_credits', data.credits);
    }
  })
  .catch(err => console.log("Erreur load credits:", err));
}

    // Check payment success
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success" && savedEmail && savedPassword) {
      console.log("💳 Payment success detected, refreshing credits...");
      
      // Attendre 2 secondes que le webhook soit traité
      setTimeout(() => {
        fetch(`${API_URL}/login?email=${encodeURIComponent(savedEmail)}&password=${encodeURIComponent(savedPassword)}`, {
          method: "POST",
          headers: { "x-api-key": API_KEY }
        })
        .then(r => r.json())
        .then(data => {
          console.log("✅ Login response:", data);
          if (data.status === "success") {
            localStorage.setItem('photoboost_credits', data.credits);
            setCredits(data.credits);
            alert(`✅ Paiement réussi!\n💰 Vous avez maintenant ${data.credits} crédits!`);
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        })
        .catch(err => {
          console.error("❌ Erreur refresh:", err);
          alert("Erreur lors de la récupération des crédits. Rechargez la page.");
        });
      }, 2000);
    }
  }, []);

  const handleRegister = async () => {
    if (!email.includes("@")) {
      alert("Email valide requis");
      return;
    }
    if (password.length < 6) {
      alert("Minimum 6 caractères");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/register?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
        method: "POST",
        headers: { "x-api-key": API_KEY }
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('photoboost_email', email);
        localStorage.setItem('photoboost_password', password);
        localStorage.setItem('photoboost_credits', "0");
        setCredits(0);
        setIsConnected(true);
        setPage('app');
      } else {
        alert("Erreur: " + data.detail);
      }
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const handleLogin = async () => {
    if (!email.includes("@")) {
      alert("Email valide requis");
      return;
    }
    if (password.length < 6) {
      alert("Minimum 6 caractères");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
        method: "POST",
        headers: { "x-api-key": API_KEY }
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('photoboost_email', email);
        localStorage.setItem('photoboost_password', password);
        localStorage.setItem('photoboost_credits', data.credits);
        setCredits(data.credits);
        setIsConnected(true);
        setPage('app');
      } else {
        alert("Erreur: " + data.detail);
      }
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('photoboost_email');
    localStorage.removeItem('photoboost_password');
    localStorage.removeItem('photoboost_credits');
    setEmail("");
    setPassword("");
    setCredits(null);
    setIsConnected(false);
    setPage('landing');
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result);
      reader.readAsDataURL(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Sélectionnez une image");
      return;
    }

    if (credits === null) {
      if (freeImagesLeft <= 0) {
        setError("❌ Limite de 5 images gratuites atteinte! Inscrivez-vous pour plus.");
        return;
      }
    } else {
      if (credits <= 0) {
        setError("❌ Crédits épuisés!");
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/enhance?email=${email ? encodeURIComponent(email) : ""}`, {
        method: "POST",
        headers: { "x-api-key": API_KEY },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur serveur");
      }

      const data = await response.json();
      setResult({ filename: data.filename, url: `${API_URL}${data.url}` });
      setFile(null);

      if (data.credits_left !== null) {
        setCredits(data.credits_left);
        localStorage.setItem('photoboost_credits', data.credits_left);
      } else {
        const newLeft = freeImagesLeft - 1;
        setFreeImagesLeft(newLeft);
        localStorage.setItem('photoboost_free_left', newLeft);
      }
    } catch (err) {
      setError("Erreur: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.filename;
    a.click();
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const handlePayment = async () => {
    if (!isConnected) {
      alert("Inscrivez-vous d'abord!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/create-checkout-session?email=${encodeURIComponent(email)}`, {
        method: "POST",
        headers: { "x-api-key": API_KEY }
      });
      const data = await response.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert("Erreur: " + (data.detail || "Impossible de créer la session"));
      }
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  // ===== LANDING PAGE =====
  if (page === 'landing') {
    return (
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh', color: '#fff', overflowX: 'hidden' }}>
        <div style={{ padding: isMobile ? '15px' : '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 style={{ margin: 0, fontSize: isMobile ? '24px' : '28px', fontWeight: 'bold' }}>✨ PixGlow</h1>
          <button onClick={() => setPage('app')} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', padding: isMobile ? '10px 20px' : '12px 30px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: isMobile ? '14px' : '16px' }}>
            {isMobile ? 'Go' : 'Commencer →'}
          </button>
        </div>

        <div style={{ padding: isMobile ? '40px 20px' : '80px 40px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '32px' : '56px', fontWeight: 'bold', marginBottom: '20px', background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Transforme tes photos en 1 clic
          </h2>
          <p style={{ fontSize: isMobile ? '16px' : '20px', color: '#cbd5e1', marginBottom: '40px' }}>
            Fond blanc parfait, luminosité optimale, qualité maximale.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', padding: '20px', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎨</div>
              <h3 style={{ marginBottom: '5px', fontSize: '16px' }}>Fond Blanc</h3>
              <p style={{ color: '#cbd5e1', marginBottom: 0, fontSize: '14px' }}>Retire automatiquement le fond</p>
            </div>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px', padding: '20px', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>✨</div>
              <h3 style={{ marginBottom: '5px', fontSize: '16px' }}>Luminosité</h3>
              <p style={{ color: '#cbd5e1', marginBottom: 0, fontSize: '14px' }}>Optimise la lumière</p>
            </div>
            <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', padding: '20px', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>⚡</div>
              <h3 style={{ marginBottom: '5px', fontSize: '16px' }}>Gratuit</h3>
              <p style={{ color: '#cbd5e1', marginBottom: 0, fontSize: '14px' }}>5 images gratuites</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px', maxWidth: '600px', margin: '0 auto' }}>
            <button 
              onClick={() => setPage('app')} 
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', padding: '14px', fontSize: isMobile ? '16px' : '18px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              5 Images Gratuites
            </button>
            <button 
              onClick={() => { setPage('app'); setTimeout(() => handlePayment(), 500); }} 
              style={{ background: 'transparent', color: '#60a5fa', padding: '14px', fontSize: isMobile ? '16px' : '18px', borderRadius: '10px', border: '2px solid #60a5fa', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Payer 100 crédits
            </button>
          </div>
        </div>
      </div>
    );
  }

// ===== HELP PAGE =====
if (page === 'help') {
  return (
    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh', color: '#fff', overflowX: 'hidden' }}>
      <div style={{ padding: isMobile ? '15px' : '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ margin: 0, fontSize: isMobile ? '24px' : '28px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setPage('landing')}>✨ PixGlow</h1>
        <button onClick={() => setPage('landing')} style={{ background: '#3b82f6', color: '#fff', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Accueil</button>
      </div>

      <div style={{ padding: isMobile ? '20px' : '40px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: isMobile ? '28px' : '36px', marginBottom: '30px' }}>Centre d'Aide</h1>

        <div style={{ background: 'rgba(51, 65, 85, 0.5)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>❓ Questions Fréquentes</h2>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#60a5fa', marginBottom: '8px' }}>Combien d'images gratuites ai-je?</h3>
            <p style={{ color: '#cbd5e1', margin: 0 }}>Vous avez 5 images gratuites par IP à VIE. Une fois épuisées, vous devez acheter des crédits.</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#60a5fa', marginBottom: '8px' }}>Combien coûte une image?</h3>
            <p style={{ color: '#cbd5e1', margin: 0 }}>1 crédit = 0,15€. Un paquet = 100 crédits pour 15€.</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#60a5fa', marginBottom: '8px' }}>Mes crédits vont-ils disparaître?</h3>
            <p style={{ color: '#cbd5e1', margin: 0 }}>Non! Vos crédits sont stockés sur nos serveurs. Ils restent même après vidage du cache.</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#60a5fa', marginBottom: '8px' }}>Comment contacter le support?</h3>
            <p style={{ color: '#cbd5e1', margin: 0 }}>Envoyez un email à <strong>support@pixglow.app</strong> - Réponse &lt;24h.</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#60a5fa', marginBottom: '8px' }}>Mes photos sont conservées?</h3>
            <p style={{ color: '#cbd5e1', margin: 0 }}>Non, elles sont supprimées après 24h. Téléchargez immédiatement après traitement.</p>
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
        <p>© 2026 PixGlow - La photo qui vend</p>
        <a href="mailto:support@pixglow.app" style={{ color: '#64748b', textDecoration: 'underline' }}>Contact</a>
      </div>
    </div>
  );
}
  // ===== APP PAGE =====
  return (
    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh', color: '#fff', padding: isMobile ? '15px' : '20px', overflowX: 'hidden' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '20px' : '40px', padding: isMobile ? '15px' : '20px', background: 'rgba(51, 65, 85, 0.5)', borderRadius: '12px', backdropFilter: 'blur(10px)', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ margin: 0, fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold', minWidth: '100px' }}>✨ PixGlow</h1>
          {isConnected ? (
            <button 
              onClick={handleLogout}
              style={{ background: '#ef4444', color: '#fff', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', border: 'none', fontWeight: 'bold', fontSize: isMobile ? '12px' : '14px' }}
            >
              Déconnexion
            </button>
          ) : null}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile || credits !== null ? (isMobile ? '1fr' : '1fr 1fr') : '1fr', gap: '15px', marginBottom: '20px' }}>
          {credits !== null && (
            <div style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', padding: '15px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
              <p style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '8px' }}>Crédits</p>
              <p style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 'bold', color: '#22c55e', margin: 0 }}>{credits}</p>
            </div>
          )}
          {credits === null && (
            <div style={{ background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(251, 146, 60, 0.1) 100%)', border: '1px solid rgba(251, 146, 60, 0.3)', borderRadius: '12px', padding: '15px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
              <p style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '8px' }}>Gratuites</p>
              <p style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 'bold', color: '#fb923c', margin: 0 }}>{freeImagesLeft}/5</p>
            </div>
          )}
        </div>

        <div style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '16px', padding: isMobile ? '20px' : '40px', backdropFilter: 'blur(10px)' }}>
          {!result ? (
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              <div 
                onClick={() => fileInputRef.current?.click()} 
                style={{ 
                  border: '2px dashed #3b82f6', 
                  borderRadius: '12px', 
                  padding: isMobile ? '40px 15px' : '60px 20px', 
                  textAlign: 'center', 
                  cursor: 'pointer',
                  background: 'rgba(59, 130, 246, 0.05)',
                  transition: 'all 0.3s ease'
                }}
              >
                {preview ? (
                  <img src={preview} alt="Preview" style={{ width: isMobile ? '100px' : '150px', height: isMobile ? '100px' : '150px', objectFit: 'cover', borderRadius: '10px' }} />
                ) : (
                  <>
                    <p style={{ fontSize: isMobile ? '32px' : '48px', margin: '0 0 10px 0' }}>📸</p>
                    <p style={{ fontSize: isMobile ? '14px' : '18px', margin: '0', color: '#cbd5e1' }}>Clique pour uploader</p>
                  </>
                )}
              </div>
              {error && <p style={{ color: '#ef4444', marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>{error}</p>}
              <button 
                onClick={handleUpload} 
                disabled={!file || loading} 
                style={{ 
                  width: '100%', 
                  background: file ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : '#6b7280',
                  color: '#fff', 
                  padding: '12px', 
                  marginTop: '15px', 
                  borderRadius: '10px', 
                  cursor: file ? 'pointer' : 'not-allowed',
                  border: 'none', 
                  fontWeight: 'bold',
                  fontSize: isMobile ? '14px' : '16px'
                }}
              >
                {loading ? '⏳ En cours...' : '⚡ Améliorer'}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <p style={{ color: '#cbd5e1', marginBottom: '8px', fontSize: '12px' }}>Avant</p>
                  <img src={preview} alt="Avant" style={{ width: '100%', borderRadius: '10px' }} />
                </div>
                <div>
                  <p style={{ color: '#cbd5e1', marginBottom: '8px', fontSize: '12px' }}>Après</p>
                  <img src={result.url} alt="Après" style={{ width: '100%', borderRadius: '10px' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <button 
                  onClick={handleDownload} 
                  style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', padding: '12px', borderRadius: '10px', cursor: 'pointer', border: 'none', fontWeight: 'bold', fontSize: '14px' }}
                >
                  📥 Télécharger
                </button>
                <button 
                  onClick={handleReset} 
                  style={{ background: 'rgba(107, 114, 128, 0.5)', color: '#fff', padding: '12px', borderRadius: '10px', cursor: 'pointer', border: 'none', fontWeight: 'bold', fontSize: '14px' }}
                >
                  Nouvelle
                </button>
              </div>
            </div>
          )}
        </div>

        {!isConnected ? (
          <div style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '16px', padding: isMobile ? '20px' : '40px', marginTop: '20px', backdropFilter: 'blur(10px)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: isMobile ? '18px' : '22px' }}>Inscrivez-vous pour payer</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', border: 'none', boxSizing: 'border-box', fontSize: '16px', background: 'rgba(30, 41, 59, 0.8)', color: '#fff' }}
              />
              <input 
                type="password" 
                placeholder="Mot de passe (min 6)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', border: 'none', boxSizing: 'border-box', fontSize: '16px', background: 'rgba(30, 41, 59, 0.8)', color: '#fff' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
              <button 
                onClick={handleLogin}
                style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: 'none', fontWeight: 'bold', fontSize: '14px' }}
              >
                Connexion
              </button>
              <button 
                onClick={handleRegister}
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)', color: '#fff', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: 'none', fontWeight: 'bold', fontSize: '14px' }}
              >
                S'inscrire
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button 
              onClick={handlePayment}
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', padding: isMobile ? '12px 30px' : '16px 40px', fontSize: isMobile ? '16px' : '18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}
            >
              💳 Payer: 100 crédits - 15€
            </button>
          </div>
        )}
      </div>
    </div>
  );
}