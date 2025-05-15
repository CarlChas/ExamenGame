import { Rarity } from '../game/loot/lootTypes';

export const rarityColor = (rarity: Rarity): string => {
    switch (rarity) {
        case 'common': return '#ccc';
        case 'uncommon': return '#4caf50';
        case 'rare': return '#2196f3';
        case 'epic': return '#9c27b0';
        case 'legendary': return '#ff9800';
        case 'mythic': return '#e91e63';
        default: return '#fff';
    }
};
