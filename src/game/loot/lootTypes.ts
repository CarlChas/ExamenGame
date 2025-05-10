// lootTypes.ts

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type Type = 'weapon' | 'armor' | 'consumable' | 'misc';

export type Rank = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS' | 'UR' | 'EX';

export interface LootItem {
  id: string;
  name: string;
  rarity: Rarity;
  rank: Rank;
  type: Type;
  material: string;
  value: number;
  bonusStats?: BonusStat[];
}


export interface BonusStat {
    stat: string;
    flat?: number;
    percent?: number;
}
