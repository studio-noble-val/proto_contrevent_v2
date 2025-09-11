import { PerlinNoise } from './perlin.js';
import { state } from './state.js';
import * as grid from './grid.js';
import * as horde from './horde.js';
import * as wind from './wind.js';
import * as ui from './ui.js';
import * as gameplay from './gameplay.js';
import * as camera from './camera.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

async function loadMap(mapUrl) {
    if (!mapUrl) {
        // This is the procedural generation path
        state.grid = null; 
        state.spawnPoint = null;
        state.flagPosition = null;
        state.windSources = [];
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
            state.windSources = [];
        } else {
            state.grid = data.relief;
            state.spawnPoint = data.spawnPoint || null;
            state.flagPosition = data.flagPosition || null;
            state.windSources = data.windSources || [];
        }

    } catch (e) {
        console.error("Failed to load map:", e);
        // Create a default procedural map as a fallback
        state.grid = null; 
        state.spawnPoint = null;
        state.flagPosition = null;
        state.windSources = [];
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
        await loadMap(null); // Passing null will trigger the procedural path
    } else {
        // Default behavior: load a default map
        state.currentMap = 'default.json';
        await loadMap('maps/default.json');
    }

    // Initialize modules with loaded data
    grid.init(canvas, ctx);
    horde.init(canvas, ctx);
    ui.init(canvas);
    gameplay.init(canvas, ctx, state.flagPosition);
    camera.init(canvas, ctx);

    resizeCanvas(); // This will call initGrid, initHorde, etc.
    
    gameLoop();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Initialize systems with map data
    grid.initGrid(state.grid, state.windSources);
    horde.initHorde(state.spawnPoint);
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
    const now = performance.now();
    state.time += 0.005;

    // --- Dynamic Wind Update ---
    const tempo = state.windTempoParams;
    
    // 1. Base rhythm from a sine wave
    const sineWave = Math.sin(state.time * tempo.rhythmFrequency);
    const rhythmOffset = sineWave * tempo.rhythmAmplitude;

    // 2. Organic variation from Perlin noise
    const noise = PerlinNoise.noise(state.time * 0.1, 100); // Using a different time scale/seed for variety
    const noiseOffset = (noise * tempo.rhythmAmplitude / 2) * tempo.noiseInfluence;

    // 3. Calculate the final interval for this moment
    const currentInterval = Math.max(50, tempo.baseInterval + rhythmOffset + noiseOffset); // Clamp to a minimum interval

    // 4. Check if it's time to update the wind
    if (now - state.lastWindUpdateTime > currentInterval) {
        wind.updateWind();
        state.lastWindUpdateTime = now;
    }
    // --- End of Dynamic Wind Update ---

    horde.moveHorde();
    horde.resolveCollisions();
    wind.applyWindEffects();
    ui.updateTopBar();
    gameplay.checkVictoryCondition();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    camera.applyTransform(ctx);

    grid.drawGrid();
    horde.drawShadows();
    horde.drawHorde();
    gameplay.drawVictoryFlag();
    if (state.isDragging) {
        ui.drawSelectionRect();
    }
    ctx.restore();
}

// Mouse input for horde selection and movement
canvas.addEventListener('mousedown', e => {
    if (e.button === 0) { // Left click
        const worldCoords = camera.getTransformedCoords(e.clientX, e.clientY);
        const clickedChar = horde.getCharacterAt(worldCoords.x, worldCoords.y);
        if (clickedChar) {
            if (e.shiftKey) {
                clickedChar.isSelected = !clickedChar.isSelected;
            } else {
                state.horde.forEach(p => p.isSelected = false);
                clickedChar.isSelected = true;
            }
        }
    } else if (e.button === 2) { // Right click
        const worldCoords = camera.getTransformedCoords(e.clientX, e.clientY);
        horde.setGroupTarget(worldCoords);
    }
});





// Prevent context menu on right click
canvas.addEventListener('contextmenu', e => e.preventDefault());

init();