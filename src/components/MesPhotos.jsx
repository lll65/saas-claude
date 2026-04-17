import React, { useState, useEffect } from 'react';
import { IDB } from '../utils/idb.js';

const API_URL = import.meta.env.VITE_API_URL || '';
const BG_LABELS = { blanc: 'Blanc', gris: 'Gris', beige: 'Beige', nature: 'Nature', tendance: 'Tendance' };
const CAT_LABELS = { vetement: '👕 Vêtement', chaussure: '👟 Chaussures', sac: '👜 Sac', bijou: '💍 Bijoux', autre: '📦 Autre' };

export function MesPhotos({ onBack, darkMode, isMobile, isConnected, token }) {
  const [photos, setPhotos] = useState(null);
  const [source, setSource] = useState('local'); // 'local' | 'server'
  const [lightbox, setLightbox] = useState(null);
  const [clearing, setClearing] = useState(false);

  const T = darkMode
    ? { bg: '#0a0a0f', card: 'rgba(255,255,255,.03)', border: 'rgba(255,255,255,.07)', text: '#e2e8f0', sub: '#64748b', nav: 'rgba(10,10,15,.95)' }
    : { bg: '#f8f9fc', card: '#fff', border: 'rgba(0,0,0,.08)', text: '#111118', sub: '#64748b', nav: 'rgba(255,255,255,.97)' };

  useEffect(() => {
    if (isConnected && token) {
      fetch(`${API_URL}/my-history`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
          const serverPhotos = (data.images || []).map(img => ({
            id: `srv-${img.id}`,
            processedUrl: `${API_URL}${img.processed_url}`,
            filename: img.filename,
            bgStyle: img.bg_style,
            category: img.category,
            ts: img.created_at,
            fromServer: true,
          }));
          setPhotos(serverPhotos);
          setSource('server');
        })
        .catch(() => {
          IDB.getAll().then(setPhotos).catch(() => setPhotos([]));
          setSource('local');
        });
    } else {
      IDB.getAll().then(setPhotos).catch(() => setPhotos([]));
      setSource('local');
    }
  }, [isConnected, token]);

  const handleClear = async () => {
    setClearing(true);
    await IDB.clear().catch(() => {});
    setPhotos([]);
    setClearing(false);
  };

  const handleDownload = async (entry) => {
    try {
      const res = await fetch(entry.processedUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = entry.filename || 'pixglow.png';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } catch { window.open(entry.processedUrl, '_blank'); }
  };

  const fmt = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  const canClear = source === 'local' && photos && photos.length > 0;

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, fontFamily: "'DM Sans',system-ui,sans-serif", color: T.text }}>
      <nav style={{ padding: isMobile ? '14px 16px' : '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.border}`, background: T.nav, backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={onBack} style={{ background: darkMode ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.06)', border: `1px solid ${T.border}`, borderRadius: '10px', padding: '8px 14px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', color: T.sub, fontFamily: 'inherit' }}>← Retour</button>
          <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '18px', fontWeight: 800, color: T.text }}>Mes photos</span>
        </div>
        {canClear && (
          <button onClick={handleClear} disabled={clearing} style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#f87171', borderRadius: '10px', padding: '7px 14px', fontWeight: 700, fontSize: '12px', cursor: clearing ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
            {clearing ? 'Suppression...' : "Vider l'historique"}
          </button>
        )}
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: isMobile ? '16px 12px 100px' : '28px 24px 48px' }}>
        {photos === null ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(124,58,237,.2)', borderTop: '3px solid #7c3aed', borderRadius: '50%', animation: 'pg-spin .8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: T.sub }}>Chargement de l'historique...</p>
          </div>
        ) : photos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🖼</div>
            <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '22px', fontWeight: 800, margin: '0 0 8px', color: T.text }}>Aucune photo traitée</h2>
            <p style={{ color: T.sub, marginBottom: '24px' }}>Tes photos traitées apparaîtront ici automatiquement.</p>
            <button onClick={onBack} style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px 24px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
              Traiter ma première photo →
            </button>
          </div>
        ) : (
          <>
            <p style={{ color: T.sub, fontSize: '13px', marginBottom: '18px' }}>
              {photos.length} photo{photos.length > 1 ? 's' : ''} —{' '}
              {source === 'server' ? 'historique synchronisé sur tous vos appareils' : 'conservées localement sur cet appareil'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: '12px' }}>
              {photos.map(p => (
                <div key={p.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '14px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', cursor: 'zoom-in', background: darkMode ? '#111118' : '#f0f0f5' }} onClick={() => setLightbox(p)}>
                    <img
                      src={p.processedUrl}
                      alt="Photo traitée"
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                    <div style={{ display: 'none', position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '28px' }}>⚠️</span>
                      <span style={{ fontSize: '11px', color: T.sub, textAlign: 'center' }}>Image expirée</span>
                    </div>
                    <div style={{ position: 'absolute', top: '6px', left: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {p.bgStyle && p.bgStyle !== 'blanc' && (
                        <span style={{ background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '100px' }}>{BG_LABELS[p.bgStyle] || p.bgStyle}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: T.sub }}>{fmt(p.ts)}</span>
                      {p.category && p.category !== 'autre' && (
                        <span style={{ fontSize: '11px', color: T.sub }}>{CAT_LABELS[p.category] || p.category}</span>
                      )}
                    </div>
                    <button onClick={() => handleDownload(p)} style={{ width: '100%', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v6M3 5.5l2.5 2.5L8 5.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M1.5 9h8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      Télécharger
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.9)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', cursor: 'zoom-out' }}>
          <button onClick={() => setLightbox(null)} style={{ position: 'fixed', top: '16px', right: '16px', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', borderRadius: '50%', width: '40px', height: '40px', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>✕</button>
          <img src={lightbox.processedUrl} alt="Photo" style={{ maxWidth: '100%', maxHeight: '90dvh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 24px 80px rgba(0,0,0,.6)' }} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
