---
title: "Anatomie d'un plugin standard EmDash"
description: "Deep dive technique dans la structure d'un plugin standard EmDash : manifest, hooks, Block Kit, stockage KV, publication et bonnes pratiques."
date: "2026-04-02"
author: "Equipe EmDash FR"
tags: ["emdash", "plugins", "developpement", "hooks", "block-kit", "tutoriel"]
pluginName: "Example Plugin"
pluginVersion: "0.1.0"
pluginType: "standard"
rating: 5
---

# Anatomie d'un plugin standard EmDash

Les plugins sont au coeur de l'extensibilite d'EmDash. Ils permettent d'ajouter des fonctionnalites sans modifier le noyau du CMS : [moderation](/plugins/plugin-ai-moderation), [formulaires](/plugins/plugin-forms), integrations, analytics, workflows. Ce guide detaille explore chaque composant d'un plugin standard, du manifest aux hooks, en passant par l'interface d'administration et le stockage de donnees.

## Vue d'ensemble de l'architecture

Un plugin standard EmDash est un module JavaScript/TypeScript autonome qui s'execute dans l'environnement Workers de Cloudflare (ou Node.js en developpement local). Il interagit avec EmDash via un systeme de hooks et dispose de son propre espace de stockage.

```
mon-plugin/
├── manifest.json              # Metadonnees et capabilities
├── src/
│   ├── index.ts               # Point d'entree et hooks
│   ├── admin/                 # Interface d'administration (Block Kit)
│   │   └── settings.ts
│   └── lib/                   # Logique metier
│       └── helpers.ts
├── package.json
└── README.md
```

## Le manifest : carte d'identite du plugin

Le fichier `manifest.json` declare les metadonnees, les permissions et les capabilities du plugin :

```json
{
  "name": "mon-plugin",
  "version": "0.1.0",
  "displayName": "Mon Plugin",
  "description": "Description de ce que fait le plugin.",
  "author": "Votre Nom",
  "license": "MIT",
  "emdash": {
    "minVersion": "0.1.0",
    "capabilities": [
      "hooks:content",
      "hooks:lifecycle",
      "hooks:cron",
      "storage:kv",
      "storage:documents",
      "admin:pages",
      "admin:blocks"
    ],
    "permissions": [
      "content:read",
      "content:write",
      "media:read",
      "email:send"
    ]
  }
}
```

### Capabilities

Les capabilities declarent ce que le plugin peut faire. EmDash n'accorde que les acces declares :

- `hooks:content` : reagir aux evenements de contenu (creation, modification, publication)
- `hooks:lifecycle` : reagir aux evenements du cycle de vie (installation, desinstallation, activation)
- `hooks:media` : reagir aux evenements de medias (upload, suppression)
- `hooks:email` : intercepter ou envoyer des emails
- `hooks:cron` : enregistrer des taches planifiees
- `hooks:page` : injecter du contenu dans les pages publiques
- `storage:kv` : utiliser le stockage cle-valeur
- `storage:documents` : utiliser le stockage de documents structures
- `admin:pages` : ajouter des pages dans le panneau d'administration
- `admin:blocks` : ajouter des blocs dans le tableau de bord

### Permissions

Les permissions definissent les acces aux ressources d'EmDash. Chaque permission est explicitement demandee et l'utilisateur est informe lors de l'installation. Pour en savoir plus sur le modele de securite, consultez le guide [securite des plugins](/guides/securite-plugins).

## Le systeme de hooks : le coeur du plugin

Les hooks sont le mecanisme principal d'interaction entre un plugin et EmDash. Chaque hook est une fonction asynchrone appelee a un moment precis du cycle de vie du CMS.

### Hooks de cycle de vie (lifecycle)

```typescript
import { definePlugin } from 'emdash:plugin';

export default definePlugin({
  onInstall: async (context) => {
    // Execute une seule fois a l'installation
    // Initialiser le stockage, creer les tables, etc.
    await context.kv.set('initialized', 'true');
  },

  onActivate: async (context) => {
    // Execute a chaque activation du plugin
  },

  onDeactivate: async (context) => {
    // Execute a chaque desactivation
    // Nettoyage des ressources temporaires
  },

  onUninstall: async (context) => {
    // Execute a la desinstallation
    // Supprimer les donnees du plugin si necessaire
  },

  onUpgrade: async (context, { fromVersion, toVersion }) => {
    // Execute lors d'une mise a jour du plugin
    // Migrations de donnees
  },
});
```

