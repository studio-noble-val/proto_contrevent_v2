const MAPS_PATH = 'maps/';

// --- Campaign Progression ---

function getCampaignProgress() {
    const progress = localStorage.getItem('contrevent_progress');
    return progress ? JSON.parse(progress) : {};
}

function isMapCompleted(mapFilename) {
    const progress = getCampaignProgress();
    return progress[mapFilename] === true;
}

// --- DOM Creation ---

async function buildMapList() {
    const container = document.getElementById('map-list-container');
    if (!container) {
        console.error("Map list container not found!");
        return;
    }

    try {
        const manifestResponse = await fetch(`${MAPS_PATH}manifest.json`);
        const manifest = await manifestResponse.json();

        const mapPromises = manifest.map(filename => fetch(`${MAPS_PATH}${filename}`).then(res => res.json()).then(data => ({...data, filename })));
        const maps = await Promise.all(mapPromises);

        // Sort maps by the 'order' property
        maps.sort((a, b) => (a.order || 99) - (b.order || 99));

        let listHtml = '<ul>';
        for (const map of maps) {
            const completed = isMapCompleted(map.filename);
            const status = completed ? '[Terminé]' : '[À faire]';
            const itemClass = completed ? 'completed' : '';

            listHtml += `
                <li class="${itemClass}">
                    <a href="game.html?map=${map.filename}">
                        <span class="map-order">Étape ${map.order || '??'}</span>
                        <span class="map-name">${map.name || map.filename}</span>
                        <span class="map-status">${status}</span>
                    </a>
                </li>
            `;
        }
        listHtml += '</ul>';

        container.innerHTML = listHtml;

    } catch (error) {
        container.innerHTML = `<p style="color: red;">Erreur lors du chargement des cartes : ${error.message}</p>`;
        console.error(error);
    }
}

// --- Initialization ---

window.addEventListener('load', buildMapList);
