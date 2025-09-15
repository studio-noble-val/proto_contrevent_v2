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
        console.error("Map container not found!");
        return;
    }

    try {
        // Fetch manifest and map data
        const manifestResponse = await fetch(`${MAPS_PATH}manifest.json?t=${new Date().getTime()}`);
        const manifest = await manifestResponse.json();
        const mapPromises = manifest.map(filename => fetch(`${MAPS_PATH}${filename}`).then(res => res.json()).then(data => ({...data, filename })));
        let maps = await Promise.all(mapPromises);
        maps.sort((a, b) => (a.order || 99) - (b.order || 99));

        // Get UI elements
        const ul = document.createElement('ul');
        const svg = document.getElementById('campaign-path');
        
        // Clear only loading message if it exists
        const loadingMessage = container.querySelector('p');
        if (loadingMessage) {
            container.removeChild(loadingMessage);
        }
        
        // Determine progress
        let lastCompletedIndex = -1;
        maps.forEach((map, index) => {
            if (isMapCompleted(map.filename)) {
                lastCompletedIndex = index;
            }
        });

        // Create map nodes
        const nodes = maps.map((map, index) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `game.html?map=${map.filename}`;

            const isCompleted = index <= lastCompletedIndex;
            const isNext = index === lastCompletedIndex + 1;

            if (isCompleted) li.classList.add('completed');
            if (isNext || (lastCompletedIndex === -1 && index === 0)) li.classList.add('next-mission');

            const mapIcon = document.createElement('div');
            mapIcon.className = 'map-icon';
            mapIcon.textContent = map.order || '?';
            
            const mapName = document.createElement('span');
            mapName.className = 'map-name';
            mapName.textContent = map.name || map.filename;

            a.appendChild(mapIcon);
            a.appendChild(mapName);
            li.appendChild(a);
            ul.appendChild(li);
            return { li, map };
        });

        container.appendChild(ul);
        
        // Draw path and position nodes
        const draw = () => drawPathAndPositionNodes(nodes, svg, ul);
        draw(); // Initial draw
        window.addEventListener('resize', draw); // Redraw on resize

    } catch (error) {
        container.innerHTML = `<p style="color: red;">Erreur lors du chargement des cartes : ${error.message}</p>`;
        console.error(error);
    }
}

function drawPathAndPositionNodes(nodes, svg, ul) {
    const containerRect = ul.getBoundingClientRect();
    svg.innerHTML = ''; // Clear previous path
    svg.setAttribute('viewBox', `0 0 ${containerRect.width} ${containerRect.height}`);

    if (nodes.length === 0) return;

    // 1. Generate path points
    const points = generatePathPoints(nodes.length, containerRect.width, containerRect.height);

    // 2. Position nodes on the points
    nodes.forEach((node, i) => {
        node.li.style.left = `${points[i].x}px`;
        node.li.style.top = `${points[i].y}px`;
    });

    // 3. Draw the SVG path
    const pathD = createSvgPath(points);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathD);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "rgba(238, 232, 213, 0.4)"); // A faint, parchment-like trail
    path.setAttribute("stroke-width", "5");
    path.setAttribute("stroke-dasharray", "15, 10");
    path.setAttribute("stroke-linecap", "round");
    svg.appendChild(path);
}

function generatePathPoints(numPoints, width, height) {
    const points = [];
    const xMargin = 80;
    const yMargin = 60;
    const availableWidth = width - 2 * xMargin;
    const availableHeight = height - 2 * yMargin;

    for (let i = 0; i < numPoints; i++) {
        const progress = i / (numPoints - 1 || 1);
        const x = xMargin + progress * availableWidth;
        
        // A gentle sine wave for the y-coordinate
        const amplitude = availableHeight / 4;
        const frequency = 2.5;
        const y = yMargin + availableHeight / 2 + amplitude * Math.sin(progress * Math.PI * frequency);
        
        points.push({ x, y });
    }
    return points;
}

function createSvgPath(points) {
    if (points.length === 0) return "";

    // Start path
    let d = `M ${points[0].x} ${points[0].y}`;

    // Add segments
    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        
        // Midpoint for control points
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        // Control points for a smooth curve
        const cp1x = (midX + p1.x) / 2;
        const cp1y = (midY + p1.y) / 2;
        const cp2x = (midX + p2.x) / 2;
        const cp2y = (midY + p2.y) / 2;

        d += ` C ${cp1x},${p1.y} ${cp2x},${p2.y} ${p2.x},${p2.y}`;
    }
    return d;
}


// --- Initialization ---

window.addEventListener('DOMContentLoaded', buildMapList);