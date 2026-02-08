import React, { useState, useRef, useEffect, useCallback } from 'react';

// Assure-toi que cette URL est correcte et sans slash à la fin
const API_URL = "https://web-production-f1129.up.railway.app";
const API_KEY = "test_key_12345";
const DEFAULT_CREDITS = 5;

const parseStoredCredits = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : DEFAULT_CREDITS;
};

export default function PhotoVinted() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [credits, setCredits] = useState(() => {
    const saved = localStorage.getItem('photovinted_credits');
    return saved ? parseStoredCredits(saved) : DEFAULT_CREDITS;
  });
  const fileInputRef = useRef(null);

  // Utilisation de useCallback pour éviter les boucles infinies dans useEffect
  const saveCredits = useCallback((newCredits) => {
    setCredits(newCredits);
    localStorage.setItem('photovinted_credits', newCredits.toString());
  }, []);

  const consumeCredit = useCallback(() => {
    setCredits((previous) => {
      const nextCredits = Math.max(previous - 1, 0);
      localStorage.setItem('photovinted_credits', nextCredits.toString());
      return nextCredits;
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const legacyStatus = params.get('success') === 'true' ? 'success' : null;
    const status = paymentStatus || legacyStatus;
    if (status === 'success') {
      const saved = localStorage.getItem('photovinted_credits');
      const currentCredits = saved ? parseStoredCredits(saved) : DEFAULT_CREDITS;
      const newCredits = currentCredits + 100;
      saveCredits(newCredits);
      setStatusMessage(`✅ Paiement réussi ! +100 crédits ajoutés. Total: ${newCredits}.`);
    } else if (status === 'cancel') {
      setStatusMessage("⚠️ Paiement annulé. Aucun crédit ajouté.");
    } else if (params.get('canceled') === 'true') {
      setStatusMessage("⚠️ Paiement annulé. Aucun crédit ajouté.");
    }
    if (status || params.get('canceled') === 'true') {
      // Nettoie l'URL sans recharger la page
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [saveCredits]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (credits <= 0) {
      setError("❌ Crédits épuisés! Achète plus d'images pour continuer.");
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

      const response = await fetch(`${API_URL}/enhance`, {
        method: "POST",
        headers: { 
          // Utilisation du format standard X-API-Key pour éviter les blocages CORS
          "X-API-Key": API_KEY 
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Erreur serveur";
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // On s'assure que l'URL commence bien par http/https
      const finalImageUrl = data.url?.startsWith('http') ? data.url : `${API_URL}${data.url}`;
      
      setResult({ 
        filename: data.filename, 
        url: finalImageUrl 
      });
      
      setFile(null);
      consumeCredit();
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Erreur lors de la connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  // ... (Reste du code handleDownload et handleReset identique)
  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.filename;
    document.body.appendChild(a); // Nécessaire pour certains navigateurs
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    padding: '40px 20px',
    fontFamily: 'Arial, sans-serif',
  };

  const buttonBaseStyle = {
    width: '100%',
    background: '#0066cc',
    color: '#fff',
    padding: '12px',
    marginTop: '20px',
    borderRadius: '6px',
    cursor: 'pointer',
    border: 'none',
    fontWeight: 'bold',
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#fff', fontSize: '36px', marginBottom: '10px' }}>📸 PhotoVinted</h1>
        <p style={{ textAlign: 'center', color: '#c9d1f8', marginBottom: '30px' }}>
          Optimise tes photos pour vendre plus vite : éclairage, netteté et rendu pro en un clic.
        </p>

        {statusMessage && (
          <div style={{ background: 'rgba(0,102,204,0.2)', border: '1px solid #4aa3ff', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#d8ebff', textAlign: 'center' }}>
            {statusMessage}
          </div>
        )}
        
        {/* Affichage des crédits */}
        <div style={{ background: 'rgba(0,102,204,0.2)', border: '1px solid #0066cc', borderRadius: '8px', padding: '15px', marginBottom: '20px', textAlign: 'center' }}>
          <p style={{ color: '#0066cc', margin: '0', fontWeight: 'bold' }}>
            📸 Crédits restants: <span style={{ fontSize: '20px', color: '#00ff00' }}>{credits}</span>
          </p>
        </div>

        {/* Zone d'upload / Résultats */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '40px' }}>
          {!result ? (
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} disabled={loading} />
              <div
                onClick={() => !loading && fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #0066cc',
                  borderRadius: '8px',
                  padding: '60px 20px',
                  textAlign: 'center',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  background: preview ? 'transparent' : 'rgba(0,102,204,0.05)',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {preview ? (
                  <div>
                    <img src={preview} alt="Preview" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                    <p style={{ color: '#fff' }}>{file?.name}</p>
                  </div>
                ) : (
                  <p style={{ color: '#fff' }}>📤 Cliquez pour uploader (JPG/PNG)</p>
                )}
              </div>
              {error && <div style={{ color: '#ff4444', marginTop: '10px' }}>{error}</div>}
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                style={{
                  ...buttonBaseStyle,
                  opacity: !file || loading ? 0.6 : 1,
                  cursor: !file || loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? '⏳ Traitement en cours...' : '⚡ Améliorer'}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <img src={preview} alt="Avant" style={{ width: '100%', borderRadius: '8px' }} />
                <img src={result.url} alt="Après" style={{ width: '100%', borderRadius: '8px' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={handleDownload} style={{ flex: 1, background: '#00cc00', color: '#fff', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: 'bold' }}>📥 Télécharger</button>
                <button onClick={handleReset} style={{ flex: 1, background: '#666', color: '#fff', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: 'bold' }}>Nouvelle photo</button>
              </div>
            </div>
          )}
        </div>

        {/* Bouton Stripe */}
        <div style={{ marginTop: '40px' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ color: '#fff', marginTop: 0 }}>Besoin de plus de crédits ?</h2>
            <p style={{ color: '#c9d1f8', marginTop: 0 }}>
              Renseigne ton email pour recevoir la confirmation de paiement et retrouver tes crédits.
            </p>
            <input
              type="email"
              placeholder="ton@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(0,0,0,0.2)',
                color: '#fff',
                marginBottom: '16px',
              }}
            />
          <button 
            onClick={async () => {
              try {
                if (!email || !email.includes('@')) {
                  setError("Ajoute un email valide pour lancer le paiement.");
                  return;
                }
                setError(null);
                const response = await fetch(`${API_URL}/create-checkout-session`, {
                  method: "POST",
                  headers: { 
                    "Content-Type": "application/json",
                    "X-API-Key": API_KEY 
                  },
                  body: JSON.stringify({ email })
                });
                if (!response.ok) {
                  throw new Error("Impossible de démarrer le paiement.");
                }
                const data = await response.json();
                if (data.checkout_url) {
                  window.location.href = data.checkout_url;
                  return;
                }
                throw new Error("Lien de paiement indisponible.");
              } catch (err) {
                alert("Erreur Stripe: " + err.message);
              }
            }}
            style={{ background: '#0066cc', color: '#fff', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', border: 'none', width: '100%' }}
          >
            💳 Acheter 100 crédits - 15€
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
