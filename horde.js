import { state } from './state.js';
import { pixelToHex } from './grid.js';
import { offsetToPixel } from './grid-utils.js';

let canvas, ctx;

const archetypes = {
    "éclaireur": { baseSpeed: 2.0, strength: 30, endurance: 50, name: "Éclaireur" },
    "pilier": { baseSpeed: 1.2, strength: 80, endurance: 80, name: "Pilier" },
    "hordier": { baseSpeed: 1.5, strength: 50, endurance: 60, name: "Hordier" },
};

const roster = [
    "pilier", "pilier",
    "éclaireur", "éclaireur",
    "hordier", "hordier", "hordier", "hordier", "hordier", "hordier"
];

const archetypeColors = {
    "éclaireur": "#81D4FA", // Light Blue
    "pilier": "#BCAAA4", // Brownish Grey
    "hordier": "#FFB74D", // Orange
};

export function init(canvasElement, context) {
    canvas = canvasElement;
    ctx = context;
}

export function initHorde(spawnPoint) {
    let startX, startY;
    if (spawnPoint) {
        const pixelCoords = offsetToPixel(spawnPoint.r, spawnPoint.c);
        startX = pixelCoords.x;
        startY = pixelCoords.y;
    } else {
        startX = canvas.width / 4;
        startY = canvas.height / 2;
    }
    state.horde = [];
    for (let i = 0; i < 10; i++) {
        const archetypeKey = roster[i];
        const archetype = archetypes[archetypeKey];
        state.horde.push({
            id: i,
            name: `${archetype.name} ${i}`,
            archetype: archetypeKey,
            x: startX,
            y: startY + (i - 5) * 15,
            size: 10,
            baseSpeed: archetype.baseSpeed,
            currentSpeed: archetype.baseSpeed,
            strength: archetype.strength,
            endurance: archetype.endurance,
            stamina: 100, // Stamina can be linked to endurance later
            lucidity: 100,
            cohesion: 100,
            isSelected: false,
            target: null
        });
    }
}

export function drawHorde() {
    state.horde.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
        ctx.fillStyle = p.isSelected ? "yellow" : archetypeColors[p.archetype];
        ctx.fill();
        ctx.strokeStyle = "red";
        ctx.stroke();
    });
}

// NEW --- Function to draw the wind shadows
export function drawShadows() {
    state.horde.forEach(caster => {
        const hexCoords = pixelToHex(caster.x, caster.y);
        if (hexCoords.r < 0 || hexCoords.r >= state.grid.length || hexCoords.c < 0 || hexCoords.c >= state.grid[0].length) {
            return; // Character is off-grid
        }

        const wind = state.grid[hexCoords.r][hexCoords.c].wind;
        let windDirection;
        let opacityModifier = 1.0; // Full opacity for active shadow

        if (wind.masse <= 0.02) {
            // No significant wind, draw a default, more transparent shadow
            windDirection = Math.PI; // Default direction: from right to left
            opacityModifier = 0.3; // Make it more subtle
        } else {
            // Active wind, use its direction
            windDirection = wind.direction;
        }

        const shadowLength = caster.strength * 1.5;
        const shadowAngle = (caster.endurance / 100) * (Math.PI / 4);
        const protection = caster.strength / 200;

        ctx.fillStyle = `rgba(20, 20, 20, ${protection * 0.6 * opacityModifier})`;

        const p1 = { x: caster.x, y: caster.y };
        const p2 = {
            x: caster.x + shadowLength * Math.cos(windDirection - shadowAngle / 2),
            y: caster.y + shadowLength * Math.sin(windDirection - shadowAngle / 2)
        };
        const p3 = {
            x: caster.x + shadowLength * Math.cos(windDirection + shadowAngle / 2),
            y: caster.y + shadowLength * Math.sin(windDirection + shadowAngle / 2)
        };

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.fill();
    });
}


// NEW --- Helper to calculate the cumulative wind protection factor for a character
function getWindProtectionFactor(target) {
    let cumulativeProtection = 1.0; // 1.0 means no protection

    const targetHex = pixelToHex(target.x, target.y);
    if (targetHex.r < 0 || targetHex.r >= state.grid.length || targetHex.c < 0 || targetHex.c >= state.grid[0].length) {
        return 1.0;
    }

    state.horde.forEach(caster => {
        if (caster.id === target.id) return; // A character doesn't protect itself

        const casterHex = pixelToHex(caster.x, caster.y);
        if (casterHex.r < 0 || casterHex.r >= state.grid.length || casterHex.c < 0 || casterHex.c >= state.grid[0].length) {
            return;
        }
        const wind = state.grid[casterHex.r][casterHex.c].wind;
        if (wind.masse <= 0) return;

        const shadowLength = caster.strength * 1.5;
        const shadowAngle = (caster.endurance / 100) * (Math.PI / 6);
        
        const dx = target.x - caster.x;
        const dy = target.y - caster.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > shadowLength) return; // Target is too far

        const angleToTarget = Math.atan2(dy, dx);
        let angleDifference = Math.abs(wind.direction - angleToTarget);
        
        // Normalize angle difference to be within [0, PI]
        if (angleDifference > Math.PI) {
            angleDifference = 2 * Math.PI - angleDifference;
        }

        if (angleDifference <= shadowAngle / 2) {
            // Target is inside the cone
            const protectionFactor = 1 - (caster.strength / 200); // Max 50%
            cumulativeProtection *= protectionFactor;
        }
    });

    return cumulativeProtection;
}


