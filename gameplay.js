import { state } from './state.js';
import { HEX_SIZE } from './constants.js';

let canvas, ctx;

export function init(canvasElement, context) {
    canvas = canvasElement;
    ctx = context;
    // Initialize flag position
    state.victoryFlag = {
        x: canvas.width - HEX_SIZE * 3,
        y: canvas.height / 2,
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

        const elapsedTime = Math.round((performance.now() - state.startTime) / 1000);
        state.score = Math.max(10000 - elapsedTime * 10, 0);

        // Wait a bit before showing the alert to let the player see the last frame
        setTimeout(() => {
            alert(`VICTOIRE ! Vous avez atteint l'Extrême-Amont !\n\nTemps : ${elapsedTime}s\nScore : ${state.score}`);
            // here we could redirect to a victory screen or reset the game
            window.location.href = 'index.html';
        }, 100);
    }
}
