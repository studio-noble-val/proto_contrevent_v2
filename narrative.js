import { showDialogue, showCinematic } from './ui.js';
import { applyStatChange } from './horde.js';
import journalManager from './journal.js';

/**
 * Checks if a point is inside a polygon.
 * @param {object} point - The point to check {x, y}.
 * @param {Array<object>} polygon - An array of points {x, y} defining the polygon.
 * @returns {boolean}
 */
function isPointInPolygon(point, polygon) {
    const { x, y } = point;
    let isInside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;

        const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) isInside = !isInside;
    }
    return isInside;
}

class NarrativeManager {
    constructor() {
        this.events = [];
        this.triggeredEvents = new Set(); // Pour ne déclencher chaque événement qu'une seule fois
    }

    async loadEvents() {
        try {
            const response = await fetch('narrative/events.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.events = data.events;
            console.log('Narrative events loaded successfully.');
        } catch (error) {
            console.error("Could not load narrative events:", error);
        }
    }

    /**
     * Méthode appelée à chaque frame depuis la boucle de jeu principale.
     * @param {object} gameState - L'état actuel du jeu (ex: position de la horde, niveau actuel).
     */
    update(gameState) {
        if (!this.events.length) return;

        for (const event of this.events) {
            if (this.triggeredEvents.has(event.id)) {
                continue; // Ne pas redéclencher un événement déjà passé
            }

            if (this.checkTrigger(event, gameState)) {
                this.triggerEvent(event, gameState);
            }
        }
    }

    /**
     * Vérifie si les conditions de déclenchement d'un événement sont remplies.
     * @param {object} event - L'objet événement de events.json.
     * @param {object} gameState - L'état actuel du jeu.
     * @returns {boolean}
     */
    checkTrigger(event, gameState) {
        const { trigger } = event;

        switch (trigger.type) {
            case 'on_level_start':
                return gameState.levelId === trigger.level_id;

            case 'enter_zone':
                const zone = gameState.narrativeZones.find(z => z.id === trigger.zone_id);
                if (!zone) return false;

                // Check if any horde member is inside the zone polygon
                for (const member of gameState.horde) {
                    if (isPointInPolygon({ x: member.x, y: member.y }, zone.points)) {
                        journalManager.addEntry(`La Horde entre dans la zone : ${trigger.zone_id}.`);
                        return true;
                    }
                }
                return false;

            default:
                return false;
        }
    }

    /**
     * Déclenche l'événement.
     * @param {object} event - L'objet événement.
     * @param {object} gameState - L'état actuel du jeu.
     */
    async triggerEvent(event, gameState) {
        console.log(`%cEvent Triggered: ${event.id}`, 'color: #4CAF50; font-weight: bold;');
        this.triggeredEvents.add(event.id);

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
