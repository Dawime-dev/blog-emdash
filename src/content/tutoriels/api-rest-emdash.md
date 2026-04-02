---
title: "Maitriser l'API REST d'EmDash"
description: "Reference complete de l'API REST d'EmDash : endpoints, enveloppe de reponse, pagination par curseur, validation Zod, operations CRUD et authentification."
date: "2026-04-02"
author: "Equipe EmDash FR"
category: "API"
tags: ["emdash", "api", "rest", "crud", "zod", "pagination", "authentification"]
difficulty: "avance"
duration: "20 min"
---

# Maitriser l'API REST d'EmDash

L'API REST d'EmDash expose toutes les fonctionnalites du CMS via des endpoints HTTP standards. Que vous construisiez une application mobile, un site frontend decouple, ou que vous automatisiez la gestion de contenu via un [plugin](/tutoriels/premier-plugin), cette API est votre point d'entree. Ce tutoriel couvre en profondeur chaque aspect de l'API : authentification, structure des reponses, pagination, validation et operations CRUD.

## Vue d'ensemble

L'API est accessible sous le prefixe `/_emdash/api/` (configurable dans `astro.config.mjs`). Tous les endpoints suivent les conventions REST :

```
Base URL : https://mon-blog.example.com/_emdash/api

GET    /collections                       # Lister les collections
GET    /collections/:name                 # Schema d'une collection
GET    /collections/:name/entries         # Lister les entrees
POST   /collections/:name/entries         # Creer une entree
GET    /collections/:name/entries/:id     # Lire une entree
PUT    /collections/:name/entries/:id     # Mettre a jour une entree
DELETE /collections/:name/entries/:id     # Supprimer une entree

GET    /media                             # Lister les medias
POST   /media                             # Uploader un media
GET    /media/:id                         # Details d'un media
DELETE /media/:id                         # Supprimer un media

GET    /health                            # Etat du systeme
GET    /me                                # Utilisateur connecte
```

## Authentification

### Obtenir un token API

L'API utilise des tokens Bearer pour l'authentification. Creez un token depuis le panneau d'administration : **Parametres > API > Tokens d'acces**.

Chaque token est lie a un utilisateur et herite de ses permissions. Vous pouvez creer des tokens avec des permissions restreintes :

```
Nom : "Application mobile - lecture seule"
Permissions : content:read, media:read
Expiration : 90 jours
```

### Utiliser le token

Ajoutez le token dans l'en-tete `Authorization` de chaque requete :

```bash
curl -H "Authorization: Bearer emd_tk_a1b2c3d4e5f6..." \
  https://mon-blog.example.com/_emdash/api/collections/posts/entries
```

### Token temporaire via [Passkey](/tutoriels/authentification-passkeys)

Pour les applications interactives (SPA, application mobile), vous pouvez obtenir un token temporaire en authentifiant l'utilisateur via WebAuthn :

```typescript
// Cote client
const credential = await navigator.credentials.get({
  publicKey: {
    challenge: challengeFromServer,
    rpId: 'mon-blog.example.com',
  },
});

const response = await fetch('/_emdash/api/auth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    credential: {
      id: credential.id,
      rawId: bufferToBase64(credential.rawId),
      response: {
        authenticatorData: bufferToBase64(credential.response.authenticatorData),
        clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
        signature: bufferToBase64(credential.response.signature),
      },
      type: credential.type,
    },
  }),
});

const { data } = await response.json();
// data.token = "emd_tmp_..." (valide 1 heure)
```

## Enveloppe de reponse

Toutes les reponses de l'API suivent un format uniforme :

### Reponse reussie

```json
{
  "success": true,
  "data": {
    "id": "entry_abc123",
    "title": "Mon article",
    "slug": "mon-article",
    "status": "published",
    "publishedAt": "2026-04-01T10:00:00Z",
    "createdAt": "2026-03-28T14:30:00Z",
    "updatedAt": "2026-04-01T09:55:00Z"
  }
}
```

### Reponse avec liste et pagination

