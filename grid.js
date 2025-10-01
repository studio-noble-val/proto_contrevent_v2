import { state } from './state.js';
import { HEX_WIDTH, HEX_HEIGHT, GRID_HORIZ_SPACING, GRID_VERT_SPACING, HEX_SIZE } from './constants.js';
import { PerlinNoise } from './perlin.js';
import { pixelToOffset } from './grid-utils.js';

let canvas, ctx;

export function init(canvasElement, context) {
    canvas = canvasElement;
    ctx = context;
}

export function initGrid(reliefGrid, windSources) {
    if (reliefGrid) {
        state.grid = reliefGrid.map(row => 
            row.map(relief => ({ relief, wind: { masse: 0, celerite: 0, direction: Math.PI, propagationProgress: 0 }, isSource: false }))
        );
        if (windSources && windSources.length > 0) {
            windSources.forEach(source => {
                if (state.grid[source.r] && state.grid[source.r][source.c]) {
                    state.grid[source.r][source.c].isSource = true;
                }
            });
        } else {
            // Fallback to old hardcoded sources if none provided in map
            const gridCols = state.grid[0].length;
            for (let r = 0; r < state.grid.length; r++) {
                if (r % 4 === 0) state.grid[r][gridCols - 1].isSource = true;
            }
        }
    } else {
        const gridCols = Math.ceil(canvas.width / GRID_HORIZ_SPACING) + 2;
        const gridRows = Math.ceil(canvas.height / GRID_VERT_SPACING) + 1;
        state.grid = [];
        const reliefScale = 10; // More varied terrain
        for (let r = 0; r < gridRows; r++) {
            state.grid[r] = [];
            for (let c = 0; c < gridCols; c++) {
                const relief = (PerlinNoise.noise(c / reliefScale, r / reliefScale, 0) + 1) / 2;
                state.grid[r][c] = { relief, wind: { masse: 0, celerite: 0, direction: Math.PI, propagationProgress: 0 }, isSource: false };
            }
        }
        // Default procedural sources
        for (let r = 0; r < gridRows; r++) {
            if (r % 4 === 0) state.grid[r][gridCols - 1].isSource = true;
        }
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

    // Draw Narrative POIs
    if (state.narrativePOIs) {
        state.narrativePOIs.forEach(poi => {
            if (poi.triggered) return; // Don't draw triggered POIs
            const offset = (poi.r % 2) * (HEX_WIDTH / 2);
            const x = poi.c * HEX_WIDTH + offset + HEX_WIDTH / 2;
            const y = poi.r * GRID_VERT_SPACING + HEX_HEIGHT / 2;
            drawPOIMarker(x, y, poi);
        });
    }
}

function drawPOIMarker(x, y, poi) {
    // In-game version: more subtle, no text.
    const size = HEX_SIZE / 1.5;
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#9B59B6'; // A nice purple
    ctx.fillRect(-size / 2, -size / 2, size, size);
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
