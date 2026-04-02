---
title: "Dossier complet : quitter WordPress pour EmDash"
description: "Guide de migration complet de WordPress vers EmDash : pourquoi migrer, planification, processus etape par etape, gains et compromis."
date: "2026-04-02"
author: "Equipe EmDash FR"
category: "Migration"
tags: ["emdash", "wordpress", "migration", "cms", "guide"]
---

# Dossier complet : quitter WordPress pour EmDash

WordPress propulse plus de 40 % du web. C'est un outil mature, puissant et flexible. Alors pourquoi envisager une migration vers EmDash ? Ce dossier repond a cette question sans complaisance, puis vous guide pas a pas dans le processus de migration, en detaillant ce que vous gagnez, ce que vous perdez et comment reussir la transition.

## Pourquoi migrer ? Les motivations legitimes

### Securite

WordPress est la cible numero un des attaques web. Son ecosysteme de plugins PHP, souvent mal maintenus, constitue une surface d'attaque considerable. Les mises a jour de securite sont frequentes et chaque retard augmente le risque. EmDash, en tant qu'application Astro [deployee sur Cloudflare Workers](/tutoriels/deployer-cloudflare), presente une surface d'attaque radicalement reduite : pas de serveur PHP, pas de base de donnees MySQL accessible depuis l'exterieur, pas de fichiers sur un serveur traditionnel.

### Performances

Un site WordPress classique necessite un serveur LAMP, des requetes MySQL a chaque chargement de page et souvent une couche de cache (WP Super Cache, Redis, Varnish) pour atteindre des performances acceptables. EmDash genere des pages statiques ou les sert depuis le reseau edge de Cloudflare, avec des temps de reponse inferieurs a 50 ms partout dans le monde.

### Stack moderne

WordPress repose sur PHP et une architecture concue en 2003. Meme si Gutenberg a modernise l'editeur, le coeur reste ancre dans un paradigme ancien. EmDash utilise Astro, TypeScript, et les standards web modernes. Pour un developpeur en 2026, c'est une experience de travail incomparablement plus agreable.

### Cout d'exploitation

Un site WordPress performant necessite un hebergement de qualite (50 a 200 euros/mois pour un site a trafic moyen), des plugins premium (souvent 100 a 500 euros/an) et du temps de maintenance. EmDash sur Cloudflare Workers peut fonctionner dans le free tier pour les petits sites, ou pour quelques euros par mois pour les sites a trafic modere.

### Simplicite

WordPress est devenu un ecosysteme complexe. Entre les 60 000 plugins, les page builders, les themes enfants, les hooks PHP et les filtres, la courbe d'apprentissage est devenue considerable. EmDash fait le choix de la simplicite : un CMS, un framework (Astro), une plateforme (Cloudflare).

## Quand NE PAS migrer

Soyons honnetes : la migration n'est pas toujours pertinente.

- **E-commerce avec WooCommerce** : EmDash n'a pas d'equivalent a WooCommerce. Si votre site repose sur la vente en ligne avec gestion de stock, paiement et livraison, restez sur WordPress ou envisagez une solution dediee.
- **Site avec des dizaines de plugins specifiques** : si votre site depend de plugins WordPress tres specialises (LMS, membership, booking), verifiez que des alternatives existent dans l'ecosysteme EmDash avant de migrer.
- **Equipe non technique** : EmDash est plus simple a utiliser au quotidien, mais la migration et la personnalisation demandent des competences en developpement web moderne. Si votre equipe ne maitrise pas JavaScript/TypeScript, prevoyez un accompagnement.
- **Tres gros volumes de contenu** : au-dela de 10 000 articles avec des relations complexes, la migration necessite une planification rigoureuse.

## Planifier la migration

### Inventaire du contenu

Avant toute chose, faites l'inventaire de votre site WordPress :

1. **Articles et pages** : nombre, categories, tags, auteurs, statuts (publie, brouillon)
2. **Medias** : nombre d'images, videos et documents, taille totale
3. **Commentaires** : nombre, moderation, reponses imbriquees
4. **Plugins actifs** : listez chaque plugin et sa fonction, identifiez les equivalents EmDash
5. **Fonctionnalites custom** : shortcodes, custom post types, custom fields (ACF, etc.)
6. **SEO** : redirections existantes, URLs permanentes, donnees structurees
7. **Integrations** : newsletter, analytics, CRM, reseaux sociaux

### Mapping des contenus

Etablissez la correspondance entre les structures WordPress et EmDash :

| WordPress | EmDash |
|-----------|--------|
| Posts | Collection `posts` |
| Pages | Collection `pages` |
| Categories | Champ `category` ou collection dediee |
| Tags | Champ `tags` |
| Custom Post Types | Collections personnalisees |
| ACF Fields | Champs dans `emdash.config.ts` |
| Menus | Collection `navigation` ou config |
| Widgets | Composants Astro |

### Plan de redirections

Vos URLs vont probablement changer. Preparez un fichier de redirections 301 pour chaque ancienne URL vers la nouvelle. C'est crucial pour le SEO.

```
/2024/03/mon-article/ -> /blog/mon-article
/category/tech/ -> /categories/tech
/wp-content/uploads/2024/03/image.jpg -> /images/image.jpg
```

## Processus de migration etape par etape

### Etape 1 : Exporter le contenu WordPress

