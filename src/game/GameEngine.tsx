import { useEffect, useRef, useState } from 'react';
import { getArea, Area, getMapData, setMapData } from './map/map';
import Inventory from './inventory/Inventory';
import { Item } from './inventory/inventoryTypes';

interface Character {
  name: string;
  color: string;
  strength: number;
  dexterity: number;
  intelligence: number;
  wisdom: number;
  endurance: number;
  charisma: number;
}

interface Props {
  character: Character;
}

const GameEngine = ({ character }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [area, setArea] = useState<Area>(getArea(0, 0));
  const [dialog, setDialog] = useState<string | null>(null);
  const [inventory, setInventory] = useState<Item[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('gameSave');
    if (saved) {
      const { pos, map, inventory: inv } = JSON.parse(saved);
      setMapData(map);
      setCurrentPos(pos);
      setArea(getArea(pos.x, pos.y));
      if (inv) setInventory(inv);
    }
  }, []);

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
          // Simulate item reward
          const newItem: Item = {
            id: Date.now().toString(),
            name: 'Mystic Leaf',
            description: 'A shimmering leaf from an ancient tree.',
            type: 'quest',
          };
          setInventory(prev => [...prev, newItem]);
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
  }, [area]);

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

  const handleSave = () => {
    const saveData = {
      pos: currentPos,
      map: getMapData(),
      inventory,
    };
    localStorage.setItem('gameSave', JSON.stringify(saveData));
    alert('Game saved!');
  };

  const handleLoad = () => {
    const saved = localStorage.getItem('gameSave');
    if (saved) {
      const parsed = JSON.parse(saved);
      setMapData(parsed.map);
      setCurrentPos(parsed.pos);
      setArea(getArea(parsed.pos.x, parsed.pos.y));
      if (parsed.inventory) setInventory(parsed.inventory);
      setDialog('Game loaded!');
    } else {
      alert('No saved game found!');
    }
  };

  const handleRemoveItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
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

      {/* Character Profile & Inventory */}
      <div style={{
        minWidth: '240px',
        color: 'white',
        backgroundColor: '#1a1a1a',
        padding: '1rem',
        borderRadius: '8px'
      }}>
        <h3 style={{ marginTop: 0 }}>{character.name}</h3>
        <div style={{ width: '100%', height: '120px', backgroundColor: '#333', borderRadius: '4px', marginBottom: '1rem' }}>
          <p style={{ textAlign: 'center', paddingTop: '40px', color: '#bbb' }}>Portrait</p>
        </div>
        <p><strong>STR:</strong> {character.strength}</p>
        <p><strong>DEX:</strong> {character.dexterity}</p>
        <p><strong>INT:</strong> {character.intelligence}</p>
        <p><strong>WIS:</strong> {character.wisdom}</p>
        <p><strong>END:</strong> {character.endurance}</p>
        <p><strong>CHA:</strong> {character.charisma}</p>

        {/* Inventory Panel */}
        <Inventory items={inventory} onRemove={handleRemoveItem} />
      </div>
    </div>
  );
};

export default GameEngine;
