import { state } from './state.js';
import * as grid from './grid.js';
import * as horde from './horde.js';
import * as wind from './wind.js';
import * as ui from './ui.js';
import * as gameplay from './gameplay.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

async function loadMap(mapUrl) {
    if (!mapUrl) {
        // This is the procedural generation path
        state.grid = null; 
        state.spawnPoint = null;
        state.flagPosition = null;
        return;
    }

    try {
        const response = await fetch(mapUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Handle old and new map formats
        if (Array.isArray(data)) {
            state.grid = data;
            state.spawnPoint = null;
            state.flagPosition = null;
        } else {
            state.grid = data.relief;
            state.spawnPoint = data.spawnPoint || null;
            state.flagPosition = data.flagPosition || null;
        }

    } catch (e) {
        console.error("Failed to load map:", e);
        // Create a default procedural map as a fallback
        state.grid = null; 
        state.spawnPoint = null;
        state.flagPosition = null;
    }
}

async function init() {
    state.startTime = performance.now();
    
    const urlParams = new URLSearchParams(window.location.search);
    const mapFile = urlParams.get('map');
    const mode = urlParams.get('mode');

    if (mapFile) {
        // Campaign mode: load a specific map
        state.currentMap = mapFile;
        await loadMap(`maps/${mapFile}`);
    } else if (mode === 'survie') {
        // Survival mode: trigger procedural generation
        state.currentMap = 'procedural-survival';
        await loadMap(null); // Passing null will trigger the catch block for procedural fallback
    } else {
        // Default behavior: load a default map
        state.currentMap = 'default.json';
        await loadMap('maps/default.json');
    }

    // Initialize modules with loaded data
    grid.init(canvas, ctx);
    horde.init(canvas, ctx);
    ui.init(canvas);
    
    resizeCanvas(); // This will call initGrid, initHorde, etc.
    
    gameLoop();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Initialize systems with map data
    grid.initGrid(state.grid);
    horde.initHorde(state.spawnPoint);
    gameplay.init(canvas, ctx, state.flagPosition);
}

window.addEventListener('resize', resizeCanvas);

function gameLoop() {
    if (!state.gamePaused) {
        update();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    state.time += 0.005;
    wind.updateWind();
    horde.moveHorde();
    horde.resolveCollisions();
    wind.applyWindEffects();
    ui.updateTopBar();
    gameplay.checkVictoryCondition();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grid.drawGrid();
    horde.drawShadows();
    horde.drawHorde();
    gameplay.drawVictoryFlag();
    if (state.isDragging) {
        ui.drawSelectionRect();
    }
}

init();
