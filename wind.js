import { state } from './state.js';
import { PerlinNoise } from './perlin.js';
import { pixelToHex } from './grid.js';

export function updateWind() {
    if (!state.grid.length || !state.grid[0].length) return; // Grid not ready
    const gridCols = state.grid[0].length;
    const gridRows = state.grid.length;

    // 1. Update sources using Perlin noise
    for (let r = 0; r < gridRows; r++) {
        if (state.grid[r][gridCols - 1].isSource) {
            const noiseVal = PerlinNoise.noise(r / (state.windParams.sourceScale || 10), state.time);
            const masse = (noiseVal + 1) / 2 * (state.windParams.maxMasse || 1.2) * state.globalWindMultiplier;
            state.grid[r][gridCols - 1].wind = {
                masse: masse,
                celerite: (state.windParams.minCelerite || 0.1) + (1 - masse / (state.windParams.maxMasse || 1.2)) * ((state.windParams.maxCelerite || 1.0) - (state.windParams.minCelerite || 0.1)),
                direction: Math.PI, // From right to left
                propagationProgress: 1 // Start fully propagated
            };
        }
    }

    // 2. Propagate wind from right to left
    for (let c = gridCols - 2; c >= 0; c--) {
        for (let r = 0; r < gridRows; r++) {
            const fromCell = state.grid[r][c + 1];
            const toCell = state.grid[r][c];

            if (fromCell.wind.masse > 0) {
                let venturiEffect = 1;
                if (state.venturiEnabled) {
                    const reliefDifference = Math.abs(fromCell.relief - toCell.relief);
                    venturiEffect = 1 + reliefDifference; // Simplified Venturi
                }

                let newMasse = fromCell.wind.masse * (1 - (state.windParams.dissipation || 0.25) * toCell.relief) * venturiEffect;
                
                // Ensure masse doesn't uncontrollably increase
                newMasse = Math.min(newMasse, (state.windParams.maxMasse || 1.2) * 2); 

                toCell.wind.masse = newMasse;
                toCell.wind.celerite = fromCell.wind.celerite;
                toCell.wind.direction = fromCell.wind.direction;
            } else {
                 toCell.wind.masse *= (state.windParams.fading || 0.99); // Fade out old wind
            }
             if (toCell.wind.masse < 0.01) {
                toCell.wind.masse = 0;
            }
        }
    }
}

export function applyWindEffects() {
    state.horde.forEach(p => {
        const hexCoords = pixelToHex(p.x, p.y);
        if (hexCoords.r >= 0 && hexCoords.r < state.grid.length && hexCoords.c >= 0 && hexCoords.c < state.grid[0].length) {
            const wind = state.grid[hexCoords.r][hexCoords.c].wind;
            if (wind.masse > 0) {
                p.stamina = Math.max(0, p.stamina - wind.masse * 0.02);
            }
        }
    });
}