
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { VoxelData } from '../types';
import { COLORS, CONFIG } from './voxelConstants';

function setBlock(map: Map<string, VoxelData>, x: number, y: number, z: number, color: number) {
    const rx = Math.round(x);
    const ry = Math.round(y);
    const rz = Math.round(z);
    const key = `${rx},${ry},${rz}`;
    map.set(key, { x: rx, y: ry, z: rz, color });
}

function generateSphere(map: Map<string, VoxelData>, cx: number, cy: number, cz: number, r: number, col: number, sy = 1) {
    const r2 = r * r;
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        for (let y = Math.floor(cy - r * sy); y <= Math.ceil(cy + r * sy); y++) {
            for (let z = Math.floor(cz - r); z <= Math.ceil(cz + r); z++) {
                const dx = x - cx, dy = (y - cy) / sy, dz = z - cz;
                if (dx * dx + dy * dy + dz * dz <= r2) setBlock(map, x, y, z, col);
            }
        }
    }
}

// Simple bitmask numbers (5x7)
const DIGITS: Record<string, number[][]> = {
    '0': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
    '1': [[0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
    '2': [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,1],[0,0,1,1,0],[0,1,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
    '3': [[1,1,1,1,1],[0,0,0,1,0],[0,0,1,1,0],[0,0,0,1,0],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
    '4': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[0,0,0,0,1],[0,0,0,0,1],[0,0,0,0,1]],
    '5': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[0,0,0,0,1],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
    '6': [[0,1,1,1,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
    '7': [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0]],
    '8': [[0,1,1,1,0],[1,0,0,0,1],[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
    '9': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,1],[0,0,0,0,1],[0,1,1,1,0]],
};

export const Generators = {
    OrangeHarvest: (count: number = 100, label: string = "100"): VoxelData[] => {
        const voxels: VoxelData[] = [];
        const chars = label.split('');
        const scale = 2.8; // Significantly scale up the number size
        const spacing = 7;
        const totalWidth = chars.length * spacing - 2;
        const startX = -(totalWidth / 2);

        const numberPoints: {x: number, y: number, z: number}[] = [];
        
        chars.forEach((char, charIdx) => {
            const digit = DIGITS[char] || DIGITS['0'];
            const charOffsetX = startX + charIdx * spacing;
            
            // Generate a thicker, larger number
            for(let depth = -1; depth <= 1; depth++) {
                for(let y = 0; y < 7; y++) {
                    for(let x = 0; x < 5; x++) {
                        if (digit[6-y][x]) {
                            // Scale the point and center it vertically
                            numberPoints.push({ 
                                x: (charOffsetX + x) * scale, 
                                y: (y - 3) * scale + 15, // Raised up in the view
                                z: depth * scale * 0.8 
                            });
                        }
                    }
                }
            }
        });

        // Use exactly 'count' voxels
        for (let i = 0; i < count; i++) {
            const pt = numberPoints[i % numberPoints.length];
            // Jitter tailored to the larger scale
            const jitterX = (i >= numberPoints.length) ? (Math.random() - 0.5) * 1.5 : 0;
            const jitterY = (i >= numberPoints.length) ? (Math.random() - 0.5) * 1.5 : 0;
            const jitterZ = (i >= numberPoints.length) ? (Math.random() - 0.5) * 1.5 : 0;
            
            voxels.push({
                x: pt.x + jitterX,
                y: pt.y + jitterY,
                z: pt.z + jitterZ,
                color: COLORS.ORANGE,
                isOrange: true
            });
        }
        return voxels;
    },

    Eagle: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        for (let x = -8; x < 8; x++) {
            const y = Math.sin(x * 0.2) * 1.5;
            const z = Math.cos(x * 0.1) * 1.5;
            generateSphere(map, x, y, z, 1.8, COLORS.WOOD);
        }
        const EX = 0, EY = 2, EZ = 2;
        generateSphere(map, EX, EY + 6, EZ, 4.5, COLORS.DARK, 1.4);
        generateSphere(map, EX, EY + 12, EZ + 1, 2.8, COLORS.WHITE);
        return Array.from(map.values());
    },

    Cat: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        generateSphere(map, 0, 5, 0, 4, COLORS.DARK, 1.5);
        generateSphere(map, 0, 12, 0, 3, COLORS.DARK);
        return Array.from(map.values());
    },

    Rabbit: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        generateSphere(map, 0, 4, 0, 4, COLORS.WHITE);
        generateSphere(map, 0, 10, 0, 2.5, COLORS.WHITE);
        return Array.from(map.values());
    },

    Twins: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        generateSphere(map, -10, 5, 0, 5, COLORS.DARK);
        generateSphere(map, 10, 5, 0, 5, COLORS.LIGHT);
        return Array.from(map.values());
    }
};
