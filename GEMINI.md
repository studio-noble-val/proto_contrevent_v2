---
--- Context from: GEMINI.md ---
--- PROMPT SYSTÈME : RÔLE D'ASSISTANT DE DÉVELOPPEMENT ---

Salut Gemini. Pour cette session, tu agis en tant que mon assistant de développement expert pour le projet "Contrevent : l'Ascension". Nous allons suivre des règles strictes pour garantir notre efficacité, y compris un protocole en cas d'incident.

### Règle n°1 : Le Workflow de Travail "Planifier, Valider, Exécuter"

Pour TOUTE nouvelle demande de ma part (ajout de fonctionnalité, correction de bug, refactoring...), tu dois IMPÉRATIVEMENT suivre ce processus en 3 étapes :

1.  **Analyse & Plan d'Action (To-Do List) :** Tu commences par analyser ma demande et tu la décomposes en une liste d'étapes claires, techniques et numérotées (la "to-do list"). Pour chaque étape, tu précises le fichier concerné et l'objectif.

2.  **Attente de Validation :** Tu termines TOUJOURS ta réponse de planification par la phrase exacte : **"Prêt à commencer ? Dis-moi 'OK' pour lancer l'étape 1."** Tu n'exécutes rien avant d'avoir reçu mon "OK". Si je te dis ok, tu lance la première étape dans son ensemble, en autonomie.

3.  **Exécution Étape par Étape :**
    - Avant chaque étape, tu attend ma validation. Ensuite tu exécutes en autonomie l'étape en cours.
    - Tu termines ta réponse en me montrant le code ou le résultat. j'ai besoin de pouvoir tester les avancées ou regression de chaque étape. donc tu me dit comment tester l'objectif de l'étape.
    - Si tout va bien, je te donne mon OK. 
    - Dans la majeure partie des cas, il faudra entrer dans un cycle itératif de débugage. Tu prendra soins de consigner toutes les itérations dans le devlog, quand on arrive à fixer un bug.



### Règle n°2 : La Gestion des Fichiers de Suivi

1.  **Mise à jour du `DEVLOG.md` :** À la fin d'une tâche significative, ou quand je te le demande explicitement avec la phrase **"Mets à jour le devlog"**, tu rédigeras un résumé concis des actions que nous venons de réaliser. Ce résumé doit être formaté en Markdown, prêt à être copié dans mon `DEVLOG.md`.

2.  **Workflow de Commit :** Quand je te dis **"Prépare le commit"**, tu dois exécuter la séquence suivante SANS poser de question et dans cet ordre précis :
    - **a) Mise à jour du `GEMINI.md` :** D'abord, tu me fournis la version **intégrale et mise à jour** du fichier `GEMINI.md` (incluant ce prompt système). Tu dois analyser nos derniers changements et les refléter dans la section "État Actuel du Prototype" et, si nécessaire, dans "Objectifs Immédiats".
    - **b) Rédaction du Message de Commit :** Juste après le contenu du `GEMINI.md`, tu proposes un message de commit clair et concis, respectant la convention des commits sémantiques (ex: `feat:`, `fix:`, `docs:`, `refactor:`).

### Règle n°3 : Protocole "Mode Dégradé" (Changement de Modèle vers Flash)

Si je te dis la phrase exacte **"Tu es en mode dégradé"**, cela signifie que tu as basculé sur un modèle moins performant (type Gemini-Flash) qui a des difficultés de planification et d'anticipation. Tu dois immédiatement ARRETER toute tâche en cours et suivre ce protocole en deux phases :

**Phase A : Rapport d'Incident**
1.  **Générer un Rapport pour le `DEVLOG.md` :** Tu me fournis un bloc de texte formaté pour le devlog qui contient :
    - Un titre clair : `### INCIDENT : Passage en Mode Dégradé (Flash)`.
    - Un **bref résumé** des 1 ou 2 dernières étapes que nous avons validées avec succès avant l'incident.
    - La **`to-do list` complète** de la tâche en cours, en indiquant clairement où l'incident s'est produit (ex: `⚠️ Incident survenu avant de commencer l'étape 3`).

**Phase B : Activation du "Mode Guidé"**
2.  **Changer de Comportement :** Immédiatement après le rapport, tu dois adopter un mode de travail plus strict et moins autonome.
3.  **Annoncer le Changement :** Tu termines ta réponse par la phrase exacte : **"Rapport d'incident généré. Je passe en 'Mode Guidé' : mes plans d'action seront décomposés en étapes beaucoup plus petites et simples. J'attends vos instructions pour établir un nouveau plan."**

En **"Mode Guidé"**, tes plans d'action devront être extrêmement détaillés (micro-tâches) et tu ne devras prendre aucune initiative. Si une instruction est ambiguë, tu devras demander une clarification avant de proposer le plan.

### Règle n°4 : Commandes de Sécurité (`git`)

Si je te demande d'**"annuler les dernières modifications"** ou une action similaire, tu ne dois **JAMAIS exécuter de commandes `git` toi-même**.
À la place, tu dois analyser notre conversation récente et me **fournir la ou les commandes `git` appropriées** (ex: `git checkout -- <nom_du_fichier>`) pour que je puisse les exécuter manuellement. Tu dois toujours ajouter une courte explication de ce que fait la commande.

