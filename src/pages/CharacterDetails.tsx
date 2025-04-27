import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Character } from '../game/types/characterTypes'; // Adjust if needed

const CharacterDetailPage = () => {
  const { id } = useParams();
  const [character, setCharacter] = useState<Character | null>(null);

  useEffect(() => {
    const fetchCharacter = async () => {
      const username = localStorage.getItem('currentUser');
      if (!username || !id) return;

      try {
        const response = await fetch(`http://localhost:3001/api/users/load/${username}`);
        const data = await response.json();
        const found = data.find((c: Character) => c.id.toString() === id);
        setCharacter(found);
      } catch (error) {
        console.error('Failed to load character', error);
      }
    };

    fetchCharacter();
  }, [id]);

  if (!character) return <p>Loading...</p>;

  return (
    <div style={{ color: 'white' }}>
      <h2>{character.name}</h2>
      <p>Level: {character.level}</p>
      <p>Lineage: {character.lineage}</p>
      <p>Strength: {character.strength}</p>
      <p>Dexterity: {character.dexterity}</p>
      <p>Intelligence: {character.intelligence}</p>
      <p>Wisdom: {character.wisdom}</p>
      <p>Endurance: {character.endurance}</p>
      <p>Charisma: {character.charisma}</p>
      <p>Luck: {character.luck}</p>
      <p>Divinity: {character.divinity}</p>

      {/* 🎯 You could even list EQUIPPED ITEMS later! */}
    </div>
  );
};

export default CharacterDetailPage;
