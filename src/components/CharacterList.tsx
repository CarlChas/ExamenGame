interface Props {
    characters: any[];
    onSelect: (char: any) => void;
    onCreateNew: () => void;
  }
  
  const CharacterList = ({ characters, onSelect, onCreateNew }: Props) => {
    return (
      <div>
        <h2>Your Pantheon</h2>
        {characters.length === 0 ? (
          <p>No demigods yet! Create your first one.</p>
        ) : (
          <ul>
            {characters.map((char, i) => (
              <li key={i} style={{ marginBottom: '1rem' }}>
                <strong>{char.name}</strong> — {char.type || 'Demigod'}
                <br />
                <button onClick={() => onSelect(char)}>Play as {char.name}</button>
              </li>
            ))}
          </ul>
        )}
        <button onClick={onCreateNew}>Create New Character</button>
      </div>
    );
  };
  
  export default CharacterList;
  