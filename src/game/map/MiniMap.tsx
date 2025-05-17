import { useEffect, useRef, useState } from 'react';
import { getMapData } from './map';

interface Props {
    currentX: number;
    currentY: number;
}

const TILE_SIZE = 24;

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
        const x = -(currentX * TILE_SIZE - (containerRef.current?.offsetWidth ?? 0) / 2);
        const y = -(currentY * TILE_SIZE - (containerRef.current?.offsetHeight ?? 0) / 2);
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
        <div
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#111',
                padding: '0.5rem',
                borderRadius: '6px',
                fontFamily: 'sans-serif',
                userSelect: 'none',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#fff',
                    fontSize: '0.75rem',
                    marginBottom: '4px',
                    marginTop: -15,
                }}
            >
                <span>Coords: ({currentX}, {currentY})</span>
                <button
                    onClick={centerOnPlayer}
                    style={{
                        fontSize: '0.7rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: '#333',
                        color: '#fff',
                        cursor: 'pointer',
                    }}
                >
                    🎯 Center
                </button>
            </div>


            <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                style={{
                    flexGrow: 1,
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    cursor: 'grab',
                    position: 'relative',
                    border: '1px solid #333',
                    borderRadius: '4px',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        left: offset.x,
                        top: offset.y,
                    }}
                >
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
