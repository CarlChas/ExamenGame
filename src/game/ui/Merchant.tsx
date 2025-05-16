import { LootItem } from '../loot';

interface Props {
    onClose: () => void;
    inventory: LootItem[];
    onSell: (item: LootItem) => void;
}

const MerchantModal = ({ onClose, inventory, onSell }: Props) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 2000,
            color: 'white',
            padding: '2rem',
            overflowY: 'auto'
        }}>
            <button onClick={onClose} style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                backgroundColor: '#b00',
                color: '#fff',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
            }}>X</button>

            <h2>🛒 Merchant</h2>
            <p>Click "Sell" to exchange an item for gold.</p>

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {inventory.map(item => (
                    <li key={item.id} style={{
                        marginBottom: '1rem',
                        padding: '0.5rem',
                        borderBottom: '1px solid #444'
                    }}>
                        <strong>{item.name}</strong> {item.value ? `(${item.value} gold)` : ''}
                        <br />
                        <button onClick={() => onSell(item)}>💰 Sell</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MerchantModal;
