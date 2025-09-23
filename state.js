export const state = {
    grid: [],
    horde: [],
    spawnPoint: null,
    flagPosition: null,
    windSources: [],
    windGroups: [],
    currentMap: null,
    activeFormation: 'none',
    targetDestination: null,
    gamePaused: false,
    globalWindMultiplier: 1.0,
    isDragging: false,
    time: 0,
    startTime: 0,
    score: 0,
    venturiEnabled: true,
    victoryZoneSize: 2,
    windParams: {
        reliefPenalty: 1.5,
        randomness: 0.05,
    },
    selectionRect: { startX: 0, startY: 0, currentX: 0, currentY: 0 },
    lastWindUpdateTime: 0,
    windTempoParams: {
        baseInterval: 5, // ms
        rhythmFrequency: 0.1,
        rhythmAmplitude: 100, // ms
        noiseInfluence: 0.5,
    },
};