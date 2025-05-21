import { useState, useRef } from 'react';
import { LootItem } from '../loot/lootTypes';
import { rarityColor } from '../../utils/colorUtils';

interface Props {
    item: LootItem;
    onClose: () => void;
}

const InspectModal = ({ item, onClose }: Props) => {
    const [position, setPosition] = useState({ top: 100, left: window.innerWidth / 2 - 200 });
    const draggingRef = useRef(false);
    const offsetRef = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        draggingRef.current = true;
        offsetRef.current = {
            x: e.clientX - position.left,
            y: e.clientY - position.top,
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!draggingRef.current) return;
        setPosition({
            left: e.clientX - offsetRef.current.x,
            top: e.clientY - offsetRef.current.y,
        });
    };

    const handleMouseUp = () => {
        draggingRef.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: position.top,
                left: position.left,
                background: '#222',
                color: '#fff',
                padding: '2rem',
                borderRadius: '10px',
                zIndex: 3000,
                maxWidth: '400px',
                boxShadow: '0 0 10px black',
                cursor: 'default',
            }}
        >
            <div
                onMouseDown={handleMouseDown}
                style={{
                    cursor: 'move',
                    margin: '-2rem -2rem 1rem -2rem',
                    padding: '1rem',
                    backgroundColor: '#333',
                    borderBottom: '1px solid #444',
                    borderTopLeftRadius: '10px',
                    borderTopRightRadius: '10px',
                    userSelect: 'none',
                }}
            >
                <h2 style={{ margin: 0 }}>{item.name}</h2>
            </div>

            <p>Type: {item.type}</p>
            <p>
                Rarity:{' '}
                <span style={{ color: rarityColor(item.rarity) }}>{item.rarity}</span>
            </p>
            {item.material && <p>Material: {item.material}</p>}
            <p>Value: {item.value}g</p>
            {item.rank && <p>Rank: {item.rank}</p>}

            {item.effect && (
                <p>
                    {item.effect.amount
                        ? `${item.effect.type === 'heal' ? 'Heals' : 'Restores'} ${item.effect.amount} ${item.effect.type === 'heal' ? 'HP' : 'MP'}`
                        : `${item.effect.type === 'heal' ? 'Heals' : 'Restores'} ${item.effect.percent}% ${item.effect.type === 'heal' ? 'HP' : 'MP'}`}
                </p>
            )}

            {item.bonusStats && item.bonusStats.length > 0 && (
                <>
                    <h4>Bonus Stats</h4>
                    <ul>
                        {item.bonusStats.map((stat, idx) => (
                            <li key={idx}>
                                {stat.stat}:
                                {stat.flat !== undefined && ` +${stat.flat}`}
                                {stat.percent !== undefined && ` (+${stat.percent}%)`}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <button onClick={onClose} style={{ marginTop: '1rem' }}>
                Close
            </button>
        </div>
    );
};

export default InspectModal;
