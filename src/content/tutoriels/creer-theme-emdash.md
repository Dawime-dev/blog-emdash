---
title: "Creer un theme EmDash de A a Z"
description: "Guide complet pour creer un theme EmDash : pages, layouts, composants, requetes de contenu, fichier seed et integration Tailwind CSS."
date: "2026-04-02"
author: "Equipe EmDash FR"
category: "Themes"
tags: ["emdash", "theme", "astro", "tailwind", "composants", "layouts"]
difficulty: "intermediaire"
duration: "30 min"
---

# Creer un theme EmDash de A a Z

Un theme EmDash est un projet Astro standard, enrichi par les fonctions de requete et les composants fournis par EmDash. Il n'y a pas de systeme de template proprietaire a apprendre : si vous connaissez Astro, vous savez deja creer un theme EmDash. Avant de commencer, assurez-vous d'avoir [cree votre premier contenu](/tutoriels/premier-contenu) pour avoir des donnees a afficher. Ce tutoriel vous guide dans la creation d'un theme blog complet, du layout de base jusqu'au fichier seed de contenu de demonstration.

## Structure d'un theme EmDash

Un theme EmDash suit les conventions Astro avec quelques additions specifiques :

```
mon-theme-emdash/
├── package.json
├── astro.config.mjs
├── emdash.config.ts
├── seed.ts                    # Contenu de demonstration
├── src/
│   ├── layouts/
│   │   ├── Base.astro         # Layout HTML de base
│   │   ├── Blog.astro         # Layout article
│   │   └── Page.astro         # Layout page statique
│   ├── pages/
│   │   ├── index.astro        # Accueil
│   │   ├── blog/
│   │   │   ├── index.astro    # Liste des articles
│   │   │   └── [slug].astro   # Article individuel
│   │   ├── [slug].astro       # Pages dynamiques
│   │   └── 404.astro          # Page d'erreur
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── PostCard.astro
│   │   ├── Pagination.astro
│   │   ├── TagList.astro
│   │   └── portable-text/     # Composants Portable Text
│   │       ├── CodeBlock.astro
│   │       ├── Callout.astro
│   │       └── EmbedBlock.astro
│   └── styles/
│       └── global.css         # Styles globaux
├── public/
│   ├── favicon.svg
│   └── og-default.png
└── tailwind.config.mjs
```

## Etape 1 : Initialiser le projet

Partez d'un projet EmDash vierge :

```bash
npm create emdash@latest -- --template blank --name mon-theme
cd mon-theme
```

Installez Tailwind CSS pour le style :

```bash
npx astro add tailwind
```

## Etape 2 : Le layout de base

Le layout de base est le squelette HTML de toutes vos pages. Creez `src/layouts/Base.astro` :

```astro
---
// src/layouts/Base.astro
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { getEmDashSettings } from '@emdash/astro';

interface Props {
  title?: string;
  description?: string;
  ogImage?: string;
}

const settings = await getEmDashSettings();
const {
  title = settings.siteName,
  description = settings.siteDescription,
  ogImage = '/og-default.png',
} = Astro.props;

const pageTitle = title !== settings.siteName
  ? `${title} | ${settings.siteName}`
  : settings.siteName;
---

<!doctype html>
<html lang={settings.defaultLocale || 'fr'}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{pageTitle}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={new URL(ogImage, Astro.site)} />
    <meta property="og:type" content="website" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="sitemap" href="/sitemap-index.xml" />
  </head>
  <body class="min-h-screen flex flex-col bg-stone-50 text-stone-900">
    <Header siteName={settings.siteName} />
    <main class="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
      <slot />
    </main>
    <Footer siteName={settings.siteName} />
  </body>
</html>
```

## Etape 3 : Les composants de navigation

