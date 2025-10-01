import { showDialogue, showCinematic } from './ui.js';
import { applyStatChange } from './horde.js';
import journalManager from './journal.js';
import { pixelToOffset, offsetToCube, cubeDistance } from './grid-utils.js';

class NarrativeManager {
    constructor() {
        // Le constructeur est maintenant vide, les événements sont chargés depuis la carte.
    }

    /**
     * Méthode appelée à chaque frame depuis la boucle de jeu principale.
     * @param {object} gameState - L'état actuel du jeu (horde, narrativePOIs, etc.).
     */
    update(gameState) {
        if (!gameState.narrativePOIs || gameState.narrativePOIs.length === 0) return;

        for (const poi of gameState.narrativePOIs) {
            if (poi.triggered) {
                continue;
            }

            let membersOnCell = 0;
            for (const member of gameState.horde) {
                const memberHex = pixelToOffset(member.x, member.y);
                if (memberHex.r === poi.r && memberHex.c === poi.c) {
                    membersOnCell++;
                }
            }

            if (membersOnCell >= 2) {
                this.triggerEvent(poi, gameState);
            }
        }
    }

    /**
     * Déclenche l'événement associé à un POI.
     * @param {object} poi - L'objet POI qui a été déclenché.
     * @param {object} gameState - L'état actuel du jeu.
     */
    async triggerEvent(poi, gameState) {
        const { event } = poi;
        console.log(`%cEvent Triggered: ${event.id}`, 'color: #4CAF50; font-weight: bold;');
        poi.triggered = true; // Mark this POI instance as triggered

        switch (event.type) {
            case 'cinematic':
                console.log(`-> Type: Cinematic. Showing letterbox...`);
                await showCinematic(event.content);
                console.log("Cinematic continued.");
                break;
            case 'dialogue':
                console.log(`-> Type: Dialogue. Showing dialogue box...`);
                const choice = await showDialogue(event.content);
                
                if (choice && choice.action) {
                    console.log("Player chose:", choice.text, "Executing action:", choice.action);
                    this.executeAction(choice.action);
                } else {
                    console.log("Dialogue continued or no action defined.");
                }
                break;
        }
    }

    executeAction(action) {
        switch (action.type) {
            case 'stat_change':
                applyStatChange(action);
                break;
            case 'log_entry':
                journalManager.addEntry(action.entry);
                break;
            default:
                console.warn(`Unknown action type: ${action.type}`);
        }
    }
}

// Exporte une instance unique (singleton) du manager
const narrativeManager = new NarrativeManager();
export default narrativeManager;
