import { itemTypes, prefixList, suffixList } from './lootData';
import { LootItem, Rarity } from './lootTypes';

function getRandom<T>(list: readonly T[]): T {
    return list[Math.floor(Math.random() * list.length)];
}

export function generateRandomLoot(): LootItem {
    const type = getRandom(itemTypes);
    const rarity = getRandom(['common', 'uncommon', 'rare', 'epic', 'legendary']) as Rarity;
    const prefix = Math.random() < 0.7 ? getRandom(prefixList) : null;
    const suffix = Math.random() < 0.7 ? getRandom(suffixList) : null;

    const baseName = `${prefix ? prefix + ' ' : ''}${type}${suffix ? ' ' + suffix : ''}`;

    return {
        id: Date.now().toString(),
        name: baseName,
        type,
        rarity,
        material: '',
        value: Math.floor(Math.random() * 100) + 10,
    };
}
