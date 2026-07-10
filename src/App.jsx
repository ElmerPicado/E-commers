import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GalleryProvider } from './context/GalleryContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Ministerio from './pages/Ministerio';
import Galeria from './pages/Galeria';
import Live from './pages/Live';
import Admin from './pages/Admin';

import './App.css';

function App() {
  return (
    <GalleryProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/ministerio/:id" element={<Ministerio />} />
              <Route path="/galeria" element={<Galeria />} />
              <Route path="/live" element={<Live />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </GalleryProvider>
  );
}

export default App;
