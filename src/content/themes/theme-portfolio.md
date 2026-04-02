---
title: "Test du theme Portfolio : montrez vos projets avec EmDash"
description: "Test complet du theme Portfolio Starter pour EmDash : grille de projets, filtrage par tags, etudes de cas, flux RSS et conseils de personnalisation."
date: "2026-04-02"
author: "Equipe EmDash FR"
tags: ["emdash", "themes", "portfolio", "projets", "design"]
themeName: "Portfolio Starter"
themeVersion: "0.1.0"
rating: 5
---

# Test du theme Portfolio : montrez vos projets avec EmDash

Designers, developpeurs, photographes, architectes : le **Portfolio Starter** est le theme EmDash pense pour mettre en valeur vos realisations. Avec sa grille de projets elegante, son systeme de filtrage par tags, ses pages d'etude de cas detaillees et son flux RSS, il offre tout ce qu'il faut pour presenter un travail creatif de maniere professionnelle. Voici notre test approfondi.

## Premiere impression

Des l'installation, le Portfolio Starter impressionne par la qualite de son design par defaut. La page d'accueil affiche une grille de projets en maconnerie (masonry layout) avec des transitions fluides au survol. Chaque vignette revele le titre du projet, la categorie et un bref extrait au passage de la souris. L'ensemble degage une impression de sophistication sans surcharge visuelle.

Le theme est livre avec six projets de demonstration qui couvrent differents formats : photographie, design UI, branding, developpement web, illustration et architecture. Ces projets fictifs permettent de visualiser immediatement le rendu final et servent de modele pour ajouter vos propres realisations.

## Grille de projets

Le coeur du theme est sa grille de projets. Elle repose sur un layout CSS Grid avec un algorithme de masonry implemente en JavaScript progressif. Sur les navigateurs qui supportent le masonry CSS natif, le JavaScript n'est pas charge.

La grille propose trois modes d'affichage :
- **Masonry** : disposition en colonnes avec hauteurs variables, ideale pour la photographie
- **Uniforme** : toutes les vignettes ont la meme hauteur, plus adapte au design UI
- **Liste** : affichage en rangees horizontales avec image a gauche et description a droite

Le mode d'affichage est configurable dans `emdash.config.ts` et peut aussi etre bascule par le visiteur via des boutons dans l'interface.

## Filtrage par tags

Un systeme de filtrage cote client permet aux visiteurs de filtrer les projets par tag. Les boutons de filtre sont generes automatiquement a partir des tags utilises dans vos projets. Le filtrage est anime avec des transitions CSS pour une experience fluide.

```astro
---
const projects = await getEmDashCollection("projects");
const allTags = [...new Set(projects.flatMap(p => p.data.tags))];
---
<div class="filter-bar">
  <button class="filter-btn active" data-tag="all">Tous</button>
  {allTags.map(tag => (
    <button class="filter-btn" data-tag={tag}>{tag}</button>
  ))}
</div>
```

Le filtrage fonctionne sans rechargement de page. L'URL est mise a jour avec un parametre de requete (`?tag=design`) pour que les liens filtres soient partageables.

## Pages d'etude de cas

Chaque projet dispose d'une page detaillee concue comme une etude de cas (case study). La structure par defaut comprend :

1. **En-tete hero** avec image plein ecran, titre et metadonnees (client, date, role, technologies)
2. **Introduction** decrivant le contexte et les objectifs du projet
3. **Galerie** avec lightbox integree pour les visuels haute resolution
4. **Description du processus** avec sections titre/texte/image alternees
5. **Resultats** avec des chiffres cles mis en avant
6. **Navigation** vers le projet precedent et le projet suivant

La page d'etude de cas utilise un layout dedie (`CaseStudyLayout.astro`) qui gere automatiquement les metadonnees SEO et Open Graph, y compris une image de previsualisation optimisee pour le partage sur les reseaux sociaux.

### Structure du contenu

Chaque projet est defini par un fichier dans la collection EmDash `projects`. Le schema inclut :

- `title` : nom du projet
- `slug` : URL personnalisee
- `excerpt` : description courte pour la grille
- `coverImage` : image de couverture
- `tags` : liste de tags pour le filtrage
- `client` : nom du client (optionnel)
- `date` : date de realisation
- `role` : votre role dans le projet
- `technologies` : technologies utilisees
- `body` : contenu Markdown de l'etude de cas

## Flux RSS

Un flux RSS est genere pour les projets, ce qui permet aux visiteurs de suivre vos nouvelles realisations via leur lecteur de flux. Le flux inclut l'image de couverture, le titre, l'extrait et le lien vers l'etude de cas. Cette fonctionnalite est particulierement utile pour les createurs qui publient regulierement.

