// src/game/skills/skillsData.ts

export interface Skill {
    id: string;
    name: string;
    description: string;
    manaCost: number;
    // Add other properties relevant to skills, e.g.:
    // damageMultiplier?: number;
    // healingAmount?: number;
    // effect?: string; // e.g., 'stun', 'heal', 'buff', 'debuff'
    // target?: 'self' | 'enemy' | 'all_enemies' | 'all_allies';
}

// Define your general skills here
export const allSkills: Skill[] = [
    {
        id: 'basic-attack',
        name: 'Basic Attack',
        description: 'A standard physical attack.',
        manaCost: 0,
        // damageMultiplier: 1.0, // Example property
        // target: 'enemy', // Example property
    },
    {
        id: 'fireball',
        name: 'Fireball',
        description: 'Launches a ball of fire at the enemy.',
        manaCost: 10,
        // damageMultiplier: 1.5, // Example property
        // effect: 'burn', // Example property
        // target: 'enemy', // Example property
    },
    {
        id: 'heal',
        name: 'Heal',
        description: 'Restores a small amount of health.',
        manaCost: 15,
        // healingAmount: 20, // Example property
        // target: 'self', // Example property
    },
    // Add more general skills here
];

// You can add utility functions here later if needed,
// e.g., to find a skill by ID
export const getSkillById = (id: string): Skill | undefined => {
    return allSkills.find(skill => skill.id === id);
};
