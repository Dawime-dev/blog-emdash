---
title: "Creer votre premier contenu avec EmDash"
description: "Apprenez a creer des types de contenu, configurer l'editeur Portable Text, gerer les brouillons et la publication programmee dans EmDash."
date: "2026-04-02"
author: "Equipe EmDash FR"
category: "Contenu"
tags: ["emdash", "contenu", "portable-text", "collections", "editeur"]
difficulty: "debutant"
duration: "15 min"
---

# Creer votre premier contenu avec EmDash

Maintenant que votre [installation EmDash](/tutoriels/installer-emdash) est operationnelle, il est temps de creer du contenu. EmDash adopte une approche unique : chaque type de contenu que vous definissez correspond a une vraie table SQL dans la base de donnees. Pas de JSON stocke dans un champ texte, pas de serialisation obscure --- vos donnees sont structurees, indexables et performantes.

## Comprendre les collections EmDash

Dans EmDash, un **type de contenu** s'appelle une **collection**. Chaque collection est representee par :

- Une table SQL dans la base de donnees (prefixee par `ec_`, par exemple `ec_posts`, `ec_pages`)
- Un schema de champs configurable via l'interface d'administration
- Un endpoint [API REST](/tutoriels/api-rest-emdash) automatique
- Une fonction de requete cote Astro

Le theme Starter Blog est livre avec deux collections par defaut : **Articles** (`ec_posts`) et **Pages** (`ec_pages`). Nous allons explorer celles-ci, puis creer une collection personnalisee.

## Le constructeur de schemas visuel

Rendez-vous dans le panneau d'administration a `/_emdash/admin` et cliquez sur **Contenu > Types de contenu**. Vous y trouverez le constructeur de schemas visuel (Schema Builder).

### Creer une nouvelle collection

Cliquons sur **Nouveau type de contenu** et creons une collection "Projets" pour un portfolio :

1. **Nom de la collection** : `Projets`
2. **Identifiant** : `projets` (genere automatiquement, editable)
3. **Nom de la table** : `ec_projets` (genere automatiquement)
4. **Icone** : choisissez l'icone dossier

### Ajouter des champs

EmDash propose les types de champs suivants :

| Type | Description | Colonne SQL |
|------|-------------|-------------|
| `text` | Texte court (titre, nom) | `VARCHAR(255)` |
| `richtext` | Editeur Portable Text | `JSONB` |
| `number` | Nombre entier ou decimal | `REAL` |
| `boolean` | Case a cocher | `INTEGER (0/1)` |
| `date` | Date et/ou heure | `TEXT (ISO 8601)` |
| `image` | Reference media | `TEXT (media ID)` |
| `select` | Liste deroulante | `VARCHAR(255)` |
| `relation` | Lien vers une autre collection | `TEXT (foreign key)` |
| `json` | Donnees JSON libres | `JSONB` |
| `slug` | Slug URL auto-genere | `VARCHAR(255) UNIQUE` |

Pour notre collection "Projets", ajoutons les champs suivants via l'interface :

- **Titre** (`titre`) --- Type : `text`, obligatoire, utilise comme titre d'affichage
- **Slug** (`slug`) --- Type : `slug`, genere depuis le titre
- **Description** (`description`) --- Type : `richtext`
- **Image de couverture** (`cover`) --- Type : `image`
- **Client** (`client`) --- Type : `text`
- **Date du projet** (`date_projet`) --- Type : `date`
- **Technologies** (`technologies`) --- Type : `select`, multiple, options : Astro, React, Vue, Svelte, etc.
- **En vedette** (`featured`) --- Type : `boolean`, defaut : `false`
- **URL du projet** (`url`) --- Type : `text`, validation URL

Chaque champ peut etre configure avec :

- **Obligatoire** : le contenu ne peut pas etre sauvegarde sans ce champ
- **Unique** : la valeur doit etre unique dans la collection
- **Valeur par defaut** : valeur pre-remplie lors de la creation
- **Aide** : texte d'aide affiche sous le champ dans l'editeur
- **Validation** : regles de validation (longueur min/max, regex, plage de nombres)

