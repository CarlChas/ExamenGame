import React from 'react';

interface Props {
  children: React.ReactNode;
}

const GameWindow = ({ children }: Props) => {
  return (
    <div style={{
      width: '640px',
      height: '480px',
      backgroundColor: '#111',
      border: '4px solid #444',
      borderRadius: '8px',
      margin: '2rem auto',
      padding: '1rem',
      boxShadow: '0 0 20px rgba(0,0,0,0.5)'
    }}>
      {children}
    </div>
  );
};

export default GameWindow;
