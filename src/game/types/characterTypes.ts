import { LootItem } from '../loot/lootTypes';

export interface Character {
  id: number;
  name: string;
  color: string;
  strength: number;
  dexterity: number;
  intelligence: number;
  wisdom: number;
  endurance: number;
  charisma: number;
  luck: number;
  divinity: number;
  lineage: string;
  level: number;
  xp: number;
  currentHp: number;
  currentMp: number;
  maxHp: number;
  maxMp: number;

  equipment: {
    weapon1?: LootItem;
    weapon2?: LootItem;
    armor: {
      helmet?: LootItem;
      chest?: LootItem;
      back?: LootItem;
      legs?: LootItem;
      boots?: LootItem;
    };
    necklace?: LootItem;
    belt?: LootItem;
    ring1?: LootItem;
    ring2?: LootItem;
  };

  pos?: { x: number; y: number };
  map?: any;
  inventory?: LootItem[];

  baseStats?: {
    strength: number;
    dexterity: number;
    intelligence: number;
    wisdom: number;
    endurance: number;
    charisma: number;
    luck: number;
    divinity: number;
  };

}