export interface EvolutionNode {
    id: string;
    name: string;
    lineage: string;
    requirements?: {
        level?: number;
        stats?: Partial<Record<'strength' | 'dexterity' | 'intelligence' | 'wisdom' | 'endurance' | 'charisma' | 'luck', number>>;
    };
    next?: string[];
}

export const evolutionTrees: Record<string, EvolutionNode[]> = {
    celestial: [
        {
            id: 'celestial-initiate',
            name: 'Celestial Initiate',
            lineage: 'celestial',
            requirements: { level: 2, stats: { wisdom: 4 } },
            next: ['pseudo-angel', 'nephilim']
        },
        {
            id: 'pseudo-angel',
            name: 'Pseudo Angel',
            lineage: 'celestial',
            requirements: { level: 5, stats: { strength: 5, charisma: 5 } },
            next: ['angel', 'fallen-angel']
        },
        {
            id: 'nephilim',
            name: 'Nephilim',
            lineage: 'celestial',
            requirements: { level: 5, stats: { intelligence: 6, wisdom: 6 } },
            next: ['fake-angel']
        }
    ],
    infernal: [
        {
            id: 'infernal-initiate',
            name: 'Infernal Initiate',
            lineage: 'infernal',
            requirements: { level: 2, stats: { dexterity: 3 } },
            next: ['low-demon', 'minor-devil']
        },
        {
            id: 'low-demon',
            name: 'Low Demon',
            lineage: 'infernal',
            requirements: { level: 5, stats: { intelligence: 6, charisma: 4 } },
            next: ['demon']
        },
        {
            id: 'demon',
            name: 'Demon',
            lineage: 'infernal',
            requirements: { level: 5, stats: { intelligence: 6, charisma: 4 } },
            next: ['high-demon']
        },
        {
            id: 'high-demon',
            name: 'High Demon',
            lineage: 'infernal',
            requirements: { level: 5, stats: { intelligence: 6, charisma: 4 } },
            next: ['demon-lord']
        },
        {
            id: 'minor-devil',
            name: 'Minor Devil',
            lineage: 'infernal',
            requirements: { level: 5, stats: { strength: 6, endurance: 5 } },
            next: ['devil']
        },
        {
            id: 'devil',
            name: 'Devil',
            lineage: 'infernal',
            requirements: { level: 5, stats: { strength: 6, endurance: 5 } },
            next: ['true-devil']
        },
        {
            id: 'true-devil',
            name: 'True Devil',
            lineage: 'infernal',
            requirements: { level: 5, stats: { strength: 6, endurance: 5 } },
            next: ['arch-devil']
        }
    ],
    primordial: [
        {
            id: 'primordial-egg',
            name: 'Primordial Egg',
            lineage: 'primordial',
            requirements: { level: 5, stats: { strength: 6, endurance: 5 } },
            next: ['wild-primal', 'intelligent-primal']
        }],
    dragon: [
        {
            id: 'dragon-newt',
            name: 'Draconic Newt',
            lineage: 'dragon',
            requirements: { level: 5, stats: { strength: 6, endurance: 5 } },
            next: ['wyrmling', 'turtle', 'serpentine']
        }],
    outer: [
        {
            id: 'outer-larva',
            name: 'Outer Larva',
            lineage: 'outer',
            requirements: { level: 5, stats: { strength: 6, endurance: 5 } },
            next: ['outer-cocoon', 'outer-eye']
        }],
    legend: [
        {
            id: 'legend-beginner',
            name: 'New Hero',
            lineage: 'legend',
            requirements: { level: 5, stats: { strength: 6, endurance: 5 } },
            next: ['legend-adventurer', 'legend-squire']
        }],
    elemental: [
        {
            id: 'sprite-born',
            name: 'Sprite Born',
            lineage: 'elemental',
            requirements: { level: 5, stats: { strength: 6, endurance: 5 } },
            next: ['lava-born', 'lake-born', 'mud-born', 'wind-born']
        }],
    fey: [
        {
            id: 'pseudo-fairy',
            name: 'Pseudo Fairy',
            lineage: 'fey',
            requirements: { level: 5, stats: { strength: 6, endurance: 5 } },
            next: ['fairy', 'dark-fairy']
        }]
    // Add more lineages as needed...
};
