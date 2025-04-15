import { EvolutionNode, evolutionTrees } from './evolutionData';
import { Character } from '../types/Character'; // Adjust if necessary

export function getAvailableEvolutions(character: Character, currentId: string): EvolutionNode[] {
  const tree = evolutionTrees[character.lineage] ?? [];
  const current = tree.find(node => node.id === currentId);
  if (!current?.next) return [];

  return tree.filter(node => {
    if (!current.next?.includes(node.id)) return false;

    const meetsLevel = !node.requirements?.level || character.level >= node.requirements.level;
    const meetsStats = !node.requirements?.stats || Object.entries(node.requirements.stats).every(
      ([stat, min]) => (character as any)[stat] >= min
    );

    return meetsLevel && meetsStats;
  });
}
