import { useEffect, useState } from 'react';
import GameEngine from '../game/GameEngine';
import CharacterList from '../components/CharacterList';
import { getCurrentUser, saveUser } from '../utils/storage';
import { useNavigate } from 'react-router-dom';

const Game = () => {
    const [user, setUser] = useState<any>(null);
    const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
    const [creating, setCreating] = useState(false);
    const [name, setName] = useState('');
    const [color, setColor] = useState('#000000');
    const [strength, setStrength] = useState(5);
    const [dexterity, setDexterity] = useState(5);
    const [intelligence, setIntelligence] = useState(5);
    const [wisdom, setWisdom] = useState(5);
    const [endurance, setEndurance] = useState(5);
    const [charisma, setCharisma] = useState(5);
    const [luck, setLuck] = useState(5);
    const navigate = useNavigate();

    useEffect(() => {
        const current = getCurrentUser();
        if (!current) {
            navigate('/');
            return;
        }

        setUser(current);

        const storedChar = localStorage.getItem('selectedCharacter');
        if (storedChar) {
            setSelectedCharacter(JSON.parse(storedChar));
        } else if (current.characters.length === 0) {
            // No characters exist → force character creation
            setCreating(true);
        }
        // Else: do nothing, show character list by default
    }, [navigate]);


    const handleCharacterCreate = (char: any) => {
        const updated = { ...user, characters: [...user.characters, char] };
        saveUser(updated);
        localStorage.setItem('currentUser', updated.username);
        setUser(updated);
        setSelectedCharacter(char);
        setCreating(false);
    };

    const handleCreate = () => {
        const newChar = { name, color, strength, dexterity, intelligence, wisdom, endurance, charisma, luck };
        handleCharacterCreate(newChar);
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/');
    };

    if (!user) return <p>Loading...</p>;

    if (selectedCharacter) {
        return (
            <>
                <button onClick={handleLogout}>Log Out</button>
                <GameEngine character={selectedCharacter} />
            </>
        );
    }

    if (creating) {
        return (
            <section>
                <h2>Create Your Demigod</h2>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                <div>
                    <label>Strength: {strength}</label>
                    <input type="range" min="1" max="10" value={strength} onChange={(e) => setStrength(+e.target.value)} />
                </div>
                <div>
                    <label>Agility: {dexterity}</label>
                    <input type="range" min="1" max="10" value={dexterity} onChange={(e) => setDexterity(+e.target.value)} />
                </div>
                <div>
                    <label>Intelligence: {intelligence}</label>
                    <input type="range" min="1" max="10" value={intelligence} onChange={(e) => setIntelligence(+e.target.value)} />
                </div>
                <div>
                    <label>Wisdom: {wisdom}</label>
                    <input type="range" min="1" max="10" value={wisdom} onChange={(e) => setWisdom(+e.target.value)} />
                </div>
                <div>
                    <label>Endurance: {endurance}</label>
                    <input type="range" min="1" max="10" value={endurance} onChange={(e) => setEndurance(+e.target.value)} />
                </div>
                <div>
                    <label>Charisma: {charisma}</label>
                    <input type="range" min="1" max="10" value={charisma} onChange={(e) => setCharisma(+e.target.value)} />
                </div>
                <div>
                    <label>Luck: {luck}</label>
                    <input type="range" min="1" max="10" value={luck} onChange={(e) => setLuck(+e.target.value)} />
                </div>
                <button onClick={handleCreate}>Create</button>
                <br />
                <button onClick={handleLogout}>Log Out</button>
            </section>
        );
    }

    if (!selectedCharacter && !creating) {
        return (
            <section>
                <CharacterList
                    characters={user.characters}
                    onSelect={(char) => {
                        localStorage.setItem('selectedCharacter', JSON.stringify(char));
                        setSelectedCharacter(char);
                    }}
                    onCreateNew={() => setCreating(true)}
                />
                <button onClick={handleLogout}>Log Out</button>
            </section>
        );
    }

};

export default Game;
