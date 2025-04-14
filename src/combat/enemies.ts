// src/game/combat/enemies.ts

export interface EnemyMove {
    name: string;
    damageMultiplier: number;
    type?: 'physical' | 'magical';
    effect?: string;
    variance?: number;
}

export interface Enemy {
    id: string;
    name: string;
    level: number;
    maxHp: number;
    attack: number;
    defense: number;
    xp: number;
    theme: string;
    biomes: string[];
    moves: EnemyMove[];
    x?: number;
    y?: number;
    radius?: number;
}

type EnemyTemplate = {
    id: string;
    name: string;
    themes: string[];
    biomes: string[];
    baseStats: {
        hp: number;
        attack: number;
        defense: number;
        xp: number;
    };
    growth: {
        hp: number;
        attack: number;
        defense: number;
        xp: number;
    };
    moves: EnemyMove[];
};

const enemyTemplates: EnemyTemplate[] = [
    {
        id: 'undead-1',
        name: 'Rotting Skeleton',
        themes: ['undead'],
        biomes: ['tundra', 'swamp', 'forest'],
        baseStats: { hp: 30, attack: 6, defense: 2, xp: 15 },
        growth: { hp: 5, attack: 2, defense: 1, xp: 5 },
        moves: [
            { name: 'Bone Slash', damageMultiplier: 1.0 },
            { name: 'Grave Chill', damageMultiplier: 1.2, effect: 'slow' },
        ],
    },
    {
        id: 'elemental-1',
        name: 'Flame Sprite',
        themes: ['elemental'],
        biomes: ['desert', 'volcano'],
        baseStats: { hp: 25, attack: 12, defense: 1, xp: 18 },
        growth: { hp: 4, attack: 4, defense: 0.5, xp: 6 },
        moves: [
            { name: 'Ember Burst', damageMultiplier: 1.3, effect: 'burn' },
            { name: 'Scorch', damageMultiplier: 1.0 },
        ],
    },
    {
        id: 'corrupted-1',
        name: 'Shadow Beast',
        themes: ['corrupted'],
        biomes: ['swamp', 'wasteland'],
        baseStats: { hp: 45, attack: 8, defense: 4, xp: 25 },
        growth: { hp: 7, attack: 2, defense: 1.5, xp: 7 },
        moves: [
            { name: 'Dark Pounce', damageMultiplier: 1.2 },
            { name: 'Corrupting Bite', damageMultiplier: 1.4, effect: 'curse' },
        ],
    },
    {
        id: 'celestial-1',
        name: 'Fallen Starling',
        themes: ['celestial'],
        biomes: ['mountain', 'tundra'],
        baseStats: { hp: 35, attack: 9, defense: 2, xp: 20 },
        growth: { hp: 5, attack: 2.5, defense: 1, xp: 6 },
        moves: [
            { name: 'Starfall', damageMultiplier: 1.5 },
            { name: 'Radiant Slash', damageMultiplier: 1.1 },
        ],
    }
];

// Utility to get a random enemy that fits both biome and theme
export function getRandomEnemyForBiomeAndTheme(biome: string, theme: string, playerLevel: number): Enemy {
    const filtered = enemyTemplates.filter(e =>
        e.biomes.includes(biome) && e.themes.includes(theme)
    );

    const fallback = enemyTemplates.find(e => e.themes.includes(theme)) || enemyTemplates[0];
    const template = filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : fallback;

    return {
        id: template.id,
        name: template.name,
        level: playerLevel,
        theme: template.themes[0],
        biomes: template.biomes,
        maxHp: Math.floor(template.baseStats.hp + template.growth.hp * playerLevel),
        attack: Math.floor(template.baseStats.attack + template.growth.attack * playerLevel),
        defense: Math.floor(template.baseStats.defense + template.growth.defense * playerLevel),
        xp: Math.floor(template.baseStats.xp + template.growth.xp * playerLevel),
        moves: template.moves,
    };
}