```astro
---
// src/components/Header.astro
interface Props {
  siteName: string;
}

const { siteName } = Astro.props;
const currentPath = Astro.url.pathname;
---

<header class="border-b border-stone-200 bg-white">
  <nav class="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
    <a href="/" class="text-xl font-bold tracking-tight text-stone-900 hover:text-indigo-600 transition-colors">
      {siteName}
    </a>
    <ul class="flex items-center gap-6 text-sm font-medium">
      {[
        { href: '/', label: 'Accueil' },
        { href: '/blog', label: 'Blog' },
        { href: '/a-propos', label: 'A propos' },
      ].map(({ href, label }) => (
        <li>
          <a
            href={href}
            class:list={[
              'transition-colors hover:text-indigo-600',
              currentPath === href ? 'text-indigo-600' : 'text-stone-600',
            ]}
          >
            {label}
          </a>
        </li>
      ))}
    </ul>
  </nav>
</header>
```

```astro
---
// src/components/Footer.astro
interface Props {
  siteName: string;
}

const { siteName } = Astro.props;
const year = new Date().getFullYear();
---

<footer class="border-t border-stone-200 bg-white mt-auto">
  <div class="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-stone-500">
    <p>&copy; {year} {siteName}. Propulse par EmDash et Astro.</p>
  </div>
</footer>
```

## Etape 4 : La page d'accueil

```astro
---
// src/pages/index.astro
import Base from '../layouts/Base.astro';
import PostCard from '../components/PostCard.astro';
import { getEmDashCollection } from '@emdash/astro';

const featuredPosts = await getEmDashCollection('posts', {
  status: 'published',
  where: { featured: { eq: true } },
  orderBy: 'publishedAt',
  order: 'desc',
  limit: 3,
});

const recentPosts = await getEmDashCollection('posts', {
  status: 'published',
  orderBy: 'publishedAt',
  order: 'desc',
  limit: 6,
});
---

<Base>
  <section class="mb-12">
    <h1 class="text-4xl font-bold tracking-tight mb-2">Bienvenue</h1>
    <p class="text-lg text-stone-600 mb-8">
      Decouvrez nos derniers articles et tutoriels.
    </p>

    {featuredPosts.length > 0 && (
      <div class="mb-12">
        <h2 class="text-2xl font-semibold mb-4">A la une</h2>
        <div class="grid gap-6 md:grid-cols-3">
          {featuredPosts.map((post) => (
            <PostCard post={post} featured />
          ))}
        </div>
      </div>
    )}
  </section>

  <section>
    <h2 class="text-2xl font-semibold mb-4">Articles recents</h2>
    <div class="grid gap-6 md:grid-cols-2">
      {recentPosts.map((post) => (
        <PostCard post={post} />
      ))}
    </div>
  </section>
</Base>
```

## Etape 5 : Le composant carte d'article

```astro
---
// src/components/PostCard.astro
import { getEmDashMediaUrl } from '@emdash/astro';

interface Props {
  post: any;
  featured?: boolean;
}

const { post, featured = false } = Astro.props;

const coverUrl = post.cover
  ? getEmDashMediaUrl(post.cover, { width: featured ? 800 : 400, format: 'webp' })
  : null;

const formattedDate = new Date(post.publishedAt).toLocaleDateString('fr-FR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
---

<article class:list={[
  'group rounded-xl overflow-hidden border border-stone-200 bg-white hover:shadow-lg transition-shadow',
  featured && 'md:col-span-1',
]}>
  {coverUrl && (
    <a href={`/blog/${post.slug}`} class="block overflow-hidden">
      <img
        src={coverUrl}
        alt={post.coverAlt || post.title}
        class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
    </a>
  )}
  <div class="p-5">
    <time class="text-xs text-stone-400 uppercase tracking-wide" datetime={post.publishedAt}>
      {formattedDate}
    </time>
    <h3 class="text-lg font-semibold mt-1 mb-2">
      <a href={`/blog/${post.slug}`} class="hover:text-indigo-600 transition-colors">
        {post.title}
      </a>
    </h3>
    {post.excerpt && (
      <p class="text-sm text-stone-600 line-clamp-3">{post.excerpt}</p>
    )}
    {post.tags?.length > 0 && (
      <div class="flex flex-wrap gap-1.5 mt-3">
        {post.tags.map((tag: string) => (
          <span class="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
            {tag}
          </span>
        ))}
      </div>
    )}
  </div>
</article>
```

