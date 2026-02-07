import React, { useState, useRef, useEffect } from 'react';

const API_URL = "https://web-production-f1129.up.railway.app";
const API_KEY = "test_key_12345";

export default function PhotoVinted() {
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [credits, setCredits] = useState(5);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem("photovinted_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setIsLoggedIn(true);
      setCredits(parseInt(localStorage.getItem("photovinted_credits") || "5"));
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success" && savedEmail) {
      const newCredits = parseInt(localStorage.getItem("photovinted_credits") || "5") + 100;
      localStorage.setItem("photovinted_credits", newCredits);
      setCredits(newCredits);
      alert(`✅ +100 crédits! Total: ${newCredits}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogin = () => {
    if (!email.includes("@")) {
      alert("Email valide");
      return;
    }
    localStorage.setItem("photovinted_email", email);
    setIsLoggedIn(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (credits <= 0) {
      setError("Crédits épuisés");
      return;
    }
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/enhance`, {
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
      localStorage.setItem("photovinted_credits", newCredits);
    } catch (err) {
      setError("Erreur: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '400px', background: 'rgba(255,255,255,0.05)', border: '1px solid #0066cc', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
          <h1 style={{ color: '#fff', marginBottom: '30px' }}>📸 PhotoVinted</h1>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '4px', border: 'none' }}
          />
          <button 
            onClick={handleLogin}
            style={{ width: '100%', background: '#0066cc', color: '#fff', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ color: '#fff', textAlign: 'center', marginBottom: '20px' }}>📸 PhotoVinted</h1>
        <p style={{ color: '#0066cc', textAlign: 'center', fontWeight: 'bold', marginBottom: '20px' }}>Crédits: {credits}</p>

        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '40px' }}>
          {!result ? (
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed #0066cc', borderRadius: '8px', padding: '60px 20px', textAlign: 'center', cursor: 'pointer' }}>
                {preview ? (
                  <img src={preview} alt="Preview" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                ) : (
                  <p style={{ color: '#fff', fontSize: '18px' }}>📤 Cliquez</p>
                )}
              </div>
              {error && <p style={{ color: '#ff4444', marginTop: '10px' }}>{error}</p>}
              <button onClick={handleUpload} disabled={!file || loading} style={{ width: '100%', background: '#0066cc', color: '#fff', padding: '12px', marginTop: '20px', borderRadius: '4px', cursor: 'pointer' }}>
                {loading ? '⏳...' : '⚡ Améliorer'}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <img src={preview} alt="Avant" style={{ width: '100%', borderRadius: '8px' }} />
                <img src={result.url} alt="Après" style={{ width: '100%', borderRadius: '8px' }} />
              </div>
              <button onClick={() => { const a = document.createElement('a'); a.href = result.url; a.download = result.filename; a.click(); }} style={{ width: '100%', background: '#00cc00', color: '#fff', padding: '12px', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px' }}>
                📥 Télécharger
              </button>
              <button onClick={() => { setFile(null); setPreview(null); setResult(null); }} style={{ width: '100%', background: '#666', color: '#fff', padding: '12px', borderRadius: '4px', cursor: 'pointer' }}>
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
                alert("Erreur Stripe: " + err.message);
              }
            }}
            style={{ background: '#0066cc', color: '#fff', padding: '12px 24px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            💳 Acheter 100 crédits - 15€
          </button>
        </div>
      </div>
    </div>
  );
}
    </div>
  );
}
