---
title: "EmDash : entre enthousiasme et controverse, les reactions de l'industrie"
description: "Mullenweg attaque, Joost de Valk adosse, les developpeurs debattent : retour sur les reactions de l'industrie au lancement d'EmDash par Cloudflare et la polemique avec WordPress."
date: "2026-04-10"
author: "Equipe EmDash FR"
category: "Actualite"
tags: ["emdash", "wordpress", "mullenweg", "cloudflare", "controverse", "communaute", "cms"]
featured: true
---

# EmDash : entre enthousiasme et controverse, les reactions de l'industrie

Le lancement d'EmDash le 1er avril 2026 a provoque un seisme dans le monde des CMS. En se presentant comme le "successeur spirituel de WordPress", Cloudflare savait qu'il allait susciter des reactions. Mais personne n'avait anticipe l'ampleur du debat : en une semaine, le fondateur de WordPress a publie une reponse acerbe, le createur de Yoast SEO a apporte son soutien, et des milliers de developpeurs se sont affrontes sur Hacker News. Retour sur une semaine qui a redessine les lignes du debat CMS.

## Un lancement le 1er avril : poisson d'avril ou coup de genie ?

Le choix de la date de lancement n'est pas passe inapercu. Publier un produit serieux le jour du poisson d'avril, c'est prendre un risque calcule. Sur Hacker News, l'utilisateur 8organicbits a immediatement suspecte une blague. John Graham-Cumming, employe de Cloudflare, a du intervenir pour confirmer la legitimite du projet : Cloudflare ne fait pas de poissons d'avril.

Sur Slashdot, un commentateur a specule que le projet etait "Matt Kane utilisant Claude Code pour generer un CMS entier en une journee, comme un flex de poisson d'avril." Matt Kane, l'ingenieur principal du projet, a repondu sans ambiguite : "Name is a joke but the project is real."

Le nom lui-meme est un clin d'oeil a plusieurs niveaux. Le tiret cadratin (em dash) est le signe de ponctuation le plus associe aux textes generes par IA ces dernieres annees. C'est aussi une reference a l'heritage typographique et editorial -- un choix coherent pour un CMS. Mais comme l'a fait remarquer un utilisateur de Slashdot : "Pourquoi nommer votre produit d'apres un symbole grammatical ? Les recherches vont etre auto-corrigees en 'em dash'."

## Matt Mullenweg : "Keep WordPress out of your mouth"

La reaction la plus attendue etait celle de Matt Mullenweg, co-fondateur de WordPress et CEO d'Automattic. Elle est arrivee le 2 avril dans un billet intitule "EmDash Feedback" publie sur ma.tt. Mullenweg avait eu un appel de preview avec Cloudflare le 23 mars, avant le lancement public.

Son article melange reconnaissance et critique acerbe. Il reconnait un travail d'ingenierie solide : "very solid" avec "some excellent engineering." Il qualifie meme la fonctionnalite Agent Skills de "amazing" et de "brilliant strategy", admettant qu'Automattic devrait developper quelque chose de similaire.

Mais le fond de son argumentation est sans equivoque. Trois critiques majeures se degagent.

### L'accusation de vendor lock-in

"I think EmDash was created to sell more Cloudflare services." Pour Mullenweg, le modele de sandboxing des plugins -- la fonctionnalite phare d'EmDash -- ne fonctionne pleinement que sur l'infrastructure Cloudflare. Et c'est la le probleme fondamental :

"WordPress exists to democratize publishing. That means we put it everywhere. You can run WordPress on a Raspberry Pi, on your phone, on your desktop, on a random web host in Indonesia charging 99 cents a month."

Pour lui, un CMS qui ne fonctionne pleinement que sur une seule plateforme ne peut pas pretendre au titre de "successeur spirituel" de WordPress.

### La philosophie des plugins

Mullenweg defend un point contre-intuitif : la capacite des plugins WordPress a tout modifier n'est pas un bug, c'est une fonctionnalite. Cette flexibilite totale est ce qui a permis a WordPress de s'adapter a des milliers de cas d'usage imprevus. Restreindre les plugins dans des sandboxes, c'est potentiellement limiter cette adaptabilite.

