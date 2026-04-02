---
title: "Portable Text : le format de contenu qui change tout"
description: "Decouvrez Portable Text, le format de contenu structure adopte par EmDash. Comprenez pourquoi il est superieur au HTML serialise de WordPress et comment l'utiliser avec l'editeur TipTap et les composants Astro."
date: "2026-04-02"
author: "Equipe EmDash FR"
category: "Contenu"
tags: ["emdash", "portable-text", "contenu", "tiptap", "astro", "json"]
difficulty: "intermediaire"
---

# Portable Text : le format de contenu qui change tout

Quand on parle de gestion de contenu, on pense souvent a l'editeur -- l'interface que l'on utilise pour ecrire. Mais le format dans lequel ce contenu est stocke est tout aussi fondamental, sinon plus. EmDash a fait un choix radical en adoptant Portable Text, un format de contenu structure en JSON qui rompt avec des decennies de traditions HTML. Ce guide vous explique pourquoi ce choix change la donne et comment en tirer le meilleur parti.

## Qu'est-ce que Portable Text ?

Portable Text est un format de contenu structure originellement concu par Sanity.io. Au lieu de stocker le contenu sous forme de chaine HTML (comme `<p>Bonjour <strong>monde</strong></p>`), Portable Text represente le contenu comme un arbre JSON :

```json
[
  {
    "_type": "block",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "text": "Bonjour "
      },
      {
        "_type": "span",
        "text": "monde",
        "marks": ["strong"]
      }
    ]
  }
]
```

A premiere vue, cela peut sembler plus verbeux que du HTML. Mais cette representation structuree offre des avantages considerables que nous allons explorer en detail.

## Pourquoi c'est mieux que les blocs WordPress

WordPress a introduit son editeur de blocs (Gutenberg) en 2018. Bien que ce fut un pas en avant par rapport a l'editeur classique TinyMCE, Gutenberg souffre d'un probleme fondamental : les blocs sont serialises en HTML avec des commentaires speciaux comme delimiteurs. (Pour une comparaison complete des deux plateformes, consultez notre [guide EmDash vs WordPress](/guides/emdash-vs-wordpress).)

```html
<!-- wp:paragraph -->
<p>Ceci est un paragraphe WordPress.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":42,"sizeSlug":"large"} -->
<figure class="wp-block-image size-large">
  <img src="/uploads/photo.jpg" alt="" class="wp-image-42"/>
</figure>
<!-- /wp:image -->
```

Les problemes de cette approche sont nombreux :

### Fragilite du parsing

Le contenu WordPress est essentiellement une chaine de texte qui doit etre parsee avec des expressions regulieres pour extraire les blocs. Si un plugin mal ecrit modifie legerement le HTML, toute la structure peut se casser. Avec Portable Text, le contenu est du JSON natif -- il n'y a pas de parsing fragile, pas de regex, pas d'ambiguite.

### Couplage au HTML

Le contenu WordPress est intrinsequement lie au HTML. Si vous voulez afficher ce contenu dans une application mobile native, un email, ou un assistant vocal, vous devez parser le HTML, extraire la semantique, puis reconstruire dans le format cible. Avec Portable Text, le contenu est semantique par nature : vous savez qu'un element est un titre, une image, une citation -- pas simplement un `<h2>` ou un `<blockquote>`.

### Metadonnees limitees

Dans WordPress, les metadonnees d'un bloc sont cachees dans un commentaire JSON. C'est fragile, difficile a interroger en base de donnees et impossible a indexer efficacement. Portable Text stocke les metadonnees comme des proprietes JSON de premier niveau, ce qui les rend facilement interrogeables et indexables.

### Validation impossible

Comment valider qu'un contenu WordPress est "correct" ? C'est extremement difficile car le format n'a pas de schema strict. Portable Text, etant du JSON structure, peut etre valide contre un schema JSON, garantissant l'integrite du contenu a chaque sauvegarde.

## L'integration de l'editeur TipTap

