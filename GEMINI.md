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

**Prochaine Étape** : Développer des "Personnalités" de vent distinctes (ex: rafales soudaines, vents tournants, zones de silence) en se basant sur le nouveau système dynamique.