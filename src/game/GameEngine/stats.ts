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
    equipment: {
      weapon1: char.equipment?.weapon1 ?? undefined,
      weapon2: char.equipment?.weapon2 ?? undefined,
      armor: {
        helmet: char.equipment?.armor?.helmet ?? undefined,
        chest: char.equipment?.armor?.chest ?? undefined,
        back: char.equipment?.armor?.back ?? undefined,
        legs: char.equipment?.armor?.legs ?? undefined,
        boots: char.equipment?.armor?.boots ?? undefined,
      },
      necklace: char.equipment?.necklace ?? undefined,
      belt: char.equipment?.belt ?? undefined,
      ring1: char.equipment?.ring1 ?? undefined,
      ring2: char.equipment?.ring2 ?? undefined,
    },
    maxHp,
    maxMp,
    currentHp: Math.min(char.currentHp ?? maxHp, maxHp),
    currentMp: Math.min(char.currentMp ?? maxMp, maxMp),
  };
};

