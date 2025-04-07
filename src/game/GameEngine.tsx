import { useEffect, useRef, useState } from 'react';
import { getArea, Area } from './map/map';

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
  const positionRef = useRef({ x: 200, y: 200 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [area, setArea] = useState<Area>(getArea(0, 0));
  const [dialog, setDialog] = useState<string | null>(null);

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

    const drawPlayer = () => {
      const { x, y } = positionRef.current;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fillStyle = character.color;
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = '14px sans-serif';
      ctx.fillText(character.name, x - 20, y - 30);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawPlayer();
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
          return;
        }
      }
    };

    draw();
    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [area, character]);

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

      {/* UI Panel */}
      <div style={{ minWidth: '200px', color: 'white' }}>
        <h3>{character.name}</h3>
        <p><strong>STR:</strong> {character.strength}</p>
        <p><strong>DEX:</strong> {character.dexterity}</p>
        <p><strong>INT:</strong> {character.intelligence}</p>
        <p><strong>WIS:</strong> {character.wisdom}</p>
        <p><strong>END:</strong> {character.endurance}</p>
        <p><strong>CHA:</strong> {character.charisma}</p>
      </div>
    </div>
  );
};

export default GameEngine;
