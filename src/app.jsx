import React, { useState, useRef, useEffect } from 'react';

const API_URL = "https://web-production-f1129.up.railway.app";
const API_KEY = "test_key_12345";

export default function PhotoBoost() {
  const [page, setPage] = useState('landing');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [credits, setCredits] = useState(5);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem('photoboost_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setCredits(parseInt(localStorage.getItem('photoboost_credits') || "5"));
      setPage('app');
    }
  }, []);

  const handleRegister = async () => {
  if (!email.includes("@")) {
    alert("Email valide");
    return;
  }
  if (password.length < 6) {
    alert("Mot de passe minimum 6 caractères");
    return;
  }
  localStorage.setItem('photoboost_email', email);
  localStorage.setItem('photoboost_password', password);
  localStorage.setItem('photoboost_credits', "5");
  setCredits(5);
  setPage('app');
};

const handleLogin = async () => {
  const saved = localStorage.getItem('photoboost_email');
  const savedPwd = localStorage.getItem('photoboost_password');
  
  if (saved === email && savedPwd === password) {
    setCredits(parseInt(localStorage.getItem('photoboost_credits') || "5"));
    setPage('app');
  } else if (!saved) {
    alert("Cet email n'existe pas! S'inscrire d'abord");
  } else {
    alert("Mot de passe incorrect");
  }
};

  const handleLogout = () => {
    localStorage.removeItem('photoboost_email');
    localStorage.removeItem('photoboost_credits');
    setEmail("");
    setPassword("");
    setCredits(5);
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
    if (credits <= 0) {
      setError("❌ Crédits épuisés!");
      return;
    }
    if (!file) {
      setError("Sélectionnez une image");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/enhance?email=${encodeURIComponent(email)}`, {
        method: "POST",
        headers: { "x-api-key": API_KEY },
        body: formData,
      });

      if (!response.ok) throw new Error("Erreur serveur");

      const data = await response.json();
      setResult({ filename: data.filename, url: `${API_URL}${data.url}` });
      setFile(null);

      const newCredits = credits - 1;
      setCredits(newCredits);
      localStorage.setItem('photoboost_credits', newCredits);
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

  if (page === 'landing') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '40px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '800px', textAlign: 'center' }}>
          <h1 style={{ color: '#fff', fontSize: '48px', marginBottom: '20px' }}>📸 PhotoBoost</h1>
          <p style={{ color: '#aaa', fontSize: '20px', marginBottom: '40px' }}>Améliore tes photos en 1 clic</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '40px' }}>
            <div style={{ background: 'rgba(0,102,204,0.1)', padding: '30px 20px', borderRadius: '8px' }}>
              <p style={{ color: '#fff', fontSize: '40px', margin: '0 0 10px 0' }}>🎯</p>
              <p style={{ color: '#fff', fontWeight: 'bold' }}>Fond blanc parfait</p>
            </div>
            <div style={{ background: 'rgba(0,102,204,0.1)', padding: '30px 20px', borderRadius: '8px' }}>
              <p style={{ color: '#fff', fontSize: '40px', margin: '0 0 10px 0' }}>✨</p>
              <p style={{ color: '#fff', fontWeight: 'bold' }}>Luminosité optimale</p>
            </div>
            <div style={{ background: 'rgba(0,102,204,0.1)', padding: '30px 20px', borderRadius: '8px' }}>
              <p style={{ color: '#fff', fontSize: '40px', margin: '0 0 10px 0' }}>⚡</p>
              <p style={{ color: '#fff', fontWeight: 'bold' }}>Gratuit (5 images)</p>
            </div>
          </div>

          <button 
            onClick={() => setPage('login')}
            style={{ background: '#0066cc', color: '#fff', padding: '15px 50px', fontSize: '18px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', border: 'none' }}
          >
            Commencer gratuitement →
          </button>
        </div>
      </div>
    );
  }

  if (page === 'login') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '40px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '400px', background: 'rgba(255,255,255,0.05)', border: '1px solid #0066cc', borderRadius: '12px', padding: '40px' }}>
          <h1 style={{ color: '#fff', textAlign: 'center', marginBottom: '30px' }}>📸 PhotoBoost</h1>

          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '4px', border: 'none', boxSizing: 'border-box' }}
          />

          <input 
            type="password" 
            placeholder="Mot de passe" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '4px', border: 'none', boxSizing: 'border-box' }}
          />

          <button 
            onClick={handleLogin}
            style={{ width: '100%', background: '#0066cc', color: '#fff', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', border: 'none', marginBottom: '10px' }}
          >
            Connexion
          </button>

          <button 
            onClick={handleRegister}
            style={{ width: '100%', background: '#00cc00', color: '#fff', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', border: 'none', marginBottom: '10px' }}
          >
            S'inscrire
          </button>

          <button 
            onClick={() => setPage('landing')}
            style={{ width: '100%', background: 'transparent', color: '#0066cc', padding: '12px', borderRadius: '4px', cursor: 'pointer', border: '1px solid #0066cc' }}
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: '#fff', margin: 0 }}>📸 PhotoBoost</h1>
          <button 
            onClick={handleLogout}
            style={{ background: '#ff4444', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', border: 'none', fontWeight: 'bold' }}
          >
            Déconnexion
          </button>
        </div>

        <div style={{ background: 'rgba(0,102,204,0.2)', border: '1px solid #0066cc', borderRadius: '8px', padding: '15px', marginBottom: '20px', textAlign: 'center' }}>
          <p style={{ color: '#0066cc', margin: '0', fontWeight: 'bold' }}>
            📸 Crédits: <span style={{ fontSize: '20px', color: '#00ff00' }}>{credits}</span>
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '40px' }}>
          {!result ? (
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed #0066cc', borderRadius: '8px', padding: '60px 20px', textAlign: 'center', cursor: 'pointer' }}>
                {preview ? (
                  <img src={preview} alt="Preview" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                ) : (
                  <p style={{ color: '#fff', fontSize: '18px' }}>📤 Cliquez pour uploader</p>
                )}
              </div>
              {error && <p style={{ color: '#ff4444', marginTop: '10px' }}>{error}</p>}
              <button onClick={handleUpload} disabled={!file || loading} style={{ width: '100%', background: '#0066cc', color: '#fff', padding: '12px', marginTop: '20px', borderRadius: '4px', cursor: 'pointer', border: 'none', fontWeight: 'bold' }}>
                {loading ? '⏳...' : '⚡ Améliorer'}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <img src={preview} alt="Avant" style={{ width: '100%', borderRadius: '8px' }} />
                <img src={result.url} alt="Après" style={{ width: '100%', borderRadius: '8px' }} />
              </div>
              <button onClick={handleDownload} style={{ width: '100%', background: '#00cc00', color: '#fff', padding: '12px', borderRadius: '4px', cursor: 'pointer', border: 'none', fontWeight: 'bold', marginBottom: '10px' }}>
                📥 Télécharger
              </button>
              <button onClick={handleReset} style={{ width: '100%', background: '#666', color: '#fff', padding: '12px', borderRadius: '4px', cursor: 'pointer', border: 'none', fontWeight: 'bold' }}>
                Nouvelle
              </button>
            </div>
          )}
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button 
            onClick={async () => {
              try {
                const response = await fetch(`${API_URL}/create-checkout-session?email=${encodeURIComponent(email)}`, {
                  method: "POST",
                  headers: { "x-api-key": API_KEY }
                });
                const data = await response.json();
                if (data.checkout_url) window.location.href = data.checkout_url;
              } catch (err) {
                alert("Erreur: " + err.message);
              }
            }}
            style={{ background: '#0066cc', color: '#fff', padding: '12px 24px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}
          >
            💳 Acheter 100 crédits - 15€
          </button>
        </div>
      </div>
    </div>
  );
}