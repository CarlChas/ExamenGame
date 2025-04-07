interface Props {
    currentHp: number;
    maxHp: number;
    currentMp: number;
    maxMp: number;
    level: number;
    xp: number;
    nextLevelXp: number;
  }
  
  const StatPanel = ({ currentHp, maxHp, currentMp, maxMp, level, xp, nextLevelXp }: Props) => {
    return (
      <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
        <p><strong>Level:</strong> {level}</p>
  
        <div style={{ margin: '4px 0' }}>
          <label>❤️ HP:</label>
          <div style={{ background: '#444', borderRadius: 4 }}>
            <div style={{
              background: '#e63946',
              width: `${(currentHp / maxHp) * 100}%`,
              height: '10px',
              borderRadius: 4
            }} />
          </div>
          <small>{currentHp}/{maxHp}</small>
        </div>
  
        <div style={{ margin: '4px 0' }}>
          <label>🔮 MP:</label>
          <div style={{ background: '#444', borderRadius: 4 }}>
            <div style={{
              background: '#3a86ff',
              width: `${(currentMp / maxMp) * 100}%`,
              height: '10px',
              borderRadius: 4
            }} />
          </div>
          <small>{currentMp}/{maxMp}</small>
        </div>
  
        <div style={{ margin: '4px 0' }}>
          <label>⭐ XP:</label>
          <div style={{ background: '#444', borderRadius: 4 }}>
            <div style={{
              background: '#ffd166',
              width: `${(xp / nextLevelXp) * 100}%`,
              height: '10px',
              borderRadius: 4
            }} />
          </div>
          <small>{xp}/{nextLevelXp}</small>
        </div>
      </div>
    );
  };
  
  export default StatPanel;
  