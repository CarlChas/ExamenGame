import { Rarity, Rank } from './lootTypes';

export const materials = ['Wooden', 'Copper', 'Iron', 'Steel', 'Obsidian', 'Magisteel', 'Dragonbone', 'Adamantium', 'Mythril'];

export const weaponTypes = ['Sword', 'Axe', 'Dagger', 'Bow', 'Staff', 'Wand', 'Greataxe', 'Greatsword', 'Rapier', 'Shield'];

export const armorPieces = ['Helmet', 'Chestplate', 'Leggings', 'Boots', 'Gauntlets', 'Shield'];

export const consumables = ['Health Potion', 'Mana Potion', 'Elixir', 'Antidote'];

export const miscItems = ['Ancient Coin', 'Old Map', 'Mystery Box', 'Gemstone'];

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

export const rankChances: Record<Rank, number> = {
    F: 0.25,
    E: 0.2,
    D: 0.15,
    C: 0.12,
    B: 0.1,
    A: 0.08,
    S: 0.05,
    SS: 0.03,
    SSS: 0.015,
    UR: 0.01,
    EX: 0.005,
};