import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import About from './pages/About';
import Game from './pages/Game';
import LoginPage from './pages/LoginPage';
import CharacterPage from './pages/CharacterPage';
import CharacterDetailPage from './pages/CharacterDetails';

const App = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 120px)', padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/game" element={<Game />} />
          <Route path="/about" element={<About />} />
          <Route path="/characters" element={<CharacterPage />} />
          <Route path="/character/:id" element={<CharacterDetailPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
