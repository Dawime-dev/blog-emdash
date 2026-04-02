---
title: "Deployer EmDash sur Cloudflare Workers"
description: "Guide complet pour deployer votre site EmDash sur Cloudflare Workers avec D1, R2 et KV. Configuration wrangler, bindings et deploiement."
date: "2026-04-02"
author: "Equipe EmDash FR"
category: "Deploiement"
tags: ["emdash", "cloudflare", "workers", "d1", "r2", "kv", "deploiement"]
difficulty: "intermediaire"
duration: "20 min"
---

# Deployer EmDash sur Cloudflare Workers

[EmDash](/articles/emdash-presentation) a ete concu pour Cloudflare des le premier jour. Deployer sur Workers signifie que votre CMS tourne au plus proche de vos visiteurs, sur plus de 300 data centers a travers le monde, avec une latence inferieure a 50ms pour la majorite des utilisateurs. Ce tutoriel vous guide pas a pas dans le processus complet.

## Architecture sur Cloudflare

Avant de commencer, comprenons comment les services Cloudflare s'articulent :

```
┌─────────────────────────────────────────────┐
│              Cloudflare Workers              │
│         (Astro SSR + EmDash Core)           │
├──────────┬──────────────┬───────────────────┤
│    D1    │      R2      │        KV         │
│ Database │ Media Storage│    Sessions       │
│ (SQLite) │ (S3-compat)  │  (Key-Value)     │
└──────────┴──────────────┴───────────────────┘
```

- **Workers** : execute votre application Astro + EmDash en mode SSR
- **D1** : base de donnees SQLite distribuee pour le contenu
- **R2** : stockage objet pour les images et fichiers media
- **KV** : stockage cle-valeur pour les sessions utilisateur et le cache

Tous ces services disposent d'un tier gratuit genereux : D1 offre 5 Go de stockage et 5 millions de lectures/jour, R2 offre 10 Go de stockage et 10 millions de requetes de lecture/mois, et KV offre 100 000 lectures/jour.

## Prerequis

