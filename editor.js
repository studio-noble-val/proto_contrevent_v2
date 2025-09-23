import { pixelToOffset, cubeDistance, offsetToCube } from './grid-utils.js';
import { updateWind } from './wind.js';
import { slugify } from './utils.js';

// --- Constants ---
const BASE_HEX_SIZE = 30;
const HEX_HEIGHT = 2 * BASE_HEX_SIZE;
const HEX_WIDTH = Math.sqrt(3) * BASE_HEX_SIZE;
const GRID_HORIZ_SPACING = HEX_WIDTH;
const GRID_VERT_SPACING = HEX_HEIGHT * 3 / 4;
const PAN_SPEED = 15;
const ZOOM_SPEED = 1.1;
const INTENSITY_LEVELS = [0.025, 0.05, 0.075, 0.1, 0.125];

// --- Wind Speed Slider Constants ---
const MAX_SLIDER_VALUE = 100;
const MAX_WIND_MULTIPLIER = 5.0;
const WIND_SCALE_FACTOR = MAX_WIND_MULTIPLIER / (MAX_SLIDER_VALUE * MAX_SLIDER_VALUE);

// --- Editor State ---
const state = {
    grid: [],
    brushSize: 1,
    altitude: 0.5,
    intensity: 0.05,
    isPainting: false,
    isPanning: false,
    isSelecting: false,
    selectionStart: { x: 0, y: 0 },
    selectionEnd: { x: 0, y: 0 },
    lastPanPosition: { x: 0, y: 0 },
    brushMode: 'paint',
    zoomLevel: 1,
    cameraOffset: { x: 0, y: 0 },
    spawnPoint: null,
    flagPosition: null,
    windSources: [],
    windGroups: [],
    selectedWindSources: [],
    mapName: 'Nouvelle Carte',
    mapOrder: 1,
    isSimulating: false,
    simulationFrameId: null,
    time: 0,
    globalWindMultiplier: 1.0,
    currentEditingSource: null,
    // Default wind parameters (will be configurable later)
    windParams: {
        sourceScale: 10,
        maxMasse: 1.2,
        minCelerite: 0.1,
        maxCelerite: 1.0,
        reliefPenalty: 2.0,
        randomness: 0.2,
        venturiEnabled: true, // Match game state
    },
    windTempoParams: {
        baseInterval: 5,
        rhythmFrequency: 0.1,
        rhythmAmplitude: 100,
        noiseInfluence: 0.5,
    },
};

// --- DOM Elements ---
let canvas, ctx, brushSizeInput, altitudeInput, intensityInput, toolButtons, paintToolOptionsPanel, sculptToolOptionsPanel, mapRowsInput, mapColsInput, editorSidebar, panelHeader, mapNameInput, mapOrderInput, canvasContainer, saveButton, loadFileButton, resizeButton, backToMenuButton, startSimButton, stopSimButton, resetSimButton, createGroupButton, groupSelect, deleteGroupButton, addToGroupButton, removeFromGroupButton, groupSyncModeSelect, deleteSourceButton, windSourceModal, modalCloseButton, modalSaveButton;

// --- Initialization ---
function init() {
    // Get DOM elements
    canvasContainer = document.getElementById('canvas-container');
    canvas = document.getElementById('editor-canvas');
    ctx = canvas.getContext('2d');
    brushSizeInput = document.getElementById('brush-size');
    altitudeInput = document.getElementById('altitude-value');
    intensityInput = document.getElementById('intensity-value');
    toolButtons = document.querySelectorAll('.tool-button');
    paintToolOptionsPanel = document.getElementById('paint-tool-options');
    sculptToolOptionsPanel = document.getElementById('sculpt-tool-options');
    mapRowsInput = document.getElementById('map-rows');
    mapColsInput = document.getElementById('map-cols');
    editorSidebar = document.getElementById('editor-sidebar');
    panelHeader = document.getElementById('panel-header');
    mapNameInput = document.getElementById('map-name');
    mapOrderInput = document.getElementById('map-order');
    resizeButton = document.getElementById('resize-button');
    saveButton = document.getElementById('save-button');
    loadFileButton = document.getElementById('load-file-button');
    backToMenuButton = document.getElementById('back-to-menu');
    startSimButton = document.getElementById('start-sim-button');
    stopSimButton = document.getElementById('stop-sim-button');
    resetSimButton = document.getElementById('reset-sim-button');
    createGroupButton = document.getElementById('create-group-button');
    groupSelect = document.getElementById('group-select');
    deleteGroupButton = document.getElementById('delete-group-button');
    addToGroupButton = document.getElementById('add-to-group-button');
    removeFromGroupButton = document.getElementById('remove-from-group-button');
    groupSyncModeSelect = document.getElementById('group-sync-mode');
    deleteSourceButton = document.getElementById('delete-source-button');
    windSourceModal = document.getElementById('wind-source-modal');
    modalCloseButton = document.getElementById('modal-close-button');
    modalSaveButton = document.getElementById('modal-save-button');

    state.intensity = INTENSITY_LEVELS[intensityInput.value];
    state.mapName = mapNameInput.value;
    state.mapOrder = parseInt(mapOrderInput.value, 10);

    resizeCanvas();
    createNewGrid(parseInt(mapRowsInput.value, 10), parseInt(mapColsInput.value, 10));
    setupEventListeners();
    updateGroupUI();
}

