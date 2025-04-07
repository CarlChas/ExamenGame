import { Character } from '../types/characterTypes';

interface Props {
    character: Character;
}

const CharacterStats = ({ character }: Props) => {
    const maxHp = character.endurance * 10 + character.level * 5;
    const maxMp = character.wisdom * 10 + character.level * 5;
    const nextLevelXp = character.level * 100;

    return (
        <div style={{
            marginTop: '1rem',
            backgroundColor: '#222',
            padding: '1rem',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.9rem'
        }}>
            <h4 style={{ marginBottom: '0.5rem' }}>📜 Full Stats</h4>
            <p><strong>Level:</strong> {character.level}</p>
            <p><strong>XP:</strong> {character.xp} / {nextLevelXp}</p>
            <p><strong>Max HP:</strong> {maxHp}</p>
            <p><strong>Max MP:</strong> {maxMp}</p>
            <hr style={{ borderColor: '#444' }} />
            <p><strong>STR:</strong> {character.strength}</p>
            <p><strong>DEX:</strong> {character.dexterity}</p>
            <p><strong>INT:</strong> {character.intelligence}</p>
            <p><strong>WIS:</strong> {character.wisdom}</p>
            <p><strong>END:</strong> {character.endurance}</p>
            <p><strong>CHA:</strong> {character.charisma}</p>
            <p><strong>LUK:</strong> {character.luck}</p>
        </div>
    );
};

export default CharacterStats;
