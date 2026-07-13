import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tv, Image, Settings, Sun, Heart, Flame, Shield, Sparkles, Home, Menu, X, MapPin, BookOpen, Library } from 'lucide-react';
import { GalleryContext } from '../context/GalleryContext';
import ContactFormModal from './ContactFormModal';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Cierra el menú móvil cuando cambia la ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (livestream.churchName) {
      document.title = livestream.churchName;
    }
    if (livestream.churchLogo) {
      const link = document.querySelector("link[rel~='icon']");
      if (link) {
        link.href = livestream.churchLogo;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = livestream.churchLogo;
        document.head.appendChild(newLink);
      }
    }
  }, [livestream.churchName, livestream.churchLogo]);

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
    <>
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
                <img src={livestream.churchLogo} alt="Church Logo" style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '50%', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
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
        <div className="desktop-only" style={{
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
        <div className="desktop-only" style={{ alignItems: 'center', gap: '1.25rem' }}>
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

          <Link to="/historia" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: isActive('/historia') ? 'var(--accent-color)' : 'var(--text-secondary)',
            transition: 'color 0.2s'
          }}>
            <BookOpen size={15} />
            Nuestra Historia
          </Link>

          <Link to="/devocionales" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: isActive('/devocionales') ? 'var(--accent-color)' : 'var(--text-secondary)',
            transition: 'color 0.2s'
          }}>
            <BookOpen size={15} />
            Devocionales
          </Link>

          <Link to="/recursos" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: isActive('/recursos') ? 'var(--accent-color)' : 'var(--text-secondary)',
            transition: 'color 0.2s'
          }}>
            <Library size={15} />
            Recursos
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

          <button 
            onClick={() => setIsContactModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--bg-primary)',
              background: 'var(--accent-color)',
              border: 'none',
              padding: '0.4rem 1rem',
              borderRadius: '2rem',
              cursor: 'pointer',
              transition: 'transform 0.2s, filter 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.2)'}
            onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
          >
            Petición de Oración
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="mobile-only">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.25rem'
            }}
          >
            <span style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
              {isMobileMenuOpen ? 'Cerrar' : 'Menú'}
            </span>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
    </nav>

      {/* Mobile Full Screen Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-only" style={{
          position: 'fixed',
          top: '72px', /* Height of the sticky navbar */
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--bg-surface)',
          zIndex: 45,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '2rem 1.5rem 6rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5rem'
        }}>
          
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Navegación
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: isActive('/') ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
                <Home size={20} /> Inicio
              </Link>
              <Link to="/historia" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: isActive('/historia') ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
                <BookOpen size={20} /> Nuestra Historia
              </Link>
              <Link to="/devocionales" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: isActive('/devocionales') ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
                <BookOpen size={20} /> Devocionales
              </Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Ministerios
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {ministries.map((m) => (
                <Link key={m.id} to={`/ministerio/${m.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: isActive(`/ministerio/${m.id}`) ? m.accent_color : 'var(--text-secondary)' }}>
                  {m.logo_url ? (
                    <img src={m.logo_url} alt={m.name} style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'contain' }} />
                  ) : (
                    <NavbarIcon name={m.icon_name} color={m.accent_color} />
                  )}
                  {m.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Recursos
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link to="/recursos" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: isActive('/recursos') ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
                <Library size={20} /> Biblioteca de Recursos
              </Link>
              <Link to="/galeria" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: isActive('/galeria') ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
                <Image size={20} /> Galería de Fotos
              </Link>
              <Link to="/live" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: isActive('/live') ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
                <Tv size={20} /> En Vivo & Radio
              </Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Contacto
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} /> {livestream?.churchAddress || 'Río Cuarto, Córdoba'}
              </div>
              <div>Email: {livestream?.churchEmail || 'contacto@imr4.org'}</div>
              {livestream?.churchMapsUrl && (
                <a href={livestream.churchMapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', fontWeight: 600, marginTop: '0.5rem' }}>
                  Ver en Google Maps &rarr;
                </a>
              )}
              
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsContactModalOpen(true);
                }}
                className="btn btn-primary"
                style={{ marginTop: '0.5rem', alignSelf: 'flex-start', padding: '0.5rem 1.5rem', fontWeight: 700 }}
              >
                Petición de Oración
              </button>
            </div>
          </div>
          
        </div>
      )}

      <ContactFormModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </>
  );
}
