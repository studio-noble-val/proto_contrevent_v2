import { state } from './state.js';
import * as grid from './grid.js';
import * as horde from './horde.js';
import * as wind from './wind.js';
import * as ui from './ui.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function init() {
    grid.init(canvas, ctx);
    horde.init(canvas, ctx);
    ui.init(canvas);
    resizeCanvas();
    horde.initHorde();
    ui.updateStats();
    gameLoop();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    grid.initGrid();
}

window.addEventListener('resize', resizeCanvas);

function gameLoop() {
    if (!state.gamePaused) {
        update();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

function update() {
    state.time += 0.005;
    wind.updateWind();
    horde.moveHorde();
    horde.resolveCollisions();
    wind.applyWindEffects();
    ui.updateStats();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grid.drawGrid();
    horde.drawHorde();
    if (state.isDragging) {
        ui.drawSelectionRect();
    }
}

init();