```json
{
  "success": true,
  "data": [
    { "id": "entry_abc123", "title": "Article 1" },
    { "id": "entry_def456", "title": "Article 2" }
  ],
  "pagination": {
    "cursor": "eyJpZCI6ImVudHJ5X2RlZjQ1NiJ9",
    "hasMore": true,
    "total": 142
  }
}
```

### Reponse d'erreur

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Les donnees soumises sont invalides.",
    "details": [
      {
        "field": "title",
        "code": "too_small",
        "message": "Le titre doit contenir au moins 1 caractere."
      },
      {
        "field": "slug",
        "code": "custom",
        "message": "Ce slug est deja utilise par un autre contenu."
      }
    ]
  }
}
```

### Codes d'erreur HTTP

| Code | Signification |
|------|---------------|
| `200` | Succes (lecture, mise a jour) |
| `201` | Cree (creation reussie) |
| `204` | Supprime (suppression reussie) |
| `400` | Requete invalide (validation echouee) |
| `401` | Non authentifie (token manquant ou expire) |
| `403` | Acces refuse (permissions insuffisantes) |
| `404` | Ressource introuvable |
| `409` | Conflit (slug duplique, version obsolete) |
| `429` | Trop de requetes (rate limiting) |
| `500` | Erreur serveur |

## Pagination par curseur

EmDash utilise la pagination par curseur (et non par offset). Cette approche est plus performante et fiable sur les grandes collections : pas de resultats dupliques ou manquants lorsque des contenus sont ajoutes pendant la navigation.

### Premiere page

```bash
GET /_emdash/api/collections/posts/entries?limit=10
```

Reponse :

```json
{
  "success": true,
  "data": [ /* 10 entrees */ ],
  "pagination": {
    "cursor": "eyJpZCI6ImVudHJ5XzEwIn0=",
    "hasMore": true,
    "total": 142
  }
}
```

### Page suivante

Utilisez le `cursor` retourne pour obtenir la page suivante :

```bash
GET /_emdash/api/collections/posts/entries?limit=10&cursor=eyJpZCI6ImVudHJ5XzEwIn0=
```

### Exemple complet en TypeScript

```typescript
// Iterer sur toutes les pages d'une collection
async function fetchAllEntries(collection: string, token: string) {
  const baseUrl = 'https://mon-blog.example.com/_emdash/api';
  const entries: any[] = [];
  let cursor: string | undefined;

  do {
    const url = new URL(`${baseUrl}/collections/${collection}/entries`);
    url.searchParams.set('limit', '50');
    url.searchParams.set('status', 'published');
    url.searchParams.set('orderBy', 'publishedAt');
    url.searchParams.set('order', 'desc');
    if (cursor) url.searchParams.set('cursor', cursor);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await response.json();

    if (!json.success) {
      throw new Error(json.error.message);
    }

    entries.push(...json.data);
    cursor = json.pagination.hasMore ? json.pagination.cursor : undefined;
  } while (cursor);

  return entries;
}
```

## Validation avec Zod

EmDash valide toutes les donnees entrantes avec Zod. Chaque collection genere automatiquement un schema Zod a partir de sa definition de champs. Cela signifie que les erreurs de validation sont precises et explicites.

### Structure des erreurs de validation

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Les donnees soumises sont invalides.",
    "details": [
      {
        "field": "title",
        "code": "too_small",
        "message": "Le titre doit contenir au moins 1 caractere.",
        "minimum": 1
      },
      {
        "field": "date_projet",
        "code": "invalid_date",
        "message": "La date n'est pas au format ISO 8601 valide."
      },
      {
        "field": "technologies",
        "code": "invalid_enum_value",
        "message": "Valeur invalide. Options : Astro, React, Vue, Svelte.",
        "received": "Angular",
        "options": ["Astro", "React", "Vue", "Svelte"]
      }
    ]
  }
}
```

### Recuperer le schema Zod d'une collection

L'API expose le schema de validation de chaque collection :

```bash
GET /_emdash/api/collections/posts
```