function resizeCanvas() {
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;
    focusOnGrid(); // Re-center and zoom when window resizes
    drawGrid();
}

function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function getTransformedMousePos(evt) {
    const mousePos = getMousePos(evt);
    return {
        x: (mousePos.x - state.cameraOffset.x) / state.zoomLevel,
        y: (mousePos.y - state.cameraOffset.y) / state.zoomLevel
    };
}

// --- UI Update Handlers ---
function updateWindMultiplier(sliderValue) {
    const value = parseFloat(sliderValue);
    state.globalWindMultiplier = WIND_SCALE_FACTOR * value * value;
    const windValueSpan = document.getElementById('masterGainValue');
    if (windValueSpan) {
        windValueSpan.textContent = state.globalWindMultiplier.toFixed(2);
    }
}

function updateControlsFromState() {
    const masterGainSlider = document.getElementById('masterGainSlider');
    if (masterGainSlider) {
        const sliderValue = Math.sqrt(state.globalWindMultiplier / WIND_SCALE_FACTOR);
        masterGainSlider.value = sliderValue;
        updateWindMultiplier(sliderValue);
    }
}

// --- Modal Functions ---
function openWindSourceModal(source) {
    state.currentEditingSource = source;
    state.selectedWindSources = [source]; // Also select it visually

    // --- Populate UI from source data ---
    const { windParams, windTempoParams, gain } = source;

    // Helper to set slider and its corresponding text value
    const setSliderValue = (id, value) => {
        const slider = document.getElementById(id);
        const valueSpan = document.getElementById(`${id}Value`);
        if (slider) slider.value = value;
        if (valueSpan) valueSpan.textContent = parseFloat(value).toFixed(id.includes('Frequency') || id.includes('Randomness') || id.includes('Influence') ? 2 : (id.includes('Masse') || id.includes('Penalty') ? 1 : 0));
    };

    // Set values for all controls in the modal
    setSliderValue('trackGainSlider', gain);
    setSliderValue('windSourceScaleSlider', windParams.sourceScale);
    setSliderValue('maxMasseSlider', windParams.maxMasse);
    setSliderValue('reliefPenaltySlider', windParams.reliefPenalty);
    setSliderValue('randomnessSlider', windParams.randomness);
    setSliderValue('baseIntervalSlider', windTempoParams.baseInterval);
    setSliderValue('rhythmFrequencySlider', windTempoParams.rhythmFrequency);
    setSliderValue('rhythmAmplitudeSlider', windTempoParams.rhythmAmplitude);
    setSliderValue('noiseInfluenceSlider', windTempoParams.noiseInfluence);

    const venturiCheckbox = document.getElementById('venturiEffectCheckbox');
    if (venturiCheckbox) {
        venturiCheckbox.checked = windParams.venturiEnabled;
    }

    // Show the modal
    windSourceModal.style.display = 'block';
    drawGrid(); // Redraw to show selection
}

function closeWindSourceModal() {
    windSourceModal.style.display = 'none';
    state.currentEditingSource = null;
    state.selectedWindSources = []; // Deselect when closing
    drawGrid(); // Redraw to remove selection highlight
}

