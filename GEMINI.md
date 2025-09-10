# Suivi de Projet Gemini - Contrevent : l'Ascension

Ce document sert à suivre le développement, les décisions de conception et l'état actuel du prototype.

## 1. Principes Fondamentaux du Jeu

Basé sur le Game Design Document, le jeu repose sur les piliers suivants :

- **Genre** : Jeu de survie narratif et tactique en escouade.
- **Inspiration** : Profondément inspiré par l'univers et les thématiques de *La Horde du Contrevent* d'Alain Damasio.
- **Antagoniste Central** : Le Vent n'est pas un simple obstacle, mais un antagoniste dynamique, quasi-vivant, avec des comportements complexes et variés.
- **Gestion de la Horde** : Le joueur gère une escouade (la Horde) composée de membres avec des rôles et des statistiques uniques.
- **Survie Physique et Psychique** : La gestion de statistiques clés (`Stamina`, `Lucidité`, `Cohésion`) est au cœur de la survie.
- **Narration Émergente** : L'histoire est racontée à travers les actions, les choix et les pertes du joueur, créant un journal de bord dynamique.

## 2. Résumé du Développement (Session Actuelle)

Nous sommes partis d'un prototype initial avec des mécaniques de base non fonctionnelles. Voici les étapes accomplies pour arriver à l'état actuel :

### 2.1. Refonte des Contrôles de la Horde

L'objectif était de passer d'une entité unique à une véritable gestion d'escouade.

- **Unités Multiples** : La Horde est maintenant composée de 10 personnages distincts.
- **Système de Sélection Avancé** :
    - Sélection par clic simple.
    - Sélection multiple avec `Maj + Clic`.
    - Sélection de groupe par rectangle (marquee).
- **Commandes de Mouvement** :
    - Déplacement par clic droit vers une destination.
    - **Comportement par défaut** : Si aucune unité n'est sélectionnée, un ordre de mouvement s'applique à toute la Horde.
- **Formations Tactiques** : Implémentation de 4 formations (`Vrac`, `Ligne`, `Triangle`, `Tortue`) qui impactent la vitesse de déplacement du groupe.
- **Moteur Physique Simple** : Ajout d'un système de collision pour empêcher les unités de se superposer.

### 2.2. Amélioration de l'Interface Utilisateur (UI)

- **Affichage Plein Écran** : Le canvas de jeu utilise désormais toute la surface de la fenêtre.
- **Barre d'Action** : L'UI a été repensée en une barre d'action moderne, centrée en bas de l'écran, regroupant les informations et les commandes.

### 2.3. Conception de la Dynamique du Vent

- **Brainstorming** : Nous avons exploré 5 concepts pour rendre le vent plus intéressant.
- **Décision de Conception** : Le concept **"Les Personnalités du Vent"** a été retenu. Le vent se manifestera sous forme de fronts météorologiques avec des caractéristiques et des effets propres.

### 2.4. Implémentation et Équilibrage du Vent Dynamique

L'objectif était de donner vie au concept des "Personnalités du Vent" en passant d'une simulation statique à une simulation dynamique et équilibrée.

- **Débogage de la Physique** : Correction d'un bug majeur dans le calcul de l'effet Venturi qui provoquait une augmentation incontrôlée de la force du vent.
- **Source de Vent Dynamique** : La source de vent, initialement statique, utilise maintenant le bruit de Perlin pour générer des variations de force continues et naturelles dans le temps, créant un flux d'air plus crédible.
- **Contrôles Affinés** : Le slider de contrôle de la vitesse du vent a été modifié pour utiliser une échelle non linéaire, offrant un contrôle plus précis et intuitif, notamment à faible vitesse.
- **Équilibrage Itératif** : Plusieurs cycles d'ajustement ont été nécessaires pour équilibrer la force, la vitesse et la réactivité du vent, en collaboration directe avec l'utilisateur pour atteindre la "sensation" de jeu désirée.

### 2.5. Débogage et Amélioration de l'Expérience de Test

Suite à une interruption de session qui a corrompu l'état du code, une session de débogage a été nécessaire.

- **Correction de Bug Visuel Majeur** : Résolution d'un bug qui empêchait le rendu de tous les éléments visuels du jeu (grille, vent, horde). Le problème a été identifié comme étant la mise en commentaire de la fonction `updateWind`, ce qui bloquait l'intégralité de la boucle de mise à jour et de rendu.
- **Réactivation de la Simulation du Vent** : La fonction `updateWind` a été restaurée, réactivant ainsi la simulation dynamique du vent.
- **Contrôle de l'Effet Venturi** : Suite à la demande de l'utilisateur, une case à cocher a été ajoutée à l'interface de débogage pour permettre d'activer ou de désactiver l'effet Venturi à la volée. Cela permet de mieux isoler et tester l'impact de cette mécanique sur le gameplay.

