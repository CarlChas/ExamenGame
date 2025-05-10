import { Character } from '../types/characterTypes';

export const calculateMaxHp = (char: Character): number =>
  char.endurance * 10 + char.strength * 2 + char.level * 5;

export const calculateMaxMp = (char: Character): number =>
  char.wisdom * 10 + char.intelligence * 2 + char.level * 5;

export const calculateNextLevelXp = (level: number): number =>
  level * 100;

export const normalizeCharacter = (char: Character): Character => {
  const maxHp = calculateMaxHp(char);
  const maxMp = calculateMaxMp(char);

  return {
    ...char,
    maxHp,
    maxMp,
    currentHp: Math.min(char.currentHp ?? maxHp, maxHp),
    currentMp: Math.min(char.currentMp ?? maxMp, maxMp),
  };
};