EmDash utilise TipTap comme editeur de contenu riche dans son interface d'administration. TipTap est un framework d'edition base sur ProseMirror, reconnu pour sa robustesse et sa flexibilite.

L'integration entre TipTap et Portable Text dans EmDash fonctionne de maniere bidirectionnelle :

1. **Chargement** : Quand un contenu est charge dans l'editeur, le JSON Portable Text est converti en document ProseMirror via un transformateur dedie.
2. **Edition** : L'utilisateur edite le contenu dans TipTap avec une experience WYSIWYG complete -- gras, italique, titres, listes, images, tout fonctionne de maniere intuitive.
3. **Sauvegarde** : Quand l'utilisateur sauvegarde, le document ProseMirror est reconverti en Portable Text et stocke en base de donnees.

```typescript
// Configuration TipTap dans EmDash (simplifiee)
import { useEditor } from '@tiptap/react';
import { portableTextToTiptap, tiptapToPortableText } from '@emdash-cms/blocks';

const editor = useEditor({
  extensions: [
    StarterKit,
    Image,
    CodeBlock,
    // Extensions personnalisees EmDash
    PortableTextBlock,
    CustomAnnotation,
  ],
  content: portableTextToTiptap(initialContent),
  onUpdate: ({ editor }) => {
    const portableText = tiptapToPortableText(editor.getJSON());
    saveContent(portableText);
  },
});
```

L'experience d'edition est fluide et moderne. L'editeur supporte nativement le glisser-deposer pour reorganiser les blocs, les raccourcis clavier standards (Ctrl+B pour gras, Ctrl+I pour italique, etc.), et un menu contextuel qui apparait lors de la selection de texte.

## Types de blocs personnalises

L'une des forces majeures de Portable Text est la possibilite de definir des types de blocs personnalises. EmDash pousse cette fonctionnalite encore plus loin en permettant de creer des blocs avec leur propre interface d'edition et leur propre logique de rendu.

```typescript
// Definition d'un bloc personnalise "appel a l'action"
export const callToAction = defineBlock({
  name: 'callToAction',
  title: 'Appel a l\'action',
  fields: {
    heading: field.text({ required: true }),
    description: field.text(),
    buttonText: field.text({ required: true }),
    buttonUrl: field.url({ required: true }),
    variant: field.select({
      options: ['primary', 'secondary', 'accent'],
      default: 'primary',
    }),
  },
  icon: 'megaphone',
  preview: (values) => ({
    title: values.heading,
    subtitle: values.buttonText,
  }),
});
```

Ce bloc apparait ensuite dans l'editeur TipTap comme un element insertable. Quand l'utilisateur l'insere, un formulaire s'affiche pour remplir les champs. Le bloc est stocke dans le Portable Text comme un objet JSON avec toutes ses proprietes :

```json
{
  "_type": "callToAction",
  "heading": "Pret a demarrer ?",
  "description": "Lancez votre site EmDash en moins de 5 minutes.",
  "buttonText": "Commencer gratuitement",
  "buttonUrl": "/inscription",
  "variant": "primary"
}
```

Parmi les blocs personnalises courants, on retrouve : les galeries d'images, les integrations de videos, les tableaux de comparaison, les temoignages clients, les blocs de code avec coloration syntaxique, les formulaires embarques, les cartes interactives et les widgets de reseaux sociaux.

## Rendu du Portable Text dans les composants Astro

Le rendu du Portable Text dans Astro est assure par le package `@emdash-cms/blocks`, qui fournit un composant `PortableText` hautement configurable :

