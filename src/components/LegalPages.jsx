import React from 'react';

/* ─── PAGES LÉGALES ─── */
export const LS = {
  page: { background: 'linear-gradient(135deg,#0a0a0f,#111118)', minHeight: '100vh', color: '#e2e8f0', fontFamily: "'DM Sans',system-ui,sans-serif" },
  nav:  { padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,.05)', background: 'rgba(10,10,15,.95)', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '20px', fontWeight: 800, color: '#fff' },
  wrap: { maxWidth: '760px', margin: '0 auto', padding: '40px 20px' },
  h1:   { fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '32px', fontWeight: 800, color: '#fff', marginBottom: '6px' },
  h2:   { fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '18px', fontWeight: 700, color: '#7c3aed', margin: '28px 0 8px' },
  p:    { color: '#64748b', lineHeight: 1.8, fontSize: '15px', marginBottom: '12px' },
  back: { background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', fontFamily: 'inherit' },
};

export const LegalLayout = ({ title, onBack, children }) => (
  <div style={LS.page}>
    <nav style={LS.nav}><span style={LS.logo}>PixGlow</span><button onClick={onBack} style={LS.back}>← Retour</button></nav>
    <div style={LS.wrap}><h1 style={LS.h1}>{title}</h1><p style={{ ...LS.p, fontSize: '13px', color: '#334155', marginBottom: '28px' }}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>{children}</div>
  </div>
);

export function MentionsLegales({ onBack }) {
  return (
    <LegalLayout title="Mentions légales" onBack={onBack}>
      <h2 style={LS.h2}>Éditeur du site</h2>
      <p style={LS.p}>Le site pixglow.app est édité par un entrepreneur individuel.<br/>Email : <a href="mailto:pixglow.support@proton.me" style={{ color: '#7c3aed' }}>pixglow.support@proton.me</a></p>
      <h2 style={LS.h2}>Directeur de la publication</h2>
      <p style={LS.p}>Le directeur de la publication est le représentant légal de l'entreprise éditrice.</p>
      <h2 style={LS.h2}>Hébergement</h2>
      <p style={LS.p}><strong style={{ color: '#e2e8f0' }}>Railway Corp</strong> — 548 Market St, San Francisco, CA 94104, USA<br/>Site : <a href="https://railway.app" style={{ color: '#7c3aed' }}>railway.app</a></p>
      <h2 style={LS.h2}>Propriété intellectuelle</h2>
      <p style={LS.p}>L'ensemble du contenu de PixGlow (textes, images, interface, code) est protégé par le droit d'auteur. Toute reproduction, même partielle, sans autorisation écrite préalable est interdite.</p>
      <h2 style={LS.h2}>Traitement des paiements</h2>
      <p style={LS.p}>Les paiements sont traités par <strong style={{ color: '#e2e8f0' }}>Stripe Inc.</strong>, certifié PCI-DSS niveau 1. PixGlow ne stocke aucune donnée bancaire.</p>
      <h2 style={LS.h2}>Responsabilité</h2>
      <p style={LS.p}>PixGlow s'efforce d'assurer la disponibilité et l'exactitude des informations. PixGlow ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation du service ou de l'indisponibilité temporaire du site.</p>
      <h2 style={LS.h2}>Litiges</h2>
      <p style={LS.p}>En cas de litige, une solution amiable sera recherchée avant tout recours judiciaire. En cas d'échec, les tribunaux français seront seuls compétents.</p>
    </LegalLayout>
  );
}

export function PolitiqueConfidentialite({ onBack }) {
  return (
    <LegalLayout title="Politique de confidentialité" onBack={onBack}>
      <p style={{ ...LS.p, color: '#475569' }}>Conformément au Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679) et à la loi Informatique et Libertés.</p>
      <h2 style={LS.h2}>Responsable du traitement</h2>
      <p style={LS.p}>PixGlow — <a href="mailto:pixglow.support@proton.me" style={{ color: '#7c3aed' }}>pixglow.support@proton.me</a></p>
      <h2 style={LS.h2}>Données collectées</h2>
      <p style={LS.p}>
        <strong style={{ color: '#e2e8f0' }}>Compte utilisateur :</strong> adresse email, mot de passe chiffré (bcrypt), solde de crédits, statut de vérification email.<br/>
        <strong style={{ color: '#e2e8f0' }}>Usage :</strong> adresse IP (pour le quota gratuit anonyme), horodatage des opérations.<br/>
        <strong style={{ color: '#e2e8f0' }}>Images :</strong> photos uploadées pour traitement — supprimées immédiatement après traitement (max 24h).
      </p>
      <h2 style={LS.h2}>Finalités du traitement</h2>
      <p style={LS.p}>
        — Fourniture du service de traitement d'images et de génération d'annonces IA<br/>
        — Gestion du compte et de l'authentification<br/>
        — Vérification de l'adresse email<br/>
        — Gestion des paiements (via Stripe)<br/>
        — Prévention des abus (limitation de débit par IP)
      </p>
      <h2 style={LS.h2}>Durée de conservation</h2>
      <p style={LS.p}>
        Images traitées : <strong style={{ color: '#e2e8f0' }}>supprimées immédiatement après traitement</strong>, et au plus tard sous 24h.<br/>
        Données de compte : conservées jusqu'à la suppression du compte.<br/>
        Données IP : 30 jours.<br/>
        Tokens de réinitialisation de mot de passe : 1h (expiration automatique).
      </p>
      <h2 style={LS.h2}>Partage des données</h2>
      <p style={LS.p}>Aucune donnée personnelle n'est vendue ni partagée à des fins commerciales. Seul Stripe Inc. reçoit les données nécessaires au paiement (email, montant). Les images ne sont jamais transmises à des tiers.</p>
      <h2 style={LS.h2}>Vos droits (RGPD)</h2>
      <p style={LS.p}>
        Vous disposez des droits d'accès, de rectification, d'effacement, de portabilité et d'opposition concernant vos données personnelles.<br/>
        Pour exercer ces droits : <a href="mailto:pixglow.support@proton.me" style={{ color: '#7c3aed' }}>pixglow.support@proton.me</a><br/>
        Vous pouvez également adresser une réclamation à la <a href="https://www.cnil.fr" style={{ color: '#7c3aed' }}>CNIL</a>.
      </p>
      <h2 style={LS.h2}>Cookies et stockage local</h2>
      <p style={LS.p}>Aucun cookie de tracking, publicité ou analytics. Un token d'authentification JWT est stocké dans le <em>localStorage</em> du navigateur uniquement pour maintenir votre session. Il est supprimé à la déconnexion.</p>
      <h2 style={LS.h2}>Sécurité</h2>
      <p style={LS.p}>Les mots de passe sont chiffrés avec bcrypt. Les communications sont chiffrées en transit (HTTPS/TLS). Les paiements sont traités par Stripe (certifié PCI-DSS niveau 1).</p>
    </LegalLayout>
  );
}

