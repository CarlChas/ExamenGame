export interface Item {
    id: string;
    name: string;
    description: string;
    type: 'consumable' | 'quest' | 'equipment';
}  