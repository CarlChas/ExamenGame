import { useState } from 'react';
import { Enemy } from './combatTypes';
import { Character } from '../types/characterTypes';


interface Props {
    player: Character;
    enemy: Enemy;
    onVictory: (xpGained: number) => void;
    onDefeat: () => void;
    onClose: () => void;
}

const CombatModal = ({ player, enemy, onVictory, onDefeat, onClose }: Props) => {
    const [enemyState, setEnemyState] = useState(enemy);
    const [playerHp, setPlayerHp] = useState(player.currentHp);
    const [turnLog, setTurnLog] = useState<string[]>([]);
    const [combatEnded, setCombatEnded] = useState(false);

    const attackEnemy = () => {
        const playerDamage = player.strength + Math.floor(Math.random() * 5);
        const enemyDamage = enemy.attack + Math.floor(Math.random() * 5);

        const newEnemyHp = enemyState.currentHp - playerDamage;
        const newPlayerHp = playerHp - enemyDamage;

        const logs = [
            `You dealt ${playerDamage} damage to ${enemy.name}`,
            `${enemy.name} hit you for ${enemyDamage} damage`,
        ];

        setEnemyState(prev => ({ ...prev, currentHp: Math.max(0, newEnemyHp) }));
        setPlayerHp(Math.max(0, newPlayerHp));
        setTurnLog(prev => [...prev, ...logs]);

        if (newEnemyHp <= 0) {
            setCombatEnded(true);
            setTurnLog(prev => [...prev, `${enemy.name} is defeated!`]);
            setTimeout(() => onVictory(enemy.xpReward), 1500);
        } else if (newPlayerHp <= 0) {
            setCombatEnded(true);
            setTurnLog(prev => [...prev, `You have been defeated...`]);
            setTimeout(() => onDefeat(), 1500);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            color: 'white',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <h2>⚔️ Combat</h2>
            <p><strong>{player.name}</strong>: {playerHp} HP</p>
            <p><strong>{enemyState.name}</strong>: {enemyState.currentHp} HP</p>

            {!combatEnded && (
                <div style={{ marginTop: '1rem' }}>
                    <button onClick={attackEnemy}>🗡️ Attack</button>
                    <button onClick={onClose} style={{ marginLeft: '1rem' }}>❌ Run</button>
                </div>
            )}

            <div style={{
                marginTop: '1rem',
                width: '100%',
                maxWidth: '400px',
                backgroundColor: '#111',
                padding: '1rem',
                border: '1px solid #444',
                borderRadius: '6px'
            }}>
                <h4>Battle Log:</h4>
                <ul>
                    {turnLog.slice(-5).map((log, idx) => <li key={idx}>{log}</li>)}
                </ul>
            </div>
        </div>
    );
};

export default CombatModal;
