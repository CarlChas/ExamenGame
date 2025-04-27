import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={{ padding: '1rem', backgroundColor: '#222', color: '#fff' }}>
      <ul style={{ display: 'flex', gap: '1rem', listStyle: 'none' }}>
        <li><Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>🏠 Home</Link></li>
        <li><Link to="/game" style={{ color: '#fff', textDecoration: 'none' }}>🎮 Play</Link></li>
        <li><Link to="/about" style={{ color: '#fff', textDecoration: 'none' }}>ℹ️ About</Link></li>
        <li><Link to="/characters" style={{ color: '#fff', textDecoration: 'none' }}>ℹ️Characters</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
