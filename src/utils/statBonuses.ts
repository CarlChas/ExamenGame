import { Character } from '../game/types/characterTypes';
import { BonusStat, LootItem, StatName } from '../game/loot/lootTypes';

const validStats: StatName[] = [
    'Strength',
    'Dexterity',
    'Intelligence',
    'Wisdom',
    'Endurance',
    'Charisma',
    'Luck',
    'Divinity',
];

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

export function applyBonuses(character: Character): Character {
    const updated = { ...character };
    const bonuses = getEquippedBonuses(character.equipment);

    const flatBonuses: Partial<Record<StatName, number>> = {};
    const percentBonuses: Partial<Record<StatName, number>> = {};

    for (const bonus of bonuses) {
        const stat = bonus.stat;

        if (bonus.flat) {
            flatBonuses[stat] = (flatBonuses[stat] || 0) + bonus.flat;
        }

        if (bonus.percent) {
            percentBonuses[stat] = (percentBonuses[stat] || 0) + bonus.percent;
        }
    }

    for (const stat of validStats) {
        if (validStats.includes(stat)) {
            const flat = flatBonuses[stat] || 0;
            const percent = percentBonuses[stat] || 0;

            switch (stat) {
                case 'Strength': updated.strength = Math.floor((updated.strength + flat) * (1 + percent / 100)); break;
                case 'Dexterity': updated.dexterity = Math.floor((updated.dexterity + flat) * (1 + percent / 100)); break;
                case 'Intelligence': updated.intelligence = Math.floor((updated.intelligence + flat) * (1 + percent / 100)); break;
                case 'Wisdom': updated.wisdom = Math.floor((updated.wisdom + flat) * (1 + percent / 100)); break;
                case 'Endurance': updated.endurance = Math.floor((updated.endurance + flat) * (1 + percent / 100)); break;
                case 'Charisma': updated.charisma = Math.floor((updated.charisma + flat) * (1 + percent / 100)); break;
                case 'Luck': updated.luck = Math.floor((updated.luck + flat) * (1 + percent / 100)); break;
                case 'Divinity': updated.divinity = Math.floor((updated.divinity + flat) * (1 + percent / 100)); break;
            }
        }

    }

    return updated;
}
