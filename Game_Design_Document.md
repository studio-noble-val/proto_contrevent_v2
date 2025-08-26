# Contrevent : l’Ascension — Game Design Document (GDD)

## 1. Concept général

Jeu de survie narratif tactique en escouade, inspiré de *La Horde du Contrevent* d’Alain Damasio. Le joueur incarne une Horde qui cherche à atteindre l’Extrême-Amont, en affrontant le vent, l’environnement et ses propres failles humaines.

-   **Genre** : Aventure narrative / survie / tactique
-   **Vue** : 3D isométrique ou à la troisième personne
-   **Mode** : Solo (avec gestion de groupe) / Coopératif possible
-   **Plateforme** : PC (avec éventuelle adaptation console)

## 2. Mécaniques de jeu principales

### 2.1 Progression contre le vent

-   Carte semi-linéaire avec étapes nommées (zones de repos, obstacles, bifurcations).
-   Le vent est une entité physique dynamique : force, direction, rafales.
    -   **Simulation sur grille hexagonale** : Le vent est simulé sur une grille hexagonale couvrant la zone de jeu. Chaque cellule de la grille possède une force de vent qui se propage de cellule en cellule.
    -   **Rafales et Zones de Refuge** : Ce système permet la création de rafales dynamiques et la définition de cellules "refuges" qui bloquent ou atténuent le vent.
-   Chaque zone impose des défis physiques, mentaux et stratégiques.
-   **Contrôle du Rythme du Vent** : La vitesse de propagation du vent (fréquence de mise à jour de la grille) peut être ajustée, permettant de moduler la difficulté et le "tempo" du jeu.

### 2.2 Formation et rôles

Chaque membre de la Horde a un rôle spécifique, jouable ou assignable :

-   **Traceur (Golgoth)** : ouvre la voie, supporte le vent.
-   **Scribe (Sov)** : garde mémoire, aide à la lucidité, fait les résumés.
-   **Troubadour (Caracole)** : booste le moral, influence les dialogues.
-   **Aéromaîtres, guerriers, géographes, etc.** : apportent des outils uniques.

Le joueur :

-   Alterne les membres ou donne des ordres en formation.
-   Gère la fatigue, les blessures, le moral.
-   Fait des choix dans les conflits internes et les dilemmes extérieurs.
-   **Mode Pause Tactique** : Une fonctionnalité de pause permet de geler l'action pour analyser la situation et planifier les mouvements.

### 2.3 Résistance physique et psychique

-   Barres de stamina, lucidité et cohésion.
-   Blessures permanentes, fractures mentales.
-   Récits des morts rédigés automatiquement par Sov selon les circonstances.

## 3. Système narratif

### 3.1 Narration dynamique à plusieurs voix

-   Chaque personnage a un style de pensée, un ton d’écriture unique.
-   L’histoire est reconstruite dynamiquement selon les choix et les pertes.
-   Journal automatique (le Livre de la 34e Horde) à la Disco Elysium.

### 3.2 Dialogues et choix

-   Système de dialogue à multiples perspectives.
-   Choix collectifs à faire en débat (ex : continuer malgré la blessure du traceur ?).
-   Influencés par les affinités, le moral, la fatigue.

## 4. Environnement et ambiance

-   Univers visuel brut, érodé, quasi désertique.
-   Le vent est visible : particules, distorsions, audio immersif.
-   Son : chants traditionnels, bruits organiques, langues construites.

## 5. Inspirations techniques et artistiques

-   Banner Saga, Frostpunk, Death Stranding, Pathologic 2, Disco Elysium.
-   Interface sobre, typographique, avec symboles pour chaque voix (clin d’œil au roman).
-   Moteur conseillé : Unity ou Unreal Engine.

## 6. Modes supplémentaires (à considérer plus tard)

-   Mode “Horde éternelle” : rogue-like avec génération procédurale de hordes.
-   Mode “Scribe” : rejouer une horde ancienne à travers ses mémoires.
-   Mode multijoueur narratif : chaque joueur incarne un membre unique.