### La communaute, pas la technologie

"You can come after our users, but please don't claim to be our spiritual successor without understanding our spirit." Mullenweg insiste sur le fait que WordPress est plus qu'un logiciel : c'est une communaute de meetups, de WordCamps, de millions de contributeurs. Un esprit qu'on ne clone pas avec du TypeScript.

Le detail le plus remarque est une phrase que Mullenweg a publiee puis supprimee : "Please keep the WordPress name out of your mouth" -- une reference directe a la gifle de Will Smith aux Oscars 2022. La suppression n'a pas empeche la phrase de circuler sur les reseaux sociaux.

## La reponse de Matthew Prince : le troll magistral

Le CEO de Cloudflare, Matthew Prince, a repondu sur X le 3 avril avec une phrase qui a fait le tour du web :

"Think this is a fair critique from @photomatt of EmDash. I remain hopeful it'll bring a broader set of developers into the WordPress ecosystem."

L'ironie est a plusieurs niveaux. Prince reconnait la critique comme "juste", tout en utilisant deliberement le mot "WordPress" dans sa reponse -- juste apres que Mullenweg a demande de garder ce mot hors de sa bouche. Plusieurs medias ont compare cette reponse a Chris Rock reprenant calmement le spectacle apres la gifle de Will Smith.

## Joost de Valk : "Le premier CMS concu pour 2026"

A l'oppose de Mullenweg, Joost de Valk -- le createur de Yoast SEO, le plugin WordPress le plus installe au monde -- a publie une review enthousiaste des le jour du lancement. Son article "EmDash: a CMS built for 2026" prend une position claire.

"Every architectural decision in EmDash seems to have been made with the same question: what if an AI agent needs to do this?"

De Valk met en avant trois points forts. L'architecture AI-native, avec le contenu stocke en JSON structure plutot qu'en HTML, permet aux agents de "read, modify, and generate content without parsing markup." Le modele de securite des plugins isoles dans des Workers avec permissions granulaires et scan automatise. Et la vitesse de developpement : "built over two months using AI coding agents. That's remarkable speed."

Il ne cache pas les faiblesses : l'ecosysteme de plugins est vide face aux 60 000+ de WordPress. "CMS adoption is driven more by available plugins and themes than by technical merit." Mais sa conclusion est sans equivoque : il prevoit de developper avec EmDash.

Pour qui connait l'histoire de Joost de Valk dans l'ecosysteme WordPress, ce soutien est significatif. Le createur du plugin SEO le plus populaire de WordPress qui adosse publiquement un concurrent, c'est un signal fort.

## Les developpeurs debattent : Hacker News s'enflamme

Le fil Hacker News sur EmDash a cumule 702 points, un score eleve qui reflete l'intensite du debat. Les positions sont tranchees.

### Le camp sceptique

Le vendor lock-in est la critique dominante. L'utilisateur verdverm compare la strategie a celle de Vercel avec Next.js : un framework open-source dont les fonctionnalites avancees ne fonctionnent pleinement que sur la plateforme du createur. Embedding-shape est plus direct : "This sounds of the polar opposite of the direction CMS's need to go."

JoostBoer (sans lien avec Joost de Valk) remet en question la capacite d'EmDash a seduire les developpeurs WordPress : "They stay because their clients stay, not because they can't learn TypeScript." Un point pertinent : l'ecosysteme WordPress est maintenu par des agences web dont les clients exigent WordPress par nom.

### Le camp enthousiaste

L'architecture des plugins sandboxes est saluee comme "what WordPress should have done a decade ago." Le typage TypeScript end-to-end, les performances serverless et l'integration IA native sont regulierement cites comme des avancees reelles. La communaute r/webdev sur Reddit note que le modele de contenu structure d'EmDash est mieux adapte aux usages API, headless et IA de 2026.

## Search Engine Journal : les 6 raisons du scepticisme

Roger Montti du Search Engine Journal a publie l'analyse critique la plus detaillee dans un article intitule "6 Reasons Why Cloudflare's EmDash Can't Compete With WordPress". Ses arguments :

