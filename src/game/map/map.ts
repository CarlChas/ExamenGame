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
    event?: string;
    blocked?: {
        north?: boolean;
        south?: boolean;
        east?: boolean;
        west?: boolean;
    };
    landmarks?: Landmark[];
    role?: LandmarkType | 'gate' | 'core';
}

const mapData = new Map<string, Area>();

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

const biomeSeeds: BiomeSeed[] = [];
const reservedZones = new Set<string>();

interface BiomeSeed {
    x: number;
    y: number;
    name: string;
    theme: string;
    type: AreaType;
    gateCoords?: { x: number; y: number };
    namePrefix: string;
    nameSuffix: string;
}

function randomTheme(): string {
    return themes[Math.floor(Math.random() * themes.length)];
}

function randomType(): AreaType {
    const types: AreaType[] = ['wilderness', 'town', 'dungeon', 'city', 'village', 'camp'];
    return types[Math.floor(Math.random() * types.length)];
}

function reserveSurroundings(x: number, y: number, buffer = 2) {
    for (let dx = -buffer; dx <= buffer; dx++) {
        for (let dy = -buffer; dy <= buffer; dy++) {
            reservedZones.add(`${x + dx},${y + dy}`);
        }
    }
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
        const gateCoords = ['village', 'town', 'city', 'camp'].includes(type)
            ? { x: x + gateOffset.x, y: y + gateOffset.y }
            : undefined;

        biomeSeeds.push({ x, y, name, theme, type, namePrefix: prefix, nameSuffix: suffix, gateCoords });

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

function getLandmarkTypesFor(type: AreaType): LandmarkType[] {
    switch (type) {
        case 'city': return ['blacksmith', 'tavern', 'inn', 'market', 'temple', 'guild', 'fountain'];
        case 'town': return ['blacksmith', 'inn', 'market', 'temple'];
        case 'village': return ['tavern', 'fountain'];
        case 'camp': return ['tavern'];
        default: return [];
    }
}

export function getArea(x: number, y: number): Area {
    const key = `${x},${y}`;
    if (mapData.has(key)) return mapData.get(key)!;

    const biome = getBiomeForCoords(x, y);
    const type = biome.type;
    const theme = biome.theme;

    const positions: { x: number; y: number }[] = [];

    const shouldHaveEnemies = type === 'wilderness' || type === 'dungeon';
    const enemies = shouldHaveEnemies
        ? [(() => {
            const pos = generateSafePosition(positions);
            return {
                ...getRandomEnemyForBiomeAndTheme(biome.name, theme, 1),
                ...pos,
                radius: 20,
            };
        })()]
        : [];

    let npcs: NPC[] = [];
    let landmarks: Landmark[] = [];

    const landmarkTypes = getLandmarkTypesFor(type);
    landmarks = landmarkTypes.map(landmarkType => {
        const pos = generateSafePosition(positions);
        const npc = generateSpecificNPCForLandmark(landmarkType, pos.x, pos.y);
        npcs.push(npc);

        return {
            type: landmarkType,
            name: landmarkType.charAt(0).toUpperCase() + landmarkType.slice(1),
            ...pos,
        };
    });

    const isGateTile = biome.gateCoords?.x === x && biome.gateCoords?.y === y;
    const isCoreTile = biome.x === x && biome.y === y;

    const name = isCoreTile
        ? `${areaTypeLabels[type]} of ${biome.namePrefix} ${biome.nameSuffix}`
        : `${biome.namePrefix} ${biome.nameSuffix} (${theme})`;

    const role: Area['role'] = isGateTile ? 'gate' : isCoreTile ? 'core' : undefined;

    const area: Area = {
        name,
        npcs,
        enemies,
        coords: key,
        theme,
        type,
        role,
        landmarks,
    };

    mapData.set(key, area);
    return area;
}
