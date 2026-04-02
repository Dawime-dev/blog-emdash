---
title: "Le CLI EmDash : votre meilleur outil de developpement"
description: "Guide complet du CLI EmDash : gestion du contenu, operations sur les schemas, generation de types, upload de medias, publication de plugins et automatisation avec la sortie JSON."
date: "2026-04-02"
author: "Equipe EmDash FR"
category: "Outils"
tags: ["emdash", "cli", "developpement", "outils", "terminal", "automatisation"]
difficulty: "intermediaire"
---

# Le CLI EmDash : votre meilleur outil de developpement

L'interface en ligne de commande (CLI) d'EmDash est bien plus qu'un simple outil d'installation. C'est un compagnon de developpement complet qui couvre tout le cycle de vie d'un projet EmDash : creation, developpement, gestion du contenu, operations de base de donnees, publication de plugins et automatisation. Ce guide vous presente toutes les commandes disponibles et les workflows qu'elles permettent.

## Installation et commandes de base

Le CLI est disponible sous deux noms : `emdash` (complet) et `em` (raccourci). Les deux sont strictement equivalents :

```bash
# Installation globale
npm install -g @emdash-cms/cli

# Ou utilisation directe avec npx
npx emdash <commande>
npx em <commande>

# Verifier la version
em --version
# emdash-cli v1.2.0

# Aide generale
em --help

# Aide sur une commande specifique
em content --help
```

### Creer un nouveau projet

```bash
# Creation interactive (recommande)
em init

# Creation avec un template specifique
em init --template blog
em init --template portfolio
em init --template docs
em init --template ecommerce

# Creation avec toutes les options en ligne
em init mon-site --template blog --package-manager pnpm
```

La commande `em init` lance un assistant interactif qui vous guide a travers la configuration initiale : nom du projet, template, gestionnaire de packages, configuration Cloudflare et options de deploiement. En moins de deux minutes, vous avez un projet EmDash fonctionnel pret au developpement. Pour une description detaillee de cette etape, consultez notre tutoriel [Creer votre premier contenu](/tutoriels/premier-contenu).

### Developpement local

```bash
# Lancer le serveur de developpement
em dev

# Lancer avec un port specifique
em dev --port 4321

# Lancer avec l'emulateur D1 local
em dev --local-db

# Lancer avec les logs detailles
em dev --verbose
```

Le serveur de developpement inclut le rechargement a chaud (HMR) pour les composants Astro, la synchronisation en temps reel des modifications de schema, et un emulateur local pour Cloudflare D1 et R2. Vous developpez en local avec une experience identique a la production.

## Gestion du contenu depuis le terminal

L'une des fonctionnalites les plus puissantes du CLI est la possibilite de gerer le contenu directement depuis le terminal, sans passer par l'interface d'administration web.

### Lister le contenu

```bash
# Lister tous les articles
em content list articles

# Filtrer par statut
em content list articles --status published
em content list articles --status draft

# Filtrer par champ
em content list articles --where "author=matt-kane"
em content list articles --where "tags contains typescript"

# Limiter et paginer
em content list articles --limit 10 --offset 20

# Trier
em content list articles --sort "publishedAt:desc"

# Affichage en tableau
em content list articles --format table
```

### Creer du contenu

```bash
# Creation interactive
em content create articles

# Creation en ligne de commande
em content create articles \
  --field title="Mon nouvel article" \
  --field slug="mon-nouvel-article" \
  --field status=draft \
  --field author=equipe-emdash

# Creation depuis un fichier JSON
em content create articles --from article.json

# Creation depuis stdin (utile pour les pipelines)
cat article.json | em content create articles --from -
```

### Modifier du contenu

```bash
# Modification interactive
em content edit articles --id abc123

# Modification en ligne de commande
em content update articles --id abc123 \
  --field status=published \
  --field publishedAt="2026-04-02T10:00:00Z"

# Modification en masse
em content update articles \
  --where "status=draft AND createdAt < 2026-01-01" \
  --field status=archived
```

