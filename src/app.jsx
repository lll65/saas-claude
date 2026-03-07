import React, { useState, useRef, useEffect, useCallback, memo } from 'react';

const API_URL = "https://web-production-f1129.up.railway.app";
const MAX_SIMULTANEOUS = 5;

/* ══════════════════════════════════════════════════════════
   GLOBAL CSS
══════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800;12..96,900&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{font-family:'DM Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}
.pg-btn{transition:transform .15s,box-shadow .15s,filter .15s;}
.pg-btn:hover{transform:translateY(-2px);filter:brightness(1.1);}
.pg-btn:active{transform:scale(.97);}
.pg-card{transition:transform .22s,box-shadow .22s,border-color .22s;}
.pg-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(124,58,237,.18);}
.pg-ghost{transition:background .15s,color .15s,border-color .15s;}
.pg-ghost:hover{background:rgba(255,255,255,.1)!important;color:#fff!important;}
.pg-input{width:100%;display:block;padding:14px 16px;border-radius:12px;border:1px solid rgba(124,58,237,.3);font-size:16px;background:rgba(15,10,30,.8);color:#fff;outline:none;font-family:inherit;transition:border-color .2s,box-shadow .2s;}
.pg-input:focus{border-color:rgba(124,58,237,.7);box-shadow:0 0 0 3px rgba(124,58,237,.12);}
.pg-tab{border:none;border-radius:8px;padding:10px;font-weight:700;cursor:pointer;font-size:14px;font-family:inherit;transition:all .15s;}
@keyframes fadeUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes checkPop{0%{transform:scale(0) rotate(-15deg);opacity:0;}60%{transform:scale(1.25);opacity:1;}100%{transform:scale(1);opacity:1;}}
@keyframes shimmer{0%{background-position:-600px 0;}100%{background-position:600px 0;}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,.4);}50%{box-shadow:0 0 0 14px rgba(124,58,237,0);}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes confettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1;}100%{transform:translateY(100px) rotate(720deg);opacity:0;}}
@keyframes countUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
@keyframes sliderGlow{0%,100%{box-shadow:0 0 0 2px rgba(124,58,237,.5);}50%{box-shadow:0 0 0 4px rgba(124,58,237,.9),0 0 20px rgba(124,58,237,.3);}}
.pg-anim{animation:fadeUp .5s ease both;}
.pg-anim2{animation:fadeUp .5s .1s ease both;}
.pg-anim3{animation:fadeUp .5s .2s ease both;}
.pg-anim4{animation:fadeUp .5s .3s ease both;}
.pg-fadein{animation:fadeIn .4s ease both;}
.pg-check{animation:checkPop .4s ease both;}
.pg-pulse{animation:pulse 2.4s infinite;}
.pg-spin{animation:spin 1s linear infinite;}
.pg-shimmer{background:linear-gradient(90deg,rgba(255,255,255,.03) 25%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.03) 75%);background-size:600px 100%;animation:shimmer 1.8s infinite;}
.pg-navlink{background:none;border:none;cursor:pointer;font-family:inherit;color:#64748b;font-size:14px;transition:color .15s;padding:4px 6px;}
.pg-navlink:hover{color:#e2e8f0;}
.compare-slider{position:relative;border-radius:16px;overflow:hidden;cursor:ew-resize;user-select:none;}
.compare-handle{position:absolute;top:0;bottom:0;width:3px;background:#fff;z-index:10;transform:translateX(-50%);box-shadow:0 0 12px rgba(0,0,0,.5);animation:sliderGlow 2s infinite;}
.compare-handle::before,.compare-handle::after{content:'';position:absolute;left:50%;transform:translateX(-50%);width:36px;height:36px;border-radius:50%;background:#fff;top:50%;margin-top:-18px;box-shadow:0 2px 12px rgba(0,0,0,.3);}
.compare-handle::before{content:'◀▶';display:flex;align-items:center;justify-content:center;font-size:12px;color:#7c3aed;font-weight:900;letter-spacing:-2px;}
.faq-item{border:1px solid rgba(255,255,255,.06);border-radius:14px;overflow:hidden;margin-bottom:10px;}
.faq-q{padding:18px 22px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:15px;color:#e2e8f0;background:rgba(255,255,255,.02);transition:background .15s;}
.faq-q:hover{background:rgba(255,255,255,.04);}
.faq-a{padding:0 22px;max-height:0;overflow:hidden;transition:max-height .3s ease,padding .3s ease;color:#64748b;font-size:14px;line-height:1.7;}
.faq-a.open{max-height:200px;padding:0 22px 18px;}
@media(max-width:640px){
  .pg-hero-title{font-size:34px!important;letter-spacing:-.5px!important;}
  .pg-stats-grid{grid-template-columns:1fr 1fr!important;}
  .pg-features-grid{grid-template-columns:1fr!important;}
  .pg-pricing-grid{grid-template-columns:1fr!important;}
  .pg-testi-grid{grid-template-columns:1fr!important;}
}
`;
function InjectCSS() {
  useEffect(() => {
    const el = document.createElement('style');
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
  return null;
}

/* ══════════════════════════════════════════════════════════
   SEO META + SCHEMA FAQ
══════════════════════════════════════════════════════════ */
const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {"@type":"Question","name":"Mes 5 photos gratuites se réinitialisent-elles ?","acceptedAnswer":{"@type":"Answer","text":"Non. Les 5 photos gratuites sont comptées par adresse IP sur nos serveurs sécurisés et ne se réinitialisent jamais."}},
    {"@type":"Question","name":"Quels formats sont acceptés ?","acceptedAnswer":{"@type":"Answer","text":"JPG, PNG, WEBP et HEIC (iPhone). Taille maximale : 15 Mo par photo. Résolution originale préservée."}},
    {"@type":"Question","name":"Les crédits Pro expirent-ils ?","acceptedAnswer":{"@type":"Answer","text":"Non, jamais. Vos crédits sont liés à votre compte email et restent disponibles à vie, sans abonnement."}},
    {"@type":"Question","name":"Mes photos sont-elles conservées ?","acceptedAnswer":{"@type":"Answer","text":"Non. Toutes les images traitées sont supprimées automatiquement de nos serveurs après 24 heures."}}
  ]
};
function useSEO(page) {
  useEffect(() => {
    const titles = {
      landing: "PixGlow — Photos fond blanc pour Vinted en 1 clic | Double tes vues",
      app:     "PixGlow — Améliore tes photos maintenant",
      help:    "PixGlow — Centre d'aide",
    };
    const descs = {
      landing: "Supprime le fond de tes photos et ajoute un fond blanc professionnel en 3 secondes. Vends 30% plus vite sur Vinted, Leboncoin et Vestiaire. 5 photos gratuites sans CB.",
      app:     "Télécharge tes photos et obtiens un fond blanc parfait en quelques secondes. Qualité studio pour tes annonces Vinted.",
      help:    "Centre d'aide PixGlow — Réponses à toutes vos questions sur le service.",
    };
    document.title = titles[page] || titles.landing;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = descs[page] || descs.landing;
    // OpenGraph
    ['og:title','og:description','og:type','og:url'].forEach(prop => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
      if (prop === 'og:title') el.content = titles[page] || titles.landing;
      if (prop === 'og:description') el.content = descs[page] || descs.landing;
      if (prop === 'og:type') el.content = 'website';
      if (prop === 'og:url') el.content = 'https://pixglow.app';
    });
    // Schema
    let schema = document.getElementById('pg-schema');
    if (!schema) { schema = document.createElement('script'); schema.id = 'pg-schema'; schema.type = 'application/ld+json'; document.head.appendChild(schema); }
    schema.textContent = JSON.stringify(FAQ_SCHEMA);
  }, [page]);
}



