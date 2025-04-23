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

function randomTheme(): string {
    return themes[Math.floor(Math.random() * themes.length)];
}

function randomType(): AreaType {
    const types: AreaType[] = ['wilderness', 'town', 'dungeon', 'city', 'village', 'camp'];
    return types[Math.floor(Math.random() * types.length)];
}

const settlementNames = [
    'Eastridge', 'Westhaven', 'Oakmoor', 'Dunmere', 'Ravenhollow',
    'Thornbrook', 'Stonebridge', 'Glimmerford', 'Ironvale', 'Redfield'
];
const usedSettlementNames = new Set<string>();
function getUniqueSettlementName(): string {
    const available = settlementNames.filter(name => !usedSettlementNames.has(name));
    if (available.length === 0) return 'Unnamed Settlement';
    const name = available[Math.floor(Math.random() * available.length)];
    usedSettlementNames.add(name);
    return name;
}

const areaTypeLabels: Record<AreaType, string> = {
    city: 'City',
    town: 'Town',
    village: 'Village',
    camp: 'Camp',
    wilderness: 'Wilderness',
    dungeon: 'Dungeon',
};

const settlementBlobSizeRange: Partial<Record<AreaType, [number, number]>> = {
    city: [8, 12],
    town: [6, 8],
    village: [3, 5],
    camp: [2, 3]
};

const biomeSeeds: BiomeSeed[] = [];
const reservedZones = new Set<string>();

interface BiomeSeed {
    x: number;
    y: number;
    theme: string;
    type: AreaType;
    gateCoords?: { x: number; y: number };
    namePrefix: string;
    nameSuffix: string;
    settlementName?: string;
    occupiedCoords?: Set<string>; // blob tiles
}

function generateBlob(x: number, y: number, maxTiles: number): Set<string> {
    const frontier = [`${x},${y}`];
    const visited = new Set<string>();

    while (frontier.length && visited.size < maxTiles) {
        const current = frontier.shift()!;
        if (visited.has(current) || reservedZones.has(current)) continue;
        visited.add(current);
        reservedZones.add(current);

        const [cx, cy] = current.split(',').map(Number);
        const neighbors = [
            `${cx + 1},${cy}`,
            `${cx - 1},${cy}`,
            `${cx},${cy + 1}`,
            `${cx},${cy - 1}`,
        ];
        neighbors.forEach(n => {
            if (!visited.has(n) && !reservedZones.has(n) && Math.random() < 0.8) {
                frontier.push(n);
            }
        });
    }
    return visited;
}

function generateBiomeSeeds(seedCount = 6) {
    if (biomeSeeds.length > 0) return;

    let attempts = 0;
    while (biomeSeeds.length < seedCount && attempts < seedCount * 20) {
        const x = Math.floor(Math.random() * 20 - 10);
        const y = Math.floor(Math.random() * 20 - 10);
        const key = `${x},${y}`;
        if (reservedZones.has(key)) {
            attempts++;
            continue;
        }

        const prefix = prefixWords[Math.floor(Math.random() * prefixWords.length)];
        const suffix = suffixWords[Math.floor(Math.random() * suffixWords.length)];

        const baseTheme = randomTheme();

        // Randomly decide if this will be a settlement
        const isSettlement = Math.random() < 0.6; // ~60% chance

        let type: AreaType = 'wilderness';
        let blob: Set<string> | undefined;
        let settlementName: string | undefined;
        let theme = baseTheme;
        let gateCoords: { x: number; y: number } | undefined;

        if (isSettlement) {
            const typeChoices: AreaType[] = ['camp', 'village', 'town', 'city'];
            type = typeChoices[Math.floor(Math.random() * typeChoices.length)];
            const [min, max] = settlementBlobSizeRange[type] ?? [3, 4];
            const blobSize = Math.floor(Math.random() * (max - min + 1)) + min;
            blob = generateBlob(x, y, blobSize);

            settlementName = getUniqueSettlementName();
            theme = type;

            const gateOffset = [
                { x: 0, y: 1 },
                { x: 1, y: 0 },
                { x: 0, y: -1 },
                { x: -1, y: 0 },
            ][Math.floor(Math.random() * 4)];
            gateCoords = { x: x + gateOffset.x, y: y + gateOffset.y };

            if (gateCoords) reservedZones.add(`${gateCoords.x},${gateCoords.y}`);
        } else {
            type = randomType();
            const size = Math.floor(Math.random() * (8 - 4 + 1)) + 4;
            blob = generateBlob(x, y, size);
        }

        // Apply blob to all cases
        // if (blob) reservedZones.forEach(coord => blob?.add(coord));

        biomeSeeds.push({
            x,
            y,
            theme,
            type,
            namePrefix: prefix,
            nameSuffix: suffix,
            gateCoords,
            settlementName,
            occupiedCoords: blob
        });

        attempts++;
    }
}

function getSettlementBiome(x: number, y: number): BiomeSeed | undefined {
    const coordKey = `${x},${y}`;
    return biomeSeeds.find(seed => seed.settlementName && seed.occupiedCoords?.has(coordKey));
}

function getBiomeForCoords(x: number, y: number): BiomeSeed {
    generateBiomeSeeds();

    const coordKey = `${x},${y}`;
    for (const seed of biomeSeeds) {
        if (seed.occupiedCoords?.has(coordKey)) {
            return seed;
        }
    }

    // fallback (shouldn't hit often)
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

    generateBiomeSeeds();

    const settlementBiome = getSettlementBiome(x, y);
    const biome = getBiomeForCoords(x, y);
    const seed = settlementBiome || biome;

    const type = seed.type;
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

    const isGateTile = seed.gateCoords?.x === x && seed.gateCoords?.y === y;
    const isCoreTile = seed.x === x && seed.y === y;

    let name: string = seed.settlementName
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
