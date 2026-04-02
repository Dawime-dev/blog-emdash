---
title: "Mettre EmDash en production : le guide definitif"
description: "Guide complet pour deployer EmDash en production : checklist, deploiement Cloudflare, monitoring, sauvegardes D1, performances et securite."
date: "2026-04-02"
author: "Equipe EmDash FR"
category: "Production"
tags: ["emdash", "production", "deploiement", "cloudflare", "performance", "securite"]
---

# Mettre EmDash en production : le guide definitif

Votre site EmDash fonctionne parfaitement en local. Les articles sont rediges, le theme est personnalise, les plugins sont configures. Il est temps de passer en production. Ce guide couvre chaque etape, de la checklist pre-deploiement jusqu'au monitoring continu, en passant par l'optimisation des performances et le durcissement securitaire.

## Checklist pre-production

Avant de deployer, verifiez methodiquement chaque point :

### Contenu
- [ ] Tous les articles de lancement sont relus et publies
- [ ] Les images sont optimisees (format WebP/AVIF, dimensions adaptees)
- [ ] Les liens internes sont valides (pas de 404)
- [ ] Les metadonnees SEO sont renseignees (title, description, Open Graph)
- [ ] Le sitemap XML est genere correctement
- [ ] Le fichier robots.txt est configure
- [ ] Le flux RSS est fonctionnel

### Configuration
- [ ] Les variables d'environnement de production sont definies
- [ ] Les secrets (cles API, tokens) sont stockes dans Cloudflare Secrets
- [ ] Le domaine personnalise est configure
- [ ] Le certificat SSL est actif (automatique avec Cloudflare)
- [ ] Les redirections sont en place
- [ ] La configuration CORS est correcte

### Fonctionnel
- [ ] Les formulaires envoient correctement les emails
- [ ] Le systeme de commentaires fonctionne
- [ ] La recherche retourne des resultats pertinents
- [ ] Le mode sombre/clair fonctionne
- [ ] Le site est responsive sur mobile, tablette et desktop
- [ ] L'accessibilite est validee (score axe-core sans erreur critique)

## Deploiement sur Cloudflare

### Architecture de production

En production, EmDash s'appuie sur l'[ecosysteme Cloudflare](/dossiers/ecosysteme-cloudflare-emdash) :

```
Internet
    │
    ▼
Cloudflare CDN (cache + WAF)
    │
    ▼
Cloudflare Workers (SSR EmDash)
    │
    ├── D1 (base de donnees SQLite distribuee)
    ├── R2 (stockage objets pour les medias)
    ├── KV (cache et sessions)
    └── Queues (taches asynchrones)
```

### Configuration `wrangler.toml`

Le fichier `wrangler.toml` definit la configuration de deploiement :

```toml
name = "mon-site-emdash"
main = "dist/_worker.js"
compatibility_date = "2026-03-01"

[site]
bucket = "dist/client"

[[d1_databases]]
binding = "DB"
database_name = "emdash-production"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

[[r2_buckets]]
binding = "MEDIA"
bucket_name = "emdash-media-prod"

[[kv_namespaces]]
binding = "CACHE"
id = "xxxxxxxx"

[[queues.producers]]
queue = "emdash-tasks"
binding = "TASKS"

[vars]
EMDASH_ENV = "production"
SITE_URL = "https://monsite.fr"
```

### Deploiement

```bash
# Build du projet
npm run build

# Deploiement vers Cloudflare
npx wrangler deploy

# Ou via le script npm
npm run deploy
```

### CI/CD avec GitHub Actions

Automatisez le deploiement avec GitHub Actions :

```yaml
name: Deploy to Cloudflare
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
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

Chaque push sur `main` declenche automatiquement un nouveau deploiement. Cloudflare Workers supporte les deployments atomiques : le basculement est instantane et sans interruption de service.

## Monitoring et observabilite

### Cloudflare Analytics

Cloudflare fournit des analytics integrees sans JavaScript supplementaire :
- Nombre de requetes et visiteurs uniques
- Repartition geographique
- Taux de cache hit
- Erreurs HTTP (4xx, 5xx)
- Performances (temps de reponse)

### Workers Analytics Engine

Pour un monitoring plus detaille, utilisez Workers Analytics Engine pour enregistrer des metriques personnalisees :

```typescript
// Dans votre middleware EmDash
context.analytics.writeDataPoint({
  blobs: [request.url, request.method],
  doubles: [responseTime],
  indexes: ['page-view'],
});
```

### Alertes

Configurez des alertes Cloudflare pour etre notifie en cas de :
- Pic d'erreurs 5xx
- Augmentation anormale du trafic (potentielle attaque)
- Base de donnees D1 proche des limites
- Stockage R2 proche du quota

### Integration avec des outils externes

Combinez le plugin [Webhook Notifier](/plugins/plugin-webhook-notifier) avec un service de monitoring pour des alertes avancees. Envoyez les evenements EmDash vers Datadog, Grafana Cloud ou un simple endpoint de healthcheck.

## Strategies de sauvegarde

### Sauvegarde D1

Cloudflare D1 propose des sauvegardes automatiques avec point-in-time recovery. En complement, mettez en place des exports reguliers :

```bash
# Export manuel de la base de donnees
npx wrangler d1 export emdash-production --output backup.sql

# Script de sauvegarde automatique (a planifier via cron)
#!/bin/bash
DATE=$(date +%Y%m%d)
npx wrangler d1 export emdash-production --output "backups/emdash-${DATE}.sql"
```

### Sauvegarde R2

Les fichiers dans R2 sont durables par conception (11 neufs de durabilite). Pour une protection supplementaire, configurez une replication vers un bucket S3 compatible ou un stockage local :

```bash
# Synchroniser R2 vers un backup local
npx wrangler r2 object list emdash-media-prod | \
  xargs -I {} npx wrangler r2 object get emdash-media-prod/{} --file backups/media/{}
