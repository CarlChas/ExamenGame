import { useEffect, useRef, useState } from 'react';
import { getMapData } from './map';

interface Props {
    currentX: number;
    currentY: number;
}

const TILE_SIZE = 24;
const WALL_THICKNESS = 4;
const VIEW_WIDTH = 15;
const VIEW_HEIGHT = 15;

const biomeColors: Record<string, string> = {
    tundra: '#aee1f9',
    desert: '#f4e2b0',
    forest: '#88c799',
    swamp: '#7e9c91',
    wastes: '#b5b5b5',
    corrupted: '#6d597a',
    infernal: '#d62828',
    celestial: '#9d4edd',
    undead: '#adb5bd',
    elemental: '#fca311',
    default: '#666',
    city: '#888', // ← now valid
    town: '#999',
    camp: '#aaa',
    village: '#bbb',
};

/* const getEnemyEmoji = (theme?: string) => {
    switch (theme) {
        case 'undead': return '💀';
        case 'elemental': return '🔥';
        case 'corrupted': return '🕷️';
        case 'celestial': return '✨';
        case 'infernal': return '😈';
        default: return '👾';
    }
}; */

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

    const centerOnPlayer = () => {
        const x = -(currentX * TILE_SIZE - (VIEW_WIDTH * TILE_SIZE) / 2);
        const y = -(currentY * TILE_SIZE - (VIEW_HEIGHT * TILE_SIZE) / 2);
        setOffset({ x, y });
    };

    useEffect(() => {
        centerOnPlayer();
    }, [currentX, currentY]);

    const drawnWalls = new Set<string>();

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

                        let bgColor = typeColors[area.type ?? area.theme] || typeColors.default;

                        let emoji = '';

                        const isRoad = typeof window !== 'undefined' && (window as any).roadTiles?.has(key);
                        if (isRoad) {
                            bgColor = '#a07d56'; // road color
                            emoji = '🛣️';
                        }

                        if (area) {
                            bgColor = biomeColors[area.theme] || biomeColors.default;

                            if (isCurrent) {
                                emoji = '🧍';
                            } else if (area.role === 'gate') {
                                emoji = '🚪';
                            } else {
                                emoji = getAreaEmoji(area.type);
                            }

                            if (isCurrent) {
                                emoji = '🧍';
                                /* } else if (area.enemies?.length) {
                                    emoji = getEnemyEmoji(area.enemies[0].theme); */
                            }
                            else {
                                emoji = getAreaEmoji(area.type);
                            }
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
                                }}
                                title={area ? `${area.name} (${area.theme})` : 'Unknown'}
                            >
                                {emoji}
                            </div>
                        );
                    })}

                    {/* Walls */}
                    {coords.flatMap(({ x, y }) => {
                        const area = map[`${x},${y}`];
                        if (!area || !area.blocked) return [];

                        const wallKey = (dir: string) => `${dir}-${x},${y}`;
                        const walls = [];

                        if (area.blocked.north && !drawnWalls.has(wallKey('north'))) {
                            drawnWalls.add(wallKey('north'));
                            walls.push(
                                <div key={wallKey('north')} style={{
                                    position: 'absolute',
                                    left: x * TILE_SIZE - 1,
                                    top: y * TILE_SIZE - WALL_THICKNESS / 2,
                                    width: TILE_SIZE + 2,
                                    height: WALL_THICKNESS,
                                    backgroundColor: 'red',
                                }} />
                            );
                        }

                        if (area.blocked.south && !drawnWalls.has(wallKey('south'))) {
                            drawnWalls.add(wallKey('south'));
                            walls.push(
                                <div key={wallKey('south')} style={{
                                    position: 'absolute',
                                    left: x * TILE_SIZE - 1,
                                    top: (y + 1) * TILE_SIZE - WALL_THICKNESS / 2,
                                    width: TILE_SIZE + 2,
                                    height: WALL_THICKNESS,
                                    backgroundColor: 'red',
                                }} />
                            );
                        }

                        if (area.blocked.west && !drawnWalls.has(wallKey('west'))) {
                            drawnWalls.add(wallKey('west'));
                            walls.push(
                                <div key={wallKey('west')} style={{
                                    position: 'absolute',
                                    top: y * TILE_SIZE - 1,
                                    left: x * TILE_SIZE - WALL_THICKNESS / 2,
                                    width: WALL_THICKNESS,
                                    height: TILE_SIZE + 2,
                                    backgroundColor: 'red',
                                }} />
                            );
                        }

                        if (area.blocked.east && !drawnWalls.has(wallKey('east'))) {
                            drawnWalls.add(wallKey('east'));
                            walls.push(
                                <div key={wallKey('east')} style={{
                                    position: 'absolute',
                                    top: y * TILE_SIZE - 1,
                                    left: (x + 1) * TILE_SIZE - WALL_THICKNESS / 2,
                                    width: WALL_THICKNESS,
                                    height: TILE_SIZE + 2,
                                    backgroundColor: 'red',
                                }} />
                            );
                        }

                        return walls;
                    })}
                </div>
            </div>
        </div>
    );
};

export default MiniMap;
