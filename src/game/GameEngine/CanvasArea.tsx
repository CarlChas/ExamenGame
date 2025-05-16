import { Area } from '../map/map';
import { Character } from '../types/characterTypes';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { getRandomEnemyForBiomeAndTheme } from '../../combat/enemies';

interface Props {
  area: Area;
  player: Character;
  setDialog: Dispatch<SetStateAction<string | null>>;
  setInCombat: Dispatch<SetStateAction<boolean>>;
  setEnemyInCombat: Dispatch<SetStateAction<any>>;
  onHealPlayer: (npcName: string) => void;
}

const CanvasArea = ({
  area,
  player,
  setDialog,
  setInCombat,
  setEnemyInCombat,
  onHealPlayer,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const enemyImages = useRef<Record<string, HTMLImageElement>>({});

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bgColor = areaBackgrounds[area.type ?? area.theme] || '#222';
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

  useEffect(() => {
    draw();

    area.enemies?.forEach(enemy => {
      const sprite = enemy.sprite;
      if (sprite && !enemyImages.current[sprite]) {
        const img = new Image();
        img.src = `/images/enemies/${sprite}.png`;
        img.onload = () => {
          enemyImages.current[sprite] = img;
          draw();
        };
        img.onerror = () => {
          console.error(`Failed to load sprite: ${sprite}`);
        };
      }
    });

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
          // Check if the NPC is an Inn or Tavern
          if (npc.type === 'inn' || npc.type === 'tavern') {
            onHealPlayer(npc.name);
          } else {
            setDialog(npc.dialog); // Set default dialog for other NPCs
          }
          return;
        }
      }

      for (let enemy of area.enemies ?? []) {
        const dx = x - (enemy.x ?? 0);
        const dy = y - (enemy.y ?? 0);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 20) {
          const generated = getRandomEnemyForBiomeAndTheme(
            area.type || 'wilderness',  // fallback if type is undefined
            area.theme || 'undead',     // fallback
            player.level                // scaling based on player level
          );

          // Preserve original enemy's sprite and position
          setEnemyInCombat({
            ...generated,
            sprite: enemy.sprite,
            x: enemy.x,
            y: enemy.y,
            currentHp: generated.maxHp,
          });

          setInCombat(true);
          return;
        }
      }


      if (area.event) {
        setDialog(area.event);
      }
    };

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

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [area, onHealPlayer]); // onHealPlayer is now stable, but keep in dependency array

  return (
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
  );
};

export default CanvasArea;
