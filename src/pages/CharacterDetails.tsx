import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Character } from '../game/types/characterTypes';
import { LootItem } from '../game/loot/lootTypes';
import { calculateMaxHp, calculateMaxMp } from '../game/GameEngine/stats';

const rarityColors: Record<string, string> = {
    common: '#aaa',
    uncommon: '#1eff00',
    rare: '#0070dd',
    epic: '#a335ee',
    legendary: '#ff8000',
    mythic: '#ff00ff',
};

const CharacterDetailPage = () => {
    const { id } = useParams();
    const [character, setCharacter] = useState<Character | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<LootItem | null>(null);

    useEffect(() => {
        const fetchCharacter = async () => {
            const username = localStorage.getItem('currentUser');
            if (!username || !id) return;

            try {
                const res = await fetch(`http://localhost:3001/api/users/load/${username}`);
                const data = await res.json();
                const found = data.find((c: Character) => c.id.toString() === id);

                if (found) {
                    const updatedCharacter = {
                        ...found,
                        maxHp: calculateMaxHp(found),
                        maxMp: calculateMaxMp(found),
                    };
                    setCharacter(updatedCharacter);
                } else {
                    setCharacter(null);
                }
            } catch (error) {
                console.error('Error loading character:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCharacter();
    }, [id]);

    if (loading) {
        return <div style={{ color: 'white', textAlign: 'center' }}>Loading character...</div>;
    }

    if (!character) {
        return <div style={{ color: 'white', textAlign: 'center' }}>Character not found.</div>;
    }

    const renderItem = (item?: LootItem, label?: string) => (
        item ? (
            <li
                style={{ color: rarityColors[item.rarity], cursor: 'pointer' }}
                onClick={() => setSelectedItem(item)}
            >
                <strong>{label}:</strong> {item.name}
            </li>
        ) : (
            <li><strong>{label}:</strong> -</li>
        )
    );

    const renderProgressBar = (current: number, max: number, color: string) => (
        <div style={{ margin: '6px 0' }}>
            <div style={{ background: '#444', borderRadius: 4, position: 'relative', height: '20px', overflow: 'hidden' }}>
                <div style={{
                    background: color,
                    width: `${(current / max) * 100}%`,
                    height: '100%',
                    borderRadius: 4,
                    transition: 'width 0.3s ease'
                }} />
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                }}>
                    {current}/{max}
                </div>
            </div>
        </div>
    );

    return (
        <div style={{
            maxWidth: '800px',
            margin: '2rem auto',
            padding: '2rem',
            background: '#1a1a1a',
            color: 'white',
            borderRadius: '12px',
            boxShadow: '0 0 10px #000',
            fontFamily: 'sans-serif'
        }}>
            <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>{character.name}</h1>

            <div style={{ display: 'flex', gap: '2rem' }}>
                {/* Stats */}
                <div style={{ flex: 1 }}>
                    <h3>📜 Stats</h3>
                    <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.8' }}>
                        <li><strong>Level:</strong> {character.level}</li>
                        <li><strong>Lineage:</strong> {character.lineage}</li>
                        <li><strong>Strength:</strong> {character.strength}</li>
                        <li><strong>Dexterity:</strong> {character.dexterity}</li>
                        <li><strong>Intelligence:</strong> {character.intelligence}</li>
                        <li><strong>Wisdom:</strong> {character.wisdom}</li>
                        <li><strong>Endurance:</strong> {character.endurance}</li>
                        <li><strong>Charisma:</strong> {character.charisma}</li>
                        <li><strong>Luck:</strong> {character.luck}</li>
                        <li><strong>Divinity:</strong> {character.divinity}</li>
                    </ul>
                </div>

                {/* Equipment */}
                <div style={{ flex: 1 }}>
                    <h3>🛡 Equipment</h3>
                    <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.8' }}>
                        {renderItem(character.equipment?.weapon1, 'Weapon 1')}
                        {renderItem(character.equipment?.weapon2, 'Weapon 2')}
                        {renderItem(character.equipment?.armor?.helmet, 'Helmet')}
                        {renderItem(character.equipment?.armor?.chest, 'Chest')}
                        {renderItem(character.equipment?.armor?.back, 'Back')}
                        {renderItem(character.equipment?.armor?.legs, 'Legs')}
                        {renderItem(character.equipment?.armor?.boots, 'Boots')}
                        {renderItem(character.equipment?.necklace, 'Necklace')}
                        {renderItem(character.equipment?.belt, 'Belt')}
                        {renderItem(character.equipment?.ring1, 'Ring 1')}
                        {renderItem(character.equipment?.ring2, 'Ring 2')}
                    </ul>
                </div>
            </div>

            {/* Health, Mana, XP Bars styled like StatPanel */}
            <div style={{
                marginTop: '2rem',
                background: '#333',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
            }}>
                <h3>❤️ Health & Mana</h3>
                <label>❤️ HP:</label>
                {renderProgressBar(character.currentHp, character.maxHp, '#e63946')}

                <label>🔮 MP:</label>
                {renderProgressBar(character.currentMp, character.maxMp, '#3a86ff')}

                <label>⭐ XP:</label>
                {renderProgressBar(character.xp, character.level * 100, '#ffd166')}
            </div>

            {selectedItem && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: '#222',
                        padding: '2rem',
                        borderRadius: '10px',
                        width: '300px',
                        textAlign: 'center',
                        color: 'white'
                    }}>
                        <h2 style={{ color: rarityColors[selectedItem.rarity] }}>{selectedItem.name}</h2>
                        <p><strong>Type:</strong> {selectedItem.type}</p>
                        <p><strong>Rarity:</strong> {selectedItem.rarity}</p>
                        <p><strong>Material:</strong> {selectedItem.material}</p>
                        <p><strong>Value:</strong> {selectedItem.value}g</p>

                        {/* Bonus Stats */}
                        {selectedItem.bonusStats && selectedItem.bonusStats.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                                <h4>📈 Bonuses:</h4>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {selectedItem.bonusStats.map((bonus, idx) => (
                                        <li key={idx} style={{ fontSize: '0.85rem' }}>
                                            {bonus.flat && `+${bonus.flat} ${bonus.stat}`}
                                            {bonus.percent && `+${bonus.percent}% ${bonus.stat}`}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            onClick={() => setSelectedItem(null)}
                            style={{ marginTop: '1rem' }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CharacterDetailPage;
