import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface CharacterSummary {
  id: number;
  name: string;
  level: number;
  currentHp: number;
  currentMp: number;
}

const CharacterPage = () => {
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharacters = async () => {
      const username = localStorage.getItem('currentUser');
      if (!username) return;

      try {
        const response = await fetch(`http://localhost:3001/api/users/load/${username}`);
        const data = await response.json();
        setCharacters(data);
      } catch (error) {
        console.error('Failed to load characters', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  if (loading) return <p>Loading characters...</p>;

  return (
    <div style={{ color: 'white' }}>
      <h2>Your Characters</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {characters.map(char => (
          <Link to={`/character/${char.id}`} key={char.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: '#222', padding: '1rem', borderRadius: '8px' }}>
              <h3>{char.name}</h3>
              <p>Level: {char.level}</p>
              <p>HP: {char.currentHp}</p>
              <p>MP: {char.currentMp}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CharacterPage;
