import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CharacterList from '../components/CharacterList';
import GameEngine from '../game/GameEngine';
import { getCurrentUser, saveUser } from '../utils/storage';

const Game = () => {
    const [user, setUser] = useState<any>(null);
    const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
    const [creating, setCreating] = useState(false);
    const navigate = useNavigate();

    // 🔁 These must NOT be inside "if (creating)"
    const [name, setName] = useState('');
    const [color, setColor] = useState('#000000');
    const [strength, setStrength] = useState(1);
    const [dexterity, setDexterity] = useState(1);
    const [intelligence, setIntelligence] = useState(1);
    const [wisdom, setWisdom] = useState(1);
    const [endurance, setEndurance] = useState(1);
    const [charisma, setCharisma] = useState(1);
    const [luck, setLuck] = useState(1);
    const maxPoints = 30;


    useEffect(() => {
        const current = getCurrentUser();
        if (!current) {
            navigate('/');
            return;
        }
        setUser(current);
    }, [navigate]);

    const handleCharacterCreate = (char: any) => {
        const updated = { ...user, characters: [...user.characters, char] };
        saveUser(updated);
        localStorage.setItem('currentUser', updated.username);
        setUser(updated);
        setSelectedCharacter(char);
        setCreating(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/');
    };

    const handleCreate = () => {
        const newChar = {
            name,
            color,
            strength,
            dexterity,
            intelligence,
            wisdom,
            endurance,
            charisma,
            luck,
            level: 1,
            xp: 0
        };
        handleCharacterCreate(newChar);
    };

    if (!user) return <p>Loading...</p>;

    if (selectedCharacter) {
        return (
            <>
                <button onClick={handleLogout}>Log Out</button>
                <GameEngine
                    character={selectedCharacter}
                    onSwitchCharacter={() => setSelectedCharacter(null)}
                />
            </>
        );
    }

    if (creating) {
        const totalAllocated = strength + dexterity + intelligence + wisdom + endurance + charisma + luck;
        const canCreate = totalAllocated === maxPoints;
        return (
            <div>
                <h2>Create Your Demigod</h2>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
                <input type="color" value={color} onInput={(e) => setColor(e.currentTarget.value)} />
                <div>
                    <label>Strength: {strength}</label>
                    <input type="range" min="1" max="10" value={strength} onInput={(e) => {
                        const newValue = +e.currentTarget.value;
                        const diff = newValue - strength;
                        const remaining = maxPoints - (
                            dexterity + intelligence + wisdom + endurance + charisma + luck + strength
                        );
                        if (diff <= 0 || remaining >= diff) setStrength(newValue);
                    }} />
                </div>

                <div>
                    <label>Dexterity: {dexterity}</label>
                    <input type="range" min="1" max="10" value={dexterity} onInput={(e) => {
                        const newValue = +e.currentTarget.value;
                        const diff = newValue - dexterity;
                        const remaining = maxPoints - (
                            strength + intelligence + wisdom + endurance + charisma + luck + dexterity
                        );
                        if (diff <= 0 || remaining >= diff) setDexterity(newValue);
                    }} />
                </div>

                <div>
                    <label>Intelligence: {intelligence}</label>
                    <input type="range" min="1" max="10" value={intelligence} onInput={(e) => {
                        const newValue = +e.currentTarget.value;
                        const diff = newValue - intelligence;
                        const remaining = maxPoints - (
                            strength + dexterity + wisdom + endurance + charisma + luck + intelligence
                        );
                        if (diff <= 0 || remaining >= diff) setIntelligence(newValue);
                    }} />
                </div>

                <div>
                    <label>Wisdom: {wisdom}</label>
                    <input type="range" min="1" max="10" value={wisdom} onInput={(e) => {
                        const newValue = +e.currentTarget.value;
                        const diff = newValue - wisdom;
                        const remaining = maxPoints - (
                            strength + dexterity + intelligence + endurance + charisma + luck + wisdom
                        );
                        if (diff <= 0 || remaining >= diff) setWisdom(newValue);
                    }} />
                </div>

                <div>
                    <label>Endurance: {endurance}</label>
                    <input type="range" min="1" max="10" value={endurance} onInput={(e) => {
                        const newValue = +e.currentTarget.value;
                        const diff = newValue - endurance;
                        const remaining = maxPoints - (
                            strength + dexterity + intelligence + wisdom + charisma + luck + endurance
                        );
                        if (diff <= 0 || remaining >= diff) setEndurance(newValue);
                    }} />
                </div>

                <div>
                    <label>Charisma: {charisma}</label>
                    <input type="range" min="1" max="10" value={charisma} onInput={(e) => {
                        const newValue = +e.currentTarget.value;
                        const diff = newValue - charisma;
                        const remaining = maxPoints - (
                            strength + dexterity + intelligence + wisdom + endurance + luck + charisma
                        );
                        if (diff <= 0 || remaining >= diff) setCharisma(newValue);
                    }} />
                </div>

                <div>
                    <label>Luck: {luck}</label>
                    <input type="range" min="1" max="10" value={luck} onInput={(e) => {
                        const newValue = +e.currentTarget.value;
                        const diff = newValue - luck;
                        const remaining = maxPoints - (
                            strength + dexterity + intelligence + wisdom + endurance + charisma + luck
                        );
                        if (diff <= 0 || remaining >= diff) setLuck(newValue);
                    }} />
                </div>
                <p>Points remaining: {maxPoints - (strength + dexterity + intelligence + wisdom + endurance + charisma + luck)}</p>
                <button
                    onClick={handleCreate}
                    disabled={!canCreate}
                    style={{ opacity: canCreate ? 1 : 0.5, cursor: canCreate ? 'pointer' : 'not-allowed' }}
                >
                    Create
                </button>
                <button onClick={handleLogout}>Log Out</button>
            </div>
        );
    }

    return (
        <section>
            <CharacterList
                characters={user.characters}
                onSelect={setSelectedCharacter}
                onCreateNew={() => setCreating(true)}
            />
            <button onClick={handleLogout}>Log Out</button>
        </section>
    );
};

export default Game;
