// src/game/skills/lineageSkillsData.ts

import { Skill } from './skillsData'; // Import the Skill interface
// You might eventually want to import lineages from evolutionData.ts
// import { evolutionTrees } from '../evolution/evolutionData';

// Define skills specific to lineages using the lineages from evolutionData.ts
export const lineageSkills: { [lineage: string]: Skill[] } = {
    'celestial': [
        // Celestial-specific skills here
        {
            id: 'celestial-light-blast',
            name: 'Light Blast',
            description: 'Unleashes a burst of holy energy.',
            manaCost: 15,
            // Add other skill properties
        },
        {
            id: 'celestial-healing-touch',
            name: 'Healing Touch',
            description: 'Heals a small amount of HP.',
            manaCost: 10,
            // Add other skill properties
        },
    ],
    'infernal': [
        // Infernal-specific skills here
        {
            id: 'infernal-shadow-bolt',
            name: 'Shadow Bolt',
            description: 'Hurls a bolt of dark magic.',
            manaCost: 12,
            // Add other skill properties
        },
        {
            id: 'infernal-fire-breath',
            name: 'Fire Breath',
            description: 'Breathes fire, damaging all enemies.',
            manaCost: 20,
            // Add other skill properties
        },
    ],
    'primordial': [
        // Primordial-specific skills here
    ],
    'dragon': [
        // Dragon-specific skills here
    ],
    'outer': [
        // Outer-specific skills here
    ],
    'legend': [
        // Legend-specific skills here
    ],
    'elemental': [
        // Elemental-specific skills here
    ],
    'fey': [
        // Fey-specific skills here
    ],
    // Add more lineages and their skills as defined in evolutionData.ts
};

// Utility to get skills for a specific lineage
export const getLineageSkills = (lineage: string): Skill[] => {
    return lineageSkills[lineage] || [];
};