```astro
---
// src/pages/article/[slug].astro
import { PortableText } from '@emdash-cms/blocks';
import CallToAction from '../components/CallToAction.astro';
import CodeBlock from '../components/CodeBlock.astro';
import ImageGallery from '../components/ImageGallery.astro';

const { cms } = Astro.locals;
const article = await cms.collection('articles').findOne({
  where: { slug: Astro.params.slug },
});

const components = {
  // Blocs personnalises
  callToAction: CallToAction,
  codeBlock: CodeBlock,
  imageGallery: ImageGallery,

  // Surcharge des blocs standards
  block: {
    h1: 'h1',
    h2: 'h2',
    blockquote: 'blockquote',
    normal: 'p',
  },

  // Annotations (liens, etc.)
  marks: {
    link: ({ children, value }) => (
      `<a href="${value.href}" class="text-blue-600 hover:underline">${children}</a>`
    ),
    highlight: ({ children }) => (
      `<mark class="bg-yellow-200 px-1">${children}</mark>`
    ),
  },
};
---

<article class="prose prose-lg max-w-3xl mx-auto">
  <h1>{article.title}</h1>
  <PortableText value={article.content} {components} />
</article>
```

Le composant `PortableText` parcourt l'arbre JSON et rend chaque noeud avec le composant correspondant. Si aucun composant n'est specifie pour un type donne, un rendu HTML par defaut est utilise.

### Rendu multi-plateforme

Puisque le contenu est du JSON structure, rien ne vous empeche de creer des renderers pour d'autres plateformes. EmDash fournit des renderers pour :

- **HTML** : le rendu web standard
- **React Native** : pour les applications mobiles
- **Texte brut** : pour les emails, les flux RSS, les previews
- **Markdown** : pour l'export et l'interoperabilite

Vous pouvez aussi creer votre propre renderer pour n'importe quel format de sortie :

```typescript
import { renderPortableText } from '@emdash-cms/blocks';

const slackMarkdown = renderPortableText(content, {
  block: {
    h1: (children) => `*${children}*\n`,
    normal: (children) => `${children}\n`,
    blockquote: (children) => `> ${children}\n`,
  },
  marks: {
    strong: (children) => `*${children}*`,
    em: (children) => `_${children}_`,
    link: (children, { href }) => `<${href}|${children}>`,
  },
});
```

## Requetes sur le contenu structure

Un avantage souvent sous-estime du Portable Text est la possibilite d'interroger le contenu de maniere structuree. Puisque le contenu est du JSON stocke en base de donnees, EmDash peut offrir des requetes avancees :

```typescript
// Trouver tous les articles qui contiennent un bloc "callToAction"
const articlesWithCTA = await cms.collection('articles').findMany({
  where: {
    content: {
      hasBlockType: 'callToAction',
    },
  },
});

// Extraire toutes les images d'un article
const images = extractBlocks(article.content, 'image');
```

Ce type de requete est simplement impossible avec du HTML serialise. Avec Portable Text, le contenu devient veritablement interrogeable et manipulable.

## Conclusion

Portable Text represente un changement de paradigme dans la facon dont nous pensons le contenu web. En passant d'une chaine HTML opaque a un arbre JSON structure, EmDash offre une flexibilite sans precedent : rendu multi-plateforme, blocs personnalises, validation stricte, requetes avancees et une experience d'edition moderne grace a TipTap.

Si vous venez du monde WordPress, l'adaptation demande un leger effort conceptuel. Mais une fois que vous aurez compris la puissance du contenu structure, vous ne voudrez plus jamais revenir au HTML serialise. Portable Text n'est pas simplement un meilleur format de stockage -- c'est une meilleure facon de penser le contenu. Si vous envisagez une migration, notre [tutoriel de migration WordPress](/tutoriels/migration-wordpress) vous accompagne pas a pas.

## Pour aller plus loin

- [Creer votre premier contenu avec EmDash](/tutoriels/premier-contenu) -- mettez en pratique Portable Text en creant vos premiers articles.
- [Architecture d'EmDash](/guides/architecture-emdash) -- comprenez comment Portable Text s'integre dans l'architecture globale du CMS.
- [Creer un theme EmDash](/tutoriels/creer-theme-emdash) -- apprenez a rendre du Portable Text dans vos propres composants Astro.
- [EmDash vs WordPress](/guides/emdash-vs-wordpress) -- une comparaison complete entre les deux CMS, incluant le stockage du contenu.
- [Migrer de WordPress vers EmDash](/tutoriels/migration-wordpress) -- convertissez automatiquement votre contenu Gutenberg en Portable Text.
