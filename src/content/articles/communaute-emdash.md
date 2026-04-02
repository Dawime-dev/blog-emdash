---
title: "L'ecosysteme EmDash : communaute, marketplace et contributions"
description: "Explorez l'ecosysteme EmDash : l'organisation GitHub emdash-cms, l'architecture du marketplace de plugins, le guide de contribution, les agent skills IA et la feuille de route future du projet."
date: "2026-04-02"
author: "Equipe EmDash FR"
category: "Communaute"
tags: ["emdash", "communaute", "open-source", "marketplace", "plugins", "contributions"]
featured: false
---

# L'ecosysteme EmDash : communaute, marketplace et contributions

Un CMS ne vaut que par son ecosysteme. WordPress ne domine pas le web parce qu'il est techniquement superieur, mais parce qu'il dispose d'une communaute de millions de developpeurs, de dizaines de milliers de plugins et d'un ecosysteme commercial florissant. EmDash est encore jeune, mais les fondations de son ecosysteme sont deja solides et bien pensees. Ce guide vous fait decouvrir les differentes facettes de la communaute EmDash et comment y contribuer.

## L'organisation GitHub emdash-cms

Tout le developpement d'EmDash est centralise sur l'organisation GitHub `emdash-cms`. Cette organisation heberge plusieurs depots :

### Le depot principal : emdash-cms/emdash

C'est le coeur du projet. Ce monorepo contient tous les packages officiels : core, admin, auth, blocks, cloudflare, cli, db, media, plugins et mcp. Avec plus de 3 060 etoiles en deux jours de lancement, c'est l'un des depots open-source les plus dynamiques du moment.

Le depot utilise un workflow de developpement base sur les pull requests. Chaque modification, qu'elle vienne de l'equipe core ou d'un contributeur externe, passe par le meme processus de revue. Les tests automatises (unitaires, integration, e2e) doivent passer avant qu'une PR soit fusionnee.

### emdash-cms/docs

La documentation officielle est elle-meme un site EmDash, construite avec Astro et deployee sur Cloudflare Pages. Le depot est ouvert aux contributions : corrections de typos, ameliorations de la documentation existante, ajout de guides et tutoriels.

### emdash-cms/templates

Les templates de demarrage officiels : blog, portfolio, documentation, e-commerce, site vitrine. Chaque template est un projet EmDash complet et fonctionnel que vous pouvez utiliser comme point de depart.

### emdash-cms/plugins-official

Les plugins officiels maintenus par l'equipe core : SEO, analytics, sitemap, redirections, formulaires, cache, etc. Ces plugins servent aussi de reference pour les developpeurs qui veulent creer leurs propres plugins.

### emdash-cms/awesome-emdash

Une liste curee de ressources EmDash : plugins communautaires, themes, tutoriels, articles de blog, videos, outils et services. Si vous creez quelque chose avec EmDash, c'est ici que vous pouvez le faire connaitre.

## L'architecture du marketplace de plugins

Le marketplace de plugins EmDash est une plateforme centralisee ou les developpeurs peuvent publier et les utilisateurs peuvent decouvrir des plugins. Contrairement au repertoire WordPress qui est un simple catalogue, le marketplace EmDash est une plateforme technique a part entiere avec des mecanismes de securite avances.

### Publication d'un plugin

Le processus de publication d'un plugin sur le marketplace suit ces etapes :

```bash
# 1. Developper et tester le plugin
em plugin init mon-plugin
em plugin dev
em plugin test

# 2. Construire le bundle
em plugin build

# 3. Valider la conformite
em plugin validate

# 4. Publier
em plugin publish
```

La commande `em plugin publish` declenche un pipeline automatise :

1. **Verification du manifeste** : le fichier `plugin.json` est valide (nom, version, description, capacites, licence)
2. **Analyse statique** : le code est scanne pour detecter les patterns suspects
3. **Audit de securite IA** : un modele specialise analyse le code pour detecter les vulnerabilites et les comportements malveillants
4. **Verification des capacites** : les capacites declarees dans le manifeste correspondent a l'utilisation reelle dans le code
5. **Construction du bundle** : le code est compile et empaquete dans un format optimise pour les isolats V8
6. **Publication** : le plugin est publie sur le marketplace avec un score de securite

### Decouverte de plugins

Le marketplace offre plusieurs modes de decouverte :

**Recherche** : recherche textuelle dans les noms, descriptions et tags des plugins.

**Categories** : les plugins sont organises en categories (SEO, analytics, medias, securite, formulaires, e-commerce, social, developpement, etc.).

**Collections curees** : l'equipe EmDash maintient des collections thematiques ("Essentiels pour un blog", "E-commerce complet", "Stack developpeur", etc.).

**Recommandations** : un systeme de recommandation base sur les plugins deja installes et les sites similaires.

### Modeles economiques pour les plugins

