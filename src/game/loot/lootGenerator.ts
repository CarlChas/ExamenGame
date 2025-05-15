import { weaponTypes, armorPieces, consumables, miscItems, prefixList, suffixList, materials, rarityChances, rankChances } from './lootData';
import { LootItem, Rarity, Type, BonusStat, Rank, StatName } from './lootTypes';

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

function generateBonusStats(rarity: Rarity): BonusStat[] {
    const statsPool: StatName[] = ['Strength', 'Dexterity', 'Intelligence', 'Wisdom', 'Charisma', 'Endurance', 'Luck'];

    const rarityToBonusCount: Record<Rarity, number> = {
        common: 0,
        uncommon: 1,
        rare: 2,
        epic: 3,
        legendary: 4,
        mythic: 5,
    };

    const bonuses: BonusStat[] = [];
    const count = rarityToBonusCount[rarity];

    while (bonuses.length < count) {
        const stat = getRandom(statsPool);
        if (bonuses.find(b => b.stat === stat)) continue;

        bonuses.push({
            stat,
            flat: Math.floor(Math.random() * 5 + 3),         // 3–7 flat bonus
            percent: Math.random() < 0.5 ? parseFloat((Math.random() * 5 + 1).toFixed(1)) : undefined, // 1–6%
        });
    }
    return bonuses;
}

function getRandomRank(): Rank {
    const roll = Math.random();
    let cumulative = 0;
    for (const rank of Object.keys(rankChances) as Rank[]) {
        cumulative += rankChances[rank];
        if (roll < cumulative) return rank;
    }
    return 'F';
}

export function generateRandomLoot(): LootItem {
    const type = getRandom(types);
    const rarity = getRandomRarity();
    const rank = getRandomRank();
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
        rank,
        material,
        value: baseValue,
        bonusStats,
    };
}
