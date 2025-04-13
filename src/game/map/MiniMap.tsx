import { useEffect, useState } from 'react';
import { getMapData } from './map';

interface Props {
  currentX: number;
  currentY: number;
}

const MiniMap = ({ currentX, currentY }: Props) => {
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const map = getMapData();

  useEffect(() => {
    setVisited(prev => new Set(prev).add(`${currentX},${currentY}`));
  }, [currentX, currentY]);

  const coords = Object.keys(map).map(key => {
    const [x, y] = key.split(',').map(Number);
    return { x, y, key };
  });

  const minX = Math.min(...coords.map(c => c.x));
  const maxX = Math.max(...coords.map(c => c.x));
  const minY = Math.min(...coords.map(c => c.y));
  const maxY = Math.max(...coords.map(c => c.y));

  const rows = [];
  for (let y = minY; y <= maxY; y++) {
    const row = [];
    for (let x = minX; x <= maxX; x++) {
      const key = `${x},${y}`;
      const area = map[key];
      const isCurrent = x === currentX && y === currentY;
      const isVisited = visited.has(key);

      const neighbors = {
        north: map[`${x},${y - 1}`],
        south: map[`${x},${y + 1}`],
        west: map[`${x - 1},${y}`],
        east: map[`${x + 1},${y}`],
      };

      const borders = {
        borderTop: area?.blocked?.north || neighbors.north?.blocked?.south ? '2px solid red' : '1px solid #333',
        borderBottom: area?.blocked?.south || neighbors.south?.blocked?.north ? '2px solid red' : '1px solid #333',
        borderLeft: area?.blocked?.west || neighbors.west?.blocked?.east ? '2px solid red' : '1px solid #333',
        borderRight: area?.blocked?.east || neighbors.east?.blocked?.west ? '2px solid red' : '1px solid #333',
      };

      const completelyBlocked = area &&
        (!neighbors.north || neighbors.north.blocked?.south) &&
        (!neighbors.south || neighbors.south.blocked?.north) &&
        (!neighbors.east || neighbors.east.blocked?.west) &&
        (!neighbors.west || neighbors.west.blocked?.east) &&
        area.blocked?.north &&
        area.blocked?.south &&
        area.blocked?.east &&
        area.blocked?.west;

      let bgColor = '#000'; // unexplored
      if (isCurrent) bgColor = '#00ff00';
      else if (completelyBlocked) bgColor = '#555';
      else if (isVisited) bgColor = '#3a86ff';
      else if (area) bgColor = '#111';

      row.push(
        <div
          key={key}
          style={{
            width: 20,
            height: 20,
            backgroundColor: bgColor,
            display: 'inline-block',
            ...borders,
            boxSizing: 'border-box',
          }}
          title={area?.name || ''}
        />
      );
    }
    rows.push(<div key={y} style={{ display: 'flex' }}>{row}</div>);
  }

  return (
    <div style={{
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: '#222',
      padding: '5px',
      borderRadius: '6px',
    }}>
      <p style={{ color: '#fff', marginBottom: 4 }}>🗺 Map</p>
      {rows}
    </div>
  );
};

export default MiniMap;
