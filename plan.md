# Plan de développement MVP - Contrevent : l'Ascension

## Objectif du MVP
Développer un prototype de jeu de survie tactique en 2D, jouable via un navigateur web, mettant en œuvre les mécaniques de base du vent, de la gestion de la Horde et de la pause tactique.

## Phases de développement

### Phase 1: Initialisation du projet et structure de base (Terminée)
- Création de `index.html` (structure HTML principale).
- Création de `style.css` (styles CSS de base).
- Création de `script.js` (logique JavaScript du jeu).

### Phase 2: Système de Vent Dynamique (Terminée)
- Implémentation du rendu d'une grille hexagonale sur un élément Canvas.
- Simulation simplifiée du vent (force, direction, rafales) par cellule hexagonale.
- Visualisation du vent sur la grille (couleur, flèches simples).

### Phase 3: Gestion de la Horde et Statistiques (Terminée)
- Représentation de la Horde comme une entité unique sur la grille.
- Implémentation du mouvement de la Horde, influencé par le vent.
- Gestion des statistiques de la Horde (Stamina, Lucidity, Cohesion) et leur diminution due au vent.
- Définition de "zones de refuge" pour la régénération des statistiques.

### Phase 4: Pause Tactique et Interface Utilisateur (UI) (Terminée)
- Implémentation d'une fonctionnalité de pause du jeu.
- Création d'une UI basique pour afficher les statistiques de la Horde.
- Ajout de contrôles simples pour le mouvement et la pause.

### Phase 5: Éléments Narratifs Minimaux (Terminée)
- Système d'événements textuels simples déclenchés par la position ou le temps.
- Choix de dialogue affectant les statistiques de la Horde.

### Phase 6: Vérification et Tests (Terminée)
- S'assurer que le prototype est fonctionnel dans un navigateur.
- Tester les mécaniques clés (vent, mouvement, stats, pause, événements).

### Phase 7: Amélioration de la Dynamique du Vent et Équilibrage (Terminée)
- **Correction de bug :** Résolution d'un problème de propagation qui pouvait causer une augmentation incontrôlée de la force du vent (effet Venturi).
- **Vent Dynamique :** Remplacement de la source de vent statique par un système dynamique utilisant le bruit de Perlin pour créer des variations naturelles de force et de direction dans le temps.
- **Contrôle Amélioré :** Remplacement du slider de contrôle du vent linéaire par un slider à réponse non-linéaire pour un ajustement plus fin des vitesses faibles.
- **Équilibrage :** Sessions d'ajustements itératifs pour affiner la force, la vitesse et la "sensation" générale du vent.

### Phase 8: Débogage et Amélioration de l'UX (Terminée)
- **Correction de bug critique :** Résolution d'un bug qui empêchait l'affichage de tous les éléments du jeu (grille, vent, horde) suite à une interruption de session.
- **Réactivation de la simulation :** Restauration de la fonction `updateWind` qui était commentée, ce qui a réactivé la logique du vent.
- **Flexibilité de test :** Ajout d'une case à cocher dans l'interface de débogage pour activer ou désactiver l'effet Venturi, permettant un meilleur contrôle sur les mécaniques de simulation.

### Phase 9: Refactoring et Améliorations UX (Terminée)
- **Séparation du code :** Division du fichier monolithique `script.js` en modules plus petits et spécialisés (`main.js`, `grid.js`, `horde.js`, `wind.js`, `ui.js`, `perlin.js`).
- **Modularisation :** Modification de `index.html` pour utiliser les nouveaux modules JavaScript.
- **Amélioration de l'UX :** Ajout d'infobulles explicatives (`tooltips`) sur chaque slider de l'interface de débogage pour clarifier leur fonction.
- **Landing Page :** Création d'une page d'accueil (`index.html`) et déplacement du jeu sur `game.html`.

### Phase 10: Conditions de Victoire et d'Échec (Terminée)
- **Condition de Victoire :** Implémentation d'un drapeau de victoire sur la carte. La partie est gagnée lorsque tous les membres de la Horde sont à proximité du drapeau.
    - Création d'un module `gameplay.js` pour gérer la logique de jeu.
    - Ajout d'une fonction pour dessiner le drapeau.
    - Ajout d'une fonction pour vérifier la condition de victoire à chaque frame.
- **Message de Victoire :** Affichage d'une alerte et redirection vers la page d'accueil.
- **Condition d'Échec/Abandon :** Ajout d'un bouton "It's Too Hard" pour quitter la partie et retourner à la page d'accueil.

### Phase 11: Systèmes de Progression (En cours)
- **Score :** Conception et implémentation d'un système de score basé sur le temps.
    - Ajout de `startTime` et `score` à l'état du jeu.
    - Le score est calculé à la victoire (`MaxScore - temps`).
    - Le score est affiché dans le message de victoire.
    - **UI/UX :**
        - Ajout d'une barre en haut de l'écran pour afficher le temps et le score en temps réel.
        - Ajout d'une infobulle pour expliquer le calcul du score.
        - Ajout d'un gizmo visuel (cercle bleu en pointillés) pour matérialiser la zone de victoire.
        - Ajout d'un slider de debug pour ajuster la taille de la zone de victoire.
- **Niveaux (À venir) :** Mettre en place un système de "level up" après une victoire.

### Phase 12: Statistiques et Équipement des Personnages (À venir)
- **Statistiques de Base :** Définir et intégrer les caractéristiques des personnages (force, endurance, charisme).
- **Système d'Équipement :** Anticiper l'architecture pour l'ajout futur d'équipements qui modifieront les statistiques.

### Phase 13: Mécaniques de Horde Avancées (À venir)
- **Protection de Formation :** Implémenter un effet d'"ombre" protectrice en aval des personnages.
- **Influence des Stats :** La distance et l'intensité de l'ombre dépendront des statistiques et de l'équipement des personnages.

### Phase 14: Refonte de l'Interface Utilisateur (UI/UX) (À venir)
- **Correctifs CSS :** Résoudre les problèmes de dépassement et de mise en page dans l'interface de jeu.
- **Amélioration du Design :** Moderniser et améliorer l'esthétique globale de l'UI.

### Phase 15: Système de Cartes (À venir)
- **Sauvegarde/Chargement :** Concevoir et implémenter un système pour créer, sauvegarder et charger des cartes définies par l'altitude de leurs cellules.