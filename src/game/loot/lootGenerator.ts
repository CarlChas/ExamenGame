import { weaponTypes, armorPieces, consumables, miscItems, prefixList, suffixList, materials, rarityChances } from './lootData';
import { LootItem, Rarity, Type, BonusStat } from './lootTypes';

function getRandom<T>(list: readonly T[]): T {
    return list[Math.floor(Math.random() * list.length)];
}

function getRandomRarity(): Rarity {
    const roll = Math.random();
    let cumulative = 0;
    for (const rarity of ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'] as const) {
        cumulative += rarityChances[rarity];
        if (roll < cumulative) return rarity;
    }
    return 'common';
}

const types: Type[] = ['weapon', 'armor', 'consumable', 'misc'];
const possibleStats = ['Strength', 'Dexterity', 'Intelligence', 'Endurance', 'Luck'];

function generateBonusStats(rarity: Rarity): BonusStat[] {
    if (rarity === 'common') return [];

    const numBonuses = rarity === 'uncommon' ? 1 : 2; // epic+ could even have 2
    const bonuses: BonusStat[] = [];

    for (let i = 0; i < numBonuses; i++) {
        const stat = getRandom(possibleStats);
        const hasFlat = Math.random() < 0.7;    // 70% chance to get flat bonus
        const hasPercent = Math.random() < 0.5; // 50% chance to get % bonus

        bonuses.push({
            stat,
            flat: hasFlat ? Math.floor(Math.random() * 10) + 1 : undefined,  // +1 to +10
            percent: hasPercent ? parseFloat((Math.random() * 5).toFixed(1)) : undefined, // +0.1% to +5.0%
        });
    }

    return bonuses;
}

export function generateRandomLoot(): LootItem {
    const type = getRandom(types);
    const rarity = getRandomRarity();
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

    const bonusStats = generateBonusStats(rarity);

    return {
        id: Date.now().toString(),
        name: baseName,
        type,
        rarity,
        material,
        value: baseValue,
        bonusStats,
    };
}