## Etape 6 : La page article avec [Portable Text](/guides/portable-text-guide)

```astro
---
// src/pages/blog/[slug].astro
import Base from '../../layouts/Base.astro';
import { getEmDashEntry, getEmDashCollection } from '@emdash/astro';
import { PortableText } from '@emdash/astro/components';
import { getEmDashMediaUrl } from '@emdash/astro';
import CodeBlock from '../../components/portable-text/CodeBlock.astro';
import Callout from '../../components/portable-text/Callout.astro';

// Generer les chemins statiques en mode hybride
export async function getStaticPaths() {
  const posts = await getEmDashCollection('posts', { status: 'published' });
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;

const coverUrl = post.cover
  ? getEmDashMediaUrl(post.cover, { width: 1200, format: 'webp' })
  : null;

const formattedDate = new Date(post.publishedAt).toLocaleDateString('fr-FR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
---

<Base title={post.title} description={post.excerpt} ogImage={coverUrl}>
  <article class="max-w-2xl mx-auto">
    <header class="mb-8">
      <time class="text-sm text-stone-400" datetime={post.publishedAt}>
        {formattedDate}
      </time>
      <h1 class="text-3xl md:text-4xl font-bold tracking-tight mt-2 mb-4">
        {post.title}
      </h1>
      {post.excerpt && (
        <p class="text-lg text-stone-600">{post.excerpt}</p>
      )}
    </header>

    {coverUrl && (
      <img
        src={coverUrl}
        alt={post.coverAlt || post.title}
        class="w-full rounded-xl mb-8"
      />
    )}

    <div class="prose prose-stone prose-lg max-w-none
                prose-headings:tracking-tight
                prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
                prose-code:bg-stone-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-stone-900 prose-pre:text-stone-100">
      <PortableText
        value={post.body}
        components={{
          block: {
            code: CodeBlock,
            callout: Callout,
          },
        }}
      />
    </div>
  </article>
</Base>
```

### Composant CodeBlock pour le Portable Text

```astro
---
// src/components/portable-text/CodeBlock.astro
const { code, language = 'text', filename } = Astro.props.node;
---

<div class="relative my-6">
  {filename && (
    <div class="bg-stone-800 text-stone-400 text-xs px-4 py-2 rounded-t-lg font-mono">
      {filename}
    </div>
  )}
  <pre class:list={[
    'overflow-x-auto',
    filename ? 'rounded-t-none' : 'rounded-lg',
  ]}><code class={`language-${language}`} set:html={code} /></pre>
</div>
```

## Etape 7 : La pagination

```astro
---
// src/components/Pagination.astro
interface Props {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

const { currentPage, totalPages, basePath } = Astro.props;

const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
const prevPage = currentPage > 1 ? currentPage - 1 : null;
const nextPage = currentPage < totalPages ? currentPage + 1 : null;

function pageUrl(page: number) {
  return page === 1 ? basePath : `${basePath}/${page}`;
}
---

{totalPages > 1 && (
  <nav class="flex items-center justify-center gap-2 mt-12" aria-label="Pagination">
    {prevPage && (
      <a href={pageUrl(prevPage)} class="px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-100 text-sm">
        Precedent
      </a>
    )}

    {pages.map((page) => (
      <a
        href={pageUrl(page)}
        class:list={[
          'w-10 h-10 flex items-center justify-center rounded-lg text-sm',
          page === currentPage
            ? 'bg-indigo-600 text-white'
            : 'border border-stone-200 hover:bg-stone-100',
        ]}
        aria-current={page === currentPage ? 'page' : undefined}
      >
        {page}
      </a>
    ))}

    {nextPage && (
      <a href={pageUrl(nextPage)} class="px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-100 text-sm">
        Suivant
      </a>
    )}
  </nav>
)}
```

## Etape 8 : Le fichier seed

