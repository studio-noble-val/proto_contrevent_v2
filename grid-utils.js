import { HEX_SIZE, HEX_WIDTH, HEX_HEIGHT } from './constants.js';

// --- Axial/Cube/Offset Coordinate Conversion ---

/**
 * Converts pixel coordinates to fractional cube coordinates.
 * @param {number} x - The x pixel coordinate.
 * @param {number} y - The y pixel coordinate.
 * @returns {{x: number, y: number, z: number}} Fractional cube coordinates.
 */
export function pixelToCube(x, y) {
    const q = (Math.sqrt(3)/3 * x - 1/3 * y) / HEX_SIZE;
    const r = (2/3 * y) / HEX_SIZE;
    return { x: q, y: -q-r, z: r };
}

/**
 * Rounds fractional cube coordinates to the nearest integer cube coordinates.
 * @param {{x: number, y: number, z: number}} cube - Fractional cube coordinates.
 * @returns {{x: number, y: number, z: number}} Integer cube coordinates.
 */
export function roundCube(cube) {
    let rx = Math.round(cube.x);
    let ry = Math.round(cube.y);
    let rz = Math.round(cube.z);

    const x_diff = Math.abs(rx - cube.x);
    const y_diff = Math.abs(ry - cube.y);
    const z_diff = Math.abs(rz - cube.z);

    if (x_diff > y_diff && x_diff > z_diff) {
        rx = -ry - rz;
    } else if (y_diff > z_diff) {
        ry = -rx - rz;
    } else {
        rz = -rx - ry;
    }
    return { x: rx, y: ry, z: rz };
}

/**
 * Converts cube coordinates to "odd-q" offset coordinates.
 * @param {{x: number, y: number, z: number}} cube - Integer cube coordinates.
 * @returns {{r: number, c: number}} Offset coordinates (row, col).
 */
export function cubeToOffset(cube) {
    const col = cube.x + (cube.z - (cube.z & 1)) / 2;
    const row = cube.z;
    return { r: row, c: col };
}

/**
 * Converts "odd-q" offset coordinates to cube coordinates.
 * @param {{r: number, c: number}} hex - Offset coordinates (row, col).
 * @returns {{x: number, y: number, z: number}} Integer cube coordinates.
 */
export function offsetToCube(hex) {
    const q = hex.c - (hex.r - (hex.r & 1)) / 2;
    const r = hex.r;
    return { x: q, y: -q - r, z: r };
}

/**
 * Calculates the distance between two cube coordinates.
 * @param {{x: number, y: number, z: number}} a - Cube coordinates for point A.
 * @param {{x: number, y: number, z: number}} b - Cube coordinates for point B.
 * @returns {number} The distance in number of hexes.
 */
export function cubeDistance(a, b) {
    return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2;
}

/**
 * Converts pixel coordinates directly to offset coordinates.
 * @param {number} x - The x pixel coordinate.
 * @param {number} y - The y pixel coordinate.
 * @returns {{r: number, c: number}} Offset coordinates (row, col).
 */
export function pixelToOffset(x, y) {
    // Adjust for the fact that the grid drawing origin is the top-left of the hex, not the center.
    const adjustedX = x - HEX_WIDTH / 2;
    const adjustedY = y - HEX_HEIGHT / 2;
    const cube = pixelToCube(adjustedX, adjustedY);
    const rounded = roundCube(cube);
    return cubeToOffset(rounded);
}