### Supprimer du contenu

```bash
# Suppression avec confirmation
em content delete articles --id abc123

# Suppression sans confirmation (dangereux)
em content delete articles --id abc123 --force

# Suppression en masse
em content delete articles --where "status=archived" --force
```

## Operations sur les schemas

Le CLI permet de gerer les schemas de collections et de generer les migrations de base de donnees.

### Gestion des collections

```bash
# Lister les collections
em schema list

# Afficher le schema d'une collection
em schema show articles

# Verifier la coherence des schemas
em schema validate

# Generer une migration apres modification du schema
em schema migrate

# Appliquer les migrations en attente
em schema migrate --apply

# Voir l'historique des migrations
em schema migrate --history

# Annuler la derniere migration
em schema migrate --rollback
```

### Generation de types TypeScript

L'une des commandes les plus utilisees par les developpeurs EmDash est la generation de types. Elle analyse vos schemas de collections et genere des interfaces TypeScript correspondantes :

```bash
# Generer les types
npx emdash types

# Specifier le fichier de sortie
npx emdash types --output src/types/cms.d.ts

# Generer avec les types de relations
npx emdash types --include-relations

# Mode watch (regeneration automatique)
npx emdash types --watch
```

Le fichier genere contient des interfaces pour chaque collection :

```typescript
// src/types/cms.d.ts (genere automatiquement)
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: PortableTextBlock[];
  author: string; // relation -> Author
  publishedAt: Date | null;
  tags: string[];
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface Author {
  id: string;
  name: string;
  email: string;
  bio: PortableTextBlock[];
  avatar: MediaReference | null;
}

// Types utilitaires
export type Collections = {
  articles: Article;
  authors: Author;
};
```

Ces types sont ensuite utilises automatiquement dans vos composants Astro, offrant l'autocompletion et la verification de types dans tout votre projet.

## Gestion des medias

Le CLI offre des commandes pour gerer les fichiers media stockes sur Cloudflare R2 :

```bash
# Lister les medias
em media list
em media list --type image
em media list --type document

# Uploader un fichier
em media upload photo.jpg
em media upload photo.jpg --alt "Photo de couverture"

# Uploader un dossier entier
em media upload ./images/ --recursive

# Optimiser les images
em media optimize --format webp --quality 80

# Supprimer un media
em media delete media-id-123

# Obtenir les informations d'un media
em media info media-id-123

# Generer les variantes d'image (thumbnails, etc.)
em media variants generate --sizes "320,640,1024,1920"
```

L'upload de medias via le CLI est particulierement utile lors des migrations ou pour les workflows automatises. Les images sont automatiquement optimisees et les metadonnees EXIF sont extraites.

## Plugins : bundling et publication

Le CLI est l'outil principal pour [developper](/tutoriels/premier-plugin), tester et publier des plugins EmDash.

### Developpement de plugins

```bash
# Creer un nouveau plugin
em plugin init mon-plugin

# Lancer le plugin en mode developpement
em plugin dev

# Tester le plugin dans un sandbox
em plugin test

# Lancer les tests unitaires du plugin
em plugin test --unit

# Verifier la securite du plugin
em plugin audit
```

### Publication sur le marketplace

```bash
# Construire le bundle du plugin
em plugin build

# Verifier que le bundle est valide
em plugin validate

# Publier sur le marketplace
em plugin publish

# Publier une version beta
em plugin publish --tag beta

# Mettre a jour les metadonnees du plugin
em plugin update --description "Nouvelle description"
```

Le processus de publication inclut automatiquement l'audit de securite. Si le plugin ne passe pas l'audit, la publication est refusee avec un rapport detaille des problemes detectes.

## Sortie JSON pour l'automatisation

Toutes les commandes du CLI supportent une sortie JSON via le flag `--json`, ce qui les rend facilement integrables dans des pipelines d'automatisation :

