import { Rarity } from './lootTypes';

export const materials = ['Wooden', 'Copper', 'Iron', 'Steel', 'Obsidian', 'Magisteel', 'Dragonbone', 'Adamantium', 'Mythril'];

export const itemTypes = ['Sword', 'Axe', 'Dagger', 'Bow', 'Staff', 'Wand', 'Greataxe', 'Greatsword', 'Rapier', 'Shield'];

export const prefixList = [
    'Ancient',
    'Cursed',
    'Glorious',
    'Shimmering',
    'Infernal',
    'Blessed',
    'Shadowed',
    'Divine',
];

export const suffixList = [
    'of the Bear',
    'of Flames',
    'of the Void',
    'of the Moon',
    'of Agility',
    'of Power',
    'of Wisdom',
    'of Doom',
];
export const rarityChances: Record<Rarity, number> = {
    common: 0.5,
    uncommon: 0.25,
    rare: 0.15,
    epic: 0.08,
    legendary: 0.02,
    mythic: 0.01,
};
