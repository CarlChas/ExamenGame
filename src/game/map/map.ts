// src/game/map/map.ts

import { Enemy } from '../../combat/enemies';
import { getRandomEnemyForBiomeAndTheme } from '../../combat/enemies';
import { generateRandomNPC, NPC } from '../npcs/npcGenerator';

export type AreaType = 'wilderness' | 'dungeon' | 'town' | 'gate' | 'city' | 'village' | 'camp';

export type Landmark = {
    type: 'blacksmith' | 'tavern' | 'inn' | 'market' | 'temple' | 'guild' | 'fountain';
    name: string;
    x: number;
    y: number;
};

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

const prefixWords = ['Twisted', 'Ancient', 'Mystic', 'Forgotten', 'Sacred', 'Wretched'];
const suffixWords = ['Woods', 'Sanctum', 'Vale', 'Pass', 'Ruins', 'Hollow'];
const biomeNames = ['tundra', 'desert', 'forest', 'swamp', 'wastes'];

function randomTheme(): string {
    const themes = ['corrupted', 'infernal', 'celestial', 'undead', 'elemental'];
    return themes[Math.floor(Math.random() * themes.length)];
}

function randomType(): AreaType {
    const types: AreaType[] = ['wilderness', 'town', 'dungeon', 'gate', 'city', 'village', 'camp'];
    return types[Math.floor(Math.random() * types.length)];
}

const areaTypeLabels: Record<AreaType, string> = {
    city: 'City',
    town: 'Town',
    village: 'Village',
    camp: 'Camp',
    wilderness: 'Wilderness',
    dungeon: 'Dungeon',
    gate: 'Gate',
};

type BlockedWithGate = {
    blocked: Area['blocked'];
    gateDirection: 'north' | 'south' | 'east' | 'west';
};

function generateSettlementWallsWithGate(type: AreaType): BlockedWithGate | undefined {
    const enclosedTypes: AreaType[] = ['village', 'town', 'city', 'camp'];
    if (!enclosedTypes.includes(type)) return;

    const directions = ['north', 'south', 'east', 'west'] as const;
    const gateDirection = directions[Math.floor(Math.random() * directions.length)];

    const blocked = directions.reduce((acc, dir) => {
        acc[dir] = dir === gateDirection ? false : true;
        return acc;
    }, {} as Record<typeof directions[number], boolean>);

    return { blocked, gateDirection };
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

function generateLandmarks(type: AreaType, existing: { x: number; y: number }[]): Landmark[] {
    const options: Record<AreaType, Landmark['type'][]> = {
        city: ['blacksmith', 'tavern', 'inn', 'market', 'temple', 'guild', 'fountain'],
        town: ['blacksmith', 'inn', 'market', 'temple'],
        village: ['tavern', 'fountain'],
        camp: ['tavern'],
        wilderness: [],
        dungeon: [],
        gate: [],
    };

    const types = options[type] || [];
    return types.map(type => {
        const pos = generateSafePosition(existing, 25);
        existing.push(pos);
        return {
            type,
            name: type.charAt(0).toUpperCase() + type.slice(1),
            ...pos,
        };
    });
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
const reservedZones = new Set<string>();

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

        const theme = randomTheme();
        const type = randomType();
        const prefix = prefixWords[Math.floor(Math.random() * prefixWords.length)];
        const suffix = suffixWords[Math.floor(Math.random() * suffixWords.length)];
        const name = biomeNames[Math.floor(Math.random() * biomeNames.length)];

        biomeSeeds.push({ x, y, name, theme, type, namePrefix: prefix, nameSuffix: suffix });

        if (['village', 'town', 'camp', 'city'].includes(type)) {
            reserveSurroundings(x, y);
        }

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

    const positions: { x: number; y: number }[] = [];

    const shouldHaveEnemies = type === 'wilderness' || type === 'dungeon';
    const shouldHaveNPCs = type !== 'wilderness' && type !== 'dungeon';

    const enemies = shouldHaveEnemies
        ? [(() => {
            const pos = generateSafePosition(positions, 20);
            positions.push(pos);
            return {
                ...getRandomEnemyForBiomeAndTheme(biome.name, theme, 1),
                ...pos,
                radius: 20,
            };
        })()]
        : [];

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
    const walls = generateSettlementWallsWithGate(type);
    const blocked = walls?.blocked;

    const name =
        type === 'wilderness' || type === 'dungeon'
            ? `${biome.namePrefix} ${biome.nameSuffix} (${theme})`
            : `${areaTypeLabels[type]} of ${biome.namePrefix} ${biome.nameSuffix}`;

    const area: Area = {
        name,
        npcs,
        enemies,
        coords: key,
        theme,
        type,
        blocked,
        landmarks,
    };

    mapData.set(key, area);

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

    return area;
}
