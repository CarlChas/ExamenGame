import { Character } from '../game/types/characterTypes';
import { LootItem } from '../game/loot/lootTypes';

export function getEquippedItems(player: Character): LootItem[] {
    const { weapon1, weapon2, armor, necklace, belt, ring1, ring2 } = player.equipment;

    const items: (LootItem | undefined)[] = [
        weapon1,
        weapon2,
        armor?.helmet,
        armor?.chest,
        armor?.back,
        armor?.legs,
        armor?.boots,
        necklace,
        belt,
        ring1,
        ring2,
    ];

    return items.filter((item): item is LootItem => item !== undefined);
}
