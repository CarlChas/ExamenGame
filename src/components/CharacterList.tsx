interface Props {
    characters: any[];
    onSelect: (char: any) => void;
    onCreateNew: () => void;
    onLogout: () => void;
}

const CharacterSelector = ({ characters, onSelect, onCreateNew, onLogout }: Props) => {
    return (
        <div>
            <h2>Your Characters</h2>
            {characters.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {characters.map((char, i) => (
                        <li key={i} style={{ marginBottom: '0.5rem' }}>
                            <button onClick={() => onSelect(char)} style={{ width: '100%' }}>
                                {char.name} (Lvl {char.level || 1})
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No characters yet</p>
            )}
            <button onClick={onCreateNew}>Create New</button>
            <button onClick={onLogout}>Log Out</button>
        </div>
    );
};

export default CharacterSelector;
