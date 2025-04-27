import { Character } from '../types/characterTypes';
import { getEquippedItems } from '../../utils/getEquippedItems';

export function calculateEffectiveStats(player: Character): Character {
    let bonusFlat: Record<string, number> = {};
    let bonusPercent: Record<string, number> = {};

    const equippedItems = getEquippedItems(player);

    equippedItems.forEach(item => {
        item.bonusStats?.forEach(stat => {
            if (stat.flat) {
                bonusFlat[stat.stat] = (bonusFlat[stat.stat] || 0) + stat.flat;
            }
            if (stat.percent) {
                bonusPercent[stat.stat] = (bonusPercent[stat.stat] || 0) + stat.percent;
            }
        });
    });

    const newStats = { ...player };

    for (const stat in bonusFlat) {
        const key = stat.toLowerCase();
        if (key in newStats) {
            (newStats as any)[key] += bonusFlat[stat];
        }
    }

    for (const stat in bonusPercent) {
        const key = stat.toLowerCase();
        if (key in newStats) {
            (newStats as any)[key] = Math.floor((newStats as any)[key] * (1 + bonusPercent[stat] / 100));
        }
    }

    return newStats;
}
