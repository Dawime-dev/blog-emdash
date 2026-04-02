---
title: "Le serveur MCP integre : EmDash et l'IA"
description: "Explorez le serveur Model Context Protocol integre a EmDash. Decouvrez comment utiliser Claude, ChatGPT et d'autres agents IA pour gerer votre site, generer du contenu et automatiser vos workflows."
date: "2026-04-02"
author: "Equipe EmDash FR"
category: "IA"
tags: ["emdash", "mcp", "ia", "claude", "chatgpt", "agents", "automatisation"]
difficulty: "avance"
---

# Le serveur MCP integre : EmDash et l'IA

L'intelligence artificielle transforme la facon dont nous creons et gerons le contenu web. Mais jusqu'a present, l'integration de l'IA dans les CMS se limitait a des plugins tiers, des API proprietary et des workflows manuels de copier-coller. EmDash change la donne en integrant nativement un serveur MCP (Model Context Protocol), faisant de l'IA un citoyen de premiere classe dans l'architecture du CMS. Ce guide explore cette fonctionnalite en profondeur.

## Qu'est-ce que le Model Context Protocol ?

Le Model Context Protocol (MCP) est un standard ouvert, developpe initialement par Anthropic, qui definit comment les applications et les modeles de langage peuvent communiquer de maniere structuree. Pensez-y comme une API standardisee entre votre application et n'importe quel assistant IA.

Avant MCP, chaque integration IA etait ad hoc. Un plugin WordPress pour ChatGPT ne fonctionnait qu'avec ChatGPT. Un plugin pour Claude ne fonctionnait qu'avec Claude. Il n'y avait aucune interoperabilite. MCP resout ce probleme en definissant un protocole commun que tous les assistants IA peuvent utiliser.

Le protocole definit trois concepts fondamentaux :

### Les ressources (Resources)

Les ressources sont des donnees que l'IA peut lire. Dans le contexte d'EmDash, les ressources incluent les articles, les pages, les medias, les schemas de collections, les parametres du site, les statistiques, etc.

### Les outils (Tools)

Les outils sont des actions que l'IA peut executer. Creer un article, modifier un contenu, uploader une image, publier un brouillon, configurer un plugin -- tout cela est expose comme des outils MCP.

### Les prompts

Les prompts sont des modeles d'instructions predefinies que l'IA peut utiliser pour guider ses interactions. EmDash fournit des prompts optimises pour la creation de contenu, l'optimisation SEO, l'analyse de performance et la gestion du site.

## Le serveur MCP d'EmDash

EmDash integre un serveur MCP directement dans son core. Ce serveur est automatiquement disponible des que vous deployez votre site. Il n'y a rien a installer, rien a configurer -- c'est integre.

### Architecture du serveur

