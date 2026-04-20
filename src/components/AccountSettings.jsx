import React, { useState, useEffect } from 'react';

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

  // ── API Keys ──
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [revealedKey, setRevealedKey] = useState(null);
  const [apiKeyMsg, setApiKeyMsg] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api-keys`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setApiKeys(d.keys || []))
      .catch(() => {});
  }, []);

  const handleCreateKey = async () => {
    setApiKeyLoading(true); setApiKeyMsg(null);
    try {
      const res = await fetch(`${API_URL}/api-keys`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ label: newKeyLabel })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setApiKeyMsg({ ok: false, text: data.detail || 'Erreur.' }); return; }
      setRevealedKey(data.key);
      setApiKeys(prev => [data, ...prev]);
      setNewKeyLabel('');
    } catch { setApiKeyMsg({ ok: false, text: 'Erreur réseau.' }); }
    finally { setApiKeyLoading(false); }
  };

  const handleRevokeKey = async (id) => {
    const res = await fetch(`${API_URL}/api-keys/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) setApiKeys(prev => prev.map(k => k.id === id ? { ...k, is_active: false } : k));
  };

  // ── Mon avis ──
  const [hasReview, setHasReview] = useState(null);
  const [reviewDeleting, setReviewDeleting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/me`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setHasReview(!!d.has_reviewed))
      .catch(() => {});
  }, []);

  const handleDeleteReview = async () => {
    setReviewDeleting(true); setReviewMsg(null);
    try {
      const res = await fetch(`${API_URL}/reviews/my`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setReviewMsg({ ok: false, text: d.detail || 'Erreur serveur.' }); return; }
      setHasReview(false);
      setReviewMsg({ ok: true, text: 'Avis supprimé.' });
    } catch { setReviewMsg({ ok: false, text: 'Erreur réseau.' }); }
    finally { setReviewDeleting(false); }
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

        {/* Mon avis */}
        {hasReview !== null && (
          <div style={sectionStyle}>
            <p style={{ color: '#a78bfa', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>⭐ Mon avis</p>
            {hasReview ? (
              <>
                <p style={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '13px', margin: '0 0 14px', lineHeight: 1.5 }}>
                  Tu as déjà laissé un avis sur PixGlow. Tu peux le supprimer ci-dessous.
                </p>
                {reviewMsg && (
                  <p style={{ color: reviewMsg.ok ? '#10b981' : '#f87171', fontSize: '13px', marginBottom: '10px' }}>
                    {reviewMsg.ok ? '✓ ' : '✗ '}{reviewMsg.text}
                  </p>
                )}
                <button onClick={handleDeleteReview} disabled={reviewDeleting} style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#f87171', borderRadius: '10px', padding: '9px 18px', fontWeight: 700, fontSize: '13px', cursor: reviewDeleting ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: reviewDeleting ? 0.7 : 1 }}>
                  {reviewDeleting ? 'Suppression...' : '🗑 Supprimer mon avis'}
                </button>
              </>
            ) : (
              <p style={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                Tu n'as pas encore laissé d'avis. Retourne sur la page principale pour en laisser un et gagner +1 crédit !
              </p>
            )}
          </div>
        )}

        {/* API Keys */}
        <div style={sectionStyle}>
          <p style={{ color: '#a78bfa', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>🔌 Clés API publique</p>
          <p style={{ color: T.sub, fontSize: '12px', margin: '0 0 14px', lineHeight: 1.5 }}>
            Intégrez PixGlow dans vos outils (scripts Python, Zapier, Make). Envoyez le header <code style={{ background: darkMode ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)', padding: '1px 6px', borderRadius: '4px', fontSize: '11px' }}>X-API-Key: votre_clé</code> à l'endpoint <code style={{ background: darkMode ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)', padding: '1px 6px', borderRadius: '4px', fontSize: '11px' }}>POST /enhance</code>.
          </p>

          {revealedKey && (
            <div style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.25)', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
              <p style={{ color: '#10b981', fontSize: '12px', fontWeight: 700, margin: '0 0 6px' }}>✓ Clé créée — copiez-la maintenant, elle ne sera plus affichée :</p>
              <code style={{ display: 'block', color: '#34d399', fontSize: '12px', wordBreak: 'break-all', background: darkMode ? 'rgba(0,0,0,.3)' : 'rgba(0,0,0,.06)', padding: '8px 10px', borderRadius: '6px', userSelect: 'all' }}>{revealedKey}</code>
              <button onClick={() => { navigator.clipboard?.writeText(revealedKey).catch(()=>{}); }} style={{ marginTop: '8px', background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.3)', color: '#10b981', borderRadius: '7px', padding: '5px 12px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>Copier</button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <input type="text" placeholder="Nom (ex: Mon script Python)" value={newKeyLabel} onChange={e => setNewKeyLabel(e.target.value)} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
            <button onClick={handleCreateKey} disabled={apiKeyLoading} style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0 16px', fontWeight: 700, fontSize: '13px', cursor: apiKeyLoading ? 'wait' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {apiKeyLoading ? '...' : '+ Créer'}
            </button>
          </div>
          {apiKeyMsg && <p style={{ color: apiKeyMsg.ok ? '#10b981' : '#f87171', fontSize: '12px', marginBottom: '10px' }}>{apiKeyMsg.text}</p>}

          {apiKeys.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {apiKeys.map(k => (
                <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: darkMode ? 'rgba(255,255,255,.02)' : 'rgba(0,0,0,.03)', border: `1px solid ${T.border}`, borderRadius: '8px', padding: '8px 12px', opacity: k.is_active ? 1 : 0.4 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '12px', color: T.sub }}>{k.key_prefix}•••</span>
                  <span style={{ flex: 1, fontSize: '12px', color: T.text }}>{k.label || '(sans nom)'}</span>
                  {k.last_used_at && <span style={{ fontSize: '11px', color: T.sub }}>Utilisée {new Date(k.last_used_at).toLocaleDateString('fr-FR')}</span>}
                  {k.is_active && <button onClick={() => handleRevokeKey(k.id)} style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#f87171', borderRadius: '6px', padding: '3px 10px', fontWeight: 600, fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>Révoquer</button>}
                  {!k.is_active && <span style={{ fontSize: '11px', color: '#f87171' }}>Révoquée</span>}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