```

### Sauvegarde du code

Le code source doit etre versionne dans Git. Assurez-vous que votre depot est sauvegarde (GitHub, GitLab, Bitbucket). Le fichier `emdash.config.ts` et les fichiers seed constituent la "source de verite" de votre structure de contenu.

### Strategie de retention

Definissez une politique de retention claire :
- Sauvegardes quotidiennes : conservees 30 jours
- Sauvegardes hebdomadaires : conservees 3 mois
- Sauvegardes mensuelles : conservees 1 an

## Optimisation des performances

### Cache Cloudflare

Configurez le cache Cloudflare pour maximiser les performances :

```typescript
// Dans astro.config.mjs
export default defineConfig({
  output: 'hybrid', // Pages statiques par defaut, SSR a la demande
  adapter: cloudflare({
    cacheControl: {
      // Pages statiques : cache long
      static: 'public, max-age=31536000, immutable',
      // Pages dynamiques : cache court avec revalidation
      dynamic: 'public, max-age=60, stale-while-revalidate=300',
    },
  }),
});
```

### Optimisation des images

Utilisez Cloudflare Images ou le transformateur d'images integre pour servir des images optimisees :
- Format WebP/AVIF automatique selon le navigateur
- Redimensionnement a la volee
- Lazy loading natif
- Attributs `width` et `height` pour eviter le layout shift

### Prefetch et preconnect

Ajoutez des hints de navigation dans le layout :

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="dns-prefetch" href="https://analytics.example.com" />
```

Astro gere le prefetch des liens internes automatiquement avec la directive `prefetch`.

### Core Web Vitals

Surveillez les Core Web Vitals avec Cloudflare Web Analytics ou Google Search Console :
- **LCP** (Largest Contentful Paint) : visez moins de 2.5 secondes
- **INP** (Interaction to Next Paint) : visez moins de 200 ms
- **CLS** (Cumulative Layout Shift) : visez moins de 0.1

## Durcissement securitaire

### Headers de securite

Configurez les headers HTTP de securite dans votre middleware :

```typescript
// Security headers
response.headers.set('X-Content-Type-Options', 'nosniff');
response.headers.set('X-Frame-Options', 'DENY');
response.headers.set('X-XSS-Protection', '0');
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
response.headers.set(
  'Content-Security-Policy',
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
);
```

### Rate limiting

Activez le rate limiting de Cloudflare pour proteger l'API d'administration et les endpoints de soumission de formulaires. Configurez des regles specifiques :
- API d'administration : 100 requetes par minute par IP
- Soumission de formulaire : 5 requetes par minute par IP
- Soumission de commentaire : 3 requetes par minute par IP

### WAF (Web Application Firewall)

Le WAF de Cloudflare est active par defaut. Configurez des regles supplementaires pour :
- Bloquer les pays non pertinents pour votre audience
- Bloquer les bots connus
- Proteger les endpoints sensibles (/admin, /api)

### Authentification de l'administration

L'administration EmDash est protegee par [authentification par passkeys](/tutoriels/authentification-passkeys). Renforcez-la avec :
- Mots de passe forts (minimum 16 caracteres)
- Authentification a deux facteurs (2FA)
- Sessions avec expiration courte (4 heures)
- Restriction d'acces par IP si votre equipe est localisee

### Audit des secrets

Verifiez regulierement que :
- Aucun secret n'est commite dans le depot Git
- Les cles API ont des permissions minimales
- Les tokens d'acces sont renouveles regulierement
- Les variables d'environnement de production sont distinctes de celles de developpement

## Maintenance continue

### Mises a jour

Surveillez les nouvelles versions d'EmDash et de vos plugins. Appliquez les mises a jour de securite dans les 48 heures. Testez les mises a jour majeures dans un environnement de staging avant de les deployer en production.

### Monitoring quotidien

Prenez l'habitude de verifier quotidiennement :
- Les erreurs dans le dashboard Cloudflare
- La file de moderation des commentaires
- Les soumissions de formulaires
- Les performances (Core Web Vitals)

### Revision trimestrielle

Tous les trimestres, passez en revue :
- Les metriques de performance et d'audience
- Les sauvegardes (testez une restauration)
- Les secrets et tokens (renouvellement)
- Les plugins (desactivez ceux qui ne sont plus utilises)
- Les couts Cloudflare

## Notre conclusion

Mettre EmDash en production est un processus methodique qui merite une attention rigoureuse. L'ecosysteme Cloudflare simplifie considerablement le deploiement et l'exploitation, mais il ne dispense pas d'une configuration soignee, d'un monitoring actif et d'une strategie de sauvegarde robuste. En suivant ce guide, vous disposerez d'un site performant, securise et facile a maintenir dans la duree. Le [CLI EmDash](/guides/cli-emdash) sera votre outil principal pour gerer les deploiements et la maintenance.

## Pour aller plus loin

- [Deployer sur Cloudflare pas a pas](/tutoriels/deployer-cloudflare) -- le tutoriel de deploiement detaille
- [EmDash et l'ecosysteme Cloudflare](/dossiers/ecosysteme-cloudflare-emdash) -- comprendre chaque service Cloudflare utilise
- [Securite des plugins](/guides/securite-plugins) -- securiser votre site en production
- [Authentification par passkeys](/tutoriels/authentification-passkeys) -- configurer l'authentification securisee
- [CLI EmDash](/guides/cli-emdash) -- maitriser les commandes de deploiement et maintenance
