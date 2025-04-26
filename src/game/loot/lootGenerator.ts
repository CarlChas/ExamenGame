import { weaponTypes, armorPieces, consumables, prefixList, suffixList, materials } from './lootData';
import { LootItem, Rarity, Type } from './lootTypes';

function getRandom<T>(list: readonly T[]): T {
    return list[Math.floor(Math.random() * list.length)];
}

const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
const types: Type[] = ['weapon', 'armor', 'consumable', 'misc'];

export function generateRandomLoot(): LootItem {
    const type = getRandom(types);
    const rarity = getRandom(rarities);
    const prefix = Math.random() < 0.7 ? getRandom(prefixList) : null;
    const suffix = Math.random() < 0.7 ? getRandom(suffixList) : null;

    let baseName = '';
    let material = '';

    if (type === 'weapon') {
        material = getRandom(materials);
        const weapon = getRandom(weaponTypes);
        baseName = `${prefix ? prefix + ' ' : ''}${material} ${weapon}${suffix ? ' ' + suffix : ''}`;
    } else if (type === 'armor') {
        material = getRandom(materials);
        const armor = getRandom(armorPieces);
        baseName = `${prefix ? prefix + ' ' : ''}${material} ${armor}${suffix ? ' ' + suffix : ''}`;
    } else if (type === 'consumable') {
        baseName = `${prefix ? prefix + ' ' : ''}${getRandom(consumables)}${suffix ? ' ' + suffix : ''}`;
    } else {
        const miscItems = ['Ancient Coin', 'Old Map', 'Mystery Box', 'Gemstone'];
        baseName = `${prefix ? prefix + ' ' : ''}${getRandom(miscItems)}${suffix ? ' ' + suffix : ''}`;
    }

    // Value calculation
    let baseValue = 10;
    switch (type) {
        case 'weapon':
        case 'armor':
            baseValue += Math.floor(Math.random() * 50) + 25;
            break;
        case 'consumable':
            baseValue += Math.floor(Math.random() * 20) + 5;
            break;
        case 'misc':
            baseValue += Math.floor(Math.random() * 15) + 5;
            break;
    }

    return {
        id: Date.now().toString(),
        name: baseName,
        type,
        rarity,
        material,
        value: baseValue,
    };
}
