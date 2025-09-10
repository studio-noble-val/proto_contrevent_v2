import { pixelToOffset, cubeDistance, offsetToCube } from './grid-utils.js';

// --- Constants ---
const BASE_HEX_SIZE = 30;
const HEX_HEIGHT = 2 * BASE_HEX_SIZE;
const HEX_WIDTH = Math.sqrt(3) * BASE_HEX_SIZE;
const GRID_HORIZ_SPACING = HEX_WIDTH;
const GRID_VERT_SPACING = HEX_HEIGHT * 3 / 4;
const PAN_SPEED = 15;
const ZOOM_SPEED = 1.1;
const INTENSITY_LEVELS = [0.025, 0.05, 0.075, 0.1, 0.125];

// --- Editor State ---
const state = {
    grid: [],
    brushSize: 1,
    altitude: 0.5,
    intensity: 0.05,
    isPainting: false,
    isPanning: false,
    isDragging: false,
    lastPanPosition: { x: 0, y: 0 },
    panelOffset: { x: 0, y: 0 },
    brushMode: 'paint',
    zoomLevel: 1,
    cameraOffset: { x: 0, y: 0 },
    spawnPoint: null,
    flagPosition: null,
    mapName: 'Nouvelle Carte',
    mapOrder: 1,
};

// --- DOM Elements ---
let canvas, ctx, brushSizeInput, altitudeInput, intensityInput, toolButtons, paintToolOptionsPanel, sculptToolOptionsPanel, mapRowsInput, mapColsInput, editorPanel, panelHeader, mapNameInput, mapOrderInput;

// --- Initialization ---
function init() {
    // Get DOM elements
    canvas = document.getElementById('editor-canvas');
    ctx = canvas.getContext('2d');
    brushSizeInput = document.getElementById('brush-size');
    altitudeInput = document.getElementById('altitude-value');
    intensityInput = document.getElementById('intensity-value');
    toolButtons = document.querySelectorAll('.tool-button');
    paintToolOptionsPanel = document.getElementById('paint-tool-options');
    sculptToolOptionsPanel = document.getElementById('sculpt-tool-options');
    mapRowsInput = document.getElementById('map-rows');
    mapColsInput = document.getElementById('map-cols');
    editorPanel = document.getElementById('editor-panel');
    panelHeader = document.getElementById('panel-header');
    mapNameInput = document.getElementById('map-name');
    mapOrderInput = document.getElementById('map-order');

    state.intensity = INTENSITY_LEVELS[intensityInput.value];
    state.mapName = mapNameInput.value;
    state.mapOrder = parseInt(mapOrderInput.value, 10);

    resizeCanvas();
    createNewGrid(parseInt(mapRowsInput.value, 10), parseInt(mapColsInput.value, 10));
    setupEventListeners();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawGrid();
}

