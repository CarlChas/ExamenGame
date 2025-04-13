// src/game/map/map.ts

export interface NPC {
    name: string;
    x: number;
    y: number;
    radius: number;
    dialog: string;
}

export interface Area {
    name: string;
    npcs: NPC[];
    coords: string;
    theme: string;       // 👈 new
    event?: string;
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

// 🏞️ Themes and naming elements
const themes = ['corrupted', 'infernal', 'celestial', 'undead', 'elemental'];
const prefixWords = ['Twisted', 'Ancient', 'Mystic', 'Forgotten', 'Sacred', 'Wretched'];
const suffixWords = ['Woods', 'Sanctum', 'Vale', 'Pass', 'Ruins', 'Hollow'];

function randomTheme(): string {
    return themes[Math.floor(Math.random() * themes.length)];
}

function generateAreaName(theme: string): string {
    const prefix = prefixWords[Math.floor(Math.random() * prefixWords.length)];
    const suffix = suffixWords[Math.floor(Math.random() * suffixWords.length)];
    return `${prefix} ${suffix} (${theme})`;
}

export function getArea(x: number, y: number): Area {
    const key = `${x},${y}`;

    if (mapData.has(key)) {
        return mapData.get(key)!;
    }

    const npcCount = Math.floor(Math.random() * 3) + 1;
    const npcs: NPC[] = Array.from({ length: npcCount }, randomNPC);

    const theme = randomTheme();
    const name = generateAreaName(theme);

    const newArea: Area = {
        name,
        npcs,
        coords: key,
        theme,
    };

    mapData.set(key, newArea);
    return newArea;
}