1. Un **compte Cloudflare** (gratuit : [dash.cloudflare.com](https://dash.cloudflare.com))
2. **Wrangler CLI** installe globalement (voir aussi le [CLI EmDash](/guides/cli-emdash)) :

```bash
npm install -g wrangler@latest
wrangler --version
# wrangler 3.x.x
```

3. Connectez-vous a votre compte :

```bash
wrangler login
```

Cela ouvrira votre navigateur pour autoriser Wrangler.

## Etape 1 : Creer les ressources Cloudflare

### Creer la base de donnees D1

```bash
wrangler d1 create emdash-db
```

Notez l'identifiant retourne :

```
✅ Successfully created DB 'emdash-db'
database_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

### Creer le bucket R2

```bash
wrangler r2 bucket create emdash-media
```

### Creer le namespace KV

```bash
wrangler kv namespace create EMDASH_SESSIONS
```

Notez egalement l'identifiant :

```
✅ Successfully created KV namespace "EMDASH_SESSIONS"
id = "f1e2d3c4b5a6978800112233"
```

## Etape 2 : Configurer wrangler.toml

Creez ou modifiez le fichier `wrangler.toml` a la racine de votre projet :

```toml
name = "mon-blog-emdash"
main = "./dist/_worker.js"
compatibility_date = "2026-03-15"
compatibility_flags = ["nodejs_compat"]

# Necessaire pour Astro SSR sur Workers
[assets]
directory = "./dist/client"

# Base de donnees D1
[[d1_databases]]
binding = "EMDASH_DB"
database_name = "emdash-db"
database_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"

# Stockage media R2
[[r2_buckets]]
binding = "EMDASH_MEDIA"
bucket_name = "emdash-media"

# Sessions KV
[[kv_namespaces]]
binding = "EMDASH_SESSIONS"
id = "f1e2d3c4b5a6978800112233"

# Variables d'environnement
[vars]
EMDASH_SITE_URL = "https://mon-blog.example.com"

# Cron trigger pour la publication programmee
[triggers]
crons = ["*/5 * * * *"]
```

Remplacez les identifiants par ceux obtenus lors de la creation des ressources.

### Secrets

Certaines valeurs sensibles ne doivent pas figurer dans `wrangler.toml`. Utilisez les secrets Wrangler :

```bash
# Cle de chiffrement des sessions
wrangler secret put EMDASH_SESSION_SECRET
# Entrez une chaine aleatoire de 32+ caracteres

# Cle API pour les webhooks (optionnel)
wrangler secret put EMDASH_WEBHOOK_SECRET
```

## Etape 3 : Configurer EmDash pour Cloudflare

Mettez a jour `astro.config.mjs` pour utiliser l'adaptateur Cloudflare :

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import emdash from '@emdash/astro';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true, // Permet d'acceder aux bindings en dev
    },
  }),

  integrations: [
    emdash({
      adapter: 'cloudflare',

      // EmDash detecte automatiquement les bindings depuis wrangler.toml
      // Mais vous pouvez les specifier explicitement :
      cloudflare: {
        d1Binding: 'EMDASH_DB',
        r2Binding: 'EMDASH_MEDIA',
        kvBinding: 'EMDASH_SESSIONS',
      },

      api: {
        enabled: true,
        basePath: '/_emdash/api',
      },

      auth: {
        provider: 'passkeys',
        fallback: 'magic-link',
      },

      media: {
        adapter: 'r2',
        maxFileSize: '25mb',
        allowedTypes: ['image/*', 'application/pdf', 'video/mp4'],
        // Transformation d'images via Cloudflare Images (optionnel)
        transform: {
          enabled: true,
          widths: [320, 640, 960, 1280, 1920],
          formats: ['webp', 'avif'],
        },
      },
    }),
  ],
});
```

Installez l'adaptateur Cloudflare si ce n'est pas deja fait :

```bash
npm install @astrojs/cloudflare
```

## Etape 4 : Developper en local avec les bindings Cloudflare

Grace a `platformProxy`, vous pouvez utiliser D1, R2 et KV en local pendant le developpement :

```bash
npm run dev
```

Wrangler cree automatiquement des bases de donnees locales simulant les services Cloudflare. Les donnees de developpement sont stockees dans `.wrangler/state/`.

Pour verifier que les bindings fonctionnent :

```bash
# Lister les tables D1 en local
wrangler d1 execute emdash-db --local --command "SELECT name FROM sqlite_master WHERE type='table'"
```

## Etape 5 : Appliquer les migrations D1

EmDash genere automatiquement les migrations SQL. Avant le premier deploiement, appliquez-les sur D1 :

```bash
# Generer les migrations depuis votre schema EmDash
npx emdash migrations:generate

# Les fichiers sont crees dans migrations/
ls migrations/
# 0001_initial_schema.sql
# 0002_create_ec_posts.sql
# 0003_create_ec_pages.sql

# Appliquer en local pour tester
wrangler d1 migrations apply emdash-db --local

# Appliquer en production (remote)
wrangler d1 migrations apply emdash-db --remote
```

## Etape 6 : Build et deploiement

### Build du projet

```bash
npm run build
```

Astro genere le Worker dans `dist/_worker.js` et les fichiers statiques dans `dist/client/`.

### Deployer sur Cloudflare

```bash
wrangler deploy
```

Vous verrez :

```
 Published mon-blog-emdash (4.2s)
  https://mon-blog-emdash.votre-sous-domaine.workers.dev

  Current Version ID: abc123-def456
```

Votre site est maintenant accessible sur l'URL Workers. Rendez-vous sur `https://mon-blog-emdash.votre-sous-domaine.workers.dev/_emdash/admin` pour creer votre premier compte administrateur.

### Deploiement via le bouton Deploy

EmDash propose egalement un bouton de deploiement en un clic. Depuis le depot GitHub d'EmDash, cliquez sur **Deploy to Cloudflare Workers**. Cette methode :

1. Fork le template dans votre compte GitHub
2. Cree automatiquement la base D1, le bucket R2 et le namespace KV
3. Configure les bindings dans `wrangler.toml`
4. Deploie via Cloudflare Pages/Workers

C'est la methode la plus simple pour les debutants.

## Configurer un domaine personnalise

Par defaut, votre site est accessible via `*.workers.dev`. Pour utiliser votre propre domaine :

1. Ajoutez votre domaine a Cloudflare (DNS)
2. Dans le dashboard Cloudflare, allez dans **Workers & Pages > votre worker > Settings > Domains & Routes**
3. Ajoutez votre domaine : `mon-blog.example.com`

Ou via la CLI :

```bash
wrangler deploy --route "mon-blog.example.com/*"
```

Mettez a jour la variable `EMDASH_SITE_URL` dans `wrangler.toml` :

```toml
[vars]
EMDASH_SITE_URL = "https://mon-blog.example.com"
```

## CI/CD avec GitHub Actions

Pour un deploiement automatique a chaque push :

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci
      - run: npm run build

      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: deploy
```

Creez un token API Cloudflare avec les permissions **Workers Scripts:Edit**, **D1:Edit**, **R2:Edit**, et ajoutez-le en secret GitHub sous le nom `CLOUDFLARE_API_TOKEN`.

## Surveiller votre deploiement

### Logs en temps reel

```bash
wrangler tail
```

Cette commande streame les logs de votre Worker en temps reel. Utile pour deboguer les erreurs en production.

### Metriques

Dans le dashboard Cloudflare, accedez a **Workers & Pages > votre worker > Metrics** pour voir :

- Nombre de requetes par periode
- Temps de reponse (P50, P95, P99)
- Taux d'erreur
- Consommation CPU

## Depannage courant

**Erreur "Worker exceeded CPU time limit" :**
Les Workers ont une limite de 10ms de CPU par requete (plan gratuit) ou 30ms (plan payant). Optimisez vos requetes D1 et evitez les traitements lourds dans le Worker. EmDash est concu pour rester sous ces limites, mais des plugins mal optimises peuvent causer des depassements.

**Erreur "D1_ERROR: no such table" :**
Les migrations n'ont pas ete appliquees sur D1. Lancez `wrangler d1 migrations apply emdash-db --remote`.

**Les images ne s'affichent pas :**
Verifiez que le binding R2 est correctement configure et que les images ont ete uploadees via l'admin EmDash (pas directement dans R2).

**Les sessions expirent trop vite :**
Par defaut, les sessions KV expirent apres 24 heures. Modifiez la duree dans `emdash.config.ts` :

```typescript
export default defineEmDashConfig({
  auth: {
    sessionDuration: 7 * 24 * 60 * 60, // 7 jours en secondes
  },
});
```

## Prochaines etapes

Votre site EmDash est maintenant deploye et accessible au monde entier sur l'edge Cloudflare. Dans le prochain tutoriel, nous verrons comment [creer un theme EmDash](/tutoriels/creer-theme-emdash) complet avec des pages, des layouts et des composants Astro personnalises.

## Pour aller plus loin

- [Installer EmDash](/tutoriels/installer-emdash) --- le prerequis si vous n'avez pas encore de projet
- [Ecosysteme Cloudflare et EmDash](/dossiers/ecosysteme-cloudflare-emdash) --- comprendre D1, R2, KV et Workers en profondeur
- [EmDash en production](/dossiers/emdash-production) --- checklist complète pour la mise en production
- [Le CLI EmDash](/guides/cli-emdash) --- toutes les commandes disponibles pour gerer votre projet
