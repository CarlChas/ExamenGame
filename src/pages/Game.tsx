import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CharacterList from '../components/CharacterList';
import GameEngine from '../game/GameEngine';
import CharacterCreator from '../components/CharacterCreator';

const Game = () => {
    const [user, setUser] = useState<any>(null);
    const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
    const [creating, setCreating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem('currentUser');
        if (!stored) {
            navigate('/');
            return;
        }

        const fetchCharacters = async () => {
            const res = await fetch(`http://localhost:3001/api/users/load/${stored}`);
            const characters = await res.json();
            setUser({ username: stored, characters });

            const selectedChar = localStorage.getItem('selectedCharacter');
            if (selectedChar) {
                setSelectedCharacter(JSON.parse(selectedChar));
            }
        };

        fetchCharacters();
    }, [navigate]);

    const handleSelectCharacter = (char: any) => {
        setSelectedCharacter(char);
        localStorage.setItem('selectedCharacter', JSON.stringify(char));

        const saveKey = `gameSave:${char.name}`;
        const exists = localStorage.getItem(saveKey);
        if (!exists) {
            const newSave = {
                pos: { x: 0, y: 0 },
                map: {},
                inventory: [],
                player: char,
            };
            localStorage.setItem(saveKey, JSON.stringify(newSave));
        }
    };


    const handleCharacterCreate = async (char: any) => {
        const updatedUser = {
            ...user,
            characters: [...user.characters, char],
        };
        setUser(updatedUser);
        setSelectedCharacter(char);
        localStorage.setItem('selectedCharacter', JSON.stringify(char));
        setCreating(false);

        await fetch('http://localhost:3001/api/users/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: updatedUser.username,
                characters: updatedUser.characters,
            }),
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('selectedCharacter');
        navigate('/');
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
        return (
            <CharacterCreator
                onCreate={handleCharacterCreate}
                onCancel={() => setCreating(false)}
                onLogout={handleLogout}
            />
        );
    }

    return (
        <section>
            <CharacterList
                characters={user.characters || []}
                onSelect={handleSelectCharacter}
                onCreateNew={() => setCreating(true)}
                onLogout={handleLogout}
            />
            <button onClick={handleLogout}>Log Out</button>
        </section>
    );
};

export default Game;
