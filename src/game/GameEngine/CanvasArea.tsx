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
  openMerchant: () => void;
  style?: React.CSSProperties;
}

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};


const CanvasArea = ({
  area,
  player,
  setDialog,
  setInCombat,
  setEnemyInCombat,
  onHealPlayer,
  openMerchant,
  style,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const enemyImages = useRef<Record<string, HTMLImageElement>>({});

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

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bgColor = areaBackgrounds[area.type ?? area.theme] || '#222';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawNPCs(ctx);
    drawEnemies(ctx);
  };

  const drawNPCs = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    area.npcs.forEach(npc => {
      const radius = npc.radius;
      const clampedX = clamp(npc.x, radius, canvas.width - radius);
      const clampedY = clamp(npc.y, radius, canvas.height - radius);

      ctx.beginPath();
      ctx.arc(clampedX, clampedY, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'skyblue';
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.font = '12px sans-serif';
      ctx.fillText(npc.name, clampedX - radius, clampedY - radius - 5);
    });
  };


  const drawEnemies = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    area.enemies?.forEach(enemy => {
      const radius = 20;
      const ex = clamp(enemy.x ?? 0, radius, canvas.width - radius);
      const ey = clamp(enemy.y ?? 0, radius, canvas.height - radius);
      const sprite = enemy.sprite;
      const image = sprite ? enemyImages.current[sprite] : undefined;

      if (image && image.complete && image.naturalWidth !== 0) {
        ctx.drawImage(image, ex - radius, ey - radius, 2 * radius, 2 * radius);
      } else {
        ctx.beginPath();
        ctx.arc(ex, ey, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'crimson';
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = '12px sans-serif';
        ctx.fillText(enemy.name, ex - 15, ey - 25);
      }
    });
  };


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas resolution to actual CSS size for accurate clicks
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      draw();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

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

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (let npc of area.npcs) {
        const dx = x - npc.x;
        const dy = y - npc.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < npc.radius) {
          if (npc.type === 'inn' || npc.type === 'tavern') {
            onHealPlayer(npc.name);
          } else if (npc.type === 'market') {
            openMerchant();
          } else {
            setDialog(npc.dialog);
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
            area.type || 'wilderness',
            area.theme || 'undead',
            player.level
          );

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
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

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
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [area, onHealPlayer, openMerchant]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        maxWidth: '960px',
        height: 'auto',
        display: 'block',
        margin: '0 auto',
        backgroundColor: '#222',
        borderRadius: '8px',
        aspectRatio: '4 / 3',
        ...(style || {})
      }}
    />
  );
};

export default CanvasArea;
