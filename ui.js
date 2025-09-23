import { state } from './state.js';
import { getCharacterAt, setGroupTarget } from './horde.js';
import { pixelToHex } from './grid.js';
import * as camera from './camera.js';
import { slugify } from './utils.js';

let canvas;
let ctx;

export function init(canvasElement) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    setupEventListeners();
}

function setupEventListeners() {
    // --- Helper pour initialiser les sliders ---
    function setupSlider(sliderId, valueSpanId, targetState, paramsKey, isFloat = true, decimals = 2) {
        const slider = document.getElementById(sliderId);
        const span = document.getElementById(valueSpanId);
        if (!slider || !span) return;

        const update = (value) => {
            const numValue = isFloat ? parseFloat(value) : parseInt(value);
            targetState[paramsKey] = numValue;
            span.textContent = numValue.toFixed(decimals);
        };

        slider.addEventListener('input', e => update(e.target.value));
        update(slider.value); // Init
    }

    // --- Sliders de contrôle du vent ---
    setupSlider("windSourceScaleSlider", "windSourceScaleValue", state.windParams, "sourceScale", false, 0);
    setupSlider("maxMasseSlider", "maxMasseValue", state.windParams, "maxMasse", true, 1);
    setupSlider("reliefPenaltySlider", "reliefPenaltyValue", state.windParams, "reliefPenalty", true, 1);
    setupSlider("randomnessSlider", "randomnessValue", state.windParams, "randomness", true, 2);

    // --- Slider de zone de victoire ---
    setupSlider("victoryZoneSlider", "victoryZoneValue", state, "victoryZoneSize", true, 1);

    // --- Sliders de rythme du vent ---
    setupSlider("baseIntervalSlider", "baseIntervalValue", state.windTempoParams, "baseInterval", false, 0);
    setupSlider("rhythmFrequencySlider", "rhythmFrequencyValue", state.windTempoParams, "rhythmFrequency", true, 2);
    setupSlider("rhythmAmplitudeSlider", "rhythmAmplitudeValue", state.windTempoParams, "rhythmAmplitude", false, 0);
    setupSlider("noiseInfluenceSlider", "noiseInfluenceValue", state.windTempoParams, "noiseInfluence", true, 2);


    const windSlider = document.getElementById('windSpeedSlider');
    const windValueSpan = document.getElementById('windSpeedValue');
    
    // --- Logarithmic Slider Mapping ---
    const maxSliderValue = 100;
    const maxWindMultiplier = 5.0;
    const scaleFactor = maxWindMultiplier / (maxSliderValue * maxSliderValue);

    function updateWindMultiplier(sliderValue) {
        const value = parseFloat(sliderValue);
        // Applique une courbe quadratique pour plus de sensibilité dans les basses valeurs
        state.globalWindMultiplier = scaleFactor * value * value;
        windValueSpan.textContent = state.globalWindMultiplier.toFixed(2);
    }

    windSlider.addEventListener('input', e => {
        updateWindMultiplier(e.target.value);
    });

    // Initialise la valeur à partir de la position initiale du slider
    updateWindMultiplier(windSlider.value);

    const venturiCheckbox = document.getElementById('venturiEffectCheckbox');
    if (venturiCheckbox) {
        venturiCheckbox.addEventListener('change', e => {
            state.venturiEnabled = e.target.checked;
        });
    }

    const inspector = document.getElementById('hex-inspector-popup');
    document.getElementById('inspector-close-button').addEventListener('click', () => inspector.style.display = 'none');

    canvas.addEventListener('mousedown', e => {
        inspector.style.display = 'none';
        if (e.button !== 0) return;
        state.isDragging = true;
        const worldCoords = camera.getTransformedCoords(e.clientX, e.clientY);
        state.selectionRect.startX = worldCoords.x;
        state.selectionRect.startY = worldCoords.y;
        state.selectionRect.currentX = worldCoords.x;
        state.selectionRect.currentY = worldCoords.y;
    });

    canvas.addEventListener('mousemove', e => {
        if (state.isDragging) {
            const worldCoords = camera.getTransformedCoords(e.clientX, e.clientY);
            state.selectionRect.currentX = worldCoords.x;
            state.selectionRect.currentY = worldCoords.y;
        } else {
            handleTooltip(e);
        }
    });

    canvas.addEventListener('mouseup', e => {
        if (e.button !== 0) return; // Only for left clicks
        state.isDragging = false;
        const wasDragSelection = Math.abs(state.selectionRect.startX - state.selectionRect.currentX) > 5 || Math.abs(state.selectionRect.startY - state.selectionRect.currentY) > 5;
        
        if (wasDragSelection) {
            // This was a drag-selection for selecting units
            if (!e.shiftKey) {
                state.horde.forEach(p => p.isSelected = false);
            }
            const rect = getSelectionRect(); // This is a local function in ui.js
            state.horde.forEach(p => {
                // The p.x, p.y are already world coordinates, so compare with world-transformed rect
                if (p.x > rect.x && p.x < rect.x + rect.w && p.y > rect.y && p.y < rect.y + rect.h) {
                    p.isSelected = true;
                }
            });
        } else {
            // This was a simple click
            const worldCoords = camera.getTransformedCoords(e.clientX, e.clientY); // Convert click to world coords
            const clickedOnCharacter = getCharacterAt(worldCoords.x, worldCoords.y); // Use world coords for character lookup
            if (clickedOnCharacter) {
                // Clicked on a character to select/deselect
                if (!e.shiftKey) {
                    state.horde.forEach(p => p.isSelected = false);
                }
                clickedOnCharacter.isSelected = !clickedOnCharacter.isSelected;
            } else {
                // Clicked on empty ground to set destination
                state.targetDestination = worldCoords; // Use world coords for target destination
                setGroupTarget(state.targetDestination);
            }
        }
    });

    canvas.addEventListener('contextmenu', e => {
        e.preventDefault();
        // Right-click now shows the hex inspector
        showHexInspector(e.offsetX, e.offsetY);
    });

    document.getElementById("pauseButton").addEventListener("click", () => {
        state.gamePaused = !state.gamePaused;
        document.getElementById("pauseIndicator").style.display = state.gamePaused ? "block" : "none";
    });
    document.querySelectorAll(".formationButton").forEach(b => b.addEventListener("click", e => setFormation(e.target.dataset.formation)));

    document.getElementById("giveUpButton").addEventListener("click", () => {
        if (confirm("Êtes-vous sûr de vouloir abandonner ?")) {
            window.location.href = 'index.html';
        }
    });

    document.getElementById("debug-toggle-button").addEventListener("click", () => {
        const debugPanel = document.getElementById("debug-panel");
        debugPanel.classList.toggle("hidden");
    });

    const saveParamsButton = document.getElementById('saveWindParamsButton');
    if (state.currentMap && state.currentMap.endsWith('.json')) {
        saveParamsButton.style.display = 'block';
        saveParamsButton.addEventListener('click', async () => {
            try {
                const response = await fetch('maps/' + state.currentMap);
                if (!response.ok) throw new Error('Impossible de charger le fichier de carte original.');
                
                const mapData = await response.json();

                // Update parameters
                mapData.windParams = state.windParams;
                mapData.windTempoParams = state.windTempoParams;
                mapData.globalWindMultiplier = state.globalWindMultiplier;

                // Trigger download
                const filename = state.currentMap;
                const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                alert('Les paramètres du vent ont été sauvegardés dans le fichier ' + filename + '.\nN\'oubliez pas de remplacer l\'ancien fichier de carte par celui que vous venez de télécharger.');

            } catch (error) {
                console.error("Erreur lors de la sauvegarde des paramètres de vent:", error);
                alert("Erreur : " + error.message);
            }
        });
    } else {
        saveParamsButton.style.display = 'none';
    }
}

