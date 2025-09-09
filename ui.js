import { state } from './state.js';
import { getCharacterAt, setGroupTarget } from './horde.js';
import { pixelToHex } from './grid.js';

let canvas;
let ctx;

export function init(canvasElement) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    setupEventListeners();
}

function setupEventListeners() {
    // --- Helper pour initialiser les sliders ---
    function setupSlider(sliderId, valueSpanId, paramsKey, isFloat = true, decimals = 2) {
        const slider = document.getElementById(sliderId);
        const span = document.getElementById(valueSpanId);
        if (!slider || !span) return;

        const update = (value) => {
            const numValue = isFloat ? parseFloat(value) : parseInt(value);
            state.windParams[paramsKey] = numValue;
            span.textContent = numValue.toFixed(decimals);
        };

        slider.addEventListener('input', e => update(e.target.value));
        update(slider.value); // Init
    }

    // --- Sliders de contrôle du vent ---
    setupSlider("windSourceScaleSlider", "windSourceScaleValue", "sourceScale", false, 0);
    setupSlider("maxMasseSlider", "maxMasseValue", "maxMasse", true, 1);
    setupSlider("minCeleriteSlider", "minCeleriteValue", "minCelerite", true, 2);
    setupSlider("maxCeleriteSlider", "maxCeleriteValue", "maxCelerite", true, 2);
    setupSlider("dissipationSlider", "dissipationValue", "dissipation", true, 2);
    setupSlider("fadingSlider", "fadingValue", "fading", true, 3);


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
        state.selectionRect.startX = e.offsetX;
        state.selectionRect.startY = e.offsetY;
        state.selectionRect.currentX = e.offsetX;
        state.selectionRect.currentY = e.offsetY;
    });

    canvas.addEventListener('mousemove', e => {
        if (state.isDragging) {
            state.selectionRect.currentX = e.offsetX;
            state.selectionRect.currentY = e.offsetY;
        }
    });

    canvas.addEventListener('mouseup', e => {
        if (e.button !== 0) return;
        state.isDragging = false;
        const wasDragSelection = Math.abs(state.selectionRect.startX - state.selectionRect.currentX) > 5 || Math.abs(state.selectionRect.startY - state.selectionRect.currentY) > 5;
        if (wasDragSelection) {
            if (!e.shiftKey) {
                state.horde.forEach(p => p.isSelected = false);
            }
            const rect = getSelectionRect();
            state.horde.forEach(p => {
                if (p.x > rect.x && p.x < rect.x + rect.w && p.y > rect.y && p.y < rect.y + rect.h) {
                    p.isSelected = true;
                }
            });
        } else {
            const clickedOnCharacter = getCharacterAt(e.offsetX, e.offsetY);
            if (clickedOnCharacter) {
                if (!e.shiftKey) {
                    state.horde.forEach(p => p.isSelected = false);
                }
                clickedOnCharacter.isSelected = !clickedOnCharacter.isSelected;
            } else {
                showHexInspector(e.offsetX, e.offsetY);
            }
        }
    });

    canvas.addEventListener('contextmenu', e => {
        e.preventDefault();
        state.targetDestination = { x: e.offsetX, y: e.offsetY };
        setGroupTarget(state.targetDestination);
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

export function updateStats() {
    let selected = state.horde.filter(p => p.isSelected);
    if (selected.length === 0) {
        selected = state.horde;
    }
    if (selected.length > 0) {
        document.getElementById("stamina").textContent = Math.round(selected.reduce((sum, p) => sum + p.stamina, 0) / selected.length);
    } else {
        document.getElementById("stamina").textContent = "--";
    }
    document.getElementById("lucidity").textContent = "--";
    document.getElementById("cohesion").textContent = "--";
}

function setFormation(formation) {
    state.activeFormation = formation;
    document.querySelectorAll(".formationButton").forEach(b => b.classList.toggle("active", b.dataset.formation === formation));
    if (state.targetDestination) {
        setGroupTarget(state.targetDestination);
    }
}

function showHexInspector(x, y) {
    const hexCoords = pixelToHex(x, y);
    if (hexCoords.r < 0 || hexCoords.r >= state.grid.length || hexCoords.c < 0 || hexCoords.c >= state.grid[0].length) return;
    const cell = state.grid[hexCoords.r][hexCoords.c];
    const popup = document.getElementById('hex-inspector-popup');
    document.getElementById('inspector-altitude').textContent = cell.relief.toFixed(3);
    document.getElementById('inspector-wind-speed').textContent = cell.wind.masse.toFixed(3);
    document.getElementById('inspector-wind-pressure').textContent = (cell.wind.masse * cell.wind.masse * 0.5).toFixed(3);
    popup.style.left = `${x + 15}px`;
    popup.style.top = `${y + 15}px`;
    popup.style.display = 'block';
}