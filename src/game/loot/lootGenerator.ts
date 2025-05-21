import { weaponTypes, armorPieces, consumables, miscItems, prefixList, suffixList, materials, rarityChances, rankChances } from './lootData';
import { LootItem, Rarity, Type, BonusStat, Rank, StatName } from './lootTypes';
import { calculateItemValue } from './calcItemValue';

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

function generateBonusStats(rarity: Rarity, level: number): BonusStat[] {
    const statsPool: StatName[] = [
        'Strength',
        'Dexterity',
        'Intelligence',
        'Wisdom',
        'Charisma',
        'Endurance',
        'Luck',
    ];

    const rarityToBonusCount: Record<Rarity, number> = {
        common: 1,
        uncommon: Math.random() < 0.5 ? 2 : 1,
        rare: Math.random() < 0.5 ? 3 : 2,
        epic: Math.random() < 0.5 ? 4 : 3,
        legendary: Math.random() < 0.5 ? 5 : 4,
        mythic: Math.random() < 0.5 ? 6 : 5,
    };

    const rarityFlatScale: Record<Rarity, number> = {
        common: 0.2,
        uncommon: 0.4,
        rare: 0.6,
        epic: 0.8,
        legendary: 1.0,
        mythic: 1.3,
    };

    const rarityPercentCap: Record<Rarity, number> = {
        common: 3,
        uncommon: 5,
        rare: 7,
        epic: 9,
        legendary: 12,
        mythic: 15,
    };

    const bonuses: BonusStat[] = [];
    const count = rarityToBonusCount[rarity];
    const flatScale = rarityFlatScale[rarity];
    const percentCap = rarityPercentCap[rarity];

    while (bonuses.length < count) {
        const stat = getRandom(statsPool);
        if (bonuses.find((b) => b.stat === stat)) continue;

        const flat = Math.floor(level * flatScale + Math.random() * 3); // ±0–2

        let percent: number | undefined;
        if (Math.random() < 0.5) {
            const scaledPercent = level * 0.02 + Math.random(); // 2% per 100 levels
            percent = parseFloat(Math.min(scaledPercent, percentCap).toFixed(2));
        }

        bonuses.push({ stat, flat, percent });
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

export function generateRandomLoot(playerLevel: number): LootItem {
    const type = getRandom(types);
    const rarity = getRandomRarity();
    const rank = getRandomRank();
    const prefix = Math.random() < 0.7 ? getRandom(prefixList) : null;
    const suffix = Math.random() < 0.7 ? getRandom(suffixList) : null;

    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const levelVariance = Math.max(1, Math.floor(playerLevel * 0.2));
    const minLevel = Math.max(1, playerLevel - levelVariance);
    const maxLevel = playerLevel + levelVariance;
    const lootLevel = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;

    if (type === 'weapon' || type === 'armor') {
        const material = getRandom(materials);
        const itemNameBase = type === 'weapon' ? getRandom(weaponTypes) : getRandom(armorPieces);
        const name = `${prefix ? prefix + ' ' : ''}${material} ${itemNameBase}${suffix ? ' ' + suffix : ''}`;
        const bonusStats = generateBonusStats(rarity, lootLevel);

        const item: LootItem = {
            id,
            name,
            type,
            rarity,
            rank,
            material,
            bonusStats,
            level: lootLevel,
            value: 0, // placeholder
        };

        item.value = calculateItemValue(item);
        return item;
    }

    if (type === 'consumable') {
        const effectTypes = ['heal', 'mana'] as const;
        const effectType = getRandom(effectTypes);
        const usePercent = Math.random() < 0.5;

        const effect = usePercent
            ? { type: effectType, percent: Math.floor(Math.random() * 20) + 10 }
            : { type: effectType, amount: Math.floor(Math.random() * 25) + 15 };

        const useCustomName = Math.random() > 0.2;
        const effectName = useCustomName
            ? getRandom(consumables)
            : effectType === 'heal'
                ? usePercent ? 'Elixir of Vitality' : 'Health Potion'
                : usePercent ? 'Elixir of Focus' : 'Mana Potion';

        const name = `${prefix ? prefix + ' ' : ''}${effectName}${suffix ? ' ' + suffix : ''}`;

        const item: LootItem = {
            id,
            name,
            type,
            rarity,
            rank,
            level: lootLevel,
            effect,
            value: 0,
        };

        item.value = calculateItemValue(item);
        return item;
    }

    // misc item
    const name = `${prefix ? prefix + ' ' : ''}${getRandom(miscItems)}${suffix ? ' ' + suffix : ''}`;
    const item: LootItem = {
        id,
        name,
        type,
        rarity,
        rank,
        value: 0,
    };

    item.value = calculateItemValue(item);
    return item;
}