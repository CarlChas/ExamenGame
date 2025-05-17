import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const linkStyle = {
    color: '#fff',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
  };

  const navLinks = (
    <ul
      style={{
        listStyle: 'none',
        display: isMobile ? (menuOpen ? 'flex' : 'none') : 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '0' : '1rem',
        padding: 0,
        margin: 0,
        backgroundColor: isMobile ? '#222' : 'transparent',
        position: isMobile ? 'absolute' : 'static',
        top: '60px',
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <li><Link to="/" style={linkStyle} onClick={() => setMenuOpen(false)}>🏠 Home</Link></li>
      <li><Link to="/game" style={linkStyle} onClick={() => setMenuOpen(false)}>🎮 Play</Link></li>
      <li><Link to="/about" style={linkStyle} onClick={() => setMenuOpen(false)}>ℹ️ About</Link></li>
      <li><Link to="/characters" style={linkStyle} onClick={() => setMenuOpen(false)}>🧙 Characters</Link></li>
    </ul>
  );

  return (
    <nav style={{ padding: '1rem', backgroundColor: '#222', color: '#fff', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>My Game</strong>
        {isMobile && (
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
            aria-label="Toggle navigation"
          >
            ☰
          </button>
        )}
      </div>
      {navLinks}
    </nav>
  );
};

export default Navbar;
