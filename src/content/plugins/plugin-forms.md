---
title: "Test du plugin Forms : creez des formulaires sans code"
description: "Test complet du plugin Forms pour EmDash : constructeur de formulaires, gestion des soumissions, notifications email et integrations."
date: "2026-04-02"
author: "Equipe EmDash FR"
tags: ["emdash", "plugins", "formulaires", "forms", "no-code"]
pluginName: "forms"
pluginVersion: "0.1.0"
pluginType: "standard"
rating: 4
---

# Test du plugin Forms : creez des formulaires sans code

Les formulaires sont un element essentiel de tout site web : contact, inscription a une newsletter, demande de devis, sondage, candidature. Le plugin **Forms** d'EmDash offre un constructeur de formulaires complet directement dans le panneau d'administration, sans ecrire une seule ligne de code. Voici notre analyse detaillee.

## Qu'est-ce que le plugin Forms ?

Le plugin Forms est un plugin officiel (first-party) qui ajoute a EmDash un systeme complet de creation et de gestion de formulaires. Il se compose de trois elements :

1. **Un constructeur visuel** dans le panneau d'administration pour concevoir vos formulaires
2. **Un moteur de traitement** cote serveur qui recoit, valide et stocke les soumissions
3. **Un composant front-end** a integrer dans votre theme pour afficher les formulaires

Le tout fonctionne sans base de donnees supplementaire : les soumissions sont stockees directement dans D1 (ou SQLite en mode local).

## Le constructeur de formulaires

### Types de champs disponibles

Le constructeur propose une palette complete de types de champs :

- **Texte court** : nom, email, telephone, URL
- **Texte long** : message, commentaire, description
- **Email** : avec validation automatique du format
- **Nombre** : avec min/max optionnels
- **Selection** : menu deroulant, boutons radio, cases a cocher
- **Date et heure** : avec sélecteur natif
- **Upload de fichier** : avec restrictions de type et de taille (stocke dans R2)
- **Champ cache** : pour les donnees techniques (source, UTM, etc.)
- **Consentement** : case a cocher RGPD avec texte personnalisable

### Interface de construction

L'interface est intuitive : glissez-deposez les champs, configurez leurs proprietes (label, placeholder, validation, champ requis) et previsualisez le formulaire en temps reel. Chaque champ dispose d'un panneau de configuration lateral.

```
+------------------------------------------+
|  Constructeur de formulaire              |
+------------------------------------------+
|  [Nom]          Texte court | Requis     |
|  [Email]        Email | Requis           |
|  [Sujet]        Selection | Optionnel    |
|  [Message]      Texte long | Requis      |
|  [RGPD]         Consentement | Requis    |
|  [+ Ajouter un champ]                    |
+------------------------------------------+
|  Apercu en direct                        |
+------------------------------------------+
```

### Validation

Chaque champ supporte des regles de validation configurables :
- Champ requis ou optionnel
- Longueur minimale et maximale
- Expression reguliere personnalisee
- Messages d'erreur personnalises en francais

La validation s'execute a la fois cote client (pour un feedback immediat) et cote serveur (pour la securite).

### Protection anti-spam

Le plugin integre plusieurs mecanismes anti-spam :
- **Honeypot** : un champ invisible que seuls les bots remplissent
- **Rate limiting** : nombre maximal de soumissions par IP par heure
- **Integration [AI Moderation](/plugins/plugin-ai-moderation)** : si le plugin AI Moderation est installe, les soumissions sont analysees automatiquement

Aucun CAPTCHA n'est impose par defaut, ce qui preserve l'experience utilisateur.

## Gestion des soumissions

### Tableau de bord

Toutes les soumissions sont centralisees dans un tableau de bord dedie accessible depuis l'administration EmDash. Chaque formulaire dispose de sa propre vue avec :

- Liste des soumissions avec date, statut et apercu
- Vue detaillee de chaque soumission
- Filtrage par date, statut (nouveau, lu, archive, spam)
- Recherche dans les soumissions
- Export CSV et JSON

### Statuts de soumission

Chaque soumission passe par un cycle de vie simple :
1. **Nouveau** : soumission recue, non lue
2. **Lu** : un administrateur a consulte la soumission
3. **Archive** : soumission traitee
4. **Spam** : soumission marquee comme indesirable

### Donnees et stockage