function saveModalChanges() {
    if (!state.currentEditingSource) return;

    const source = state.currentEditingSource;

    // Helper to get value from a slider
    const getSliderValue = (id, isFloat = true) => {
        const slider = document.getElementById(id);
        return isFloat ? parseFloat(slider.value) : parseInt(slider.value, 10);
    };

    // Update source properties from modal inputs
    source.gain = getSliderValue('trackGainSlider');
    source.windParams.sourceScale = getSliderValue('windSourceScaleSlider', false);
    source.windParams.maxMasse = getSliderValue('maxMasseSlider');
    source.windParams.reliefPenalty = getSliderValue('reliefPenaltySlider');
    source.windParams.randomness = getSliderValue('randomnessSlider');
    source.windTempoParams.baseInterval = getSliderValue('baseIntervalSlider', false);
    source.windTempoParams.rhythmFrequency = getSliderValue('rhythmFrequencySlider');
    source.windTempoParams.rhythmAmplitude = getSliderValue('rhythmAmplitudeSlider', false);
    source.windTempoParams.noiseInfluence = getSliderValue('noiseInfluenceSlider');

    const venturiCheckbox = document.getElementById('venturiEffectCheckbox');
    if (venturiCheckbox) {
        source.windParams.venturiEnabled = venturiCheckbox.checked;
    }

    closeWindSourceModal();
}

function setupEventListeners() {
    // Toolbar listeners
    mapNameInput.addEventListener('change', e => state.mapName = e.target.value);
    mapOrderInput.addEventListener('change', e => state.mapOrder = parseInt(e.target.value, 10));
    brushSizeInput.addEventListener('change', e => state.brushSize = parseInt(e.target.value, 10));
    altitudeInput.addEventListener('input', e => state.altitude = parseFloat(e.target.value));
    intensityInput.addEventListener('input', e => state.intensity = INTENSITY_LEVELS[e.target.value]);
    backToMenuButton.addEventListener('click', () => window.location.href = 'index.html');

    // Tool selection
    toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            toolButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            state.brushMode = button.dataset.tool;
            paintToolOptionsPanel.style.display = state.brushMode === 'paint' ? 'block' : 'none';
            sculptToolOptionsPanel.style.display = ['raise', 'lower'].includes(state.brushMode) ? 'block' : 'none';
        });
    });

    // Map management
    resizeButton.addEventListener('click', () => {
        const rows = parseInt(mapRowsInput.value, 10);
        const cols = parseInt(mapColsInput.value, 10);
        if (rows && cols) createNewGrid(rows, cols);
    });
    saveButton.addEventListener('click', saveMap);
    loadFileButton.addEventListener('click', loadMapFromFile);
    deleteSourceButton.addEventListener('click', deleteSelectedSources);

    // Mouse listeners for canvas
    canvas.addEventListener('mousedown', e => {
        if (e.target !== canvas) return;
        const mousePos = getMousePos(e);
        if (e.button === 1) { // Middle mouse
            state.isPanning = true;
            state.lastPanPosition = { x: e.clientX, y: e.clientY };
        } else if (e.button === 0) { // Left mouse
            if (state.brushMode === 'select') {
                state.isSelecting = true;
                state.selectionStart = mousePos;
                state.selectionEnd = mousePos;
            } else if (['paint', 'raise', 'lower'].includes(state.brushMode)) {
                state.isPainting = true;
            }
            handleCanvasClick(e);
        }
    });

    window.addEventListener('mouseup', e => {
        if (state.isSelecting) {
            state.isSelecting = false;
            selectSourcesInRect(e.shiftKey);
            drawGrid();
        }
        state.isPainting = false;
        state.isPanning = false;
    });

    window.addEventListener('mousemove', e => {
        const mousePos = getMousePos(e);
        if (state.isPanning) {
            const dx = e.clientX - state.lastPanPosition.x;
            const dy = e.clientY - state.lastPanPosition.y;
            state.cameraOffset.x += dx;
            state.cameraOffset.y += dy;
            state.lastPanPosition = { x: e.clientX, y: e.clientY };
            drawGrid();
        } else if (state.isPainting) {
            handleCanvasClick(e);
        } else if (state.isSelecting) {
            state.selectionEnd = mousePos;
            drawGrid();
        }
    });

    canvas.addEventListener('mouseleave', () => {
        state.isPainting = false;
        state.isPanning = false;
        state.isSelecting = false;
    });

    // Zoom listener
    canvas.addEventListener('wheel', e => {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? ZOOM_SPEED : 1 / ZOOM_SPEED;
        state.zoomLevel = Math.max(0.2, Math.min(state.zoomLevel * zoomFactor, 5));
        drawGrid();
    });

    // Keyboard listeners
    window.addEventListener('keydown', e => {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
            return; // Ignore shortcuts if typing in an input field
        }

        let handled = true;
        switch(e.key) { // Use e.key directly for PageUp/PageDown
            case 'ArrowUp':    state.cameraOffset.y += PAN_SPEED; break;
            case 'ArrowDown':  state.cameraOffset.y -= PAN_SPEED; break;
            case 'ArrowLeft':  state.cameraOffset.x += PAN_SPEED; break;
            case 'ArrowRight': state.cameraOffset.x -= PAN_SPEED; break;
            case 'PageUp':     state.zoomLevel = Math.min(5, state.zoomLevel * ZOOM_SPEED); break;
            case 'PageDown':   state.zoomLevel = Math.max(0.2, state.zoomLevel / ZOOM_SPEED); break;
            default:
                handled = false;
                return; // Exit if not a handled key
        }

        if (handled) {
            e.preventDefault();
            drawGrid();
        }
    });

    window.addEventListener('resize', resizeCanvas);

    // --- Group Management ---
    createGroupButton.addEventListener('click', createGroup);
    deleteGroupButton.addEventListener('click', deleteGroup);
    addToGroupButton.addEventListener('click', addSourceToGroup);
    removeFromGroupButton.addEventListener('click', removeSourceFromGroup);
    groupSyncModeSelect.addEventListener('change', updateGroupSyncMode);
    groupSelect.addEventListener('change', () => {
        const group = getSelectedGroup();
        if (group) {
            groupSyncModeSelect.value = group.syncMode;
        }
    });

    // --- Simulation Controls ---
    startSimButton.addEventListener('click', startSimulation);
    stopSimButton.addEventListener('click', stopSimulation);
    resetSimButton.addEventListener('click', resetSimulation);

    // --- Modal Controls ---
    modalCloseButton.addEventListener('click', closeWindSourceModal);
    modalSaveButton.addEventListener('click', saveModalChanges);

    // --- Special Handlers for non-standard sliders/checkboxes ---
    const masterGainSlider = document.getElementById('masterGainSlider');
    masterGainSlider.addEventListener('input', e => {
        updateWindMultiplier(e.target.value);
    });

    // Set initial values from state
    updateControlsFromState();
    updateGroupUI();
}