## Ajouter vos propres projets

L'ajout d'un projet se fait de deux manieres :

### Via l'administration EmDash

Depuis le panneau d'administration, creez une nouvelle entree dans la collection `projects`. Remplissez les champs, uploadez vos images et redigez l'etude de cas en Markdown. Le projet apparaitra automatiquement dans la grille apres publication.

### Via le code

Vous pouvez egalement creer un fichier Markdown dans le dossier `src/content/projects/`. C'est pratique pour les migrations ou les imports en masse.

```markdown
---
title: "Refonte de l'identite visuelle Acme Corp"
slug: "acme-branding"
excerpt: "Une identite visuelle moderne pour une entreprise centenaire."
coverImage: "./images/acme-cover.jpg"
tags: ["branding", "identite-visuelle"]
client: "Acme Corp"
date: "2026-03-15"
role: "Directeur artistique"
technologies: ["Figma", "Illustrator"]
---

## Contexte

Acme Corp souhaitait moderniser son image de marque...
```

## Personnalisation du style

### Couleurs et ambiance

Le theme propose trois presets de couleurs :
- **Clair** : fond blanc, accents indigo -- professionnel et neutre
- **Sombre** : fond anthracite, accents dores -- elegant et haut de gamme
- **Contraste** : fond noir pur, texte blanc, accents neon -- audacieux et moderne

Chaque preset est un fichier CSS de variables que vous pouvez modifier ou remplacer. Vous pouvez aussi creer votre propre preset en dupliquant l'un des fichiers existants.

### Typographie

Le theme utilise une combinaison de polices bien equilibree : une sans-serif geometrique pour les titres (Space Grotesk) et une sans-serif humaniste pour le corps (DM Sans). Le fichier `tokens.css` permet de remplacer ces choix en une ligne.

### Animations

Les animations de transition entre la grille et les pages de detail sont gerees par les View Transitions d'Astro. L'image de couverture du projet "morphe" de sa position dans la grille vers la position hero de l'etude de cas, creant une transition visuelle elegante.

Vous pouvez ajuster la duree et la courbe des animations dans le fichier `transitions.css`, ou les desactiver completement si vous preferez des transitions instantanees.

## Architecture du theme

```
src/
├── pages/
│   ├── index.astro           # Grille de projets
│   ├── projects/[slug].astro # Page etude de cas
│   ├── about.astro            # Page a propos
│   └── rss.xml.ts             # Flux RSS
├── layouts/
│   ├── BaseLayout.astro
│   └── CaseStudyLayout.astro
├── components/
│   ├── ProjectGrid.astro
│   ├── ProjectCard.astro
│   ├── FilterBar.astro
│   ├── Gallery.astro
│   ├── Lightbox.astro
│   └── ProjectNav.astro
└── styles/
    ├── tokens.css
    ├── presets/
    │   ├── light.css
    │   ├── dark.css
    │   └── contrast.css
    └── transitions.css
```

## Points forts et limites

**Points forts :**
- Design sophistique et professionnel des la premiere utilisation
- Grille masonry avec trois modes d'affichage
- Pages d'etude de cas completes et bien structurees
- View Transitions elegantes entre grille et detail
- Filtrage par tags fluide et animee
- Trois presets de couleurs inclus

**Limites :**
- Le theme est specialise portfolio : l'ajout d'un blog necessite de combiner avec le [Blog Starter](/themes/theme-blog) ou un travail supplementaire
- La lightbox de galerie pourrait beneficier de gestes tactiles plus avances sur mobile

## Notre verdict

Le Portfolio Starter est le theme le plus abouti de l'ecosysteme EmDash. Le design par defaut est suffisamment elegant pour etre utilise tel quel, les pages d'etude de cas offrent une structure professionnelle et les View Transitions ajoutent une touche de raffinement. C'est un theme que l'on peut recommander les yeux fermes a tout createur souhaitant presenter ses realisations avec EmDash. Et pour aller encore plus loin, le tutoriel [creer un theme EmDash](/tutoriels/creer-theme-emdash) vous montrera comment le personnaliser en profondeur.

**Note : 5/5** -- Le theme portfolio de reference pour EmDash, a la fois beau, fonctionnel et facile a personnaliser.

## Pour aller plus loin

- [Creer un theme EmDash sur mesure](/tutoriels/creer-theme-emdash) -- personnalisez le Portfolio Starter ou creez le votre
- [Theme Blog Starter](/themes/theme-blog) -- ajoutez un blog a votre portfolio
- [Theme Marketing](/themes/theme-marketing) -- combinez portfolio et site vitrine
- [Creer un theme custom de A a Z](/themes/creer-theme-custom) -- guide pratique complet
