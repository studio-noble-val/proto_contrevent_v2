const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Fullscreen Canvas --- 
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initGrid();
}
window.addEventListener('resize', resizeCanvas);

// --- Perlin Noise Generator ---
const PerlinNoise = {
    p: new Uint8Array(512),
    init: function() {
        const p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) p[i] = i;
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }
        this.p = new Uint8Array(512);
        for (let i = 0; i < 512; i++) this.p[i] = p[i & 255];
    },
    fade: t => t * t * t * (t * (t * 6 - 15) + 10),
    lerp: (t, a, b) => a + t * (b - a),
    grad: function(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    },
    noise: function(x, y, z = 0) {
        const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
        x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
        const u = this.fade(x), v = this.fade(y), w = this.fade(z);
        const A = this.p[X] + Y, AA = this.p[A] + Z, AB = this.p[A + 1] + Z;
        const B = this.p[X + 1] + Y, BA = this.p[B] + Z, BB = this.p[B + 1] + Z;
        return this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x - 1, y, z)),
                                        this.lerp(u, this.grad(this.p[AB], x, y - 1, z), this.grad(this.p[BB], x - 1, y - 1, z))),
                           this.lerp(v, this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1), this.grad(this.p[BA + 1], x - 1, y, z - 1)),
                                        this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1), this.grad(this.p[BB + 1], x - 1, y - 1, z - 1))));
    }
};
PerlinNoise.init();

// --- State & Constants ---
let grid = [], horde = [], activeFormation = 'none', targetDestination = null, gamePaused = false, globalWindMultiplier = 1.0, isDragging = false, time = 0;
let selectionRect = { startX: 0, startY: 0, currentX: 0, currentY: 0 };
const HEX_SIZE = 30, HEX_HEIGHT = 2 * HEX_SIZE, HEX_WIDTH = Math.sqrt(3) * HEX_SIZE, GRID_HORIZ_SPACING = HEX_WIDTH, GRID_VERT_SPACING = HEX_HEIGHT * 3 / 4;

// --- Initialization ---
function init() {
    resizeCanvas();
    initHorde();
    setupEventListeners();
    updateStats();
    gameLoop();
}

function initGrid() {
    const gridCols = Math.ceil(canvas.width / GRID_HORIZ_SPACING) + 2;
    const gridRows = Math.ceil(canvas.height / GRID_VERT_SPACING) + 1;
    grid = [];
    const reliefScale = 20; // Smoother terrain
    for (let r = 0; r < gridRows; r++) {
        grid[r] = [];
        for (let c = 0; c < gridCols; c++) {
            const relief = (PerlinNoise.noise(c / reliefScale, r / reliefScale, 0) + 1) / 2;
            grid[r][c] = { relief, wind: { force: 0, direction: Math.PI }, isSource: false };
        }
    }
    for (let r = 0; r < gridRows; r++) {
        if (r % 4 === 0) grid[r][gridCols - 1].isSource = true;
    }
}

function initHorde() {
    const startX = canvas.width / 4, startY = canvas.height / 2;
    horde = [];
    for (let i = 0; i < 10; i++) {
        horde.push({ id: i, x: startX, y: startY + (i - 5) * 15, size: 10, baseSpeed: 1.5, currentSpeed: 1.5, stamina: 100, isSelected: false, target: null });
    }
}

