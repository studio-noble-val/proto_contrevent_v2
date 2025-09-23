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

- **Problèmes Connus (UX) :**
    - **Infobulles et Inspecteur :** Les infobulles des personnages et l'inspecteur de cellules ne fonctionnent pas correctement (décalage, erreurs) lors de l'utilisation du zoom et du panoramique. Une refactorisation de la gestion des coordonnées et des événements de la souris est à prévoir pour corriger ce problème de manière robuste.

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

### 5.4. Mécanique d'Ombre Protectrice et Affinements

Suite à l'implémentation des statistiques, cette étape a introduit une mécanique de jeu majeure qui en dépend directement, ainsi que des améliorations visuelles.

- **Implémentation de l'Ombre Protectrice :**
  - Chaque personnage projette désormais une ombre en forme de cône qui protège les personnages se trouvant à l'intérieur du vent.
  - La longueur de l'ombre dépend de la `force`, tandis que son angle d'ouverture dépend de l'`endurance`.
  - La puissance de la protection (réduction du vent) est également liée à la `force` du personnage qui projette l'ombre.
  - Les effets des ombres de plusieurs personnages sont cumulatifs, permettant des stratégies de placement avancées.

- **Visualisation et Débogage :**
  - Les ombres sont rendues visibles à l'écran par des cônes translucides, dont l'opacité et la forme reflètent leurs propriétés, fournissant un retour visuel immédiat.
  - Correction d'un bug d'affichage initial qui rendait les ombres invisibles en raison d'une mauvaise gestion de l'ordre de rendu.
  - Amélioration de la visibilité des ombres en augmentant leur contraste et en rendant la variation de leur angle plus prononcée.

### 5.5. Refonte de l'Interface Utilisateur (UI)

L'objectif était de moderniser l'interface du jeu pour la rendre plus épurée, plus discrète et mieux intégrée, en se basant sur les retours utilisateurs.

- **Consolidation de l'UI :**
  - La barre d'information supérieure et la barre d'action inférieure ont été fusionnées en un unique panneau de contrôle moderne, centré en bas de l'écran.
  - Ce nouveau panneau est semi-transparent avec un effet de flou (`backdrop-filter`) pour une meilleure immersion.

- **Panneau de Débogage Flottant :**
  - Les nombreux contrôles de débogage ont été extraits de la barre principale et placés dans un panneau flottant distinct.
  - Un bouton "Debug" a été ajouté à l'interface principale pour afficher ou masquer ce panneau, libérant ainsi un espace visuel considérable par défaut.

- **Localisation :**
  - Le texte du bouton d'abandon a été changé de "It's Too Hard" à "Abandonner" pour une meilleure cohérence linguistique.

### 5.6. Résolution de Bugs et Améliorations de l'Expérience Utilisateur

Cette section détaille les corrections et améliorations récentes apportées pour stabiliser le jeu et améliorer l'expérience utilisateur.

- **Problèmes de Chargement de Carte et de Cache :**
    - **Description :** La nouvelle carte (`carte3.json`) n'apparaissait pas dans le menu de sélection malgré son ajout au dossier `maps/`.
    - **Résolution :** Identification d'une erreur de frappe dans le nom de fichier (`cartie2-2.json` au lieu de `carte2-2.json`) et d'un problème de cache navigateur/serveur empêchant la mise à jour du `manifest.json`. La correction du nom de fichier et la purge du cache ont résolu le problème.

- **Incohérence des Couleurs d'Altitude entre l'Éditeur et le Jeu :**
    - **Description :** Les couleurs d'altitude affichées dans l'éditeur de carte ne correspondaient pas à celles du jeu (ex: blanc dans l'éditeur, brun clair en jeu pour l'altitude maximale).
    - **Résolution :** Uniformisation de la fonction `getColorForRelief` dans `grid.js` pour qu'elle utilise la même palette de couleurs et la même logique de mappage que celle de `editor.js`, assurant une cohérence visuelle.

