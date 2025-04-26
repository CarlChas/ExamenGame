export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type Type = 'weapon' | 'armor' | 'consumable' | 'misc';

export interface LootItem {
    id: string;
    name: string;
    rarity: Rarity;
    type: Type;
    material: string;
    value: number;
}
