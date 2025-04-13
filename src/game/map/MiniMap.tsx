// src/game/map/MiniMap.tsx

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

    const rows = [];
    for (let y = minY; y <= maxY; y++) {
        const row = [];
        for (let x = minX; x <= maxX; x++) {
            const cellKey = `${x},${y}`;
            const area = map[cellKey];
            const isCurrent = x === currentX && y === currentY;

            let bgColor = '#000';
            let borders: React.CSSProperties = {
                borderTop: '1px solid #333',
                borderBottom: '1px solid #333',
                borderLeft: '1px solid #333',
                borderRight: '1px solid #333',
            };
            let content = '';

            if (area) {
                if (area.blocked?.north) borders.borderTop = '3px solid red';
                if (area.blocked?.south) borders.borderBottom = '3px solid red';
                if (area.blocked?.west) borders.borderLeft = '3px solid red';
                if (area.blocked?.east) borders.borderRight = '3px solid red';
                const hasEnemies = area.enemies && area.enemies.length > 0;

                const allSidesBlocked = ['north', 'south', 'east', 'west'].every(
                    (dir) => area.blocked?.[dir as keyof typeof area.blocked] === true
                );

                if (isCurrent) {
                    bgColor = '#00ff00';
                    content = '🧍';
                } else if (allSidesBlocked) {
                    bgColor = '#444';
                    content = '🚫';
                } else if (hasEnemies) {
                    bgColor = '#222';
                    const enemyTheme = area.enemies?.[0]?.theme;
                    content = getEnemyEmoji(enemyTheme);
                } else {
                    bgColor = '#666';
                }
            }

            row.push(
                <div
                    key={cellKey}
                    style={{
                        width: 20,
                        height: 20,
                        position: 'relative',
                        backgroundColor: bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        boxSizing: 'border-box',
                    }}
                    title={area ? `${area.name} (${area.theme})` : 'Unknown'}
                >
                    {content}

                    {/* Inner walls */}
                    {area?.blocked?.north && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 2,
                            backgroundColor: 'red',
                        }} />
                    )}
                    {area?.blocked?.south && (
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 2,
                            backgroundColor: 'red',
                        }} />
                    )}
                    {area?.blocked?.west && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            width: 2,
                            backgroundColor: 'red',
                        }} />
                    )}
                    {area?.blocked?.east && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            right: 0,
                            width: 2,
                            backgroundColor: 'red',
                        }} />
                    )}
                </div>

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
            fontFamily: 'sans-serif'
        }}>
            <p style={{ color: '#fff', marginBottom: 4 }}>🗺 Map</p>
            {rows}
            <div style={{ marginTop: 6, fontSize: '0.7rem', color: '#ccc' }}>
                <p>🧍 You</p>
                <p>💀 Undead</p>
                <p>🔥 Elemental</p>
                <p>🕷️ Corrupted</p>
                <p>✨ Celestial</p>
                <p>😈 Infernal</p>
                <p>🚫 Inaccessible Room</p>
                <p style={{ color: '#f00' }}>⬛ Inaccessible (walled)</p>
            </div>
        </div>
    );
};

export default MiniMap;
