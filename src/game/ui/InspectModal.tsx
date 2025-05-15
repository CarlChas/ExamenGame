// import React from 'react';
import { LootItem } from '../loot/lootTypes';
import { rarityColor } from '../../utils/colorUtils';

interface Props {
    item: LootItem;
    onClose: () => void;
}

const InspectModal = ({ item, onClose }: Props) => {
    return (
        <div style={{
            position: 'fixed',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#222',
            color: '#fff',
            padding: '2rem',
            borderRadius: '10px',
            zIndex: 1000,
            maxWidth: '400px'
        }}>
            <h2 style={{ marginTop: 0 }}>{item.name}</h2>
            <p>Type: {item.type}</p>
            <p>Rarity: <span style={{ color: rarityColor(item.rarity) }}>{item.rarity}</span></p>
            <p>Material: {item.material}</p>
            <p>Value: {item.value}g</p>
            {item.rank && <p>Rank: {item.rank}</p>}

            {item.bonusStats && item.bonusStats.length > 0 && (
                <>
                    <h4>Bonus Stats</h4>
                    <ul>
                        {item.bonusStats.map((stat: any, idx: number) => (
                            <li key={idx}>
                                {stat.stat}:
                                {stat.flat !== undefined && ` +${stat.flat}`}
                                {stat.percent !== undefined && ` (+${stat.percent}%)`}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <button onClick={onClose} style={{ marginTop: '1rem' }}>Close</button>
        </div>
    );
};

export default InspectModal;