// --- Main Loop ---
function gameLoop() {
    if (!gamePaused) {
        update();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

function update() {
    time += 0.005; // Ajout de l'incrémentation du temps
    updateWind();
    moveHorde();
    resolveCollisions();
    applyWindEffects();
    updateStats();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawHorde();
    if (isDragging) drawSelectionRect();
}

// --- Simulation ---
function updateWind() {
    const gridCols = grid[0].length, gridRows = grid.length;
    const windSourceScale = 10; // Échelle pour le bruit de Perlin à la source

    // --- 1. Rendre la source du vent dynamique ---
    for (let r = 0; r < gridRows; r++) {
        if (grid[r][gridCols - 1].isSource) {
            // Utilise le bruit de Perlin pour faire varier la force du vent à la source dans le temps
            const noiseVal = PerlinNoise.noise(r / windSourceScale, time); // Ajout de `time`
            const force = ((noiseVal + 1) / 2) * 1.2; // Mappe la noise sur [0, 1.2]
            grid[r][gridCols - 1].wind.force = force * globalWindMultiplier;
        } else {
            grid[r][gridCols - 1].wind.force = 0; // Assure que les non-sources n'émettent pas
        }
    }

    // --- 2. Propager le vent avec une physique corrigée ---
    const prevGrid = JSON.parse(JSON.stringify(grid)); // Copie pour une lecture stable
    for (let c = gridCols - 2; c >= 0; c--) {
        for (let r = 0; r < gridRows; r++) {
            const isOddRow = r % 2 === 1;
            const upstreamNeighbors = [
                prevGrid[r] ? prevGrid[r][c + 1] : null,
                prevGrid[r - 1] ? prevGrid[r - 1][c + (isOddRow ? 1 : 0)] : null,
                prevGrid[r + 1] ? prevGrid[r + 1][c + (isOddRow ? 1 : 0)] : null
            ].filter(n => n);

            if (upstreamNeighbors.length === 0) continue;

            const sourceNeighbor = upstreamNeighbors.reduce((max, n) => n.wind.force > max.wind.force ? n : max, { wind: { force: 0 } });

            if (sourceNeighbor.wind.force <= 0.05) { // Seuil légèrement abaissé
                grid[r][c].wind.force = 0;
                continue;
            }

            // Dissipation basée sur la différence de relief (inchangée)
            const reliefDiff = Math.abs(grid[r][c].relief - sourceNeighbor.relief);
            const dissipation = 1.0 - (reliefDiff * 0.25);
            let propagatedForce = sourceNeighbor.wind.force * dissipation;

            // --- Correction et limitation de l'effet Venturi ---
            const wall1 = grid[r - 1] ? grid[r - 1][c].relief : 0;
            const wall2 = grid[r + 1] ? grid[r + 1][c].relief : 0;
            const constriction = (wall1 + wall2) / 2;
            
            // L'effet Venturi ne doit pas augmenter la force de manière explosive.
            // On le limite pour qu'il ne fasse qu'amplifier légèrement la force dans les goulots d'étranglement.
            const venturiEffect = 1.0 + (constriction * 0.5); // Ne dépend plus de propagatedForce
            
            // On s'assure que la force du vent ne peut pas augmenter à l'infini.
            // La force résultante est un mélange de la force propagée et de l'effet Venturi, mais plafonnée.
            grid[r][c].wind.force = Math.min(propagatedForce * venturiEffect, propagatedForce + 0.2);
            grid[r][c].wind.direction = sourceNeighbor.wind.direction;
        }
    }
}

function applyWindEffects() {
    horde.forEach(p => {
        const hexCoords = pixelToHex(p.x, p.y);
        if (hexCoords.r >= 0 && hexCoords.r < grid.length && hexCoords.c >= 0 && hexCoords.c < grid[0].length) {
            const wind = grid[hexCoords.r][hexCoords.c].wind;
            if (wind.force > 0) p.stamina = Math.max(0, p.stamina - wind.force * 0.02);
        }
    });
}

// --- Event Listeners & Controls ---
function setupEventListeners() {
    const windSlider = document.getElementById('windSpeedSlider');
    const windValueSpan = document.getElementById('windSpeedValue');
    
    // --- Logarithmic Slider Mapping ---
    const maxSliderValue = 100;
    const maxWindMultiplier = 5.0;
    const scaleFactor = maxWindMultiplier / (maxSliderValue * maxSliderValue);

    function updateWindMultiplier(sliderValue) {
        const value = parseFloat(sliderValue);
        // Applique une courbe quadratique pour plus de sensibilité dans les basses valeurs
        globalWindMultiplier = scaleFactor * value * value;
        windValueSpan.textContent = globalWindMultiplier.toFixed(2);
    }

    windSlider.addEventListener('input', e => {
        updateWindMultiplier(e.target.value);
    });

    // Initialise la valeur à partir de la position initiale du slider
    updateWindMultiplier(windSlider.value);

    const inspector = document.getElementById('hex-inspector-popup');
    document.getElementById('inspector-close-button').addEventListener('click', () => inspector.style.display = 'none');

    canvas.addEventListener('mousedown', e => {
        inspector.style.display = 'none';
        if (e.button !== 0) return;
        isDragging = true;
        selectionRect.startX = e.offsetX; selectionRect.startY = e.offsetY;
        selectionRect.currentX = e.offsetX; selectionRect.currentY = e.offsetY;
    });

    canvas.addEventListener('mousemove', e => {
        if (isDragging) {
            selectionRect.currentX = e.offsetX; selectionRect.currentY = e.offsetY;
        }
    });

    canvas.addEventListener('mouseup', e => {
        if (e.button !== 0) return;
        isDragging = false;
        const wasDragSelection = Math.abs(selectionRect.startX - selectionRect.currentX) > 5 || Math.abs(selectionRect.startY - selectionRect.currentY) > 5;
        if (wasDragSelection) {
            if (!e.shiftKey) horde.forEach(p => p.isSelected = false);
            const rect = getSelectionRect();
            horde.forEach(p => {
                if (p.x > rect.x && p.x < rect.x + rect.w && p.y > rect.y && p.y < rect.y + rect.h) p.isSelected = true;
            });
        } else {
            const clickedOnCharacter = getCharacterAt(e.offsetX, e.offsetY);
            if (clickedOnCharacter) {
                if (!e.shiftKey) horde.forEach(p => p.isSelected = false);
                clickedOnCharacter.isSelected = !clickedOnCharacter.isSelected;
            } else {
                showHexInspector(e.offsetX, e.offsetY);
            }
        }
    });

    canvas.addEventListener('contextmenu', e => {
        e.preventDefault();
        targetDestination = { x: e.offsetX, y: e.offsetY };
        setGroupTarget(targetDestination);
    });

    document.getElementById("pauseButton").addEventListener("click", () => { gamePaused = !gamePaused; document.getElementById("pauseIndicator").style.display = gamePaused ? "block" : "none"; });
    document.querySelectorAll(".formationButton").forEach(b => b.addEventListener("click", e => setFormation(e.target.dataset.formation)));
}

function showHexInspector(x, y) {
    const hexCoords = pixelToHex(x, y);
    if (hexCoords.r < 0 || hexCoords.r >= grid.length || hexCoords.c < 0 || hexCoords.c >= grid[0].length) return;
    const cell = grid[hexCoords.r][hexCoords.c];
    const popup = document.getElementById('hex-inspector-popup');
    document.getElementById('inspector-altitude').textContent = cell.relief.toFixed(3);
    document.getElementById('inspector-wind-speed').textContent = cell.wind.force.toFixed(3);
    document.getElementById('inspector-wind-pressure').textContent = (cell.wind.force * cell.wind.force * 0.5).toFixed(3);
    popup.style.left = `${x + 15}px`;
    popup.style.top = `${y + 15}px`;
    popup.style.display = 'block';
}

function moveHorde() {
    horde.forEach(p => {
        const hexCoords = pixelToHex(p.x, p.y);
        let windResistance = 0;
        if (p.target && hexCoords.r >= 0 && hexCoords.r < grid.length && hexCoords.c >= 0 && hexCoords.c < grid[0].length) {
            const wind = grid[hexCoords.r][hexCoords.c].wind;
            if (wind.force > 0) {
                const moveAngle = Math.atan2(p.target.y - p.y, p.target.x - p.x);
                windResistance = Math.max(0, -Math.cos(moveAngle - wind.direction)) * wind.force;
            }
        }
        p.currentSpeed = p.baseSpeed * (1 - windResistance);
        if (p.target) {
            const dx = p.target.x - p.x, dy = p.target.y - p.y, dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < p.currentSpeed) {
                p.x = p.target.x; p.y = p.target.y; p.target = null;
            } else {
                p.x += dx / dist * p.currentSpeed; p.y += dy / dist * p.currentSpeed;
            }
        }
    });
}

function resolveCollisions() { for (let i = 0; i < 3; i++) for (let j = 0; j < horde.length; j++) for (let k = j + 1; k < horde.length; k++) { const p1 = horde[j], p2 = horde[k], dx = p2.x - p1.x, dy = p2.y - p1.y, dist = Math.sqrt(dx * dx + dy * dy), min_dist = p1.size + p2.size; if (dist < min_dist) { const overlap = (min_dist - dist) / 2, nx = dist === 0 ? 1 : dx / dist, ny = dist === 0 ? 0 : dy / dist; p1.x -= overlap * nx; p1.y -= overlap * ny; p2.x += overlap * nx; p2.y += overlap * ny; } } }
function setGroupTarget(destination) { let membersToMove = horde.filter(p => p.isSelected); if (membersToMove.length === 0) membersToMove = horde; const formationSpeed = getFormationSpeed(activeFormation), formationOffsets = getFormationOffsets(activeFormation, membersToMove.length), center = membersToMove.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 }); center.x /= membersToMove.length; center.y /= membersToMove.length; const angle = Math.atan2(destination.y - center.y, destination.x - center.x); membersToMove.forEach((p, i) => { const offset = formationOffsets[i], rotatedX = offset.x * Math.cos(angle) - offset.y * Math.sin(angle), rotatedY = offset.x * Math.sin(angle) + offset.y * Math.cos(angle); p.target = { x: destination.x + rotatedX, y: destination.y + rotatedY }; p.baseSpeed = formationSpeed; }); }
function setFormation(formation) { activeFormation = formation; document.querySelectorAll(".formationButton").forEach(b => b.classList.toggle("active", b.dataset.formation === formation)); if (targetDestination) setGroupTarget(targetDestination); }

