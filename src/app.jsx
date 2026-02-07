import React, { useState, useRef, useEffect, useCallback } from 'react';

// Assure-toi que cette URL est correcte et sans slash à la fin
const API_URL = "https://web-production-f1129.up.railway.app";
const API_KEY = "test_key_12345";

export default function PhotoVinted() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [credits, setCredits] = useState(() => {
    const saved = localStorage.getItem('photovinted_credits');
    return saved ? parseInt(saved) : 5;
  });
  const fileInputRef = useRef(null);

  // Utilisation de useCallback pour éviter les boucles infinies dans useEffect
  const saveCredits = useCallback((newCredits) => {
    setCredits(newCredits);
    localStorage.setItem('photovinted_credits', newCredits.toString());
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      const saved = localStorage.getItem('photovinted_credits');
      const currentCredits = saved ? parseInt(saved) : 5;
      const newCredits = currentCredits + 100;
      saveCredits(newCredits);
      alert(`✅ Paiement réussi! +100 crédits ajoutés! Total: ${newCredits}`);
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
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur serveur");
      }

      const data = await response.json();
      
      // On s'assure que l'URL commence bien par http/https
      const finalImageUrl = data.url.startsWith('http') ? data.url : `${API_URL}${data.url}`;
      
      setResult({ 
        filename: data.filename, 
        url: finalImageUrl 
      });
      
      setFile(null);
      saveCredits(credits - 1);
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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#fff', fontSize: '36px', marginBottom: '10px' }}>📸 PhotoVinted</h1>
        
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
              <div onClick={() => !loading && fileInputRef.current?.click()} style={{ border: '2px dashed #0066cc', borderRadius: '8px', padding: '60px 20px', textAlign: 'center', cursor: 'pointer', background: preview ? 'transparent' : 'rgba(0,102,204,0.05)' }}>
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
              <button onClick={handleUpload} disabled={!file || loading} style={{ width: '100%', background: '#0066cc', color: '#fff', padding: '12px', marginTop: '20px', borderRadius: '4px', cursor: 'pointer' }}>
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
                <button onClick={handleDownload} style={{ flex: 1, background: '#00cc00', color: '#fff', padding: '12px', borderRadius: '4px' }}>📥 Télécharger</button>
                <button onClick={handleReset} style={{ flex: 1, background: '#666', color: '#fff', padding: '12px', borderRadius: '4px' }}>Nouvelle photo</button>
              </div>
            </div>
          )}
        </div>

        {/* Bouton Stripe */}
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button 
            onClick={async () => {
              try {
                const response = await fetch(`${API_URL}/create-checkout-session`, {
                  method: "POST",
                  headers: { "X-API-Key": API_KEY }
                });
                const data = await response.json();
                if (data.checkout_url) window.location.href = data.checkout_url;
              } catch (err) { alert("Erreur Stripe: " + err.message); }
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