1. **EmDash n'est pas centre utilisateur** : l'annonce met en avant les preoccupations des developpeurs (securite, architecture), pas les besoins des utilisateurs finaux (blogs, e-commerce).

2. **Le probleme de securite des plugins est surestime** : selon les recherches de Patchstack, seulement 17 % des vulnerabilites WordPress en 2025 avaient un score de severite eleve.

3. **EmDash resout des problemes d'infrastructure, pas d'utilisateurs** : Jamie Marsland d'Automattic offre une analogie parlante : "Most people are not trying to tidy their desk. They are trying to run a business from it while replying to emails, posting on social, updating their website, and occasionally eating something directly over the keyboard."

4. **L'accessibilite est limitee** : construit sur Astro, un framework web, pas un CMS clef en main. La configuration exige une connexion GitHub et une base de donnees.

5. **La CLI comme barriere** : pas de creation de site en un clic. Le terminal est requis.

6. **Le produit n'est pas pret** : version 0.1.0, beta developpeur.

## Brian Coords : ce que WordPress devrait apprendre

Le blogueur et developpeur WordPress Brian Coords a adopte une position plus nuancee dans "EmDash: First thoughts and takeaways for WordPress." Au lieu de rejeter EmDash, il identifie ce que WordPress devrait en retenir.

"Unlike the rigid structures of the WordPress block editor, EmDash offers total freedom to build front-end markup however the developer chooses." Il note que la vitesse de prototypage avec EmDash et les agents IA est impressionnante : "Getting from zero to a basic design is fast. I mean, really fast."

Ses quatre recommandations pour WordPress : de meilleurs outils de design visuel, une UI de modelisation de contenu dans le core, un focus sur l'experience developpeur, et une meilleure cohesion entre les frameworks utilises en interne.

## Le consensus emerge : "Right Architecture, Empty Ecosystem"

Le titre de l'article de CMSWire resume le sentiment dominant : EmDash propose la bonne architecture, mais dans un ecosysteme vide. C'est le paradoxe fondamental du projet.

D'un cote, personne ne conteste serieusement les choix techniques. TypeScript end-to-end, plugins sandboxes, contenu structure en JSON, authentification par passkeys, deploiement serverless, integration IA native -- sur le papier, c'est ce qu'un CMS moderne devrait etre.

De l'autre, WordPress propulse 42,5 % du web avec 59,8 % du marche des CMS. Son ecosysteme de 60 000 plugins et des milliers de themes represents des annees de travail collectif qu'aucun nouveau venu ne peut reproduire du jour au lendemain.

La question n'est pas de savoir si EmDash est meilleur techniquement. La question est de savoir si la technologie suffit a deplacer un ecosysteme. L'histoire du logiciel est jonchee de produits superieurs qui ont perdu face a des ecosystemes plus vastes.

## Et maintenant ?

Dix jours apres le lancement, les positions se clarifient. EmDash ne remplacera pas WordPress a court terme -- personne de serieux ne le pretend, meme chez Cloudflare. Mais le projet a deja reussi quelque chose : forcer l'ecosysteme WordPress a se regarder dans le miroir.

Brian Coords demande une UI de modelisation de contenu dans le core. Jamie Marsland reconnait que les Agent Skills sont une idee brillante. Mullenweg lui-meme admet qu'Automattic devrait developper quelque chose de similaire.

Si EmDash ne devient jamais le CMS dominant, il aura peut-etre rendu WordPress meilleur. Et pour un projet de deux mois, c'est deja remarquable.

## Pour aller plus loin

- [EmDash : le CMS qui veut succeder a WordPress](/articles/emdash-presentation) -- presentation complete du projet et de ses fonctionnalites
- [EmDash vs WordPress : comparaison detaillee](/guides/emdash-vs-wordpress) -- les differences techniques et philosophiques
- [La securite des plugins EmDash](/guides/securite-plugins) -- comment le sandboxing fonctionne en pratique
- [La communaute EmDash](/articles/communaute-emdash) -- ecosysteme, marketplace et contributions
- [5 raisons d'essayer EmDash des maintenant](/articles/pourquoi-emdash) -- notre position argumentee
