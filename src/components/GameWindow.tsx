import React, { useState } from 'react';
import MiniMap from '../game/map/MiniMap';

interface Props {
  children: React.ReactNode;
  currentX: number;
  currentY: number;
}

const GameWindow = ({ children, currentX, currentY }: Props) => {
  const [showMiniMap, setShowMiniMap] = useState(true);

  return (
    <div style={{
      width: '640px',
      height: '480px',
      backgroundColor: '#111',
      border: '4px solid #444',
      borderRadius: '8px',
      margin: '2rem auto',
      padding: '1rem',
      boxShadow: '0 0 20px rgba(0,0,0,0.5)',
      position: 'relative',
    }}>
      {/* Toggle Button */}
      <button
        onClick={() => setShowMiniMap(prev => !prev)}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: '#222',
          color: '#eee',
          border: '1px solid #555',
          borderRadius: '4px',
          padding: '4px 8px',
          cursor: 'pointer',
          zIndex: 10,
        }}
      >
        {showMiniMap ? 'Hide MiniMap' : 'Show MiniMap'}
      </button>

      {/* Only show if toggled on */}
      {showMiniMap && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
        }}>
          <MiniMap currentX={currentX} currentY={currentY} />
        </div>
      )}

      <div>
        {children}
      </div>
    </div>
  );
};

export default GameWindow;
