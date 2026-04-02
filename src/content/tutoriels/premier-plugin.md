---
title: "Developper votre premier plugin EmDash"
description: "Guide complet pour creer un plugin EmDash : manifest, hooks, stockage KV, interface admin avec Block Kit et publication sur le marketplace."
date: "2026-04-02"
author: "Equipe EmDash FR"
category: "Plugins"
tags: ["emdash", "plugin", "hooks", "block-kit", "marketplace", "developpement"]
difficulty: "avance"
duration: "25 min"
---

# Developper votre premier plugin EmDash

Le systeme de plugins d'EmDash permet d'etendre chaque aspect du CMS : transformer le contenu avant la sauvegarde, ajouter des champs personnalises, integrer des services tiers, ou meme ajouter des pages entieres au panneau d'administration. Dans ce tutoriel, nous allons creer un plugin "SEO Analyzer" qui analyse le contenu avant publication et fournit des recommandations d'optimisation.

## Architecture des plugins

EmDash distingue deux types de plugins :

**Plugins Standard** : executent du code cote serveur via des hooks. Ils peuvent lire et modifier le contenu, appeler des API externes, et stocker des donnees dans KV. C'est le type le plus courant.

**Plugins Natifs** : en plus des hooks, ils peuvent modifier le schema de la base de donnees (ajouter des tables, des colonnes) et injecter du code cote client dans le panneau d'administration. Reservez-les aux extensions profondes du CMS.

Pour notre plugin SEO Analyzer, un plugin Standard suffit.

## Structure du plugin

Creez un nouveau repertoire pour le plugin :

```bash
mkdir emdash-plugin-seo-analyzer
cd emdash-plugin-seo-analyzer
npm init -y
```

Structure cible :

```
emdash-plugin-seo-analyzer/
├── package.json             # Manifest npm + metadata EmDash
├── src/
│   ├── index.ts             # Point d'entree principal
│   ├── hooks/
│   │   ├── beforeSave.ts    # Hook pre-sauvegarde
│   │   └── afterSave.ts     # Hook post-sauvegarde
│   ├── analyzer.ts          # Logique d'analyse SEO
│   └── admin/
│       └── settings.ts      # Interface admin Block Kit
├── tsconfig.json
└── README.md
```

## Etape 1 : Le manifest du plugin

Le fichier `package.json` contient les metadonnees du plugin dans la section `emdash` :

```json
{
  "name": "@votre-nom/emdash-plugin-seo-analyzer",
  "version": "1.0.0",
  "description": "Analyse SEO en temps reel pour EmDash",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "keywords": ["emdash-plugin", "seo", "analyse"],
  "emdash": {
    "type": "standard",
    "displayName": "SEO Analyzer",
    "description": "Analyse le contenu et fournit des recommandations SEO avant publication.",
    "icon": "search",
    "version": "0.1.0",
    "capabilities": [
      "content:read",
      "content:hook",
      "kv:read",
      "kv:write",
      "settings:read",
      "admin:page"
    ],
    "hooks": [
      "content:beforeSave",
      "content:afterSave"
    ],
    "settings": true,
    "adminPages": [
      {
        "path": "/seo",
        "title": "Analyse SEO",
        "icon": "search",
        "position": "sidebar"
      }
    ]
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@emdash/plugin-sdk": "^0.1.0"
  },
  "peerDependencies": {
    "@emdash/core": "^0.1.0"
  }
}
```

### Comprendre les capabilities

Les `capabilities` declarent ce que votre plugin a le droit de faire. EmDash applique ces permissions strictement (voir le guide [Securite des plugins](/guides/securite-plugins) pour plus de details) :

- `content:read` --- Lire le contenu des collections
- `content:write` --- Modifier le contenu
- `content:hook` --- S'abonner aux hooks de contenu
- `kv:read` / `kv:write` --- Lire/ecrire dans le stockage KV du plugin
- `settings:read` / `settings:write` --- Acceder aux parametres du plugin
- `admin:page` --- Ajouter des pages au panneau d'administration
- `media:read` / `media:write` --- Acceder a la bibliotheque media
- `api:endpoint` --- Ajouter des endpoints API personnalises

## Etape 2 : Le point d'entree