## 3. Feuille de Route (Version 0.2 - Terminée)

La version 0.2 s'est concentrée sur la scalabilité du projet et l'amélioration de l'expérience utilisateur initiale.

### 3.1. Refactoring et Améliorations UX
- **Démantèlement du `script.js` monolithique** en modules ES6 pour une meilleure maintenabilité.
- **Ajout d'infobulles** sur les contrôles de débogage pour améliorer l'ergonomie.

### 3.2. Création d'une Landing Page
- **Mise en place d'une page d'accueil** (`index.html`) pour servir de point d'entrée.
- **Séparation du jeu** sur sa propre page (`game.html`).

## 4. Feuille de Route (Prochaines Étapes)

Les développements futurs se concentreront sur l'ajout de boucles de gameplay, l'enrichissement des mécaniques de jeu et l'amélioration de l'interface.

### 4.1. Boucle de Gameplay Principale
- **Conditions de Victoire/Échec :** Mettre en place une condition de victoire claire (atteindre un drapeau) et une option pour abandonner la partie.
- **Progression :** Introduire un système de score et de niveaux pour motiver le joueur.

### 4.2. Mécaniques de Jeu Approfondies
- **Statistiques des Personnages :** Implémenter des statistiques (force, endurance, etc.) qui auront un impact direct sur le gameplay.
- **Protection de Formation :** Ajouter une mécanique d'"ombre" protectrice qui dépendra des statistiques et de la formation de la Horde.
- **Équipement :** Prévoir l'architecture pour un futur système d'équipement.

### 4.3. Interface et Expérience Utilisateur
- **Refonte de l'UI :** Corriger les problèmes de style et améliorer le design global de l'interface de jeu.
- **Système de Cartes :** Développer le système de création, sauvegarde et chargement de cartes, comme initialement prévu.

## 5. Feuille de Route (Version 0.3 - En cours)

Cette version se concentre sur l'implémentation des boucles de gameplay de base.

### 5.1. Implémentation de la Boucle de Gameplay Principale
- **Modularisation de la logique de jeu** : Création d'un nouveau module `gameplay.js` pour héberger la logique de victoire, d'échec et les autres règles du jeu.
- **Condition de Victoire** :
    - Un drapeau est ajouté sur la carte comme objectif.
    - Une fonction vérifie en continu si tous les membres de la Horde sont suffisamment proches du drapeau.
    - En cas de victoire, un message est affiché et le joueur est redirigé vers la page d'accueil.
- **Condition d'Abandon** :
    - Un bouton "It's Too Hard" a été ajouté à l'interface.
    - Un clic sur ce bouton après confirmation redirige le joueur vers la page d'accueil.

### 5.2. Implémentation des Systèmes de Progression
- **Système de Score et de Fin de Niveau :**
    - L'alerte de victoire a été remplacée par un écran de fin de niveau plus immersif.
    - Cet écran affiche un titre, un texte narratif tiré d'une liste (simulant le journal du Scribe), le temps final et le score.
    - Il offre au joueur le choix de continuer vers l'étape suivante (en rechargeant la page pour le prototype) ou de retourner au menu principal.

### 5.3. Implémentation des Statistiques et Améliorations UX

L'objectif était de donner plus de profondeur au gameplay en introduisant des statistiques uniques pour chaque membre de la horde et d'améliorer l'expérience utilisateur en se basant sur les retours.

- **Implémentation des Statistiques et Archétypes :**
   - Création de 3 archétypes : `Pilier` (fort, lent), `Éclaireur` (rapide, fragile), et `Hordier` (équilibré).
   - Chaque membre de la horde se voit assigner un archétype avec des statistiques uniques (`strength`, `endurance`, `baseSpeed`).
   - La statistique de `strength` a un impact direct, en réduisant la force du vent subie par le personnage.

- **Améliorations Visuelles et de Contrôle :**
   - **Couleurs d'Archétype :** Chaque archétype possède désormais une couleur distincte pour une identification visuelle immédiate sur la carte.
   - **Infobulle Dynamique :** Le panneau de statistiques statique a été remplacé par une infobulle contextuelle qui s'affiche au survol d'un personnage, affichant ses informations détaillées.
   - **Inversion des Contrôles :** Les commandes de la souris ont été inversées pour un contrôle plus intuitif :
       - **Clic Gauche :** Sélection et ordre de déplacement.
       - **Clic Droit :** Inspection de la cellule.

- **Correction de Bug Critique :**
   - Résolution d'une régression qui empêchait l'affichage de la grille et de la horde suite à une première tentative de modification de l'UI.