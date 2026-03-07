import React from 'react';

const S = {
  page: { background: 'linear-gradient(135deg,#0f172a,#1e293b)', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui,sans-serif' },
  wrap: { maxWidth: '760px', margin: '0 auto', padding: '40px 20px' },
  h1:   { fontSize: '28px', fontWeight: 800, marginBottom: '8px' },
  h2:   { fontSize: '18px', fontWeight: 700, color: '#60a5fa', margin: '28px 0 8px 0' },
  p:    { color: '#94a3b8', lineHeight: 1.8, fontSize: '15px', marginBottom: '12px' },
  nav:  { padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15,23,42,0.97)', position: 'sticky', top: 0, zIndex: 100 },
};

export function MentionsLegales({ onBack }) {
  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <span style={{ fontWeight: 800, fontSize: '18px' }}>✨ PixGlow</span>
        <button onClick={onBack} style={{ background: '#334155', border: 'none', color: '#fff', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: 600 }}>← Retour</button>
      </nav>
      <div style={S.wrap}>
        <h1 style={S.h1}>Mentions légales</h1>
        <p style={{ ...S.p, color: '#64748b', fontSize: '13px' }}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <h2 style={S.h2}>Éditeur du site</h2>
        <p style={S.p}>
          Le site pixglow.app est édité par un entrepreneur individuel.<br/>
          Email de contact : <a href="mailto:support@pixglow.app" style={{ color: '#60a5fa' }}>support@pixglow.app</a>
        </p>

        <h2 style={S.h2}>Hébergement</h2>
        <p style={S.p}>
          Le site est hébergé par :<br/>
          <strong style={{ color: '#e2e8f0' }}>Railway Corp</strong> — 548 Market St, San Francisco, CA 94104, USA<br/>
          <a href="https://railway.app" style={{ color: '#60a5fa' }}>railway.app</a>
        </p>

        <h2 style={S.h2}>Propriété intellectuelle</h2>
        <p style={S.p}>
          L'ensemble du contenu du site PixGlow (textes, images, logo, design) est protégé par le droit d'auteur.
          Toute reproduction sans autorisation est interdite.
        </p>

        <h2 style={S.h2}>Traitement des paiements</h2>
        <p style={S.p}>
          Les paiements sont traités par <strong style={{ color: '#e2e8f0' }}>Stripe Inc.</strong>, prestataire tiers certifié PCI-DSS.
          PixGlow ne stocke aucune donnée bancaire.
        </p>

        <h2 style={S.h2}>Responsabilité</h2>
        <p style={S.p}>
          PixGlow ne saurait être tenu responsable des dommages directs ou indirects liés à l'utilisation du service.
          Le service est fourni "en l'état", sans garantie de disponibilité continue.
        </p>
      </div>
    </div>
  );
}