- **Décalage du Pointeur et Problèmes d'Interaction UI/Caméra :**
    - **Description :** Le pointeur de la souris était décalé par rapport à la position attendue après des opérations de zoom ou de panoramique, et des erreurs `TypeError` liées au module `ui` empêchaient certaines interactions.
    - **Résolution :**
        *   **Refactorisation de la gestion des événements de la souris :** La responsabilité de la gestion du rectangle de sélection a été consolidée dans `ui.js`. Les écouteurs d'événements de la souris dans `main.js` qui dupliquaient ou appelaient des fonctions `ui` inexistantes ont été supprimés.
        *   **Correction des coordonnées de sélection :** Les écouteurs d'événements `mousedown`, `mousemove`, et `mouseup` dans `ui.js` ont été modifiés pour utiliser `camera.getTransformedCoords`. Cela assure que les coordonnées du rectangle de sélection et les points de clic pour la sélection de personnage ou la définition de destination sont correctement convertis en coordonnées mondiales, prenant en compte le zoom et le panoramique de la caméra.
        *   **Stabilité du code :** Le fichier `camera.js` a été restauré à une version stable et fonctionnelle, évitant les erreurs de syntaxe introduites par des modifications précédentes.


L'objectif était de créer un éditeur de carte fonctionnel et ergonomique pour faciliter la création de niveaux.

### 6.1. Débogage Initial
- **Correction du Pinceau :** Résolution d'un bug majeur de conversion de coordonnées qui provoquait un décalage des outils de peinture et de sculpture, rendant l'éditeur inutilisable. La correction a nécessité la création d'un module `grid-utils.js` partagé pour centraliser la logique de la grille hexagonale.

### 6.2. Refonte de l'Interface et de l'Expérience Utilisateur
- **Panneau d'Outils Flottant :** L'ancienne barre d'outils statique et défaillante a été remplacée par un panneau de contrôle moderne, flottant et déplaçable pour ne pas gêner la visualisation de la carte.
- **Simplification :** L'interface a été épurée en supprimant l'affichage direct des données JSON de la carte.
- **Contrôles Améliorés :**
    - **Zoom :** Implémentation d'un zoom à la molette de la souris et via les touches `+` et `-`.
    - **Déplacement (Panning) :** Ajout du déplacement de la caméra via un clic-molette maintenu ainsi qu'avec les flèches directionnelles et les touches `ZQSD` (WASD).
    - **Gestion de la Résolution :** Remplacement du `prompt` initial par des champs de saisie directs pour changer les dimensions de la carte.

### 6.3. Amélioration des Outils
- **Couleurs du Relief :** La palette de couleurs a été étendue à 11 teintes pour mieux représenter les différents niveaux d'altitude.
- **Ajustement de l'Intensité :** Le slider d'intensité pour les outils de sculpture a été modifié pour proposer 5 niveaux de puissance prédéfinis et plus fins, offrant un meilleur contrôle.

### 6.4. Ajout des Éléments de Jeu (Spawn et Drapeau)
- **Positionnement :** Ajout de la possibilité de placer le point de départ de la horde (Spawn) et l'objectif (Drapeau) directement sur la carte via de nouveaux outils dans l'éditeur.
- **Visualisation :** Les positions du Spawn et du Drapeau sont désormais clairement indiquées sur la carte de l'éditeur par des marqueurs visuels.
- **Sauvegarde/Chargement :** Le format des fichiers de carte a été étendu pour inclure ces nouvelles données, tout en assurant la rétrocompatibilité avec les anciennes cartes.

## 7. Intégration du Mode Campagne et Améliorations du Jeu

L'objectif était de lier l'éditeur au jeu via un système de campagne et d'améliorer la gestion des modes de jeu.