Le marketplace supporte plusieurs modeles economiques :

- **Gratuit** : le plugin est libre et open-source
- **Freemium** : version gratuite avec fonctionnalites limitees, version premium payante
- **Payant** : achat unique ou abonnement
- **Donations** : le plugin est gratuit mais accepte les donations

Les paiements transitent par le marketplace, qui prend une commission de 15 % (contre 30 % pour l'App Store d'Apple, par exemple). Les developpeurs sont payes mensuellement via virement bancaire ou en cryptomonnaies.

Fait notable : grace a la licence MIT d'EmDash, les developpeurs de plugins sont libres de choisir n'importe quelle licence pour leurs plugins. Pas de contrainte GPL, pas d'ambiguite juridique.

## Guide de contribution

EmDash accueille les contributions de toute la communaute. Que vous soyez un developpeur experimente ou un debutant enthousiaste, il y a de nombreuses facons de contribuer.

### Contribuer au code

Pour contribuer au code d'EmDash :

1. **Forkez le depot** `emdash-cms/emdash` sur GitHub
2. **Clonez votre fork** et installez les dependances :

```bash
git clone https://github.com/votre-username/emdash.git
cd emdash
pnpm install
```

3. **Creez une branche** pour votre modification :

```bash
git checkout -b feature/ma-fonctionnalite
```

4. **Developpez** votre modification en suivant les conventions du projet :
   - TypeScript strict (pas de `any` sauf cas exceptionnel documente)
   - Tests pour toute nouvelle fonctionnalite ou correction de bug
   - Documentation JSDoc pour les fonctions publiques
   - Respect du style de code (Prettier + ESLint)

5. **Testez** votre modification :

```bash
pnpm test           # Tests unitaires
pnpm test:e2e       # Tests end-to-end
pnpm lint           # Verification du style
pnpm typecheck      # Verification des types
```

6. **Ouvrez une pull request** avec une description claire de votre modification, le probleme qu'elle resout et les tests ajoutees.

### Types de contributions recherchees

L'equipe core a identifie plusieurs domaines ou les contributions sont particulierement bienvenues :

**"Good First Issue"** : des issues etiquetees specifiquement pour les nouveaux contributeurs. Elles sont generalement simples, bien definies et accompagnees d'instructions detaillees.

**Documentation** : la documentation est toujours perfectible. Corrections de fautes, ameliorations de clarte, ajout d'exemples, traductions.

**Tests** : augmenter la couverture de tests est toujours benefique. Si vous trouvez un cas limite non couvert, ajoutez un test.

