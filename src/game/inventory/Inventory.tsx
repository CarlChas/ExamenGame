import { LootItem } from '../loot';

interface Props {
    items: LootItem[];
    onRemove: (id: string) => void;
    onInspect: (item: LootItem) => void;
    onEquip: (item: LootItem) => void;
    onUnequip: (item: LootItem) => void;
    isEquipped: (item: LootItem) => boolean;
    onUse: (item: LootItem) => void;
}

const Inventory = ({ items, onRemove, onEquip, onUnequip, isEquipped, onInspect, onUse }: Props) => {
    return (
        <div style={{ marginTop: '2rem', color: 'white' }}>
            <h4>Inventory</h4>
            {items.length === 0 && <p style={{ color: '#aaa' }}>Empty</p>}
            <ul style={{ padding: 0, listStyle: 'none' }}>
                {items.map(item => (
                    <li key={item.id} style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div>
                                <strong
                                    onClick={() => onInspect(item)}
                                    style={{
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        color: 'lightblue',
                                    }}
                                >
                                    {item.name}
                                </strong>
                                {isEquipped(item) && (
                                    <span style={{ color: 'green', marginLeft: '0.5rem' }}>(Equipped)</span>
                                )}
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '0.5rem',
                                marginTop: '0.3rem',
                                flexWrap: 'wrap',
                                justifyContent: 'flex-start'
                            }}>
                                {item.type === 'consumable' ? (
                                    <button onClick={() => onUse(item)}>Use</button>
                                ) : (
                                    <button onClick={() => isEquipped(item) ? onUnequip(item) : onEquip(item)}>
                                        {isEquipped(item) ? 'Unequip' : 'Equip'}
                                    </button>
                                )}
                                <button onClick={() => onRemove(item.id)}>🗑️ Remove</button>
                            </div>
                        </div>
                    </li>

                ))}
            </ul>
        </div>
    );
};

export default Inventory;
