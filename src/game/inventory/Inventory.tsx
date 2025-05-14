import { LootItem } from '../loot';

interface Props {
    items: LootItem[];
    onRemove: (id: string) => void;
    onInspect: (item: LootItem) => void;
    onEquip: (item: LootItem) => void;
}

const Inventory = ({ items, onRemove, onInspect, onEquip }: Props) => {
    return (
        <div style={{ marginTop: '2rem', color: 'white' }}>
            <h4>Inventory</h4>
            {items.length === 0 && <p style={{ color: '#aaa' }}>Empty</p>}
            <ul style={{ padding: 0, listStyle: 'none' }}>
                {items.map(item => (
                    <li key={item.id} style={{
                        backgroundColor: '#333',
                        padding: '0.5rem',
                        marginBottom: '0.5rem',
                        borderRadius: '4px'
                    }}>
                        <strong>{item.name}</strong>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>{item.rarity.toUpperCase()} {item.type}</p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => onInspect(item)}>🔍 Inspect</button>
                            {(item.type === 'weapon' || item.type === 'armor') && (
                                <button onClick={() => onEquip(item)}>🛡️ Equip</button>
                            )}
                            <button onClick={() => onRemove(item.id)}>🗑️ Remove</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Inventory;