export function CGV({ onBack }) {
  return (
    <LegalLayout title="Conditions Générales de Vente" onBack={onBack}>
      <h2 style={LS.h2}>Vendeur</h2>
      <p style={LS.p}>PixGlow — entrepreneur individuel — <a href="mailto:pixglow.support@proton.me" style={{ color: '#7c3aed' }}>pixglow.support@proton.me</a></p>
      <h2 style={LS.h2}>Service proposé</h2>
      <p style={LS.p}>PixGlow est un service de traitement automatique d'images (suppression de fond, amélioration) et de génération d'annonces IA destiné aux vendeurs particuliers et professionnels sur plateformes e-commerce. PixGlow n'est pas affilié à Leboncoin, Vinted, Amazon, Facebook ou Shopify. Les noms de marques appartiennent à leurs propriétaires respectifs.</p>
      <h2 style={LS.h2}>Offre gratuite</h2>
      <p style={LS.p}>5 crédits offerts à l'inscription après confirmation de l'adresse email. 5 traitements supplémentaires disponibles sans inscription par adresse IP. Ces crédits sont valables à vie, sans engagement, sans carte bancaire.</p>
      <h2 style={LS.h2}>Tarifs — packs de crédits</h2>
      <p style={LS.p}>Les achats de crédits sont des transactions uniques (pas d'abonnement). Les crédits sont valables à vie.<br/><br/>
        <strong style={{ color: '#e2e8f0' }}>Pack Starter :</strong> 30 crédits — 7,00 € TTC (0,23 €/crédit)<br/>
        <strong style={{ color: '#e2e8f0' }}>Pack Pro :</strong> 100 crédits — 12,99 € TTC (0,13 €/crédit)<br/>
        <strong style={{ color: '#e2e8f0' }}>Pack Elite :</strong> 300 crédits — 29,00 € TTC (0,10 €/crédit)<br/><br/>
        1 crédit = 1 photo traitée (fond blanc) + génération du titre et de la description IA incluse.
      </p>
      <h2 style={LS.h2}>Paiement</h2>
      <p style={LS.p}>Les paiements sont effectués via Stripe (carte bancaire). Les crédits sont crédités immédiatement après confirmation du paiement. Tous les prix sont indiqués TTC, en euros.</p>
      <h2 style={LS.h2}>Droit de rétractation</h2>
      <p style={LS.p}>Conformément à l'article L221-18 du Code de la consommation, vous disposez d'un délai de 14 jours pour exercer votre droit de rétractation à compter de l'achat.<br/>Toutefois, conformément à l'article L221-28 12°, le droit de rétractation ne peut être exercé pour les prestations de services pleinement exécutées avant la fin du délai de rétractation, avec votre accord préalable.<br/>Contact : <a href="mailto:pixglow.support@proton.me" style={{ color: '#7c3aed' }}>pixglow.support@proton.me</a></p>
      <h2 style={LS.h2}>Transparence des prix</h2>
      <p style={LS.p}>Tous les prix affichés sont des prix réels TTC, sans réduction fictive, conformément à la directive Omnibus 2021/771 et au Code de la consommation.</p>
      <h2 style={LS.h2}>Propriété des crédits</h2>
      <p style={LS.p}>Les crédits achetés sont liés au compte utilisateur. En cas de suppression du compte, les crédits non utilisés sont perdus sans remboursement possible.</p>
      <h2 style={LS.h2}>Responsabilité</h2>
      <p style={LS.p}>PixGlow traite les images de façon automatique. Les résultats peuvent varier selon la qualité des photos soumises. PixGlow ne saurait être tenu responsable de l'utilisation des images ou textes générés sur les plateformes de vente.</p>
      <h2 style={LS.h2}>Litiges</h2>
      <p style={LS.p}>En cas de litige, contacter <a href="mailto:pixglow.support@proton.me" style={{ color: '#7c3aed' }}>pixglow.support@proton.me</a> en premier lieu. En cas d'échec de la résolution amiable, les tribunaux français seront compétents.</p>
    </LegalLayout>
  );
}