Le serveur MCP d'EmDash s'execute dans le meme environnement Cloudflare Workers que votre site (voir le [guide d'architecture](/guides/architecture-emdash) pour comprendre cette infrastructure). Il beneficie donc des memes avantages : distribution globale, demarrage instantane, mise a l'echelle automatique. Le serveur est accessible via un endpoint dedie (`/api/mcp`) et utilise le transport Streamable HTTP de MCP.

```
Requete IA -> /api/mcp -> Authentification -> Middleware MCP -> Execution -> Reponse
```

L'authentification MCP utilise des tokens API dedies avec des permissions granulaires. Vous pouvez creer des tokens avec des droits limites : un token en lecture seule pour un assistant d'analyse, un token en ecriture pour un assistant de creation de contenu, etc.

### Ressources exposees

Le serveur MCP d'EmDash expose les ressources suivantes :

```typescript
// Ressources disponibles via MCP
const resources = {
  // Contenu
  'content://articles': 'Liste de tous les articles',
  'content://articles/{id}': 'Un article specifique avec tout son contenu',
  'content://pages': 'Liste de toutes les pages',
  'content://pages/{id}': 'Une page specifique',

  // Schema
  'schema://collections': 'Schemas de toutes les collections',
  'schema://collections/{name}': 'Schema d\'une collection',

  // Medias
  'media://files': 'Liste de tous les fichiers media',
  'media://files/{id}': 'Un fichier media avec ses metadonnees',

  // Site
  'site://settings': 'Parametres generaux du site',
  'site://analytics': 'Statistiques de trafic recentes',
  'site://plugins': 'Plugins installes et leur configuration',

  // Navigation
  'site://menus': 'Menus de navigation',
  'site://sitemap': 'Plan du site',
};
```

### Outils exposes

```typescript
// Outils disponibles via MCP
const tools = {
  // Gestion du contenu
  'create_content': 'Creer un nouveau contenu dans une collection',
  'update_content': 'Modifier un contenu existant',
  'delete_content': 'Supprimer un contenu',
  'publish_content': 'Publier un brouillon',
  'unpublish_content': 'Depublier un contenu',

  // Medias
  'upload_media': 'Uploader un fichier media',
  'generate_alt_text': 'Generer un texte alternatif pour une image',

  // Schema
  'add_field': 'Ajouter un champ a une collection',
  'create_collection': 'Creer une nouvelle collection',

  // SEO
  'analyze_seo': 'Analyser le SEO d\'un contenu',
  'suggest_improvements': 'Suggerer des ameliorations de contenu',

  // Deploiement
  'deploy': 'Declencher un deploiement',
  'preview_deploy': 'Creer un deploiement de preview',
};
```

## Utilisation avec Claude

Claude d'Anthropic est l'un des assistants IA les plus avances pour l'utilisation de MCP. Voici comment connecter Claude a votre site EmDash :

### Configuration dans Claude Desktop

```json
{
  "mcpServers": {
    "mon-site-emdash": {
      "url": "https://monsite.com/api/mcp",
      "headers": {
        "Authorization": "Bearer em_token_xxxxxxxxxxxx"
      }
    }
  }
}
```

Une fois connecte, vous pouvez interagir avec votre site en langage naturel :

> "Claude, cree un article de blog sur les tendances du developpement web en 2026. Ajoute des sections sur les frameworks, l'IA et la securite. Mets-le en brouillon pour que je puisse le relire."

Claude va :
1. Lire le schema de la collection "articles" pour connaitre les champs disponibles
2. Generer le contenu en Portable Text
3. Creer l'article en brouillon via l'outil `create_content`
4. Vous confirmer la creation avec un lien vers l'editeur

> "Analyse le SEO de mes 10 derniers articles et donne-moi un rapport avec des suggestions d'amelioration."

Claude va :
1. Lire les 10 derniers articles via la ressource `content://articles`
2. Analyser le contenu de chaque article (longueur, structure, mots-cles, metadonnees)
3. Generer un rapport detaille avec des recommandations specifiques

## Utilisation avec ChatGPT

ChatGPT supporte egalement MCP via ses "Actions" dans les GPTs personnalises. La configuration est similaire :

1. Creez un GPT personnalise dans ChatGPT
2. Ajoutez une action avec l'URL de votre serveur MCP
3. Configurez l'authentification avec votre token API
4. Decrivez les capacites du serveur dans les instructions du GPT

L'experience est similaire a celle de Claude, bien que les capacites specifiques dependent de la version de ChatGPT utilisee et de sa gestion du protocole MCP.

## Agent Skills sur agentskills.io

EmDash publie ses capacites MCP sur agentskills.io, un registre centralise de competences pour agents IA. Cela signifie que n'importe quel agent IA compatible peut decouvrir automatiquement les capacites de votre site EmDash et apprendre a les utiliser.

### Qu'est-ce qu'agentskills.io ?

agentskills.io est un annuaire public de "skills" (competences) que les agents IA peuvent consommer. Chaque skill est decrit de maniere standardisee avec :

- Un nom et une description
- Les outils disponibles et leurs parametres
- Les ressources accessibles
- Des exemples d'utilisation
- Les permissions requises

### Skills EmDash publies

EmDash publie plusieurs skills sur agentskills.io :

```yaml
# emdash/content-management
name: EmDash Content Management
description: >
  Gestion complete du contenu d'un site EmDash :
  creation, modification, publication, suppression.
tools:
  - create_content
  - update_content
  - delete_content
  - publish_content
resources:
  - content://*

# emdash/media-management
name: EmDash Media Management
description: >
  Gestion des fichiers media : upload, optimisation,
  generation de textes alternatifs.
tools:
  - upload_media
  - generate_alt_text
resources:
  - media://*

# emdash/seo-analysis
name: EmDash SEO Analysis
description: >
  Analyse SEO du contenu et suggestions d'amelioration.
tools:
  - analyze_seo
  - suggest_improvements
resources:
  - content://*
  - site://analytics
```

### Decouverte automatique

Quand un agent IA rencontre une URL EmDash, il peut automatiquement decouvrir les skills disponibles via un endpoint dedie :

```
GET https://monsite.com/.well-known/agent-skills
```

Cette decouverte automatique permet des interactions fluides sans configuration prealable de l'utilisateur. L'agent sait immediatement quelles actions sont possibles sur le site.

## Generation de sites par IA

L'une des applications les plus impressionnantes du serveur MCP est la generation complete de sites web par IA. Imaginez cette conversation :

> "Cree-moi un blog de cuisine avec les collections suivantes : recettes (avec ingredients, etapes, temps de preparation, difficulte), categories de cuisine (francaise, italienne, asiatique) et auteurs. Ajoute 5 recettes d'exemple."

Un agent IA connecte via MCP peut :

1. **Creer les collections** en utilisant l'outil `create_collection` pour definir les schemas
2. **Generer les types** en declenchant la generation de types TypeScript
3. **Creer le contenu** en utilisant `create_content` pour ajouter les recettes d'exemple
4. **Configurer le site** en ajustant les parametres via les ressources du site

Le tout en quelques minutes, sans ecrire une seule ligne de code.

### Workflows avances

Le serveur MCP permet aussi des workflows plus sophistiques :

**Traduction automatique** : un agent lit un article en francais, le traduit dans cinq langues et cree les versions traduites dans les collections correspondantes.

**Curation de contenu** : un agent analyse les tendances sur les reseaux sociaux, identifie les sujets pertinents pour votre audience et cree des brouillons d'articles.

**Optimisation continue** : un agent planifie des analyses SEO hebdomadaires, identifie les articles sous-performants et suggere des ameliorations.

**Gestion editoriale** : un agent verifie les brouillons en attente, valide la qualite du contenu et alerte l'equipe editoriale quand des articles sont prets a etre publies.

## Securite du serveur MCP

La securite du serveur MCP est assuree par plusieurs mecanismes :

### Tokens API a permissions granulaires

Chaque token API a un ensemble de permissions specifiques. Un token de lecture ne peut pas modifier de contenu. Un token limite a une collection ne peut pas acceder aux autres.

```typescript
// Creation d'un token API via le [CLI EmDash](/guides/cli-emdash)
em api-token create \
  --name "Claude - Creation de contenu" \
  --permissions "read:content,write:content,read:schema" \
  --collections "articles,pages" \
  --expires "2026-12-31"
```

### Rate limiting

Le serveur MCP impose des limites de debit pour empecher les abus :

- 100 requetes par minute par token
- 1 000 requetes par heure par token
- 10 operations d'ecriture par minute par token

### Journalisation

Toutes les actions effectuees via MCP sont journalisees avec le token utilise, l'outil invoque, les parametres et le resultat. Cette piste d'audit permet de tracer exactement ce que chaque agent IA a fait sur votre site.

### Mode confirmation

Pour les operations sensibles (suppression, publication, modification de schema), EmDash peut etre configure pour exiger une confirmation humaine avant l'execution :

```typescript
// emdash.config.ts
export default defineConfig({
  mcp: {
    requireConfirmation: ['delete_content', 'publish_content', 'create_collection'],
    notifyOn: ['update_content'],
  },
});
```

Quand un agent IA tente une operation qui requiert confirmation, le serveur MCP retourne un statut "pending" et envoie une notification a l'administrateur. L'operation n'est executee qu'apres approbation.

## Conclusion

Le serveur MCP integre d'EmDash represente une vision de l'avenir ou l'IA n'est pas un plugin ou un outil externe, mais un collaborateur integre dans le flux de travail de creation de contenu. En adoptant un standard ouvert plutot qu'une integration proprietaire, EmDash s'assure que ses utilisateurs ne sont pas enfermes dans un ecosysteme IA specifique.

Que vous utilisiez Claude, ChatGPT, ou un agent IA open-source, le serveur MCP d'EmDash offre la meme experience riche et securisee. Et avec la publication des skills sur agentskills.io, la decouverte et l'utilisation de ces capacites deviennent triviales.

Nous ne sommes qu'au debut de l'ere des agents IA. EmDash est positionne pour evoluer avec cette technologie, offrant a ses utilisateurs un avantage concurrentiel significatif dans la gestion de contenu assistee par IA. L'avenir du CMS n'est pas seulement serverless et type -- il est aussi intelligent.

## Pour aller plus loin

- [Le CLI EmDash](/guides/cli-emdash) -- gerez les tokens API et automatisez vos workflows depuis le terminal.
- [API REST EmDash](/tutoriels/api-rest-emdash) -- combinez le serveur MCP avec l'API REST pour des integrations sur mesure.
- [Architecture d'EmDash](/guides/architecture-emdash) -- comprenez comment le serveur MCP s'integre dans l'architecture globale.
- [5 raisons d'essayer EmDash](/articles/pourquoi-emdash) -- l'integration IA native est l'un des arguments phares d'EmDash.
- [Communaute et ecosysteme EmDash](/articles/communaute-emdash) -- rejoignez la communaute pour partager vos workflows MCP et decouvrir ceux des autres.
