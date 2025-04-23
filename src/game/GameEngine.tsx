import { useEffect, useRef, useState } from 'react';
import { getArea, Area, getMapData, setMapData } from './map/map';
import Inventory from './inventory/Inventory';
import { LootItem } from '../game/loot';
import StatPanel from './ui/StatPanel';
import CharacterStats from './ui/CharacterStats';
import { Character } from './types/characterTypes';
import CombatScreen from './ui/CombatScreen';
import { calculateMaxHp, calculateMaxMp, calculateNextLevelXp } from '../utils/stats';
import MiniMap from './map/MiniMap';


interface Props {
  character: Character;
  onSwitchCharacter: () => void;
}

type DirectionKey = 'north' | 'south' | 'east' | 'west';

const GameEngine = ({ character, onSwitchCharacter }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const enemyImages = useRef<Record<string, HTMLImageElement>>({});
  const [area, setArea] = useState<Area>(getArea(0, 0));
  const [dialog, setDialog] = useState<string | null>(null);
  const [inventory, setInventory] = useState<LootItem[]>(() => character.inventory ?? []);
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

  const [showMiniMap, setShowMiniMap] = useState(true);


  const [inCombat, setInCombat] = useState(false);
  const [enemyInCombat, setEnemyInCombat] = useState<any | null>(null);

  const drawNPCs = (ctx: CanvasRenderingContext2D) => {
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

  const drawEnemies = (ctx: CanvasRenderingContext2D) => {
    area.enemies?.forEach(enemy => {
      const ex = enemy.x ?? 0;
      const ey = enemy.y ?? 0;
      const sprite = enemy.sprite;
      const image = sprite ? enemyImages.current[sprite] : undefined;

      if (image && image.complete && image.naturalWidth !== 0) {
        ctx.drawImage(image, ex - 20, ey - 20, 40, 40);
      } else {
        ctx.beginPath();
        ctx.arc(ex, ey, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'crimson';
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = '12px sans-serif';
        ctx.fillText(enemy.name, ex - 15, ey - 25);
      }
    });
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const bgColor = areaBackgrounds[area.type ?? area.theme] || '#222';

    <h3 style={{ color: 'white', textAlign: 'center' }}>
      {area.name} - {area.type?.toUpperCase()}
    </h3>

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNPCs(ctx);
    drawEnemies(ctx);
  };

  const areaBackgrounds: Record<string, string> = {
    city: '#1e2f4d',
    town: '#2d3c25',
    village: '#3e2d1c',
    camp: '#2c2c2c',
    dungeon: '#1a1a1a',
    wilderness: '#24442e',
    corrupted: '#332233',
    infernal: '#441414',
    celestial: '#333366',
    undead: '#2c2c3c',
    elemental: '#443311',
  };


  useEffect(() => {
    setArea(getArea(currentPos.x, currentPos.y));
    if (character.map) setMapData(character.map);
  }, [character, currentPos]);

  useEffect(() => {
    area.enemies?.forEach(enemy => {
      const sprite = enemy.sprite;
      if (sprite && !enemyImages.current[sprite]) {
        const img = new Image();
        img.src = `/images/enemies/${sprite}.png`;
        img.onload = () => {
          enemyImages.current[sprite] = img;
          draw(); // Redraw once the image is loaded
        };
        img.onerror = () => {
          console.error(`Failed to load sprite: ${sprite}`);
        };
      }
    });
  }, [area]);

  useEffect(() => {
    draw();

    const canvas = canvasRef.current;
    if (!canvas) return;

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
          console.log('Clicked NPC:', npc);

          setPlayer(updated);

          return;
        }
      }

      for (let enemy of area.enemies ?? []) {
        const dx = x - (enemy.x ?? 0);
        const dy = y - (enemy.y ?? 0);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 20) {
          setEnemyInCombat(enemy);
          setInCombat(true);
          return;
        }
      }

      if (area.event) {
        setDialog(area.event);
      }
    };

    canvas.addEventListener('click', handleClick);
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let hoveringEnemy = false;
      for (let enemy of area.enemies ?? []) {
        const dx = x - (enemy.x ?? 0);
        const dy = y - (enemy.y ?? 0);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 20) {
          hoveringEnemy = true;
          break;
        }
      }

      canvas.style.cursor = hoveringEnemy ? 'pointer' : 'default';
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [area, player]);

  const move = (dir: DirectionKey) => {
    const { x, y } = currentPos;

    const directions = {
      north: { x, y: y - 1, exit: 'north', entry: 'south' },
      south: { x, y: y + 1, exit: 'south', entry: 'north' },
      east: { x: x + 1, y, exit: 'east', entry: 'west' },
      west: { x: x - 1, y, exit: 'west', entry: 'east' },
    };

    const current = getArea(x, y);
    const { x: newX, y: newY, exit, entry } = directions[dir];
    const destination = getArea(newX, newY);

    const isBlockedFromCurrent = current.blocked?.[exit as DirectionKey];
    const isBlockedFromDestination = destination.blocked?.[entry as DirectionKey];

    if (!isBlockedFromCurrent && !isBlockedFromDestination) {
      setCurrentPos({ x: newX, y: newY });
      setArea(destination);
      setDialog(null);
    } else {
      setDialog("You can't go that way.");
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

  const renderMoveButton = (dir: DirectionKey, label: string) => {
    const directionOffsets = {
      north: { x: 0, y: -1, exit: 'north', entry: 'south' },
      south: { x: 0, y: 1, exit: 'south', entry: 'north' },
      east: { x: 1, y: 0, exit: 'east', entry: 'west' },
      west: { x: -1, y: 0, exit: 'west', entry: 'east' },
    } as const;

    const { x, y } = currentPos;
    const { x: dx, y: dy, exit, entry } = directionOffsets[dir];
    const current = getArea(x, y);
    const destination = getArea(x + dx, y + dy);

    const isBlocked =
      current.blocked?.[exit] === true || destination?.blocked?.[entry] === true;

    return (
      <button
        onClick={() => move(dir)}
        disabled={isBlocked}
        style={{
          opacity: isBlocked ? 0.3 : 1,
          cursor: isBlocked ? 'not-allowed' : 'pointer'
        }}
      >
        {label}
      </button>
    );
  };

  if (inCombat && enemyInCombat) {
    return (
      <CombatScreen
        player={player}
        enemy={enemyInCombat}
        onVictory={() => {
          setInCombat(false);
          setEnemyInCombat(null);
          setArea(prev => ({
            ...prev,
            enemies: prev.enemies?.filter(e => e !== enemyInCombat)
          }));
          setDialog(`${enemyInCombat.name} defeated!`);
        }}
        onDefeat={() => {
          setInCombat(false);
          setEnemyInCombat(null);
          setDialog('You were defeated... but you live to fight another day.');
        }}
      />
    );
  }

  return (
    <div style={{ position: 'relative', display: 'flex', gap: '2rem', justifyContent: 'center' }}>
      {showMiniMap && <MiniMap currentX={currentPos.x} currentY={currentPos.y} />}
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
          {renderMoveButton('north', '⬆️ North')}
          <div />
          {renderMoveButton('west', '⬅️ West')}
          <div />
          {renderMoveButton('east', '➡️ East')}
          <div />
          {renderMoveButton('south', '⬇️ South')}
          <div />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
          <button onClick={handleSave}>💾 Save</button>
          <button onClick={handleLoad}>📂 Load Game</button>
          <button onClick={onSwitchCharacter}>🔁 Switch Character</button>
          <button onClick={() => setShowMiniMap(prev => !prev)}>
            {showMiniMap ? '🗺️ Hide Map' : '🗺️ Show Map'}
          </button>
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
        <div style={{
          width: '100%',
          height: '120px',
          backgroundColor: '#333',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
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
