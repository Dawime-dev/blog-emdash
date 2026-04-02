---
title: "Test du theme Marketing : votre site vitrine avec EmDash"
description: "Analyse detaillee du theme Marketing Starter pour EmDash : composants hero, grille de fonctionnalites, tarifs, FAQ et formulaire de contact."
date: "2026-04-02"
author: "Equipe EmDash FR"
tags: ["emdash", "themes", "marketing", "site-vitrine", "landing-page"]
themeName: "Marketing Starter"
themeVersion: "0.1.0"
rating: 4
---

# Test du theme Marketing : votre site vitrine avec EmDash

EmDash n'est pas reserve aux blogs. Le **Marketing Starter** prouve qu'un CMS headless moderne peut parfaitement servir de fondation pour un site vitrine professionnel. Ce theme officiel reunit tous les composants necessaires pour presenter un produit, un service ou une entreprise : hero accrocheur, grille de fonctionnalites, cartes de tarification, FAQ en accordeon et formulaire de contact. Passons-le au crible.

## A qui s'adresse ce theme ?

Le Marketing Starter cible les startups, les independants et les petites entreprises qui souhaitent mettre en ligne un site vitrine performant sans recourir a un page builder lourd. Il convient egalement aux equipes produit qui cherchent un template de landing page rapide a deployer pour valider un positionnement ou lancer une campagne.

Contrairement a des outils comme Webflow ou Framer, le Marketing Starter repose sur du code Astro standard, ce qui offre un controle total sur le rendu, le SEO et les performances.

## Les composants cles

### Section Hero

Le composant hero occupe toute la largeur de l'ecran et propose deux variantes : une version avec image de fond et une version avec illustration laterale. Le titre, le sous-titre et les boutons d'appel a l'action sont editables depuis le panneau d'administration EmDash. Un effet de parallaxe subtil est disponible en option.

```astro
---
const hero = await getEmDashEntry("sections", "hero");
---
<section class="hero">
  <h1>{hero.data.title}</h1>
  <p>{hero.data.subtitle}</p>
  <a href={hero.data.ctaPrimaryUrl} class="btn btn-primary">
    {hero.data.ctaPrimaryText}
  </a>
</section>
```

Le contenu est entierement gere par EmDash, ce qui permet a l'equipe marketing de modifier les textes sans deployer une nouvelle version du site.

### Grille de fonctionnalites (Feature Grid)

Ce composant affiche jusqu'a douze fonctionnalites sous forme de cartes avec icone, titre et description. La grille est responsive : trois colonnes sur desktop, deux sur tablette, une sur mobile. Chaque carte supporte un lien optionnel vers une page de detail.

Les icones sont au format SVG et chargees depuis le dossier `public/icons/`. Vous pouvez utiliser n'importe quel jeu d'icones compatible SVG ou simplement remplacer les fichiers existants.

### Cartes de tarification (Pricing Cards)

Le composant de tarification presente jusqu'a quatre plans cote a cote. Chaque plan affiche son nom, son prix, sa periodicite, une liste de fonctionnalites incluses et un bouton d'action. Le plan recommande est mis en avant visuellement avec une bordure coloree et un badge "Populaire".

Les donnees de tarification sont stockees dans une collection EmDash dediee (`pricing`), ce qui permet de mettre a jour les prix sans toucher au code. Le composant gere aussi le basculement mensuel/annuel via un toggle anime.

### FAQ en accordeon

La section FAQ utilise un composant accordeon accessible conforme aux standards ARIA. Chaque question est un `<details>` / `<summary>` enrichi par du JavaScript pour les animations d'ouverture et de fermeture. Les questions sont editables depuis l'administration EmDash et triees par ordre de priorite.

L'accordeon supporte le Markdown dans les reponses, ce qui permet d'inclure des liens, des listes et du formatage riche.

### Formulaire de contact

Le formulaire de contact fonctionne de pair avec le plugin officiel **Forms** d'EmDash (vendu separement ou inclus dans le plan Pro). Il propose des champs nom, email, sujet et message, avec validation cote client et cote serveur. Les soumissions sont stockees dans EmDash et peuvent declencher une notification par email ou webhook.

Si le plugin Forms n'est pas installe, le formulaire peut etre configure pour envoyer les donnees vers un endpoint externe (Formspree, Netlify Forms, etc.) via un simple changement d'attribut `action`.

