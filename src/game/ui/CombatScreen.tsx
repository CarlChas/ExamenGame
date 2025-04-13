import { useState } from 'react';
import { Character } from '../types/characterTypes';

// enemy stats
interface Enemy {
  name: string;
  hp: number;
  attack: number;
}

// player & enemy
interface Props {
  player: Character;
  enemy: Enemy;
  onVictory: () => void;
  onDefeat: () => void;
}

// combat screen
const CombatScreen = ({ player, enemy, onVictory, onDefeat }: Props) => {
  const [playerHp, setPlayerHp] = useState(player.currentHp);
  const [enemyHp, setEnemyHp] = useState(enemy.hp);
  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [log, setLog] = useState<string[]>([]);

  const appendLog = (text: string) => setLog(prev => [text, ...prev]);

  const playerAttack = () => {
    const damage = Math.floor(player.strength * 1.5);
    setEnemyHp(prev => {
      const newHp = Math.max(0, prev - damage);
      appendLog(`${player.name} hits ${enemy.name} for ${damage} damage!`);
      if (newHp === 0) {
        appendLog(`${enemy.name} was defeated!`);
        setTimeout(onVictory, 1500);
      } else {
        setTurn('enemy');
      }
      return newHp;
    });
  };

  const enemyAttack = () => {
    const damage = Math.floor(enemy.attack);
    setPlayerHp(prev => {
      const newHp = Math.max(0, prev - damage);
      appendLog(`${enemy.name} hits ${player.name} for ${damage} damage!`);
      if (newHp === 0) {
        appendLog(`${player.name} was defeated!`);
        setTimeout(onDefeat, 1500);
      } else {
        setTurn('player');
      }
      return newHp;
    });
  };

  if (turn === 'enemy' && enemyHp > 0 && playerHp > 0) {
    setTimeout(enemyAttack, 1000);
  }

  return (
    <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '10px', color: 'white', maxWidth: 600, margin: 'auto' }}>
      <h2>⚔️ Combat</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h3>{player.name}</h3>
          <p>HP: {playerHp} / {player.currentHp}</p>
        </div>
        <div>
          <h3>{enemy.name}</h3>
          <p>HP: {enemyHp}</p>
        </div>
      </div>

      {turn === 'player' && (
        <div>
          <button onClick={playerAttack}>🗡 Attack</button>
          <button disabled>🛡 Defend</button>
          <button disabled>🧪 Use Item</button>
          <button disabled>🏃‍♂️ Flee</button>
        </div>
      )}

      <div style={{ marginTop: '1rem', background: '#333', padding: '1rem', borderRadius: '5px' }}>
        <h4>Battle Log:</h4>
        {log.map((entry, idx) => <p key={idx}>{entry}</p>)}
      </div>
    </div>
  );
};

export default CombatScreen;
