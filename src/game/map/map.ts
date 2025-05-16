// src/game/map/map.ts

import { Enemy } from '../../combat/enemies';
import { getRandomEnemyForBiomeAndTheme } from '../../combat/enemies';
import { generateSpecificNPC, NPC } from '../npcs/npcGenerator';

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
    connectedToGate?: boolean;
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
    city: [12, 20],
    town: [8, 11],
    village: [4, 7],
    camp: [1, 3],
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
    return biomeSeeds.find(seed => {
        return (
            seed.settlementName &&
            (
                seed.occupiedCoords?.has(coordKey) || // normal tiles
                (seed.gateCoords?.x === x && seed.gateCoords?.y === y) // include gate tile
            )
        );
    });
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

        // Prevent adjacency to other settlements
        const minBuffer = 2;
        const touchesOtherSettlement = biomeSeeds.some(existing => {
            if (!existing.settlementName || !existing.occupiedCoords) return false;
            for (const coord of blob) {
                const [cx, cy] = coord.split(',').map(Number);
                for (let dx = -minBuffer; dx <= minBuffer; dx++) {
                    for (let dy = -minBuffer; dy <= minBuffer; dy++) {
                        if (dx === 0 && dy === 0) continue;
                        const neighborKey = `${cx + dx},${cy + dy}`;
                        if (existing.occupiedCoords.has(neighborKey)) return true;
                    }
                }
            }
            return false;
        });

        if (touchesOtherSettlement) {
            return getBiomeForCoords(x + 1, y); // retry in new location
        }

        const actualSize = blob.size;
        if (actualSize >= 12) type = 'city';
        else if (actualSize >= 8) type = 'town';
        else if (actualSize >= 4) type = 'village';
        else type = 'camp';

        const theme = type;
        const name = getUniqueSettlementName();

        let gateCoords: { x: number; y: number } | undefined;

        if (type !== 'camp') {
            const blobCoords = Array.from(blob);
            for (const coord of blobCoords) {
                const [gx, gy] = coord.split(',').map(Number);
                const neighbors = [
                    { x: gx + 1, y: gy },
                    { x: gx - 1, y: gy },
                    { x: gx, y: gy + 1 },
                    { x: gx, y: gy - 1 },
                ];

                for (const neighbor of neighbors) {
                    const key = `${neighbor.x},${neighbor.y}`;
                    if (!blob.has(key) && !reservedZones.has(key)) {
                        gateCoords = neighbor;
                        reservedZones.add(key);
                        blob.add(key);
                        console.log('🛠 Gate selected at:', gateCoords, 'for', name);

                        break;
                    }
                }

                if (gateCoords) break;
            }
        }

        const seed: BiomeSeed = {
            x: xBase,
            y: yBase,
            theme,
            type,
            namePrefix: prefix,
            nameSuffix: suffix,
            settlementName: name,
            occupiedCoords: blob,
            ...(gateCoords && { gateCoords }),
        };

        biomeSeeds.push(seed);

        return seed;

    } else {
        // Non-settlement biome
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
            occupiedCoords: blob,
        };

        biomeSeeds.push(seed);
        return seed;
    }
}

function connectToNearestGate(seed: BiomeSeed) {
    if (!seed.gateCoords) return;
    if (seed.type === 'camp') return false; // ❌ skip camps completely

    const { x: startX, y: startY } = seed.gateCoords;

    const candidates = biomeSeeds.filter(s =>
        s !== seed && s.gateCoords && s.settlementName
    );

    if (!candidates.length) return;

    let closest = candidates[0];
    let minDist = Infinity;

    for (const other of candidates) {
        const dx = other.gateCoords!.x - startX;
        const dy = other.gateCoords!.y - startY;
        const dist = dx * dx + dy * dy;
        if (dist < minDist) {
            minDist = dist;
            closest = other;
        }
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
    mapData.clear();
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
            const npc = generateSpecificNPC(landmarkType, pos.x, pos.y);
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
    if (isGateTile && seed && !seed.connectedToGate && seed.type !== 'camp') {
        connectToNearestGate(seed);
        seed.connectedToGate = true;
    }

    if (role === 'gate') {
        console.log('🚪 This tile is a GATE:', key, 'Name:', name);
    }
    // console.log('Area seed for', key, '→', seed.settlementName, seed.type, seed.theme);


    if (isGateTile) console.log('THIS TILE IS A GATE:', key);


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