// --- Group Management ---
function updateGroupUI() {
    groupSelect.innerHTML = '';
    state.windGroups.forEach(group => {
        const option = document.createElement('option');
        option.value = group.id;
        option.textContent = group.name;
        groupSelect.appendChild(option);
    });

    const selectedGroup = getSelectedGroup();
    if (selectedGroup) {
        groupSyncModeSelect.value = selectedGroup.syncMode;
    }
}

function getSelectedGroup() {
    const selectedGroupId = parseInt(groupSelect.value, 10);
    return state.windGroups.find(g => g.id === selectedGroupId);
}

function createGroup() {
    const groupName = prompt("Entrez le nom du groupe:", `Groupe ${state.windGroups.length + 1}`);
    if (groupName) {
        const newGroup = {
            id: Date.now(),
            name: groupName,
            syncMode: 'simultaneous',
            sourceIds: []
        };
        state.windGroups.push(newGroup);
        updateGroupUI();
        groupSelect.value = newGroup.id;
    }
}

function deleteGroup() {
    const selectedGroup = getSelectedGroup();
    if (selectedGroup && confirm(`Voulez-vous vraiment supprimer le groupe "${selectedGroup.name}" ?`)) {
        state.windGroups = state.windGroups.filter(g => g.id !== selectedGroup.id);
        updateGroupUI();
    }
}

function addSourceToGroup() {
    const selectedGroup = getSelectedGroup();
    if (selectedGroup && state.selectedWindSources.length > 0) {
        state.selectedWindSources.forEach(source => {
            // Ensure source is not already in another group
            removeSourceFromAllGroups(source.id);
            selectedGroup.sourceIds.push(source.id);
        });
        drawGrid(); // Redraw to show new group color
    }
}

function removeSourceFromGroup() {
    if (state.selectedWindSources.length > 0) {
        state.selectedWindSources.forEach(source => {
            removeSourceFromAllGroups(source.id);
        });
        drawGrid(); // Redraw to show new group color
    }
}

function removeSourceFromAllGroups(sourceId) {
    state.windGroups.forEach(group => {
        group.sourceIds = group.sourceIds.filter(id => id !== sourceId);
    });
}

function updateGroupSyncMode() {
    const selectedGroup = getSelectedGroup();
    if (selectedGroup) {
        selectedGroup.syncMode = groupSyncModeSelect.value;
    }
}

function deleteSelectedSources() {
    if (state.selectedWindSources.length > 0 && confirm("Voulez-vous vraiment supprimer les sources sélectionnées ?")) {
        state.selectedWindSources.forEach(source => {
            const index = state.windSources.findIndex(s => s.id === source.id);
            if (index !== -1) {
                state.windSources.splice(index, 1);
            }
            removeSourceFromAllGroups(source.id);
        });
        state.selectedWindSources = [];
        drawGrid();
    }
}

