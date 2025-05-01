// src/game/ui/CombatScreen.tsx

import { useEffect, useState } from 'react';
import { Character } from '../types/characterTypes';
import { Enemy } from '../../combat/enemies';
import StatPanel from '../ui/StatPanel';
import EnemyPanel from '../ui/EnemyPanel';
import { calculateMaxHp, calculateMaxMp } from '../GameEngine/stats';


interface Props {
    player: Character;
    enemy: Enemy;
    // Modify onVictory to accept xp
    onVictory: (xpGained: number) => void;
    onDefeat: () => void;
}

const CombatScreen = ({ player, enemy, onVictory, onDefeat }: Props) => {
    const [playerHp, setPlayerHp] = useState(player.currentHp);
    const [enemyHp, setEnemyHp] = useState(enemy.maxHp);
    const [enemyMove, setEnemyMove] = useState<string | null>(null);
    const [turn, setTurn] = useState<'player' | 'enemy'>('player');
    const [log, setLog] = useState<string[]>([]);

    const appendLog = (text: string) => setLog(prev => [text, ...prev]);

    const handlePlayerAttack = () => {
        const damage = Math.floor(player.strength * 1.5 + Math.random() * 5);
        const newHp = Math.max(0, enemyHp - damage);
        appendLog(`${player.name} hits ${enemy.name} for ${damage} damage!`);
        setEnemyHp(newHp);

        if (newHp <= 0) {
            appendLog(`${enemy.name} was defeated!`);
            // Pass enemy.xp to onVictory
            setTimeout(() => onVictory(enemy.xp), 1000);
        } else {
            setTurn('enemy');
        }
    };

    const handleEnemyTurn = () => {
        if (enemyHp <= 0 || playerHp <= 0) return;

        const move = enemy.moves[Math.floor(Math.random() * enemy.moves.length)];
        setEnemyMove(move.name);

        const damage = Math.floor(enemy.attack * move.damageMultiplier + Math.random() * 4);
        const newHp = Math.max(0, playerHp - damage);
        appendLog(`${enemy.name} uses ${move.name} and deals ${damage} damage!`);
        setPlayerHp(newHp);

        if (newHp <= 0) {
            appendLog(`${player.name} was defeated!`);
            setTimeout(onDefeat, 1000);
        } else {
            setTurn('player');
        }
    };

    useEffect(() => {
        if (turn === 'enemy') {
            const timeout = setTimeout(handleEnemyTurn, 1000);
            return () => clearTimeout(timeout);
        }
    }, [turn]);

    return (
        <div style={{
            background: '#1a1a1a',
            padding: '2rem',
            borderRadius: '10px',
            color: 'white',
            maxWidth: '800px',
            margin: '2rem auto',
            boxShadow: '0 0 10px #000',
            fontFamily: 'sans-serif'
        }}>
            <h2 style={{ textAlign: 'center' }}>⚔️ Combat Encounter</h2>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '2rem',
                marginBottom: '1rem'
            }}>
                <div style={{ flex: 1 }}>
                    <h3>{player.name}</h3>
                    <StatPanel
                        currentHp={playerHp}
                        maxHp={calculateMaxHp(player)}
                        currentMp={player.currentMp}
                        maxMp={calculateMaxMp(player)}
                        level={player.level}
                        xp={player.xp}
                        nextLevelXp={player.level * 100}
                    />
                </div>

                <div style={{ flex: 1 }}>
                    <EnemyPanel
                        name={enemy.name}
                        currentHp={enemyHp}
                        maxHp={enemy.maxHp}
                        lastMove={enemyMove ?? undefined}
                    />
                </div>
            </div>

            {turn === 'player' && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <button onClick={handlePlayerAttack}>🗡 Attack</button>
                    <button disabled>🛡 Defend</button>
                    <button disabled>🧪 Use Item</button>
                    <button disabled>🏃‍♂️ Flee</button>
                </div>
            )}

            <div style={{
                background: '#333',
                padding: '1rem',
                borderRadius: '5px',
                maxHeight: '200px',
                overflowY: 'auto'
            }}>
                <h4>📜 Battle Log:</h4>
                {log.length === 0 ? <p>No actions yet.</p> : log.map((entry, idx) => <p key={idx}>• {entry}</p>)}
            </div>
        </div>
    );
};

export default CombatScreen;