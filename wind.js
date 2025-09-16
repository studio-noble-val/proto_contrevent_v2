import { PerlinNoise } from './perlin.js';
import { pixelToHex } from './grid.js';

/**
 * Identifie les 3 cellules voisines en aval (direction ouest) sur une grille hexagonale "pointy-top" avec lignes impaires décalées (odd-r).
 * @param {number} r - Ligne de la cellule d'origine.
 * @param {number} c - Colonne de la cellule d'origine.
 * @param {number} gridRows - Nombre total de lignes dans la grille.
 * @param {number} gridCols - Nombre total de colonnes dans la grille.
 * @returns {Array<{r: number, c: number}>} - Un tableau de coordonnées des voisins valides.
 */
function getDownstreamNeighbors(r, c, gridRows, gridCols) {
    const neighbors = [];
    const isOddRow = r % 2 === 1;

    // Voisin Ouest (W)
    neighbors.push({ r: r, c: c - 1 });

    if (isOddRow) {
        // Voisin Nord-Ouest (NW) pour ligne impaire
        neighbors.push({ r: r - 1, c: c });
        // Voisin Sud-Ouest (SW) pour ligne impaire
        neighbors.push({ r: r + 1, c: c });
    } else { // Ligne paire
        // Voisin Nord-Ouest (NW) pour ligne paire
        neighbors.push({ r: r - 1, c: c - 1 });
        // Voisin Sud-Ouest (SW) pour ligne paire
        neighbors.push({ r: r + 1, c: c - 1 });
    }

    // Filtrer les voisins qui sont en dehors de la grille
    return neighbors.filter(n => n.r >= 0 && n.r < gridRows && n.c >= 0 && n.c < gridCols);
}


export function updateWind(state) {
    if (!state.grid.length || !state.grid[0].length) return;
    const gridCols = state.grid[0].length;
    const gridRows = state.grid.length;

    // 1. Créer une grille tampon vide pour le prochain état du vent
    const nextWindGrid = Array(gridRows).fill(null).map(() => Array(gridCols).fill(null).map(() => ({
        masse: 0,
        celerite: 0,
        direction: 0,
    })));

    // 2. Génération des bourrasques à toutes les sources actives
    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
            if (state.grid[r][c].isSource) {
                // Probabilité de générer une bourrasque pour créer un effet de paquet
                if (Math.random() > 0.6) {
                    const noiseVal = PerlinNoise.noise(r / (state.windParams.sourceScale || 10), state.time);
                    const masse = (noiseVal + 1) / 2 * (state.windParams.maxMasse || 1.2) * state.globalWindMultiplier;
                    
                    state.grid[r][c].wind = {
                        masse: masse,
                        celerite: (state.windParams.minCelerite || 0.1) + (1 - masse / (state.windParams.maxMasse || 1.2)) * ((state.windParams.maxCelerite || 1.0) - (state.windParams.minCelerite || 0.1)),
                        direction: Math.PI, // Toujours vers la gauche pour l'instant
                    };
                } else {
                    // Si pas de bourrasque, la masse est nulle
                    state.grid[r][c].wind.masse = 0;
                }
            }
        }
    }

    // 3. Propagation des bourrasques existantes
    for (let c = gridCols - 1; c >= 0; c--) {
        for (let r = 0; r < gridRows; r++) {
            const currentCell = state.grid[r][c];
            if (currentCell.wind.masse <= 0.01) continue;

            const neighbors = getDownstreamNeighbors(r, c, gridRows, gridCols);
            if (neighbors.length === 0) continue;

            const weights = neighbors.map(n => {
                const reliefCost = state.grid[n.r][n.c].relief * state.windParams.reliefPenalty;
                const randomFactor = Math.random() * state.windParams.randomness;
                return {
                    neighbor: n,
                    weight: 1 / (1 + reliefCost) + randomFactor
                };
            });

            weights.sort((a, b) => b.weight - a.weight);
            const targetNeighbor = weights[0].neighbor;

            let venturiEffect = 1;
            if (state.venturiEnabled) {
                const reliefDifference = Math.abs(currentCell.relief - state.grid[targetNeighbor.r][targetNeighbor.c].relief);
                venturiEffect = 1 + reliefDifference;
            }
            
            let newMasse = currentCell.wind.masse * venturiEffect;
            newMasse = Math.min(newMasse, (state.windParams.maxMasse || 1.2) * 2);

            const dx = targetNeighbor.c - c;
            const dy = targetNeighbor.r - r;
            const newDirection = Math.atan2(dy, dx);

            const targetCellInBuffer = nextWindGrid[targetNeighbor.r][targetNeighbor.c];
            
            // Fusionner avec le vent existant dans le tampon (si une autre bourrasque arrive au même endroit)
            if (targetCellInBuffer.masse > 0) {
                const totalMasse = targetCellInBuffer.masse + newMasse;
                const avgDir = Math.atan2(
                    targetCellInBuffer.masse * Math.sin(targetCellInBuffer.direction) + newMasse * Math.sin(newDirection),
                    targetCellInBuffer.masse * Math.cos(targetCellInBuffer.direction) + newMasse * Math.cos(newDirection)
                );
                targetCellInBuffer.direction = avgDir;
                targetCellInBuffer.masse = totalMasse;
            } else {
                targetCellInBuffer.masse = newMasse;
                targetCellInBuffer.direction = newDirection;
            }
            targetCellInBuffer.celerite = currentCell.wind.celerite;

            // --- NOUVELLE LOGIQUE : Laisser une "traînée" pour allonger la bourrasque ---
            const tailMasse = currentCell.wind.masse * 0.3; // La traînée est 30% de la masse originale
            const currentCellInBuffer = nextWindGrid[r][c];
            if (currentCellInBuffer.masse < tailMasse) { // Ne pas remplacer une bourrasque plus forte qui arriverait là
                currentCellInBuffer.masse = tailMasse;
                currentCellInBuffer.direction = currentCell.wind.direction;
                currentCellInBuffer.celerite = currentCell.wind.celerite;
            }
            // --- FIN DE LA NOUVELLE LOGIQUE ---
        }
    }

    // 4. Remplacer l'ancienne grille de vent par la nouvelle
    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
            state.grid[r][c].wind = nextWindGrid[r][c];
        }
    }
}

export function applyWindEffects(state) {
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
