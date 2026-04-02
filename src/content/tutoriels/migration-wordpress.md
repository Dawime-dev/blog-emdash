---
title: "Migrer de WordPress vers EmDash"
description: "Guide complet pour migrer votre site WordPress vers EmDash : export WXR, API REST, conversion Gutenberg vers Portable Text et migration des medias."
date: "2026-04-02"
author: "Equipe EmDash FR"
category: "Migration"
tags: ["emdash", "wordpress", "migration", "import", "gutenberg", "portable-text"]
difficulty: "intermediaire"
duration: "20 min"
---

# Migrer de WordPress vers EmDash

Quitter WordPress pour EmDash est un [choix strategique](/dossiers/wordpress-vers-emdash) : vous passez d'un CMS monolithique necessitant un serveur PHP, une base MySQL et une maintenance constante, a un CMS serverless deployable en quelques secondes sur l'edge mondial de Cloudflare. Pour une comparaison detaillee des deux plateformes, consultez notre guide [EmDash vs WordPress](/guides/emdash-vs-wordpress). Ce tutoriel couvre les trois methodes de migration, de la plus simple a la plus personnalisable.

## Vue d'ensemble des methodes

| Methode | Ideal pour | Complexite | Fidelite |
|---------|-----------|------------|----------|
| WXR Export | Sites simples, blogs | Facile | Bonne |
| API REST WordPress | Sites volumineux, migration incrementale | Moyenne | Tres bonne |
| WordPress.com (Jetpack) | Sites heberges sur WordPress.com | Facile | Bonne |

Quelle que soit la methode, le processus suit la meme logique :

1. Exporter le contenu depuis WordPress
2. Convertir le format (Gutenberg/Classic vers Portable Text)
3. Migrer les medias vers le stockage EmDash (local ou R2)
4. Importer le contenu dans EmDash
5. Verifier et ajuster

## Prerequis

- Un site EmDash [installe et fonctionnel](/tutoriels/installer-emdash)
- L'outil CLI EmDash installe (`npm install -g @emdash/cli`)
- Acces administrateur a votre site WordPress
- Pour la methode API : l'API REST WordPress activee (par defaut depuis WP 4.7)

## Methode 1 : Export WXR (WordPress eXtended RSS)

C'est la methode la plus directe. Le format WXR est le format d'export natif de WordPress.

### Etape 1 : Exporter depuis WordPress

Dans votre tableau de bord WordPress, allez dans **Outils > Exporter** :

1. Selectionnez **Tout le contenu** (articles, pages, commentaires, menus)
2. Cliquez sur **Telecharger le fichier d'export**
3. Vous obtenez un fichier XML (exemple : `monsite.WordPress.2026-04-02.xml`)

### Etape 2 : Importer dans EmDash

```bash
npx emdash import:wordpress ./monsite.WordPress.2026-04-02.xml \
  --media-strategy download \
  --content-format auto \
  --verbose
```

Options disponibles :

```
--media-strategy    download | skip | reference
                    download : telecharge les images et les stocke dans EmDash
                    skip : ignore les medias
                    reference : conserve les URL WordPress originales

--content-format    auto | classic | gutenberg
                    auto : detecte automatiquement le format de chaque article
                    classic : force le mode Classic Editor
                    gutenberg : force le mode Gutenberg blocks

--collections       posts,pages (par defaut : tous les types)

--status-mapping    draft:draft,publish:published,future:scheduled

--dry-run           Simuler sans ecrire dans la base
```

### Etape 3 : Verifier le resultat

```bash
npx emdash import:wordpress ./monsite.WordPress.2026-04-02.xml --dry-run
```

Resultat typique :

```
Analyse du fichier WXR...

Contenu detecte :
  Articles :    142 (dont 12 brouillons)
  Pages :        8
  Medias :     287 (images: 245, PDF: 32, autres: 10)
  Categories :  15
  Tags :        67

Conversion Gutenberg -> Portable Text :
  Blocs supportes :   94%
  Blocs non supportes : paragraph/pullquote (2 occurrences)

Aucune donnee ecrite (mode --dry-run)
```

## Methode 2 : API REST WordPress

Cette methode est ideale pour les sites volumineux ou les migrations incrementales. Elle permet de migrer le contenu en plusieurs passes, sans temps d'arret.

### Installer le plugin EmDash Exporter

Sur votre site WordPress, installez le plugin officiel EmDash Exporter :

1. Telechargez `emdash-exporter.zip` depuis le depot GitHub d'EmDash
2. Dans WordPress : **Extensions > Ajouter > Televerser**
3. Activez le plugin

Le plugin ajoute des endpoints optimises pour la migration :

