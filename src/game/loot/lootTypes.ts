export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface LootItem {
    id: string;
    name: string;
    rarity: Rarity;
    type: string;
    material: string;
    value: number;
}
