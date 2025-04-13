interface EnemyPanelProps {
    name: string;
    currentHp: number;
    maxHp: number;
    lastMove?: string;
}

const EnemyPanel = ({ name, currentHp, maxHp, lastMove }: EnemyPanelProps) => (
    <div style={{ background: '#222', padding: '1rem', borderRadius: '8px' }}>
        <h4>{name}</h4>
        <div style={{ background: '#444', borderRadius: 4, marginBottom: '0.5rem' }}>
            <div style={{
                background: 'crimson',
                width: `${(currentHp / maxHp) * 100}%`,
                height: '10px',
                borderRadius: 4
            }} />
        </div>
        <small>HP: {currentHp} / {maxHp}</small>
        {lastMove && <p style={{ marginTop: '0.5rem' }}>💥 Used: <strong>{lastMove}</strong></p>}
    </div>
);

export default EnemyPanel;