```typescript
// src/index.ts
import { defineEmDashPlugin } from '@emdash/plugin-sdk';
import { handleBeforeSave } from './hooks/beforeSave';
import { handleAfterSave } from './hooks/afterSave';
import { settingsPage } from './admin/settings';

export default defineEmDashPlugin({
  name: 'seo-analyzer',

  // Initialisation du plugin
  async setup(ctx) {
    console.log('[SEO Analyzer] Plugin initialise');

    // Initialiser les parametres par defaut dans KV
    const settings = await ctx.kv.get('settings');
    if (!settings) {
      await ctx.kv.set('settings', {
        minTitleLength: 30,
        maxTitleLength: 60,
        minDescriptionLength: 120,
        maxDescriptionLength: 155,
        minContentLength: 300,
        checkImages: true,
        checkLinks: true,
        targetKeywordDensity: 1.5,
      });
    }
  },

  // Enregistrer les hooks
  hooks: {
    'content:beforeSave': handleBeforeSave,
    'content:afterSave': handleAfterSave,
  },

  // Pages d'administration
  admin: {
    settings: settingsPage,
  },
});
```

## Etape 3 : Le hook content:beforeSave

Ce hook s'execute avant chaque sauvegarde de contenu. Il peut modifier les donnees ou bloquer la sauvegarde :

```typescript
// src/hooks/beforeSave.ts
import type { ContentBeforeSaveHook } from '@emdash/plugin-sdk';
import { analyzeContent } from '../analyzer';

export const handleBeforeSave: ContentBeforeSaveHook = async (ctx) => {
  const { entry, collection, action } = ctx;

  // Ne verifier que lors de la publication
  if (entry.status !== 'published') {
    return { proceed: true, entry };
  }

  // Charger les parametres du plugin
  const settings = await ctx.kv.get('settings');

  // Analyser le contenu
  const analysis = analyzeContent(entry, settings);

  // Stocker le resultat de l'analyse dans KV
  await ctx.kv.set(`analysis:${collection}:${entry.id}`, {
    score: analysis.score,
    issues: analysis.issues,
    analyzedAt: new Date().toISOString(),
  });

  // Si le score est critique (< 30), bloquer la publication avec un message
  if (analysis.score < 30) {
    return {
      proceed: false,
      error: {
        message: 'Le contenu ne respecte pas les criteres SEO minimaux.',
        details: analysis.issues
          .filter((i) => i.severity === 'error')
          .map((i) => i.message),
      },
    };
  }

  // Avertissements non bloquants (affiches dans l'admin)
  if (analysis.issues.some((i) => i.severity === 'warning')) {
    ctx.notify({
      type: 'warning',
      title: 'Recommandations SEO',
      message: `Score SEO : ${analysis.score}/100. ${analysis.issues.length} point(s) a ameliorer.`,
    });
  }

  return { proceed: true, entry };
};
```

## Etape 4 : Le moteur d'analyse SEO

