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

  // New fields (for gameplay progress)
  pos?: { x: number; y: number };
  map?: any;
  inventory?: any[];
}
