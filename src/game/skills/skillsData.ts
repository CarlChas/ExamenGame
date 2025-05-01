// src/game/skills/skillsData.ts

export interface Skill {
    id: string;
    name: string;
    description: string;
    manaCost: number;
    damageMultiplier?: number;
    healingAmount?: number;
    effect?: string; // e.g., 'stun', 'heal', 'buff', 'debuff'
    target?: 'self' | 'enemy' | 'all_enemies' | 'all_allies';
    scalingStat?: 'strength' | 'intelligence' | 'dexterity' | 'wisdom' | 'charisma' | 'luck'; // ✅ NEW
}

export const allSkills: Skill[] = [
    {
        id: 'basic-attack',
        name: 'Basic Attack',
        description: 'A standard physical attack.',
        manaCost: 0,
        damageMultiplier: 1.0,
        scalingStat: 'strength', // ✅ Uses strength
        target: 'enemy',
    },
    {
        id: 'fireball',
        name: 'Fireball',
        description: 'Launches a ball of fire at the enemy.',
        manaCost: 10,
        damageMultiplier: 1.5,
        scalingStat: 'intelligence', // ✅ Uses intelligence
        effect: 'burn',
        target: 'enemy',
    },
    {
        id: 'heal',
        name: 'Heal',
        description: 'Restores a small amount of health.',
        manaCost: 15,
        healingAmount: 20,
        scalingStat: 'intelligence', // ✅ Heals based on intelligence
        target: 'self',
    }
];


// You can add utility functions here later if needed,
// e.g., to find a skill by ID
export const getSkillById = (id: string): Skill | undefined => {
    return allSkills.find(skill => skill.id === id);
};
