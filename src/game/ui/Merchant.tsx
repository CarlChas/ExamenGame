import { LootItem } from '../loot';

interface Props {
    onClose: () => void;
    inventory: LootItem[];
    merchantItems: LootItem[];
    onSell: (item: LootItem) => void;
    onBuy: (item: LootItem) => void;
    gold: number;
    onInspect: (item: LootItem) => void;
}

const MerchantModal = ({
    onClose,
    inventory,
    merchantItems,
    onSell,
    onBuy,
    gold,
    onInspect,
}: Props) => {
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0,0,0,0.95)',
                zIndex: 2000,
                color: 'white',
                padding: '2rem',
                overflowY: 'auto',
            }}
        >
            <h2>🛒 Merchant</h2>
            <p>Welcome! You can buy or sell items here.</p>
            <p><strong>💰 Your Gold:</strong> {gold}</p>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                    <h3>🧳 Your Inventory</h3>
                    {inventory.length === 0 && <p>No items to sell.</p>}
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {inventory.map((item) => (
                            <li key={item.id} style={{ marginBottom: '1rem' }}>
                                <strong>{item.name}</strong>
                                <span style={{ fontSize: '0.75rem', color: '#ccc', marginLeft: '0.5rem' }}>
                                    {typeof item.level === 'number' ? `Lv ${item.level}` : ''}
                                </span>
                                <br />
                                <span style={{ color: '#aaa' }}>{item.value ?? 0} gold</span>
                                <br />
                                <button onClick={() => onSell(item)}>💰 Sell</button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div style={{ flex: 1 }}>
                    <h3>📦 Items for Sale</h3>
                    {merchantItems.length === 0 && <p>This merchant has nothing in stock.</p>}
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {merchantItems.map((item) => (
                            <li key={item.id} style={{ marginBottom: '1rem' }}>
                                <span
                                    onClick={() => onInspect(item)}
                                    style={{
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        color: '#9cf',
                                        fontWeight: 'bold',
                                    }}
                                    title="Click to inspect"
                                >
                                    {item.name}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#ccc', marginLeft: '0.5rem' }}>
                                    {typeof item.level === 'number' ? `Lv ${item.level}` : ''}
                                </span>
                                <br />
                                <span style={{ color: '#aaa' }}>{item.value ?? 0} gold</span>
                                <br />
                                <button onClick={() => onBuy(item)}>🛒 Buy</button>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>

            <button
                onClick={onClose}
                style={{
                    marginTop: '2rem',
                    backgroundColor: '#b00',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                Close
            </button>
        </div>
    );
};

export default MerchantModal;