Les soumissions sont stockees dans la base de donnees D1 d'EmDash. Les fichiers uploades sont stockes dans R2 avec un lien securise dans la soumission. La retention des donnees est configurable : vous pouvez definir une duree apres laquelle les soumissions archivees sont automatiquement supprimees, en conformite avec le RGPD.

## Notifications par email

Le plugin peut envoyer des notifications par email a chaque nouvelle soumission. La configuration est flexible :

```typescript
plugins: {
  forms: {
    notifications: {
      // Notifier l'admin a chaque soumission
      admin: {
        to: ['admin@monsite.fr'],
        subject: 'Nouvelle soumission : {{formName}}',
      },
      // Envoyer un accuse de reception au visiteur
      autoReply: {
        enabled: true,
        subject: 'Merci pour votre message',
        template: 'auto-reply', // template personnalisable
      },
    },
  },
},
```

### Templates d'email

Les emails utilisent des templates personnalisables au format HTML. Le plugin fournit des templates par defaut professionnels et responsive. Vous pouvez les remplacer par vos propres templates en les placant dans le dossier `emails/` de votre projet.

Les templates supportent des variables dynamiques : `{{formName}}`, `{{submissionDate}}`, `{{fieldName}}`, etc.

### Integration webhook

En complement de l'email, le plugin peut declencher un webhook a chaque soumission. Combinez-le avec le plugin [Webhook Notifier](/plugins/plugin-webhook-notifier) pour envoyer les soumissions vers Slack, Discord, un CRM ou tout autre outil.

## Integration dans votre theme

### Composant Astro

Le plugin fournit un composant Astro pret a l'emploi :

```astro
---
import { EmDashForm } from 'emdash:plugins/forms';
---
<EmDashForm formId="contact" />
```

Le composant genere automatiquement le HTML, la validation cote client et la gestion de la soumission. Le style s'adapte aux variables CSS de votre theme.

### Rendu personnalise

Si vous preferez un controle total sur le rendu, vous pouvez recuperer la definition du formulaire et construire votre propre interface :

```astro
---
import { getForm } from 'emdash:plugins/forms';
const form = await getForm('contact');
---
<form action={form.action} method="POST">
  {form.fields.map(field => (
    <div class="field">
      <label for={field.name}>{field.label}</label>
      <input
        type={field.type}
        name={field.name}
        id={field.name}
        required={field.required}
      />
    </div>
  ))}
  <button type="submit">Envoyer</button>
</form>
```

### Formulaires multiples

Vous pouvez creer autant de formulaires que necessaire : contact, inscription, demande de devis, feedback, etc. Chaque formulaire a son propre identifiant et sa propre configuration de notifications.

## Cas d'utilisation

- **Page contact** : le classique nom/email/message avec notification par email
- **Inscription newsletter** : champ email unique avec integration webhook vers Mailchimp ou Brevo
- **Demande de devis** : formulaire multi-champs avec upload de documents
- **Sondage** : questions a choix multiples avec export CSV pour analyse
- **Candidature** : formulaire avec upload de CV et lettre de motivation

## Points forts et limites

**Points forts :**
- Constructeur visuel intuitif et complet
- Validation cote client et cote serveur
- Notifications email et webhook flexibles
- Protection anti-spam sans CAPTCHA
- Conformite RGPD (retention configurable, consentement)
- Composant front-end pret a l'emploi

**Limites :**
- Pas de logique conditionnelle (afficher/masquer des champs selon les reponses) dans la version actuelle
- Les templates d'email necessitent des connaissances HTML pour etre personnalises
- Pas de formulaire multi-etapes natif

## Notre verdict

Le plugin Forms est un indispensable pour tout site EmDash qui a besoin de collecter des informations. Le constructeur visuel est bien concu, la gestion des soumissions est complete et les notifications sont flexibles. L'absence de logique conditionnelle et de formulaires multi-etapes est regrettable, mais ces fonctionnalites sont annoncees pour une version future.

**Note : 4/5** -- Un plugin de formulaires solide et bien pense, qui couvre la grande majorite des besoins courants.

## Pour aller plus loin

- [Developper votre premier plugin](/tutoriels/premier-plugin) -- creez vos propres plugins EmDash
- [Plugin Webhook Notifier](/plugins/plugin-webhook-notifier) -- envoyez les soumissions vers Slack, Discord et plus
- [Anatomie d'un plugin standard](/plugins/creer-plugin-standard) -- comprendre l'architecture des plugins
- [Securite des plugins](/guides/securite-plugins) -- comment EmDash isole et securise les plugins
