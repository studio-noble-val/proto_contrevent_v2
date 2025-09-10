// --- Constants ---
const HEX_SIZE = 30;
const HEX_HEIGHT = 2 * HEX_SIZE;
const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
const GRID_HORIZ_SPACING = HEX_WIDTH;
const GRID_VERT_SPACING = HEX_HEIGHT * 3 / 4;

// --- Editor State ---
const state = {
    grid: [],
    brushSize: 1,
    altitude: 0.5,
    isPainting: false,
};

// --- DOM Elements ---
let canvas, ctx, textarea, brushSizeInput, altitudeInput, dataViewPanel;

// --- Initialization ---
function init() {
    // Get DOM elements
    canvas = document.getElementById('editor-canvas');
    ctx = canvas.getContext('2d');
    textarea = document.getElementById('map-data-textarea');
    brushSizeInput = document.getElementById('brush-size');
    altitudeInput = document.getElementById('altitude-value');
    dataViewPanel = document.getElementById('editor-data-view');

    resizeCanvas();
    createNewGrid(30, 45); // Default map size
    drawGrid();
    updateDataView();
    setupEventListeners();
}

function resizeCanvas() {
    const mainPanel = document.getElementById('editor-main');
    const isDataViewVisible = !dataViewPanel.classList.contains('d-none');
    const dataViewWidth = isDataViewVisible ? 320 : 0;
    canvas.width = mainPanel.clientWidth - dataViewWidth;
    canvas.height = mainPanel.clientHeight;
}

function setupEventListeners() {
    // Toolbar listeners
    brushSizeInput.addEventListener('change', e => state.brushSize = parseInt(e.target.value, 10));
    altitudeInput.addEventListener('input', e => state.altitude = parseFloat(e.target.value));
    document.getElementById('new-map-button').addEventListener('click', () => {
        const rows = parseInt(prompt("Nombre de rangées :", "30"), 10);
        const cols = parseInt(prompt("Nombre de colonnes :", "45"), 10);
        if (rows && cols) {
            createNewGrid(rows, cols);
            drawGrid();
            updateDataView();
        }
    });

    document.getElementById('save-button').addEventListener('click', saveMap);
    document.getElementById('load-file-button').addEventListener('click', loadMapFromFile);
    document.getElementById('apply-text-button').addEventListener('click', applyTextToMap);
    document.getElementById('toggle-data-view-button').addEventListener('click', toggleDataView);

    // Painting listeners
    canvas.addEventListener('mousedown', e => {
        state.isPainting = true;
        paintHexes(e);
    });
    canvas.addEventListener('mouseup', () => state.isPainting = false);
    canvas.addEventListener('mouseleave', () => state.isPainting = false);
    canvas.addEventListener('mousemove', e => {
        if (state.isPainting) {
            paintHexes(e);
        }
    });

    window.addEventListener('resize', () => {
        resizeCanvas();
        drawGrid();
    });
}

// --- UI Logic ---
function toggleDataView() {
    const button = document.getElementById('toggle-data-view-button');
    const isHidden = dataViewPanel.classList.toggle('d-none');
    button.textContent = isHidden ? "Afficher Données" : "Cacher Données";
    resizeCanvas();
    drawGrid();
}

