import React, { useState, useRef } from 'react';

const API_URL = "https://web-production-f1129.up.railway.app";
const API_KEY = "test_key_12345";

export default function PhotoVinted() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

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
        headers: { "x-api-key": API_KEY },
        body: formData,
      });
      if (!response.ok) throw new Error("Erreur serveur");
      const data = await response.json();
      setResult({ filename: data.filename, url: `${API_URL}${data.url}` });
      setFile(null);
      // NE PAS supprimer preview!
    } catch (err) {
      setError(err.message || "Erreur");
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#fff', fontSize: '36px', marginBottom: '10px' }}>📸 PhotoVinted</h1>
        <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '40px' }}>Améliorez vos photos automatiquement</p>

        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '40px' }}>
          {!result ? (
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} disabled={loading} />

              <div onClick={() => !loading && fileInputRef.current?.click()} style={{ border: '2px dashed #0066cc', borderRadius: '8px', padding: '60px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s', background: preview ? 'transparent' : 'rgba(0,102,204,0.05)' }}>
                {preview ? (
                  <div>
                    <img src={preview} alt="Preview" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px', border: '1px solid #0066cc' }} />
                    <p style={{ color: '#fff', fontWeight: 'bold', margin: '10px 0' }}>{file?.name}</p>
                    <p style={{ color: '#aaa' }}>{(file?.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '48px', margin: '0 0 10px 0' }}>📤</p>
                    <p style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: '10px 0' }}>Cliquez pour uploader</p>
                    <p style={{ color: '#aaa', margin: 0 }}>JPG ou PNG • Max 10MB</p>
                  </div>
                )}
              </div>

              {error && <div style={{ background: '#ff4444', color: '#fff', padding: '10px', borderRadius: '4px', marginTop: '20px' }}>❌ {error}</div>}

              <button onClick={handleUpload} disabled={!file || loading} style={{ width: '100%', background: !file || loading ? '#666' : '#0066cc', color: '#fff', padding: '12px', marginTop: '20px', borderRadius: '4px', border: 'none', cursor: !file || loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                {loading ? '⏳ Traitement...' : '⚡ Améliorer'}
              </button>
            </div>
          ) : (
            <div>
              <p style={{ color: '#00cc00', fontWeight: 'bold', marginBottom: '20px', fontSize: '18px' }}>✅ Image traitée!</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <p style={{ color: '#aaa', marginBottom: '10px', fontWeight: 'bold' }}>Avant</p>
                  <img src={preview} alt="Before" style={{ width: '100%', borderRadius: '8px', border: '1px solid #0066cc' }} />
                </div>
                <div>
                  <p style={{ color: '#aaa', marginBottom: '10px', fontWeight: 'bold' }}>Après</p>
                  <img src={result.url} alt="After" style={{ width: '100%', borderRadius: '8px', border: '1px solid #0066cc' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleDownload} style={{ flex: 1, background: '#00cc00', color: '#fff', padding: '12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>📥 Télécharger</button>
                <button onClick={handleReset} style={{ flex: 1, background: '#666', color: '#fff', padding: '12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Nouvelle</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <h2 style={{ color: '#fff', marginBottom: '20px' }}>Plans</h2>
          <button 
            onClick={async () => {
              try {
                const response = await fetch(`${API_URL}/create-checkout-session`, {
                  method: "POST",
                  headers: { "x-api-key": API_KEY }
                });
                const data = await response.json();
                window.location.href = data.checkout_url;
              } catch (err) {
                alert("Erreur: " + err.message);
              }
            }}
            style={{ background: '#0066cc', color: '#fff', padding: '12px 24px', fontSize: '16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            💳 Acheter 100 crédits - 15€
          </button>
        </div>
      </div>
    </div>
  );
}