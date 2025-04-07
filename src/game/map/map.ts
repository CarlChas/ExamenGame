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
    coords: string; // for debug / tracking
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

export function getArea(x: number, y: number): Area {
    const key = `${x},${y}`;

    if (mapData.has(key)) {
        return mapData.get(key)!;
    }

    // Otherwise generate a new area
    const npcCount = Math.floor(Math.random() * 3) + 1;
    const npcs: NPC[] = [];

    for (let i = 0; i < npcCount; i++) {
        npcs.push(randomNPC());
    }

    const newArea: Area = {
        name: `Wilderness (${x}, ${y})`,
        npcs,
        coords: key,
    };

    mapData.set(key, newArea);
    return newArea;
}
