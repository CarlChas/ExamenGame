import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// import Home from './pages/Home';
import About from './pages/About';
import Game from './pages/Game';
import Login from './auth/Login';

const App = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 120px)', padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/game" element={<Game />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
