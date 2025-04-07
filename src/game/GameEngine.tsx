import { useEffect, useRef } from 'react';

interface Props {
  character: {
    name: string;
    color: string;
    strength: number;
    agility: number;
    intelligence: number;
  };
}

const GameEngine = ({ character }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let x = 200;
    let y = 200;
    const radius = 20;
    const speed = character.agility || 2;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Stickman head (for now just a circle)
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = character.color;
      ctx.fill();

      // Name label
      ctx.fillStyle = 'black';
      ctx.font = '14px sans-serif';
      ctx.fillText(character.name, x - radius, y - radius - 10);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': y -= speed; break;
        case 'ArrowDown': y += speed; break;
        case 'ArrowLeft': x -= speed; break;
        case 'ArrowRight': x += speed; break;
      }
      draw();
    };

    draw();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [character]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      style={{ border: '1px solid #ccc', display: 'block', margin: 'auto' }}
    />
  );
};

export default GameEngine;