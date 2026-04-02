---
title: "Test du plugin Webhook Notifier : connectez EmDash a vos outils"
description: "Decouverte du plugin Webhook Notifier pour EmDash : notifications Slack, Discord, HTTP personnalise et automatisation des evenements de contenu."
date: "2026-04-02"
author: "Equipe EmDash FR"
tags: ["emdash", "plugins", "webhook", "slack", "discord", "automatisation"]
pluginName: "webhook-notifier"
pluginVersion: "0.1.0"
pluginType: "standard"
rating: 4
---

# Test du plugin Webhook Notifier : connectez EmDash a vos outils

Un CMS ne fonctionne jamais en isolation. Entre Slack pour la communication d'equipe, Discord pour la communaute, les outils de deploiement et les pipelines d'automatisation, votre site EmDash doit pouvoir dialoguer avec le reste de votre ecosysteme. Le plugin **Webhook Notifier** rend cela possible en envoyant des notifications HTTP a chaque evenement significatif. Voici notre analyse.

## Le concept

Le Webhook Notifier ecoute les evenements internes d'EmDash (publication d'un article, nouveau commentaire, soumission de formulaire, upload de media...) et envoie une requete HTTP POST vers une ou plusieurs URL configurees. Chaque webhook transporte un payload JSON contenant les details de l'evenement.

C'est le ciment qui lie EmDash a vos outils de travail quotidiens. Pas besoin d'API tierce complexe ni de middleware : un simple webhook suffit.

## Evenements disponibles

Le plugin peut reagir a une large palette d'evenements :

### Evenements de contenu
- `content.created` : une nouvelle entree est creee dans une collection
- `content.updated` : une entree existante est modifiee
- `content.published` : une entree passe du brouillon a publie
- `content.unpublished` : une entree est depubliee
- `content.deleted` : une entree est supprimee

### Evenements de commentaires
- `comment.created` : un nouveau commentaire est poste
- `comment.approved` : un commentaire en moderation est approuve
- `comment.rejected` : un commentaire est rejete

### Evenements de medias
- `media.uploaded` : un nouveau fichier est uploade
- `media.deleted` : un fichier est supprime

### Evenements de formulaires
- `form.submitted` : un formulaire est soumis (necessite le plugin [Forms](/plugins/plugin-forms))

### Evenements systeme
- `user.created` : un nouvel utilisateur est cree
- `user.login` : un utilisateur se connecte a l'administration
- `deploy.triggered` : un deploiement est lance

## Configuration

### Configuration de base

La configuration se fait dans `emdash.config.ts` :

```typescript
plugins: {
  'webhook-notifier': {
    webhooks: [
      {
        name: 'Slack Editorial',
        url: 'https://hooks.slack.com/services/T00/B00/xxxxx',
        events: ['content.published', 'content.updated'],
        format: 'slack',
      },
      {
        name: 'Discord Communaute',
        url: 'https://discord.com/api/webhooks/123/xxxxx',
        events: ['content.published', 'comment.created'],
        format: 'discord',
      },
      {
        name: 'Pipeline CI/CD',
        url: 'https://api.github.com/repos/org/repo/dispatches',
        events: ['content.published'],
        format: 'custom',
        headers: {
          'Authorization': 'Bearer ${GITHUB_TOKEN}',
        },
      },
    ],
  },
},
```

### Formats de notification

Le plugin supporte trois formats de sortie :

**Format Slack** : genere un message Slack formate avec blocs, icones et liens. Le message est adapte au type d'evenement et inclut un lien direct vers le contenu dans l'administration EmDash.

```json
{
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": ":newspaper: *Nouvel article publie*\n<https://monsite.fr/article|Mon article>"
      }
    }
  ]
}
```

**Format Discord** : genere un embed Discord avec couleur, titre, description et champs. Les embeds sont visuellement riches et cliquables.

**Format Custom** : envoie le payload JSON brut d'EmDash, ce qui permet de l'utiliser avec n'importe quel service qui accepte les webhooks HTTP.

### Payload JSON standard

Le payload JSON envoye en format custom contient toutes les informations utiles :

```json
{
  "event": "content.published",
  "timestamp": "2026-04-02T14:30:00Z",
  "site": {
    "name": "Mon site EmDash",
    "url": "https://monsite.fr"
  },
  "data": {
    "collection": "posts",
    "id": "abc123",
    "slug": "mon-article",
    "title": "Mon article",
    "author": "Marie Dupont",
    "url": "https://monsite.fr/mon-article"
  }
}
```