Utilisez l'outil d'export natif de WordPress (Outils > Exporter) pour generer un fichier WXR (WordPress eXtended RSS). Ce fichier XML contient tous vos articles, pages, commentaires, categories et tags.

Pour les custom fields (ACF), exportez egalement les donnees via un plugin comme WP All Export.

### Etape 2 : Convertir le contenu

EmDash fournit un [outil de migration en ligne de commande](/tutoriels/migration-wordpress) :

```bash
npx emdash migrate wordpress --input export.xml --output ./content
```

Cet outil convertit le WXR en fichiers Markdown avec frontmatter compatible EmDash. Il gere :
- La conversion HTML vers Markdown
- L'extraction des metadonnees (titre, date, auteur, categories, tags)
- La generation des slugs
- Le mapping des shortcodes courants

Pour les shortcodes personnalises, vous devrez creer des regles de conversion specifiques ou les remplacer manuellement.

### Etape 3 : Migrer les medias

Les medias (images, documents) doivent etre transferes vers le stockage EmDash (R2 en production, systeme de fichiers en local) :

```bash
npx emdash migrate media --input ./wp-content/uploads/ --output ./media
```

L'outil met a jour automatiquement les references dans les fichiers Markdown pour pointer vers les nouvelles URLs.

### Etape 4 : Configurer EmDash

Creez votre projet EmDash et configurez les collections dans `emdash.config.ts` en vous basant sur le mapping etabli precedemment. Importez ensuite le contenu converti.

### Etape 5 : Choisir et adapter un theme

Selectionnez un theme EmDash ([Blog Starter](/themes/theme-blog), [Marketing Starter](/themes/theme-marketing), [Portfolio Starter](/themes/theme-portfolio) ou custom) et adaptez-le a votre charte graphique. C'est souvent l'etape la plus chronophage.

### Etape 6 : Configurer les redirections

Mettez en place les redirections 301 dans la configuration Cloudflare ou dans le fichier `_redirects` :

```
/2024/03/mon-article/  /blog/mon-article  301
/category/tech/        /categories/tech   301
```

### Etape 7 : Tester

Verifiez chaque aspect :
- Tous les articles sont presents et correctement formates
- Les images s'affichent correctement
- Les redirections fonctionnent
- Le SEO est preserve (meta, Open Graph, donnees structurees)
- Les formulaires fonctionnent
- La recherche renvoie des resultats pertinents

### Etape 8 : Basculer le DNS

Lorsque tout est valide, basculez votre DNS vers le nouveau site. Gardez l'ancien site WordPress accessible pendant quelques semaines en cas de probleme.

## Ce que vous gagnez

- **Performances** : temps de chargement divise par 5 a 10
- **Securite** : surface d'attaque quasi inexistante
- **Cout** : hebergement gratuit ou quelques euros par mois
- **DX (Developer Experience)** : TypeScript, Astro, outillage moderne
- **Simplicite** : moins de plugins, moins de maintenance
- **Scalabilite** : le reseau edge de Cloudflare encaisse n'importe quel pic de trafic

## Ce que vous perdez

- **Ecosysteme de plugins** : 60 000 plugins WordPress vs quelques dizaines pour EmDash
- **Communaute** : WordPress a la plus grande communaute CMS au monde
- **Compatibilite** : certains services tiers s'integrent uniquement avec WordPress
- **Editeur visuel** : Gutenberg est plus avance que l'editeur EmDash actuel
- **Hebergement gere** : les hebergements WordPress manages (WP Engine, Kinsta) offrent un support specifique

## Checklist post-migration

- [ ] Verifier les redirections 301 avec un crawler (Screaming Frog, Ahrefs)
- [ ] Soumettre le nouveau sitemap dans Google Search Console
- [ ] Verifier l'indexation des pages principales
- [ ] Tester les formulaires de contact
- [ ] Configurer les notifications (webhook, email)
- [ ] Mettre en place les sauvegardes automatiques
- [ ] Surveiller les erreurs 404 pendant 30 jours
- [ ] Comparer les metriques de performance avant/apres
- [ ] Former l'equipe editoriale au panneau d'administration EmDash
- [ ] Desactiver l'ancien site WordPress apres 30 jours sans probleme

## Notre conclusion

Migrer de WordPress vers EmDash est un investissement qui demande du temps et de la planification, mais les benefices sont reels : performances superieures, securite renforcee, couts reduits et experience de developpement moderne. La cle du succes est une preparation rigoureuse, un mapping de contenu precis et une phase de test approfondie. Si votre site ne depend pas fortement de l'ecosysteme de plugins WordPress, la migration vaut clairement la peine d'etre envisagee. Pour un comparatif detaille, consultez notre [guide EmDash vs WordPress](/guides/emdash-vs-wordpress).

## Pour aller plus loin

- [Tutoriel de migration WordPress](/tutoriels/migration-wordpress) -- le guide technique pas a pas
- [EmDash vs WordPress](/guides/emdash-vs-wordpress) -- comparatif detaille des deux CMS
- [Installer EmDash](/tutoriels/installer-emdash) -- preparez votre environnement avant la migration
- [Guide Portable Text](/guides/portable-text-guide) -- comprendre le nouveau format de contenu
- [Deployer sur Cloudflare](/tutoriels/deployer-cloudflare) -- mettre votre nouveau site en ligne
- [Mettre EmDash en production](/dossiers/emdash-production) -- checklist et guide de mise en production
