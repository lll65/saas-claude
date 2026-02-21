import React, { useState, useRef, useEffect } from 'react';

const API_URL = "https://web-production-f1129.up.railway.app";
const API_KEY = "test_key_12345";

export default function PixGlow() {
  const [page, setPage] = useState('landing'); // 'landing', 'app'
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [credits, setCredits] = useState(null);
  const [freeImagesUsed, setFreeImagesUsed] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedFree = parseInt(localStorage.getItem('photoboost_free_used') || "0");
    setFreeImagesUsed(savedFree);
    const savedEmail = localStorage.getItem('photoboost_email');
    const savedPassword = localStorage.getItem('photoboost_password');
    
    if (savedEmail) {
      setEmail(savedEmail);
      setIsConnected(true);
      const savedCredits = parseInt(localStorage.getItem('photoboost_credits') || "0");
      setCredits(savedCredits);
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success" && savedEmail && savedPassword) {
      fetch(`${API_URL}/login?email=${encodeURIComponent(savedEmail)}&password=${encodeURIComponent(savedPassword)}`, {
        method: "POST",
        headers: { "x-api-key": API_KEY }
      })
      .then(r => r.json())
      .then(data => {
        if (data.status === "success") {
          localStorage.setItem('photoboost_credits', data.credits);
          setCredits(data.credits);
          alert(`✅ Paiement réussi! ${data.credits} crédits disponibles!`);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
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
      if (freeImagesUsed >= 5) {
        setError("❌ Limite gratuite atteinte! Inscrivez-vous pour plus.");
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
        const newFree = freeImagesUsed + 1;
        setFreeImagesUsed(newFree);
        localStorage.setItem('photoboost_free_used', newFree);
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
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh', color: '#fff' }}>
        {/* HEADER */}
        <div style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>✨ PixGlow</h1>
          <button onClick={() => setPage('app')} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', padding: '12px 30px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
            Commencer →
          </button>
        </div>

        {/* HERO */}
        <div style={{ padding: '80px 40px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '56px', fontWeight: 'bold', marginBottom: '20px', background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Transforme tes photos en 1 clic
          </h2>
          <p style={{ fontSize: '20px', color: '#cbd5e1', marginBottom: '40px' }}>
            Fond blanc parfait, luminosité optimale, qualité maximale. Idéal pour Vinted, eBay, Instagram.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '60px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', padding: '30px', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>🎨</div>
              <h3 style={{ marginBottom: '10px' }}>Fond Blanc</h3>
              <p style={{ color: '#cbd5e1', marginBottom: 0 }}>Retire automatiquement le fond</p>
            </div>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px', padding: '30px', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>✨</div>
              <h3 style={{ marginBottom: '10px' }}>Luminosité Parfaite</h3>
              <p style={{ color: '#cbd5e1', marginBottom: 0 }}>Optimise la lumière automatiquement</p>
            </div>
            <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', padding: '30px', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>⚡</div>
              <h3 style={{ marginBottom: '10px' }}>Gratuit + Payant</h3>
              <p style={{ color: '#cbd5e1', marginBottom: 0 }}>5 images gratuites, puis €15 pour illimité</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <button 
              onClick={() => setPage('app')} 
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', padding: '16px 32px', fontSize: '18px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              5 Images Gratuites
            </button>
            <button 
              onClick={() => { setPage('app'); setTimeout(() => handlePayment(), 500); }} 
              style={{ background: 'transparent', color: '#60a5fa', padding: '16px 32px', fontSize: '18px', borderRadius: '10px', border: '2px solid #60a5fa', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Payer 100 crédits
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p>© 2026 PixGlow - Améliore tes photos comme un pro</p>
        </div>
      </div>
    );
  }

  // ===== APP PAGE =====
  return (
    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh', color: '#fff', padding: '20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', padding: '20px', background: 'rgba(51, 65, 85, 0.5)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>✨ PixGlow</h1>
          {isConnected ? (
            <button 
              onClick={handleLogout}
              style={{ background: '#ef4444', color: '#fff', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', border: 'none', fontWeight: 'bold' }}
            >
              Déconnexion
            </button>
          ) : null}
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: credits !== null ? '1fr 1fr' : '1fr', gap: '20px', marginBottom: '30px' }}>
          {credits !== null && (
            <div style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', padding: '20px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
              <p style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '10px' }}>Crédits restants</p>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#22c55e', margin: 0 }}>{credits}</p>
            </div>
          )}
          {credits === null && (
            <div style={{ background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(251, 146, 60, 0.1) 100%)', border: '1px solid rgba(251, 146, 60, 0.3)', borderRadius: '12px', padding: '20px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
              <p style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '10px' }}>Images gratuites</p>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#fb923c', margin: 0 }}>{freeImagesUsed}/5</p>
            </div>
          )}
        </div>

        {/* MAIN */}
        <div style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '16px', padding: '40px', backdropFilter: 'blur(10px)' }}>
          {!result ? (
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              <div 
                onClick={() => fileInputRef.current?.click()} 
                style={{ 
                  border: '2px dashed #3b82f6', 
                  borderRadius: '12px', 
                  padding: '60px 20px', 
                  textAlign: 'center', 
                  cursor: 'pointer',
                  background: 'rgba(59, 130, 246, 0.05)',
                  transition: 'all 0.3s ease'
                }}
              >
                {preview ? (
                  <img src={preview} alt="Preview" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '10px' }} />
                ) : (
                  <>
                    <p style={{ fontSize: '48px', margin: '0 0 15px 0' }}>📸</p>
                    <p style={{ fontSize: '18px', margin: '0', color: '#cbd5e1' }}>Clique pour télécharger ta photo</p>
                  </>
                )}
              </div>
              {error && <p style={{ color: '#ef4444', marginTop: '15px', textAlign: 'center' }}>{error}</p>}
              <button 
                onClick={handleUpload} 
                disabled={!file || loading} 
                style={{ 
                  width: '100%', 
                  background: file ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : '#6b7280',
                  color: '#fff', 
                  padding: '14px', 
                  marginTop: '20px', 
                  borderRadius: '10px', 
                  cursor: file ? 'pointer' : 'not-allowed',
                  border: 'none', 
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                {loading ? '⏳ En cours...' : '⚡ Améliorer'}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <p style={{ color: '#cbd5e1', marginBottom: '10px' }}>Avant</p>
                  <img src={preview} alt="Avant" style={{ width: '100%', borderRadius: '10px' }} />
                </div>
                <div>
                  <p style={{ color: '#cbd5e1', marginBottom: '10px' }}>Après</p>
                  <img src={result.url} alt="Après" style={{ width: '100%', borderRadius: '10px' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <button 
                  onClick={handleDownload} 
                  style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', padding: '12px', borderRadius: '10px', cursor: 'pointer', border: 'none', fontWeight: 'bold' }}
                >
                  📥 Télécharger
                </button>
                <button 
                  onClick={handleReset} 
                  style={{ background: 'rgba(107, 114, 128, 0.5)', color: '#fff', padding: '12px', borderRadius: '10px', cursor: 'pointer', border: 'none', fontWeight: 'bold' }}
                >
                  Nouvelle image
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PAYMENT / AUTH */}
        {!isConnected ? (
          <div style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '16px', padding: '40px', marginTop: '30px', backdropFilter: 'blur(10px)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Inscrivez-vous pour accéder au paiement</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <button 
                onClick={handleLogin}
                style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: 'none', fontWeight: 'bold', fontSize: '16px' }}
              >
                Connexion
              </button>
              <button 
                onClick={handleRegister}
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)', color: '#fff', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: 'none', fontWeight: 'bold', fontSize: '16px' }}
              >
                S'inscrire
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button 
              onClick={handlePayment}
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', padding: '16px 40px', fontSize: '18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}
            >
              💳 Payer: 100 crédits - 15€
            </button>
          </div>
        )}
      </div>
    </div>
  );
}