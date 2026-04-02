---
title: "Comprendre l'authentification par Passkeys dans EmDash"
description: "Tout comprendre sur l'authentification sans mot de passe dans EmDash : WebAuthn, Passkeys, OAuth, magic links, roles et configuration SSO."
date: "2026-04-02"
author: "Equipe EmDash FR"
category: "Securite"
tags: ["emdash", "passkeys", "webauthn", "securite", "authentification", "oauth", "sso"]
difficulty: "intermediaire"
duration: "15 min"
---

# Comprendre l'authentification par Passkeys dans EmDash

EmDash fait un choix radical : pas de mots de passe. Aucun. C'est l'une des [5 raisons d'essayer EmDash](/articles/pourquoi-emdash). L'authentification repose entierement sur les Passkeys (WebAuthn), avec des solutions de repli pour les environnements qui ne les supportent pas encore. Ce choix elimine toute une categorie de vulnerabilites : fuite de mots de passe, brute force, phishing, credential stuffing. Ce tutoriel explique comment cela fonctionne, comment le configurer, et comment gerer les roles et les acces.

## Pourquoi les Passkeys ?

Les mots de passe sont le maillon faible de la securite web. Selon les rapports de Verizon, plus de 80% des breches de securite impliquent des identifiants compromis. Les Passkeys resolvent ce probleme fondamentalement :

- **Pas de secret partage** : la cle privee ne quitte jamais votre appareil
- **Resistance au phishing** : la cle est liee au domaine d'origine, impossible de l'utiliser sur un faux site
- **Pas de base de mots de passe a proteger** : rien a voler cote serveur
- **Experience utilisateur fluide** : un toucher biometrique remplace la saisie d'un mot de passe

## Comment fonctionne WebAuthn/Passkeys

Le protocole WebAuthn (Web Authentication) utilise la cryptographie asymetrique. Voici le flux simplifie :

### Enregistrement (premiere connexion)

```
Utilisateur          Navigateur          EmDash Server
    │                    │                     │
    │  Cliquer           │                     │
    │  "Creer un         │                     │
    │   compte"          │                     │
    │───────────────────>│                     │
    │                    │  Demande challenge   │
    │                    │────────────────────>│
    │                    │  Challenge aleatoire │
    │                    │<────────────────────│
    │  Verification      │                     │
    │  biometrique       │                     │
    │  (Face ID,         │                     │
    │   empreinte)       │                     │
    │<──────────────────>│                     │
    │                    │  Cle publique +      │
    │                    │  signature           │
    │                    │────────────────────>│
    │                    │  Compte cree         │
    │                    │  Session active      │
    │                    │<────────────────────│
```

Le serveur EmDash ne stocke que la **cle publique**. La **cle privee** reste dans le Secure Enclave de votre appareil (TPM, Secure Element, iCloud Keychain, etc.).

### Connexion (authentification)

```
Utilisateur          Navigateur          EmDash Server
    │                    │                     │
    │  Cliquer           │                     │
    │  "Se connecter"    │                     │
    │───────────────────>│                     │
    │                    │  Demande challenge   │
    │                    │────────────────────>│
    │                    │  Challenge aleatoire │
    │                    │<────────────────────│
    │  Verification      │                     │
    │  biometrique       │                     │
    │<──────────────────>│                     │
    │                    │  Signature du        │
    │                    │  challenge           │
    │                    │────────────────────>│
    │                    │  Verification        │
    │                    │  signature avec      │
    │                    │  cle publique        │
    │                    │  -> Session active   │
    │                    │<────────────────────│
```

La verification ne prend que quelques millisecondes. Aucun mot de passe ne transite sur le reseau.

## Configuration des Passkeys dans EmDash

Par defaut, EmDash est deja configure pour utiliser les Passkeys. Voici la configuration dans `emdash.config.ts` :

```typescript
// emdash.config.ts
import { defineEmDashConfig } from '@emdash/core';

export default defineEmDashConfig({
  auth: {
    // Methode principale
    provider: 'passkeys',

    // Nom affiche dans la boite de dialogue WebAuthn
    rpName: 'Mon Blog EmDash',

    // Domaine (important : doit correspondre au domaine de deploiement)
    rpId: 'mon-blog.example.com',

    // Origines autorisees (HTTPS obligatoire en production)
    origins: [
      'https://mon-blog.example.com',
      'http://localhost:4321', // Developpement
    ],

    // Type d'authentificateur accepte
    authenticatorSelection: {
      // 'platform' : uniquement les authentificateurs integres (Face ID, Windows Hello)
      // 'cross-platform' : aussi les cles de securite USB (YubiKey)
      // undefined : les deux
      authenticatorAttachment: undefined,

      // Exiger la verification utilisateur (biometrie)
      userVerification: 'preferred',

      // Permettre les passkeys synchonisables (iCloud, Google Password Manager)
      residentKey: 'preferred',
    },

    // Duree de la session
    sessionDuration: 7 * 24 * 60 * 60, // 7 jours en secondes

    // Methode de fallback si WebAuthn n'est pas disponible
    fallback: 'magic-link',
  },
});
```

### Gestion multi-appareils

Un utilisateur peut enregistrer plusieurs Passkeys (une par appareil). Dans le panneau d'administration, chaque utilisateur peut gerer ses Passkeys depuis **Profil > Securite** :

- Voir la liste des Passkeys enregistrees (avec le nom de l'appareil et la date d'ajout)
- Ajouter une nouvelle Passkey
- Supprimer une Passkey existante

Si un utilisateur perd tous ses appareils, un administrateur peut reinitialiser ses methodes d'authentification depuis le panneau de gestion des utilisateurs.

## Solutions de repli

### Magic Links (liens magiques)

Pour les navigateurs ou appareils sans support WebAuthn, EmDash peut envoyer un lien de connexion par email :

```typescript
auth: {
  fallback: 'magic-link',
  magicLink: {
    // Duree de validite du lien (en secondes)
    expiresIn: 10 * 60, // 10 minutes

    // Service d'envoi d'email
    emailProvider: 'resend', // ou 'sendgrid', 'ses', 'smtp'
    emailFrom: 'noreply@mon-blog.example.com',
  },
},
```

Configuration du provider email (exemple avec Resend) :

```typescript
// emdash.config.ts
export default defineEmDashConfig({
  email: {
    provider: 'resend',
    apiKey: process.env.RESEND_API_KEY,
  },
});
```

Le lien magique contient un token unique a usage unique, signe cryptographiquement et lie a l'adresse email. Il expire apres 10 minutes.

### OAuth (fournisseurs tiers)

EmDash supporte l'authentification via des fournisseurs OAuth 2.0 :

```typescript
auth: {
  fallback: 'oauth',
  oauth: {
    providers: [
      {
        name: 'github',
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        // Mapper les roles GitHub vers les roles EmDash
        roleMapping: {
          // Les membres de l'organisation GitHub "mon-org" avec le role "admin"
          // obtiennent le role "administrator" dans EmDash
          'org:mon-org:admin': 'administrator',
          'org:mon-org:member': 'editor',
        },
      },
      {
        name: 'google',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // Restreindre aux emails d'un domaine
        allowedDomains: ['mon-entreprise.com'],
      },
    ],
  },
},
```

## Roles et permissions

EmDash utilise un systeme de roles hierarchique avec quatre niveaux :

### Administrateur (`administrator`)

Acces total au systeme :

- Gerer tous les contenus (CRUD sur toutes les collections)
- Gerer les utilisateurs et leurs roles
- Modifier les schemas de contenu
- Installer/desinstaller des plugins
- Configurer les parametres du site
- Acceder aux logs et aux metriques

### Editeur (`editor`)

Gestion editoriale complete :

- Creer, modifier et supprimer tous les contenus
- Publier et depublier des contenus
- Gerer la bibliotheque media
- Moderer les contenus soumis pour revision
- Pas d'acces aux parametres systeme, utilisateurs ou plugins

### Auteur (`author`)

Gestion de ses propres contenus :

- Creer et modifier ses propres contenus
- Soumettre pour revision ou publier ses contenus
- Gerer ses propres medias
- Pas de modification des contenus d'autrui

### Contributeur (`contributor`)

Participation limitee :

- Creer des brouillons
- Soumettre des contenus pour revision
- Pas de publication directe
- Pas d'acces a la bibliotheque media

### Verifier les permissions dans le code

Cote Astro, vous pouvez verifier les permissions de l'utilisateur connecte :

```astro
---
// src/pages/admin/custom-page.astro
import { getEmDashSession } from '@emdash/astro';

const session = await getEmDashSession(Astro.request);

if (!session) {
  return Astro.redirect('/_emdash/admin/login');
}

if (!session.user.hasPermission('content:write')) {
  return new Response('Acces refuse', { status: 403 });
}

const user = session.user;
---

<p>Connecte en tant que : {user.name} ({user.role})</p>
```

## Configuration SSO (Single Sign-On)

Pour les organisations, EmDash supporte le SSO via SAML 2.0 et OpenID Connect :

```typescript
auth: {
  sso: {
    enabled: true,
    protocol: 'oidc', // ou 'saml'

    // Configuration OpenID Connect
    oidc: {
      issuer: 'https://login.microsoftonline.com/votre-tenant/v2.0',
      clientId: process.env.OIDC_CLIENT_ID,
      clientSecret: process.env.OIDC_CLIENT_SECRET,
      scopes: ['openid', 'profile', 'email'],

      // Mapper les claims OIDC vers les roles EmDash
      rolesClaim: 'roles',
      roleMapping: {
        'CMS.Admin': 'administrator',
        'CMS.Editor': 'editor',
        'CMS.Author': 'author',
      },
    },

    // Forcer le SSO (desactiver les autres methodes)
    enforced: false,

    // Creer automatiquement les comptes au premier login SSO
    autoProvision: true,
  },
},
```

### SSO avec Azure AD (Entra ID)

Configuration typique pour une organisation Microsoft :

1. Dans Azure AD, enregistrez une nouvelle application
2. Ajoutez l'URI de redirection : `https://mon-blog.example.com/_emdash/auth/callback`
3. Creez un secret client
4. Configurez les roles applicatifs (CMS.Admin, CMS.Editor, etc.)
5. Assignez les roles aux utilisateurs ou groupes

### SSO avec Google Workspace

```typescript
oidc: {
  issuer: 'https://accounts.google.com',
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  scopes: ['openid', 'profile', 'email'],
  // Restreindre au domaine de l'organisation
  hostedDomain: 'mon-entreprise.com',
},
```

## Bonnes pratiques de securite

1. **Activez toujours HTTPS en production.** WebAuthn refuse de fonctionner sur HTTP (sauf localhost). [Cloudflare fournit HTTPS automatiquement](/tutoriels/deployer-cloudflare).

2. **Limitez les origines autorisees.** Ne laissez pas `*` dans le tableau `origins`. Listez explicitement chaque domaine autorise.

3. **Utilisez des sessions courtes pour les administrateurs.** Configurez une duree de session plus courte pour les comptes sensibles :

```typescript
sessionDuration: 2 * 60 * 60, // 2 heures pour les admins
```

4. **Auditez les connexions.** EmDash log chaque connexion et tentative echouee. Consultez les logs dans **Parametres > Securite > Journal d'audit**.

5. **Exigez les Passkeys pour les administrateurs.** Desactivez les fallbacks pour les comptes a haut privilege :

```typescript
auth: {
  requirePasskeysForRoles: ['administrator'],
},
```

## Prochaines etapes

L'authentification par Passkeys est l'une des innovations les plus importantes d'EmDash. Elle simplifie l'experience utilisateur tout en renforçant drastiquement la securite. Le prochain tutoriel explore l'[API REST d'EmDash](/tutoriels/api-rest-emdash), qui utilise cette meme authentification pour les acces programmatiques.

## Pour aller plus loin

- [5 raisons d'essayer EmDash](/articles/pourquoi-emdash) --- les Passkeys sont l'une des innovations cles
- [Securite des plugins EmDash](/guides/securite-plugins) --- comprendre le modele de securite global
- [Architecture d'EmDash](/guides/architecture-emdash) --- comment l'authentification s'integre dans l'architecture
- [Deployer EmDash sur Cloudflare](/tutoriels/deployer-cloudflare) --- configurer HTTPS et les sessions KV en production
