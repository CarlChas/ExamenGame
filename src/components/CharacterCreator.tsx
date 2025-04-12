import React, { useState } from 'react';

interface Props {
    onCreate: (char: any) => void;
    onLogout: () => void;
    onCancel: () => void;
}

const CharacterCreator = ({ onCreate, onLogout, onCancel }: Props) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#000000');
    const [strength, setStrength] = useState(1);
    const [dexterity, setDexterity] = useState(1);
    const [intelligence, setIntelligence] = useState(1);
    const [wisdom, setWisdom] = useState(1);
    const [endurance, setEndurance] = useState(1);
    const [charisma, setCharisma] = useState(1);
    const [luck, setLuck] = useState(1);
    const [divinity] = useState(1);
    const [lineage, setLineage] = useState('');

    const maxPoints = 30;
    const totalAllocated = strength + dexterity + intelligence + wisdom + endurance + charisma + luck;
    const canCreate = totalAllocated === maxPoints && lineage !== '';

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
            divinity,
            lineage,
            level: 1,
            xp: 0,
        };
        onCreate(newChar);
    };
    const statEntries: [string, number, React.Dispatch<React.SetStateAction<number>>][] = [
        ['Strength', strength, setStrength],
        ['Dexterity', dexterity, setDexterity],
        ['Intelligence', intelligence, setIntelligence],
        ['Wisdom', wisdom, setWisdom],
        ['Endurance', endurance, setEndurance],
        ['Charisma', charisma, setCharisma],
        ['Luck', luck, setLuck],
    ];
    return (
        <div>
            <h2>Create Your Demigod</h2>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
            <input type="color" value={color} onInput={(e) => setColor(e.currentTarget.value)} />
            {statEntries.map(([label, value, setter], idx) => (
                <div key={idx}>
                    <label>{label}: {value}</label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={value}
                        onInput={(e) => {
                            const newValue = +e.currentTarget.value;
                            const totalAllocated =
                                strength + dexterity + intelligence + wisdom + endurance + charisma + luck;
                            const diff = newValue - value;
                            const remaining = maxPoints - totalAllocated;
                            if (diff <= 0 || remaining >= diff) {
                                setter(newValue);
                            }
                        }}
                    />
                </div>
            ))}


            <p>Points remaining: {maxPoints - totalAllocated}</p>

            <div>
                <label>Lineage:</label>
                <select value={lineage} onChange={(e) => setLineage(e.target.value)}>
                    <option value="">-- Select Lineage --</option>
                    <option value="celestial">Celestial</option>
                    <option value="infernal">Infernal</option>
                    <option value="primordial">Primordial</option>
                    <option value="dragon">Dragon</option>
                    <option value="outer">Outer</option>
                    <option value="legend">Legend</option>
                    <option value="elemental">Elemental</option>
                    <option value="fey">Fey</option>
                </select>
            </div>

            <button
                onClick={handleCreate}
                disabled={!canCreate}
                style={{ opacity: canCreate ? 1 : 0.5, cursor: canCreate ? 'pointer' : 'not-allowed' }}
            >
                Create
            </button>

            <button onClick={onCancel}>Cancel</button>
            <button onClick={onLogout}>Log Out</button>
        </div>
    );
};

export default CharacterCreator;