```bash
# Sortie JSON
em content list articles --json

# Exemple de sortie
{
  "data": [
    {
      "id": "abc123",
      "title": "Mon article",
      "status": "published",
      "publishedAt": "2026-04-01T12:00:00Z"
    }
  ],
  "meta": {
    "total": 42,
    "limit": 20,
    "offset": 0
  }
}
```

Cette fonctionnalite ouvre la porte a des workflows puissants :

```bash
# Pipeline : publier tous les brouillons programmes
em content list articles \
  --where "status=draft AND scheduledAt <= now()" \
  --json | \
jq -r '.data[].id' | \
xargs -I {} em content update articles --id {} --field status=published

# Export du contenu pour backup
em content list articles --json --limit 0 > backup-articles.json

# Integration CI/CD : verifier les schemas avant deploiement
em schema validate --json || exit 1
em schema migrate --apply --json
em deploy
```

### Integration avec les scripts npm

```json
{
  "scripts": {
    "dev": "em dev",
    "build": "em build",
    "deploy": "em deploy",
    "types": "em types --output src/types/cms.d.ts",
    "migrate": "em schema migrate --apply",
    "backup": "em content export --all --output ./backups/$(date +%Y%m%d).json",
    "lint:schema": "em schema validate"
  }
}
```

## Deploiement

```bash
# [Deployer sur Cloudflare Workers](/tutoriels/deployer-cloudflare)
em deploy

# Deployer en mode preview
em deploy --preview

# Deployer avec un message
em deploy --message "Ajout de la section blog"

# Voir les deploiements recents
em deploy list

# Revenir a un deploiement precedent
em deploy rollback

# Voir les logs en temps reel
em logs --tail
```

## Configuration

Le CLI utilise un fichier `emdash.config.ts` a la racine du projet :

```typescript
import { defineConfig } from '@emdash-cms/cli';

export default defineConfig({
  // Connexion Cloudflare
  cloudflare: {
    accountId: process.env.CF_ACCOUNT_ID,
    apiToken: process.env.CF_API_TOKEN,
  },

  // Base de donnees
  database: {
    name: 'mon-site-db',
    migrationsDir: './migrations',
  },

  // Medias
  media: {
    bucket: 'mon-site-media',
    maxSize: '10MB',
    allowedTypes: ['image/*', 'application/pdf'],
  },

  // Generation de types
  types: {
    output: './src/types/cms.d.ts',
    includeRelations: true,
  },
});
```

## Conclusion

Le CLI EmDash est un outil remarquablement complet qui couvre tout le spectre du developpement avec EmDash. De la creation du projet au deploiement en production, en passant par la gestion du contenu, des schemas, des medias et des plugins, tout est accessible depuis votre terminal.

La sortie JSON universelle et l'integration facile avec les outils Unix standards (`jq`, `xargs`, pipes) font du CLI un element cle pour l'automatisation et l'integration continue. Que vous soyez un developpeur solo ou une equipe de vingt personnes, le CLI EmDash s'adapte a votre workflow et vous rend plus productif.

Nous vous recommandons de commencer par `em init` pour creer votre premier projet, puis d'explorer progressivement les commandes au fur et a mesure de vos besoins. L'aide contextuelle (`em <commande> --help`) est toujours la pour vous guider.

## Pour aller plus loin

- [API REST EmDash](/tutoriels/api-rest-emdash) -- combinez le CLI avec l'API REST pour des integrations avancees.
- [Deployer EmDash sur Cloudflare](/tutoriels/deployer-cloudflare) -- utilisez `em deploy` pour mettre votre site en production.
- [Developper votre premier plugin](/tutoriels/premier-plugin) -- utilisez les commandes `em plugin` pour creer et publier un plugin.
- [Creer votre premier contenu](/tutoriels/premier-contenu) -- gerez votre contenu depuis le terminal avec `em content`.
- [Le serveur MCP et l'IA](/guides/mcp-server-emdash) -- decouvrez comment le CLI s'articule avec le serveur MCP pour l'automatisation IA.