```typescript
// src/analyzer.ts
import type { PortableTextBlock } from '@emdash/plugin-sdk';

interface AnalysisResult {
  score: number;
  issues: Issue[];
}

interface Issue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
}

interface Settings {
  minTitleLength: number;
  maxTitleLength: number;
  minDescriptionLength: number;
  maxDescriptionLength: number;
  minContentLength: number;
  checkImages: boolean;
  checkLinks: boolean;
  targetKeywordDensity: number;
}

export function analyzeContent(entry: any, settings: Settings): AnalysisResult {
  const issues: Issue[] = [];
  let score = 100;

  // --- Analyse du titre ---
  if (!entry.title) {
    issues.push({ severity: 'error', code: 'TITLE_MISSING', message: 'Le titre est manquant.' });
    score -= 30;
  } else {
    if (entry.title.length < settings.minTitleLength) {
      issues.push({
        severity: 'warning',
        code: 'TITLE_SHORT',
        message: `Le titre fait ${entry.title.length} caracteres (minimum recommande : ${settings.minTitleLength}).`,
      });
      score -= 10;
    }
    if (entry.title.length > settings.maxTitleLength) {
      issues.push({
        severity: 'warning',
        code: 'TITLE_LONG',
        message: `Le titre fait ${entry.title.length} caracteres (maximum recommande : ${settings.maxTitleLength}).`,
      });
      score -= 5;
    }
  }

  // --- Analyse de la meta description ---
  if (!entry.excerpt && !entry.description) {
    issues.push({
      severity: 'error',
      code: 'DESC_MISSING',
      message: 'La meta description (extrait) est manquante.',
    });
    score -= 20;
  }

  // --- Analyse du contenu Portable Text ---
  if (entry.body && Array.isArray(entry.body)) {
    const textContent = extractTextFromPortableText(entry.body);
    const wordCount = textContent.split(/\s+/).filter(Boolean).length;

    if (wordCount < settings.minContentLength) {
      issues.push({
        severity: 'warning',
        code: 'CONTENT_SHORT',
        message: `Le contenu fait ${wordCount} mots (minimum recommande : ${settings.minContentLength}).`,
      });
      score -= 15;
    }

    // Verifier les images sans texte alternatif
    if (settings.checkImages) {
      const images = entry.body.filter(
        (block: any) => block._type === 'image' && !block.alt
      );
      if (images.length > 0) {
        issues.push({
          severity: 'warning',
          code: 'IMG_NO_ALT',
          message: `${images.length} image(s) sans texte alternatif.`,
        });
        score -= images.length * 5;
      }
    }

    // Verifier la structure des titres
    const headings = entry.body.filter(
      (block: any) => block.style && block.style.startsWith('h')
    );
    const hasH2 = headings.some((h: any) => h.style === 'h2');
    if (wordCount > 300 && !hasH2) {
      issues.push({
        severity: 'info',
        code: 'NO_HEADINGS',
        message: 'Aucun sous-titre H2 detecte. Structurez votre contenu avec des titres.',
      });
      score -= 5;
    }
  }

  // --- Analyse du slug ---
  if (!entry.slug) {
    issues.push({ severity: 'error', code: 'SLUG_MISSING', message: 'Le slug URL est manquant.' });
    score -= 15;
  } else if (entry.slug.length > 75) {
    issues.push({
      severity: 'info',
      code: 'SLUG_LONG',
      message: 'Le slug depasse 75 caracteres. Un slug plus court est preferable.',
    });
    score -= 3;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
  };
}

function extractTextFromPortableText(blocks: PortableTextBlock[]): string {
  return blocks
    .filter((block) => block._type === 'block')
    .map((block) =>
      (block.children || [])
        .filter((child: any) => child._type === 'span')
        .map((child: any) => child.text)
        .join('')
    )
    .join(' ');
}
```

## Etape 5 : L'interface admin avec Block Kit

EmDash utilise **Block Kit** pour les interfaces d'administration des plugins. Inspire des frameworks declaratifs, Block Kit vous permet de definir des interfaces sans ecrire de HTML :

```typescript
// src/admin/settings.ts
import { defineAdminPage } from '@emdash/plugin-sdk';

export const settingsPage = defineAdminPage({
  title: 'Parametres SEO Analyzer',

  async load(ctx) {
    const settings = await ctx.kv.get('settings');
    return { settings };
  },

  render({ settings }) {
    return [
      {
        type: 'section',
        title: 'Regles du titre',
        blocks: [
          {
            type: 'number-input',
            id: 'minTitleLength',
            label: 'Longueur minimale du titre',
            value: settings.minTitleLength,
            min: 10,
            max: 100,
            help: 'Nombre minimal de caracteres recommande pour le titre SEO.',
          },
          {
            type: 'number-input',
            id: 'maxTitleLength',
            label: 'Longueur maximale du titre',
            value: settings.maxTitleLength,
            min: 30,
            max: 150,
          },
        ],
      },
      {
        type: 'section',
        title: 'Regles du contenu',
        blocks: [
          {
            type: 'number-input',
            id: 'minContentLength',
            label: 'Nombre minimal de mots',
            value: settings.minContentLength,
            min: 50,
            max: 2000,
            help: 'Articles en dessous de ce seuil recevront un avertissement.',
          },
          {
            type: 'toggle',
            id: 'checkImages',
            label: 'Verifier les textes alternatifs des images',
            value: settings.checkImages,
          },
          {
            type: 'toggle',
            id: 'checkLinks',
            label: 'Verifier les liens internes',
            value: settings.checkLinks,
          },
        ],
      },
      {
        type: 'section',
        title: 'Meta description',
        blocks: [
          {
            type: 'number-input',
            id: 'minDescriptionLength',
            label: 'Longueur minimale',
            value: settings.minDescriptionLength,
            min: 50,
            max: 200,
          },
          {
            type: 'number-input',
            id: 'maxDescriptionLength',
            label: 'Longueur maximale',
            value: settings.maxDescriptionLength,
            min: 100,
            max: 300,
          },
        ],
      },
    ];
  },

  async onSave(ctx, formData) {
    await ctx.kv.set('settings', {
      minTitleLength: formData.minTitleLength,
      maxTitleLength: formData.maxTitleLength,
      minDescriptionLength: formData.minDescriptionLength,
      maxDescriptionLength: formData.maxDescriptionLength,
      minContentLength: formData.minContentLength,
      checkImages: formData.checkImages,
      checkLinks: formData.checkLinks,
      targetKeywordDensity: 1.5,
    });

    return { success: true, message: 'Parametres sauvegardes.' };
  },
});
```

