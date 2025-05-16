// src/game/npcs/npcGenerator.ts

export type NPC = {
    name: string;
    dialog: string;
    type: string;
    x: number;
    y: number;
    radius: number;
    landmark?: string;
};

export type SettlementType =
    | 'village'
    | 'town'
    | 'city'
    | 'camp'
    | 'dungeon'
    | 'corrupted'
    | 'wilderness'
    | 'default';

const npcTemplates = {
    oracle: { names: ['Oracle', 'Seer', 'Starwatcher'], dialogs: ['The stars murmur truths...', 'Visions come and go...', 'Destiny bends, but never breaks.'] },
    guard: { names: ['Guard', 'Warden', 'Sentinel'], dialogs: ['Keep your weapons sheathed.', 'No one leaves unchanged.', 'Trouble doesn’t last long here.'] },
    sage: { names: ['Sage', 'Archivist', 'Lorekeeper'], dialogs: ['Ask, and I may answer.', 'Wisdom outlasts even gods.', 'Knowledge is the true treasure.'] },
    wanderer: { names: ['Wanderer', 'Nomad', 'Stranger'], dialogs: ['Another soul walks the void...', 'Been to places you wouldn’t believe.', 'The journey never ends.'] },
    blacksmith: { names: ['Smith', 'Forgehand', 'Anvilborn'], dialogs: ['Need a blade reforged?', 'My hammer shapes destiny.', 'Every strike counts.'] },
    tavern: { names: ['Barkeep', 'Innkeeper', 'Alehand'], dialogs: ['What’ll it be?', 'Plenty of rumors around.', 'Rooms are upstairs.'] },
    inn: { names: ['Host', 'Innkeeper', 'Lodgemaster'], dialogs: ['A room and a meal?', 'Rest easy here.', 'Weary feet find peace.'] },
    market: { names: ['Vendor', 'Stallkeeper', 'Barterer'], dialogs: ['Fresh wares daily!', 'Deals of the day!', 'No refunds!'] },
    temple: { names: ['Cleric', 'Acolyte', 'Priest'], dialogs: ['The gods are watching.', 'Prayers answered... sometimes.', 'Faith sustains all.'] },
    guild: { names: ['Guildmaster', 'Contractor', 'Broker'], dialogs: ['Looking for work?', 'Plenty of bounties waiting.', 'Join or step aside.'] },
    fountain: { names: ['Watcher', 'Caretaker', 'Wisher'], dialogs: ['Toss a coin...', 'They say it’s enchanted.', 'Ancient water flows here.'] },
} as const;


type NPCTemplateType = keyof typeof npcTemplates;

const allowedTypesBySettlement: Record<SettlementType, readonly NPCTemplateType[]> = {
    village: ['market', 'inn', 'guard', 'sage', 'fountain'],
    town: ['market', 'blacksmith', 'inn', 'guard', 'guild', 'temple'],
    city: ['market', 'blacksmith', 'guild', 'tavern', 'inn', 'temple', 'guard', 'oracle'],
    camp: ['wanderer', 'market', 'guard'],
    dungeon: ['sage', 'wanderer'],
    corrupted: ['oracle', 'wanderer', 'guard'],
    wilderness: ['wanderer', 'oracle'],
    default: ['wanderer', 'market'],
};

const npcCountBySettlement: Record<SettlementType, [number, number]> = {
    village: [2, 4],
    town: [4, 7],
    city: [6, 10],
    camp: [1, 2],
    dungeon: [1, 2],
    corrupted: [1, 2],
    wilderness: [1, 1],
    default: [1, 2],
};

function getRandom<T>(list: readonly T[]): T {
    return list[Math.floor(Math.random() * list.length)];
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateNPCsForArea(areaType: SettlementType, xBounds: [number, number], yBounds: [number, number]): NPC[] {
    const [minNpcs, maxNpcs] = npcCountBySettlement[areaType] || npcCountBySettlement.default;
    const randomNpcCount = getRandomInt(minNpcs, maxNpcs);
    const allowedTypes = allowedTypesBySettlement[areaType] || allowedTypesBySettlement.default;

    const npcs: NPC[] = [];

    while (npcs.length < randomNpcCount) {
        const type = getRandom(allowedTypes);
        const x = getRandomInt(xBounds[0], xBounds[1]);
        const y = getRandomInt(yBounds[0], yBounds[1]);
        npcs.push(generateSpecificNPC(type, x, y));
    }

    return npcs;
}

export function generateSpecificNPC(type: NPCTemplateType, x: number, y: number, landmark?: string): NPC {
    const template = npcTemplates[type];
    const name = getRandom(template.names);
    const dialog = getRandom(template.dialogs);
    return { name, dialog, type, x, y, radius: 25, landmark };
}
