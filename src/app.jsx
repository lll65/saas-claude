import React, { useState, useRef, useEffect } from 'react';

const API_URL = "https://web-production-f1129.up.railway.app";
const API_KEY = "test_key_12345";

export default function PhotoBoost() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [credits, setCredits] = useState(null); // null = gratuit par IP
  const [freeImagesUsed, setFreeImagesUsed] = useState(0);
  
  // Auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Charger les images gratuites utilisées par cette IP
    const savedFree = parseInt(localStorage.getItem('photoboost_free_used') || "0");
    setFreeImagesUsed(savedFree);

    // Charger les données de connexion si existe
    const savedEmail = localStorage.getItem('photoboost_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setIsConnected(true);
      const savedCredits = parseInt(localStorage.getItem('photoboost_credits') || "0");
      setCredits(savedCredits);
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
        alert("✅ Inscrit! Vous avez 0 crédit. Cliquez sur 'Payer' pour en acheter.");
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
        alert("✅ Connecté!");
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

    // Vérifier les limites
    if (credits === null) {
      // Gratuit par IP
      if (freeImagesUsed >= 5) {
        setError("❌ Limite de 5 images gratuites atteinte! Inscrivez-vous et payez pour plus.");
        return;
      }
    } else {
      // Payant
      if (credits <= 0) {
        setError("❌ Crédits épuisés! Achetez-en plus.");
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

      // Update credits
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
      alert("Vous devez d'abord vous inscrire ou vous connecter pour payer!");
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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: '#fff', margin: 0 }}>📸 PhotoBoost</h1>
          {isConnected && (
            <button 
              onClick={handleLogout}
              style={{ background: '#ff4444', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', border: 'none', fontWeight: 'bold' }}
            >
              Déconnexion ({email})
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: credits !== null ? '1fr 1fr' : '1fr', gap: '20px', marginBottom: '20px' }}>
          {credits !== null && (
            <div style={{ background: 'rgba(0,204,0,0.2)', border: '1px solid #00cc00', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
              <p style={{ color: '#00ff00', margin: '0', fontWeight: 'bold' }}>
                💳 Crédits restants: <span style={{ fontSize: '20px' }}>{credits}</span>
              </p>
            </div>
          )}
          {credits === null && (
            <div style={{ background: 'rgba(255,165,0,0.2)', border: '1px solid #ff9900', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
              <p style={{ color: '#ffaa00', margin: '0', fontWeight: 'bold' }}>
                🎯 Gratuites: <span style={{ fontSize: '20px' }}>{freeImagesUsed}/5</span>
              </p>
            </div>
          )}
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

        {!isConnected ? (
          <div style={{ marginTop: '40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '40px' }}>
            <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '30px' }}>Inscrivez-vous pour accéder au paiement</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: '12px', borderRadius: '4px', border: 'none', boxSizing: 'border-box', fontSize: '16px' }}
              />
              <input 
                type="password" 
                placeholder="Mot de passe (min 6 caractères)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ padding: '12px', borderRadius: '4px', border: 'none', boxSizing: 'border-box', fontSize: '16px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <button 
                onClick={handleLogin}
                style={{ background: '#00cc00', color: '#fff', padding: '12px', borderRadius: '4px', cursor: 'pointer', border: 'none', fontWeight: 'bold', fontSize: '16px' }}
              >
                Connexion
              </button>
              <button 
                onClick={handleRegister}
                style={{ background: '#ff9900', color: '#fff', padding: '12px', borderRadius: '4px', cursor: 'pointer', border: 'none', fontWeight: 'bold', fontSize: '16px' }}
              >
                S'inscrire
              </button>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <button 
              onClick={handlePayment}
              style={{ background: '#0066cc', color: '#fff', padding: '15px 40px', fontSize: '18px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}
            >
              💳 Payer: 100 crédits - 15€
            </button>
          </div>
        )}
      </div>
    </div>
  );
}