## Etape 6 : Le hook content:afterSave

Ce hook s'execute apres la sauvegarde reussie. Utile pour des actions asynchrones non bloquantes :

```typescript
// src/hooks/afterSave.ts
import type { ContentAfterSaveHook } from '@emdash/plugin-sdk';

export const handleAfterSave: ContentAfterSaveHook = async (ctx) => {
  const { entry, collection, action } = ctx;

  if (entry.status !== 'published') return;

  // Mettre a jour les statistiques globales
  const stats = (await ctx.kv.get('global:stats')) || { totalAnalyzed: 0, avgScore: 0 };
  const analysis = await ctx.kv.get(`analysis:${collection}:${entry.id}`);

  if (analysis) {
    stats.totalAnalyzed += 1;
    stats.avgScore = Math.round(
      ((stats.avgScore * (stats.totalAnalyzed - 1)) + analysis.score) / stats.totalAnalyzed
    );
    await ctx.kv.set('global:stats', stats);
  }

  // Webhook optionnel vers un service externe
  const settings = await ctx.kv.get('settings');
  if (settings.webhookUrl) {
    try {
      await fetch(settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'seo:analyzed',
          collection,
          entryId: entry.id,
          score: analysis?.score,
        }),
      });
    } catch (err) {
      console.error('[SEO Analyzer] Webhook failed:', err);
    }
  }
};
```

## Autres hooks disponibles

EmDash fournit de nombreux hooks pour les plugins :

| Hook | Declencheur | Bloquant |
|------|-------------|----------|
| `content:beforeSave` | Avant la sauvegarde d'un contenu | Oui |
| `content:afterSave` | Apres la sauvegarde reussie | Non |
| `content:beforeDelete` | Avant la suppression | Oui |
| `content:afterDelete` | Apres la suppression | Non |
| `media:beforeUpload` | Avant l'upload d'un fichier | Oui |
| `media:afterUpload` | Apres l'upload reussi | Non |
| `auth:afterLogin` | Apres une connexion reussie | Non |
| `schema:afterMigrate` | Apres une migration de schema | Non |
| `build:beforeGenerate` | Avant la generation statique | Non |

## Tester votre plugin en local

Installez le plugin dans votre projet EmDash :

```bash
# Depuis le repertoire de votre site EmDash
npm install ../emdash-plugin-seo-analyzer
```

Ajoutez-le dans `emdash.config.ts` :

```typescript
import { defineEmDashConfig } from '@emdash/core';
import seoAnalyzer from '@votre-nom/emdash-plugin-seo-analyzer';

export default defineEmDashConfig({
  plugins: [seoAnalyzer()],
});
```

Relancez le serveur de developpement. Le plugin apparait dans **Plugins** dans l'admin.

## Publier sur le marketplace

Pour publier votre plugin sur le marketplace EmDash :

```bash
# Build le plugin
npm run build

# Publier sur npm
npm publish --access public

# Enregistrer sur le marketplace EmDash
npx emdash plugin:publish
```

La commande `plugin:publish` verifie le manifest, valide les capabilities et soumet le plugin pour revision. Une fois approuve, il apparaitra dans le marketplace accessible depuis le panneau d'administration de tout site EmDash.

## Prochaines etapes

Vous savez maintenant creer un plugin EmDash complet avec des hooks, du stockage KV et une interface d'administration. Explorez les hooks `media:*` pour creer des plugins de traitement d'images, ou les hooks `auth:*` pour des integrations SSO personnalisees.

## Pour aller plus loin

- [Anatomie d'un plugin standard](/plugins/creer-plugin-standard) --- reference complete de la structure d'un plugin
- [Securite des plugins EmDash](/guides/securite-plugins) --- comprendre le modele de permissions et les bonnes pratiques
- [Maitriser l'API REST d'EmDash](/tutoriels/api-rest-emdash) --- interagir avec le CMS depuis vos plugins via l'API
- [Plugin AI Moderation](/plugins/plugin-ai-moderation) --- exemple de plugin utilisant l'IA pour moderer le contenu
- [Plugin Forms](/plugins/plugin-forms) --- exemple de plugin ajoutant des formulaires a EmDash