// --- Drawing & Helpers ---
function drawGrid() { for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[r].length; c++) { const offset = (r % 2) * (HEX_WIDTH / 2), x = c * HEX_WIDTH + offset + HEX_WIDTH / 2, y = r * GRID_VERT_SPACING + HEX_HEIGHT / 2; drawHexagon(x, y, HEX_SIZE, grid[r][c]); } }
function getColorForRelief(relief) { if (relief < 0.3) return `rgb(70, 130, 180)`; if (relief < 0.5) return `rgb(34, 139, 34)`; if (relief < 0.7) return `rgb(139, 69, 19)`; return `rgb(160, 82, 45)`; }
function drawHexagon(x, y, size, cell) { ctx.beginPath(); for (let i = 0; i < 6; i++) ctx.lineTo(x + size * Math.cos(Math.PI / 3 * i + Math.PI / 2), y + size * Math.sin(Math.PI / 3 * i + Math.PI / 2)); ctx.closePath(); ctx.fillStyle = getColorForRelief(cell.relief); ctx.fill(); if (cell.wind.force > 0.1) { ctx.fillStyle = `rgba(255, 255, 255, ${cell.wind.force * 0.2})`; ctx.fill(); const arrowLength = size * cell.wind.force * 0.7, arrowHeadSize = size * 0.2; ctx.save(); ctx.translate(x, y); ctx.rotate(cell.wind.direction); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(arrowLength, 0); ctx.lineTo(arrowLength - arrowHeadSize, -arrowHeadSize / 2); ctx.moveTo(arrowLength, 0); ctx.lineTo(arrowLength - arrowHeadSize, arrowHeadSize / 2); ctx.strokeStyle = 'cyan'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); } ctx.strokeStyle = '#222'; ctx.stroke(); }
function getFormationOffsets(formation, count) { const offsets = []; let spacing = 35; switch (formation) { case "line": for (let i = 0; i < count; i++) offsets.push({ x: -i * spacing, y: 0 }); break; case "turtle": const side = Math.ceil(Math.sqrt(count)); for (let i = 0; i < count; i++) offsets.push({ x: -(i % side) * spacing, y: -Math.floor(i / side) * spacing }); break; case "triangle": let row = 0, inRow = 0; for (let i = 0; i < count; i++) { offsets.push({ x: -row * spacing, y: (inRow - row / 2) * spacing }); inRow++; if (inRow > row) { row++; inRow = 0; } } break; default: for (let i = 0; i < count; i++) offsets.push({ x: 0, y: 0 }); break; } return offsets; }
function getFormationSpeed(formation) { switch (formation) { case "line": return 1.8; case "turtle": return 0.8; case "triangle": return 1.4; default: return 2.5; } }
function drawHorde() { horde.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI); ctx.fillStyle = p.isSelected ? "yellow" : "orange"; ctx.fill(); ctx.strokeStyle = "red"; ctx.stroke(); }); }
function drawSelectionRect() { const rect = getSelectionRect(); ctx.strokeStyle = "rgba(0, 255, 0, 0.7)"; ctx.lineWidth = 1; ctx.strokeRect(rect.x, rect.y, rect.w, rect.h); }
function getCharacterAt(x, y) { for (let i = horde.length - 1; i >= 0; i--) { const p = horde[i]; const dx = p.x - x, dy = p.y - y; if (Math.sqrt(dx * dx + dy * dy) < p.size) return p; } return null; }
function getSelectionRect() { const x = Math.min(selectionRect.startX, selectionRect.currentX), y = Math.min(selectionRect.startY, selectionRect.currentY), w = Math.abs(selectionRect.startX - selectionRect.currentX), h = Math.abs(selectionRect.startY - selectionRect.currentY); return { x, y, w, h }; }
function updateStats() { let selected = horde.filter(p => p.isSelected); if (selected.length === 0) selected = horde; if (selected.length > 0) { document.getElementById("stamina").textContent = Math.round(selected.reduce((sum, p) => sum + p.stamina, 0) / selected.length); } else { document.getElementById("stamina").textContent = "--"; } document.getElementById("lucidity").textContent = "--"; document.getElementById("cohesion").textContent = "--"; }
function pixelToHex(x, y) { const adjustedX = x - HEX_WIDTH / 2, adjustedY = y - HEX_HEIGHT / 2, q = (Math.sqrt(3) / 3 * adjustedX - 1 / 3 * adjustedY) / HEX_SIZE, r = 2 / 3 * adjustedY / HEX_SIZE, cubeX = q, cubeZ = r, cubeY = -cubeX - cubeZ; let rx = Math.round(cubeX), ry = Math.round(cubeY), rz = Math.round(cubeZ); const x_diff = Math.abs(rx - cubeX), y_diff = Math.abs(ry - cubeY), z_diff = Math.abs(rz - cubeZ); if (x_diff > y_diff && x_diff > z_diff) rx = -ry - rz; else if (y_diff > z_diff) ry = -rx - rz; else rz = -rx - ry; return { r: rz, c: rx + (rz - (rz & 1)) / 2 }; }

// --- Start Game ---
init();