### 7.1. Système de Campagne
- **Métadonnées des Cartes :** Les cartes peuvent désormais inclure un nom et un ordre de passage, permettant une organisation séquentielle des niveaux.
- **Manifeste des Cartes :** Introduction d'un fichier `maps/manifest.json` pour lister dynamiquement les cartes disponibles dans la campagne. Ce fichier doit être mis à jour manuellement lors de l'ajout de nouvelles cartes.
- **Progression du Joueur :** Le statut "mission accomplie" est sauvegardé localement dans le navigateur (`localStorage`), permettant de suivre la progression du joueur à travers les niveaux.
- **Menu de Sélection :** La page d'accueil (`index.html`) a été transformée en un menu de sélection de missions dynamique, affichant les cartes par ordre et leur statut de complétion.

### 7.2. Gestion des Modes de Jeu
- **Chargement Dynamique :** Le jeu charge désormais la carte spécifiée via les paramètres d'URL (pour le mode Campagne).
- **Mode Survie :** Le mode Survie déclenche maintenant correctement la génération procédurale de la carte, comme prévu.
- **Correction de Bug :** Résolution d'une erreur de "redeclaration of import" dans `horde.js` qui empêchait le bon fonctionnement du mode Survie.

## 8. Développement de la Simulation de Vent dans l'Éditeur (Branche: `feature/editor-wind-simulation`)

L'objectif est d'intégrer une simulation de vent interactive et configurable directement dans l'éditeur de carte pour améliorer le processus de level design.

### 8.1. Étape 1 : Simulation de Vent Basique (Terminée)
- **Création de Branche Git :** Isoler le développement dans la branche `feature/editor-wind-simulation`. (Terminé)
- **Interface Utilisateur :** Ajouter les boutons "Lancer Sim", "Stop Sim", et "Réinit Sim" à l'interface de l'éditeur. (Terminé)
- **Intégration du Moteur de Vent :** Connecter le moteur de vent (`wind.js`) à l'éditeur et créer une boucle de simulation contrôlable. (Terminé)
- **Visualisation :** Mettre à jour le rendu de la grille pour afficher la "masse" du vent sur les cellules, comme en jeu. (Terminé)

### 8.2. Étape 2 : Configuration des Paramètres du Vent (Terminée)
- **Interface de Configuration :** Intégrer les contrôles de débogage du vent (force, vitesse, etc.) du mode jeu dans l'éditeur. (Terminé)
- **Sauvegarde & Chargement :** Adapter le format de sauvegarde des cartes (`.json`) pour inclure ces nouveaux paramètres et assurer la compatibilité. (Terminé)

### 8.3. Étape 3 : Sauvegarde des Paramètres depuis le Jeu (Terminée)
- **Bouton "Sauvegarder" en Jeu :** En mode "Campagne", ajouter un bouton pour sauvegarder les ajustements des paramètres du vent. (Terminé)
- **Mécanisme de Sauvegarde Sécurisé :** La sauvegarde générera un nouveau fichier de carte mis à jour à télécharger, que l'utilisateur devra manuellement utiliser pour remplacer l'ancien. (Terminé)

### 8.4. Étape 4 : Architecture "Multi-pistes" & Groupes (En cours)
- **4a. Paramètres par Source (Terminée) :** 
    - La structure de données a été modifiée pour que chaque source de vent ait ses propres réglages (`windParams`, `windTempoParams`) ainsi qu'un gain individuel (`gain`).
    - Le moteur de vent (`updateWind`) a été refactorisé pour simuler chaque source avec ses paramètres propres.
    - L'interface de l'éditeur a été mise à jour pour permettre la sélection et la modification des paramètres de chaque source individuellement.
    - La visibilité de la source sélectionnée a été grandement améliorée (taille, couleur, animation).
    - Ajout de contrôles "Master Gain" (global) et "Piste Gain" (spécifique à la source).
    - Il est désormais possible de déplacer et de supprimer les sources de vent.