Le fichier `seed.ts` est crucial pour un theme. Il fournit du contenu de demonstration qui permet aux utilisateurs de voir le theme en action immediatement apres l'installation. EmDash execute ce fichier automatiquement lors du premier lancement si la base de donnees est vide.

```typescript
// seed.ts
import { defineEmDashSeed } from '@emdash/core';

export default defineEmDashSeed({
  collections: {
    posts: [
      {
        title: 'Bienvenue sur votre nouveau blog',
        slug: 'bienvenue',
        excerpt: 'Decouvrez comment personnaliser votre site EmDash et commencer a publier.',
        body: [
          {
            _type: 'block',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'Felicitations ! Votre blog EmDash est pret. Cet article de demonstration vous montre les possibilites de l\'editeur.',
              },
            ],
          },
          {
            _type: 'block',
            style: 'h2',
            children: [
              { _type: 'span', text: 'Fonctionnalites de l\'editeur' },
            ],
          },
          {
            _type: 'block',
            style: 'normal',
            children: [
              { _type: 'span', text: 'L\'editeur Portable Text supporte le ' },
              { _type: 'span', text: 'gras', marks: ['strong'] },
              { _type: 'span', text: ', l\'' },
              { _type: 'span', text: 'italique', marks: ['em'] },
              { _type: 'span', text: ', le ' },
              { _type: 'span', text: 'code inline', marks: ['code'] },
              { _type: 'span', text: ', et bien plus.' },
            ],
          },
        ],
        status: 'published',
        featured: true,
        publishedAt: '2026-04-01T10:00:00Z',
        tags: ['emdash', 'bienvenue'],
      },
      {
        title: 'Guide de style typographique',
        slug: 'guide-style',
        excerpt: 'Tous les elements typographiques disponibles dans ce theme.',
        body: [
          {
            _type: 'block',
            style: 'normal',
            children: [
              { _type: 'span', text: 'Cet article presente tous les styles disponibles dans ce theme : titres, listes, citations, blocs de code, et plus encore.' },
            ],
          },
        ],
        status: 'published',
        featured: false,
        publishedAt: '2026-04-01T09:00:00Z',
        tags: ['theme', 'typographie'],
      },
    ],
    pages: [
      {
        title: 'A propos',
        slug: 'a-propos',
        body: [
          {
            _type: 'block',
            style: 'normal',
            children: [
              { _type: 'span', text: 'Ce site est propulse par EmDash, le CMS serverless de Cloudflare.' },
            ],
          },
        ],
        status: 'published',
      },
    ],
  },
});
```

## Etape 9 : Configurer Tailwind

```javascript
// tailwind.config.mjs
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Variable', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono Variable', ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
```

Installez le plugin Typography :

```bash
npm install @tailwindcss/typography
```

## Publier votre theme

Pour partager votre theme, publiez-le sur npm :

```json
{
  "name": "@votre-nom/emdash-theme-blog",
  "version": "1.0.0",
  "keywords": ["emdash-theme", "astro", "blog"],
  "emdash": {
    "type": "theme",
    "collections": ["posts", "pages"],
    "preview": "https://votre-demo.pages.dev"
  }
}
```

Les utilisateurs pourront l'installer via le CLI EmDash :

```bash
npm create emdash@latest -- --theme @votre-nom/emdash-theme-blog
```

## Prochaines etapes

Vous avez maintenant un theme EmDash complet avec des layouts, des composants reutilisables, du contenu seed et du style Tailwind. Le prochain tutoriel explore la [creation de plugins](/tutoriels/premier-plugin) pour etendre les fonctionnalites d'EmDash.

## Pour aller plus loin

- [Theme Blog Starter](/themes/theme-blog) --- un theme pret a l'emploi pour s'inspirer
- [Theme Marketing](/themes/theme-marketing) --- un exemple de theme oriente landing pages
- [Theme Portfolio](/themes/theme-portfolio) --- un theme galerie de projets
- [Creer un theme custom avance](/themes/creer-theme-custom) --- aller plus loin dans la personnalisation
- [Guide complet du Portable Text](/guides/portable-text-guide) --- maitriser le rendu du contenu riche
