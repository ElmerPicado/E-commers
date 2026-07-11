import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tv, Image, Settings, Sun, Heart, Flame, Shield, Sparkles, Home } from 'lucide-react';
import { GalleryContext } from '../context/GalleryContext';

// Icon mapper for Navbar
const NavbarIcon = ({ name, color }) => {
  const style = { color: color };
  switch (name) {
    case 'Flame': return <Flame size={18} style={style} />;
    case 'Heart': return <Heart size={18} style={style} />;
    case 'Shield': return <Shield size={18} style={style} />;
    case 'Sun': return <Sun size={18} style={style} />;
    default: return <Sparkles size={18} style={style} />;
  }
};

export default function Navbar() {
  const location = useLocation();
  const { livestream, radio, ministries } = useContext(GalleryContext);

  const isActive = (path) => location.pathname === path;

  // Determine if active path corresponds to a dynamic ministry
  const getActiveMinistry = () => {
    if (location.pathname.startsWith('/ministerio/')) {
      const slug = location.pathname.split('/').pop();
      return ministries.find((m) => m.id === slug);
    }
    return null;
  };

  const activeMin = getActiveMinistry();

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(10, 10, 12, 0.8)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.75rem 1.5rem',
      transition: 'border-color 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand logo & title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {livestream.churchLogo && (
                <img src={livestream.churchLogo} alt="Church Logo" style={{ height: '44px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
              )}
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.5rem',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #ffffff 40%, var(--accent-color) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                marginLeft: livestream.churchLogo ? '0.25rem' : '0'
              }}>
                {livestream.churchName || 'IMR4'}
              </span>
          </Link>

          {activeMin && (
            <>
              <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {activeMin.logo_url ? (
                  <img src={activeMin.logo_url} alt={activeMin.name} style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '50%' }} />
                ) : (
                  <NavbarIcon name={activeMin.icon_name} color={activeMin.accent_color} />
                )}
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: activeMin.accent_color, display: 'block', lineHeight: 1.1 }}>
                    {activeMin.name.split(' - ')[0]}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>
                    {activeMin.schedule}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Dynamic Ministries Switcher */}
        <div style={{
          display: 'flex',
          gap: '0.25rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border-color)',
          padding: '0.25rem',
          borderRadius: '9999px',
          flexWrap: 'wrap'
        }}>
          {ministries.map((m) => (
            <Link
              key={m.id}
              to={`/ministerio/${m.id}`}
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                background: isActive(`/ministerio/${m.id}`) ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                color: isActive(`/ministerio/${m.id}`) ? m.accent_color : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              {m.name.split(' - ')[0]}
            </Link>
          ))}
        </div>

        {/* Global Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: isActive('/') ? 'var(--accent-color)' : 'var(--text-secondary)',
            transition: 'color 0.2s'
          }}>
            <Home size={15} />
            Inicio
          </Link>

          <Link to="/galeria" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: isActive('/galeria') ? 'var(--accent-color)' : 'var(--text-secondary)',
            transition: 'color 0.2s'
          }}>
            <Image size={15} />
            Galería
          </Link>

          <Link to="/live" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: isActive('/live') ? 'var(--accent-color)' : 'var(--text-secondary)',
            position: 'relative',
            transition: 'color 0.2s'
          }}>
            <Tv size={15} />
            En Vivo
            {(livestream.isLive || radio.isLive) && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-8px',
                width: '6px',
                height: '6px',
                background: '#ef4444',
                borderRadius: '50%',
                boxShadow: '0 0 8px #ef4444'
              }}></span>
            )}
          </Link>

          <Link to="/admin" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: isActive('/admin') ? 'var(--accent-color)' : 'var(--text-secondary)',
            transition: 'color 0.2s'
          }}>
            <Settings size={15} />
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
