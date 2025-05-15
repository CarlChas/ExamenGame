import { Character } from '../game/types/characterTypes';
import { BonusStat, LootItem, StatName } from '../game/loot/lootTypes';

// Exact stat keys used in bonus loot
export const validStats: StatName[] = [
    'Strength',
    'Dexterity',
    'Intelligence',
    'Wisdom',
    'Endurance',
    'Charisma',
    'Luck',
    'Divinity',
];

export const statNameMap: Record<StatName, 'strength' | 'dexterity' | 'intelligence' | 'wisdom' | 'endurance' | 'charisma' | 'luck' | 'divinity'> = {
    Strength: 'strength',
    Dexterity: 'dexterity',
    Intelligence: 'intelligence',
    Wisdom: 'wisdom',
    Endurance: 'endurance',
    Charisma: 'charisma',
    Luck: 'luck',
    Divinity: 'divinity',
};

// Collect all bonus stats from equipped items
export function getEquippedBonuses(equipment: Character['equipment']): BonusStat[] {
    const allItems: (LootItem | undefined)[] = [
        equipment.weapon1,
        equipment.weapon2,
        equipment.necklace,
        equipment.belt,
        equipment.ring1,
        equipment.ring2,
        equipment.armor?.helmet,
        equipment.armor?.chest,
        equipment.armor?.back,
        equipment.armor?.legs,
        equipment.armor?.boots,
    ];

    const bonuses: BonusStat[] = [];

    for (const item of allItems) {
        if (item?.bonusStats) {
            bonuses.push(...item.bonusStats);
        }
    }

    return bonuses;
}

// Apply stat bonuses to character based on base stats + equipment
export function applyBonuses(character: Character): Character {
    const updated: Character = { ...character };

    if (!updated.baseStats) {
        updated.baseStats = {
            strength: character.strength,
            dexterity: character.dexterity,
            intelligence: character.intelligence,
            wisdom: character.wisdom,
            endurance: character.endurance,
            charisma: character.charisma,
            luck: character.luck,
            divinity: character.divinity,
        };
    }

    const bonuses = getEquippedBonuses(updated.equipment);
    const flatBonuses: Partial<Record<StatName, number>> = {};
    const percentBonuses: Partial<Record<StatName, number>> = {};

    for (const bonus of bonuses) {
        const stat = bonus.stat as StatName;

        if (bonus.flat) {
            flatBonuses[stat] = (flatBonuses[stat] || 0) + bonus.flat;
        }

        if (bonus.percent) {
            percentBonuses[stat] = (percentBonuses[stat] || 0) + bonus.percent;
        }
    }

    for (const stat of validStats) {
        const base = updated.baseStats[statNameMap[stat]];
        const flat = flatBonuses[stat] || 0;
        const percent = percentBonuses[stat] || 0;

        updated[statNameMap[stat]] = Math.floor((base + flat) * (1 + percent / 100));
    }

    return updated;
}
