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

    let baseName = '';
    let material = '';
    let baseValue = 10;

    const lootLevel = playerLevel;

    if (type === 'weapon') {
        material = getRandom(materials);
        const weapon = getRandom(weaponTypes);
        baseName = `${prefix ? prefix + ' ' : ''}${material} ${weapon}${suffix ? ' ' + suffix : ''}`;
        baseValue += Math.floor(Math.random() * 50) + 25;

        return {
            id: Date.now().toString(),
            name: baseName,
            type,
            rarity,
            rank,
            material,
            value: baseValue,
            bonusStats: generateBonusStats(rarity, lootLevel),
        };
    }

    if (type === 'armor') {
        material = getRandom(materials);
        const armor = getRandom(armorPieces);
        baseName = `${prefix ? prefix + ' ' : ''}${material} ${armor}${suffix ? ' ' + suffix : ''}`;
        baseValue += Math.floor(Math.random() * 50) + 25;

        return {
            id: Date.now().toString(),
            name: baseName,
            type,
            rarity,
            rank,
            material,
            value: baseValue,
            bonusStats: generateBonusStats(rarity, lootLevel),
        };
    }

    if (type === 'consumable') {
        const effectTypes = ['heal', 'mana'] as const;
        const effectType = getRandom(effectTypes);
        const usePercent = Math.random() < 0.5;

        const effect = usePercent
            ? { type: effectType, percent: Math.floor(Math.random() * 20) + 10 }
            : { type: effectType, amount: Math.floor(Math.random() * 25) + 15 };

        const value = usePercent
            ? Math.floor((effect.percent ?? 10) * 1.5)
            : Math.floor((effect.amount ?? 15) * 1.2);

        // 🔀 80% chance to use dynamic naming, 20% chance to use predefined consumables
        const useCustomName = Math.random() > 0.2;

        let effectName = '';

        if (useCustomName) {
            effectName = getRandom(consumables); // from lootData.ts
        } else {
            effectName =
                effectType === 'heal'
                    ? usePercent
                        ? 'Elixir of Vitality'
                        : 'Health Potion'
                    : usePercent
                        ? 'Elixir of Focus'
                        : 'Mana Potion';
        }

        const baseName = `${prefix ? prefix + ' ' : ''}${effectName}${suffix ? ' ' + suffix : ''}`;

        return {
            id: Date.now().toString(),
            name: baseName,
            type,
            rarity,
            rank,
            value,
            effect,
        };
    }

    // misc
    baseName = `${prefix ? prefix + ' ' : ''}${getRandom(miscItems)}${suffix ? ' ' + suffix : ''}`;
    baseValue += Math.floor(Math.random() * 15) + 5;

    return {
        id: Date.now().toString(),
        name: baseName,
        type,
        rarity,
        rank,
        value: baseValue,
    };
}
