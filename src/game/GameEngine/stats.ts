import { Character } from '../types/characterTypes';

export const calculateMaxHp = (char: Character) =>
  char.endurance * 10 + char.strength * 2 + char.level * 5;

export const calculateMaxMp = (char: Character) =>
  char.wisdom * 10 + char.intelligence * 2 + char.level * 5;

export const calculateNextLevelXp = (level: number) =>
  level * 100;