function setupEventListeners() {
    // Toolbar listeners
    mapNameInput.addEventListener('change', e => state.mapName = e.target.value);
    mapOrderInput.addEventListener('change', e => state.mapOrder = parseInt(e.target.value, 10));
    brushSizeInput.addEventListener('change', e => state.brushSize = parseInt(e.target.value, 10));
    altitudeInput.addEventListener('input', e => state.altitude = parseFloat(e.target.value));
    intensityInput.addEventListener('input', e => state.intensity = INTENSITY_LEVELS[e.target.value]);

    // Tool selection
    toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            toolButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            state.brushMode = button.dataset.tool;
            const isTerrainTool = ['paint', 'raise', 'lower'].includes(state.brushMode);
            paintToolOptionsPanel.style.display = state.brushMode === 'paint' ? 'block' : 'none';
            sculptToolOptionsPanel.style.display = ['raise', 'lower'].includes(state.brushMode) ? 'block' : 'none';
        });
    });

    // Map management
    document.getElementById('resize-button').addEventListener('click', () => {
        const rows = parseInt(mapRowsInput.value, 10);
        const cols = parseInt(mapColsInput.value, 10);
        if (rows && cols) createNewGrid(rows, cols);
    });
    document.getElementById('save-button').addEventListener('click', saveMap);
    document.getElementById('load-file-button').addEventListener('click', loadMapFromFile);

    // Mouse listeners for canvas
    canvas.addEventListener('mousedown', e => {
        if (e.target !== canvas) return;
        if (e.button === 1) { // Middle mouse
            state.isPanning = true;
            state.lastPanPosition = { x: e.clientX, y: e.clientY };
        } else if (e.button === 0) { // Left mouse
            if (['paint', 'raise', 'lower'].includes(state.brushMode)) {
                state.isPainting = true;
            }
            handleCanvasClick(e);
        }
    });

    // Draggable panel listeners
    panelHeader.addEventListener('mousedown', e => {
        state.isDragging = true;
        state.panelOffset = { x: e.clientX - editorPanel.offsetLeft, y: e.clientY - editorPanel.offsetTop };
    });

    window.addEventListener('mouseup', e => {
        state.isPainting = false;
        state.isPanning = false;
        state.isDragging = false;
    });

    window.addEventListener('mousemove', e => {
        if (state.isDragging) {
            editorPanel.style.left = `${e.clientX - state.panelOffset.x}px`;
            editorPanel.style.top = `${e.clientY - state.panelOffset.y}px`;
        } else if (state.isPanning) {
            const dx = e.clientX - state.lastPanPosition.x;
            const dy = e.clientY - state.lastPanPosition.y;
            state.cameraOffset.x += dx;
            state.cameraOffset.y += dy;
            state.lastPanPosition = { x: e.clientX, y: e.clientY };
            drawGrid();
        } else if (state.isPainting) {
            handleCanvasClick(e);
        }
    });

    canvas.addEventListener('mouseleave', () => {
        state.isPainting = false;
        state.isPanning = false;
    });

    // Zoom listener
    canvas.addEventListener('wheel', e => {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? ZOOM_SPEED : 1 / ZOOM_SPEED;
        state.zoomLevel = Math.max(0.2, Math.min(state.zoomLevel * zoomFactor, 5));
        drawGrid();
    });

    // Keyboard listeners
    window.addEventListener('keydown', e => {
        switch(e.key.toLowerCase()) {
            case 'w': case 'arrowup': state.cameraOffset.y += PAN_SPEED; break;
            case 's': case 'arrowdown': state.cameraOffset.y -= PAN_SPEED; break;
            case 'a': case 'arrowleft': state.cameraOffset.x += PAN_SPEED; break;
            case 'd': case 'arrowright': state.cameraOffset.x -= PAN_SPEED; break;
            case '+': case '=': state.zoomLevel = Math.min(5, state.zoomLevel * ZOOM_SPEED); break;
            case '-': state.zoomLevel = Math.max(0.2, state.zoomLevel / ZOOM_SPEED); break;
            default: return;
        }
        drawGrid();
        e.preventDefault();
    });

    window.addEventListener('resize', resizeCanvas);
}

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '_')           // Replace spaces with _
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/[^ -ɏḀ-ỿⱠ-Ɀ꜠-ꟿ]/g, '') // remove non-alphanumeric chars
        .replace(/&/g, '-and-')         // replace & with '-and-'
        .replace(/[^ -ɏḀ-ỿⱠ-Ɀ꜠-ꟿ_]/g, '') // remove special chars
        .replace(/_/g, '_')             // replace _ with _
        .replace(/__+/g, '_');          // replace multiple _ with single _
}

