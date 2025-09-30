# Contrevent : l’Ascension — Game Design Document (V2 - Direction "Héritage")

## 1. Concept Général

### 1.1 Vision
Le jeu se déroule **1000 ans après les événements de la mythique 34ème Horde du Contrevent**. Cette épopée est devenue une légende fondatrice, un mythe qui hante la culture de l'Aval.

Le joueur incarne une nouvelle expédition, la **"Première Veille"**, formée car le Vent, après un millénaire, est devenu instable et menaçant. L'objectif n'est pas de répéter l'histoire, mais de comprendre la nature du sacrifice de la 34ème et de trouver une nouvelle réponse à la question de l'Origine du Vent (nom de travail pour l'Extrême-Amont).

### 1.2 Fiche d'Identité
-   **Genre** : **Roguelite Narratif et Tactique de Survie en escouade.**
-   **Vue** : 3D isométrique (recommandé pour la vision tactique).
-   **Mode** : Solo (gestion de groupe).
-   **Plateforme** : PC.

## 2. Mécaniques de Jeu Principales

### 2.1 Le Voyage Contre le Vent
La progression se fait sur une **carte de campagne non-linéaire**, découpée en régions correspondant à des biomes distincts (Marais, Canyons, Désert de Sel, etc.), avec des étapes nommées (zones de repos, obstacles, événements narratifs).

-   **Simulation Dynamique du Vent** :
    -   Le vent est une entité physique simulée sur une **grille hexagonale**. Chaque cellule a une valeur de vent qui se propage.
    -   Ce système permet de créer des couloirs de vent, des zones de refuge naturelles et des rafales imprévisibles, offrant des défis de placement tactique.
    -   **Tempo du Vent** : La vitesse de la simulation peut être ajustée pour créer des phases de jeu lentes et oppressantes ou des moments de crise frénétiques.

### 2.2 La Première Veille : Formation et Rôles
Le joueur gère les membres de la Veille, des individus formés en s'inspirant des figures mythiques de la 34ème Horde.

-   **Archétypes (Exemples de Noms de Travail) :**
    -   **Brise-Lames** : Le Pilier du groupe. Encaisse le vent de face pour protéger les autres (mécanique d'"Ombre Protectrice").
    -   **Archiviste** : Le mémorialiste du voyage. Tient le journal de bord et possède des connaissances sur la légende de la 34ème, ce qui peut débloquer des options de dialogue ou révéler des secrets.
    -   **Harmoniste** : Le cœur social. Booste la `Cohésion` par ses actions, influence les dialogues de groupe.
    -   **Spécialistes** : Géomètre, Guérisseur, Éclaireur, etc., avec des compétences actives ou passives uniques.

-   **Gameplay Tactique** :
    -   Le joueur donne des ordres de placement et de déplacement.
    -   **Pause Tactique Active** : Essentielle pour analyser la grille de vent, planifier les mouvements et synchroniser les compétences des membres.

### 2.3 Survie Physique et Mentale
La survie de la Veille repose sur trois axes de gestion interdépendants :
-   **Stamina (Physique)** : L'endurance individuelle. Épuisée par la marche face au vent.
-   **Lucidité (Mental)** : La santé mentale. Affectée par la peur, les événements traumatisants, les paysages aberrants (ex: le Désert de Sel).
-   **Cohésion (Groupe)** : Le moral et les liens du groupe. Affectée par les conflits internes, les choix difficiles, la mort d'un membre.

Les blessures et les traumatismes peuvent avoir des effets permanents sur une partie ("run").

## 3. Système Narratif : Le Dialogue entre Mythe et Réalité

### 3.1 Le Journal de l'Archiviste (Narration Émergente)
C'est le cœur de l'expérience narrative, inspiré de *Disco Elysium*.
-   Le journal est **généré dynamiquement** par les actions, les choix et les échecs du joueur.
-   **Double Narration** : Le journal ne fait pas que décrire le présent. L'Archiviste met constamment le voyage en perspective avec la légende de la 34ème Horde. (Ex: *"Aujourd'hui, nous avons franchi les Canyons Sifflants. Le mythe dit que Caracole a dansé sur le fil du vent ici. Pour nous, il n'y eut que la peur et le bruit assourdissant de nos cœurs."*)
-   **Mémorial Dynamique** : La mort d'un membre est automatiquement consignée par l'Archiviste, avec un récit basé sur les circonstances exactes de sa disparition, créant une histoire unique et poignante à chaque partie.

### 3.2 Dialogues et Choix à Conséquences
-   Système de dialogue où plusieurs membres de la Veille peuvent donner leur avis.
-   **Débats de Groupe** : Le joueur doit trancher lors de dilemmes collectifs (abandonner un blessé, prendre un raccourci dangereux, faire confiance à des étrangers...). Le résultat impacte directement la `Cohésion`.
-   **Rencontres Philosophiques** : Des rencontres avec des factions, comme les descendants des Aérolithes, poseront des choix sur le sens même de la quête.

## 4. Environnement et Ambiance

### 4.1 Direction Artistique
-   Univers visuel brut, érodé, monumental. Des paysages qui racontent une histoire de lutte millénaire.
-   Le vent est un élément visuel à part entière : particules, distorsions de l'air, végétation animée.
-   Interface sobre et typographique, utilisant des symboles pour chaque archétype.

### 4.2 Biomes et Gameplay
Chaque région de la carte est un biome avec des défis spécifiques :
1.  **Marais Fangeux** : Oppose la `Stamina` (ralentissement, enlisement).
2.  **Canyons Sifflants** : Met l'accent sur le placement tactique et le rôle du Brise-Lames.
3.  **Désert de Sel Blanc** : Attaque principalement la `Lucidité` (mirages, désorientation).
4.  **Cité Verticale (ex: Néo-Alticcio)** : Puzzle de navigation en 3D avec des courants de vent complexes.
5.  **Glaciers Miroirs** : Gestion de ressources critiques (froid, abris).
6.  **Zones d'Aberration (proche de l'Origine)** : Les règles du jeu (physique, UI) peuvent commencer à se briser.

## 5. La Fin du Voyage : Le Choix de la Transmission

Conformément à l'esprit de l'œuvre, la fin n'est pas une "victoire" classique. Le joueur atteint l'Origine, mais doit faire un choix final sur la nature de sa réussite, basé sur les ressources qu'il lui reste.
-   **La Voie du Sacrifice** : Tenter de laisser une trace physique durable dans l'Origine.
-   **La Voie de la Compréhension** : Fusionner avec le flux pour en comprendre la nature.
-   **La Voie du Retour** : Tenter l'impossible : trouver un moyen de rapporter une bribe de savoir, là où la 34ème a échoué.

## 6. Inspirations Techniques et Artistiques

-   **Structure & Survie** : *The Banner Saga*, *Frostpunk*.
-   **Gameplay & Narration** : *Disco Elysium*, *Pathologic 2*.
-   **Sensation du Voyage** : *Death Stranding*.
-   **Moteur** : Unity ou Unreal Engine.

## 7. Modes Supplémentaires (Potentiels)

-   **Mode "Cycle Infini" (Roguelike)** : Génération procédurale de Veilles, de cartes et d'événements pour une rejouabilité maximale.
-   **Mode "Archiviste" (Narratif)** : Permet de rejouer des "soumnirs" débloqués, voire une version jouable et stylisée du mythe de la 34ème Horde.
-   **Mode Multijoueur narratif** : Chaque joueur incarne un membre de la Veille et participe aux débats.