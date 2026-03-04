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
  const cameraInputRef = useRef(null);

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
      
      fetch(`${API_URL}/login?email=${encodeURIComponent(savedEmail)}&password=${encodeURIComponent(savedPassword)}`, {
        method: "POST",
        headers: { "x-api-key": API_KEY }
      })
      .then(r => r.json())
      .then(data => {
        if (data.status === "success") {
          setCredits(data.credits);
          localStorage.setItem('photoboost_credits', data.credits);
        }
      })
      .catch(err => console.log("Erreur load:", err));
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success" && savedEmail && savedPassword) {
      setTimeout(() => {
        fetch(`${API_URL}/login?email=${encodeURIComponent(savedEmail)}&password=${encodeURIComponent(savedPassword)}`, {
          method: "POST",
          headers: { "x-api-key": API_KEY }
        })
        .then(r => r.json())
        .then(data => {
          if (data.status === "success") {
            setCredits(data.credits);
            localStorage.setItem('photoboost_credits', data.credits);
            alert(`✅ Paiement réussi!\n💰 ${data.credits} crédits!`);
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        });
      }, 2000);
    }
  }, []);

  const handleRegister = async () => {
    if (!email.includes("@")) { alert("Email valide"); return; }
    if (password.length < 6) { alert("Min 6 chars"); return; }
    try {
      const response = await fetch(`${API_URL}/register?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
        method: "POST", headers: { "x-api-key": API_KEY }
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('photoboost_email', email);
        localStorage.setItem('photoboost_password', password);
        setCredits(0);
        setIsConnected(true);
        setPage('app');
      } else alert("Error: " + data.detail);
    } catch (err) { alert("Error"); }
  };

  const handleLogin = async () => {
    if (!email.includes("@")) { alert("Email valide"); return; }
    if (password.length < 6) { alert("Min 6 chars"); return; }
    try {
      const response = await fetch(`${API_URL}/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
        method: "POST", headers: { "x-api-key": API_KEY }
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('photoboost_email', email);
        localStorage.setItem('photoboost_password', password);
        setCredits(data.credits);
        setIsConnected(true);
        setPage('app');
      } else alert("Error");
    } catch (err) { alert("Error"); }
  };

  const handleLogout = () => {
    localStorage.clear();
    setEmail(""); setPassword(""); setCredits(null);
    setIsConnected(false); setPage('landing');
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
    if (!file) { setError("Select image"); return; }
    if (credits === null && freeImagesLeft <= 0) { setError("Limit reached"); return; }
    if (credits !== null && credits <= 0) { setError("No credits"); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${API_URL}/enhance?email=${email || ""}`, {
        method: "POST",
        headers: { "x-api-key": API_KEY },
        body: formData,
      });
      const data = await response.json();
      setResult({ filename: data.filename, url: `${API_URL}${data.url}` });
      if (data.credits_left !== null) {
        setCredits(data.credits_left);
        localStorage.setItem('photoboost_credits', data.credits_left);
      } else {
        setFreeImagesLeft(freeImagesLeft - 1);
        localStorage.setItem('photoboost_free_left', freeImagesLeft - 1);
      }
    } catch (err) { setError("Error"); }
    finally { setLoading(false); }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.filename;
    a.click();
  };

  const handlePayment = async () => {
    if (!isConnected) { alert("S'inscrire d'abord!"); return; }
    try {
      const response = await fetch(`${API_URL}/create-checkout-session?email=${encodeURIComponent(email)}`, {
        method: "POST", headers: { "x-api-key": API_KEY }
      });
      const data = await response.json();
      if (data.checkout_url) window.location.href = data.checkout_url;
    } catch (err) { alert("Error"); }
  };

  // LANDING
  if (page === 'landing') {
    return (
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh', color: '#fff' }}>
        <div style={{ padding: isMobile ? '15px' : '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 style={{ margin: 0, fontSize: isMobile ? '24px' : '28px', fontWeight: 'bold' }}>✨ PixGlow</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setPage('help')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>Aide</button>
            <button onClick={() => setPage('app')} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', padding: isMobile ? '10px 20px' : '12px 30px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: isMobile ? '14px' : '16px' }}>
              {isMobile ? 'Go' : 'Commencer →'}
            </button>
          </div>
        </div>

        <div style={{ padding: isMobile ? '40px 20px' : '80px 40px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '32px' : '56px', fontWeight: 'bold', marginBottom: '20px', background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Transforme tes photos en 1 clic
          </h2>
          <p style={{ fontSize: isMobile ? '16px' : '20px', color: '#cbd5e1', marginBottom: '40px' }}>
            Fond blanc parfait, luminosité optimale, qualité maximale.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
            <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎨</div>
              <h3 style={{ margin: '0 0 5px 0' }}>Fond Blanc</h3>
              <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0 }}>Retire automatiquement</p>
            </div>
            <div style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>✨</div>
              <h3 style={{ margin: '0 0 5px 0' }}>Lumière</h3>
              <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0 }}>Optimise auto</p>
            </div>
            <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>⚡</div>
              <h3 style={{ margin: '0 0 5px 0' }}>Gratuit</h3>
              <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0 }}>5 images free</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px', maxWidth: '600px', margin: '0 auto' }}>
            <button onClick={() => setPage('app')} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', padding: '14px', fontSize: '16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>5 Images Free</button>
            <button onClick={() => setPage('app')} style={{ background: 'transparent', color: '#60a5fa', padding: '14px', fontSize: '16px', borderRadius: '10px', border: '2px solid #60a5fa', cursor: 'pointer', fontWeight: 'bold' }}>Buy Credits</button>
          </div>
        </div>
      </div>
    );
  }

  // HELP
  if (page === 'help') {
    return (
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh', color: '#fff' }}>
        <div style={{ padding: isMobile ? '15px' : '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 style={{ margin: 0, fontSize: isMobile ? '24px' : '28px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setPage('landing')}>✨ PixGlow</h1>
          <button onClick={() => setPage('landing')} style={{ background: '#3b82f6', color: '#fff', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Home</button>
        </div>

        <div style={{ padding: isMobile ? '20px' : '40px', maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontSize: isMobile ? '28px' : '36px', marginBottom: '30px' }}>Help Center</h1>

          <div style={{ background: 'rgba(51,65,85,0.5)', borderRadius: '12px', padding: '20px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>❓ FAQ</h2>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#60a5fa', margin: '0 0 8px 0' }}>5 free images?</h3>
              <p style={{ color: '#cbd5e1', margin: 0 }}>Yes, 5 per IP lifetime. No reset.</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#60a5fa', margin: '0 0 8px 0' }}>Cost per image?</h3>
              <p style={{ color: '#cbd5e1', margin: 0 }}>1 credit = €0.15. 100 credits = €15.</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#60a5fa', margin: '0 0 8px 0' }}>Credits disappear?</h3>
              <p style={{ color: '#cbd5e1', margin: 0 }}>No! Server-side storage. Forever.</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#60a5fa', margin: '0 0 8px 0' }}>Contact support?</h3>
              <p style={{ color: '#cbd5e1', margin: 0 }}>support@pixglow.app - &lt;24h response.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // APP PAGE - PROFESSIONAL DESIGN
  return (
    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh', color: '#fff', padding: isMobile ? '0' : '20px' }}>
      {/* HEADER */}
      <div style={{ background: 'rgba(15,23,42,0.95)', padding: isMobile ? '15px' : '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ margin: 0, fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setPage('landing')}>✨ PixGlow</h1>
        {isConnected && <button onClick={handleLogout} style={{ background: '#ef4444', color: '#fff', padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>Logout</button>}
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '15px' : '30px 20px' }}>
        {/* CREDITS CARD */}
        <div style={{ background: credits !== null ? 'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.1) 100%)' : 'linear-gradient(135deg, rgba(251,146,60,0.2) 0%, rgba(251,146,60,0.1) 100%)', border: credits !== null ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(251,146,60,0.3)', borderRadius: '16px', padding: '25px', marginBottom: '25px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {credits !== null ? 'Credits Available' : 'Free Images Left'}
          </p>
          <p style={{ fontSize: isMobile ? '36px' : '48px', fontWeight: 'bold', color: credits !== null ? '#22c55e' : '#fb923c', margin: 0 }}>
            {credits !== null ? credits : `${freeImagesLeft}/5`}
          </p>
        </div>

        {/* UPLOAD SECTION */}
        <div style={{ background: 'rgba(51,65,85,0.5)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '16px', padding: isMobile ? '20px' : '40px', backdropFilter: 'blur(10px)', marginBottom: '25px' }}>
          {!result ? (
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: 'rgba(59,130,246,0.2)',
                    border: '2px solid #3b82f6',
                    borderRadius: '12px',
                    padding: '20px',
                    color: '#60a5fa',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    transition: 'all 0.3s'
                  }}
                >
                  📸 Galerie
                </button>
                {isMobile && (
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    style={{
                      background: 'rgba(168,85,247,0.2)',
                      border: '2px solid #a78bfa',
                      borderRadius: '12px',
                      padding: '20px',
                      color: '#d8b4fe',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      transition: 'all 0.3s'
                    }}
                  >
                    📷 Caméra
                  </button>
                )}
              </div>

              {preview && (
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                  <img src={preview} alt="Preview" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '12px' }} />
                </div>
              )}

              {error && <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}

              <button
                onClick={handleUpload}
                disabled={!file || loading}
                style={{
                  width: '100%',
                  background: file ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : '#6b7280',
                  color: '#fff',
                  padding: '16px',
                  fontSize: '18px',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: file ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s'
                }}
              >
                {loading ? '⏳ Processing...' : '⚡ Enhance'} 
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(30,41,59,0.5)', borderRadius: '12px', padding: '15px' }}>
                  <p style={{ color: '#cbd5e1', fontSize: '12px', margin: '0 0 10px 0' }}>Before</p>
                  <img src={preview} alt="Before" style={{ width: '100%', borderRadius: '8px' }} />
                </div>
                <div style={{ background: 'rgba(30,41,59,0.5)', borderRadius: '12px', padding: '15px' }}>
                  <p style={{ color: '#cbd5e1', fontSize: '12px', margin: '0 0 10px 0' }}>After</p>
                  <img src={result.url} alt="After" style={{ width: '100%', borderRadius: '8px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <button
                  onClick={handleDownload}
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: '#fff',
                    padding: '14px',
                    borderRadius: '10px',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  📥 Download
                </button>
                <button
                  onClick={() => { setFile(null); setPreview(null); setResult(null); setError(null); }}
                  style={{
                    background: 'rgba(107,114,128,0.5)',
                    color: '#fff',
                    padding: '14px',
                    borderRadius: '10px',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  🔄 New
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AUTH SECTION */}
        {!isConnected ? (
          <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(168,85,247,0.15) 100%)', border: '2px solid rgba(59,130,246,0.3)', borderRadius: '16px', padding: isMobile ? '25px' : '40px', backdropFilter: 'blur(10px)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '25px', fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold' }}>Sign Up to Buy Credits</h2>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: '14px', borderRadius: '10px', border: 'none', fontSize: '16px', background: 'rgba(30,41,59,0.8)', color: '#fff', boxSizing: 'border-box' }}
              />
              <input
                type="password"
                placeholder="Password (min 6)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ padding: '14px', borderRadius: '10px', border: 'none', fontSize: '16px', background: 'rgba(30,41,59,0.8)', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px' }}>
              <button
                onClick={handleLogin}
                style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#fff',
                  padding: '14px',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Login
              </button>
              <button
                onClick={handleRegister}
                style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
                  color: '#fff',
                  padding: '14px',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Register
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button
              onClick={handlePayment}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: '#fff',
                padding: isMobile ? '16px 40px' : '18px 60px',
                fontSize: isMobile ? '18px' : '20px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s'
              }}
            >
              💳 Buy 100 Credits - €15
            </button>
            <p style={{ color: '#64748b', marginTop: '15px', fontSize: '14px' }}>1 credit = €0.15</p>
          </div>
        )}
      </div>
    </div>
  );
}