## Architecture des composants

Le theme suit une architecture modulaire stricte. Chaque section de la page est un composant Astro autonome importe dans la page principale.

```
src/
├── pages/
│   ├── index.astro          # Page d'accueil
│   ├── about.astro           # Page a propos
│   ├── pricing.astro         # Page tarifs detaillee
│   └── contact.astro         # Page contact
├── layouts/
│   └── MarketingLayout.astro
├── components/
│   ├── Hero.astro
│   ├── FeatureGrid.astro
│   ├── PricingCards.astro
│   ├── PricingToggle.astro
│   ├── FaqAccordion.astro
│   ├── ContactForm.astro
│   ├── Testimonials.astro
│   ├── LogoCloud.astro
│   └── CallToAction.astro
└── styles/
    ├── tokens.css
    └── marketing.css
```

Chaque composant peut etre utilise independamment. Vous pouvez recomposer la page d'accueil en reordonnant les imports dans `index.astro`.

## Personnalisation pour votre marque

### Palette de couleurs

Comme pour tous les themes EmDash, les couleurs sont centralisees dans un fichier de design tokens. Le Marketing Starter propose par defaut une palette indigo/blanc, mais il suffit de modifier quelques variables CSS pour l'adapter a votre charte graphique.

### Typographie

Le theme utilise la police Inter pour les titres et le corps de texte. Vous pouvez facilement basculer vers une police Google Fonts ou une police auto-hebergee en modifiant le fichier `tokens.css` et le `<link>` dans le layout.

### Images et illustrations

Le dossier `public/images/` contient des illustrations placeholder au format SVG. Remplacez-les par vos propres visuels. Le composant Hero supporte les formats WebP et AVIF avec fallback JPEG grace a l'integration d'Astro Image.

### Sections supplementaires

Le theme inclut deux composants bonus souvent necessaires sur un site vitrine :
- **Testimonials** : un carrousel de temoignages clients avec photo, nom, poste et citation.
- **LogoCloud** : une bande de logos de partenaires ou clients, avec defilement automatique optionnel.

## SEO et performances

Le Marketing Starter est optimise pour le referencement naturel. Chaque page genere automatiquement les balises Open Graph, les donnees structurees schema.org (Organization, Product, FAQ) et un sitemap XML. Le score Lighthouse typique depasse 95 sur les quatre criteres.

Le theme profite pleinement de l'approche "zero JavaScript par defaut" d'Astro. Les composants interactifs (toggle de prix, accordeon FAQ) utilisent des directives `client:visible` pour ne charger le JavaScript que lorsque necessaire.

## Points forts et limites

**Points forts :**
- Composants marketing complets et professionnels
- Contenu 100 % editable depuis l'admin EmDash
- Excellent SEO et performances out of the box
- Architecture modulaire facile a etendre
- Composants accessibles (ARIA, navigation clavier)

**Limites :**
- Le design par defaut est generique ; un travail de personnalisation visuelle est necessaire pour se demarquer
- L'absence de templates de pages interieures (blog, documentation) oblige a combiner avec un autre theme comme le [Blog Starter](/themes/theme-blog) ou a les creer soi-meme

## Notre verdict

Le Marketing Starter est un excellent point de depart pour tout site vitrine propulse par EmDash. Les composants couvrent les besoins essentiels d'une landing page moderne, le contenu est entierement gere par le CMS et les performances sont au rendez-vous. Il manque quelques templates de pages interieures pour en faire une solution complete, mais l'architecture modulaire permet de combler ces lacunes facilement. Pour personnaliser le theme en profondeur, consultez le tutoriel [creer un theme EmDash](/tutoriels/creer-theme-emdash).

**Note : 4/5** -- Un theme marketing solide qui remplit sa promesse de site vitrine professionnel et performant.

## Pour aller plus loin

- [Creer un theme EmDash sur mesure](/tutoriels/creer-theme-emdash) -- personnalisez le Marketing Starter ou partez de zero
- [Theme Blog Starter](/themes/theme-blog) -- ajoutez un blog a votre site vitrine
- [Theme Portfolio](/themes/theme-portfolio) -- presentez vos projets et realisations
- [Deployer sur Cloudflare](/tutoriels/deployer-cloudflare) -- mettez votre site vitrine en production
