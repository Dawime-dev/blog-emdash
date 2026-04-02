---
title: "Test du plugin AT Protocol : EmDash et le Fediverse"
description: "Analyse du plugin AT Protocol pour EmDash : integration Bluesky, cross-posting automatique et fonctionnalites sociales decentralisees."
date: "2026-04-02"
author: "Equipe EmDash FR"
tags: ["emdash", "plugins", "atproto", "bluesky", "fediverse", "decentralise"]
pluginName: "atproto"
pluginVersion: "0.1.0"
pluginType: "standard"
rating: 3
---

# Test du plugin AT Protocol : EmDash et le Fediverse

Le web decentralise prend de l'ampleur, et Bluesky est devenu l'un des reseaux sociaux les plus prometteurs grace au protocole AT (Authenticated Transfer Protocol). Le plugin **AT Protocol** pour EmDash permet de connecter votre site au Fediverse : cross-posting automatique, identite decentralisee et interactions sociales. Un plugin ambitieux, encore jeune, que nous avons teste en profondeur.

## Contexte : AT Protocol et Bluesky

Avant de plonger dans le plugin, un bref rappel. Le protocole AT est un protocole ouvert de reseau social decentralise, developpe par Bluesky. Contrairement a ActivityPub (Mastodon), AT Protocol met l'accent sur la portabilite des comptes, la moderation personnalisable et les flux algorithmiques ouverts.

Concretement, avec AT Protocol :
- Votre identite est un DID (Decentralized Identifier) que vous controllez
- Vos donnees sont stockees dans un PDS (Personal Data Server) que vous pouvez heberger
- Les flux et la moderation sont geres par des services independants

Le plugin EmDash s'insere dans cet ecosysteme en faisant de votre site un participant actif du reseau. Il s'appuie sur l'[architecture de plugins d'EmDash](/plugins/creer-plugin-standard) et ses hooks de contenu.

## Fonctionnalites du plugin

### Cross-posting automatique

La fonctionnalite principale du plugin est le cross-posting : lorsque vous publiez un article sur EmDash, un post est automatiquement cree sur Bluesky. Le post contient le titre de l'article, un extrait et un lien vers votre site, accompagne d'une carte de previsualisation (embed external).

```typescript
plugins: {
  atproto: {
    // Identifiant Bluesky
    handle: 'monsite.bsky.social',
    // Ou un domaine personnalise verifie
    // handle: 'monsite.fr',
    
    // Configuration du cross-posting
    crossPost: {
      enabled: true,
      collections: ['posts'],  // Collections a cross-poster
      template: '{{title}}\n\n{{excerpt}}\n\n{{url}}',
      includeImage: true,      // Inclure l'image de couverture
      languages: ['fr'],       // Langues du post
    },
  },
},
```

Le cross-posting supporte les images de couverture, qui sont uploadees automatiquement comme blob sur le PDS. Le texte du post est personnalisable via un template simple.

### Identite decentralisee avec domaine personnalise

AT Protocol permet d'utiliser un nom de domaine comme identifiant. Au lieu de `monsite.bsky.social`, votre identite Bluesky peut etre `monsite.fr`. Le plugin facilite cette configuration en generant automatiquement le fichier `/.well-known/atproto-did` necessaire a la verification.

```
# Le plugin ajoute automatiquement cette route
GET /.well-known/atproto-did
-> did:plc:abc123xyz...
```

C'est un avantage significatif : votre nom de domaine devient votre identite sociale, renforcant la credibilite de votre marque sur Bluesky.

### Flux de commentaires via AT Protocol

Le plugin propose une fonctionnalite experimentale permettant d'utiliser les reponses Bluesky comme systeme de commentaires. Lorsqu'un article est cross-poste, les reponses au post Bluesky sont recuperees et affichees sous l'article sur votre site.

Cette approche presente des avantages :
- Les commentaires beneficient de l'identite verifiee de Bluesky
- La moderation peut s'appuyer sur les outils de Bluesky
- Les discussions sont visibles a la fois sur votre site et sur Bluesky

Et des inconvenients :
- Dependance a la disponibilite de l'API Bluesky
- Les commentaires ne sont pas stockes localement par defaut
- Les visiteurs sans compte Bluesky ne peuvent pas commenter

Le composant de commentaires AT Protocol est un ajout optionnel au theme :

```astro
---
import { BlueskyComments } from 'emdash:plugins/atproto';
---
<BlueskyComments postUri={post.data.atprotoUri} />
```

### Publication programmee

