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