Lorsque vous sauvegardez le type de contenu, EmDash execute automatiquement les migrations SQL necessaires. Si vous ajoutez un champ a une collection existante, une instruction `ALTER TABLE` est generee. Aucune intervention manuelle n'est requise.

## L'editeur Portable Text

Pour les champs de type `richtext`, EmDash utilise un editeur base sur **[Portable Text](/guides/portable-text-guide)**, un format de texte riche structure et portable. Contrairement au HTML brut, Portable Text stocke le contenu sous forme d'arbre JSON, ce qui permet :

- Un rendu flexible (HTML, React, Vue, texte brut, etc.)
- Une serialisation fiable sans problemes de parsing HTML
- Des blocs personnalises (code, callouts, embeds, etc.)

### Configurer l'editeur

Dans les parametres du champ `richtext`, vous pouvez activer ou desactiver les fonctionnalites de l'editeur :

```
Styles de texte : Paragraphe, Titre 2, Titre 3, Titre 4, Citation
Marques : Gras, Italique, Code, Lien, Surligner
Blocs : Image, Code (avec coloration syntaxique), Callout, Embed
Listes : Liste a puces, Liste numerotee
```

### Ajouter un bloc personnalise

Vous pouvez definir vos propres blocs Portable Text. Par exemple, un bloc "Astuce" :

```typescript
// Dans la configuration du champ richtext
{
  type: 'richtext',
  name: 'description',
  blocks: [
    // Blocs par defaut inclus automatiquement
    {
      name: 'astuce',
      title: 'Astuce',
      icon: 'lightbulb',
      fields: [
        { name: 'type', type: 'select', options: ['info', 'warning', 'danger'] },
        { name: 'contenu', type: 'richtext' },
      ],
    },
  ],
}
```

Ce bloc apparaitra dans la barre d'outils de l'editeur et sera stocke dans le JSON Portable Text. Cote frontend, vous le rendrez avec un composant Astro dedie.

## Creer et publier du contenu

### Rediger un article

Allez dans **Contenu > Articles** et cliquez sur **Nouveau**. L'editeur s'ouvre avec les champs definis dans le schema :

1. Remplissez le **Titre** --- le slug est genere automatiquement
2. Redigez le corps de l'article dans l'editeur Portable Text
3. Ajoutez une **image de couverture** via la bibliotheque media (glisser-deposer supporte)
4. Selectionnez une **categorie** et ajoutez des **tags**

### Statuts de publication

Chaque contenu dans EmDash possede un statut :

- **Brouillon** (`draft`) --- Visible uniquement dans l'admin, pas sur le site
- **En revision** (`review`) --- Soumis pour relecture par un editeur
- **Publie** (`published`) --- Visible sur le site public
- **Programme** (`scheduled`) --- Sera publie automatiquement a la date/heure choisie
- **Archive** (`archived`) --- Retire du site mais conserve dans la base

### Publication programmee

Pour programmer un article, selectionnez le statut **Programme** et definissez la date et l'heure de publication. EmDash utilise un cron interne (en mode Node.js) ou un Cloudflare Cron Trigger (en production) pour publier automatiquement le contenu a l'heure prevue.

```
Statut : Programme
Date de publication : 2026-04-15 09:00 (Europe/Paris)
```

Le fuseau horaire est configurable dans les parametres generaux d'EmDash.

## Interroger le contenu cote Astro

La puissance d'EmDash reside dans son integration native avec Astro. Vous pouvez interroger vos collections directement dans vos composants `.astro` :

```astro
---
// src/pages/index.astro
import { getEmDashCollection } from '@emdash/astro';
import PostCard from '../components/PostCard.astro';

// Recuperer les 10 derniers articles publies
const posts = await getEmDashCollection('posts', {
  status: 'published',
  orderBy: 'publishedAt',
  order: 'desc',
  limit: 10,
});
---

<main>
  <h1>Derniers articles</h1>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    {posts.map((post) => (
      <PostCard post={post} />
    ))}
  </div>
</main>
```

