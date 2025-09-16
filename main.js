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
            // Wind params will use defaults
        } else {
            state.grid = data.relief;
            state.spawnPoint = data.spawnPoint || null;
            state.flagPosition = data.flagPosition || null;
            state.windSources = data.windSources || [];

            // Load wind parameters if they exist, merging with defaults
            if (data.windParams) {
                Object.assign(state.windParams, data.windParams);
            }
            if (data.windTempoParams) {
                Object.assign(state.windTempoParams, data.windTempoParams);
            }
            if (typeof data.globalWindMultiplier !== 'undefined') {
                state.globalWindMultiplier = data.globalWindMultiplier;
            }
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

    // 1. Set up canvas to full screen size BEFORE initializing modules
    resizeCanvas(); 
    
    // 2. Set up canvas and context for all modules that need it
    grid.init(canvas, ctx);
    horde.init(canvas, ctx);
    camera.init(canvas, ctx);
    ui.init(canvas);

    // 3. Determine game mode and load/create map data
    const urlParams = new URLSearchParams(window.location.search);
    const mapFile = urlParams.get('map');
    const mode = urlParams.get('mode');

    if (mapFile) {
        // --- CAMPAIGN MODE ---
        state.currentMap = mapFile;
        await loadMap(`maps/${mapFile}`);
        grid.initGrid(state.grid, state.windSources);
        horde.initHorde(state.spawnPoint);
        gameplay.init(canvas, ctx, state.flagPosition);
    } else {
        // --- SURVIVAL or DEFAULT MODE ---
        if (mode === 'survie') {
            state.currentMap = 'procedural-survival';
            await loadMap(null); // Creates a placeholder grid
        } else {
            state.currentMap = 'default.json';
            await loadMap('maps/default.json');
        }
        
        // Procedurally generate grid if no map was loaded (now uses correct canvas size)
        grid.initGrid(state.grid, state.windSources);

        // Define spawn/flag points specifically for survival mode
        if (mode === 'survie') {
            const gridRows = state.grid.length;
            const gridCols = state.grid[0].length;

            // Horde spawn: Top-left corner (Aval Nord)
            state.spawnPoint = { r: 1, c: 1 };

            // Victory flag: Bottom-right corner (Amont Sud)
            state.flagPosition = { r: gridRows - 2, c: gridCols - 2 };
        }

        horde.initHorde(state.spawnPoint); // Uses default if spawnPoint is still null
        gameplay.init(canvas, ctx, state.flagPosition); // Uses default if flagPosition is still null
    }
    
    gameLoop();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Redrawing will be handled by the game loop
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
        wind.updateWind(state);
        state.lastWindUpdateTime = now;
    }
    // --- End of Dynamic Wind Update ---

    horde.moveHorde();
    horde.resolveCollisions();
    wind.applyWindEffects(state);
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