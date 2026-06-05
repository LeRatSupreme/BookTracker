# BookTracker

BookTracker est une application web installable pour suivre ses lectures au quotidien. Elle permet de gérer une bibliothèque personnelle, suivre sa progression, enregistrer des sessions de lecture, consulter des statistiques et sauvegarder ses données localement.

Le projet est une PWA React construite avec Vite. Les données sont stockées dans le navigateur avec IndexedDB via Dexie : l'application fonctionne donc sans serveur applicatif ni base de données distante.

## Fonctionnalités

### Bibliothèque

- Classement des livres par statut : `À lire`, `En cours`, `Terminé`.
- Recherche dans la bibliothèque par titre ou auteur.
- Cartes livre avec couverture, auteur, statut, note et progression.
- Édition complète d'un livre.
- Suppression d'un livre.
- Marquage en favori.
- Gestion des tags.
- Ajout d'une critique personnelle.

### Ajout de livres

- Recherche de livres via l'API Google Books.
- Recherche par titre, auteur ou ISBN.
- Pagination des résultats.
- Import automatique du titre, auteur, nombre de pages, couverture, description et catégories.
- Ajout manuel si le livre n'est pas trouvé.
- Prévisualisation du résumé avant ajout.

### Suivi de lecture

- Progression par page pour les livres en cours.
- Passage automatique en `Terminé` lorsque la progression atteint la dernière page.
- Enregistrement de sessions de lecture avec durée, pages lues et date.
- Mode lecture avec timer, pause et résumé de session.
- Wake Lock lorsque disponible pour garder l'écran actif pendant une session.
- Mode Focus dédié pour lire sans distraction.

### Statistiques

- Nombre de pages lues.
- Nombre de livres terminés.
- Vitesse moyenne de lecture en pages par heure.
- Note moyenne des livres évalués.
- Graphique mensuel du volume de lecture.
- Répartition des genres favoris.
- Historique de sessions utilisé pour alimenter les statistiques.

### Profil et personnalisation

- Onboarding au premier lancement.
- Création d'un profil local avec pseudo, objectif annuel et thème.
- Avatar personnalisé.
- Thèmes de couleur.
- Mode clair / sombre.
- Objectif annuel de livres lus.
- Niveau basé sur les pages lues.
- Badges de progression.
- Heatmap de lecture.

### Données

- Stockage local avec IndexedDB.
- Export JSON de la bibliothèque et du profil.
- Import JSON pour restaurer une sauvegarde.
- Réinitialisation complète de l'application.

### PWA

- Application installable sur mobile et desktop.
- Service worker avec mise à jour automatique.
- Manifest PWA configuré.
- Fonctionnement pensé mobile-first.

## Stack technique

- React 18
- Vite 5
- React Router
- Tailwind CSS
- Dexie / IndexedDB
- dexie-react-hooks
- Framer Motion
- Recharts
- lucide-react
- clsx et tailwind-merge
- date-fns
- html2canvas
- vite-plugin-pwa
- Google Books API

## Prérequis

- Node.js 18 ou plus récent
- npm

## Installation locale

Installer les dépendances :

```bash
npm install
```

Lancer le serveur de développement :

```bash
npm run dev
```

L'application est ensuite accessible à l'adresse indiquée par Vite, généralement :

```text
http://localhost:5173
```

## Scripts utiles

| Commande | Description |
| --- | --- |
| `npm run dev` | Lance le serveur de développement Vite. |
| `npm run build` | Compile l'application pour la production. |
| `npm run preview` | Lance une prévisualisation locale du build. |
| `npm run lint` | Lance ESLint sur le projet. |

## Structure du projet

```text
src/
├── App.jsx                 Déclaration des routes
├── main.jsx                Point d'entrée React
├── db.js                   Base IndexedDB Dexie
├── context/
│   └── ThemeContext.jsx    Gestion des thèmes et du mode sombre
├── hooks/                  Hooks de statut réseau et heatmap
├── layout/
│   └── Layout.jsx          Layout mobile et navigation principale
├── pages/
│   ├── Onboarding.jsx      Création du profil local
│   ├── BookList.jsx        Bibliothèque
│   ├── AddBook.jsx         Recherche et ajout de livres
│   ├── EditBookPage.jsx    Édition, progression et sessions
│   ├── StatsPage.jsx       Statistiques
│   ├── Profile.jsx         Profil, thèmes, sauvegarde et import
│   └── FocusMode.jsx       Timer de lecture
├── components/             Cartes, graphiques, modales et widgets
└── utils/                  Utilitaires d'image

public/
└── favicon.ico             Ressources publiques
```

## Stockage local

La base locale s'appelle `BookTrackerDB`.

Elle contient principalement :

- `books` : livres, statuts, notes, pages, couvertures, tags et critiques ;
- `userProfile` : profil utilisateur, thème, objectif annuel et avatar ;
- `readingSessions` : sessions de lecture, durée, pages lues et date.

Les données restent sur l'appareil de l'utilisateur tant qu'il ne vide pas les données du navigateur ou ne réinitialise pas l'application.

## Sauvegarde et restauration

Depuis la page profil, l'utilisateur peut :

- exporter ses données en JSON ;
- importer un fichier JSON de sauvegarde ;
- réinitialiser complètement l'application.

L'import remplace les données locales actuelles.

## PWA et icônes

La PWA est configurée dans `vite.config.js` avec `vite-plugin-pwa`.

Pour une installation propre, les icônes suivantes doivent être présentes dans `public/` :

```text
pwa-192x192.png
pwa-512x512.png
apple-touch-icon.png
masked-icon.svg
```

## Limites connues

- La recherche automatique dépend de la disponibilité de l'API Google Books.
- Les données sont locales au navigateur utilisé.
- Sans export JSON, les données peuvent être perdues si le stockage du navigateur est effacé.
- Le mode Wake Lock dépend du navigateur et de l'appareil.

## Licence

Tous droits réservés.

Ce projet est privé. Aucune utilisation, copie, modification, distribution, publication ou réutilisation du code n'est autorisée sans accord écrit préalable du propriétaire du projet.
