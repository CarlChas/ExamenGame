// src/game/map/map.ts

import { Enemy } from '../../combat/enemies';
import { getRandomEnemyForBiomeAndTheme } from '../../combat/enemies';
import { generateRandomNPC, NPC } from '../npcs/npcGenerator';

export type AreaType = 'wilderness' | 'dungeon' | 'town' | 'gate' | 'city' | 'village' | 'camp';

export interface Area {
    name: string;
    npcs: NPC[];
    enemies?: Enemy[];
    coords: string;
    theme: string;
    type?: AreaType;
    event?: string;
    blocked?: {
        north?: boolean;
        south?: boolean;
        east?: boolean;
        west?: boolean;
    };
    landmarks?: Landmark[]; // ⬅️ NEW
}

export type Landmark = {
    type: 'blacksmith' | 'tavern' | 'inn' | 'market' | 'temple' | 'guild' | 'fountain';
    name: string;
    x: number;
    y: number;
};

function generateLandmarks(type: AreaType, existingPositions: { x: number; y: number }[]): Landmark[] {
    const landmarkOptions: Record<AreaType, Landmark['type'][]> = {
        city: ['blacksmith', 'tavern', 'inn', 'market', 'temple', 'guild', 'fountain'],
        town: ['blacksmith', 'inn', 'market', 'temple'],
        village: ['tavern', 'fountain'],
        camp: ['tavern'],
        wilderness: [],
        dungeon: [],
        gate: [],
    };

    const types = landmarkOptions[type] || [];
    return types.map(type => {
        const pos = generateSafePosition(existingPositions, 25);
        existingPositions.push(pos);
        return {
            type,
            name: type.charAt(0).toUpperCase() + type.slice(1),
            ...pos,
        };
    });
}


const mapData = new Map<string, Area>();

const areaTypeLabels: Record<AreaType, string> = {
    city: 'City',
    town: 'Town',
    village: 'Village',
    camp: 'Camp',
    wilderness: 'Wilderness',
    dungeon: 'Dungeon',
    gate: 'Gate',
};


export function getMapData(): Record<string, Area> {
    const obj: Record<string, Area> = {};
    mapData.forEach((value, key) => {
        obj[key] = value;
    });
    return obj;
}

export function setMapData(data: Record<string, Area>) {
    Object.entries(data).forEach(([key, value]) => {
        mapData.set(key, value);
    });
}

function generateSafePosition(existing: { x: number; y: number }[], radius = 25, padding = 50): { x: number, y: number } {
    let attempts = 0;
    while (attempts < 100) {
        const x = Math.floor(Math.random() * (600 - 2 * padding) + padding);
        const y = Math.floor(Math.random() * (400 - 2 * padding) + padding);

        const tooClose = existing.some(pos => {
            const dx = pos.x - x;
            const dy = pos.y - y;
            return Math.sqrt(dx * dx + dy * dy) < radius * 2;
        });

        if (!tooClose) return { x, y };
        attempts++;
    }
    return { x: padding, y: padding };
}

const themes = ['corrupted', 'infernal', 'celestial', 'undead', 'elemental'];
const types: AreaType[] = ['wilderness', 'town', 'dungeon', 'gate', 'city', 'village', 'camp'];
const prefixWords = ['Twisted', 'Ancient', 'Mystic', 'Forgotten', 'Sacred', 'Wretched'];
const suffixWords = ['Woods', 'Sanctum', 'Vale', 'Pass', 'Ruins', 'Hollow'];

function randomTheme(): string {
    return themes[Math.floor(Math.random() * themes.length)];
}

function randomType(): AreaType {
    return types[Math.floor(Math.random() * types.length)];
}

function generateBlockedWithOneOpen(): Area['blocked'] {
    const directions = ['north', 'south', 'east', 'west'] as const;
    const openDir = directions[Math.floor(Math.random() * directions.length)];

    return directions.reduce((acc, dir) => {
        acc[dir] = dir === openDir ? false : Math.random() < 0.2;
        return acc;
    }, {} as Record<(typeof directions)[number], boolean>);
}

interface BiomeSeed {
    x: number;
    y: number;
    name: string;
    theme: string;
    type: AreaType;
    namePrefix: string;
    nameSuffix: string;
}

