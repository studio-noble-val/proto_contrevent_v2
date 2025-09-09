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

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(state.victoryFlag.x, state.victoryFlag.y);
    ctx.lineTo(state.victoryFlag.x, state.victoryFlag.y - state.victoryFlag.size * 2);
    ctx.lineTo(state.victoryFlag.x + state.victoryFlag.size, state.victoryFlag.y - state.victoryFlag.size * 1.5);
    ctx.lineTo(state.victoryFlag.x, state.victoryFlag.y - state.victoryFlag.size);
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
        return Math.sqrt(dx * dx + dy * dy) < state.victoryFlag.size * 2;
    });

    if (allMembersNearFlag) {
        state.victoryFlag.triggered = true;
        state.gamePaused = true;
        // Wait a bit before showing the alert to let the player see the last frame
        setTimeout(() => {
            alert('VICTOIRE ! Vous avez atteint l\'Extrême-Amont !');
            // here we could redirect to a victory screen or reset the game
            window.location.href = 'index.html';
        }, 100);
    }
}
