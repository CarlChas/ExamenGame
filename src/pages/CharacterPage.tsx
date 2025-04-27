import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Character } from '../game/types/characterTypes';
import { calculateMaxHp, calculateMaxMp } from '../game/GameEngine/stats'; // ✅ Correct import!

const CharacterPage = () => {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCharacters = async () => {
            const username = localStorage.getItem('currentUser');
            if (!username) return;

            try {
                const res = await fetch(`http://localhost:3001/api/users/load/${username}`);
                const data = await res.json();

                const updated = data.map((char: Character) => ({
                    ...char,
                    maxHp: calculateMaxHp(char),
                    maxMp: calculateMaxMp(char),
                }));

                setCharacters(updated);
            } catch (error) {
                console.error('Error loading characters:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCharacters();
    }, []);

    if (loading) {
        return <div style={{ color: 'white', textAlign: 'center' }}>Loading characters...</div>;
    }

    if (characters.length === 0) {
        return <div style={{ color: 'white', textAlign: 'center' }}>No characters found.</div>;
    }

    return (
        <div style={{
            maxWidth: '900px',
            margin: '2rem auto',
            padding: '2rem',
            background: '#1a1a1a',
            color: 'white',
            borderRadius: '12px',
            boxShadow: '0 0 10px #000',
            fontFamily: 'sans-serif'
        }}>
            <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>🧙‍♂️ Your Characters</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {characters.map((char) => (
                    <Link
                        key={char.id}
                        to={`/character/${char.id}`}
                        style={{
                            background: '#2c2c2c',
                            padding: '1rem',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            color: 'white',
                            boxShadow: '0 0 5px #000',
                            transition: 'transform 0.2s',
                        }}
                        onMouseOver={(e: { currentTarget: { style: { transform: string; }; }; }) => (e.currentTarget.style.transform = 'scale(1.02)')}
                        onMouseOut={(e: { currentTarget: { style: { transform: string; }; }; }) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                        <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>{char.name}</h3>
                        <p><strong>Level:</strong> {char.level}</p>
                        <p><strong>HP:</strong> {char.currentHp} / {char.maxHp}</p>
                        <p><strong>MP:</strong> {char.currentMp} / {char.maxMp}</p>
                        <p><strong>XP:</strong> {char.xp}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CharacterPage;