// --- Save/Load Logic ---
function saveMap() {
    const mapData = textarea.value;
    const blob = new Blob([mapData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `map_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function loadMapFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = event => {
            textarea.value = event.target.result;
            applyTextToMap();
        };
        reader.readAsText(file);
    };
    input.click();
}

function applyTextToMap() {
    try {
        const reliefGrid = JSON.parse(textarea.value);

        if (!Array.isArray(reliefGrid) || !Array.isArray(reliefGrid[0])) {
            throw new Error("Invalid map data format.");
        }

        state.grid = reliefGrid.map(row => 
            row.map(relief => ({ relief: relief }))
        );

        drawGrid();
        updateDataView();
        alert("Carte chargée avec succès !");

    } catch (error) {
        alert("Erreur lors du chargement de la carte :\n" + error.message);
    }
}

// --- Painting Logic ---
function paintHexes(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerHex = cubeToOffset(roundCube(pixelToCube(mouseX, mouseY)));

    for (let r_offset = -state.brushSize; r_offset <= state.brushSize; r_offset++) {
        for (let c_offset = -state.brushSize; c_offset <= state.brushSize; c_offset++) {
            
            const targetHex = {
                r: centerHex.r + r_offset,
                c: centerHex.c + c_offset
            };

            const centerCube = offsetToCube(centerHex);
            const targetCube = offsetToCube(targetHex);

            if (cubeDistance(centerCube, targetCube) < state.brushSize) {
                if (state.grid[targetHex.r] && state.grid[targetHex.r][targetHex.c]) {
                    state.grid[targetHex.r][targetHex.c].relief = state.altitude;
                }
            }
        }
    }

    drawGrid();
    updateDataView();
}


// --- Grid & Map Logic ---
function createNewGrid(rows, cols) {
    state.grid = [];
    for (let r = 0; r < rows; r++) {
        state.grid[r] = [];
        for (let c = 0; c < cols; c++) {
            state.grid[r][c] = { relief: 0.5 };
        }
    }
}

function updateDataView() {
    const reliefGrid = state.grid.map(row => row.map(cell => parseFloat(cell.relief.toFixed(3))));
    textarea.value = JSON.stringify(reliefGrid, null, 2);
}

// --- Drawing & Conversion Logic ---
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!state.grid || state.grid.length === 0) return;
    for (let r = 0; r < state.grid.length; r++) {
        for (let c = 0; c < state.grid[r].length; c++) {
            const offset = (r % 2) * (GRID_HORIZ_SPACING / 2);
            const x = c * GRID_HORIZ_SPACING + offset;
            const y = r * GRID_VERT_SPACING;
            drawHexagon(x + HEX_WIDTH / 2, y + HEX_HEIGHT / 2, state.grid[r][c]);
        }
    }
}

function getColorForRelief(relief) {
    if (relief < 0.3) return `rgb(70, 130, 180)`;
    if (relief < 0.5) return `rgb(34, 139, 34)`;
    if (relief < 0.7) return `rgb(139, 69, 19)`;
    return `rgb(160, 82, 45)`;
}

function drawHexagon(x, y, cell) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        // Added Math.PI / 2 rotation to draw flat-topped hexagons
        ctx.lineTo(x + HEX_SIZE * Math.cos(Math.PI / 3 * i + Math.PI / 2), y + HEX_SIZE * Math.sin(Math.PI / 3 * i + Math.PI / 2));
    }
    ctx.closePath();
    ctx.fillStyle = getColorForRelief(cell.relief);
    ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.stroke();
}

// --- Coordinate Conversion --- // Corrected for Flat-Top, Odd-Q

function pixelToCube(x, y) {
    const q = (Math.sqrt(3)/3 * x - 1/3 * y) / HEX_SIZE;
    const r = (2/3 * y) / HEX_SIZE;
    return { x: q, y: -q-r, z: r };
}

function roundCube(cube) {
    let rx = Math.round(cube.x);
    let ry = Math.round(cube.y);
    let rz = Math.round(cube.z);

    const x_diff = Math.abs(rx - cube.x);
    const y_diff = Math.abs(ry - cube.y);
    const z_diff = Math.abs(rz - cube.z);

    if (x_diff > y_diff && x_diff > z_diff) {
        rx = -ry - rz;
    } else if (y_diff > z_diff) {
        ry = -rx - rz;
    } else {
        rz = -rx - ry;
    }
    return { x: rx, y: ry, z: rz };
}

function cubeToOffset(cube) {
    const col = cube.x + (cube.z - (cube.z & 1)) / 2;
    const row = cube.z;
    return { r: row, c: col };
}

function offsetToCube(hex) {
    const q = hex.c - (hex.r - (hex.r & 1)) / 2;
    const r = hex.r;
    return { x: q, y: -q - r, z: r };
}

function cubeDistance(a, b) {
    return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2;
}


// --- Initialization ---
window.addEventListener('load', init);