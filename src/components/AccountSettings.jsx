import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

export function AccountSettings({ onBack, darkMode, isMobile, userEmail, onLogout }) {
  const T = darkMode
    ? { bg: '#0a0a0f', card: 'rgba(255,255,255,.03)', border: 'rgba(255,255,255,.07)', text: '#e2e8f0', sub: '#64748b', nav: 'rgba(10,10,15,.95)', input: 'rgba(15,10,30,.8)', inputBorder: 'rgba(124,58,237,.3)' }
    : { bg: '#f8f9fc', card: '#fff', border: 'rgba(0,0,0,.08)', text: '#111118', sub: '#64748b', nav: 'rgba(255,255,255,.97)', input: '#fff', inputBorder: 'rgba(124,58,237,.4)' };

  const authToken = () => localStorage.getItem('pg_token') || '';
  const authHeaders = () => ({ Authorization: `Bearer ${authToken()}`, 'Content-Type': 'application/json' });

  // ── Changement mot de passe ──
  const [pwCurrent, setPwCurrent]   = useState('');
  const [pwNew, setPwNew]           = useState('');
  const [pwConfirm, setPwConfirm]   = useState('');
  const [pwLoading, setPwLoading]   = useState(false);
  const [pwMsg, setPwMsg]           = useState(null);

  const handleChangePassword = async () => {
    if (!pwCurrent || !pwNew) { setPwMsg({ ok: false, text: 'Remplissez tous les champs.' }); return; }
    if (pwNew.length < 6) { setPwMsg({ ok: false, text: 'Nouveau mot de passe : minimum 6 caractères.' }); return; }
    if (pwNew !== pwConfirm) { setPwMsg({ ok: false, text: 'Les mots de passe ne correspondent pas.' }); return; }
    setPwLoading(true); setPwMsg(null);
    try {
      const res = await fetch(`${API_URL}/change-password`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ current_password: pwCurrent, new_password: pwNew })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setPwMsg({ ok: false, text: data.detail || 'Erreur serveur.' }); return; }
      setPwMsg({ ok: true, text: 'Mot de passe modifié avec succès.' });
      setPwCurrent(''); setPwNew(''); setPwConfirm('');
    } catch { setPwMsg({ ok: false, text: 'Erreur réseau. Réessayez.' }); }
    finally { setPwLoading(false); }
  };

  // ── Suppression compte ──
  const [deleteStep, setDeleteStep] = useState(0);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toLowerCase() !== 'supprimer') {
      setDeleteError('Tapez exactement "supprimer" pour confirmer.');
      return;
    }
    setDeleteLoading(true); setDeleteError('');
    try {
      const res = await fetch(`${API_URL}/delete-account`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setDeleteError(d.detail || 'Erreur serveur.'); return; }
      onLogout();
    } catch { setDeleteError('Erreur réseau. Réessayez.'); }
    finally { setDeleteLoading(false); }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', background: T.input, border: `1px solid ${T.inputBorder}`,
    borderRadius: '10px', padding: '11px 14px', color: T.text, fontSize: '14px', fontFamily: 'inherit',
    outline: 'none', marginBottom: '10px',
  };
  const sectionStyle = {
    background: T.card, border: `1px solid ${T.border}`, borderRadius: '16px',
    padding: isMobile ? '18px' : '22px', marginBottom: '14px',
  };

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, fontFamily: "'DM Sans',system-ui,sans-serif", color: T.text }}>
      <nav style={{ padding: isMobile ? '14px 16px' : '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.border}`, background: T.nav, backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={onBack} style={{ background: darkMode ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.06)', border: `1px solid ${T.border}`, borderRadius: '10px', padding: '8px 14px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', color: T.sub, fontFamily: 'inherit' }}>← Retour</button>
          <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '18px', fontWeight: 800, color: T.text }}>Mon compte</span>
        </div>
      </nav>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: isMobile ? '16px 12px 100px' : '28px 24px 48px' }}>

        {/* Email */}
        <div style={sectionStyle}>
          <p style={{ color: '#a78bfa', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px' }}>Adresse email</p>
          <p style={{ color: T.text, fontSize: '15px', fontWeight: 600, margin: 0 }}>{userEmail}</p>
        </div>

        {/* Changement de mot de passe */}
        <div style={sectionStyle}>
          <p style={{ color: '#a78bfa', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px' }}>🔑 Changer mon mot de passe</p>
          <input type="password" placeholder="Mot de passe actuel" value={pwCurrent} onChange={e => setPwCurrent(e.target.value)} style={inputStyle} autoComplete="current-password" />
          <input type="password" placeholder="Nouveau mot de passe (min. 6 caractères)" value={pwNew} onChange={e => setPwNew(e.target.value)} style={inputStyle} autoComplete="new-password" />
          <input type="password" placeholder="Confirmer le nouveau mot de passe" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChangePassword()} style={{ ...inputStyle, marginBottom: '14px' }} autoComplete="new-password" />
          {pwMsg && (
            <p style={{ color: pwMsg.ok ? '#10b981' : '#f87171', fontSize: '13px', marginBottom: '10px' }}>
              {pwMsg.ok ? '✓ ' : '✗ '}{pwMsg.text}
            </p>
          )}
          <button onClick={handleChangePassword} disabled={pwLoading} style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 20px', fontWeight: 700, fontSize: '14px', cursor: pwLoading ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: pwLoading ? 0.7 : 1 }}>
            {pwLoading ? 'Enregistrement...' : 'Enregistrer le mot de passe'}
          </button>
        </div>

        {/* Suppression de compte */}
        <div style={{ ...sectionStyle, border: '1px solid rgba(239,68,68,.2)', background: darkMode ? 'rgba(239,68,68,.04)' : 'rgba(239,68,68,.02)' }}>
          <p style={{ color: '#f87171', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>🗑 Supprimer mon compte</p>
          <p style={{ color: T.sub, fontSize: '13px', margin: '0 0 14px', lineHeight: 1.5 }}>
            Cette action est irréversible. Toutes vos données (crédits, historique, photos) seront définitivement supprimées conformément au RGPD (art. 17).
          </p>
          {deleteStep === 0 && (
            <button onClick={() => setDeleteStep(1)} style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#f87171', borderRadius: '10px', padding: '9px 18px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
              Supprimer mon compte
            </button>
          )}
          {deleteStep === 1 && (
            <div>
              <p style={{ color: '#f87171', fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>
                Tapez <strong>supprimer</strong> pour confirmer la suppression définitive :
              </p>
              <input
                type="text"
                placeholder='supprimer'
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                style={{ ...inputStyle, border: '1px solid rgba(239,68,68,.4)', marginBottom: '10px' }}
              />
              {deleteError && <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '8px' }}>{deleteError}</p>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { setDeleteStep(0); setDeleteConfirmText(''); setDeleteError(''); }} style={{ background: 'none', border: `1px solid ${T.border}`, color: T.sub, borderRadius: '10px', padding: '9px 16px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Annuler
                </button>
                <button onClick={handleDeleteAccount} disabled={deleteLoading} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '10px', padding: '9px 18px', fontWeight: 700, fontSize: '13px', cursor: deleteLoading ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: deleteLoading ? 0.7 : 1 }}>
                  {deleteLoading ? 'Suppression...' : 'Confirmer la suppression'}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
