import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Image as ImageIcon, Tv, Settings } from 'lucide-react';

export default function MobileBottomNav() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="mobile-only" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 'calc(70px + env(safe-area-inset-bottom))',
      paddingBottom: 'env(safe-area-inset-bottom)',
      background: 'rgba(10, 10, 12, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border-color)',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.5)'
    }}>
      <Link to="/" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
        color: isActive('/') ? 'var(--accent-color)' : 'var(--text-muted)',
        transition: 'color 0.2s',
        padding: '0.5rem',
        flex: 1
      }}>
        <Home size={22} />
        <span style={{ fontSize: '0.65rem', fontWeight: isActive('/') ? 700 : 500 }}>Inicio</span>
      </Link>

      <Link to="/galeria" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
        color: isActive('/galeria') ? 'var(--accent-color)' : 'var(--text-muted)',
        transition: 'color 0.2s',
        padding: '0.5rem',
        flex: 1
      }}>
        <ImageIcon size={22} />
        <span style={{ fontSize: '0.65rem', fontWeight: isActive('/galeria') ? 700 : 500 }}>Galería</span>
      </Link>

      <Link to="/live" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
        color: isActive('/live') ? '#ef4444' : 'var(--text-muted)',
        transition: 'color 0.2s',
        padding: '0.5rem',
        flex: 1
      }}>
        <Tv size={22} />
        <span style={{ fontSize: '0.65rem', fontWeight: isActive('/live') ? 700 : 500 }}>En Vivo</span>
      </Link>

    </nav>
  );
}
