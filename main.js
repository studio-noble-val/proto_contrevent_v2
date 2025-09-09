import { state } from './state.js';
import * as grid from './grid.js';
import * as horde from './horde.js';
import * as wind from './wind.js';
import * as ui from './ui.js';
import * as gameplay from './gameplay.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function init() {
    state.startTime = performance.now();
    grid.init(canvas, ctx);
    horde.init(canvas, ctx);
    ui.init(canvas);
    gameplay.init(canvas, ctx);
    resizeCanvas();
    horde.initHorde();
    ui.updateStats();
    gameLoop();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    grid.initGrid();
    // We need to re-init the flag position on resize
    if (gameplay.init) gameplay.init(canvas, ctx);
}

window.addEventListener('resize', resizeCanvas);

function gameLoop() {
    if (!state.gamePaused) {
        update();
    }
    draw(); // Toujours dessiner pour voir l'état final
    requestAnimationFrame(gameLoop);
}

function update() {
    state.time += 0.005;
    wind.updateWind();
    horde.moveHorde();
    horde.resolveCollisions();
    wind.applyWindEffects();
    ui.updateStats();
    ui.updateTopBar();
    gameplay.checkVictoryCondition();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grid.drawGrid();
    horde.drawHorde();
    gameplay.drawVictoryFlag();
    if (state.isDragging) {
        ui.drawSelectionRect();
    }
}

init();