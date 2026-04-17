import React from 'react';

export const BG_STYLES = [
  { id: 'blanc',    label: 'Blanc',    sub: 'Studio pur',   color: '#ffffff', border: '#e2e8f0', check: '#7c3aed' },
  { id: 'gris',     label: 'Gris',     sub: 'Studio pro',   color: '#9b9ba0', border: '#7a7a80', check: '#ffffff' },
  { id: 'beige',    label: 'Beige',    sub: 'Chaleureux',   color: '#cdbca0', border: '#b0996e', check: '#92400e' },
  { id: 'nature',   label: 'Nature',   sub: 'Minimaliste',  color: '#afd0aa', border: '#6ea868', check: '#166534' },
  { id: 'tendance', label: 'Tendance', sub: 'Dégradé',
    gradient: 'linear-gradient(160deg,#c39bf5,#f5afda)', border: '#a855f7', check: '#7c3aed' },
];

export const CATEGORIES = [
  { id: 'vetement',  label: 'Vêtement',   icon: '👕', tip: 'Couleurs fidèles + netteté' },
  { id: 'chaussure', label: 'Chaussures', icon: '👟', tip: 'Contraste & texture nets' },
  { id: 'sac',       label: 'Sac',        icon: '👜', tip: 'Rendu cuir & matière' },
  { id: 'bijou',     label: 'Bijoux',     icon: '💍', tip: 'Éclat & brillance max' },
  { id: 'autre',     label: 'Autre',      icon: '📦', tip: 'Réglages standard' },
];

export function StylePicker({ bgStyle, setBgStyle, category, setCategory, darkMode, isMobile }) {
  const T2 = darkMode
    ? { card: 'rgba(255,255,255,.04)', cardBorder: 'rgba(255,255,255,.08)', text: '#e2e8f0', sub: '#64748b', selBg: 'rgba(124,58,237,.18)', selBorder: 'rgba(124,58,237,.6)' }
    : { card: '#f8f8ff', cardBorder: 'rgba(0,0,0,.08)', text: '#111118', sub: '#64748b', selBg: 'rgba(124,58,237,.08)', selBorder: 'rgba(124,58,237,.55)' };

  return (
    <div style={{ background: darkMode ? 'rgba(255,255,255,.02)' : 'rgba(124,58,237,.03)', border: `1px solid ${darkMode ? 'rgba(255,255,255,.07)' : 'rgba(124,58,237,.15)'}`, borderRadius: '16px', padding: isMobile ? '14px' : '18px', marginBottom: '14px' }}>

      {/* ─── Fond ─── */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ color: '#a78bfa', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1.5" y="1.5" width="10" height="10" rx="2" stroke="#a78bfa" strokeWidth="1.3"/><path d="M1.5 8.5l3-3 2 2 2.5-3 2.5 2.5" stroke="#a78bfa" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Fond d'arrière-plan
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {BG_STYLES.map(s => {
            const selected = bgStyle === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setBgStyle(s.id)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '8px 10px', borderRadius: '12px', border: `2px solid ${selected ? s.selBorder || '#7c3aed' : (darkMode ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)')}`, background: selected ? (T2.selBg) : T2.card, cursor: 'pointer', transition: 'all .18s', fontFamily: 'inherit', flexShrink: 0, minWidth: isMobile ? '54px' : '64px', transform: selected ? 'scale(1.05)' : 'scale(1)', boxShadow: selected ? `0 0 0 3px ${s.check || '#7c3aed'}22` : 'none' }}
              >
                <div style={{ width: isMobile ? '36px' : '44px', height: isMobile ? '36px' : '44px', borderRadius: '8px', background: s.gradient || s.color, border: `1px solid ${s.border}`, position: 'relative', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,.12)' }}>
                  {selected && (
                    <div style={{ position: 'absolute', bottom: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: s.check || '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l1.5 1.5L6.5 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '11px', fontWeight: selected ? 800 : 600, color: selected ? '#a78bfa' : T2.sub, whiteSpace: 'nowrap', lineHeight: 1 }}>{s.label}</span>
                {!isMobile && <span style={{ fontSize: '10px', color: T2.sub, opacity: .7, whiteSpace: 'nowrap' }}>{s.sub}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Catégorie ─── */}
      <div>
        <p style={{ color: '#a78bfa', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 4h9M2 7h6M2 10h4" stroke="#a78bfa" strokeWidth="1.3" strokeLinecap="round"/></svg>
          Type d'article <span style={{ color: T2.sub, fontSize: '10px', fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}>— améliore le traitement</span>
        </p>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => {
            const selected = category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                title={c.tip}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: isMobile ? '7px 11px' : '7px 13px', borderRadius: '100px', border: `1.5px solid ${selected ? 'rgba(124,58,237,.7)' : (darkMode ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)')}`, background: selected ? 'rgba(124,58,237,.15)' : T2.card, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', fontWeight: selected ? 800 : 600, fontSize: isMobile ? '12px' : '13px', color: selected ? '#a78bfa' : T2.sub, whiteSpace: 'nowrap', boxShadow: selected ? '0 0 0 3px rgba(124,58,237,.15)' : 'none' }}
              >
                <span style={{ fontSize: isMobile ? '14px' : '15px' }}>{c.icon}</span>
                {c.label}
              </button>
            );
          })}
        </div>
        {category !== 'autre' && (
          <p style={{ color: '#7c3aed', fontSize: '11px', margin: '8px 0 0', opacity: .8 }}>
            ✦ {CATEGORIES.find(c => c.id === category)?.tip}
          </p>
        )}
      </div>
    </div>
  );
}
