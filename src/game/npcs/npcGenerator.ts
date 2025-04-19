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
        dialogs: [
            'The stars murmur truths, if you know how to listen.',
            'Visions come and go like tides.',
            'Destiny bends, but never breaks.',
        ],
    },
    guard: {
        names: ['Guard', 'Warden', 'Sentinel'],
        dialogs: [
            'No one leaves unchanged.',
            'Keep your weapons sheathed here.',
            'Trouble doesn’t last long around me.',
        ],
    },
    merchant: {
        names: ['Trader', 'Merchant', 'Peddler'],
        dialogs: [
            'Care to trade stories—or coin?',
            'Goods from all corners of the realm!',
            'Everything has a price.',
        ],
    },
    sage: {
        names: ['Sage', 'Archivist', 'Lorekeeper'],
        dialogs: [
            'Knowledge is the truest treasure.',
            'Ask, and I may answer.',
            'Wisdom outlasts even gods.',
        ],
    },
    wanderer: {
        names: ['Wanderer', 'Nomad', 'Stranger'],
        dialogs: [
            'Another soul walks the void...',
            'Been to places you wouldn’t believe.',
            'The journey never ends.',
        ],
    },
};

export function generateRandomNPC(x: number, y: number): NPC {
    const types = Object.keys(npcTemplates);
    const type = types[Math.floor(Math.random() * types.length)];
    const template = npcTemplates[type];

    const name = template.names[Math.floor(Math.random() * template.names.length)];
    const dialog = template.dialogs[Math.floor(Math.random() * template.dialogs.length)];

    return { name, dialog, type, x, y, radius: 25 };
}