Le plugin supporte la publication programmee : definissez une date de publication future pour votre article EmDash et le cross-post Bluesky sera envoye au moment opportun. Le plugin utilise le systeme de cron d'EmDash pour declencher la publication a l'heure exacte.

### Thread automatique pour les articles longs

Pour les articles longs, le plugin peut generer automatiquement un thread Bluesky. L'article est decoupe en posts de 300 caracteres maximum, chacun lie au precedent. Les points de coupure respectent les paragraphes et les phrases pour un resultat lisible.

```typescript
crossPost: {
  // ...
  longContent: 'thread',  // 'thread' | 'link-only' | 'excerpt'
  maxThreadPosts: 10,
},
```

## Configuration et authentification

### Authentification

Le plugin utilise un mot de passe d'application (app password) Bluesky pour l'authentification. Ce mot de passe est stocke de maniere chiffree dans les variables d'environnement :

```bash
ATPROTO_HANDLE=monsite.bsky.social
ATPROTO_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

Le plugin ne demande jamais votre mot de passe principal Bluesky. L'app password peut etre revoque a tout moment depuis les parametres de votre compte Bluesky.

### Panneau d'administration

Le plugin ajoute une section dans l'administration EmDash :

- **Statut de connexion** : verification que l'authentification AT Protocol fonctionne
- **Historique des cross-posts** : liste de tous les posts publies avec lien vers Bluesky
- **File d'attente** : posts programmes en attente de publication
- **Statistiques** : nombre de cross-posts, echecs, likes et reponses (via l'API)

## Limites actuelles

Le plugin AT Protocol est le plus jeune de l'ecosysteme EmDash et certaines fonctionnalites sont encore experimentales :

### Limitations techniques
- Le systeme de commentaires via Bluesky est en beta et peut presenter des lenteurs lorsque le nombre de reponses est eleve
- La synchronisation des likes et reposts n'est pas en temps reel (mise a jour toutes les 15 minutes)
- Les images dans les threads sont limitees a quatre par post (contrainte AT Protocol)

### Limitations fonctionnelles
- Pas de support ActivityPub (Mastodon) : le plugin est specifique a AT Protocol
- Pas de federation bidirectionnelle : le contenu va d'EmDash vers Bluesky, pas l'inverse
- La suppression d'un article EmDash ne supprime pas automatiquement le post Bluesky (en cours de developpement)

### Dependance a Bluesky
- Le plugin depend de la disponibilite de l'API Bluesky
- Les changements de l'API AT Protocol peuvent necessiter des mises a jour du plugin
- L'ecosysteme AT Protocol est encore en evolution rapide

## Cas d'utilisation pertinents

Le plugin AT Protocol convient particulierement aux :

- **Blogueurs tech** qui souhaitent cross-poster vers Bluesky sans effort
- **Createurs de contenu** qui veulent construire leur audience sur le web decentralise
- **Entreprises** qui utilisent leur domaine comme identite sociale verifiee
- **Communautes** qui souhaitent utiliser Bluesky comme systeme de commentaires

## Points forts et limites

**Points forts :**
- Cross-posting automatique bien implemente
- Identite decentralisee avec domaine personnalise
- Systeme de commentaires via Bluesky (innovant)
- Thread automatique pour les articles longs
- Publication programmee

**Limites :**
- Plugin encore jeune avec des fonctionnalites experimentales
- Specifique a AT Protocol (pas de support Mastodon)
- Dependance a l'API Bluesky
- Commentaires Bluesky en beta

## Notre verdict

Le plugin AT Protocol est un ajout interessant et innovant a l'ecosysteme EmDash, mais il reste encore immature. Le cross-posting fonctionne bien et l'identite decentralisee par domaine est un vrai plus. Cependant, les fonctionnalites sociales (commentaires, statistiques) sont encore experimentales et la dependance exclusive a AT Protocol limite son public. Nous recommandons ce plugin aux early adopters et aux enthousiastes du web decentralise, en gardant a l'esprit qu'il evoluera significativement dans les prochains mois.

**Note : 3/5** -- Un plugin prometteur et innovant, mais encore trop jeune pour un usage en production exigeant.

## Pour aller plus loin

- [Developper votre premier plugin](/tutoriels/premier-plugin) -- creez vos propres integrations sociales
- [Communaute et ecosysteme EmDash](/articles/communaute-emdash) -- decouvrez la communaute autour du projet
- [Anatomie d'un plugin standard](/plugins/creer-plugin-standard) -- comprendre la structure technique des plugins
- [Plugin Webhook Notifier](/plugins/plugin-webhook-notifier) -- combinez AT Protocol et webhooks pour des workflows avances
