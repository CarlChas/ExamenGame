import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CharacterList from '../components/CharacterList';
import GameEngine from '../game/GameEngine/GameEngine';
import CharacterCreator from '../components/CharacterCreator';

const Game = () => {
    const [user, setUser] = useState<any>(null);
    const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
    const [creating, setCreating] = useState(false);
    const navigate = useNavigate();

    const fetchCharacters = async (username: string) => {
        const res = await fetch(`http://localhost:3001/api/users/load/${username}`);
        const characters = await res.json();
        setUser({ username, characters });

        if (!characters || characters.length === 0) {
            setSelectedCharacter(null);
            localStorage.removeItem('selectedCharacter');
        }
    };

    useEffect(() => {
        const init = async () => {
            const stored = localStorage.getItem('currentUser');
            if (!stored) {
                navigate('/');
                return;
            }

            await fetchCharacters(stored);

            const selectedChar = localStorage.getItem('selectedCharacter');
            if (selectedChar) {
                try {
                    const parsed = JSON.parse(selectedChar);
                    if (!parsed || !parsed.name) throw new Error('Invalid character');

                    const res = await fetch(`http://localhost:3001/api/users/load/${stored}`);
                    const chars = await res.json();
                    const fullChar = chars.find((c: any) => c.name === parsed.name);

                    if (!fullChar) throw new Error('Character not found');

                    const safeChar = {
                        ...fullChar,
                        pos: fullChar.pos ?? { x: 0, y: 0 },
                        map: fullChar.map ?? {},
                        inventory: fullChar.inventory ?? [],
                        currentHp: fullChar.currentHp ?? 1,
                        currentMp: fullChar.currentMp ?? 1,
                    };

                    setSelectedCharacter(safeChar);
                } catch (err) {
                    console.warn('Kunde inte ladda karaktär:', err);
                    localStorage.removeItem('selectedCharacter');
                    setSelectedCharacter(null);
                }
            }
        };

        init();
    }, [navigate]);

    const handleSelectCharacter = async (char: any) => {
        const saveKey = `gameSave:${char.name}`;

        const res = await fetch(`http://localhost:3001/api/users/load/${user.username}`);
        const characters = await res.json();
        const updated = characters.find((c: any) => c.name === char.name);

        const loadedChar = {
            ...updated,
            pos: updated?.pos ?? { x: 0, y: 0 },
            map: updated?.map ?? {},
            inventory: updated?.inventory ?? [],
            currentHp: updated?.currentHp ?? 1,
            currentMp: updated?.currentMp ?? 1,
        };

        setSelectedCharacter(loadedChar);
        localStorage.setItem('selectedCharacter', JSON.stringify(loadedChar));
        localStorage.setItem(saveKey, JSON.stringify({
            pos: loadedChar.pos,
            map: loadedChar.map,
            inventory: loadedChar.inventory,
            player: loadedChar,
        }));
    };

    const handleCharacterCreate = async (char: any) => {
        setCreating(false);

        await fetch('http://localhost:3001/api/users/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: user.username,
                character: {
                    ...char,
                    pos: { x: 0, y: 0 },
                    map: {},
                    inventory: [],
                    currentHp: 1,
                    currentMp: 1,
                },
            }),
        });

        await fetchCharacters(user.username);

        const res = await fetch(`http://localhost:3001/api/users/load/${user.username}`);
        const updatedChars = await res.json();
        const updatedChar = updatedChars.find((c: any) => c.name === char.name);
        if (updatedChar) {
            const completeChar = {
                ...updatedChar,
                pos: updatedChar.pos ?? { x: 0, y: 0 },
                map: updatedChar.map ?? {},
                inventory: updatedChar.inventory ?? [],
                currentHp: updatedChar.currentHp ?? 1,
                currentMp: updatedChar.currentMp ?? 1,
            };

            setSelectedCharacter(completeChar);
            localStorage.setItem('selectedCharacter', JSON.stringify(completeChar));
        }
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
