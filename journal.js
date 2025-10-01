/**
 * Le JournalManager est responsable de la collecte et de la gestion des entrées narratives
 * qui forment l'histoire émergente de la partie.
 */
class JournalManager {
    constructor() {
        // Initialise avec une première entrée pour planter le décor.
        this.entries = [
            {
                timestamp: Date.now(),
                text: "Le vent se lève. La Première Veille commence son long périple contre le courant du temps."
            }
        ];
    }

    /**
     * Ajoute une nouvelle entrée au journal.
     * @param {string} text - Le texte de l'entrée à ajouter.
     */
    addEntry(text) {
        if (!text) return;

        const newEntry = {
            timestamp: Date.now(),
            text: text
        };

        this.entries.push(newEntry);
        console.log(`%cJournal Entry Added: "${text}"`, 'color: #00aaff;');
    }

    /**
     * Récupère toutes les entrées du journal.
     * @returns {Array<object>} - Une copie du tableau des entrées.
     */
    getEntries() {
        return [...this.entries];
    }

    /**
     * Efface toutes les entrées du journal (pour une nouvelle partie, par exemple).
     */
    clearJournal() {
        this.entries = [];
    }
}

// Exporte une instance unique (singleton) du manager
const journalManager = new JournalManager();
export default journalManager;
