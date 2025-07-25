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

type NPCCountRange = [number, number];
type NPCCountLimit = number | NPCCountRange;

const maxNPCsPerType: Partial<Record<SettlementType, Partial<Record<NPCTemplateType, NPCCountLimit>>>> = {
    village: { market: [1, 3], guard: [1, 2], inn: 1 },
    town: { market: [2, 4], guard: [1, 3], blacksmith: 1 },
    city: { market: [3, 5], guard: [2, 4], oracle: [0, 1], guild: [1, 2] },
    camp: { guard: [0, 1] },
};

const npcTemplates = {
    oracle: { names: ['Oracle', 'Seer', 'Starwatcher'], dialogs: ['The stars murmur truths...', 'Visions come and go...', 'Destiny bends, but never breaks.'] },
    guard: { names: ['Guard', 'Warden', 'Sentinel'], dialogs: ['Keep your weapons sheathed.', 'No one leaves unchanged.', 'Trouble doesn’t last long here.'] },
    sage: { names: ['Sage', 'Archivist', 'Lorekeeper'], dialogs: ['Ask, and I may answer.', 'Wisdom outlasts even gods.', 'Knowledge is the true treasure.'] },
    wanderer: { names: ['Wanderer', 'Nomad', 'Stranger'], dialogs: ['Another soul walks the void...', 'Been to places you wouldn’t believe.', 'The journey never ends.'] },
    blacksmith: { names: ['Smith', 'Forgehand', 'Anvilborn'], dialogs: ['Need a blade reforged?', 'My hammer shapes destiny.', 'Every strike counts.'] },
    tavern: { names: ['Barkeep', 'Innkeeper', 'Alehand'], dialogs: ['What’ll it be?', 'Plenty of rumors around.', 'Rooms are upstairs.'] },
    inn: { names: ['Host', 'Innkeeper', 'Lodgemaster'], dialogs: ['A room and a meal?', 'Rest easy here.', 'Weary feet find peace.'] },
    market: { names: ['Vendor', 'Stallkeeper', 'Barterer', 'Merchant'], dialogs: ['Fresh wares daily!', 'Deals of the day!', 'No refunds!'] },
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
    village: [4, 7],
    town: [8, 11],
    city: [12, 20],
    camp: [1, 3],
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

export function generateNPCsForArea(
    areaType: SettlementType,
    xBounds: [number, number],
    yBounds: [number, number],
    existingNPCs: NPC[] = []
): NPC[] {
    const [minNpcs, maxNpcs] = npcCountBySettlement[areaType] || npcCountBySettlement.default;
    const targetNpcCount = getRandomInt(minNpcs, maxNpcs);
    const allowedTypes = allowedTypesBySettlement[areaType] || allowedTypesBySettlement.default;
    const typeLimits: Partial<Record<NPCTemplateType, NPCCountLimit>> =
        maxNPCsPerType[areaType] ?? ({} as Partial<Record<NPCTemplateType, NPCCountLimit>>);

    const defaultLimit: NPCCountRange = [0, 1];

    const npcs: NPC[] = [...existingNPCs];
    const typeCounts: Partial<Record<NPCTemplateType, number>> = {};

    // Step 1: Pre-fill required minimums
    for (const type of allowedTypes) {
        const raw = typeLimits[type] ?? defaultLimit;
        const [minCount] = Array.isArray(raw) ? raw : [raw, raw];

        for (let i = 0; i < minCount; i++) {
            const x = getRandomInt(xBounds[0], xBounds[1]);
            const y = getRandomInt(yBounds[0], yBounds[1]);
            npcs.push(generateSpecificNPC(type, x, y));
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        }
    }

    // Step 2: Random-fill up to max per type and total target
    let attempts = 0;
    const maxAttempts = 100;

    while (npcs.length < targetNpcCount && attempts < maxAttempts) {
        const type = getRandom(allowedTypes);
        const raw = typeLimits[type] ?? defaultLimit;
        const [maxCount] = Array.isArray(raw) ? raw : [raw, raw];

        const currentCount = typeCounts[type] || 0;
        if (currentCount < maxCount) {
            const x = getRandomInt(xBounds[0], xBounds[1]);
            const y = getRandomInt(yBounds[0], yBounds[1]);
            npcs.push(generateSpecificNPC(type, x, y));
            typeCounts[type] = currentCount + 1;
        }

        attempts++;
    }


    return npcs;
}


export function generateSpecificNPC(type: NPCTemplateType, x: number, y: number, landmark?: string): NPC {
    const template = npcTemplates[type];
    const name = getRandom(template.names);
    const dialog = getRandom(template.dialogs);
    return { name, dialog, type, x, y, radius: 25, landmark };
}
