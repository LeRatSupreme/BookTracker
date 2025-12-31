# Book Tracker PWA

Une application moderne et esthétique pour suivre vos lectures, construite avec React, Vite et Tailwind CSS.

## Fonctionnalités

*   📚 **Suivi de bibliothèque** : Gérez vos livres "À lire", "En cours" et "Terminés".
*   🔍 **Google Books API** : Ajoutez des livres automatiquement via la recherche.
*   💾 **Offline-first** : Toutes les données sont stockées localement sur votre appareil (Dexie.js / IndexedDB).
*   📊 **Statistiques** : Visualisez votre progression de lecture.
*   📱 **PWA** : Installez l'application sur votre mobile (iOS/Android).

## Installation

1.  Installez les dépendances :
    ```bash
    npm install
    ```

2.  Lancez le serveur de développement :
    ```bash
    npm run dev
    ```

3.  Ouvrez votre navigateur à l'adresse indiquée (généralement `http://localhost:5173`).

## Pour la PWA (Icons)

Pour que l'installation PWA fonctionne parfaitement, assurez-vous d'ajouter des icônes (`pwa-192x192.png` et `pwa-512x512.png`) dans le dossier `public/`.

## Stack Technique

*   **Framework** : React + Vite
*   **Style** : Tailwind CSS + Framer Motion
*   **Base de données** : Dexie.js (IndexedDB)
*   **Icônes** : Lucide React
*   **Graphiques** : Recharts