**Plugins** : [creer des plugins](/tutoriels/premier-plugin) pour le marketplace est probablement la facon la plus impactante de contribuer a l'ecosysteme. Consultez notre guide sur l'[anatomie d'un plugin standard](/plugins/creer-plugin-standard) pour comprendre la structure attendue. Un bon plugin peut aider des milliers d'utilisateurs.

**Templates** : creer des templates de demarrage pour differents cas d'usage (blog, portfolio, documentation, e-commerce, galerie, etc.).

**Traductions** : l'interface d'administration d'EmDash est traduite via des fichiers JSON. Ajouter ou ameliorer une traduction est une contribution precieuse et accessible.

**Rapports de bugs** : signaler un bug avec un cas de reproduction clair est extremement utile. Utilisez le template d'issue sur GitHub.

### Code de conduite

EmDash adopte le Contributor Covenant Code of Conduct. En resume : soyez respectueux, inclusif et constructif. Les comportements harcelants, discriminatoires ou toxiques ne sont pas toleres. L'objectif est de creer un environnement ou chacun se sent bienvenu pour contribuer.

## Agent Skills IA

L'un des aspects les plus innovants de l'ecosysteme EmDash est l'integration avec les agents IA via les "Agent Skills" publiees sur agentskills.io. Le [serveur MCP integre](/guides/mcp-server-emdash) rend cette integration possible.

### Qu'est-ce qu'un Agent Skill ?

Un Agent Skill est une capacite standardisee qu'un agent IA peut utiliser pour interagir avec un service. Pensez-y comme un "plugin pour IA" : au lieu qu'un humain installe et utilise un plugin, c'est un agent IA qui decouvre et utilise un skill.

### Skills EmDash disponibles

EmDash publie plusieurs skills standardises :

- **Content Management** : creer, lire, modifier et supprimer du contenu
- **Media Management** : uploader, optimiser et gerer les fichiers media
- **SEO Analysis** : analyser et optimiser le referencement du contenu
- **Site Configuration** : gerer les parametres du site
- **Analytics** : consulter les statistiques de trafic et d'engagement

### Creer des Skills personnalises

Les developpeurs peuvent creer et publier leurs propres skills pour etendre les capacites IA de leurs sites EmDash :

```typescript
// Exemple : skill de traduction automatique
export const translationSkill = defineAgentSkill({
  name: 'auto-translate',
  description: 'Traduit automatiquement le contenu dans plusieurs langues',
  tools: [
    {
      name: 'translate_article',
      description: 'Traduit un article dans une langue cible',
      parameters: {
        articleId: { type: 'string', required: true },
        targetLanguage: { type: 'string', required: true },
        preserveFormatting: { type: 'boolean', default: true },
      },
      handler: async ({ articleId, targetLanguage, preserveFormatting }) => {
        // Logique de traduction
      },
    },
  ],
});
```

Ces skills peuvent etre publies sur agentskills.io et deviennent alors disponibles pour tous les agents IA compatibles MCP.

## La feuille de route future

L'equipe EmDash a partage une feuille de route ambitieuse pour les prochains mois :

### Q2 2026 (Avril - Juin)

- **Stabilisation du core** : corrections de bugs, ameliorations de performance, documentation complete
- **Marketplace v1** : lancement officiel du marketplace de plugins avec les premiers plugins communautaires
- **Migration WordPress** : outils de migration automatisee pour importer le contenu WordPress
- **EmDash Conf** : premiere conference en ligne de la communaute EmDash (prevue en juin)

### Q3 2026 (Juillet - Septembre)

- **Adaptateurs multi-plateformes** : support de Vercel, Netlify et AWS en plus de Cloudflare
- **Marketplace de themes** : lancement d'un marketplace dedie aux templates et themes
- **Editeur collaboratif** : edition collaborative en temps reel (a la Google Docs)
- **Workflows de publication** : workflows editoriaux avec etapes de revision, approbation et planification

### Q4 2026 (Octobre - Decembre)

- **EmDash Cloud** : offre hebergee geree pour les utilisateurs non-techniques
- **API GraphQL** : une couche GraphQL en complement de l'API TypeScript native
- **Internationalisation avancee** : gestion multi-sites et multi-langues native
- **Analytics integre** : tableau de bord d'analytics privacy-first integre dans l'admin

### 2027 et au-dela

- **EmDash Desktop** : application de bureau pour l'edition hors-ligne
- **EmDash Mobile** : application mobile pour la gestion de contenu en deplacement
- **Federation** : protocole de federation entre sites EmDash (a la ActivityPub)
- **Marketplace d'agents IA** : un marketplace dedie aux agents et workflows IA

## Comment rejoindre la communaute

### Discord

Le serveur Discord officiel est le coeur battant de la communaute EmDash. Vous y trouverez :

- **#general** : discussions generales sur EmDash
- **#aide** : support technique de la communaute
- **#plugins** : discussions sur le developpement de plugins
- **#showcase** : montrez vos sites et projets EmDash
- **#contributions** : coordination des contributions open-source
- **#francais** : canal dedie a la communaute francophone

### GitHub Discussions

Pour les discussions techniques plus longues et les propositions de fonctionnalites, l'equipe utilise GitHub Discussions sur le depot principal. C'est l'endroit ideal pour proposer des RFC (Request for Comments) et debattre de l'orientation du projet.

### Newsletter

Une newsletter mensuelle resume les nouveautes, les plugins populaires, les contributions notables et les evenements a venir. Inscription sur le site officiel.

### Meetups

Des meetups locaux commencent a s'organiser dans plusieurs villes. Si vous voulez lancer un meetup EmDash dans votre ville, l'equipe fournit des ressources (slides, demos, goodies) pour vous aider.

## Conclusion

L'ecosysteme EmDash est encore jeune, mais ses fondations sont solides. Une organisation GitHub bien structuree, un marketplace de plugins avec une securite de pointe, un processus de contribution accueillant, des agent skills innovants et une feuille de route ambitieuse -- tous les ingredients sont reunis pour construire une communaute durable.

Le moment est ideal pour rejoindre cette communaute. Les early adopters ont un impact disproportionne sur la direction d'un projet open-source. Que vous contribuiez du code, des plugins, de la documentation, des traductions ou simplement des retours d'experience, votre participation compte.

L'histoire des CMS s'ecrit maintenant. Et avec EmDash, elle s'ecrit en TypeScript, en open-source et en communaute. Rejoignez-nous sur `github.com/emdash-cms/emdash` et sur Discord pour participer a cette aventure.

## Pour aller plus loin

- [Decouvrir EmDash](/articles/emdash-presentation) -- presentation complete du projet
- [Developper votre premier plugin](/tutoriels/premier-plugin) -- guide pas a pas pour creer un plugin
- [Anatomie d'un plugin standard](/plugins/creer-plugin-standard) -- la structure technique en detail
- [Installer EmDash](/tutoriels/installer-emdash) -- commencez a contribuer en installant le projet
- [Le serveur MCP et l'IA](/guides/mcp-server-emdash) -- comprendre l'integration IA native