```json
{
  "success": true,
  "data": {
    "name": "posts",
    "tableName": "ec_posts",
    "fields": [
      {
        "name": "title",
        "type": "text",
        "required": true,
        "maxLength": 255,
        "validation": { "min": 1, "max": 255 }
      },
      {
        "name": "slug",
        "type": "slug",
        "required": true,
        "unique": true,
        "sourceField": "title"
      },
      {
        "name": "body",
        "type": "richtext",
        "required": false
      },
      {
        "name": "status",
        "type": "select",
        "options": ["draft", "review", "published", "scheduled", "archived"],
        "default": "draft"
      }
    ]
  }
}
```

## Operations CRUD

### Creer une entree

```bash
POST /_emdash/api/collections/posts/entries
Content-Type: application/json
Authorization: Bearer emd_tk_...

{
  "title": "Mon nouvel article",
  "slug": "mon-nouvel-article",
  "body": [
    {
      "_type": "block",
      "style": "normal",
      "children": [
        { "_type": "span", "text": "Contenu de l'article en Portable Text." }
      ]
    }
  ],
  "status": "draft",
  "tags": ["astro", "tutoriel"],
  "featured": false
}
```

Reponse `201 Created` :

```json
{
  "success": true,
  "data": {
    "id": "entry_xyz789",
    "title": "Mon nouvel article",
    "slug": "mon-nouvel-article",
    "status": "draft",
    "createdAt": "2026-04-02T15:30:00Z",
    "updatedAt": "2026-04-02T15:30:00Z",
    "createdBy": "user_abc123"
  }
}
```

### Lire une entree

```bash
GET /_emdash/api/collections/posts/entries/entry_xyz789
Authorization: Bearer emd_tk_...
```

Vous pouvez selectionner les champs retournes pour optimiser la reponse :

```bash
GET /_emdash/api/collections/posts/entries/entry_xyz789?fields=title,slug,status,publishedAt
```

### Mettre a jour une entree

```bash
PUT /_emdash/api/collections/posts/entries/entry_xyz789
Content-Type: application/json
Authorization: Bearer emd_tk_...

{
  "title": "Mon article mis a jour",
  "status": "published"
}
```

La mise a jour est partielle (PATCH semantics) : seuls les champs fournis sont modifies. Les champs absents conservent leur valeur actuelle.

### Supprimer une entree

```bash
DELETE /_emdash/api/collections/posts/entries/entry_xyz789
Authorization: Bearer emd_tk_...
```

Reponse `204 No Content` (pas de corps de reponse).

### Filtrer les entrees

L'endpoint de liste accepte de nombreux parametres de filtrage :

```bash
# Articles publies, trie par date, 10 resultats
GET /_emdash/api/collections/posts/entries?status=published&orderBy=publishedAt&order=desc&limit=10

# Recherche textuelle dans le titre
GET /_emdash/api/collections/posts/entries?search=astro

# Filtres avances (JSON encode en URL)
GET /_emdash/api/collections/posts/entries?where={"tags":{"contains":"tutoriel"},"featured":{"eq":true}}

# Compter sans recuperer les donnees
GET /_emdash/api/collections/posts/entries?count=true
```

Operateurs de filtrage supportes :

| Operateur | Description | Exemple |
|-----------|-------------|---------|
| `eq` | Egal | `{"status":{"eq":"published"}}` |
| `neq` | Different | `{"status":{"neq":"draft"}}` |
| `gt` / `gte` | Superieur / superieur ou egal | `{"publishedAt":{"gte":"2026-01-01"}}` |
| `lt` / `lte` | Inferieur / inferieur ou egal | `{"publishedAt":{"lt":"2026-04-01"}}` |
| `contains` | Contient (texte ou tableau) | `{"tags":{"contains":"astro"}}` |
| `startsWith` | Commence par | `{"slug":{"startsWith":"guide-"}}` |
| `in` | Dans une liste | `{"status":{"in":["published","scheduled"]}}` |
| `isNull` | Est null | `{"cover":{"isNull":true}}` |

