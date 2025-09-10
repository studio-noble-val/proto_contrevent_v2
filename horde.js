import { state } from './state.js';
import { pixelToHex } from './grid.js';

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

export function initHorde() {
    const startX = canvas.width / 4;
    const startY = canvas.height / 2;
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

export function moveHorde() {
    state.horde.forEach(p => {
        const hexCoords = pixelToHex(p.x, p.y);
        let windResistance = 0;
        if (p.target && hexCoords.r >= 0 && hexCoords.r < state.grid.length && hexCoords.c >= 0 && hexCoords.c < state.grid[0].length) {
            const wind = state.grid[hexCoords.r][hexCoords.c].wind;
            if (wind.masse > 0) {
                const moveAngle = Math.atan2(p.target.y - p.y, p.target.x - p.x);
                // Strength (0-100) reduces the effect of wind mass.
                const effectiveWindMass = Math.max(0, wind.masse * (1 - p.strength / 125));
                windResistance = Math.max(0, -Math.cos(moveAngle - wind.direction)) * effectiveWindMass;
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