### Requetes avancees

La fonction `getEmDashCollection` accepte des filtres puissants :

```astro
---
// Articles de la categorie "astro" avec le tag "tutoriel"
const tutoriels = await getEmDashCollection('posts', {
  status: 'published',
  where: {
    category: { eq: 'astro' },
    tags: { contains: 'tutoriel' },
  },
  orderBy: 'publishedAt',
  order: 'desc',
  limit: 20,
});

// Un seul article par son slug
const article = await getEmDashEntry('posts', {
  where: { slug: { eq: Astro.params.slug } },
});

// Nos projets personnalises
const projets = await getEmDashCollection('projets', {
  status: 'published',
  where: { featured: { eq: true } },
  orderBy: 'date_projet',
  order: 'desc',
});
---
```

### Rendre le Portable Text

Pour afficher le contenu Portable Text, utilisez le composant `<PortableText>` fourni par EmDash :

```astro
---
import { PortableText } from '@emdash/astro/components';
import Astuce from '../components/Astuce.astro';

const { article } = Astro.props;
---

<article>
  <h1>{article.titre}</h1>
  <PortableText
    value={article.description}
    components={{
      block: {
        astuce: Astuce,
      },
    }}
  />
</article>
```

Le composant `Astuce.astro` correspondant :

```astro
---
// src/components/Astuce.astro
const { type = 'info', contenu } = Astro.props.node;

const styles = {
  info: 'bg-blue-50 border-blue-400 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
  danger: 'bg-red-50 border-red-400 text-red-800',
};
---

<aside class={`p-4 border-l-4 rounded-r-lg my-4 ${styles[type]}`}>
  <PortableText value={contenu} />
</aside>
```

## Gestion des medias

La bibliotheque media d'EmDash est accessible depuis **Media** dans le panneau d'administration. Vous pouvez :

- Glisser-deposer des fichiers directement dans la bibliotheque
- Organiser les medias en dossiers
- Rechercher par nom de fichier ou type MIME
- Voir les metadonnees (dimensions, poids, type)
- Editer le texte alternatif (important pour l'accessibilite et le SEO)

Les images sont automatiquement optimisees en WebP par Astro lors du build, grace a l'integration native avec `astro:assets`.

## Bonnes pratiques

1. **Definissez vos schemas avant de rediger.** Modifier un schema apres avoir cree du contenu fonctionne (les migrations sont automatiques), mais il est plus propre de planifier a l'avance.

2. **Utilisez les slugs pour les URL.** Chaque collection devrait avoir un champ `slug` pour generer des URL propres et stables.

3. **Exploitez les brouillons.** Travaillez en mode brouillon et ne publiez que lorsque le contenu est pret. EmDash ne genere jamais de page pour un brouillon.

4. **Ajoutez du texte alternatif a chaque image.** Le champ alt est disponible dans la bibliotheque media et dans l'editeur Portable Text.

5. **Utilisez la publication programmee** pour maintenir un rythme regulier de publication sans intervention manuelle.

## Prochaines etapes

Vous savez maintenant creer des collections, rediger du contenu et l'afficher dans vos pages Astro. Dans le prochain tutoriel, nous verrons comment [deployer votre site EmDash sur Cloudflare Workers](/tutoriels/deployer-cloudflare) pour le rendre accessible au monde entier.

## Pour aller plus loin

- [Installer EmDash](/tutoriels/installer-emdash) --- revenir aux bases si besoin
- [Guide complet du Portable Text](/guides/portable-text-guide) --- maitriser le format de contenu riche d'EmDash
- [Maitriser l'API REST d'EmDash](/tutoriels/api-rest-emdash) --- interroger vos collections par API
- [Creer un theme EmDash de A a Z](/tutoriels/creer-theme-emdash) --- personnaliser l'affichage de vos contenus
