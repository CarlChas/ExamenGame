import { Item } from './inventoryTypes';

interface Props {
    items: Item[];
    onRemove: (id: string) => void;
}

const Inventory = ({ items, onRemove }: Props) => {
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
                        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>{item.description}</p>
                        <button onClick={() => onRemove(item.id)}>🗑️ Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Inventory;
