---
title: "Installer EmDash : votre premier site en 5 minutes"
description: "Guide pas a pas pour installer EmDash, le CMS serverless open-source de Cloudflare base sur Astro 6.0. De la creation du projet au premier lancement du panneau d'administration."
date: "2026-04-02"
author: "Equipe EmDash FR"
category: "Installation"
tags: ["emdash", "installation", "astro", "cloudflare", "demarrage"]
difficulty: "debutant"
duration: "10 min"
---

# Installer EmDash : votre premier site en 5 minutes

[EmDash](/articles/emdash-presentation) est le nouveau CMS serverless open-source de Cloudflare, construit sur Astro 6.0. Contrairement aux CMS traditionnels qui necessitent un serveur, une base de donnees externe et une configuration complexe, EmDash fonctionne entierement sur l'edge de Cloudflare --- ou en local avec Node.js et SQLite. Dans ce tutoriel, nous allons installer EmDash de zero et lancer votre premier site.

## Prerequis

Avant de commencer, assurez-vous d'avoir installe :

- **Node.js 20** ou superieur (LTS recommande)
- **npm 10+** ou **pnpm 9+** (les deux fonctionnent parfaitement)
- Un editeur de code (VS Code avec l'extension Astro est ideal)
- Optionnel : un compte Cloudflare si vous souhaitez deployer sur Workers

Verifiez votre version de Node.js :

```bash
node --version
# v20.12.0 ou superieur
```

## Creer un nouveau projet EmDash

La methode la plus rapide est d'utiliser le [CLI officiel](/guides/cli-emdash). Ouvrez votre terminal et lancez :

```bash
npm create emdash@latest
```

Le CLI interactif va vous poser plusieurs questions. Voici ce que vous verrez :

```
 EmDash v0.1.0 - CMS Serverless

? Nom du projet : mon-blog
? Environnement cible :
  > Node.js (SQLite) - Developpement local
    Cloudflare (D1 + R2) - Production
? Theme de depart :
  > Starter Blog
    Starter Documentation
    Blank (aucun theme)
? Installer les dependances ? Oui
```

### Choix de l'environnement : Node.js vs Cloudflare

C'est la decision la plus importante lors de l'installation. Voici les differences concretes :

**Node.js (SQLite)** --- Ideal pour debuter :
- Base de donnees SQLite locale stockee dans `.emdash/data.db`
- Fichiers media enregistres dans `.emdash/uploads/`
- Sessions en memoire
- Aucun compte cloud necessaire
- Parfait pour le developpement et les tests

**Cloudflare (D1 + R2)** --- Pour la production :
- Base de donnees D1 (SQLite distribue sur l'edge)
- Stockage media sur R2 (compatible S3)
- Sessions sur KV (key-value distribue)
- Deploiement mondial en quelques secondes
- Necessite un compte Cloudflare (plan gratuit suffisant)

Pour ce tutoriel, nous choisissons **Node.js (SQLite)** pour demarrer rapidement. Le passage a Cloudflare se fait en changeant quelques lignes de configuration --- nous y reviendrons dans le tutoriel [Deployer EmDash sur Cloudflare Workers](/tutoriels/deployer-cloudflare).

## Structure du projet

Une fois l'installation terminee, voici la structure creee :

```
mon-blog/
├── astro.config.mjs        # Configuration Astro + EmDash
├── package.json
├── src/
│   ├── layouts/
│   │   └── Base.astro       # Layout principal
│   ├── pages/
│   │   ├── index.astro      # Page d'accueil
│   │   └── [...slug].astro  # Pages dynamiques
│   └── components/
│       ├── Header.astro
│       └── PostCard.astro
├── public/
│   └── favicon.svg
├── emdash.config.ts         # Configuration EmDash
└── .emdash/                 # Donnees locales (gitignore)
    ├── data.db              # Base SQLite
    └── uploads/             # Fichiers media
```

Le repertoire `.emdash/` est automatiquement ajoute a `.gitignore`. Il contient vos donnees locales et ne doit jamais etre commite.

## Configuration d'Astro avec EmDash

Le fichier `astro.config.mjs` est le coeur de la configuration. Voici ce qu'il contient par defaut :

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import emdash from '@emdash/astro';

export default defineConfig({
  integrations: [
    emdash({
      // Adaptateur : 'node' pour le dev local, 'cloudflare' pour la prod
      adapter: 'node',

      // Chemin du panneau d'administration
      adminPath: '/_emdash/admin',

      // Activer l'API REST
      api: {
        enabled: true,
        basePath: '/_emdash/api',
      },

      // Authentification
      auth: {
        provider: 'passkeys',
        // Magic link en fallback pour les navigateurs sans WebAuthn
        fallback: 'magic-link',
      },

      // Stockage media
      media: {
        adapter: 'local',
        maxFileSize: '10mb',
        allowedTypes: ['image/*', 'application/pdf'],
      },
    }),
  ],
});
```

### Options de configuration importantes

Le fichier `emdash.config.ts` permet une configuration plus fine :

```typescript
// emdash.config.ts
import { defineEmDashConfig } from '@emdash/core';

export default defineEmDashConfig({
  // Nom affiche dans le panneau d'administration
  siteName: 'Mon Blog',

  // Langue par defaut
  defaultLocale: 'fr',

  // Locales supportees (vide = pas de multi-langue)
  locales: ['fr'],

  // Nombre d'elements par page dans l'API
  defaultPageSize: 20,

  // Activer le mode brouillon
  drafts: true,

  // Publication programmee
  scheduledPublishing: true,
});
```

## Premier lancement

Tout est pret. Lancez le serveur de developpement :

```bash
cd mon-blog
npm run dev
```

Vous verrez dans votre terminal :

```
 astro  v6.0.0 ready in 1.2s

┃ Local    http://localhost:4321/
┃ Network  http://192.168.1.42:4321/

 emdash  v0.1.0 loaded
┃ Admin    http://localhost:4321/_emdash/admin
┃ API      http://localhost:4321/_emdash/api
┃ Database SQLite (.emdash/data.db)
```

### Acceder au panneau d'administration

Ouvrez votre navigateur et rendez-vous sur `http://localhost:4321/_emdash/admin`. Lors du premier acces, EmDash vous demandera de creer un compte administrateur.

Comme EmDash utilise les [Passkeys](/tutoriels/authentification-passkeys) par defaut, votre navigateur vous proposera d'enregistrer une cle d'acces biometrique (empreinte digitale, Face ID, Windows Hello). Si votre navigateur ne supporte pas WebAuthn, un lien magique par email sera utilise en fallback.

Une fois connecte, vous decouvrez le tableau de bord EmDash :

- **Contenu** --- Gerer vos articles, pages et types de contenu personnalises
- **Media** --- Bibliotheque de fichiers avec drag-and-drop
- **Apparence** --- Gestion du theme actif
- **Plugins** --- Marketplace et plugins installes
- **Parametres** --- Configuration generale, utilisateurs, SEO

## Commandes utiles

Voici les commandes npm disponibles dans votre projet :

```bash
# Lancer le serveur de developpement
npm run dev

# Construire pour la production
npm run build

# Previsualiser le build de production localement
npm run preview

# Exporter le contenu de la base de donnees en JSON
npx emdash export --output ./backup.json

# Importer du contenu depuis un fichier JSON
npx emdash import ./backup.json

# Reinitialiser la base de donnees (attention : supprime tout)
npx emdash reset --confirm
```

## Verifier que tout fonctionne

Pour confirmer que votre installation est operationnelle, testez l'API REST :

```bash
curl http://localhost:4321/_emdash/api/health
```

Reponse attendue :

```json
{
  "success": true,
  "data": {
    "version": "0.1.0",
    "adapter": "node",
    "database": "sqlite",
    "uptime": 42
  }
}
```

## Conseils et depannage

**Le port 4321 est deja utilise :**
Ajoutez `--port 3000` a la commande dev, ou modifiez `astro.config.mjs` :

```javascript
export default defineConfig({
  server: { port: 3000 },
  // ...
});
```

**Erreur "Cannot find module @emdash/astro" :**
Assurez-vous d'avoir lance `npm install` dans le repertoire du projet. Si l'erreur persiste, supprimez `node_modules` et `package-lock.json`, puis relancez l'installation.

**La base de donnees SQLite est corrompue :**
Supprimez `.emdash/data.db` et relancez le serveur. EmDash recreera automatiquement les tables. Attention : vous perdrez tout le contenu local.

**Les passkeys ne fonctionnent pas en HTTP :**
WebAuthn exige un contexte securise. En developpement, `localhost` est considere comme securise, mais si vous accedez via une adresse IP reseau, utilisez HTTPS avec un certificat local (mkcert est recommande).

## Prochaines etapes

Votre installation EmDash est prete. Dans le prochain tutoriel, nous verrons comment [creer votre premier contenu](/tutoriels/premier-contenu) en utilisant le constructeur de schemas visuel et l'editeur Portable Text. Vous apprendrez a definir des collections, ajouter des champs personnalises et publier votre premier article.

## Pour aller plus loin

- [Creer votre premier contenu avec EmDash](/tutoriels/premier-contenu) --- l'etape suivante apres l'installation
- [Deployer EmDash sur Cloudflare Workers](/tutoriels/deployer-cloudflare) --- passer en production sur l'edge mondial
- [Creer un theme EmDash de A a Z](/tutoriels/creer-theme-emdash) --- personnaliser l'apparence de votre site
- [Qu'est-ce qu'EmDash ? Presentation complete](/articles/emdash-presentation) --- comprendre la vision et l'architecture du projet