// --- Simulation Logic ---
function startSimulation() {
    if (state.isSimulating) return;
    state.isSimulating = true;
    simulationLoop();
}

function stopSimulation() {
    state.isSimulating = false;
    if (state.simulationFrameId) {
        cancelAnimationFrame(state.simulationFrameId);
        state.simulationFrameId = null;
    }
}

function resetSimulation() {
    stopSimulation();
    // Clear wind data from the grid
    for (let r = 0; r < state.grid.length; r++) {
        for (let c = 0; c < state.grid[r].length; c++) {
            state.grid[r][c].wind = { masse: 0, celerite: 0, direction: 0 };
        }
    }
    // Redraw the grid to show the cleared state
    drawGrid();
}

function simulationLoop() {
    if (!state.isSimulating) return;

    // Update time for wind simulation
    state.time += 0.016; // A simplified time progression, closer to 60fps

    // Update wind by passing the necessary parts of the state
    updateWind(state);

    // Redraw the grid to show changes
    drawGrid();

    state.simulationFrameId = requestAnimationFrame(simulationLoop);
}



// --- Save/Load Logic ---
function saveMap() {
    const mapData = {
        name: state.mapName,
        order: parseInt(state.mapOrder, 10),
        completed: false,
        relief: state.grid.map(row => row.map(cell => parseFloat(cell.relief.toFixed(3)))),
        spawnPoint: state.spawnPoint,
        flagPosition: state.flagPosition,
        windSources: state.windSources,
        windGroups: state.windGroups,
        globalWindMultiplier: state.globalWindMultiplier,
    };
    const filename = slugify(state.mapName) + '.json';
    const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function loadMapFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = event => {
            try {
                const data = JSON.parse(event.target.result);
                let reliefGrid;

                // Reset state for new map, keeping defaults
                const defaultState = {
                    spawnPoint: null,
                    flagPosition: null,
                    windSources: [],
                    selectedWindSources: [],
                    mapName: 'Nouvelle Carte',
                    mapOrder: 99,
                    windParams: { sourceScale: 10, maxMasse: 1.2, minCelerite: 0.1, maxCelerite: 1.0, reliefPenalty: 2.0, randomness: 0.2, venturiEnabled: true },
                    windTempoParams: { baseInterval: 5, rhythmFrequency: 0.1, rhythmAmplitude: 100, noiseInfluence: 0.5 },
                    globalWindMultiplier: 1.0,
                };

                if (Array.isArray(data)) { // Very old format (relief only)
                    reliefGrid = data;
                    Object.assign(state, defaultState);
                    state.mapName = 'Carte importée (ancien format)';
                } else { // New format
                    reliefGrid = data.relief;
                    // Load all properties, using defaults for any that are missing
                    state.spawnPoint = data.spawnPoint || defaultState.spawnPoint;
                    state.flagPosition = data.flagPosition || defaultState.flagPosition;
                    state.mapName = data.name || defaultState.mapName;
                    state.mapOrder = data.order || defaultState.mapOrder;
                    state.globalWindMultiplier = data.globalWindMultiplier !== undefined ? data.globalWindMultiplier : defaultState.globalWindMultiplier;
                    state.selectedWindSources = []; // Always reset selection

                    // --- Wind Sources and Parameters Loading ---
                    state.windSources = data.windSources || [];
                    state.windGroups = data.windGroups || [];

                    // Backward compatibility for maps with global windParams or missing gain/id
                    state.windSources.forEach((source, index) => {
                        if (data.windParams && !source.windParams) {
                            source.windParams = JSON.parse(JSON.stringify(data.windParams));
                        }
                        if (data.windTempoParams && !source.windTempoParams) {
                            source.windTempoParams = JSON.parse(JSON.stringify(data.windTempoParams));
                        }
                        if (source.gain === undefined) {
                            source.gain = 1.0;
                        }
                        if (source.id === undefined) {
                            source.id = Date.now() + index; // Simple unique ID
                        }
                    });
                    
                    // Set the global default params from the first source if available, otherwise from saved global or absolute default
                    if (state.windSources.length > 0) {
                        Object.assign(state.windParams, state.windSources[0].windParams);
                        Object.assign(state.windTempoParams, state.windSources[0].windTempoParams);
                    } else if (data.windParams) {
                         Object.assign(state.windParams, data.windParams);
                         Object.assign(state.windTempoParams, data.windTempoParams || defaultState.windTempoParams);
                    } else {
                        state.windParams = defaultState.windParams;
                        state.windTempoParams = defaultState.windTempoParams;
                    }
                }

                if (!Array.isArray(reliefGrid) || !Array.isArray(reliefGrid[0])) {
                    throw new Error("Invalid map data format.");
                }
                state.grid = reliefGrid.map(row => row.map(relief => ({ relief, wind: { masse: 0, celerite: 0, direction: 0 }, isSource: false })) );
                
                if (state.windSources && state.windSources.length > 0) {
                    state.windSources.forEach(source => {
                        if (state.grid[source.r] && state.grid[source.r][source.c]) {
                            state.grid[source.r][source.c].isSource = true;
                        }
                    });
                }

                mapRowsInput.value = state.grid.length;
                mapColsInput.value = state.grid[0].length;
                mapNameInput.value = state.mapName;
                mapOrderInput.value = state.mapOrder;
                
                updateControlsFromState();
                updateGroupUI();

                focusOnGrid();
                drawGrid();
                alert("Carte chargée avec succès !");
            } catch (error) {
                alert("Erreur lors du chargement de la carte :\n" + error.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// --- Main Click/Drag Handler ---
function handleCanvasClick(e) {
    const transformedPos = getTransformedMousePos(e);
    const clickedHex = pixelToOffset(transformedPos.x, transformedPos.y);

    if (!state.grid[clickedHex.r] || !state.grid[clickedHex.r][clickedHex.c]) return;

    switch (state.brushMode) {
        case 'paint':
        case 'raise':
        case 'lower':
            paintHexes(clickedHex);
            break;
        case 'setSpawn':
            state.spawnPoint = clickedHex;
            break;
        case 'setFlag':
            state.flagPosition = clickedHex;
            break;
        case 'setWindSource':
            const existingSource = state.windSources.find(s => s.r === clickedHex.r && s.c === clickedHex.c);
            
            if (existingSource) {
                // If a source exists, open the modal to edit it.
                openWindSourceModal(existingSource);
            } else {
                // If no source exists, create a new one and open the modal.
                const newSource = {
                    id: Date.now(), // Simple unique ID
                    r: clickedHex.r,
                    c: clickedHex.c,
                    gain: 1.0,
                    windParams: JSON.parse(JSON.stringify(state.windParams)), // Deep copy of defaults
                    windTempoParams: JSON.parse(JSON.stringify(state.windTempoParams))
                };
                state.windSources.push(newSource);
                state.grid[clickedHex.r][clickedHex.c].isSource = true;
                openWindSourceModal(newSource);
            }
            break;
        case 'moveWindSource':
            if (state.selectedWindSources.length === 1) {
                const sourceToMove = state.selectedWindSources[0];
                const oldPos = { r: sourceToMove.r, c: sourceToMove.c };
                state.grid[oldPos.r][oldPos.c].isSource = false;
                
                sourceToMove.r = clickedHex.r;
                sourceToMove.c = clickedHex.c;
                state.grid[clickedHex.r][clickedHex.c].isSource = true;
                state.selectedWindSources = []; // Deselect after moving
            } else if (state.selectedWindSources.length === 0) {
                const sourceToMoveIndex = state.windSources.findIndex(s => s.r === clickedHex.r && s.c === clickedHex.c);
                if (sourceToMoveIndex !== -1) {
                    state.selectedWindSources = [state.windSources[sourceToMoveIndex]];
                }
            }
            break;
    }
    drawGrid();
}

function selectSourcesInRect(isShift) {
    const rect = {
        x1: Math.min(state.selectionStart.x, state.selectionEnd.x),
        y1: Math.min(state.selectionStart.y, state.selectionEnd.y),
        x2: Math.max(state.selectionStart.x, state.selectionEnd.x),
        y2: Math.max(state.selectionStart.y, state.selectionEnd.y),
    };

    const sourcesInRect = state.windSources.filter(source => {
        const offset = (source.r % 2) * (GRID_HORIZ_SPACING / 2);
        const x = source.c * GRID_HORIZ_SPACING + offset + HEX_WIDTH / 2;
        const y = source.r * GRID_VERT_SPACING + HEX_HEIGHT / 2;
        
        const screenX = x * state.zoomLevel + state.cameraOffset.x;
        const screenY = y * state.zoomLevel + state.cameraOffset.y;

        return screenX >= rect.x1 && screenX <= rect.x2 && screenY >= rect.y1 && screenY <= rect.y2;
    });

    if (isShift) {
        sourcesInRect.forEach(source => {
            if (!state.selectedWindSources.some(s => s.id === source.id)) {
                state.selectedWindSources.push(source);
            }
        });
    } else {
        state.selectedWindSources = sourcesInRect;
    }
    updateControlsFromState();
}


function paintHexes(centerHex) {
    const centerCube = offsetToCube(centerHex);
    const searchRadius = state.brushSize;
    const minRow = Math.max(0, centerHex.r - searchRadius);
    const maxRow = Math.min(state.grid.length - 1, centerHex.r + searchRadius);
    
    for (let r = minRow; r <= maxRow; r++) {
        const row = state.grid[r];
        if (!row) continue;
        const minCol = Math.max(0, centerHex.c - searchRadius - Math.ceil(searchRadius/2));
        const maxCol = Math.min(row.length - 1, centerHex.c + searchRadius + Math.ceil(searchRadius/2));

        for (let c = minCol; c <= maxCol; c++) {
            if (!row[c]) continue;
            const targetHex = { r, c };
            const targetCube = offsetToCube(targetHex);

            if (cubeDistance(centerCube, targetCube) < state.brushSize) {
                switch (state.brushMode) {
                    case 'paint': row[c].relief = state.altitude; break;
                    case 'raise': row[c].relief = Math.min(1, row[c].relief + state.intensity); break;
                    case 'lower': row[c].relief = Math.max(0, row[c].relief - state.intensity); break;
                }
            }
        }
    }
}

// --- Grid & Map Logic ---
function createNewGrid(rows, cols) {
    state.grid = [];
    state.spawnPoint = null;
    state.flagPosition = null;
    state.windSources = [];
    for (let r = 0; r < rows; r++) {
        state.grid[r] = [];
        for (let c = 0; c < cols; c++) {
            state.grid[r][c] = { relief: 0.5, wind: { masse: 0, celerite: 0, direction: 0 }, isSource: false };
        }
    }
    focusOnGrid(); // Center and zoom on the new grid
    drawGrid();
}

function focusOnGrid() {
    if (!state.grid || state.grid.length === 0 || !state.grid[0]) return;

    const gridCols = state.grid[0].length;
    const gridRows = state.grid.length;

    // Calculate the total pixel dimensions of the grid
    const gridPixelWidth = gridCols * GRID_HORIZ_SPACING + (GRID_HORIZ_SPACING / 2);
    const gridPixelHeight = gridRows * GRID_VERT_SPACING + (GRID_VERT_SPACING / 3);

    // Calculate the zoom level needed to fit the grid, with a 10% margin
    const zoomX = canvas.width / gridPixelWidth;
    const zoomY = canvas.height / gridPixelHeight;
    state.zoomLevel = Math.min(zoomX, zoomY) * 0.9;

    // Center the grid
    const centeredGridWidth = gridPixelWidth * state.zoomLevel;
    const centeredGridHeight = gridPixelHeight * state.zoomLevel;
    state.cameraOffset.x = (canvas.width - centeredGridWidth) / 2;
    state.cameraOffset.y = (canvas.height - centeredGridHeight) / 2;
}

// --- Drawing & Conversion Logic ---
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!state.grid || state.grid.length === 0) return;
    
    ctx.save();
    ctx.translate(state.cameraOffset.x, state.cameraOffset.y);
    ctx.scale(state.zoomLevel, state.zoomLevel);

    for (let r = 0; r < state.grid.length; r++) {
        for (let c = 0; c < state.grid[r].length; c++) {
            const offset = (r % 2) * (GRID_HORIZ_SPACING / 2);
            const x = c * GRID_HORIZ_SPACING + offset;
            const y = r * GRID_VERT_SPACING;
            drawHexagon(x + HEX_WIDTH / 2, y + HEX_HEIGHT / 2, state.grid[r][c]);
        }
    }

    // Draw Game Elements
    if (state.spawnPoint) {
        const offset = (state.spawnPoint.r % 2) * (GRID_HORIZ_SPACING / 2);
        const x = state.spawnPoint.c * GRID_HORIZ_SPACING + offset;
        const y = state.spawnPoint.r * GRID_VERT_SPACING;
        drawSpawnMarker(x + HEX_WIDTH / 2, y + HEX_HEIGHT / 2);
    }
    if (state.flagPosition) {
        const offset = (state.flagPosition.r % 2) * (GRID_HORIZ_SPACING / 2);
        const x = state.flagPosition.c * GRID_HORIZ_SPACING + offset;
        const y = state.flagPosition.r * GRID_VERT_SPACING;
        drawFlagMarker(x + HEX_WIDTH / 2, y + HEX_HEIGHT / 2);
    }
    state.windSources.forEach(source => {
        const offset = (source.r % 2) * (GRID_HORIZ_SPACING / 2);
        const x = source.c * GRID_HORIZ_SPACING + offset;
        const y = source.r * GRID_VERT_SPACING;
        drawWindSourceMarker(x + HEX_WIDTH / 2, y + HEX_HEIGHT / 2, source);
    });

    ctx.restore();

    // Draw selection rectangle on top of everything
    if (state.isSelecting) {
        ctx.fillStyle = 'rgba(0, 100, 255, 0.2)';
        ctx.strokeStyle = 'rgba(0, 100, 255, 0.8)';
        ctx.lineWidth = 1;
        const rect = {
            x: state.selectionStart.x,
            y: state.selectionStart.y,
            w: state.selectionEnd.x - state.selectionStart.x,
            h: state.selectionEnd.y - state.selectionStart.y,
        };
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }
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
        ctx.lineTo(x + BASE_HEX_SIZE * Math.cos(Math.PI / 3 * i + Math.PI / 2), y + BASE_HEX_SIZE * Math.sin(Math.PI / 3 * i + Math.PI / 2));
    }
    ctx.closePath();
    ctx.fillStyle = getColorForRelief(cell.relief);
    ctx.fill();

    // --- Add wind visualization ---
    if (cell.wind && cell.wind.masse > 0.02) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(cell.wind.masse * 0.2, 0.8)})`;
        ctx.fill();
    }
    // --- End of wind visualization ---

    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1 / state.zoomLevel;
    ctx.stroke();
}

function drawSpawnMarker(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, BASE_HEX_SIZE / 2, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 100, 255, 0.7)';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2 / state.zoomLevel;
    ctx.stroke();
}

function drawFlagMarker(x, y) {
    ctx.beginPath();
    ctx.moveTo(x, y - BASE_HEX_SIZE / 2);
    ctx.lineTo(x, y + BASE_HEX_SIZE / 2);
    ctx.lineTo(x + BASE_HEX_SIZE / 2, y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2 / state.zoomLevel;
    ctx.stroke();
}

function drawWindSourceMarker(x, y, source) {
    const isSelected = state.selectedWindSources.some(s => s.id === source.id);
    const isMoveMode = state.brushMode === 'moveWindSource';

    // Find which group the source belongs to
    const group = state.windGroups.find(g => g.sourceIds.includes(source.id));
    const groupColor = group ? getGroupColor(group.id) : null;

    // Pulsating animation for selected source
    const pulse = isSelected ? Math.sin(state.time * 5) * 0.1 + 0.9 : 1;
    let radius = (isSelected ? BASE_HEX_SIZE / 2 : BASE_HEX_SIZE / 3) * pulse;
    let fillColor = isSelected ? 'rgba(255, 100, 0, 1)' : 'rgba(255, 255, 0, 0.7)'; // Bright orange if selected, else yellow
    let strokeColor = groupColor || (isSelected ? '#000000' : '#FFFFFF');
    let lineWidth = (isSelected || groupColor) ? 3 : 1.5 / state.zoomLevel;

    if (isSelected && isMoveMode) {
        fillColor = 'rgba(0, 255, 0, 1)'; // Green when ready to move
    }

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Draw an arrow to indicate wind direction (right to left)
    const arrowLength = BASE_HEX_SIZE / 2;
    const arrowHeadSize = BASE_HEX_SIZE / 8;
    ctx.beginPath();
    ctx.moveTo(x + arrowLength / 2, y);
    ctx.lineTo(x - arrowLength / 2, y);
    ctx.lineTo(x - arrowLength / 2 + arrowHeadSize, y - arrowHeadSize);
    ctx.moveTo(x - arrowLength / 2, y);
    ctx.lineTo(x - arrowLength / 2 + arrowHeadSize, y + arrowHeadSize);
    ctx.strokeStyle = isSelected ? '#000000' : '#FFFFFF';
    ctx.lineWidth = (isSelected ? 2 : 1.5) / state.zoomLevel;
    ctx.stroke();
}

function getGroupColor(groupId) {
    const i = state.windGroups.findIndex(g => g.id === groupId);
    if (i === -1) return null;
    const hue = (i * 137.5) % 360; // Golden angle for distinct colors
    return `hsl(${hue}, 70%, 50%)`;
}

// --- Initialization ---
window.addEventListener('load', init);
