import { LootItem } from '../loot';

interface Props {
    items: LootItem[];
    onRemove: (id: string) => void;
    onInspect: (item: LootItem) => void;
    onEquip: (item: LootItem) => void;
    onUnequip: (item: LootItem) => void;
    isEquipped: (item: LootItem) => boolean;
}

const Inventory = ({ items, onRemove, onEquip, onUnequip, isEquipped }: Props) => {
    return (
        <div style={{ marginTop: '2rem', color: 'white' }}>
            <h4>Inventory</h4>
            {items.length === 0 && <p style={{ color: '#aaa' }}>Empty</p>}
            <ul style={{ padding: 0, listStyle: 'none' }}>
                {items.map(item => (
                    <li key={item.id}>
                        <strong>{item.name}</strong>
                        {isEquipped(item) && <span style={{ color: 'green' }}> (Equipped)</span>}
                        <button onClick={() => isEquipped(item) ? onUnequip(item) : onEquip(item)}>
                            {isEquipped(item) ? 'Unequip' : 'Equip'}
                        </button>

                        <button onClick={() => onRemove(item.id)}>🗑️ Remove</button>
                    </li>
                ))}

            </ul>
        </div>
    );
};

export default Inventory;