function handleTooltip(e) {
    const tooltip = document.getElementById('tooltip');
    const char = getCharacterAt(e.offsetX, e.offsetY);

    if (char) {
        tooltip.style.display = 'block';
        tooltip.style.left = `${e.pageX + 15}px`;
        tooltip.style.top = `${e.pageY + 15}px`;
        tooltip.innerHTML = `<b>${char.name}</b> (${char.archetype})\nStrength: ${char.strength}\nEndurance: ${char.endurance}\nStamina: ${Math.round(char.stamina)}`;
    } else {
        tooltip.style.display = 'none';
    }
}

export function drawSelectionRect() {
    const rect = getSelectionRect();
    ctx.strokeStyle = "rgba(0, 255, 0, 0.7)";
    ctx.lineWidth = 1;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
}

function getSelectionRect() {
    const x = Math.min(state.selectionRect.startX, state.selectionRect.currentX);
    const y = Math.min(state.selectionRect.startY, state.selectionRect.currentY);
    const w = Math.abs(state.selectionRect.startX - state.selectionRect.currentX);
    const h = Math.abs(state.selectionRect.startY - state.selectionRect.currentY);
    return { x, y, w, h };
}

function setFormation(formation) {
    state.activeFormation = formation;
    document.querySelectorAll(".formationButton").forEach(b => b.classList.toggle("active", b.dataset.formation === formation));
    if (state.targetDestination) {
        setGroupTarget(state.targetDestination);
    }
}

function showHexInspector(e) {
    const worldCoords = camera.getTransformedCoords(e.clientX, e.clientY);
    const hexCoords = pixelToHex(worldCoords.x, worldCoords.y);

    if (hexCoords.r < 0 || hexCoords.r >= state.grid.length || hexCoords.c < 0 || hexCoords.c >= state.grid[0].length) return;
    const cell = state.grid[hexCoords.r][hexCoords.c];
    const popup = document.getElementById('hex-inspector-popup');
    document.getElementById('inspector-altitude').textContent = cell.relief.toFixed(3);
    document.getElementById('inspector-wind-speed').textContent = cell.wind.masse.toFixed(3);
    document.getElementById('inspector-wind-pressure').textContent = (cell.wind.masse * cell.wind.masse * 0.5).toFixed(3);
    
    // Position the popup using screen coordinates from the event
    popup.style.left = `${e.clientX + 15}px`;
    popup.style.top = `${e.clientY + 15}px`;
    popup.style.display = 'block';
}

export function updateTopBar() {
    if (!state.startTime) return;

    const timeDisplay = document.getElementById('time-display');
    const scoreDisplay = document.getElementById('score-display');

    if (!timeDisplay || !scoreDisplay) return;

    const elapsedTime = Math.round((performance.now() - state.startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
    const seconds = (elapsedTime % 60).toString().padStart(2, '0');

    timeDisplay.textContent = `${minutes}:${seconds}`;

    const currentScore = Math.max(10000 - elapsedTime * 10, 0);
    scoreDisplay.textContent = currentScore;
}