---
title: "Creer un theme EmDash sur mesure : guide pratique"
description: "Guide complet pour creer un theme EmDash personnalise de A a Z : structure, layouts, composants, requetes de contenu, fichiers seed et differences avec WordPress."
date: "2026-04-02"
author: "Equipe EmDash FR"
tags: ["emdash", "themes", "custom", "developpement", "astro", "tutoriel"]
themeName: "Custom"
themeVersion: "N/A"
rating: 4
---

# Creer un theme EmDash sur mesure : guide pratique

Les themes officiels sont d'excellents points de depart, mais parfois votre projet exige un controle total. Creer un theme EmDash sur mesure vous donne une liberte absolue sur le design, l'architecture et l'experience utilisateur. Ce guide pratique vous accompagne de la structure initiale jusqu'a la publication, en couvrant chaque etape cle.

## Pourquoi creer un theme sur mesure ?

Les themes starter d'EmDash couvrent les cas d'usage les plus courants, mais ils ne peuvent pas repondre a toutes les situations. Un theme sur mesure s'impose lorsque :

- Votre charte graphique exige un design specifique incompatible avec un starter
- Vous avez besoin d'un type de contenu unique (recettes, evenements, annonces immobilieres...)
- Vous souhaitez une architecture de pages differente des conventions des starters
- Vous construisez un produit SaaS dont le site marketing doit s'integrer parfaitement a l'application

Creer un theme EmDash est significativement plus simple que creer un theme WordPress. Il n'y a pas de convention rigide, pas de template hierarchy complexe, pas de functions.php monolithique. Un theme EmDash est simplement un projet Astro qui utilise l'API de contenu d'EmDash. Le tutoriel [creer un theme EmDash](/tutoriels/creer-theme-emdash) couvre les bases de ce processus.

## Structure d'un theme EmDash

Tout theme EmDash respecte une structure de base que voici :

```
mon-theme/
├── astro.config.mjs          # Configuration Astro + EmDash
├── emdash.config.ts           # Configuration EmDash (collections, etc.)
├── package.json
├── src/
│   ├── pages/                 # Routes et pages
│   │   ├── index.astro
│   │   └── [slug].astro
│   ├── layouts/               # Layouts reutilisables
│   │   └── BaseLayout.astro
│   ├── components/            # Composants UI
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── ...
│   └── styles/                # Feuilles de style
│       └── global.css
├── public/                    # Assets statiques
├── seed/                      # Donnees de demonstration
│   └── seed.ts
└── README.md
```

### Le fichier `emdash.config.ts`

C'est le fichier central de votre theme. Il definit les collections de contenu, les champs personnalises et les options d'administration. Voici un exemple minimaliste :

```typescript
import { defineConfig, collection, field } from 'emdash';

export default defineConfig({
  collections: {
    posts: collection({
      label: 'Articles',
      fields: {
        title: field.text({ label: 'Titre', required: true }),
        excerpt: field.textarea({ label: 'Extrait' }),
        coverImage: field.image({ label: 'Image de couverture' }),
        category: field.select({
          label: 'Categorie',
          options: ['Tech', 'Design', 'Business'],
        }),
        tags: field.tags({ label: 'Tags' }),
        publishedAt: field.date({ label: 'Date de publication' }),
      },
    }),
  },
});
```

Ce fichier genere automatiquement l'interface d'administration correspondante dans le panneau EmDash.

## Les pages

Les pages suivent les conventions de routage d'Astro. Chaque fichier `.astro` dans `src/pages/` correspond a une route.

### Page d'accueil

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getEmDashCollection } from 'emdash:content';

const posts = await getEmDashCollection('posts');
const sortedPosts = posts.sort(
  (a, b) => new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime()
);
---
<BaseLayout title="Accueil">
  <h1>Derniers articles</h1>
  <ul>
    {sortedPosts.map(post => (
      <li>
        <a href={`/${post.slug}`}>{post.data.title}</a>
        <time>{post.data.publishedAt}</time>
      </li>
    ))}
  </ul>
</BaseLayout>
```

### Page dynamique

Les pages dynamiques utilisent les routes parametrees d'Astro. Le fichier `[slug].astro` genere une page pour chaque entree de la collection.

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getEmDashCollection, getEmDashEntry } from 'emdash:content';

export async function getStaticPaths() {
  const posts = await getEmDashCollection('posts');
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---
<BaseLayout title={post.data.title}>
  <article>
    <h1>{post.data.title}</h1>
    <Content />
  </article>
</BaseLayout>
```

## Les layouts

Les layouts sont des composants Astro qui encapsulent le contenu des pages. Ils gerent generalement le `<html>`, le `<head>`, le header, le footer et les metadonnees.

