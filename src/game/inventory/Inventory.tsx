import { LootItem } from '../loot';

interface Props {
    items: LootItem[];
    onRemove: (id: string) => void;
    onInspect?: (item: LootItem) => void;
}

const Inventory = ({ items, onRemove, onInspect }: Props) => {
    return (
        <div style={{ marginTop: '2rem', color: 'white' }}>
            <h4>Inventory</h4>
            {items.length === 0 && <p style={{ color: '#aaa' }}>Empty</p>}
            <ul style={{ padding: 0, listStyle: 'none' }}>
                {items.map(item => (
                    <li
                        key={item.id}
                        onClick={() => onInspect?.(item)}
                        style={{
                            backgroundColor: '#333',
                            padding: '0.5rem',
                            marginBottom: '0.5rem',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        <strong>{item.name}</strong>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                            {item.type} - {item.rarity.toUpperCase()} {item.rank && `(${item.rank})`}
                        </p>
                        <button onClick={(e) => {
                            e.stopPropagation();
                            onRemove(item.id);
                        }}>
                            🗑️ Remove
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Inventory;