## Upload de medias

```bash
POST /_emdash/api/media
Authorization: Bearer emd_tk_...
Content-Type: multipart/form-data

# Avec curl
curl -X POST \
  -H "Authorization: Bearer emd_tk_..." \
  -F "file=@/chemin/vers/image.jpg" \
  -F "alt=Description de l'image" \
  -F "folder=articles" \
  https://mon-blog.example.com/_emdash/api/media
```

Reponse :

```json
{
  "success": true,
  "data": {
    "id": "media_img123",
    "filename": "image.jpg",
    "mimeType": "image/jpeg",
    "size": 245760,
    "width": 1920,
    "height": 1080,
    "alt": "Description de l'image",
    "folder": "articles",
    "url": "/_emdash/media/media_img123/image.jpg",
    "createdAt": "2026-04-02T15:45:00Z"
  }
}
```

## Rate limiting

L'API applique un rate limiting par token :

| Plan | Requetes/minute | Requetes/jour |
|------|----------------|---------------|
| Gratuit | 60 | 10 000 |
| Pro | 300 | 100 000 |
| Enterprise | Illimite | Illimite |

Les en-tetes de reponse indiquent votre consommation :

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1712073600
```

Si vous depassez la limite, l'API retourne `429 Too Many Requests` avec un en-tete `Retry-After`.

## Exemple complet : script de publication

Voici un script TypeScript complet qui cree un article, uploade une image de couverture et publie le tout :

```typescript
// scripts/publish-article.ts
const API_URL = 'https://mon-blog.example.com/_emdash/api';
const TOKEN = process.env.EMDASH_API_TOKEN!;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
};

async function publishArticle() {
  // 1. Uploader l'image de couverture
  const imageForm = new FormData();
  imageForm.append('file', new Blob([await Bun.file('./cover.jpg').arrayBuffer()]), 'cover.jpg');
  imageForm.append('alt', 'Image de couverture');

  const mediaRes = await fetch(`${API_URL}/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: imageForm,
  });
  const media = await mediaRes.json();

  if (!media.success) {
    console.error('Erreur upload :', media.error);
    return;
  }

  console.log(`Image uploadee : ${media.data.id}`);

  // 2. Creer l'article
  const articleRes = await fetch(`${API_URL}/collections/posts/entries`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'Guide complet Astro 6.0',
      slug: 'guide-complet-astro-6',
      excerpt: 'Tout ce que vous devez savoir sur Astro 6.0 et ses nouvelles fonctionnalites.',
      body: [
        {
          _type: 'block',
          style: 'normal',
          children: [
            { _type: 'span', text: 'Astro 6.0 introduit des changements majeurs...' },
          ],
        },
      ],
      cover: media.data.id,
      tags: ['astro', 'guide'],
      featured: true,
      status: 'published',
    }),
  });

  const article = await articleRes.json();

  if (!article.success) {
    console.error('Erreur creation :', article.error);
    return;
  }

  console.log(`Article publie : ${article.data.slug}`);
  console.log(`URL : https://mon-blog.example.com/blog/${article.data.slug}`);
}

publishArticle();
```

## Prochaines etapes

Vous maitrisez maintenant l'API REST d'EmDash. Utilisez-la pour construire des applications mobiles, automatiser la [creation de contenu](/tutoriels/premier-contenu), ou integrer EmDash avec vos outils existants. Combinez l'API avec les webhooks (hooks `content:afterSave`) pour declencher des actions externes a chaque publication.

## Pour aller plus loin

- [Le CLI EmDash](/guides/cli-emdash) --- gerer votre projet EmDash en ligne de commande
- [Developper votre premier plugin](/tutoriels/premier-plugin) --- utiliser l'API dans vos plugins
- [Creer votre premier contenu](/tutoriels/premier-contenu) --- comprendre les collections interrogeables via l'API
- [Authentification par Passkeys](/tutoriels/authentification-passkeys) --- securiser les acces a l'API
