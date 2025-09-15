import { state } from './state.js';
import { HEX_SIZE } from './constants.js';
import { offsetToPixel } from './grid-utils.js';

let canvas, ctx;

export function init(canvasElement, context, flagPosition) {
    canvas = canvasElement;
    ctx = context;

    let flagPixelPos;
    if (flagPosition) {
        flagPixelPos = offsetToPixel(flagPosition.r, flagPosition.c);
    } else {
        flagPixelPos = { x: canvas.width - HEX_SIZE * 3, y: canvas.height / 2 };
    }

    state.victoryFlag = {
        x: flagPixelPos.x,
        y: flagPixelPos.y,
        size: HEX_SIZE * 1.5,
        triggered: false
    };
}

export function drawVictoryFlag() {
    if (!state.victoryFlag) return;

    const { x, y, size } = state.victoryFlag;
    const victoryRadius = size * state.victoryZoneSize;

    ctx.save();

    // Draw the victory zone
    ctx.beginPath();
    ctx.arc(x, y, victoryRadius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 100, 255, 0.2)";
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 100, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw the flag
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - size * 2);
    ctx.lineTo(x + size, y - size * 1.5);
    ctx.lineTo(x, y - size);
    ctx.closePath();
    ctx.fillStyle = 'gold';
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
}

function setMapAsCompleted(mapFilename) {
    const progress = JSON.parse(localStorage.getItem('contrevent_progress') || '{}');
    progress[mapFilename] = true;
    localStorage.setItem('contrevent_progress', JSON.stringify(progress));
}

export function checkVictoryCondition() {
    if (!state.victoryFlag || state.victoryFlag.triggered) return;

    const allMembersNearFlag = state.horde.every(member => {
        const dx = member.x - state.victoryFlag.x;
        const dy = member.y - state.victoryFlag.y;
        return Math.sqrt(dx * dx + dy * dy) < state.victoryFlag.size * state.victoryZoneSize;
    });

    if (allMembersNearFlag) {
        state.victoryFlag.triggered = true;
        state.gamePaused = true;

        setMapAsCompleted(state.currentMap);

        const elapsedTime = Math.round((performance.now() - state.startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
        const seconds = (elapsedTime % 60).toString().padStart(2, '0');
        
        state.score = Math.max(10000 - elapsedTime * 10, 0);

        // Show victory screen
        const victoryScreen = document.getElementById('victory-screen');
        document.getElementById('victory-time').textContent = `${minutes}:${seconds}`;
        document.getElementById('victory-score').textContent = state.score;
        
        // Placeholder for narrative text
        const narrativeTexts = [
            "La 34ème Horde a bravé les courants contraires. Le Scribe Sov note notre passage.",
            "Le vent a hurlé, mais la volonté de la Horde fut plus forte. Nous avançons.",
            "Une autre étape de franchie. Les visages sont marqués par la fatigue, mais la lueur de l'Extrême-Amont nous guide."
        ];
        document.getElementById('victory-narrative').textContent = narrativeTexts[Math.floor(Math.random() * narrativeTexts.length)];

        victoryScreen.style.display = 'flex';

        const urlParams = new URLSearchParams(window.location.search);
        const isSurvivalMode = urlParams.get('mode') === 'survie';

        document.getElementById('continue-button').onclick = () => {
            if (isSurvivalMode) {
                // In survival, regenerate a new map
                window.location.href = 'game.html?mode=survie';
            } else {
                // In campaign, go back to the map list
                window.location.href = 'campaign.html';
            }
        };
        document.getElementById('main-menu-button').onclick = () => {
            // Always go back to the main index page
            window.location.href = 'index.html';
        };
    }
}