### Hooks de contenu (content)

Les hooks de contenu reagissent aux operations CRUD sur les collections EmDash :

```typescript
export default definePlugin({
  onContentCreated: async (context, { collection, entry }) => {
    // Une nouvelle entree a ete creee
    console.log(`Nouvelle entree dans ${collection}: ${entry.title}`);
  },

  onContentUpdated: async (context, { collection, entry, changes }) => {
    // Une entree a ete modifiee
    // `changes` contient les champs modifies
  },

  onContentPublished: async (context, { collection, entry }) => {
    // Une entree a ete publiee
    // Ideal pour le cross-posting, les notifications, etc.
  },

  onContentDeleted: async (context, { collection, entryId }) => {
    // Une entree a ete supprimee
  },

  // Hook de validation : peut bloquer la publication
  onContentBeforePublish: async (context, { collection, entry }) => {
    if (entry.data.title.length < 10) {
      return { 
        prevent: true, 
        reason: 'Le titre doit contenir au moins 10 caracteres.' 
      };
    }
    return { prevent: false };
  },
});
```

Le hook `onContentBeforePublish` est particulierement puissant : il peut empecher la publication d'un contenu en retournant `{ prevent: true }` avec une raison. Cela permet de creer des workflows de validation personnalises.

### Hooks de medias (media)

```typescript
export default definePlugin({
  onMediaUploaded: async (context, { file, metadata }) => {
    // Un fichier a ete uploade
    // Possibilite d'ajouter un traitement : compression, watermark, etc.
  },

  onMediaDeleted: async (context, { fileId }) => {
    // Un fichier a ete supprime
  },
});
```

### Hooks d'email (email)

```typescript
export default definePlugin({
  onEmailBeforeSend: async (context, { to, subject, body }) => {
    // Intercepter un email avant envoi
    // Possibilite de modifier le contenu ou bloquer l'envoi
    return { to, subject, body: body + '\n\nEnvoye via EmDash' };
  },
});
```

### Hooks de cron (taches planifiees)

```typescript
export default definePlugin({
  cron: {
    // Execute toutes les heures
    '0 * * * *': async (context) => {
      // Nettoyage, synchronisation, rapports...
      const stats = await computeStats(context);
      await context.kv.set('hourly-stats', JSON.stringify(stats));
    },

    // Execute tous les jours a minuit
    '0 0 * * *': async (context) => {
      await generateDailyReport(context);
    },
  },
});
```

### Hooks de page (injection front-end)

```typescript
export default definePlugin({
  onPageHead: async (context, { page }) => {
    // Injecter du contenu dans le <head> de chaque page
    return '<script async src="https://analytics.example.com/script.js"></script>';
  },

  onPageBodyEnd: async (context, { page }) => {
    // Injecter du contenu avant </body>
    return '<div id="chat-widget"></div><script>initChat()</script>';
  },
});
```

## Block Kit : l'interface d'administration

Block Kit est le systeme de composants qui permet aux plugins de creer des interfaces dans le panneau d'administration EmDash. Inspire du Block Kit de Slack, il offre un ensemble de blocs declaratifs.

### Ajouter une page d'administration

```typescript
export default definePlugin({
  admin: {
    pages: [
      {
        slug: 'settings',
        label: 'Configuration',
        icon: 'settings',
        render: async (context) => {
          const config = await context.kv.get('config');
          return [
            {
              type: 'header',
              text: 'Configuration du plugin',
            },
            {
              type: 'input',
              id: 'api-key',
              label: 'Cle API',
              value: config?.apiKey || '',
              inputType: 'password',
            },
            {
              type: 'toggle',
              id: 'enabled',
              label: 'Activer le plugin',
              value: config?.enabled ?? true,
            },
            {
              type: 'select',
              id: 'mode',
              label: 'Mode de fonctionnement',
              options: [
                { label: 'Automatique', value: 'auto' },
                { label: 'Manuel', value: 'manual' },
              ],
              value: config?.mode || 'auto',
            },
            {
              type: 'actions',
              elements: [
                { type: 'button', label: 'Sauvegarder', action: 'save', style: 'primary' },
                { type: 'button', label: 'Reinitialiser', action: 'reset', style: 'danger' },
              ],
            },
          ];
        },
        onAction: async (context, { action, values }) => {
          if (action === 'save') {
            await context.kv.set('config', JSON.stringify(values));
            return { toast: 'Configuration sauvegardee.' };
          }
        },
      },
    ],
  },
});
```

