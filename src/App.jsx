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

const DynamicHead = () => {
  const { livestream } = useContext(GalleryContext);

  useEffect(() => {
    if (livestream?.churchName) {
      document.title = livestream.churchName;
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', livestream.churchName);
    }

    if (livestream?.churchLogo) {
      // Hacer el favicon redondo usando Canvas
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.arc(64, 64, 64, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 0, 0, 128, 128);

        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.type = 'image/png';
        link.href = canvas.toDataURL('image/png');
      };
      img.onerror = () => {
        // Fallback si falla el CORS
        let link = document.querySelector("link[rel*='icon']");
        if (link) link.href = livestream.churchLogo;
      };
      img.src = livestream.churchLogo;

      // Actualizar og:image dinámicamente (ayuda a algunos scrapers, aunque no a todos)
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) ogImage.setAttribute('content', livestream.churchLogo);
    }
  }, [livestream?.churchName, livestream?.churchLogo]);

  return null;
};
import Navbar from './components/Navbar';
import Footer from './components/Footer';

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
import ActivityDetail from './pages/ActivityDetail';
import BlogDetail from './pages/BlogDetail';
import DevocionalDetail from './pages/DevocionalDetail';
import SubmitDevocional from './pages/SubmitDevocional';
import Recursos from './pages/Recursos';
import GamesGrid from './pages/GamesGrid';
import GamePlay from './pages/GamePlay';
import VideosGrid from './pages/VideosGrid';
import VideoPlayer from './pages/VideoPlayer';
import MaestrosDashboard from './pages/maestros/Dashboard';
import MaestrosLogin from './pages/maestros/MaestrosLogin';
import AulaVirtual from './pages/aula/AulaVirtual';

const ProtectedAdminRoute = () => {
  const { adminUser } = useContext(GalleryContext);
  return adminUser ? <Admin /> : <Login />;
};

import './App.css';

const LayoutWrapper = () => {
  const location = useLocation();
  const isDevocionalWritePage = location.pathname === '/devocional';
  // Rutas que requieren layout de pantalla completa (sin Navbar/Footer global)
  const isStandaloneRoute =
    location.pathname.startsWith('/maestros') ||
    location.pathname.startsWith('/aula');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <DynamicHead />
      {!isDevocionalWritePage && !isStandaloneRoute && <Navbar />}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ministerio/:id" element={<Ministerio />} />
          <Route path="/galeria" element={<Galeria />} />
          <Route path="/live" element={<Live />} />
          <Route path="/actividad/:id" element={<ActivityDetail />} />
          <Route path="/noticia/:id" element={<BlogDetail />} />
          <Route path="/donaciones" element={<Donaciones />} />
          <Route path="/historia" element={<Historia />} />
          <Route path="/devocionales" element={<Devocionales />} />
          <Route path="/devocionales/:id" element={<DevocionalDetail />} />
          <Route path="/devocional" element={<SubmitDevocional />} />
          <Route path="/devocionales/nuevo" element={<SubmitDevocional />} />
          <Route path="/recursos" element={<Recursos />} />
          <Route path="/ninos/juegos" element={<GamesGrid />} />
          <Route path="/ninos/juegos/:gameId" element={<GamePlay />} />
          <Route path="/ninos/videos" element={<VideosGrid />} />
          <Route path="/ninos/videos/:videoId" element={<VideoPlayer />} />

          {/* Maestros Platform */}
          <Route path="/maestros/login" element={<MaestrosLogin />} />
          <Route path="/maestros/*" element={<MaestrosDashboard />} />

          {/* Aula Virtual Estudiantes */}
          <Route path="aula-virtual/:codigo?" element={<AulaVirtual />} />

          <Route path="/admin" element={<ProtectedAdminRoute />} />
        </Routes>
      </main>
      {!isDevocionalWritePage && !isStandaloneRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <GalleryProvider>
      <Router>
        <ScrollToTop />
        <LayoutWrapper />
      </Router>
    </GalleryProvider>
  );
}

export default App;