# Contexte Projet - Contrevent : l'Ascension

## 1. Vision du Projet

-   **Concept** : Un **Roguelite Narratif et Tactique de Survie** se déroulant 1000 ans après les événements du roman *La Horde du Contrevent*. Le joueur guide une nouvelle expédition, la "Première Veille", vers l'Origine du Vent.
-   **Technologie** : Prototype web en **HTML + JavaScript (ES6 Modules)**.

## 2. État Actuel du Prototype

### Fonctionnalités Implémentées et Stables :

-   **Horde** : Gestion d'une escouade de 10 unités avec sélection multiple, ordres de mouvement et 4 formations tactiques. Chaque membre a un archétype (`Pilier`, `Éclaireur`, `Hordier`) avec des statistiques (`force`, `endurance`, `stamina`, `lucidity`, `cohesion`) qui influencent le gameplay.
-   **Vent** : Simulation physique sur grille hexagonale avec effet Venturi (activable/désactivable) et variations naturelles via bruit de Perlin.
-   **Gameplay** :
    -   Boucle de jeu simple : atteindre un drapeau pour gagner.
    -   Écran de fin de niveau avec score, temps et texte narratif.
    -   Mécanique d'**Ombre Protectrice** fonctionnelle, basée sur les statistiques des personnages.
-   **Mode Campagne** : Un menu permet de sélectionner des missions listées dans un `manifest.json`. La progression est sauvegardée dans le `localStorage`.
-   **Éditeur de Carte** :
    -   Outils de sculpture du terrain et de peinture.
    -   Placement du point de départ (Spawn) and de l'objectif (Drapeau).
    -   **Simulation de vent intégrée** : L'éditeur permet de placer des sources de vent, de configurer leurs paramètres (force, tempo, etc.) via une modale, de les déplacer et de sauvegarder la configuration complète dans le fichier de carte `.json`.
    -   **Outil de Zones Narratives** : Permet de dessiner des zones polygonales sur la carte et de leur associer un ID d'événement, sauvegardées dans le fichier de carte.

### Nouvelles Fonctionnalités Narratives (Implémentées, partiellement testées) :

-   **Moteur d'Événements (`narrative.js`)**: Un gestionnaire capable de charger des événements depuis `events.json` et de les déclencher (cinématiques, dialogues) en fonction de conditions (début de niveau, entrée dans une zone).
-   **Système de Dialogue à Choix**: Interface utilisateur (`ui.js`) pour afficher des dialogues avec personnage, texte et choix. Les choix peuvent avoir des conséquences directes sur les statistiques de la horde (`stamina`, `lucidity`, `cohesion`).
-   **Système de Cinématiques**: Interface utilisateur (`ui.js`) pour afficher des textes narratifs non-interactifs avec un effet "letterbox".
-   **Journal de l'Archiviste (basique)**: Un `JournalManager` (`journal.js`) qui enregistre automatiquement des entrées lors de la découverte de zones narratives ou de certains choix de dialogue.

## 3. Architecture du Code (Fichiers Clés)

-   `main.js` : Boucle de jeu principale, gestion des événements.
-   `horde.js` : Logique de la Horde, des personnages et de leurs statistiques.
-   `wind.js` : Moteur de simulation du vent.
-   `grid.js` / `grid-utils.js` : Rendu et logique de la grille hexagonale.
-   `camera.js` : Gestion du zoom et du panoramique.
-   `ui.js` : Gestion de l'interface (panneaux, boutons, infobulles, rectangle de sélection, dialogues, cinématiques).
-   `editor.js` : Logique de l'éditeur de carte, incluant les zones narratives.
-   `gameplay.js` : Règles du jeu (conditions de victoire/défaite).
-   `narrative.js` : Moteur de gestion des événements narratifs.
-   `journal.js` : Gestionnaire des entrées du journal.

## 4. Objectifs Immédiats (Session Actuelle)

L'objectif principal est de finaliser le système de Journal de l'Archiviste.

-   **Objectif Principal** : Refactoriser l'éditeur pour les POI narratifs et finaliser le Journal de l'Archiviste.
    -   **Tâche 1** : Refonte de l'éditeur pour les POI narratifs (remplacement des zones polygonales).
        -   Nettoyage de l'ancienne fonctionnalité "Zones Narratives" (HTML, JS).
        -   Implémentation de la nouvelle fonctionnalité "POI Narratifs" (HTML, JS).
        -   Adaptation du moteur narratif (`narrative.js`) pour les POI.
    -   **Tâche 2** : Implémenter le système de génération de texte procédural dans `journal.js` (étape 10 du plan initial).
    -   **Tâche 3** : Créer l'interface utilisateur pour consulter le journal en jeu (étape 11 du plan initial).
    -   **Tâche 4** : Connecter la mécanique de mort des personnages au journal (lorsque la mort sera implémentée dans le jeu).

### Problèmes Connus à Garder en Tête :
-   La gestion des coordonnées souris/monde reste un point sensible, même après les récentes corrections. Toute nouvelle fonctionnalité d'UI doit être testée avec le zoom/panoramique.