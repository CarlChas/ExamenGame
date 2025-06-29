import { useEffect, useState } from 'react';

interface Props {
    characters: any[];
    onSelect: (char: any) => void;
    onCreateNew: () => void;
    onLogout: () => void;
}

const CharacterSelector = ({ onSelect, onCreateNew, onLogout }: Props) => {
    const [characters, setCharacters] = useState<any[]>([]);

    const loadCharacters = async () => {
        const username = localStorage.getItem('currentUser');
        if (!username) return;

        const res = await fetch(`http://localhost:3001/api/users/load/${username}`);
        const data = await res.json();
        setCharacters(data);
    };

    const handleDelete = async (charId: number, charName: string) => {
        const confirmDelete = confirm(`Delete ${charName}?`);
        if (!confirmDelete) return;

        await fetch(`http://localhost:3001/api/users/delete-character/${charId}`, {
            method: 'DELETE',
        });

        loadCharacters(); // refresh after deletion
    };

    useEffect(() => {
        loadCharacters();
    }, []);

    return (
        <div>
            <h2>Your Characters</h2>
            {characters.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {characters.map((char, i) => (
                        <li key={i} style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => onSelect(char)} style={{ flex: 1 }}>
                                {char.name} (Lvl {char.level || 1})
                            </button>
                            <button
                                onClick={() => handleDelete(char.id, char.name)}
                                style={{ backgroundColor: '#400', color: 'white' }}
                            >
                                ❌
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No characters yet</p>
            )}
            <button onClick={onCreateNew}>Create New</button>
            <button onClick={onLogout}>Log Out</button>
        </div>
    );
};

export default CharacterSelector;
