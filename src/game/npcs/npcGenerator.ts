// src/game/npcs/npcGenerator.ts

export type NPC = {
    name: string;
    dialog: string;
    type: string;
    x: number;
    y: number;
    radius: number;
};

const npcTemplates: Record<string, { names: string[]; dialogs: string[] }> = {
    oracle: {
        names: ['Oracle', 'Seer', 'Starwatcher'],
        dialogs: ['The stars murmur truths...', 'Visions come and go...', 'Destiny bends, but never breaks.'],
    },
    guard: {
        names: ['Guard', 'Warden', 'Sentinel'],
        dialogs: ['Keep your weapons sheathed.', 'No one leaves unchanged.', 'Trouble doesn’t last long here.'],
    },
    merchant: {
        names: ['Trader', 'Merchant', 'Peddler'],
        dialogs: ['Care to trade?', 'Goods from all realms!', 'Everything has a price.'],
    },
    sage: {
        names: ['Sage', 'Archivist', 'Lorekeeper'],
        dialogs: ['Ask, and I may answer.', 'Wisdom outlasts even gods.', 'Knowledge is the true treasure.'],
    },
    wanderer: {
        names: ['Wanderer', 'Nomad', 'Stranger'],
        dialogs: ['Another soul walks the void...', 'Been to places you wouldn’t believe.', 'The journey never ends.'],
    },
    blacksmith: {
        names: ['Smith', 'Forgehand', 'Anvilborn'],
        dialogs: ['Need a blade reforged?', 'My hammer shapes destiny.', 'Every strike counts.'],
    },
    tavern: {
        names: ['Barkeep', 'Innkeeper', 'Alehand'],
        dialogs: ['What’ll it be?', 'Plenty of rumors around.', 'Rooms are upstairs.'],
    },
    inn: {
        names: ['Host', 'Innkeeper', 'Lodgemaster'],
        dialogs: ['A room and a meal?', 'Rest easy here.', 'Weary feet find peace.'],
    },
    market: {
        names: ['Vendor', 'Stallkeeper', 'Barterer'],
        dialogs: ['Fresh wares daily!', 'Deals of the day!', 'No refunds!'],
    },
    temple: {
        names: ['Cleric', 'Acolyte', 'Priest'],
        dialogs: ['The gods are watching.', 'Prayers answered... sometimes.', 'Faith sustains all.'],
    },
    guild: {
        names: ['Guildmaster', 'Contractor', 'Broker'],
        dialogs: ['Looking for work?', 'Plenty of bounties waiting.', 'Join or step aside.'],
    },
    fountain: {
        names: ['Watcher', 'Caretaker', 'Wisher'],
        dialogs: ['Toss a coin...', 'They say it’s enchanted.', 'Ancient water flows here.'],
    },
};

export function generateRandomNPC(x: number, y: number): NPC {
    const types = Object.keys(npcTemplates);
    const type = types[Math.floor(Math.random() * types.length)];
    return generateSpecificNPCForLandmark(type, x, y);
}

export function generateSpecificNPCForLandmark(type: string, x: number, y: number): NPC {
    const template = npcTemplates[type];
    if (!template) throw new Error(`Unknown NPC type: ${type}`);

    const name = template.names[Math.floor(Math.random() * template.names.length)];
    const dialog = template.dialogs[Math.floor(Math.random() * template.dialogs.length)];

    return { name, dialog, type, x, y, radius: 25 };
}
