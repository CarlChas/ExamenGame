// src/game/combat/enemies.ts

export interface EnemyMove {
    name: string;
    damageMultiplier: number;
    type?: 'physical' | 'magical';
    effect?: string;
    variance?: number; // e.g. ±3 if set to 3
}

export interface Enemy {
    id: string;
    name: string;
    theme: string;
    level: number;
    maxHp: number;
    attack: number;
    defense: number;
    xp: number;
    moves: EnemyMove[];
    x?: number;
    y?: number;
    radius?: number;
}

type EnemyTemplate = {
    id: string;
    name: string;
    theme: string;
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
        theme: 'undead',
        baseStats: { hp: 30, attack: 6, defense: 2, xp: 15 },
        growth: { hp: 5, attack: 2, defense: 1, xp: 5 },
        moves: [
            { name: 'Bone Slash', damageMultiplier: 1.0, type: 'physical' },
            { name: 'Grave Chill', damageMultiplier: 1.2, type: 'magical', effect: 'slow' },
        ],
    },
    {
        id: 'undead-2',
        name: 'Ghoul',
        theme: 'undead',
        baseStats: { hp: 40, attack: 10, defense: 3, xp: 20 },
        growth: { hp: 6, attack: 3, defense: 1, xp: 6 },
        moves: [
            { name: 'Ghastly Bite', damageMultiplier: 1.1, type: 'physical' },
            { name: 'Shriek', damageMultiplier: 0.8, type: 'magical', effect: 'fear' },
        ],
    },
    {
        id: 'elemental-1',
        name: 'Flame Sprite',
        theme: 'elemental',
        baseStats: { hp: 25, attack: 12, defense: 1, xp: 18 },
        growth: { hp: 4, attack: 4, defense: 0.5, xp: 6 },
        moves: [
            { name: 'Ember Burst', damageMultiplier: 1.3, type: 'magical', effect: 'burn' },
            { name: 'Scorch', damageMultiplier: 1.0, type: 'magical' },
        ],
    },
    {
        id: 'corrupted-1',
        name: 'Shadow Beast',
        theme: 'corrupted',
        baseStats: { hp: 45, attack: 8, defense: 4, xp: 25 },
        growth: { hp: 7, attack: 2, defense: 1.5, xp: 7 },
        moves: [
            { name: 'Dark Pounce', damageMultiplier: 1.2, type: 'physical' },
            { name: 'Corrupting Bite', damageMultiplier: 1.4, type: 'physical', effect: 'curse' },
        ],
    },
    {
        id: 'celestial-1',
        name: 'Fallen Starling',
        theme: 'celestial',
        baseStats: { hp: 35, attack: 9, defense: 2, xp: 20 },
        growth: { hp: 5, attack: 2.5, defense: 1, xp: 6 },
        moves: [
            { name: 'Starfall', damageMultiplier: 1.5, type: 'magical' },
            { name: 'Radiant Slash', damageMultiplier: 1.1, type: 'physical' },
        ],
    }
];

export function getRandomEnemyForTheme(theme: string, playerLevel: number): Enemy {
    const filtered = enemyTemplates.filter(e => e.theme === theme);

    // Fallback if no enemy matches the theme
    const template = filtered.length > 0
        ? filtered[Math.floor(Math.random() * filtered.length)]
        : enemyTemplates[Math.floor(Math.random() * enemyTemplates.length)];

    return {
        id: template.id,
        name: template.name,
        theme: template.theme,
        level: playerLevel,
        maxHp: Math.floor(template.baseStats.hp + template.growth.hp * playerLevel),
        attack: Math.floor(template.baseStats.attack + template.growth.attack * playerLevel),
        defense: Math.floor(template.baseStats.defense + template.growth.defense * playerLevel),
        xp: Math.floor(template.baseStats.xp + template.growth.xp * playerLevel),
        moves: template.moves,
    };
}
