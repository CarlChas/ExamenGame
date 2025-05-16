import { useEffect, useRef, useState } from 'react';
import { getMapData } from './map';

interface Props {
    currentX: number;
    currentY: number;
}

const TILE_SIZE = 24;
const VIEW_WIDTH = 15;
const VIEW_HEIGHT = 15;

const typeColors: Record<string, string> = {
    city: '#3a4f8f',
    town: '#4d6b3a',
    village: '#8f5c3a',
    camp: '#444444',
    dungeon: '#2a2a2a',
    wilderness: '#34663a',
    corrupted: '#663366',
    infernal: '#8f1e1e',
    celestial: '#6b6bcf',
    undead: '#555577',
    elemental: '#cf9f3f',
    default: '#666',
};

const getAreaEmoji = (type?: string): string => {
    switch (type) {
        case 'village': return '🏘️';
        case 'city': return '🏙️';
        case 'camp': return '🏕️';
        case 'town': return '🏰';
        case 'dungeon': return '🕸️';
        case 'wilderness': return '🌲';
        case 'gate': return '🚪';
        default: return '❓';
    }
};

const MiniMap = ({ currentX, currentY }: Props) => {
    const map = getMapData();
    const containerRef = useRef<HTMLDivElement>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const coords = Object.keys(map).map(key => {
        const [x, y] = key.split(',').map(Number);
        return { x, y, key };
    });

    const centerOnPlayer = () => {
        const x = -(currentX * TILE_SIZE - (VIEW_WIDTH * TILE_SIZE) / 2);
        const y = -(currentY * TILE_SIZE - (VIEW_HEIGHT * TILE_SIZE) / 2);
        setOffset({ x, y });
    };

    useEffect(() => {
        centerOnPlayer();
    }, [currentX, currentY]);

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging.current) {
            setOffset({
                x: e.clientX - dragStart.current.x,
                y: e.clientY - dragStart.current.y,
            });
        }
    };


    return (
        <div style={{
            width: VIEW_WIDTH * TILE_SIZE,
            height: VIEW_HEIGHT * TILE_SIZE + 40,
            backgroundColor: '#111',
            padding: '5px',
            borderRadius: '6px',
            overflow: 'hidden',
            fontFamily: 'sans-serif',
            userSelect: 'none',
        }}>
            <div style={{ color: '#fff', fontSize: '0.75rem' }}>
                Coords: ({currentX}, {currentY})
            </div>

            <div style={{ marginBottom: 4, color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
                <span>🗺 Map</span>
                <button onClick={centerOnPlayer} style={{ fontSize: '0.7rem' }}>🎯 Center</button>
            </div>

            <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                style={{
                    width: '100%',
                    height: VIEW_HEIGHT * TILE_SIZE,
                    overflow: 'hidden',
                    cursor: 'grab',
                    position: 'relative',
                }}
            >
                <div style={{
                    position: 'absolute',
                    left: offset.x,
                    top: offset.y,
                }}>
                    {/* Tiles */}
                    {coords.map(({ x, y, key }) => {
                        const area = map[key];
                        const isCurrent = x === currentX && y === currentY;

                        const isGate = area?.role === 'gate';
                        const isPlayer = isCurrent;

                        let bgColor = typeColors[area?.type ?? area?.theme] || typeColors.default;
                        let emoji = '❓';

                        if (isPlayer) {
                            emoji = '🧍';
                        } else if (isGate) {
                            emoji = '🚪';
                            bgColor = '#c49e6c';
                        } else {
                            emoji = getAreaEmoji(area?.type);
                        }

                        return (
                            <div
                                key={key}
                                style={{
                                    position: 'absolute',
                                    left: x * TILE_SIZE,
                                    top: y * TILE_SIZE,
                                    width: TILE_SIZE,
                                    height: TILE_SIZE,
                                    backgroundColor: bgColor,
                                    fontSize: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxSizing: 'border-box',
                                    zIndex: isPlayer ? 3 : isGate ? 2 : 0,
                                }}
                                title={area ? `${area.name} (${area.theme})` : 'Unknown'}
                            >
                                {emoji}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MiniMap;