```
GET /wp-json/emdash-exporter/v1/posts?page=1&per_page=50
GET /wp-json/emdash-exporter/v1/pages
GET /wp-json/emdash-exporter/v1/media
GET /wp-json/emdash-exporter/v1/categories
GET /wp-json/emdash-exporter/v1/tags
```

Contrairement a l'API REST standard de WordPress, ces endpoints incluent :

- Le contenu Gutenberg deja parse en blocs JSON (pas de HTML brut)
- Les metadonnees ACF/Custom Fields
- Les URLs media en pleine resolution
- Les relations entre contenus

### Lancer la migration via API

```bash
npx emdash import:wordpress-api \
  --url https://monsite-wordpress.com \
  --username admin \
  --password "application-password-ici" \
  --media-strategy download \
  --batch-size 50 \
  --verbose
```

Utilisez un **mot de passe d'application** WordPress (disponible depuis WP 5.6) plutot que votre mot de passe principal. Creez-en un dans **Profil > Mots de passe d'application**.

La migration par API affiche une progression en temps reel :

```
Connexion a https://monsite-wordpress.com... OK
Recuperation des categories... 15 categories importees
Recuperation des tags... 67 tags importes

Migration des articles (142 total) :
[████████████████████░░░░░░░░░░] 72/142 (50%)
  - Telechargement media : monimage.jpg (2.4 MB)

Migration des pages (8 total) :
[██████████████████████████████] 8/8 (100%)

Migration des medias supplementaires :
[████████░░░░░░░░░░░░░░░░░░░░░] 45/287 (15%)
```

### Migration incrementale

Pour ne migrer que les contenus modifies depuis la derniere migration :

```bash
npx emdash import:wordpress-api \
  --url https://monsite-wordpress.com \
  --username admin \
  --password "app-password" \
  --since "2026-03-01T00:00:00Z" \
  --update-existing
```

L'option `--update-existing` met a jour les contenus deja importes au lieu de creer des doublons. L'option `--since` filtre par date de modification.

## Methode 3 : Migration depuis WordPress.com

Si votre site est heberge sur WordPress.com, utilisez l'option dediee qui passe par l'API Jetpack/WPCOM :

```bash
npx emdash import:wordpress-com \
  --site monsite.wordpress.com \
  --oauth-token "votre-token-oauth"
```