// --- Save/Load Logic ---
function saveMap() {
    const mapData = {
        name: state.mapName,
        order: state.mapOrder,
        completed: false,
        relief: state.grid.map(row => row.map(cell => parseFloat(cell.relief.toFixed(3)))),
        spawnPoint: state.spawnPoint,
        flagPosition: state.flagPosition,
    };
    const filename = slugify(state.mapName) + '.json';
    const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
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
            try {
                const data = JSON.parse(event.target.result);
                let reliefGrid;
                if (Array.isArray(data)) { // Old format
                    reliefGrid = data;
                    state.spawnPoint = null;
                    state.flagPosition = null;
                    state.mapName = 'Carte importée';
                    state.mapOrder = 99;
                } else { // New format
                    reliefGrid = data.relief;
                    state.spawnPoint = data.spawnPoint || null;
                    state.flagPosition = data.flagPosition || null;
                    state.mapName = data.name || 'Carte sans nom';
                    state.mapOrder = data.order || 99;
                }

                if (!Array.isArray(reliefGrid) || !Array.isArray(reliefGrid[0])) {
                    throw new Error("Invalid map data format.");
                }
                state.grid = reliefGrid.map(row => row.map(relief => ({ relief })) );
                mapRowsInput.value = state.grid.length;
                mapColsInput.vsalue = state.grid[0].length;
                mapNameInput.value = state.mapName;
                mapOrderInput.value = state.mapOrder;
                drawGrid();
                alert("Carte chargée avec succès !");
            } catch (error) {
                alert("Erreur lors du chargement de la carte :\n" + error.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// --- Main Click/Drag Handler ---
function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - state.cameraOffset.x) / state.zoomLevel;
    const mouseY = (e.clientY - rect.top - state.cameraOffset.y) / state.zoomLevel;
    const clickedHex = pixelToOffset(mouseX, mouseY);

    if (!state.grid[clickedHex.r] || !state.grid[clickedHex.r][clickedHex.c]) return;

    switch (state.brushMode) {
        case 'paint':
        case 'raise':
        case 'lower':
            paintHexes(clickedHex);
            break;
        case 'setSpawn':
            state.spawnPoint = clickedHex;
            break;
        case 'setFlag':
            state.flagPosition = clickedHex;
            break;
    }
    drawGrid();
}

function paintHexes(centerHex) {
    const centerCube = offsetToCube(centerHex);
    const searchRadius = state.brushSize;
    const minRow = Math.max(0, centerHex.r - searchRadius);
    const maxRow = Math.min(state.grid.length - 1, centerHex.r + searchRadius);
    
    for (let r = minRow; r <= maxRow; r++) {
        const row = state.grid[r];
        if (!row) continue;
        const minCol = Math.max(0, centerHex.c - searchRadius - Math.ceil(searchRadius/2));
        const maxCol = Math.min(row.length - 1, centerHex.c + searchRadius + Math.ceil(searchRadius/2));

        for (let c = minCol; c <= maxCol; c++) {
            if (!row[c]) continue;
            const targetHex = { r, c };
            const targetCube = offsetToCube(targetHex);

            if (cubeDistance(centerCube, targetCube) < state.brushSize) {
                switch (state.brushMode) {
                    case 'paint': row[c].relief = state.altitude; break;
                    case 'raise': row[c].relief = Math.min(1, row[c].relief + state.intensity); break;
                    case 'lower': row[c].relief = Math.max(0, row[c].relief - state.intensity); break;
                }
            }
        }
    }
}

// --- Grid & Map Logic ---
function createNewGrid(rows, cols) {
    state.grid = [];
    state.spawnPoint = null;
    state.flagPosition = null;
    for (let r = 0; r < rows; r++) {
        state.grid[r] = [];
        for (let c = 0; c < cols; c++) {
            state.grid[r][c] = { relief: 0.5 };
        }
    }
    drawGrid();
}

// --- Drawing & Conversion Logic ---
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!state.grid || state.grid.length === 0) return;
    
    ctx.save();
    ctx.translate(state.cameraOffset.x, state.cameraOffset.y);
    ctx.scale(state.zoomLevel, state.zoomLevel);

    for (let r = 0; r < state.grid.length; r++) {
        for (let c = 0; c < state.grid[r].length; c++) {
            const offset = (r % 2) * (GRID_HORIZ_SPACING / 2);
            const x = c * GRID_HORIZ_SPACING + offset;
            const y = r * GRID_VERT_SPACING;
            drawHexagon(x + HEX_WIDTH / 2, y + HEX_HEIGHT / 2, state.grid[r][c].relief);
        }
    }

    // Draw Game Elements
    if (state.spawnPoint) {
        const offset = (state.spawnPoint.r % 2) * (GRID_HORIZ_SPACING / 2);
        const x = state.spawnPoint.c * GRID_HORIZ_SPACING + offset;
        const y = state.spawnPoint.r * GRID_VERT_SPACING;
        drawSpawnMarker(x + HEX_WIDTH / 2, y + HEX_HEIGHT / 2);
    }
    if (state.flagPosition) {
        const offset = (state.flagPosition.r % 2) * (GRID_HORIZ_SPACING / 2);
        const x = state.flagPosition.c * GRID_HORIZ_SPACING + offset;
        const y = state.flagPosition.r * GRID_VERT_SPACING;
        drawFlagMarker(x + HEX_WIDTH / 2, y + HEX_HEIGHT / 2);
    }

    ctx.restore();
}

function getColorForRelief(relief) {
    const colors = [
        '#4682B4', '#5F9EA0', '#9ACD32', '#6B8E23', '#556B2F', 
        '#CDA752', '#B8860B', '#A0522D', '#8B4513', '#696969', '#FFFFFF'
    ];
    const index = Math.round(relief * 10);
    return colors[index] || colors[10];
}

function drawHexagon(x, y, relief) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        ctx.lineTo(x + BASE_HEX_SIZE * Math.cos(Math.PI / 3 * i + Math.PI / 2), y + BASE_HEX_SIZE * Math.sin(Math.PI / 3 * i + Math.PI / 2));
    }
    ctx.closePath();
    ctx.fillStyle = getColorForRelief(relief);
    ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1 / state.zoomLevel;
    ctx.stroke();
}

function drawSpawnMarker(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, BASE_HEX_SIZE / 2, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 100, 255, 0.7)';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2 / state.zoomLevel;
    ctx.stroke();
}

function drawFlagMarker(x, y) {
    ctx.beginPath();
    ctx.moveTo(x, y - BASE_HEX_SIZE / 2);
    ctx.lineTo(x, y + BASE_HEX_SIZE / 2);
    ctx.lineTo(x + BASE_HEX_SIZE / 2, y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2 / state.zoomLevel;
    ctx.stroke();
}

// --- Initialization ---
window.addEventListener('load', init);