### Blocs disponibles

Block Kit propose les blocs suivants :
- **header** : titre de section
- **text** : paragraphe de texte (Markdown supporte)
- **input** : champ de saisie (text, password, number, email, url)
- **textarea** : zone de texte multiligne
- **toggle** : interrupteur on/off
- **select** : menu deroulant
- **checkbox** : cases a cocher
- **table** : tableau de donnees avec pagination
- **stat** : carte de statistique avec icone et valeur
- **divider** : separateur horizontal
- **actions** : groupe de boutons d'action

## Stockage de donnees

### Stockage KV (cle-valeur)

Chaque plugin dispose d'un espace KV isole pour stocker des donnees simples :

```typescript
// Ecrire
await context.kv.set('ma-cle', 'ma-valeur');
await context.kv.set('config', JSON.stringify({ mode: 'auto' }));

// Lire
const value = await context.kv.get('ma-cle');
const config = JSON.parse(await context.kv.get('config'));

// Supprimer
await context.kv.delete('ma-cle');

// Lister les cles
const keys = await context.kv.list({ prefix: 'stats:' });
```

### Stockage de documents

Pour des donnees plus structurees, le stockage de documents offre des capacites de requetage :

```typescript
// Creer un document
await context.documents.create('submissions', {
  formId: 'contact',
  name: 'Marie Dupont',
  email: 'marie@example.com',
  date: new Date().toISOString(),
});

// Requeter des documents
const recent = await context.documents.query('submissions', {
  where: { formId: 'contact' },
  orderBy: { date: 'desc' },
  limit: 10,
});

// Compter
const count = await context.documents.count('submissions', {
  where: { formId: 'contact' },
});
```

## Workflow de publication

### Developpement local

```bash
# Creer un nouveau plugin
npx emdash plugin create mon-plugin

# Demarrer en mode developpement
npx emdash dev --plugins ./mon-plugin

# Tester les hooks
npx emdash plugin test mon-plugin
```

### Publication sur le registre EmDash

```bash
# Verifier le manifest
npx emdash plugin validate

# Publier
npx emdash plugin publish
```

Le registre EmDash verifie la conformite du manifest, execute les tests de securite et rend le plugin disponible pour l'installation en un clic.

## Points forts et limites

**Points forts :**
- Systeme de hooks complet couvrant tous les aspects du CMS
- Block Kit intuitif pour les interfaces d'administration
- Stockage KV et documents isoles par plugin
- Typage TypeScript complet
- Workflow de developpement local fluide

**Limites :**
- Pas de hot reload pour les plugins en developpement (necessite un redemarrage)
- Le registre de plugins est encore naissant
- La documentation de certains hooks avances pourrait etre plus detaillee

## Notre verdict

Le systeme de plugins d'EmDash est remarquablement bien concu. L'architecture par hooks est a la fois puissante et accessible, Block Kit simplifie la creation d'interfaces d'administration et le stockage integre elimine le besoin de gerer sa propre base de donnees. C'est un ecosysteme de plugins qui merite d'etre explore par tout developpeur souhaitant etendre EmDash.

**Note : 5/5** -- Une architecture de plugins exemplaire, a la fois puissante et agreable a utiliser.

## Pour aller plus loin

- [Developper votre premier plugin](/tutoriels/premier-plugin) -- tutoriel pas a pas pour creer un plugin de A a Z
- [Securite des plugins EmDash](/guides/securite-plugins) -- comprendre les isolats V8 et le systeme de permissions
- [API REST EmDash](/tutoriels/api-rest-emdash) -- explorez l'API utilisee par les hooks de contenu
- [Plugin AI Moderation](/plugins/plugin-ai-moderation) -- un exemple concret de plugin standard
- [Plugin Forms](/plugins/plugin-forms) -- un autre exemple avec constructeur visuel et stockage