```astro
---
interface Props {
  title: string;
  description?: string;
}
const { title, description = "Mon site EmDash" } = Astro.props;
---
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content={description} />
</head>
<body>
  <header>
    <nav><!-- Navigation --></nav>
  </header>
  <main>
    <slot />
  </main>
  <footer>
    <p>&copy; 2026 Mon Site</p>
  </footer>
</body>
</html>
```

Un theme peut contenir plusieurs layouts : un pour les articles, un pour les pages statiques, un pour les galeries, etc.

## Les composants

Les composants sont les briques reutilisables de votre theme. Ils recoivent des props et renderent du HTML. EmDash n'impose aucune contrainte sur la structure des composants : vous etes libre d'utiliser du CSS pur, Tailwind, des CSS Modules ou n'importe quelle approche.

## Requeter le contenu avec `getEmDashCollection()`

L'API de contenu d'EmDash expose deux fonctions principales :

- **`getEmDashCollection(name)`** : recupere toutes les entrees d'une collection
- **`getEmDashEntry(collection, slug)`** : recupere une entree specifique par son slug

Ces fonctions sont typees automatiquement a partir de votre fichier `emdash.config.ts`, ce qui offre une autocompletion complete dans votre editeur. Le contenu est stocke en [Portable Text](/guides/portable-text-guide), un format JSON structure et portable.

```typescript
// Filtrer les articles par categorie
const techPosts = (await getEmDashCollection('posts'))
  .filter(post => post.data.category === 'Tech');

// Recuperer un article specifique
const about = await getEmDashEntry('pages', 'about');
```

## Les fichiers seed : donnees de demonstration

Un bon theme doit etre utilisable des l'installation. C'est le role du fichier seed. Il contient des donnees de demonstration qui peuplent les collections lors de la premiere initialisation.

```typescript
// seed/seed.ts
import { defineSeed } from 'emdash';

export default defineSeed({
  posts: [
    {
      title: 'Bienvenue sur votre nouveau site',
      slug: 'bienvenue',
      excerpt: 'Decouvrez comment personnaliser votre theme EmDash.',
      category: 'General',
      tags: ['emdash', 'introduction'],
      publishedAt: '2026-04-01',
      body: '# Bienvenue\n\nCeci est votre premier article...',
    },
    // ... autres articles de demonstration
  ],
});
```

Le fichier seed est execute uniquement lors de l'initialisation. Les donnees existantes ne sont jamais ecrasees.

## Theme EmDash vs theme WordPress : les differences

| Aspect | WordPress | EmDash |
|--------|-----------|--------|
| Langage | PHP | Astro (HTML, JS, TS) |
| Templating | Template hierarchy | File-based routing |
| Donnees | WP_Query, the_loop | getEmDashCollection() |
| Admin UI | Generee par WP | Generee par emdash.config.ts |
| Styles | styles.css + enqueue | Import direct ou Tailwind |
| JavaScript | wp_enqueue_script | Import ESM natif |
| Build | Aucun | Astro build (SSG/SSR) |
| Plugins | PHP hooks/filters | EmDash plugin system |

La principale difference philosophique est que WordPress impose un cadre strict (template hierarchy, the loop, hooks) tandis qu'EmDash vous laisse structurer votre code comme vous le souhaitez. Un theme EmDash est avant tout un projet Astro standard enrichi par l'API de contenu.

## Conseils pour un theme reussi

1. **Commencez par le contenu** : definissez vos collections et champs avant de coder l'interface
2. **Pensez mobile-first** : concevez d'abord pour les petits ecrans
3. **Utilisez les design tokens** : centralisez couleurs, typographie et espacements
4. **Documentez vos composants** : un README clair facilite la reutilisation
5. **Fournissez un seed complet** : les utilisateurs doivent voir un resultat convaincant immediatement
6. **Testez l'accessibilite** : utilisez des outils comme axe-core pour verifier la conformite WCAG

## Notre verdict

Creer un theme EmDash sur mesure est une experience agreable pour tout developpeur familier avec Astro. L'API de contenu est intuitive, la structure est flexible et le fichier de configuration genere automatiquement l'interface d'administration. La courbe d'apprentissage est douce, surtout pour ceux qui viennent de l'ecosysteme Astro.

**Note : 4/5** -- Un processus de creation fluide qui beneficierait d'un CLI de scaffolding dedie pour aller encore plus vite.

## Pour aller plus loin

- [Tutoriel : creer un theme EmDash](/tutoriels/creer-theme-emdash) -- le tutoriel officiel pas a pas
- [Guide Portable Text](/guides/portable-text-guide) -- maitriser le format de contenu d'EmDash
- [Theme Blog Starter](/themes/theme-blog) -- un exemple de theme complet a etudier
- [Creer votre premier contenu](/tutoriels/premier-contenu) -- alimentez votre theme avec du contenu
