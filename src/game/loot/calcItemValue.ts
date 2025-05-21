import { LootItem, Rarity, Rank, BonusStat } from './lootTypes';

const rarityMultiplier: Record<Rarity, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2.5,
    epic: 4,
    legendary: 7,
    mythic: 10,
};

const rankMultiplier: Record<Rank, number> = {
    F: 1,
    E: 1.2,
    D: 1.5,
    C: 2,
    B: 2.5,
    A: 3,
    S: 4,
    SS: 5,
    SSS: 6,
    UR: 7,
    EX: 10,
};

const materialMultiplier: Record<string, number> = {
    Wooden: 0.8,
    Copper: 1.0,
    Iron: 1.2,
    Steel: 1.5,
    Obsidian: 1.7,
    Magisteel: 2.0,
    Dragonbone: 2.5,
    Adamantium: 3,
    Mythril: 4,
};

function calculateBonusStatValue(stats: BonusStat[] = []): number {
    return stats.reduce((total, stat) => {
        const flatValue = stat.flat ?? 0;
        const percentValue = (stat.percent ?? 0) * 2; // percent has lower weight
        return total + flatValue + percentValue;
    }, 0);
}

export function calculateItemValue(item: LootItem): number {
    const base = 10;

    const rarityFactor = rarityMultiplier[item.rarity] ?? 1;
    const rankFactor = rankMultiplier[item.rank] ?? 1;
    const materialFactor = item.material ? materialMultiplier[item.material] ?? 1 : 1;
    const bonusValue = calculateBonusStatValue(item.bonusStats);
    const levelFactor = item.level ? 1 + item.level * 0.5 : 1;

    let total = base + bonusValue;

    total *= rarityFactor * rankFactor * materialFactor;
    total += levelFactor;

    if (item.effect) {
        const effectStrength =
            item.effect.amount ?? ((item.effect.percent ?? 0) * 10);
        total += effectStrength * 2;
    }

    return Math.round(total);
}
