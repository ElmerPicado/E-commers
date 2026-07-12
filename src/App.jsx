import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
import { GalleryProvider, GalleryContext } from './context/GalleryContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';

// Pages
import Home from './pages/Home';
import Ministerio from './pages/Ministerio';
import Galeria from './pages/Galeria';
import Live from './pages/Live';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Donaciones from './pages/Donaciones';
import Historia from './pages/Historia';
import Devocionales from './pages/Devocionales';
import SubmitDevocional from './pages/SubmitDevocional';

const ProtectedAdminRoute = () => {
  const { adminUser } = useContext(GalleryContext);
  return adminUser ? <Admin /> : <Login />;
};

import './App.css';

function App() {
  return (
    <GalleryProvider>
      <Router>
        <ScrollToTop />
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/ministerio/:id" element={<Ministerio />} />
              <Route path="/galeria" element={<Galeria />} />
              <Route path="/live" element={<Live />} />
              <Route path="/donaciones" element={<Donaciones />} />
              <Route path="/historia" element={<Historia />} />
              <Route path="/devocionales" element={<Devocionales />} />
              <Route path="/enviar-devocional" element={<SubmitDevocional />} />
              <Route path="/admin" element={<ProtectedAdminRoute />} />
            </Routes>
          </main>
          <Footer />
          <MobileBottomNav />
        </div>
      </Router>
    </GalleryProvider>
  );
}

export default App;