const biomeSeeds: BiomeSeed[] = [];

function generateBiomeSeeds(seedCount: number = 6) {
    if (biomeSeeds.length > 0) return;

    for (let i = 0; i < seedCount; i++) {
        const x = Math.floor(Math.random() * 20 - 10);
        const y = Math.floor(Math.random() * 20 - 10);
        const theme = randomTheme();
        const type = randomType();
        const prefix = prefixWords[Math.floor(Math.random() * prefixWords.length)];
        const suffix = suffixWords[Math.floor(Math.random() * suffixWords.length)];

        const name = ['tundra', 'desert', 'forest', 'swamp', 'wastes'][Math.floor(Math.random() * 5)];

        biomeSeeds.push({ x, y, name, theme, type, namePrefix: prefix, nameSuffix: suffix });
    }
}

function getBiomeForCoords(x: number, y: number): BiomeSeed {
    generateBiomeSeeds();

    let closest = biomeSeeds[0];
    let minDist = Infinity;

    for (const seed of biomeSeeds) {
        const dx = seed.x - x;
        const dy = seed.y - y;
        const dist = dx * dx + dy * dy;
        if (dist < minDist) {
            minDist = dist;
            closest = seed;
        }
    }
    return closest;
}

export function getArea(x: number, y: number): Area {
    const key = `${x},${y}`;
    if (mapData.has(key)) return mapData.get(key)!;

    const biome = getBiomeForCoords(x, y);
    const theme = biome.theme;
    const type = biome.type;

    const positions: { x: number, y: number }[] = [];

    const shouldHaveEnemies = type === 'wilderness' || type === 'dungeon';
    const shouldHaveNPCs = type !== 'wilderness' && type !== 'dungeon';

    const enemies = shouldHaveEnemies ? [
        (() => {
            const pos = generateSafePosition(positions, 20);
            positions.push(pos);
            return {
                ...getRandomEnemyForBiomeAndTheme(biome.name, theme, 1),
                ...pos,
                radius: 20,
            };
        })()
    ] : [];

    let npcCount = 0;
    if (shouldHaveNPCs) {
        switch (type) {
            case 'city': npcCount = Math.floor(Math.random() * 4) + 5; break;
            case 'town': npcCount = Math.floor(Math.random() * 3) + 3; break;
            case 'village': npcCount = Math.floor(Math.random() * 2) + 2; break;
            case 'camp': npcCount = Math.floor(Math.random() * 2) + 1; break;
            default: npcCount = Math.random() < 0.5 ? 1 : 0;
        }
    }

    const npcs: NPC[] = Array.from({ length: npcCount }, () => {
        const pos = generateSafePosition(positions);
        positions.push(pos);
        return generateRandomNPC(pos.x, pos.y);
    });

    const landmarks = generateLandmarks(type, positions);

    const blocked: Area['blocked'] = generateBlockedWithOneOpen();

    const areaLabel = areaTypeLabels[type] || type;
    const newArea: Area = {
        name: type === 'wilderness' || type === 'dungeon'
            ? `${biome.namePrefix} ${biome.nameSuffix} (${theme})`
            : `${areaLabel} of ${biome.namePrefix} ${biome.nameSuffix}`,
        npcs,
        enemies,
        coords: key,
        theme,
        type,
        blocked,
        landmarks, // ⬅️ NEW
    };



    mapData.set(key, newArea);

    const neighbors = {
        north: { dx: 0, dy: -1, dir: 'south' },
        south: { dx: 0, dy: 1, dir: 'north' },
        east: { dx: 1, dy: 0, dir: 'west' },
        west: { dx: -1, dy: 0, dir: 'east' },
    };

    for (const dir in neighbors) {
        const { dx, dy, dir: opposite } = neighbors[dir as keyof typeof neighbors];
        const nx = x + dx;
        const ny = y + dy;
        const neighborKey = `${nx},${ny}`;
        const neighbor = mapData.get(neighborKey);
        if (neighbor && blocked?.[dir as keyof typeof blocked]) {
            neighbor.blocked = { ...neighbor.blocked, [opposite]: true };
        }
    }

    return newArea;
}