export function moveHorde() {
    state.horde.forEach(p => {
        const hexCoords = pixelToHex(p.x, p.y);
        let windResistance = 0;
        if (p.target && hexCoords.r >= 0 && hexCoords.r < state.grid.length && hexCoords.c >= 0 && hexCoords.c < state.grid[0].length) {
            const wind = state.grid[hexCoords.r][hexCoords.c].wind;
            if (wind.masse > 0) {
                const moveAngle = Math.atan2(p.target.y - p.y, p.target.x - p.x);
                
                // Base resistance from character's own strength
                const effectiveWindMass = Math.max(0, wind.masse * (1 - p.strength / 125));
                let baseResistance = Math.max(0, -Math.cos(moveAngle - wind.direction)) * effectiveWindMass;

                // Apply protection from horde members' shadows
                const protectionFactor = getWindProtectionFactor(p);
                windResistance = baseResistance * protectionFactor;
            }
        }
        p.currentSpeed = p.baseSpeed * (1 - windResistance);
        if (p.target) {
            const dx = p.target.x - p.x;
            const dy = p.target.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < p.currentSpeed) {
                p.x = p.target.x;
                p.y = p.target.y;
                p.target = null;
            } else {
                p.x += dx / dist * p.currentSpeed;
                p.y += dy / dist * p.currentSpeed;
            }
        }
    });
}

export function resolveCollisions() {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < state.horde.length; j++) {
            for (let k = j + 1; k < state.horde.length; k++) {
                const p1 = state.horde[j];
                const p2 = state.horde[k];
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const min_dist = p1.size + p2.size;
                if (dist < min_dist) {
                    const overlap = (min_dist - dist) / 2;
                    const nx = dist === 0 ? 1 : dx / dist;
                    const ny = dist === 0 ? 0 : dy / dist;
                    p1.x -= overlap * nx;
                    p1.y -= overlap * ny;
                    p2.x += overlap * nx;
                    p2.y += overlap * ny;
                }
            }
        }
    }
}

export function setGroupTarget(destination) {
    let membersToMove = state.horde.filter(p => p.isSelected);
    if (membersToMove.length === 0) {
        membersToMove = state.horde;
    }
    const formationSpeed = getFormationSpeed(state.activeFormation);
    const formationOffsets = getFormationOffsets(state.activeFormation, membersToMove.length);
    const center = membersToMove.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    center.x /= membersToMove.length;
    center.y /= membersToMove.length;
    const angle = Math.atan2(destination.y - center.y, destination.x - center.x);
    membersToMove.forEach((p, i) => {
        const offset = formationOffsets[i];
        const rotatedX = offset.x * Math.cos(angle) - offset.y * Math.sin(angle);
        const rotatedY = offset.x * Math.sin(angle) + offset.y * Math.cos(angle);
        p.target = { x: destination.x + rotatedX, y: destination.y + rotatedY };
        p.baseSpeed = formationSpeed;
    });
}

export function applyStatChange({ stat, value, target = 'group' }) {
    const membersToAffect = target === 'group'
        ? state.horde
        : state.horde.filter(p => p.id === target);

    membersToAffect.forEach(p => {
        if (p.hasOwnProperty(stat)) {
            p[stat] = Math.max(0, Math.min(100, p[stat] + value)); // Clamp between 0 and 100
            console.log(`Stat Change: ${p.name} ${stat} is now ${p[stat]}`);
        }
    });
}

export function getCharacterAt(x, y) {
    for (let i = state.horde.length - 1; i >= 0; i--) {
        const p = state.horde[i];
        const dx = p.x - x;
        const dy = p.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < p.size) {
            return p;
        }
    }
    return null;
}

function getFormationOffsets(formation, count) {
    const offsets = [];
    let spacing = 35;
    switch (formation) {
        case "line":
            for (let i = 0; i < count; i++) {
                offsets.push({ x: -i * spacing, y: 0 });
            }
            break;
        case "turtle":
            const side = Math.ceil(Math.sqrt(count));
            for (let i = 0; i < count; i++) {
                offsets.push({ x: -(i % side) * spacing, y: -Math.floor(i / side) * spacing });
            }
            break;
        case "triangle":
            let row = 0;
            let inRow = 0;
            for (let i = 0; i < count; i++) {
                offsets.push({ x: -row * spacing, y: (inRow - row / 2) * spacing });
                inRow++;
                if (inRow > row) {
                    row++;
                    inRow = 0;
                }
            }
            break;
        default:
            for (let i = 0; i < count; i++) {
                offsets.push({ x: 0, y: 0 });
            }
            break;
    }
    return offsets;
}

function getFormationSpeed(formation) {
    switch (formation) {
        case "line":
            return 1.8;
        case "turtle":
            return 0.8;
        case "triangle":
            return 1.4;
        default:
            return 2.5;
    }
}