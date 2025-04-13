// src/game/map/MiniMap.tsx
import { useEffect, useRef, useState } from 'react';
import { getMapData } from './map';

interface Props {
    currentX: number;
    currentY: number;
}

const getEnemyEmoji = (theme?: string) => {
    switch (theme) {
        case 'undead': return '💀';
        case 'elemental': return '🔥';
        case 'corrupted': return '🕷️';
        case 'celestial': return '✨';
        case 'infernal': return '😈';
        default: return '👾';
    }
};

const MiniMap = ({ currentX, currentY }: Props) => {
    const map = getMapData();
    const coords = Object.keys(map).map(key => {
        const [x, y] = key.split(',').map(Number);
        return { x, y, key };
    });

    const minX = Math.min(...coords.map(c => c.x));
    const maxX = Math.max(...coords.map(c => c.x));
    const minY = Math.min(...coords.map(c => c.y));
    const maxY = Math.max(...coords.map(c => c.y));

    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [start, setStart] = useState({ x: 0, y: 0 });
    const [scroll, setScroll] = useState({ left: 0, top: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStart({ x: e.clientX, y: e.clientY });
        if (scrollRef.current) {
            setScroll({
                left: scrollRef.current.scrollLeft,
                top: scrollRef.current.scrollTop,
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        scrollRef.current.scrollLeft = scroll.left - dx;
        scrollRef.current.scrollTop = scroll.top - dy;
    };

    const handleMouseUp = () => setIsDragging(false);

    const cellSize = 20;
    const rows = [];

    for (let y = minY; y <= maxY; y++) {
        const row = [];
        for (let x = minX; x <= maxX; x++) {
            const cellKey = `${x},${y}`;
            const area = map[cellKey];
            const isCurrent = x === currentX && y === currentY;

            let bgColor = '#000';
            let content = '';
            let borders: React.CSSProperties = {
                borderTop: '1px solid #333',
                borderBottom: '1px solid #333',
                borderLeft: '1px solid #333',
                borderRight: '1px solid #333',
            };

            if (area) {
                if (area.blocked?.north) borders.borderTop = '3px solid red';
                if (area.blocked?.south) borders.borderBottom = '3px solid red';
                if (area.blocked?.west) borders.borderLeft = '3px solid red';
                if (area.blocked?.east) borders.borderRight = '3px solid red';

                const allSidesBlocked = area.blocked?.north && area.blocked?.south && area.blocked?.east && area.blocked?.west;

                if (isCurrent) {
                    bgColor = '#00ff00';
                    content = '🧍';
                } else if (allSidesBlocked) {
                    bgColor = '#444';
                } else if (area.enemies?.length) {
                    bgColor = '#222';
                    content = getEnemyEmoji(area.enemies?.[0]?.theme[0]);
                } else {
                    bgColor = '#666';
                }
            }

            row.push(
                <div
                    key={cellKey}
                    style={{
                        width: cellSize,
                        height: cellSize,
                        position: 'relative',
                        backgroundColor: bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        boxSizing: 'border-box',
                        ...borders,
                    }}
                    title={area ? `${area.name} (${area.theme})` : 'Unknown'}
                >
                    {content}
                </div>
            );
        }
        rows.push(<div key={y} style={{ display: 'flex' }}>{row}</div>);
    }

    const centerOnPlayer = () => {
        if (!scrollRef.current) return;

        const offsetX = (currentX - minX) * cellSize;
        const offsetY = (currentY - minY) * cellSize;

        scrollRef.current.scrollLeft = offsetX - scrollRef.current.clientWidth / 2 + cellSize / 2;
        scrollRef.current.scrollTop = offsetY - scrollRef.current.clientHeight / 2 + cellSize / 2;
    };

    useEffect(() => {
        centerOnPlayer();
    }, []); // center initially

    return (
        <div style={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: '#222',
            padding: '5px',
            borderRadius: '6px',
            fontFamily: 'sans-serif',
            color: 'white',
        }}>
            <p style={{ marginBottom: 4 }}>🗺 Map</p>

            <div
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                    width: 220,
                    height: 220,
                    overflow: 'hidden',
                    border: '1px solid #444',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    backgroundColor: '#111',
                }}
            >
                <div style={{ width: 'max-content', height: 'max-content' }}>
                    {rows}
                </div>
            </div>

            <button onClick={centerOnPlayer} style={{
                marginTop: 5,
                fontSize: '0.75rem',
                backgroundColor: '#333',
                color: 'white',
                border: '1px solid #555',
                padding: '2px 6px',
                borderRadius: 4,
                cursor: 'pointer'
            }}>
                🎯 Center on Player
            </button>

            <div style={{ marginTop: 6, fontSize: '0.7rem' }}>
                <p>🧍 You</p>
                <p>💀 Undead</p>
                <p>🔥 Elemental</p>
                <p>🕷️ Corrupted</p>
                <p>✨ Celestial</p>
                <p>😈 Infernal</p>
                <p style={{ color: '#f00' }}>⬛ Inaccessible (walled)</p>
            </div>
        </div>
    );
};

export default MiniMap;