Obtenez un token OAuth depuis [developer.wordpress.com/apps](https://developer.wordpress.com/apps/).

## La conversion Gutenberg vers Portable Text

Le coeur de la migration est la conversion du format de contenu. WordPress utilise deux formats : le Classic Editor (HTML pur) et Gutenberg (blocs HTML avec commentaires). EmDash convertit les deux vers [Portable Text](/guides/portable-text-guide).

### Blocs Gutenberg supportes

| Bloc Gutenberg | Equivalent Portable Text |
|---------------|-------------------------|
| `core/paragraph` | `block` (style: normal) |
| `core/heading` | `block` (style: h2, h3, h4) |
| `core/image` | `image` avec alt et caption |
| `core/list` | `block` avec listItem |
| `core/quote` | `block` (style: blockquote) |
| `core/code` | `code` avec language detection |
| `core/table` | `table` |
| `core/embed` | `embed` (YouTube, Twitter, etc.) |
| `core/gallery` | `gallery` (plusieurs images) |
| `core/separator` | `divider` |
| `core/html` | `html` (conserve le HTML brut) |

### Blocs non supportes

Les blocs sans equivalent direct sont convertis en HTML brut encapsule dans un bloc `html` Portable Text. Vous pouvez les retrouver et les convertir manuellement apres la migration :

```bash
# Lister les contenus avec des blocs HTML bruts
npx emdash query posts \
  --where "body LIKE '%_type\":\"html%'" \
  --fields id,title,slug
```

### Exemple de conversion

Contenu Gutenberg original :

```html
<!-- wp:heading {"level":2} -->
<h2>Mon sous-titre</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Un paragraphe avec du <strong>gras</strong> et un <a href="/lien">lien</a>.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":42,"sizeSlug":"large"} -->
<figure class="wp-block-image size-large">
  <img src="https://monsite.com/wp-content/uploads/2025/photo.jpg" alt="Ma photo" />
  <figcaption>Legende de l'image</figcaption>
</figure>
<!-- /wp:image -->
```

Resultat Portable Text :

```json
[
  {
    "_type": "block",
    "style": "h2",
    "children": [
      { "_type": "span", "text": "Mon sous-titre" }
    ]
  },
  {
    "_type": "block",
    "style": "normal",
    "children": [
      { "_type": "span", "text": "Un paragraphe avec du " },
      { "_type": "span", "text": "gras", "marks": ["strong"] },
      { "_type": "span", "text": " et un " },
      {
        "_type": "span",
        "text": "lien",
        "marks": ["link"],
        "markDefs": [{ "_type": "link", "href": "/lien" }]
      },
      { "_type": "span", "text": "." }
    ]
  },
  {
    "_type": "image",
    "asset": { "_ref": "media-uuid-generated" },
    "alt": "Ma photo",
    "caption": "Legende de l'image"
  }
]
```

## Migration des medias

### Strategie par defaut : telechargement

Avec `--media-strategy download`, EmDash telecharge chaque fichier media depuis WordPress et le stocke dans votre instance EmDash (`.emdash/uploads/` en local ou R2 en production).

Les references dans le contenu Portable Text sont automatiquement mises a jour pour pointer vers les nouveaux identifiants media EmDash.

### Gerer les medias volumineux

Pour les sites avec des milliers d'images, la migration des medias peut prendre du temps. Quelques conseils :

```bash
# Migrer d'abord le contenu sans les medias
npx emdash import:wordpress ./export.xml --media-strategy skip

# Puis migrer les medias separement avec reprise sur erreur
npx emdash import:wordpress-media ./export.xml \
  --batch-size 20 \
  --retry 3 \
  --resume
```

L'option `--resume` permet de reprendre une migration interrompue. EmDash garde la trace des medias deja importes dans KV.

## Verification post-migration

Apres la migration, verifiez systematiquement :

### 1. Comptage des contenus

```bash
npx emdash stats
```

```
Collections :
  posts    : 142 entrees (130 publiees, 12 brouillons)
  pages    :   8 entrees (8 publiees)

Medias :
  Total    : 287 fichiers
  Images   : 245 (WebP: 0, JPEG: 180, PNG: 65)
  PDF      :  32
  Autres   :  10
```

Comparez avec les chiffres de votre site WordPress.

### 2. Verification des liens internes

```bash
npx emdash check:links --fix
```

Cette commande detecte les liens internes qui pointent encore vers des URLs WordPress (`/wp-content/`, `/?p=123`, etc.) et propose des corrections automatiques.

### 3. Verification visuelle

Parcourez les articles les plus importants dans le panneau d'administration EmDash et verifiez que la mise en forme est correcte. Portez une attention particuliere aux :

- Images et leurs legendes
- Blocs de code (coloration syntaxique)
- Tableaux
- Embeds (YouTube, Twitter)
- Listes imbriquees

### 4. Redirections

Configurez des redirections des anciennes URLs WordPress vers les nouvelles URLs EmDash. Dans votre configuration Astro :

```typescript
// astro.config.mjs
export default defineConfig({
  redirects: {
    // Rediriger les anciennes URLs WordPress
    '/index.php/[...slug]': '/blog/[...slug]',
    '/?p=[id]': '/blog/', // Fallback vers la liste
  },
});
```

Pour des redirections plus complexes, utilisez un fichier `_redirects` ou les redirections Cloudflare.

## Depannage

**Les caracteres accentues sont mal affiches :**
Verifiez que le fichier WXR est en UTF-8. Ouvrez-le dans un editeur de texte et verifiez l'en-tete `<?xml version="1.0" encoding="UTF-8"?>`. Si ce n'est pas le cas, convertissez-le avec `iconv -f ISO-8859-1 -t UTF-8 export.xml > export-utf8.xml`.

**Les images importees sont de mauvaise qualite :**
Par defaut, WordPress exporte les URLs des images en taille "large". Ajoutez `--media-size full` pour telecharger les originaux.

**Erreur "Rate limited" avec l'API :**
Augmentez le delai entre les requetes : `--delay 500` (500ms entre chaque requete API).

## Prochaines etapes

Votre contenu WordPress est maintenant dans EmDash. Prenez le temps de verifier les contenus migres, ajustez les blocs non supportes, et profitez des nouvelles fonctionnalites : [Passkeys](/tutoriels/authentification-passkeys), publication programmee, et [deploiement serverless sur Cloudflare](/tutoriels/deployer-cloudflare).

## Pour aller plus loin

- [Quitter WordPress : le dossier complet](/dossiers/wordpress-vers-emdash) --- analyse approfondie de la migration et de ses enjeux
- [EmDash vs WordPress](/guides/emdash-vs-wordpress) --- comparatif detaille des deux plateformes
- [Installer EmDash](/tutoriels/installer-emdash) --- guide d'installation pas a pas
- [Guide complet du Portable Text](/guides/portable-text-guide) --- comprendre le format de contenu d'EmDash apres la migration
