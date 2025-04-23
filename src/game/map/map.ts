// src/game/map/map.ts

import { Enemy } from '../../combat/enemies';
import { getRandomEnemyForBiomeAndTheme } from '../../combat/enemies';
import { generateSpecificNPCForLandmark, NPC } from '../npcs/npcGenerator';

// === Types ===
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

export interface BiomeSeed {
    x: number;
    y: number;
    theme: string;
    type: AreaType;
    gateCoords?: { x: number; y: number };
    namePrefix: string;
    nameSuffix: string;
    settlementName?: string;
    occupiedCoords?: Set<string>;
}

// === Constants ===
const mapData = new Map<string, Area>();
const biomeSeeds: BiomeSeed[] = [];
const reservedZones = new Set<string>();

const themes = ['corrupted', 'infernal', 'celestial', 'undead', 'elemental'];
const prefixWords = ['Twisted', 'Ancient', 'Mystic', 'Forgotten', 'Sacred', 'Wretched'];
const suffixWords = ['Woods', 'Sanctum', 'Vale', 'Pass', 'Ruins', 'Hollow'];

const settlementNames = [
    'Eastridge', 'Westhaven', 'Oakmoor', 'Dunmere', 'Ravenhollow',
    'Thornbrook', 'Stonebridge', 'Glimmerford', 'Ironvale', 'Redfield'
];
const usedSettlementNames = new Set<string>();

const areaTypeLabels: Record<AreaType, string> = {
    city: 'City',
    town: 'Town',
    village: 'Village',
    camp: 'Camp',
    wilderness: 'Wilderness',
    dungeon: 'Dungeon',
};

const settlementBlobSizeRange: Partial<Record<AreaType, [number, number]>> = {
    city: [4, 6],
    town: [3, 5],
    village: [2, 3],
    camp: [1, 2],
};

// === Utility Functions ===
function randomTheme(): string {
    return themes[Math.floor(Math.random() * themes.length)];
}

function randomType(): AreaType {
    const types: AreaType[] = ['wilderness', 'town', 'dungeon', 'city', 'village', 'camp'];
    return types[Math.floor(Math.random() * types.length)];
}

function getUniqueSettlementName(): string {
    const available = settlementNames.filter(name => !usedSettlementNames.has(name));
    if (available.length === 0) return 'Unnamed Settlement';
    const name = available[Math.floor(Math.random() * available.length)];
    usedSettlementNames.add(name);
    return name;
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

function generateBlob(x: number, y: number, maxTiles: number): Set<string> {
    const frontier = [`${x},${y}`];
    const visited = new Set<string>();

    while (frontier.length && visited.size < maxTiles) {
        const current = frontier.shift()!;
        if (visited.has(current) || reservedZones.has(current)) continue;
        visited.add(current);

        const [cx, cy] = current.split(',').map(Number);
        const neighbors = [
            `${cx + 1},${cy}`,
            `${cx - 1},${cy}`,
            `${cx},${cy + 1}`,
            `${cx},${cy - 1}`,
        ];
        for (const n of neighbors) {
            if (!visited.has(n) && !reservedZones.has(n) && Math.random() < 0.8 && visited.size < maxTiles) {
                frontier.push(n);
            }
        }
    }
    visited.forEach(coord => reservedZones.add(coord));
    return visited;
}

function getSettlementBiome(x: number, y: number): BiomeSeed | undefined {
    const coordKey = `${x},${y}`;
    return biomeSeeds.find(seed => seed.settlementName && seed.occupiedCoords?.has(coordKey));
}

function getBiomeForCoords(x: number, y: number): BiomeSeed {
    const coordKey = `${x},${y}`;
    for (const seed of biomeSeeds) {
        if (seed.occupiedCoords?.has(coordKey)) {
            return seed;
        }
    }

    const isSettlement = Math.random() < 0.3;
    const prefix = prefixWords[Math.floor(Math.random() * prefixWords.length)];
    const suffix = suffixWords[Math.floor(Math.random() * suffixWords.length)];
    const xBase = x;
    const yBase = y;

    if (isSettlement) {
        const typeChoices: AreaType[] = ['camp', 'village', 'town', 'city'];
        let type = typeChoices[Math.floor(Math.random() * typeChoices.length)];
        const [min, max] = settlementBlobSizeRange[type] ?? [2, 3];
        const blobSize = Math.floor(Math.random() * (max - min + 1)) + min;
        const blob = generateBlob(xBase, yBase, blobSize);

        const actualSize = blob.size;
        if (actualSize >= 6) type = 'city';
        else if (actualSize >= 4) type = 'town';
        else if (actualSize >= 2) type = 'village';
        else type = 'camp';

        const theme = type;
        const name = getUniqueSettlementName();
        const gateOffset = [
            { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: -1, y: 0 }
        ][Math.floor(Math.random() * 4)];
        const gateCoords = { x: xBase + gateOffset.x, y: yBase + gateOffset.y };
        reservedZones.add(`${gateCoords.x},${gateCoords.y}`);

        const seed: BiomeSeed = {
            x: xBase,
            y: yBase,
            theme,
            type,
            namePrefix: prefix,
            nameSuffix: suffix,
            gateCoords,
            settlementName: name,
            occupiedCoords: blob
        };
        biomeSeeds.push(seed);
        return seed;
    } else {
        const theme = randomTheme();
        const type = randomType();
        const blob = generateBlob(xBase, yBase, Math.floor(Math.random() * 3) + 3);

        const seed: BiomeSeed = {
            x: xBase,
            y: yBase,
            theme,
            type,
            namePrefix: prefix,
            nameSuffix: suffix,
            occupiedCoords: blob
        };
        biomeSeeds.push(seed);
        return seed;
    }
}

// === API ===
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

export function getArea(x: number, y: number): Area {
    const key = `${x},${y}`;
    if (mapData.has(key)) return mapData.get(key)!;

    let seed = getSettlementBiome(x, y);
    if (!seed) {
        seed = getBiomeForCoords(x, y);
    }

    const isSettlementTile = seed.settlementName && seed.occupiedCoords?.has(key);
    const type = isSettlementTile ? seed.type : 'wilderness';
    const theme = seed.theme;
    const positions: { x: number; y: number }[] = [];

    const shouldHaveEnemies = type === 'wilderness' || type === 'dungeon';
    const enemies = shouldHaveEnemies
        ? [(() => {
            const pos = generateSafePosition(positions);
            return {
                ...getRandomEnemyForBiomeAndTheme(theme, theme, 1),
                ...pos,
                radius: 20,
            };
        })()]
        : [];

    let npcs: NPC[] = [];
    let landmarks: Landmark[] = [];

    if (seed.settlementName && ['city', 'town', 'village', 'camp'].includes(seed.type)) {
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
    }

    const isGateTile = seed.gateCoords?.x === x && seed.gateCoords?.y === y;
    const isCoreTile = seed.x === x && seed.y === y;

    const name = seed.settlementName
        ? `${areaTypeLabels[seed.type]} of ${seed.settlementName}`
        : `${seed.namePrefix} ${seed.nameSuffix}`;

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
