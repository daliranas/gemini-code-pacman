# 🕹️ PAC-MAN Retro Arcade Deluxe

> Une reconstitution complète, moderne et modulaire du jeu classique d'arcade **Pac-Man**, développée en JavaScript Vanilla (HTML5 Canvas & Web Audio API) et propulsée par un serveur Node.js natif avec base de données SQLite.

---

## ⚖️ AVERTISSEMENT LÉGAL ET FINALITÉ ÉDUCATIVE

> **DISCLAIMER / MENTIONS LÉGALES OBLIGATOIRES :**
>
> 1. **Finalité Pédagogique et Éducative** : Ce projet est développé **strictement et exclusivement à des fins d'apprentissage, de recherche pédagogique et de démonstration technique** (programmation orientée objet en JavaScript, manipulation de l'élément `<canvas>`, génération procédurale d'audio avec l'API Web Audio et gestion d'une base de données SQLite native avec Node.js).
> 2. **Propriété Intellectuelle & Marques Déposées** : **PAC-MAN** et l'ensemble des éléments graphiques, concepts et personnages associés (Blinky, Pinky, Inky, Clyde, Pac-Gommes, etc.) sont des marques déposées et la propriété intellectuelle exclusive de **BANDAI NAMCO Entertainment Inc.** (ou de ses ayants droit légitimes).
> 3. **Non-Affiliation** : Ce projet est un hommage amateur indépendant et n'est en aucun cas sponsorisé, approuvé, affilié ni associé de quelque manière que ce soit à **BANDAI NAMCO Entertainment Inc.**
> 4. **Usage Non Commercial (Non-Profit)** : Ce code source est partagé gratuitement sans aucune vocation commerciale ni monétisation. Tout usage commercial ou diffusion non conforme relève de la seule responsabilité de l'utilisateur final.

---

## ✨ Fonctionnalités Principales

- 🎮 **Gameplay Arcade Réactif** :
  - Système de **Cornering Buffer** : anticipation fluide des virages pour une maniabilité sans accroc.
  - Demi-tours instantanés et gestion sans faille des tunnels latéraux.
  - Multi-contrôles : Flèches directionnelles, ZQSD, WASD, Swipe tactile et D-Pad virtuel.
  - Touche `P` pour mettre en pause.

- 🏆 **Base de Données SQLite Intégrée (Hall of Fame)** :
  - Enregistrement automatique des meilleurs scores, pseudos, cartes et niveaux de difficulté.
  - Tableau des scores interactif accessible depuis le menu et les écrans de fin de partie.
  - Protection des données et stockage persistant.

- 🗺️ **Multiples Labyrinthes & Difficultés** :
  - **3 Cartes** : *Classique (19x22)*, *Ouverte (21x19)*, *Géante (25x23)*.
  - **3 Niveaux d'IA** : *Facile*, *Normal*, *Difficile* (ajustant la vitesse, la dispersion et l'agressivité des fantômes).

- 🎨 **Deux Modes de Rendu Graphique** :
  - **Normal** : Pixels rétro purs fidèles aux bornes d'arcade des années 80.
  - **HD** : Style vectoriel contemporain aux bordures lissées et contrastes reposants pour les yeux (optimisé 60 FPS constants sans surcharge GPU).

- 🎵 **Chiptune Audio 100% Procédural (Web Audio API)** :
  - Jingle d'intro officiel synthétisé note par note.
  - Bruitages complets (Waka-waka, Energizer, Fantôme mangé, Mort, Victoire).
  - Musique de fond chiptune sur le menu.
  - Bouton Mute / Unmute en temps réel.

- 🍒 **Système de Fruits Bonus & Boost Turbo** :
  - Cerise (100 pts), Fraise (300 pts), Orange (500 pts).
  - **Éclair Turbo ⚡** : Accorde un boost de vitesse (Dash) temporaire à Pac-Man.
  - Moteur de particules et popups de score flottants.

---

## 📁 Architecture du Projet

Le projet respecte une stricte séparation des responsabilités sans bibliothèques externes lourdes :

```text
gemini-code-pacman/
├── database.js          # Module SQLite (gestion des requêtes et persistance des scores)
├── package.json         # Métadonnées du projet Node.js
├── README.md            # Documentation et avertissements légaux
├── server.js            # Serveur HTTP natif et API REST (/api/scores)
└── public/
    ├── index.html       # Structure du jeu, modales, D-Pad et menus
    ├── css/
    │   └── style.css    # Thème sombre arcade rétro responsive
    └── js/
        ├── audio.js     # Synthétiseur sonore procédural Web Audio API
        ├── board.js     # Layouts de grilles dynamiques et moteur de rendu
        ├── fruits.js    # Apparition et collisions des items bonus
        ├── game.js      # Boucle principale, gestion des états et événements
        ├── ghosts.js    # IA des 4 fantômes et système de difficulté
        ├── particles.js # Moteur de particules visuelles et popups
        └── player.js    # Logique de déplacement de Pac-Man et Cornering
```

---

## 🚀 Installation & Lancement

### Prérequis
- [Node.js](https://nodejs.org/) (Version 18+ recommandée, Node 22+ supporte nativement SQLite)

### Démarrage Rapide

1. Cloner ou ouvrir le dossier du projet :
   ```bash
   cd gemini-code-pacman
   ```

2. Lancer le serveur :
   ```bash
   npm start
   # ou
   node server.js
   ```

3. Ouvrir votre navigateur sur :
   ```text
   http://localhost:3000
   ```

---

## 📜 Licence

Ce projet est distribué sous licence pédagogique libre (MIT / ISC) pour l'apprentissage du développement web et du jeu vidéo en JavaScript.