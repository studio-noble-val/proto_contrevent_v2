import { state } from './state.js';
import { HEX_WIDTH, HEX_HEIGHT, GRID_HORIZ_SPACING, GRID_VERT_SPACING, HEX_SIZE } from './constants.js';
import { PerlinNoise } from './perlin.js';
import { pixelToOffset } from './grid-utils.js';

let canvas, ctx;

export function init(canvasElement, context) {
    canvas = canvasElement;
    ctx = context;
}

export function initGrid() {
    const gridCols = Math.ceil(canvas.width / GRID_HORIZ_SPACING) + 2;
    const gridRows = Math.ceil(canvas.height / GRID_VERT_SPACING) + 1;
    state.grid = [];
    const reliefScale = 20; // Smoother terrain
    for (let r = 0; r < gridRows; r++) {
        state.grid[r] = [];
        for (let c = 0; c < gridCols; c++) {
            const relief = (PerlinNoise.noise(c / reliefScale, r / reliefScale, 0) + 1) / 2;
            state.grid[r][c] = { relief, wind: { masse: 0, celerite: 0, direction: Math.PI, propagationProgress: 0 }, isSource: false };
        }
    }
    for (let r = 0; r < gridRows; r++) {
        if (r % 4 === 0) state.grid[r][gridCols - 1].isSource = true;
    }
}

export function drawGrid() {
    for (let r = 0; r < state.grid.length; r++) {
        for (let c = 0; c < state.grid[r].length; c++) {
            const offset = (r % 2) * (HEX_WIDTH / 2);
            const x = c * HEX_WIDTH + offset + HEX_WIDTH / 2;
            const y = r * GRID_VERT_SPACING + HEX_HEIGHT / 2;
            drawHexagon(x, y, state.grid[r][c]);
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
        ctx.lineTo(x + HEX_SIZE * Math.cos(Math.PI / 3 * i + Math.PI / 2), y + HEX_SIZE * Math.sin(Math.PI / 3 * i + Math.PI / 2));
    }
    ctx.closePath();
    ctx.fillStyle = getColorForRelief(cell.relief);
    ctx.fill();
    if (cell.wind.masse > 0.02) {
        ctx.fillStyle = `rgba(255, 255, 255, ${cell.wind.masse * 0.2})`;
        ctx.fill();
        const arrowLength = HEX_SIZE * cell.wind.masse * 0.7;
        const arrowHeadSize = HEX_SIZE * 0.2;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(cell.wind.direction);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(arrowLength, 0);
        ctx.lineTo(arrowLength - arrowHeadSize, -arrowHeadSize / 2);
        ctx.moveTo(arrowLength, 0);
        ctx.lineTo(arrowLength - arrowHeadSize, arrowHeadSize / 2);
        ctx.strokeStyle = 'cyan';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }
    ctx.strokeStyle = '#222';
    ctx.stroke();
}

// This function is now imported from grid-utils.js and renamed to pixelToOffset
export { pixelToOffset as pixelToHex };