- **4b. Groupes & Synchronisation (En cours) :** 
    - La structure de données a été étendue pour inclure des groupes de sources de vent (`windGroups`).
    - Chaque groupe possède un nom, un mode de synchronisation (`simultané` ou `séquence`) et une liste de sources associées.
    - L'interface de l'éditeur permet désormais de créer, nommer, supprimer des groupes et de changer leur mode de synchronisation.
    - Le moteur de vent (`updateWind`) a été adapté pour prendre en compte les groupes et leur mode de synchronisation.
    - La sélection multiple des sources est maintenant possible via un rectangle de sélection (cliquer-glisser) pour faciliter l'ajout aux groupes.
    - La suppression des sources se fait via un bouton dédié pour plus de clarté.

### 8.5. Étape 5 : Moteur de Vent Séquencé
- Refondre en profondeur le moteur de vent (`updateWind`) pour qu'il puisse gérer la nouvelle logique : déclencher les sources individuelles, mais aussi les groupes en respectant leur mode de synchronisation.

### 8.6. Étape 6 : Refonte UI "Console à Vent"
- Une fois que toute la logique fonctionnera, transformer l'apparence des contrôles de l'éditeur pour qu'ils adoptent l'esthétique d'une console de mixage (potards, faders, etc.).

### 8.7. Amélioration de l'Éditeur de Vent

L'objectif était de finaliser et de rendre l'éditeur de vent pleinement fonctionnel et ergonomique, en se basant sur les retours utilisateurs.

- **Objectif 1 : Refonte de l'UX/UI pour l'édition des sources. (Terminé)**
    - **Tâche 1.1 :** Mettre en place une modale de configuration qui s'ouvre au clic sur une source de vent. (Terminé)
    - **Tâche 1.2 :** Remplir la modale avec les paramètres spécifiques de la source sélectionnée (force, tempo, etc.). (Terminé)
    - **Tâche 1.3 :** Implémenter la sauvegarde des paramètres depuis la modale vers l'objet de configuration de la carte. (Terminé)
    - **Tâche 1.4 :** Assurer que le bouton "Sauvegarder la carte" enregistre bien ces nouvelles données dans le fichier `.json`. (Terminé)

- **Objectif 2 : Correction des bugs et amélioration de l'ergonomie. (Terminé)**
    - **Tâche 2.1 :** Analyser et corriger le mécanisme de déplacement des sources de vent qui ne fonctionne pas comme attendu. (Terminé)
    - **Tâche 2.2 :** Clarifier l'interface en réorganisant ou en masquant les contrôles non essentiels (par exemple, les groupes, s'ils ne sont pas prioritaires).
    - **Tâche 2.3 :** Améliorer le retour visuel lors de la sélection et du déplacement d'une source.

- **Objectif 3 : Analyse et planification.**
    - **Tâche 3.1 :** Examiner en détail le code de `editor.js`, `wind.js`, et `ui.js` pour comprendre l'état actuel.
    - **Tâche 3.2 :** Valider le plan d'implémentation avant de commencer les modifications majeures.

### 8.8. Finalisation de l'Éditeur de Vent (Session Actuelle)

Cette session s'est concentrée sur la finalisation de l'éditeur de vent en implémentant une modale de configuration et en corrigeant des bugs critiques liés à l'ergonomie.

- **Implémentation de la Modale de Configuration :**
    - Une modale flottante remplace désormais les contrôles de la barre latérale pour l'édition des sources de vent.
    - La modale s'ouvre au clic sur une source, affichant ses paramètres spécifiques.
    - La sauvegarde des modifications via la modale met à jour l'état de la source dans la configuration de la carte.

- **Correction du Déplacement des Sources :**
    - Le mécanisme de déplacement des sources de vent a été entièrement revu pour être plus intuitif.
    - Un état `movingSource` a été ajouté pour gérer explicitement la source en cours de déplacement.
    - Le processus est désormais un "cliquer-pour-saisir" puis "cliquer-pour-poser", avec un retour visuel clair (la source devient verte).

