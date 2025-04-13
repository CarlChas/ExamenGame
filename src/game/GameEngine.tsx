import { useEffect, useRef, useState } from 'react';
import { getArea, Area, getMapData, setMapData } from './map/map';
import Inventory from './inventory/Inventory';
import { Item } from './inventory/inventoryTypes';
import StatPanel from './ui/StatPanel';
import CharacterStats from './ui/CharacterStats';
import { Character } from './types/characterTypes';

interface Props {
  character: Character;
  onSwitchCharacter: () => void;
}

import { calculateMaxHp, calculateMaxMp, calculateNextLevelXp } from '../utils/stats';


const GameEngine = ({ character, onSwitchCharacter }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [area, setArea] = useState<Area>(getArea(0, 0));
  const [dialog, setDialog] = useState<string | null>(null);
  const [inventory, setInventory] = useState<Item[]>(() => character.inventory ?? []);
  const [currentPos, setCurrentPos] = useState(character.pos ?? { x: 0, y: 0 });

  const [player, setPlayer] = useState<Character>(() => {
    const level = character.level || 1;
    const baseCharacter = { ...character, level };
    const maxHp = calculateMaxHp(baseCharacter);
    const maxMp = calculateMaxMp(baseCharacter);

    return {
      ...baseCharacter,
      xp: character.xp ?? 0,
      currentHp: character.currentHp ?? maxHp,
      currentMp: character.currentMp ?? maxMp,
    };
  });


  const maxHp = calculateMaxHp(player);
  const maxMp = calculateMaxMp(player);
  const nextLevelXp = calculateNextLevelXp(player.level);

  useEffect(() => {
    setArea(getArea(currentPos.x, currentPos.y));
    if (character.map) setMapData(character.map);
  }, [character, currentPos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawNPCs = () => {
      area.npcs.forEach(npc => {
        ctx.beginPath();
        ctx.arc(npc.x, npc.y, npc.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'skyblue';
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.font = '12px sans-serif';
        ctx.fillText(npc.name, npc.x - npc.radius, npc.y - npc.radius - 5);
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawNPCs();
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (let npc of area.npcs) {
        const dx = x - npc.x;
        const dy = y - npc.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < npc.radius) {
          setDialog(npc.dialog);

          const xpGain = 25 + Math.floor(player.intelligence / 2);
          const newXp = player.xp + xpGain;
          const levelUp = newXp >= nextLevelXp;

          const updated = {
            ...player,
            xp: levelUp ? newXp - nextLevelXp : newXp,
            level: levelUp ? player.level + 1 : player.level,
            currentHp: levelUp ? calculateMaxHp({ ...player, level: player.level + 1 }) : player.currentHp,
            currentMp: levelUp ? calculateMaxMp({ ...player, level: player.level + 1 }) : player.currentMp,
          };
          setPlayer(updated);

          const item: Item = {
            id: Date.now().toString(),
            name: 'Mystic Shard',
            description: 'A fragment pulsing with energy.',
            type: 'quest',
          };
          setInventory(prev => [...prev, item]);
          return;
        }
      }

      if (area.event) {
        setDialog(area.event);
      }
    };

    draw();
    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [area, player]);

  const move = (dir: 'north' | 'south' | 'east' | 'west') => {
    const { x, y } = currentPos;
    const newPos = {
      north: { x, y: y - 1 },
      south: { x, y: y + 1 },
      east: { x: x + 1, y },
      west: { x: x - 1, y },
    }[dir];

    if (newPos) {
      setCurrentPos(newPos);
      setArea(getArea(newPos.x, newPos.y));
      setDialog(null);
    }
  };

  const handleSave = async () => {
    const username = localStorage.getItem('currentUser');
    if (!username) return;

    const saveData = {
      pos: currentPos,
      map: getMapData(),
      inventory,
      currentHp: player.currentHp,
      currentMp: player.currentMp,
    };

    await fetch('http://localhost:3001/api/users/save-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        characterId: player.id,
        progress: saveData,
      }),
    });

    alert('Game saved!');
  };

  const handleLoad = async () => {
    const username = localStorage.getItem('currentUser');
    if (!username) return;

    try {
      const res = await fetch(`http://localhost:3001/api/users/load/${username}`);
      const characters = await res.json();
      const updatedChar = characters.find((c: any) => c.id === player.id);

      if (updatedChar) {
        setCurrentPos(updatedChar.pos ?? { x: 0, y: 0 });
        setInventory(updatedChar.inventory ?? []);
        setMapData(updatedChar.map ?? {});
        setArea(getArea(updatedChar.pos?.x ?? 0, updatedChar.pos?.y ?? 0));

        setPlayer(prev => ({
          ...prev,
          currentHp: updatedChar.currentHp ?? prev.currentHp,
          currentMp: updatedChar.currentMp ?? prev.currentMp,
          xp: updatedChar.xp ?? prev.xp,
          level: updatedChar.level ?? prev.level,
        }));

        setDialog('Progress loaded!');
      } else {
        alert('No saved data for this character!');
      }
    } catch (err) {
      console.error('Failed to load character data:', err);
      alert('Error loading character data');
    }
  };



  return (
    <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
      <CharacterStats character={player} />
      <div>
        <h3 style={{ color: 'white', textAlign: 'center' }}>{area.name}</h3>
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          style={{
            display: 'block',
            border: '1px solid #888',
            backgroundColor: '#222',
          }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
          <div />
          <button onClick={() => move('north')}>⬆️ North</button>
          <div />
          <button onClick={() => move('west')}>⬅️ West</button>
          <div />
          <button onClick={() => move('east')}>➡️ East</button>
          <div />
          <button onClick={() => move('south')}>⬇️ South</button>
          <div />
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
          <button onClick={handleSave}>💾 Save</button>
          <button onClick={handleLoad}>📂 Load Game</button>
          <button onClick={onSwitchCharacter}>🔁 Switch Character</button>
        </div>

        {dialog && (
          <div style={{
            marginTop: '1rem',
            backgroundColor: '#111',
            color: '#fff',
            padding: '1rem',
            border: '2px solid #555',
            borderRadius: '8px',
            textAlign: 'center',
            maxWidth: '600px',
          }}>
            <p>{dialog}</p>
            <button onClick={() => setDialog(null)}>Close</button>
          </div>
        )}
      </div>

      <div style={{
        minWidth: '240px',
        color: 'white',
        backgroundColor: '#1a1a1a',
        padding: '1rem',
        borderRadius: '8px'
      }}>
        <h3 style={{ marginTop: 0 }}>{player.name}</h3>
        <div style={{ width: '100%', height: '120px', backgroundColor: '#333', borderRadius: '4px', marginBottom: '1rem' }}>
          <p style={{ textAlign: 'center', paddingTop: '40px', color: '#bbb' }}>Portrait</p>
        </div>
        <StatPanel
          currentHp={player.currentHp}
          maxHp={maxHp}
          currentMp={player.currentMp}
          maxMp={maxMp}
          level={player.level}
          xp={player.xp}
          nextLevelXp={nextLevelXp}
        />
        <Inventory items={inventory} onRemove={(id) => setInventory(prev => prev.filter(i => i.id !== id))} />
      </div>
    </div>
  );
};

export default GameEngine;
