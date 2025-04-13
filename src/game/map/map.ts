// src/game/map/map.ts

import { Enemy } from '../../combat/enemies';
import { getRandomEnemyForTheme } from '../../combat/enemies';

export interface NPC {
    name: string;
    x: number;
    y: number;
    radius: number;
    dialog: string;
}

export type AreaType = 'wilderness' | 'dungeon' | 'town' | 'gate';
export type DirectionKey = 'north' | 'south' | 'east' | 'west';

export interface Area {
    name: string;
    npcs: NPC[];
    enemies?: Enemy[];
    coords: string;
    theme: string;
    type?: AreaType;
    event?: string;
    blocked?: Partial<Record<DirectionKey, boolean>>;
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

const npcNames = ['Oracle', 'Trainer', 'Sage', 'Merchant', 'Guard', 'Wanderer'];
const npcDialogs = [
    'Seek wisdom in every path.',
    'The gods favor the bold.',
    'A challenge awaits to the north.',
    'Care to trade stories?',
    'No one leaves unchanged.',
    'Another soul walks the void...',
];

function randomNPC(): NPC {
    const name = npcNames[Math.floor(Math.random() * npcNames.length)];
    const dialog = npcDialogs[Math.floor(Math.random() * npcDialogs.length)];
    return {
        name,
        dialog,
        x: Math.floor(Math.random() * 500 + 50),
        y: Math.floor(Math.random() * 300 + 50),
        radius: 25,
    };
}

const themes = ['corrupted', 'infernal', 'celestial', 'undead', 'elemental'];
const types: AreaType[] = ['wilderness', 'town', 'dungeon', 'gate'];
const prefixWords = ['Twisted', 'Ancient', 'Mystic', 'Forgotten', 'Sacred', 'Wretched'];
const suffixWords = ['Woods', 'Sanctum', 'Vale', 'Pass', 'Ruins', 'Hollow'];

function randomTheme(): string {
    return themes[Math.floor(Math.random() * themes.length)];
}

function randomType(): AreaType {
    return types[Math.floor(Math.random() * types.length)];
}

function generateAreaName(theme: string): string {
    const prefix = prefixWords[Math.floor(Math.random() * prefixWords.length)];
    const suffix = suffixWords[Math.floor(Math.random() * suffixWords.length)];
    return `${prefix} ${suffix} (${theme})`;
}

function generateStructuredBlockedDirections(x: number, y: number): Partial<Record<DirectionKey, boolean>> {
    const blocked: Partial<Record<DirectionKey, boolean>> = {
        north: true,
        south: true,
        east: true,
        west: true,
    };

    const isEvenRow = y % 2 === 0;
    const isEvenCol = x % 2 === 0;

    if (isEvenRow) {
        blocked.east = false;
        blocked.west = false;
    }

    if (isEvenCol) {
        blocked.north = false;
        blocked.south = false;
    }

    return blocked;
}

export function getArea(x: number, y: number): Area {
    const key = `${x},${y}`;
    if (mapData.has(key)) return mapData.get(key)!;

    const theme = randomTheme();
    const type = randomType();
    const npcCount = Math.floor(Math.random() * 3) + 1;
    const npcs: NPC[] = Array.from({ length: npcCount }, randomNPC);

    const enemies = type === 'wilderness' || type === 'dungeon'
        ? [getRandomEnemyForTheme(theme, 1)]
        : [];

    const newArea: Area = {
        name: generateAreaName(theme),
        npcs,
        enemies,
        coords: key,
        theme,
        type,
        blocked: generateStructuredBlockedDirections(x, y),
    };

    mapData.set(key, newArea);
    return newArea;
}