/* ══════════════════════════════════════════════════════════
   LEGAL PAGES
══════════════════════════════════════════════════════════ */
const LS = {
  page:{background:'#0a0a0f',minHeight:'100vh',color:'#e2e8f0',fontFamily:"'DM Sans',sans-serif"},
  nav:{padding:'16px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid rgba(255,255,255,.05)',background:'rgba(10,10,15,.95)',position:'sticky',top:0,zIndex:100},
  wrap:{maxWidth:'760px',margin:'0 auto',padding:'40px 20px'},
  h1:{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:'32px',fontWeight:800,color:'#fff',marginBottom:'6px'},
  h2:{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:'18px',fontWeight:700,color:'#7c3aed',margin:'28px 0 8px'},
  p:{color:'#64748b',lineHeight:1.8,fontSize:'15px',marginBottom:'12px'},
  back:{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',color:'#94a3b8',borderRadius:'10px',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:'14px',fontFamily:'inherit'},
};
const LegalLayout=({title,onBack,children})=>(
  <div style={LS.page}><nav style={LS.nav}><span style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:'20px',fontWeight:800,color:'#fff'}}>✨ PixGlow</span><button onClick={onBack} style={LS.back}>← Retour</button></nav>
  <div style={LS.wrap}><h1 style={LS.h1}>{title}</h1><p style={{...LS.p,fontSize:'13px',color:'#334155',marginBottom:'28px'}}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>{children}</div></div>
);
function MentionsLegales({onBack}){return(<LegalLayout title="Mentions légales" onBack={onBack}><h2 style={LS.h2}>Éditeur du site</h2><p style={LS.p}>Le site pixglow.app est édité par un entrepreneur individuel.<br/>Email : <a href="mailto:support@pixglow.app" style={{color:'#7c3aed'}}>support@pixglow.app</a></p><h2 style={LS.h2}>Hébergement</h2><p style={LS.p}><strong style={{color:'#e2e8f0'}}>Railway Corp</strong> — 548 Market St, San Francisco, CA 94104, USA</p><h2 style={LS.h2}>Propriété intellectuelle</h2><p style={LS.p}>Tout le contenu de PixGlow est protégé par le droit d'auteur. Toute reproduction sans autorisation est interdite.</p><h2 style={LS.h2}>Paiements</h2><p style={LS.p}>Traités par <strong style={{color:'#e2e8f0'}}>Stripe Inc.</strong>, certifié PCI-DSS. PixGlow ne stocke aucune donnée bancaire.</p></LegalLayout>);}
function PolitiqueConfidentialite({onBack}){return(<LegalLayout title="Politique de confidentialité" onBack={onBack}><p style={{...LS.p,color:'#334155'}}>Conformément au RGPD</p><h2 style={LS.h2}>Données collectées</h2><p style={LS.p}>Email, mot de passe chiffré, adresse IP (quota gratuit), images uploadées (supprimées après 24h).</p><h2 style={LS.h2}>Finalité</h2><p style={LS.p}>Gestion compte et crédits · Paiements via Stripe · Prévention des abus</p><h2 style={LS.h2}>Conservation</h2><p style={LS.p}>Compte : actif tant qu'il existe · Images : <strong style={{color:'#e2e8f0'}}>supprimées après 24h</strong> · IP : 30 jours</p><h2 style={LS.h2}>Vos droits</h2><p style={LS.p}>Accès, rectification, effacement : <a href="mailto:support@pixglow.app" style={{color:'#7c3aed'}}>support@pixglow.app</a></p><h2 style={LS.h2}>Cookies</h2><p style={LS.p}>Aucun cookie de tracking. Token d'auth stocké localement pour votre session.</p></LegalLayout>);}
function CGV({onBack}){return(<LegalLayout title="Conditions Générales de Vente" onBack={onBack}><h2 style={LS.h2}>Service</h2><p style={LS.p}>Traitement automatique d'images (suppression fond, luminosité) pour vendeurs e-commerce.</p><h2 style={LS.h2}>Tarifs</h2><p style={LS.p}><strong style={{color:'#e2e8f0'}}>Gratuit :</strong> 5 images/IP, sans inscription.<br/><strong style={{color:'#e2e8f0'}}>Pro :</strong> 100 crédits pour 15€ TTC (0,15€/image), valables à vie.</p><h2 style={LS.h2}>Paiement</h2><p style={LS.p}>Carte bancaire via Stripe. Crédits ajoutés immédiatement.</p><h2 style={LS.h2}>Rétractation</h2><p style={LS.p}>Art. L221-28 Code conso : ne s'applique pas aux contenus numériques dont l'exécution a commencé. Crédits non utilisés remboursables sous 14j à <a href="mailto:support@pixglow.app" style={{color:'#7c3aed'}}>support@pixglow.app</a>.</p></LegalLayout>);}

/* ══════════════════════════════════════════════════════════
   CONFETTI
══════════════════════════════════════════════════════════ */
function Confetti({active}){
  if(!active) return null;
  const pieces=Array.from({length:20},(_,i)=>({id:i,x:Math.random()*100,color:['#7c3aed','#10b981','#60a5fa','#f59e0b','#f472b6'][i%5],delay:Math.random()*1,size:6+Math.random()*6}));
  return(<div style={{position:'fixed',top:0,left:0,right:0,height:'200px',pointerEvents:'none',zIndex:9999,overflow:'hidden'}}>{pieces.map(p=>(<div key={p.id} style={{position:'absolute',left:`${p.x}%`,top:'-20px',width:`${p.size}px`,height:`${p.size}px`,background:p.color,borderRadius:'2px',animation:`confettiFall 1.5s ${p.delay}s ease both`}}/>))}</div>);
}

/* ══════════════════════════════════════════════════════════
   COMPARE SLIDER
══════════════════════════════════════════════════════════ */
function CompareSlider(){
  const [pos,setPos]=useState(50);
  const ref=useRef(null);
  const dragging=useRef(false);
  const move=useCallback((clientX)=>{
    if(!ref.current) return;
    const {left,width}=ref.current.getBoundingClientRect();
    setPos(Math.max(5,Math.min(95,((clientX-left)/width)*100)));
  },[]);
  useEffect(()=>{
    const up=()=>{dragging.current=false;};
    const mv=(e)=>{if(dragging.current) move(e.touches?e.touches[0].clientX:e.clientX);};
    window.addEventListener('mouseup',up);window.addEventListener('touchend',up);
    window.addEventListener('mousemove',mv);window.addEventListener('touchmove',mv,{passive:true});
    return()=>{window.removeEventListener('mouseup',up);window.removeEventListener('touchend',up);window.removeEventListener('mousemove',mv);window.removeEventListener('touchmove',mv);};
  },[move]);
  return(
    <div style={{maxWidth:'520px',margin:'0 auto'}}>
      <div ref={ref} className="compare-slider" style={{aspectRatio:'4/3',background:'#111'}}
        onMouseDown={e=>{dragging.current=true;move(e.clientX);}}
        onTouchStart={e=>{dragging.current=true;move(e.touches[0].clientX);}}>
        {/* APRÈS — fond blanc (plein) */}
        <div style={{position:'absolute',inset:0,background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'8px'}}>
          <div style={{fontSize:'72px',filter:'drop-shadow(0 4px 8px rgba(0,0,0,.1))'}}>👗</div>
          <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'8px',padding:'4px 12px',fontSize:'12px',color:'#16a34a',fontWeight:700}}>✓ Fond blanc · Studio</div>
        </div>
        {/* AVANT — fond encombré (clip gauche) */}
        <div style={{position:'absolute',inset:0,clipPath:`inset(0 ${100-pos}% 0 0)`,background:'linear-gradient(135deg,#1a1a2e,#2d1b69,#1e3a5f)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'8px'}}>
          <div style={{fontSize:'72px',filter:'grayscale(.3) brightness(.8)'}}>👗</div>
          <div style={{background:'rgba(0,0,0,.4)',borderRadius:'8px',padding:'4px 12px',fontSize:'12px',color:'#94a3b8',fontWeight:700}}>✗ Fond encombré</div>
        </div>
        {/* Handle */}
        <div className="compare-handle" style={{left:`${pos}%`}}/>
        {/* Labels */}
        <div style={{position:'absolute',top:'10px',left:'10px',background:'rgba(0,0,0,.6)',color:'#94a3b8',fontSize:'11px',fontWeight:700,padding:'3px 10px',borderRadius:'20px',letterSpacing:'.8px',textTransform:'uppercase',zIndex:5}}>AVANT</div>
        <div style={{position:'absolute',top:'10px',right:'10px',background:'rgba(16,185,129,.85)',color:'#fff',fontSize:'11px',fontWeight:700,padding:'3px 10px',borderRadius:'20px',letterSpacing:'.8px',textTransform:'uppercase',zIndex:5}}>APRÈS ✅</div>
      </div>
      <p style={{textAlign:'center',color:'#334155',fontSize:'12px',marginTop:'10px'}}>← Glissez pour comparer →</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   FAQ ACCORDION
══════════════════════════════════════════════════════════ */
const FAQ_DATA=[
  {q:"Mes 5 photos gratuites se réinitialisent-elles ?",a:"Non. Les 5 photos gratuites sont comptées par adresse IP sur nos serveurs sécurisés. Elles ne se réinitialisent jamais entre les sessions ou les mises à jour."},
  {q:"Quels formats sont acceptés ?",a:"JPG, PNG, WEBP et HEIC (iPhone). Taille maximale : 15 Mo par photo. Résolution originale préservée dans le résultat."},
  {q:"Combien de temps pour traiter une photo ?",a:"Environ 10 à 15 secondes par photo. Vous pouvez soumettre jusqu'à 5 photos simultanément pour un traitement en batch."},
  {q:"Les crédits Pro expirent-ils ?",a:"Non, jamais. Vos crédits sont liés à votre compte email et restent disponibles à vie, sans abonnement ni date d'expiration."},
  {q:"Mes photos sont-elles conservées ?",a:"Non. Toutes les images traitées sont automatiquement supprimées de nos serveurs après 24 heures. Téléchargez vos résultats rapidement !"},
  {q:"Le fond blanc est-il garanti pour tous les vêtements ?",a:"PixGlow fonctionne sur 95% des photos courantes. Les meilleurs résultats s'obtiennent avec un vêtement bien visible, distinct du fond. Les fonds très sombres ou les transparences peuvent donner des résultats variables."},
];
function FaqItem({item,isOpen,onToggle}){
  return(
    <div className="faq-item">
      <div className="faq-q" onClick={onToggle}>
        <span>{item.q}</span>
        <span style={{fontSize:'18px',color:'#7c3aed',transition:'transform .25s',display:'inline-block',transform:isOpen?'rotate(45deg)':'none',flexShrink:0,marginLeft:'12px'}}>+</span>
      </div>
      <div className={`faq-a ${isOpen?'open':''}`}>{item.a}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   AUTH MODAL
══════════════════════════════════════════════════════════ */
function AuthModal({show,initialMode,onClose,onSuccess,isMobile}){
  const [mode,setMode]=useState(initialMode||'login');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [loading,setLoading]=useState(false);
  const [errMsg,setErrMsg]=useState('');
  useEffect(()=>{if(show){setMode(initialMode||'login');setErrMsg('');}}, [show,initialMode]);
  if(!show) return null;
  const submit=async()=>{
    setErrMsg('');
    if(!email.includes('@')){setErrMsg('Email invalide');return;}
    if(password.length<6){setErrMsg('Mot de passe trop court (min. 6 car.)');return;}
    setLoading(true);
    try{
      const res=await fetch(`${API_URL}/${mode}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email.trim().toLowerCase(),password})});
      const data=await res.json();
      if(!res.ok){setErrMsg(data.detail||'Identifiants incorrects');setLoading(false);return;}
      localStorage.setItem('pg_token',data.token);localStorage.setItem('pg_email',email.trim().toLowerCase());
      onSuccess(email.trim().toLowerCase(),data.credits);
    }catch{setErrMsg('Serveur inaccessible. Réessayez.');}
    finally{setLoading(false);}
  };
  return(
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.87)',backdropFilter:'blur(8px)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}}>
      <div className="pg-anim" style={{background:'linear-gradient(160deg,#16102a,#0d0d1a)',border:'1px solid rgba(124,58,237,.35)',borderRadius:'24px',padding:isMobile?'28px 20px':'44px',width:'100%',maxWidth:'420px',position:'relative'}}>
        <button onClick={onClose} style={{position:'absolute',top:'14px',right:'14px',background:'rgba(255,255,255,.08)',border:'none',color:'#94a3b8',cursor:'pointer',borderRadius:'8px',width:'34px',height:'34px',fontSize:'16px',fontFamily:'inherit'}}>✕</button>
        <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:'22px',fontWeight:800,color:'#fff',marginBottom:'4px'}}>{mode==='login'?'👋 Bon retour !':'🚀 Créer mon compte'}</h2>
        <p style={{color:'#64748b',fontSize:'13px',marginBottom:'22px'}}>{mode==='login'?'Accédez à vos crédits et photos':'Gratuit · Crédits sauvegardés à vie'}</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',background:'rgba(0,0,0,.4)',borderRadius:'12px',padding:'4px',marginBottom:'20px'}}>
          {['login','register'].map(m=>(
            <button key={m} className="pg-tab" onClick={()=>{setMode(m);setErrMsg('');}} style={{background:mode===m?'linear-gradient(135deg,#7c3aed,#4f46e5)':'transparent',color:mode===m?'#fff':'#64748b'}}>
              {m==='login'?'Se connecter':"S'inscrire"}
            </button>
          ))}
        </div>
        <input className="pg-input" type="email" placeholder="Votre adresse email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} autoFocus autoComplete="email" style={{marginBottom:'12px',borderColor:errMsg?'rgba(239,68,68,.5)':undefined}}/>
        <input className="pg-input" type="password" placeholder="Mot de passe (min. 6 caractères)" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} autoComplete={mode==='login'?'current-password':'new-password'} style={{marginBottom:'16px',borderColor:errMsg?'rgba(239,68,68,.5)':undefined}}/>
        {errMsg&&<div style={{background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.3)',borderRadius:'10px',padding:'10px 14px',marginBottom:'14px',color:'#f87171',fontSize:'13px'}}>⚠️ {errMsg}</div>}
        <button className="pg-btn pg-pulse" disabled={loading} onClick={submit} style={{width:'100%',background:'linear-gradient(135deg,#7c3aed,#4f46e5)',color:'#fff',border:'none',borderRadius:'12px',padding:'15px',fontWeight:800,fontSize:'16px',cursor:loading?'not-allowed':'pointer',fontFamily:'inherit',opacity:loading?.7:1}}>
          {loading?'⏳ En cours...':mode==='login'?'→ Me connecter':'→ Créer mon compte'}
        </button>
        <p style={{color:'#334155',fontSize:'11px',textAlign:'center',marginTop:'14px'}}>🔒 Paiement sécurisé Stripe · Données protégées RGPD</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   NAV
══════════════════════════════════════════════════════════ */
function Nav({isConnected,credits,isMobile,onLogin,onRegister,onLogout,onApp,onLanding,onHelp,isDark,toggleDark}){
  const bg=isDark?'rgba(10,10,15,.95)':'rgba(248,248,255,.97)';
  const txt=isDark?'#fff':'#0a0a0f';
  const sub=isDark?'#64748b':'#475569';
  return(
    <nav style={{padding:isMobile?'12px 16px':'16px 48px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.06)'}`,background:bg,backdropFilter:'blur(16px)',position:'sticky',top:0,zIndex:200}}>
      <div style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}} onClick={onLanding}>
        <div style={{width:'32px',height:'32px',background:'linear-gradient(135deg,#7c3aed,#4f46e5)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',flexShrink:0}}>✨</div>
        <span style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:'20px',fontWeight:800,color:txt,letterSpacing:'-.3px'}}>PixGlow</span>
      </div>
      <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
        {!isMobile&&<button onClick={onHelp} className="pg-navlink" style={{color:sub}}>Aide</button>}
        <button onClick={toggleDark} style={{background:'none',border:`1px solid ${isDark?'rgba(255,255,255,.1)':'rgba(0,0,0,.1)'}`,borderRadius:'8px',width:'32px',height:'32px',cursor:'pointer',fontSize:'14px',color:sub,transition:'all .15s'}} title="Thème">{isDark?'☀️':'🌙'}</button>
        {isConnected?(
          <>
            {credits!==null&&!isMobile&&<span style={{background:'rgba(124,58,237,.15)',color:'#a78bfa',padding:'4px 12px',borderRadius:'100px',fontWeight:700,fontSize:'13px'}}>💎 {credits}</span>}
            <button onClick={onApp} className="pg-btn" style={{background:'linear-gradient(135deg,#7c3aed,#4f46e5)',color:'#fff',border:'none',borderRadius:'10px',padding:isMobile?'9px 14px':'10px 18px',fontWeight:700,cursor:'pointer',fontSize:'13px',fontFamily:'inherit'}}>Mon espace</button>
            <button onClick={onLogout} className="pg-ghost" style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',color:'#94a3b8',borderRadius:'10px',padding:isMobile?'9px 12px':'10px 14px',fontWeight:600,cursor:'pointer',fontSize:'13px',fontFamily:'inherit'}}>{isMobile?'⎋':'Déco'}</button>
          </>
        ):(
          <>
            <button onClick={onLogin} className="pg-ghost" style={{background:isDark?'rgba(255,255,255,.06)':'rgba(0,0,0,.06)',border:`1px solid ${isDark?'rgba(255,255,255,.1)':'rgba(0,0,0,.1)'}`,color:sub,borderRadius:'10px',padding:isMobile?'9px 12px':'10px 16px',fontWeight:600,cursor:'pointer',fontSize:'13px',fontFamily:'inherit'}}>Connexion</button>
            <button onClick={onApp} className="pg-btn pg-pulse" style={{background:'linear-gradient(135deg,#7c3aed,#4f46e5)',color:'#fff',border:'none',borderRadius:'10px',padding:isMobile?'9px 14px':'10px 18px',fontWeight:700,cursor:'pointer',fontSize:'13px',fontFamily:'inherit'}}>{isMobile?'Essayer':'Commencer gratuitement'}</button>
          </>
        )}
      </div>
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════ */
export default function PixGlow(){
  const [page,setPage]=useState('landing');
  const [files,setFiles]=useState([]);
  const [previews,setPreviews]=useState([]);
  const [loading,setLoading]=useState(false);
  const [results,setResults]=useState([]);
  const [error,setError]=useState(null);
  const [progress,setProgress]=useState(0);
  const [credits,setCredits]=useState(null);
  const [freeLeft,setFreeLeft]=useState(null);
  const [userEmail,setUserEmail]=useState('');
  const [isConnected,setIsConnected]=useState(false);
  const [isMobile,setIsMobile]=useState(window.innerWidth<768);
  const [showAuth,setShowAuth]=useState(false);
  const [authMode,setAuthMode]=useState('login');
  const [isDark,setIsDark]=useState(()=>localStorage.getItem('pg_theme')!=='light');
  const [openFaq,setOpenFaq]=useState(null);
  const [showConfetti,setShowConfetti]=useState(false);
  const [isDragging,setIsDragging]=useState(false);
  const fileInputRef=useRef(null);
  const cameraInputRef=useRef(null);

  useSEO(page);
  const getToken=()=>localStorage.getItem('pg_token');
  const authH=()=>{const t=getToken();return t?{Authorization:`Bearer ${t}`}:{};};

  useEffect(()=>{
    const fn=()=>setIsMobile(window.innerWidth<768);
    window.addEventListener('resize',fn);return()=>window.removeEventListener('resize',fn);
  },[]);

  useEffect(()=>{
    document.documentElement.style.background=isDark?'#0a0a0f':'#f8f8ff';
    localStorage.setItem('pg_theme',isDark?'dark':'light');
  },[isDark]);

  useEffect(()=>{
    const token=getToken();const savedEmail=localStorage.getItem('pg_email');
    if(token&&savedEmail){setUserEmail(savedEmail);setIsConnected(true);fetch(`${API_URL}/me`,{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.json()).then(d=>{if(d.credits!==undefined)setCredits(d.credits);}).catch(()=>{});}
    fetch(`${API_URL}/free-remaining`).then(r=>r.json()).then(d=>{if(d.remaining!==undefined){setFreeLeft(d.remaining);localStorage.setItem('pg_free',d.remaining);}}).catch(()=>setFreeLeft(parseInt(localStorage.getItem('pg_free')||'5')));
    const params=new URLSearchParams(window.location.search);
    if(params.get('payment')==='success'&&token){setTimeout(()=>{fetch(`${API_URL}/me`,{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.json()).then(d=>{if(d.credits!==undefined){setCredits(d.credits);alert(`✅ Paiement confirmé ! ${d.credits} crédits disponibles.`);window.history.replaceState({},'',window.location.pathname);}});},2000);}
  },[]);

  const openAuth=(mode)=>{setAuthMode(mode);setShowAuth(true);};
  const handleAuthSuccess=(email,uc)=>{setUserEmail(email);setCredits(uc);setIsConnected(true);setShowAuth(false);setPage('app');};
  const handleLogout=()=>{['pg_token','pg_email'].forEach(k=>localStorage.removeItem(k));setUserEmail('');setCredits(null);setIsConnected(false);setPage('landing');};

  const limitReached=!isConnected&&freeLeft!==null&&freeLeft<=0;
  const canSelect=()=>isConnected||freeLeft===null||freeLeft>0;

  const handleSelectClick=(useCamera=false)=>{
    if(!canSelect()){setError('Vos 5 photos gratuites ont été utilisées. Créez un compte pour continuer.');return;}
    setError(null);
    if(useCamera)cameraInputRef.current?.click();else fileInputRef.current?.click();
  };

  const processFiles=(fileList)=>{
    const selected=Array.from(fileList||[]);if(!selected.length)return;
    const available=isConnected?(credits??999):(freeLeft??5);
    const maxAllowed=Math.min(selected.length,MAX_SIMULTANEOUS,Math.max(available,1));
    const chosen=selected.slice(0,maxAllowed);
    if(selected.length>maxAllowed)setError(`Maximum ${maxAllowed} photo(s) selon vos crédits.`);else setError(null);
    setFiles(chosen);setResults([]);setProgress(0);
    Promise.all(chosen.map(f=>new Promise(resolve=>{const r=new FileReader();r.onload=ev=>resolve(ev.target.result);r.readAsDataURL(f);}))).then(setPreviews);
  };

  const handleFilesChange=(e)=>processFiles(e.target.files);

  const handleUpload=async()=>{
    if(!files.length){setError('Sélectionnez au moins une photo');return;}
    if(!isConnected&&freeLeft!==null&&freeLeft<=0){setError('Vos 5 photos gratuites ont été utilisées.');return;}
    if(isConnected&&credits!==null&&credits<files.length){setError(`Crédits insuffisants : ${credits} crédit(s) pour ${files.length} photo(s).`);return;}
    setLoading(true);setError(null);setResults([]);setProgress(0);
    let fl=freeLeft;const nr=[];
    for(let i=0;i<files.length;i++){
      setProgress(i+1);
      try{
        const form=new FormData();form.append('file',files[i]);
        const res=await fetch(`${API_URL}/enhance`,{method:'POST',headers:authH(),body:form});
        const data=await res.json();
        if(!res.ok)nr.push({error:data.detail||'Erreur',original:previews[i]});
        else{
          nr.push({url:`${API_URL}${data.url}`,filename:data.filename,original:previews[i]});
          if(data.credits_left!=null)setCredits(data.credits_left);
          else{fl=Math.max(0,(fl??5)-1);setFreeLeft(fl);localStorage.setItem('pg_free',fl);}
        }
      }catch{nr.push({error:'Erreur réseau',original:previews[i]});}
      setResults([...nr]);
    }
    setLoading(false);
    if(nr.filter(r=>!r.error).length>0){setShowConfetti(true);setTimeout(()=>setShowConfetti(false),2500);}
  };

  const handleDownload=(r)=>{const a=document.createElement('a');a.href=r.url;a.download=r.filename;a.click();};
  const handleDownloadAll=()=>results.filter(r=>!r.error).forEach(handleDownload);
  const reset=()=>{setFiles([]);setPreviews([]);setResults([]);setError(null);setProgress(0);};
  const handlePayment=async()=>{
    const token=getToken();if(!token){openAuth('login');return;}
    try{const res=await fetch(`${API_URL}/create-checkout-session`,{method:'POST',headers:{Authorization:`Bearer ${token}`}});const data=await res.json();if(data.checkout_url)window.location.href=data.checkout_url;}
    catch{alert('Erreur paiement, réessayez.');}
  };

  const doneCount=results.filter(r=>!r.error).length;
  const hasResults=results.length>0&&results.length===files.length&&!loading;

  // Theme vars
  const bg=isDark?'#0a0a0f':'#f8f8ff';
  const cardBg=isDark?'rgba(255,255,255,.02)':'rgba(0,0,0,.02)';
  const cardBorder=isDark?'rgba(255,255,255,.06)':'rgba(0,0,0,.07)';
  const textPrimary=isDark?'#ffffff':'#0a0a0f';
  const textSub=isDark?'#64748b':'#475569';
  const textMuted=isDark?'#334155':'#94a3b8';

  // Legal pages
  if(page==='mentions')return<><InjectCSS/><MentionsLegales onBack={()=>setPage('landing')}/></>;
  if(page==='confidentialite')return<><InjectCSS/><PolitiqueConfidentialite onBack={()=>setPage('landing')}/></>;
  if(page==='cgv')return<><InjectCSS/><CGV onBack={()=>setPage('landing')}/></>;

  const navProps={isConnected,credits,isMobile,onLogin:()=>openAuth('login'),onRegister:()=>openAuth('register'),onLogout:handleLogout,onApp:()=>setPage('app'),onLanding:()=>setPage('landing'),onHelp:()=>setPage('help'),isDark,toggleDark:()=>setIsDark(d=>!d)};

  const FooterBar=()=>(
    <footer style={{borderTop:`1px solid ${cardBorder}`,padding:'28px 24px',textAlign:'center',background:bg}}>
      <p style={{color:textMuted,fontSize:'12px',marginBottom:'10px'}}>© {new Date().getFullYear()} PixGlow · Tous droits réservés</p>
      <div style={{display:'flex',gap:'20px',justifyContent:'center',flexWrap:'wrap'}}>
        {[['mentions','Mentions légales'],['cgv','CGV'],['confidentialite','Confidentialité'],['help','Aide']].map(([p,l])=>(
          <button key={p} onClick={()=>setPage(p)} className="pg-navlink" style={{color:textMuted,fontSize:'12px',textDecoration:'underline'}}>{l}</button>
        ))}
      </div>
    </footer>
  );

  /* ══════════ HELP PAGE ══════════ */
  if(page==='help') return(
    <div style={{background:bg,minHeight:'100vh',color:textPrimary}}>
      <InjectCSS/><Nav {...navProps}/>
      <div style={{maxWidth:'720px',margin:'0 auto',padding:isMobile?'32px 16px':'60px 40px'}}>
        <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:isMobile?'28px':'40px',fontWeight:800,marginBottom:'6px',color:textPrimary}}>Centre d'aide</h1>
        <p style={{color:textSub,marginBottom:'36px'}}>Tout ce que tu dois savoir sur PixGlow</p>
        {FAQ_DATA.map((item,i)=><FaqItem key={i} item={item} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)}/>)}
        <div style={{background:'rgba(124,58,237,.07)',border:'1px solid rgba(124,58,237,.18)',borderRadius:'14px',padding:'20px',marginTop:'18px',textAlign:'center'}}>
          <p style={{color:'#a78bfa',fontWeight:700,marginBottom:'6px'}}>Une autre question ?</p>
          <p style={{color:textSub,fontSize:'14px',margin:0}}>Contact : <a href="mailto:support@pixglow.app" style={{color:'#7c3aed'}}>support@pixglow.app</a></p>
        </div>
      </div>
      <FooterBar/>
    </div>
  );

  /* ══════════ LANDING PAGE ══════════ */
  if(page==='landing') return(
    <div style={{background:bg,minHeight:'100vh',color:textPrimary,overflowX:'hidden'}}>
      <InjectCSS/>
      <AuthModal show={showAuth} initialMode={authMode} onClose={()=>setShowAuth(false)} onSuccess={handleAuthSuccess} isMobile={isMobile}/>
      <Nav {...navProps}/>

      {/* ─ HERO ─ */}
      <section style={{maxWidth:'1100px',margin:'0 auto',padding:isMobile?'48px 16px 36px':'88px 40px 56px',textAlign:'center',position:'relative'}}>
        <div style={{position:'absolute',top:'15%',left:'50%',transform:'translateX(-50%)',width:'700px',height:'400px',background:'radial-gradient(ellipse,rgba(124,58,237,.1) 0%,transparent 70%)',pointerEvents:'none'}}/>
        <div className="pg-anim" style={{position:'relative',zIndex:1}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(124,58,237,.1)',border:'1px solid rgba(124,58,237,.28)',borderRadius:'100px',padding:'5px 16px 5px 8px',marginBottom:'22px'}}>
            <span style={{background:'linear-gradient(135deg,#7c3aed,#4f46e5)',borderRadius:'100px',padding:'2px 10px',color:'#fff',fontSize:'11px',fontWeight:800}}>NEW 2026</span>
            <span style={{color:'#a78bfa',fontSize:'12px',fontWeight:600}}>🛍️ Vinted · Leboncoin · Vestiaire</span>
          </div>
          <h1 className="pg-hero-title" style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:isMobile?'38px':'72px',fontWeight:900,lineHeight:1.0,letterSpacing:'-2px',color:textPrimary,marginBottom:'18px'}}>
            Double tes vues Vinted<br/>
            <span style={{background:'linear-gradient(135deg,#7c3aed,#60a5fa,#10b981)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>en 3 secondes</span>
          </h1>
          <p className="pg-anim2" style={{fontSize:isMobile?'16px':'20px',color:textSub,maxWidth:'520px',margin:'0 auto 12px',lineHeight:1.65}}>
            Fond blanc parfait · Luminosité studio · <strong style={{color:isDark?'#e2e8f0':'#1e293b'}}>Vends 30% plus vite</strong>
          </p>
          <p className="pg-anim2" style={{fontSize:'14px',color:'#10b981',fontWeight:700,marginBottom:'28px'}}>
            ✅ 5 photos gratuites — aucune CB requise — résultat immédiat
          </p>
          <div className="pg-anim3" style={{display:'flex',gap:'10px',justifyContent:'center',flexWrap:'wrap',marginBottom:'32px'}}>
            <button onClick={()=>setPage('app')} className="pg-btn pg-pulse" style={{background:'linear-gradient(135deg,#7c3aed,#4f46e5)',color:'#fff',border:'none',borderRadius:'14px',padding:isMobile?'16px 22px':'18px 36px',fontWeight:800,cursor:'pointer',fontSize:isMobile?'16px':'18px',fontFamily:'inherit',display:'flex',alignItems:'center',gap:'10px'}}>
              ⚡ Essayer gratuitement
              <span style={{background:'rgba(255,255,255,.18)',borderRadius:'100px',padding:'2px 10px',fontSize:'12px',fontWeight:700}}>5 photos offertes</span>
            </button>
            <button onClick={()=>openAuth('register')} className="pg-btn pg-ghost" style={{background:isDark?'rgba(255,255,255,.06)':'rgba(0,0,0,.05)',border:`1px solid ${isDark?'rgba(255,255,255,.12)':'rgba(0,0,0,.1)'}`,color:textSub,borderRadius:'14px',padding:isMobile?'16px 18px':'18px 28px',fontWeight:700,cursor:'pointer',fontSize:isMobile?'15px':'17px',fontFamily:'inherit'}}>
              Voir les tarifs →
            </button>
          </div>
          {/* Social proof avatars */}
          <div className="pg-anim4" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',flexWrap:'wrap'}}>
            <div style={{display:'flex'}}>
              {['#6d28d9','#4f46e5','#0891b2','#059669','#7c3aed'].map((c,i)=>(
                <div key={i} style={{width:'30px',height:'30px',borderRadius:'50%',background:c,border:`2px solid ${bg}`,marginLeft:i?'-8px':'0',flexShrink:0}}/>
              ))}
            </div>
            <div style={{fontSize:'13px',color:textSub}}><strong style={{color:textPrimary}}>+12 000 vendeurs</strong> actifs</div>
            <span style={{color:textMuted,fontSize:'12px'}}>·</span>
            <div style={{fontSize:'13px',color:textSub}}>⭐ <strong style={{color:textPrimary}}>4.9/5</strong> satisfaction</div>
            <span style={{color:textMuted,fontSize:'12px'}}>·</span>
            <div style={{fontSize:'13px',color:textSub}}><strong style={{color:'#10b981'}}>+38%</strong> de vues en moyenne</div>
          </div>
        </div>
      </section>

      {/* ─ VIDEO DEMO HERO ─ */}
      <section style={{maxWidth:'900px',margin:'0 auto',padding:isMobile?'0 16px 20px':'0 40px 20px',textAlign:'center'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(16,185,129,.09)',border:'1px solid rgba(16,185,129,.22)',borderRadius:'100px',padding:'5px 14px',fontSize:'12px',color:'#10b981',fontWeight:700,marginBottom:'16px'}}>
          🎬 Démo en direct — regarde la transformation
        </div>
        <div style={{position:'relative',borderRadius:'20px',overflow:'hidden',background:'#111118',border:'1px solid rgba(255,255,255,.06)',aspectRatio:'16/7',maxHeight:'200px',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 20px 60px rgba(124,58,237,.12)'}}>
          {/* Replace src with real demo video when available */}
          <video autoPlay loop muted playsInline style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
            src="" poster="">
            {/* Fallback when no video src */}
          </video>
          {/* Fallback overlay shown when no video */}
          <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'10px',background:'linear-gradient(135deg,#111118,#1a0a2e)'}}>
            <div style={{display:'flex',alignItems:'center',gap:'20px',flexWrap:'wrap',justifyContent:'center',padding:'0 20px'}}>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:isMobile?'36px':'52px',filter:'grayscale(.3) brightness(.7)',marginBottom:'6px'}}>👗</div>
                <div style={{background:'rgba(239,68,68,.15)',color:'#f87171',fontSize:'11px',padding:'3px 10px',borderRadius:'6px',fontWeight:700}}>Fond encombré</div>
              </div>
              <div style={{fontSize:isMobile?'24px':'32px',color:'#7c3aed',fontWeight:900}}>⟶</div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:isMobile?'36px':'52px',marginBottom:'6px'}}>👗</div>
                <div style={{background:'rgba(16,185,129,.15)',color:'#10b981',fontSize:'11px',padding:'3px 10px',borderRadius:'6px',fontWeight:700}}>Fond blanc ✓</div>
              </div>
              <div style={{fontSize:isMobile?'24px':'32px',color:'#7c3aed',fontWeight:900}}>⟶</div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:isMobile?'36px':'52px',marginBottom:'6px'}}>👖</div>
                <div style={{background:'rgba(16,185,129,.15)',color:'#10b981',fontSize:'11px',padding:'3px 10px',borderRadius:'6px',fontWeight:700}}>Studio pro ✓</div>
              </div>
            </div>
            <div style={{background:'rgba(124,58,237,.2)',border:'1px solid rgba(124,58,237,.35)',borderRadius:'10px',padding:'8px 20px',display:'flex',alignItems:'center',gap:'8px'}}>
              <div className="pg-spin" style={{width:'14px',height:'14px',border:'2px solid rgba(167,139,250,.3)',borderTopColor:'#a78bfa',borderRadius:'50%'}}/>
              <span style={{color:'#a78bfa',fontSize:'13px',fontWeight:700}}>Traitement IA · ~10 secondes</span>
            </div>
          </div>
        </div>
        <p style={{color:textMuted,fontSize:'12px',marginTop:'10px'}}>Glissez le slider ci-dessous pour comparer ↓</p>
      </section>

      {/* ─ COMPARE SLIDER ─ */}
      <section style={{maxWidth:'700px',margin:'0 auto',padding:isMobile?'0 16px 52px':'0 40px 72px'}}>
        <div style={{background:isDark?'linear-gradient(160deg,#111118,#0d0d18)':'#fff',border:`1px solid ${cardBorder}`,borderRadius:'24px',padding:isMobile?'20px':'32px',boxShadow:isDark?'none':'0 8px 40px rgba(0,0,0,.08)'}}>
          <p style={{color:textMuted,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'2px',textAlign:'center',marginBottom:'18px'}}>✨ Résultat en temps réel · Glissez pour comparer</p>
          <CompareSlider/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginTop:'16px'}}>
            <div style={{background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.15)',borderRadius:'10px',padding:'10px 14px',textAlign:'center'}}>
              <p style={{color:'#f87171',fontSize:'13px',fontWeight:700,margin:'0 0 3px'}}>✗ Avant PixGlow</p>
              <p style={{color:textMuted,fontSize:'12px',margin:0}}>Fond encombré · Lumière sombre</p>
            </div>
            <div style={{background:'rgba(16,185,129,.07)',border:'1px solid rgba(16,185,129,.2)',borderRadius:'10px',padding:'10px 14px',textAlign:'center'}}>
              <p style={{color:'#10b981',fontSize:'13px',fontWeight:700,margin:'0 0 3px'}}>✓ Après PixGlow</p>
              <p style={{color:textMuted,fontSize:'12px',margin:0}}>Fond blanc · Qualité studio</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─ SOCIAL PROOF BAR ─ */}
      <section style={{background:isDark?'linear-gradient(90deg,rgba(124,58,237,.07),rgba(16,185,129,.05),rgba(96,165,250,.07))':'rgba(0,0,0,.03)',borderTop:`1px solid ${cardBorder}`,borderBottom:`1px solid ${cardBorder}`,padding:isMobile?'20px 16px':'24px 40px'}}>
        <div style={{maxWidth:'900px',margin:'0 auto'}}>
          <p style={{color:textMuted,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'2px',textAlign:'center',marginBottom:'16px'}}>Utilisé par les vendeurs de</p>
          <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:isMobile?'20px':'48px',flexWrap:'wrap'}}>
            {[
              {name:'Vinted',color:'#00b67a',emoji:'🟢'},
              {name:'Leboncoin',color:'#f56a0a',emoji:'🟠'},
              {name:'Vestiaire',color:'#2d2d2d',emoji:'⚫'},
              {name:'Depop',color:'#ff2300',emoji:'🔴'},
              {name:'Vide-dressing',color:'#9333ea',emoji:'🟣'},
            ].map((b,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:'6px',opacity:.7}}>
                <span style={{fontSize:'18px'}}>{b.emoji}</span>
                <span style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:800,fontSize:isMobile?'14px':'17px',color:isDark?'#94a3b8':'#475569',letterSpacing:'-.3px'}}>{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─ STATS ─ */}
      <section style={{maxWidth:'900px',margin:'0 auto',padding:isMobile?'44px 16px':'64px 40px'}}>
        <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:isMobile?'24px':'38px',fontWeight:800,textAlign:'center',marginBottom:'8px',color:textPrimary}}>Les chiffres parlent d'eux-mêmes</h2>
        <p style={{color:textSub,textAlign:'center',marginBottom:'44px',fontSize:'16px'}}>Résultats mesurés sur +12 000 annonces traitées</p>
        <div className="pg-stats-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px'}}>
          {[
            {v:'+38%',l:'vues par annonce',c:'#7c3aed',d:'En moyenne constaté par nos utilisateurs'},
            {v:'3 sec',l:'par photo',c:'#10b981',d:'Traitement IA ultra-rapide'},
            {v:'+30%',l:'taux de vente',c:'#60a5fa',d:'Photos pro = acheteurs confiants'},
            {v:'12k+',l:'vendeurs actifs',c:'#f59e0b',d:'Communauté active en France'},
          ].map((s,i)=>(
            <div key={i} className="pg-card" style={{background:cardBg,border:`1px solid ${cardBorder}`,borderRadius:'16px',padding:isMobile?'18px 12px':'24px 20px',textAlign:'center',cursor:'default'}}>
              <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:isMobile?'28px':'38px',fontWeight:900,color:s.c,marginBottom:'6px'}}>{s.v}</div>
              <div style={{fontSize:isMobile?'13px':'14px',color:textSub,fontWeight:600,marginBottom:'4px'}}>{s.l}</div>
              {!isMobile&&<div style={{fontSize:'12px',color:textMuted}}>{s.d}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ─ FEATURES ─ */}
      <section style={{maxWidth:'1000px',margin:'0 auto',padding:isMobile?'0 16px 52px':'0 40px 72px'}}>
        <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:isMobile?'26px':'40px',fontWeight:800,textAlign:'center',marginBottom:'8px',color:textPrimary}}>Annonces pro. Sans studio.</h2>
        <p style={{color:textSub,textAlign:'center',marginBottom:'44px',fontSize:'16px'}}>Tout ce qu'il faut pour vendre plus vite sur Vinted</p>
        <div className="pg-features-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
          {[
            {icon:'🎨',titre:'Fond blanc parfait',desc:'Suppression IA du fond en 1 clic. Tes articles ressortent comme sur un site e-commerce professionnel.',col:'124,58,237'},
            {icon:'✨',titre:'Luminosité & netteté',desc:'Contraste, couleurs et netteté optimisés auto. Chaque photo devient plus attirante.',col:'96,165,250'},
            {icon:'⚡',titre:"5 photos à la fois",desc:"Traitement en batch — prépare toute une annonce en moins d'une minute depuis ton mobile.",col:'16,185,129'},
            {icon:'📱',titre:'100% mobile-friendly',desc:"Glisse tes photos depuis la galerie ou prends-les directement avec l'appareil photo.",col:'245,158,11'},
            {icon:'🔒',titre:'Données sécurisées',desc:'Photos supprimées dans les 24h. Zéro tracking, zéro pub. Paiement Stripe certifié PCI-DSS.',col:'239,68,68'},
            {icon:'💎',titre:'Crédits à vie',desc:'Achète une fois, utilise quand tu veux. Pas d\'abonnement, pas de date d\'expiration.',col:'167,139,250'},
          ].map((f,i)=>(
            <div key={i} className="pg-card" style={{background:cardBg,border:`1px solid rgba(${f.col},.16)`,borderRadius:'20px',padding:isMobile?'20px 16px':'28px 24px',cursor:'default'}}>
              <div style={{width:'48px',height:'48px',background:`rgba(${f.col},.12)`,borderRadius:'14px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',marginBottom:'16px',border:`1px solid rgba(${f.col},.2)`}}>{f.icon}</div>
              <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:'17px',fontWeight:700,marginBottom:'8px',color:textPrimary}}>{f.titre}</h3>
              <p style={{color:textSub,fontSize:'14px',lineHeight:1.65,margin:0}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─ TÉMOIGNAGES ─ */}
      <section style={{background:isDark?'linear-gradient(180deg,transparent,rgba(124,58,237,.04),transparent)':'rgba(124,58,237,.03)',padding:isMobile?'40px 16px':'60px 40px'}}>
        <div style={{maxWidth:'1000px',margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:'12px'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:'4px',background:'rgba(245,158,11,.1)',border:'1px solid rgba(245,158,11,.25)',borderRadius:'100px',padding:'5px 14px',fontSize:'13px',color:'#f59e0b',fontWeight:700,marginBottom:'14px'}}>
              ⭐⭐⭐⭐⭐ 4.9/5 · 200+ avis vérifiés
            </div>
          </div>
          <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:isMobile?'24px':'36px',fontWeight:800,textAlign:'center',marginBottom:'8px',color:textPrimary}}>Ils vendent mieux avec PixGlow</h2>
          <p style={{color:textSub,textAlign:'center',marginBottom:'36px',fontSize:'15px'}}>Rejoins des milliers de vendeurs Vinted satisfaits</p>
          <div className="pg-testi-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px'}}>
            {[
              {nom:'Sophie M.',tag:'Vendeuse Vinted · Paris',av:'👩',txt:"Mes vues ont doublé ! Je vends mes vêtements 2x plus vite depuis que j'utilise PixGlow. Mes annonces font vraiment pro.",stars:5,badge:'+120% vues'},
              {nom:'Karim B.',tag:'Revendeur confirmé',av:'🧔',txt:"J'ai testé Photoroom avant, PixGlow est aussi bien et bien moins cher. Je prépare 20 annonces en 5 min top chrono.",stars:5,badge:'20 annonces/5 min'},
              {nom:'Léa F.',tag:'Vendeuse Vestiaire Collective',av:'👧',txt:"Le fond blanc change tout. Les acheteurs font plus confiance à mes articles. Mes ventes ont augmenté de 30%.",stars:5,badge:'+30% ventes'},
              {nom:'Marc T.',tag:'Vendeur Leboncoin',av:'🧑',txt:"Simple, rapide, bluffant. J'aurais dû commencer par PixGlow dès le début. Résultats parfaits sur les vêtements noirs.",stars:5,badge:'Parfait sur noir'},
              {nom:'Julie P.',tag:'Revendeuse de luxe',av:'👩‍💼',txt:"Pour les pièces de créateur, la qualité est vraiment importante. PixGlow donne un rendu digne d'un studio photo.",stars:5,badge:'Qualité studio'},
              {nom:'Alex D.',tag:'Vendeur multi-plateformes',av:'🧑‍💻',txt:"Je vends sur Vinted, Leboncoin et Vestiaire. PixGlow me fait gagner 1h par semaine sur la préparation des photos.",stars:5,badge:'−1h/semaine'},
            ].map((t,i)=>(
              <div key={i} className="pg-card" style={{background:cardBg,border:`1px solid ${cardBorder}`,borderRadius:'18px',padding:'20px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
                  <div style={{width:'38px',height:'38px',borderRadius:'50%',background:`hsl(${220+i*20},45%,${isDark?32:55}%)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',flexShrink:0}}>{t.av}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{color:textPrimary,fontWeight:700,fontSize:'14px',margin:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{t.nom}</p>
                    <p style={{color:textMuted,fontSize:'11px',margin:0}}>{t.tag}</p>
                  </div>
                  <span style={{background:'rgba(16,185,129,.1)',color:'#10b981',fontSize:'10px',padding:'2px 8px',borderRadius:'6px',fontWeight:700,whiteSpace:'nowrap',flexShrink:0}}>{t.badge}</span>
                </div>
                <div style={{marginBottom:'10px'}}>{'⭐'.repeat(t.stars)}</div>
                <p style={{color:textSub,fontSize:'13px',lineHeight:1.65,fontStyle:'italic',margin:0}}>"{t.txt}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─ PRICING ─ */}
      <section style={{maxWidth:'720px',margin:'0 auto',padding:isMobile?'44px 16px':'64px 40px'}}>
        <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:isMobile?'26px':'38px',fontWeight:800,textAlign:'center',marginBottom:'8px',color:textPrimary}}>Tarif simple et honnête</h2>
        <p style={{color:textSub,textAlign:'center',marginBottom:'36px',fontSize:'15px'}}>Pas d'abonnement. Paye seulement si tu en veux plus.</p>
        <div className="pg-pricing-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
          <div className="pg-card" style={{background:isDark?'rgba(16,185,129,.04)':'#f0fdf4',border:'1px solid rgba(16,185,129,.2)',borderRadius:'20px',padding:'28px 22px',textAlign:'center',cursor:'default'}}>
            <p style={{fontSize:'30px',marginBottom:'10px'}}>🎁</p>
            <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:'19px',fontWeight:800,marginBottom:'6px',color:textPrimary}}>Gratuit</h3>
            <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:'46px',fontWeight:900,color:'#10b981',marginBottom:'2px',lineHeight:1}}>5</div>
            <p style={{color:'#10b981',fontWeight:700,marginBottom:'12px',fontSize:'14px'}}>photos offertes</p>
            <p style={{color:textMuted,fontSize:'13px',marginBottom:'22px',lineHeight:1.6}}>Sans inscription<br/>Sans carte bancaire<br/>Résultat immédiat</p>
            <button onClick={()=>setPage('app')} className="pg-btn" style={{width:'100%',background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff',border:'none',borderRadius:'12px',padding:'14px',fontWeight:800,cursor:'pointer',fontSize:'15px',fontFamily:'inherit'}}>Essayer maintenant →</button>
          </div>
          <div className="pg-card" style={{background:isDark?'linear-gradient(160deg,rgba(124,58,237,.1),rgba(79,70,229,.06))':'linear-gradient(160deg,#faf5ff,#ede9fe)',border:'2px solid rgba(124,58,237,.4)',borderRadius:'20px',padding:'28px 22px',textAlign:'center',position:'relative',cursor:'default'}}>
            <div style={{position:'absolute',top:'-13px',left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#7c3aed,#4f46e5)',borderRadius:'100px',padding:'4px 16px',fontSize:'11px',fontWeight:800,color:'#fff',whiteSpace:'nowrap'}}>⭐ MEILLEURE OFFRE</div>
            <p style={{fontSize:'30px',marginBottom:'10px'}}>💎</p>
            <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:'19px',fontWeight:800,marginBottom:'6px',color:textPrimary}}>Pro</h3>
            <div style={{display:'flex',alignItems:'baseline',justifyContent:'center',gap:'4px',marginBottom:'2px'}}>
              <span style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:'46px',fontWeight:900,color:'#7c3aed',lineHeight:1}}>15€</span>
            </div>
            <p style={{color:'#a78bfa',fontWeight:600,marginBottom:'4px',fontSize:'13px'}}>100 crédits · 0,15€/photo</p>
            <p style={{color:textMuted,fontSize:'12px',marginBottom:'22px',lineHeight:1.6}}>Valables à vie<br/>Sans abonnement<br/>Paiement sécurisé</p>
            <button onClick={()=>openAuth('register')} className="pg-btn" style={{width:'100%',background:'linear-gradient(135deg,#7c3aed,#4f46e5)',color:'#fff',border:'none',borderRadius:'12px',padding:'14px',fontWeight:800,cursor:'pointer',fontSize:'15px',fontFamily:'inherit'}}>Acheter les crédits →</button>
          </div>
        </div>
        <p style={{textAlign:'center',color:textMuted,fontSize:'13px',marginTop:'16px'}}>🔒 Paiement sécurisé Stripe · Aucune CB requise pour l'essai · Remboursement 14j si non utilisé</p>
      </section>

      {/* ─ FAQ ─ */}
      <section style={{maxWidth:'720px',margin:'0 auto',padding:isMobile?'0 16px 52px':'0 40px 72px'}}>
        <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:isMobile?'24px':'34px',fontWeight:800,textAlign:'center',marginBottom:'8px',color:textPrimary}}>Questions fréquentes</h2>
        <p style={{color:textSub,textAlign:'center',marginBottom:'32px',fontSize:'15px'}}>Tout ce que tu dois savoir avant de commencer</p>
        {FAQ_DATA.map((item,i)=><FaqItem key={i} item={item} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)}/>)}
      </section>

      <FooterBar/>
    </div>
  );

  /* ══════════ APP PAGE ══════════ */
  const lowCredits=isConnected&&credits!==null&&credits<5;
  return(
    <div style={{background:bg,minHeight:'100vh',color:textPrimary,paddingBottom:isMobile&&(hasResults||limitReached)?'80px':'0'}}>
      <InjectCSS/>
      <Confetti active={showConfetti}/>
      <AuthModal show={showAuth} initialMode={authMode} onClose={()=>setShowAuth(false)} onSuccess={handleAuthSuccess} isMobile={isMobile}/>
      <input ref={fileInputRef} type="file" accept="image/*" multiple style={{display:'none'}} onChange={handleFilesChange}/>
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={handleFilesChange}/>
      <Nav {...navProps}/>

      <div style={{maxWidth:'860px',margin:'0 auto',padding:isMobile?'14px 14px 20px':'32px 20px'}}>

        {/* Compteur */}
        {!isConnected&&freeLeft!==null&&(
          <div className="pg-anim" style={{background:limitReached?'rgba(239,68,68,.06)':cardBg,border:`1px solid ${limitReached?'rgba(239,68,68,.2)':cardBorder}`,borderRadius:'16px',padding:isMobile?'14px 16px':'18px 22px',marginBottom:'14px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'10px'}}>
            <div>
              <p style={{color:textMuted,fontSize:'11px',textTransform:'uppercase',letterSpacing:'1.5px',fontWeight:700,marginBottom:'4px'}}>Photos gratuites restantes</p>
              <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:'38px',fontWeight:900,color:limitReached?'#ef4444':'#10b981',lineHeight:1}}>{freeLeft}/5</div>
              {!limitReached&&freeLeft<=2&&<p style={{color:'#f59e0b',fontSize:'12px',fontWeight:700,marginTop:'3px'}}>⚠️ Plus que {freeLeft} photo{freeLeft>1?'s':''} gratuite{freeLeft>1?'s':''} !</p>}
              {limitReached&&<p style={{color:'#f87171',fontSize:'12px',fontWeight:700,marginTop:'3px'}}>🔴 Limite atteinte — créez un compte</p>}
            </div>
            {limitReached&&(
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                <button onClick={()=>openAuth('register')} className="pg-btn" style={{background:'linear-gradient(135deg,#7c3aed,#4f46e5)',color:'#fff',border:'none',borderRadius:'10px',padding:'11px 18px',fontWeight:700,cursor:'pointer',fontSize:'14px',fontFamily:'inherit'}}>🚀 Créer un compte</button>
                <button onClick={()=>openAuth('login')} className="pg-ghost" style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',color:'#94a3b8',borderRadius:'10px',padding:'11px 14px',fontWeight:600,cursor:'pointer',fontSize:'14px',fontFamily:'inherit'}}>Connexion</button>
              </div>
            )}
          </div>
        )}

        {/* Zone upload / résultats */}
        <div style={{background:cardBg,border:`1px solid ${isDragging?'rgba(124,58,237,.6)':cardBorder}`,borderRadius:'20px',padding:isMobile?'16px':'26px',marginBottom:'14px',boxShadow:isDragging?'0 0 0 3px rgba(124,58,237,.15)':'none',transition:'all .2s'}}>
          {!hasResults?(
            <>
              {/* Drop zone */}
              <div
                onClick={()=>handleSelectClick(false)}
                onDragOver={e=>{e.preventDefault();setIsDragging(true);}}
                onDragLeave={()=>setIsDragging(false)}
                onDrop={e=>{e.preventDefault();setIsDragging(false);if(!limitReached)processFiles(e.dataTransfer.files);}}
                style={{border:`2px dashed ${limitReached?'rgba(239,68,68,.25)':isDragging?'rgba(124,58,237,.7)':'rgba(124,58,237,.28)'}`,borderRadius:'16px',padding:isMobile?'28px 14px':'44px 24px',textAlign:'center',cursor:limitReached?'not-allowed':'pointer',marginBottom:'14px',background:isDragging?'rgba(124,58,237,.06)':limitReached?'rgba(239,68,68,.02)':'rgba(124,58,237,.02)',transition:'all .2s'}}>
                <div style={{fontSize:isMobile?'40px':'50px',marginBottom:'12px'}}>{isDragging?'⬇️':'📸'}</div>
                <p style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:isMobile?'17px':'20px',fontWeight:700,marginBottom:'6px',color:textPrimary}}>{limitReached?'Limite atteinte':isDragging?'Relâche pour analyser !':"Choisir jusqu'à 5 photos"}</p>
                <p style={{color:textMuted,fontSize:'13px',marginBottom:limitReached||isMobile?0:'0'}}>{limitReached?'Créez un compte pour continuer':'JPG · PNG · WEBP · HEIC · Glissez vos photos ici'}</p>
                {!limitReached&&isMobile&&(
                  <button onClick={e=>{e.stopPropagation();handleSelectClick(true);}} style={{marginTop:'12px',background:'rgba(124,58,237,.12)',border:'1px solid rgba(124,58,237,.25)',color:'#a78bfa',borderRadius:'10px',padding:'10px 18px',fontWeight:700,cursor:'pointer',fontSize:'14px',fontFamily:'inherit'}}>📷 Prendre une photo</button>
                )}
              </div>

              {/* Previews avec shimmer */}
              {previews.length>0&&(
                <div style={{marginBottom:'14px'}}>
                  <p style={{color:textSub,fontSize:'13px',marginBottom:'10px',fontWeight:600}}>{previews.length} photo{previews.length>1?'s':''} sélectionnée{previews.length>1?'s':''}</p>
                  <div style={{display:'grid',gridTemplateColumns:`repeat(${Math.min(previews.length,isMobile?3:5)},1fr)`,gap:'8px'}}>
                    {previews.map((src,i)=>(
                      <div key={i} style={{position:'relative',borderRadius:'10px',overflow:'hidden',aspectRatio:'1',background:'#111'}}>
                        <img src={src} alt={`Photo ${i+1}`} style={{width:'100%',height:'100%',objectFit:'cover',display:'block',borderRadius:'10px',border:'2px solid rgba(124,58,237,.2)'}}/>
                        {loading&&i<progress&&(
                          <div className="pg-check" style={{position:'absolute',inset:0,background:'rgba(16,185,129,.28)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px'}}>✅</div>
                        )}
                        {loading&&i===progress&&(
                          <div className="pg-shimmer" style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <div className="pg-spin" style={{width:'24px',height:'24px',border:'3px solid rgba(255,255,255,.2)',borderTopColor:'#7c3aed',borderRadius:'50%'}}/>
                          </div>
                        )}
                        {loading&&i>progress&&(
                          <div className="pg-shimmer" style={{position:'absolute',inset:0}}/>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error&&<div style={{background:'rgba(239,68,68,.07)',border:'1px solid rgba(239,68,68,.22)',borderRadius:'12px',padding:'12px 16px',marginBottom:'14px',color:'#f87171',fontSize:'14px',textAlign:'center'}}>⚠️ {error}</div>}

              {loading&&(
                <div style={{marginBottom:'14px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                    <span style={{color:textSub,fontSize:'13px',fontWeight:600}}>🤖 Amélioration IA en cours...</span>
                    <span style={{color:'#7c3aed',fontWeight:800,fontSize:'14px'}}>{progress}/{files.length}</span>
                  </div>
                  <div style={{background:isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.08)',borderRadius:'100px',height:'8px',overflow:'hidden'}}>
                    <div style={{background:'linear-gradient(90deg,#7c3aed,#60a5fa,#10b981)',height:'100%',width:`${(progress/files.length)*100}%`,borderRadius:'100px',transition:'width .4s ease'}}/>
                  </div>
                  <p style={{color:textMuted,fontSize:'12px',textAlign:'center',marginTop:'6px'}}>~10–15 secondes par photo · Suppression fond + luminosité studio</p>
                </div>
              )}

              {!limitReached&&(
                <button onClick={handleUpload} disabled={!files.length||loading} className={files.length&&!loading?'pg-btn':''}
                  style={{width:'100%',border:'none',fontWeight:800,borderRadius:'14px',padding:'18px',fontSize:isMobile?'17px':'19px',cursor:files.length&&!loading?'pointer':'not-allowed',background:files.length&&!loading?'linear-gradient(135deg,#7c3aed,#4f46e5)':isDark?'rgba(255,255,255,.04)':'rgba(0,0,0,.06)',color:files.length&&!loading?'#fff':textMuted,fontFamily:'inherit',transition:'all .2s'}}>
                  {loading?`⏳ Photo ${progress}/${files.length} en cours...`:files.length?`⚡ Améliorer ${files.length} photo${files.length>1?'s':''} — résultats pro en 15 sec`:'← Sélectionnez des photos ci-dessus'}
                </button>
              )}
            </>
          ):(
            <>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',flexWrap:'wrap',gap:'10px'}}>
                <h3 className="pg-check" style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:'18px',fontWeight:800,color:'#10b981',margin:0}}>✅ {doneCount}/{results.length} photo{doneCount>1?'s':''} améliorée{doneCount>1?'s':''}</h3>
                {doneCount>1&&<button onClick={handleDownloadAll} className="pg-btn" style={{background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff',border:'none',borderRadius:'10px',padding:'10px 18px',fontWeight:700,cursor:'pointer',fontSize:'14px',fontFamily:'inherit'}}>📥 Tout télécharger ({doneCount})</button>}
              </div>

              <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(2,1fr)',gap:'14px',marginBottom:'14px'}}>
                {results.map((r,i)=>(
                  <div key={i} className="pg-fadein" style={{background:r.error?'rgba(239,68,68,.05)':'rgba(16,185,129,.03)',border:`1px solid ${r.error?'rgba(239,68,68,.18)':'rgba(16,185,129,.18)'}`,borderRadius:'14px',padding:'14px'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'12px'}}>
                      <div>
                        <p style={{color:textMuted,fontSize:'10px',margin:'0 0 6px',textTransform:'uppercase',fontWeight:700,letterSpacing:'1px'}}>Avant</p>
                        <img src={r.original} alt="Avant" style={{width:'100%',borderRadius:'8px',display:'block',aspectRatio:'1',objectFit:'cover'}}/>
                      </div>
                      <div>
                        <p style={{color:r.error?'#f87171':'#10b981',fontSize:'10px',margin:'0 0 6px',textTransform:'uppercase',fontWeight:700,letterSpacing:'1px'}}>{r.error?'Erreur':'Après ✅'}</p>
                        {r.error
                          ?<div style={{width:'100%',aspectRatio:'1',background:'rgba(239,68,68,.08)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px'}}>⚠️</div>
                          :<div style={{position:'relative',borderRadius:'8px',overflow:'hidden',aspectRatio:'1',background:'#fff'}}>
                            <img src={r.url} alt="Après" className="pg-fadein" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                          </div>
                        }
                      </div>
                    </div>
                    {!r.error&&<button onClick={()=>handleDownload(r)} className="pg-btn" style={{width:'100%',background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff',border:'none',borderRadius:'10px',padding:'11px',fontWeight:700,cursor:'pointer',fontSize:'14px',fontFamily:'inherit'}}>📥 Télécharger</button>}
                    {r.error&&<p style={{color:'#f87171',fontSize:'12px',textAlign:'center',margin:'4px 0 0'}}>{r.error}</p>}
                  </div>
                ))}
              </div>

              <button onClick={reset} className="pg-ghost" style={{width:'100%',background:isDark?'rgba(255,255,255,.03)':'rgba(0,0,0,.04)',border:`1px solid ${cardBorder}`,color:textSub,borderRadius:'14px',padding:'14px',fontWeight:700,cursor:'pointer',fontSize:'15px',fontFamily:'inherit'}}>🔄 Traiter de nouvelles photos</button>
            </>
          )}
        </div>

        {/* CTA bas */}
        {!isConnected?(
          <div style={{background:isDark?'linear-gradient(160deg,rgba(124,58,237,.07),rgba(79,70,229,.04))':'linear-gradient(160deg,#faf5ff,#ede9fe)',border:'1px solid rgba(124,58,237,.18)',borderRadius:'20px',padding:isMobile?'20px 16px':'28px 32px',textAlign:'center'}}>
            <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:isMobile?'17px':'21px',fontWeight:800,marginBottom:'7px',color:textPrimary}}>💎 Envie de plus de photos ?</h3>
            <p style={{color:textSub,fontSize:'14px',marginBottom:'18px',lineHeight:1.65}}>Créez un compte gratuit et achetez des crédits.<br/><strong style={{color:isDark?'#e2e8f0':'#1e293b'}}>100 photos à 15€ · Valables à vie · Paiement sécurisé</strong></p>
            <div style={{display:'flex',gap:'10px',justifyContent:'center',flexWrap:'wrap'}}>
              <button onClick={()=>openAuth('register')} className="pg-btn" style={{background:'linear-gradient(135deg,#7c3aed,#4f46e5)',color:'#fff',border:'none',borderRadius:'12px',padding:'13px 22px',fontWeight:800,cursor:'pointer',fontSize:'15px',fontFamily:'inherit'}}>🚀 Créer mon compte</button>
              <button onClick={()=>openAuth('login')} className="pg-ghost" style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',color:'#94a3b8',borderRadius:'12px',padding:'13px 18px',fontWeight:600,cursor:'pointer',fontSize:'15px',fontFamily:'inherit'}}>J'ai déjà un compte</button>
            </div>
          </div>
        ):(
          <div style={{textAlign:'center',padding:'14px 0'}}>
            {lowCredits&&<p style={{color:'#f59e0b',fontSize:'13px',fontWeight:700,marginBottom:'10px'}}>⚠️ Plus que {credits} crédit{credits>1?'s':''} — rechargez pour continuer !</p>}
            <button onClick={handlePayment} className="pg-btn" style={{background:'linear-gradient(135deg,#7c3aed,#4f46e5)',color:'#fff',border:'none',borderRadius:'14px',padding:isMobile?'16px 28px':'18px 48px',fontWeight:800,fontSize:isMobile?'16px':'18px',cursor:'pointer',fontFamily:'inherit'}}>💳 Acheter 100 crédits — 15€</button>
            <p style={{color:textMuted,fontSize:'12px',marginTop:'9px'}}>1 crédit = 1 photo = 0,15€ · Valables à vie · 🔒 Sécurisé Stripe</p>
          </div>
        )}
      </div>

      {/* ─ STICKY BOTTOM BAR mobile ─ */}
      {isMobile&&(hasResults||limitReached)&&(
        <div style={{position:'fixed',bottom:0,left:0,right:0,background:isDark?'rgba(10,10,15,.97)':'rgba(248,248,255,.97)',borderTop:'1px solid rgba(124,58,237,.2)',backdropFilter:'blur(16px)',padding:'12px 16px',zIndex:150,display:'flex',gap:'8px'}}>
          {hasResults&&doneCount>0&&(
            <button onClick={handleDownloadAll} className="pg-btn" style={{flex:1,background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff',border:'none',borderRadius:'12px',padding:'14px',fontWeight:800,cursor:'pointer',fontSize:'15px',fontFamily:'inherit'}}>📥 Télécharger ({doneCount})</button>
          )}
          {hasResults&&(
            <button onClick={reset} className="pg-ghost" style={{flex:1,background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)',color:'#94a3b8',borderRadius:'12px',padding:'14px',fontWeight:700,cursor:'pointer',fontSize:'15px',fontFamily:'inherit'}}>🔄 Nouvelles photos</button>
          )}
          {limitReached&&(
            <button onClick={()=>openAuth('register')} className="pg-btn" style={{flex:1,background:'linear-gradient(135deg,#7c3aed,#4f46e5)',color:'#fff',border:'none',borderRadius:'12px',padding:'14px',fontWeight:800,cursor:'pointer',fontSize:'15px',fontFamily:'inherit'}}>🚀 Créer un compte</button>
          )}
        </div>
      )}

      <FooterBar/>
    </div>
  );
}