export function PolitiqueConfidentialite({ onBack }) {
  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <span style={{ fontWeight: 800, fontSize: '18px' }}>✨ PixGlow</span>
        <button onClick={onBack} style={{ background: '#334155', border: 'none', color: '#fff', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: 600 }}>← Retour</button>
      </nav>
      <div style={S.wrap}>
        <h1 style={S.h1}>Politique de confidentialité</h1>
        <p style={{ ...S.p, color: '#64748b', fontSize: '13px' }}>Conformément au RGPD (Règlement Général sur la Protection des Données)</p>

        <h2 style={S.h2}>Données collectées</h2>
        <p style={S.p}>
          Lors de la création d'un compte, nous collectons :<br/>
          • Votre adresse email<br/>
          • Votre mot de passe (chiffré, jamais lisible)<br/>
          • Votre adresse IP (pour le quota d'images gratuites)<br/>
          • Les images que vous uploadez (supprimées automatiquement après 24h)
        </p>

        <h2 style={S.h2}>Finalité du traitement</h2>
        <p style={S.p}>
          Vos données sont utilisées uniquement pour :<br/>
          • La gestion de votre compte et de vos crédits<br/>
          • Le traitement de vos paiements (via Stripe)<br/>
          • La prévention des abus (limitation IP)
        </p>

        <h2 style={S.h2}>Durée de conservation</h2>
        <p style={S.p}>
          • Données de compte : conservées tant que le compte est actif<br/>
          • Images uploadées : <strong style={{ color: '#e2e8f0' }}>supprimées automatiquement après 24 heures</strong><br/>
          • Données IP : conservées 30 jours
        </p>

        <h2 style={S.h2}>Partage des données</h2>
        <p style={S.p}>
          Nous ne vendons jamais vos données. Elles sont partagées uniquement avec :<br/>
          • <strong style={{ color: '#e2e8f0' }}>Stripe</strong> : pour le traitement des paiements<br/>
          • <strong style={{ color: '#e2e8f0' }}>Railway</strong> : hébergeur des serveurs
        </p>

        <h2 style={S.h2}>Vos droits (RGPD)</h2>
        <p style={S.p}>
          Vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données.
          Pour exercer ces droits, contactez-nous à <a href="mailto:support@pixglow.app" style={{ color: '#60a5fa' }}>support@pixglow.app</a>.
        </p>

        <h2 style={S.h2}>Cookies</h2>
        <p style={S.p}>
          PixGlow n'utilise pas de cookies de tracking ou publicitaires.
          Un token d'authentification est stocké localement dans votre navigateur pour maintenir votre session.
        </p>
      </div>
    </div>
  );
}

export function CGV({ onBack }) {
  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <span style={{ fontWeight: 800, fontSize: '18px' }}>✨ PixGlow</span>
        <button onClick={onBack} style={{ background: '#334155', border: 'none', color: '#fff', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: 600 }}>← Retour</button>
      </nav>
      <div style={S.wrap}>
        <h1 style={S.h1}>Conditions Générales de Vente</h1>
        <p style={{ ...S.p, color: '#64748b', fontSize: '13px' }}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <h2 style={S.h2}>Service proposé</h2>
        <p style={S.p}>
          PixGlow est un service en ligne de traitement automatique d'images permettant la suppression
          du fond et l'amélioration de la luminosité, destiné aux vendeurs de plateformes e-commerce.
        </p>

        <h2 style={S.h2}>Tarifs</h2>
        <p style={S.p}>
          • <strong style={{ color: '#e2e8f0' }}>Offre gratuite :</strong> 5 images par adresse IP, sans inscription<br/>
          • <strong style={{ color: '#e2e8f0' }}>Pack Pro :</strong> 100 crédits pour 15€ TTC (0,15€/image)<br/>
          Les crédits sont valables à vie et non remboursables une fois utilisés.
        </p>

        <h2 style={S.h2}>Paiement</h2>
        <p style={S.p}>
          Le paiement est effectué en une seule fois, par carte bancaire, via Stripe.
          Les crédits sont crédités immédiatement sur votre compte après confirmation du paiement.
        </p>

        <h2 style={S.h2}>Droit de rétractation</h2>
        <p style={S.p}>
          Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation
          ne s'applique pas aux contenus numériques dont l'exécution a commencé avec l'accord du
          consommateur. Les crédits non utilisés peuvent faire l'objet d'un remboursement sur demande
          dans les 14 jours suivant l'achat, à <a href="mailto:support@pixglow.app" style={{ color: '#60a5fa' }}>support@pixglow.app</a>.
        </p>

        <h2 style={S.h2}>Disponibilité du service</h2>
        <p style={S.p}>
          PixGlow s'efforce d'assurer une disponibilité 24h/24, 7j/7. Des interruptions techniques
          peuvent survenir pour maintenance. En cas d'indisponibilité prolongée ({">"} 48h), les crédits
          concernés seront remboursés ou compensés.
        </p>

        <h2 style={S.h2}>Litiges</h2>
        <p style={S.p}>
          En cas de litige, contactez-nous d'abord à <a href="mailto:support@pixglow.app" style={{ color: '#60a5fa' }}>support@pixglow.app</a>.
          À défaut d'accord amiable, les tribunaux français sont compétents.
          Le droit applicable est le droit français.
        </p>
      </div>
    </div>
  );
}