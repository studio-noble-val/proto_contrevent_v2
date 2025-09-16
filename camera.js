// camera.js

const PAN_SPEED = 15;
const ZOOM_SPEED = 1.1;

const camera = {
    zoomLevel: 0.6,
    offset: { x: 0, y: 0 },
    isPanning: false,
    lastPanPosition: { x: 0, y: 0 },
    canvas: null,
    ctx: null,
};

export function init(canvasElement, context) {
    camera.canvas = canvasElement;
    camera.ctx = context;
    setupEventListeners();
}

function setupEventListeners() {
    // Mouse listeners for canvas
    camera.canvas.addEventListener('mousedown', e => {
        if (e.button === 1) { // Middle mouse
            camera.isPanning = true;
            camera.lastPanPosition = { x: e.clientX, y: e.clientY };
        }
    });

    window.addEventListener('mouseup', e => {
        camera.isPanning = false;
    });

    window.addEventListener('mousemove', e => {
        if (camera.isPanning) {
            const dx = e.clientX - camera.lastPanPosition.x;
            const dy = e.clientY - camera.lastPanPosition.y;
            camera.offset.x += dx;
            camera.offset.y += dy;
            camera.lastPanPosition = { x: e.clientX, y: e.clientY };
            console.log('Camera Offset (mousemove):', camera.offset.x, camera.offset.y);
            // Redraw will be handled by the main game loop or editor loop
        }
    });

    // Zoom listener
    camera.canvas.addEventListener('wheel', e => {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? ZOOM_SPEED : 1 / ZOOM_SPEED;
        camera.zoomLevel = Math.max(0.2, Math.min(camera.zoomLevel * zoomFactor, 5));
        console.log('Camera Zoom (wheel):', camera.zoomLevel);
        // Redraw will be handled by the main game loop or editor loop
    });

    // Keyboard listeners (aligned with editor.js)
    window.addEventListener('keydown', e => {
        // Prevent interference with UI elements
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
            return;
        }

        let handled = true;
        // Use e.key for non-alphanumeric keys
        switch(e.key) {
            case 'ArrowUp':    camera.offset.y += PAN_SPEED; break;
            case 'ArrowDown':  camera.offset.y -= PAN_SPEED; break;
            case 'ArrowLeft':  camera.offset.x += PAN_SPEED; break;
            case 'ArrowRight': camera.offset.x -= PAN_SPEED; break;
            case 'PageUp':     camera.zoomLevel = Math.min(5, camera.zoomLevel * ZOOM_SPEED); break;
            case 'PageDown':   camera.zoomLevel = Math.max(0.2, camera.zoomLevel / ZOOM_SPEED); break;
            default:
                handled = false;
        }

        if (handled) {
            e.preventDefault();
            // Redraw is handled by the main game loop
        }
    });
}

export function applyTransform(ctx) {
    ctx.translate(camera.offset.x, camera.offset.y);
    ctx.scale(camera.zoomLevel, camera.zoomLevel);
}

export function getTransformedCoords(clientX, clientY) {
    const rect = camera.canvas.getBoundingClientRect();
    const mouseX = (clientX - rect.left - camera.offset.x) / camera.zoomLevel;
    const mouseY = (clientY - rect.top - camera.offset.y) / camera.zoomLevel;
    console.log('getTransformedCoords input:', clientX, clientY, 'output:', mouseX, mouseY, 'offset:', camera.offset.x, camera.offset.y, 'zoom:', camera.zoomLevel);
    return { x: mouseX, y: mouseY };
}

export function resetCamera() {
    camera.zoomLevel = 1;
    camera.offset = { x: 0, y: 0 };
}

export function getCameraState() {
    return { zoomLevel: camera.zoomLevel, offset: { ...camera.offset } };
}

export function setCameraState(newState) {
    camera.zoomLevel = newState.zoomLevel;
    camera.offset = { ...newState.offset };
}