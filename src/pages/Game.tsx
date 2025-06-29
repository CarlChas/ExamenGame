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
            if (!selectedChar) return;

            const parsedChar = JSON.parse(selectedChar);

            try {
                const res = await fetch(`http://localhost:3001/api/users/character/${parsedChar.id}`);
                const data = await res.json();

                if (!res.ok || data.redirect) {
                    console.warn('Karaktären kunde inte laddas, tar bort från localStorage.');
                    localStorage.removeItem('selectedCharacter');
                    return;
                }

                // säkerställ fallback-data
                const loadedChar = {
                    ...data,
                    pos: data.pos ?? { x: 0, y: 0 },
                    map: data.map ?? {},
                    inventory: data.inventory ?? [],
                    currentHp: data.currentHp ?? 10,
                    currentMp: data.currentMp ?? 10,
                };

                setSelectedCharacter(loadedChar);
            } catch (err) {
                console.error('Fel vid laddning av karaktär:', err);
                localStorage.removeItem('selectedCharacter');
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
            currentHp: updated?.currentHp ?? 10,
            currentMp: updated?.currentMp ?? 10,
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
        setSelectedCharacter(char);
        setCreating(false);
        localStorage.setItem('selectedCharacter', JSON.stringify(char));

        await fetch('http://localhost:3001/api/users/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: user.username,
                character: { ...char, pos: { x: 0, y: 0 }, map: {}, inventory: [] },
            }),
        });

        fetchCharacters(user.username);
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('selectedCharacter');
        navigate('/');
    };

    if (!user) return <p>Loading...</p>;

    if (selectedCharacter) {
        return (
            <GameEngine
                character={selectedCharacter}
                onSwitchCharacter={() => setSelectedCharacter(null)}
            />
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
