interface EnemyPanelProps {
    name: string;
    currentHp: number;
    maxHp: number;
    lastMove?: string;
    level?: number;
}

const EnemyPanel = ({ name, currentHp, maxHp, lastMove, level }: EnemyPanelProps) => (
    <div style={{ background: '#222', padding: '1rem', borderRadius: '8px' }}>
        <h3>
            {name}
            {level !== undefined && (
                <span style={{ fontSize: '0.85rem', marginLeft: '0.4rem', color: '#aaa' }}>
                    (Lv. {level})
                </span>
            )}
        </h3>

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
