// src/game/map/map.ts

import { Enemy } from '../../combat/enemies';
import { getRandomEnemyForBiomeAndTheme } from '../../combat/enemies';
import { generateSpecificNPCForLandmark, NPC } from '../npcs/npcGenerator';

export type AreaType = 'wilderness' | 'dungeon' | 'town' | 'city' | 'village' | 'camp';
export type LandmarkType = 'blacksmith' | 'tavern' | 'inn' | 'market' | 'temple' | 'guild' | 'fountain';

export interface Landmark {
    type: LandmarkType;
    name: string;
    x: number;
    y: number;
}

export interface Area {
    name: string;
    npcs: NPC[];
    enemies?: Enemy[];
    coords: string;
    theme: string;
    type?: AreaType;
    blocked?: {
        north?: boolean;
        south?: boolean;
        east?: boolean;
        west?: boolean;
    };
    landmarks?: Landmark[];
    role?: LandmarkType | 'gate' | 'core';
}

// --- Config ---
const themes = ['corrupted', 'infernal', 'celestial', 'undead', 'elemental'];
const prefixWords = ['Twisted', 'Ancient', 'Mystic', 'Forgotten', 'Sacred', 'Wretched'];
const suffixWords = ['Woods', 'Sanctum', 'Vale', 'Pass', 'Ruins', 'Hollow'];
const biomeNames = ['tundra', 'desert', 'forest', 'swamp', 'wastes'];

const areaTypeLabels: Record<AreaType, string> = {
    city: 'City',
    town: 'Town',
    village: 'Village',
    camp: 'Camp',
    wilderness: 'Wilderness',
    dungeon: 'Dungeon',
};

const landmarkLimits: Record<AreaType, Partial<Record<LandmarkType, number>>> = {
    city: {
        blacksmith: 1,
        tavern: 2,
        inn: 1,
        market: 2,
        temple: 1,
        guild: 1,
        fountain: 1,
    },
    town: {
        blacksmith: 1,
        inn: 1,
        market: 1,
        temple: 1,
    },
    village: {
        tavern: 1,
        fountain: 1,
    },
    camp: {
        tavern: 1,
    },
    wilderness: {},
    dungeon: {},
};


interface BiomeSeed {
    x: number;
    y: number;
    name: string;
    theme: string;
    type: AreaType;
    namePrefix: string;
    nameSuffix: string;
    gateCoords?: { x: number; y: number };
    plannedLandmarks?: Landmark[];
    plannedNPCs?: NPC[];
}

const mapData = new Map<string, Area>();
const biomeSeeds: BiomeSeed[] = [];
const reservedZones = new Set<string>();

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

function reserveSurroundings(x: number, y: number, buffer = 2) {
    for (let dx = -buffer; dx <= buffer; dx++) {
        for (let dy = -buffer; dy <= buffer; dy++) {
            reservedZones.add(`${x + dx},${y + dy}`);
        }
    }
}

function generateSafePosition(existing: { x: number; y: number }[], radius = 25, padding = 50): { x: number; y: number } {
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

function randomTheme(): string {
    return themes[Math.floor(Math.random() * themes.length)];
}

function randomType(): AreaType {
    const types: AreaType[] = ['wilderness', 'town', 'dungeon', 'city', 'village', 'camp'];
    return types[Math.floor(Math.random() * types.length)];
}

function generateBiomeSeeds(seedCount = 6) {
    if (biomeSeeds.length > 0) return;

    let attempts = 0;
    while (biomeSeeds.length < seedCount && attempts < seedCount * 10) {
        const x = Math.floor(Math.random() * 20 - 10);
        const y = Math.floor(Math.random() * 20 - 10);
        const key = `${x},${y}`;
        if (reservedZones.has(key)) {
            attempts++;
            continue;
        }

        const type = randomType();
        const theme = randomTheme();
        const prefix = prefixWords[Math.floor(Math.random() * prefixWords.length)];
        const suffix = suffixWords[Math.floor(Math.random() * suffixWords.length)];
        const name = biomeNames[Math.floor(Math.random() * biomeNames.length)];

        const gateOffset = [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: -1, y: 0 }][Math.floor(Math.random() * 4)];
        const gateCoords = ['village', 'town', 'city', 'camp'].includes(type) ? { x: x + gateOffset.x, y: y + gateOffset.y } : undefined;

        const positions: { x: number; y: number }[] = [];
        const plannedLandmarks: Landmark[] = [];
        const plannedNPCs: NPC[] = [];

        const limits = landmarkLimits[type];
        if (limits) {
            for (const landmarkType in limits) {
                const count = limits[landmarkType as LandmarkType]!;
                for (let i = 0; i < count; i++) {
                    const pos = generateSafePosition(positions);
                    plannedLandmarks.push({
                        type: landmarkType as LandmarkType,
                        name: landmarkType.charAt(0).toUpperCase() + landmarkType.slice(1),
                        ...pos,
                    });
                    plannedNPCs.push(generateSpecificNPCForLandmark(landmarkType as LandmarkType, pos.x, pos.y));
                }
            }
        }

        biomeSeeds.push({
            x, y, name, theme, type,
            namePrefix: prefix,
            nameSuffix: suffix,
            gateCoords,
            plannedLandmarks,
            plannedNPCs,
        });

        if (['village', 'town', 'camp', 'city'].includes(type)) {
            reserveSurroundings(x, y);
        }
        if (gateCoords) reservedZones.add(`${gateCoords.x},${gateCoords.y}`);
        attempts++;
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
    const type = biome.type;
    const theme = biome.theme;

    const isCoreTile = biome.x === x && biome.y === y;
    const isGateTile = biome.gateCoords?.x === x && biome.gateCoords?.y === y;

    const role: Area['role'] = isCoreTile ? 'core' : isGateTile ? 'gate' : undefined;

    const name =
        role === 'core'
            ? `${areaTypeLabels[type]} of ${biome.namePrefix} ${biome.nameSuffix}`
            : `${biome.namePrefix} ${biome.nameSuffix} (${theme})`;

    const npcs = role === 'core' ? biome.plannedNPCs ?? [] : [];
    const landmarks = role === 'core' ? biome.plannedLandmarks ?? [] : [];

    const enemies =
        type === 'wilderness' || type === 'dungeon'
            ? [(() => {
                const pos = generateSafePosition([]);
                return {
                    ...getRandomEnemyForBiomeAndTheme(biome.name, theme, 1),
                    ...pos,
                    radius: 20,
                };
            })()]
            : [];

    const area: Area = {
        name,
        coords: key,
        theme,
        type,
        role,
        npcs,
        enemies,
        landmarks,
    };

    mapData.set(key, area);
    return area;
}