## Integration Slack detaillee

L'integration Slack est la plus populaire. Voici comment la mettre en place :

1. Creez une application Slack dans votre workspace (api.slack.com)
2. Activez les webhooks entrants
3. Choisissez le canal de destination
4. Copiez l'URL du webhook dans la configuration du plugin

Le plugin envoie des messages formattes avec des informations contextuelles : type d'evenement, titre du contenu, auteur, lien vers l'article et lien vers l'administration. Les messages sont concis pour ne pas polluer le canal.

### Filtrage avance

Vous pouvez affiner les notifications Slack avec des filtres :

```typescript
{
  name: 'Slack Editorial',
  url: 'https://hooks.slack.com/services/...',
  events: ['content.published'],
  format: 'slack',
  filters: {
    collections: ['posts'],  // Uniquement les articles
    authors: ['marie'],       // Uniquement cet auteur
  },
}
```

## Integration Discord detaillee

L'integration Discord fonctionne de maniere similaire. Creez un webhook dans les parametres de votre canal Discord, copiez l'URL et configurez le plugin. Les messages apparaissent sous forme d'embeds riches avec la couleur de votre choix.

Discord est particulierement adapte pour notifier une communaute de nouveaux contenus publies.

## Integrations HTTP personnalisees

Le format custom ouvre des possibilites infinies :

### Deploiement automatique
Declenchez un build Netlify, Vercel ou Cloudflare Pages a chaque publication de contenu. Plus besoin de deployer manuellement apres chaque modification.

### CRM et marketing
Envoyez les soumissions de formulaire vers HubSpot, Pipedrive ou Brevo pour alimenter votre pipeline commercial.

### Monitoring
Envoyez les evenements vers Datadog, Grafana ou un service de logging pour suivre l'activite editoriale.

### Automatisation Zapier/Make
Connectez EmDash a plus de 5 000 applications via Zapier ou Make en utilisant leur endpoint webhook comme destinataire.

## Fiabilite et gestion des erreurs

### File d'attente et retry

Le plugin utilise Cloudflare Queues pour gerer l'envoi des webhooks de maniere asynchrone. Si un endpoint est temporairement indisponible, le plugin reessaie automatiquement avec un backoff exponentiel (30 secondes, 1 minute, 5 minutes, 15 minutes). Apres cinq echecs consecutifs, le webhook est marque comme en erreur et une notification est envoyee a l'administrateur.

### Journal des envois

Chaque envoi est enregistre dans un journal accessible depuis l'administration. Vous pouvez consulter l'historique, voir les reponses des endpoints et renvoyer manuellement un webhook en echec.

### Securite

Les URL de webhooks contenant des tokens d'authentification sont stockees de maniere chiffree. Le plugin supporte egalement la signature HMAC des payloads pour que les endpoints puissent verifier l'authenticite des requetes.

## Points forts et limites

**Points forts :**
- Large palette d'evenements couverts
- Formats natifs Slack et Discord
- Format custom pour toute integration HTTP
- File d'attente avec retry automatique
- Journal des envois detaille
- Filtrage par collection et auteur

**Limites :**
- Pas de transformation avancee du payload (pas de templates Liquid ou Handlebars)
- Pas d'interface visuelle pour le mapping de champs
- La configuration se fait principalement en code

## Notre verdict

Le plugin Webhook Notifier est un outil essentiel pour integrer EmDash dans un workflow professionnel. Les integrations Slack et Discord sont bien pensees, le format custom offre une flexibilite totale et la gestion des erreurs avec retry automatique inspire confiance. C'est un plugin que nous recommandons d'installer systematiquement, meme si vous n'en avez pas besoin immediatement : le jour ou vous souhaiterez connecter EmDash a un outil externe, il sera pret.

**Note : 4/5** -- Un plugin d'integration fiable et flexible, indispensable pour les equipes qui travaillent avec plusieurs outils.

## Pour aller plus loin

- [Developper votre premier plugin](/tutoriels/premier-plugin) -- apprenez a creer vos propres integrations
- [Plugin Forms](/plugins/plugin-forms) -- combinez webhooks et formulaires pour des workflows complets
- [Anatomie d'un plugin standard](/plugins/creer-plugin-standard) -- comprendre la structure d'un plugin EmDash
- [API REST EmDash](/tutoriels/api-rest-emdash) -- explorez l'API qui alimente les evenements webhook
