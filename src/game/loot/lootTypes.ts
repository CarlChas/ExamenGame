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

export type StatName =
  | 'Strength'
  | 'Dexterity'
  | 'Intelligence'
  | 'Wisdom'
  | 'Endurance'
  | 'Charisma'
  | 'Luck'
  | 'Divinity';

export interface BonusStat {
  stat: StatName;
  flat?: number;
  percent?: number;
}