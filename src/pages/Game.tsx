import { useEffect, useState } from 'react';
import GameEngine from '../game/GameEngine';
import CharacterList from '../components/CharacterList';
import { getCurrentUser, saveUser } from '../utils/storage';

const Game = () => {
    const [user, setUser] = useState<any>(null);
    const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const current = getCurrentUser();
        if (!current) return; // redirect to login if needed
        setUser(current);
    }, []);

    const handleCharacterCreate = (char: any) => {
        const updated = { ...user, characters: [...user.characters, char] };
        saveUser(updated);
        localStorage.setItem('currentUser', updated.username);
        setUser(updated);
        setSelectedCharacter(char);
        setCreating(false);
    };

    if (!user) return <p>Loading...</p>;

    if (selectedCharacter) {
        return <GameEngine character={selectedCharacter} />;
    }

    if (creating) {
        const [name, setName] = useState('');
        const [color, setColor] = useState('#000000');
        const [strength, setStrength] = useState(5);
        const [agility, setAgility] = useState(5);
        const [intelligence, setIntelligence] = useState(5);

        const handleCreate = () => {
            const newChar = { name, color, strength, agility, intelligence };
            handleCharacterCreate(newChar);
        };

        return (
            <div>
                <h2>Create Your Demigod</h2>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                <div>
                    <label>Strength: {strength}</label>
                    <input type="range" min="1" max="10" value={strength} onChange={(e) => setStrength(+e.target.value)} />
                </div>
                <div>
                    <label>Agility: {agility}</label>
                    <input type="range" min="1" max="10" value={agility} onChange={(e) => setAgility(+e.target.value)} />
                </div>
                <div>
                    <label>Intelligence: {intelligence}</label>
                    <input type="range" min="1" max="10" value={intelligence} onChange={(e) => setIntelligence(+e.target.value)} />
                </div>
                <button onClick={handleCreate}>Create</button>
            </div>
        );
    }

};

export default Game;
