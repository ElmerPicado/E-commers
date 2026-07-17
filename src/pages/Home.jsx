import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tv, ChevronRight, Flame, Heart, Shield, Sun, Sparkles, Calendar, MapPin, Bell, Clock, MessageCircle, ArrowRight, Share2 } from 'lucide-react';
import MinistryIcon from '../components/MinistryIcon';
import { GalleryContext } from '../context/GalleryContext';
import ContactFormModal from '../components/ContactFormModal';

// Función para formatear hora 24h a 12h AM/PM
const formatTime12h = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  let hours = parseInt(h, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // el 0 se convierte en 12
  return `${hours}:${m} ${ampm}`;
};





export default function Home() {
  const { livestream, homeSections, ministries, activities, blogPosts } = useContext(GalleryContext);
  const churchLogo = livestream?.churchLogo || '';
  const churchMapsUrl = livestream?.churchMapsUrl || '';
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Helper to find matching ministry by title/description
  const getMinistryForSchedule = (title) => {
    if (!title || !ministries) return null;
    const t = title.toLowerCase();
    if (t.includes('varón') || t.includes('varones') || t.includes('hombre') || t.includes('hombres')) {
      return ministries.find(m => m.id === 'hombres');
    }
    if (t.includes('mujer') || t.includes('mujeres')) {
      return ministries.find(m => m.id === 'mujeres');
    }
    if (t.includes('joven') || t.includes('juvenil') || t.includes('unánimes') || t.includes('unanimes')) {
      return ministries.find(m => m.id === 'unanimes');
    }
    if (t.includes('niño') || t.includes('niños') || t.includes('infantil')) {
      return ministries.find(m => m.id === 'ninos');
    }
    return null;
  };

  // Helper to render the logo or icon
  const getScheduleLogoOrIcon = (title) => {
    const min = getMinistryForSchedule(title);
    if (min && min.logo_url) {
      return (
        <img 
          src={min.logo_url} 
          alt={min.name} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            borderRadius: '50%'
          }} 
        />
      );
    }

    // Fallback icons
    const t = title.toLowerCase();
    if (t.includes('varón') || t.includes('varones') || t.includes('hombre') || t.includes('hombres')) {
      return <Shield size={22} style={{ color: '#10b981' }} />;
    }
    if (t.includes('mujer') || t.includes('mujeres')) {
      return <Heart size={22} style={{ color: '#db2777' }} />;
    }
    if (t.includes('joven') || t.includes('juvenil') || t.includes('unánimes') || t.includes('unanimes')) {
      return <Flame size={22} style={{ color: '#06b6d4' }} />;
    }
    return <Sparkles size={22} style={{ color: 'var(--accent-color)' }} />;
  };

  // Helper to get color theme for schedule
  const getScheduleColorTheme = (title) => {
    const min = getMinistryForSchedule(title);
    if (min) {
      return min.accent_color || 'var(--accent-color)';
    }
    const t = title.toLowerCase();
    if (t.includes('varón') || t.includes('varones') || t.includes('hombre') || t.includes('hombres')) {
      return '#10b981';
    }
    if (t.includes('mujer') || t.includes('mujeres')) {
      return '#db2777';
    }
    if (t.includes('joven') || t.includes('juvenil') || t.includes('unánimes') || t.includes('unanimes')) {
      return '#06b6d4';
    }
    return 'var(--accent-color)';
  };

  const getScheduleImage = (sched, sec) => {
    if (sched.image_url) return sched.image_url;

    const title = sched.desc || sched.day;
    const min = getMinistryForSchedule(title);
    if (min) {
      if (min.hero_image) return min.hero_image;
      if (min.logo_url) return min.logo_url;
    }

    return sec.bg_image || livestream.welcomeImageUrl || '';
  };

  // Helper to get translucent rgba colors for badges
  const hexToRgba = (hex, alpha) => {
    if (!hex) return `rgba(59, 130, 246, ${alpha})`;
    if (hex.startsWith('var(')) {
      return `color-mix(in srgb, ${hex} ${alpha * 100}%, transparent)`;
    }
    const cleanHex = hex.replace('#', '');
    const num = parseInt(cleanHex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Separate Hero from other sections
  const heroSection = homeSections.find(sec => sec.id === 'hero') || {
    title: 'Iglesia Metodista Río Cuarto',
    subtitle: 'Un espacio de gracia, fe y esperanza en Río Cuarto.',
    bg_image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80',
    button_text: 'Ver Culto en Vivo',
    button_url: '/live'
  };

  const otherSections = homeSections.filter(sec => sec.id !== 'hero');

  return (
    <div className="theme-imr4" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. HERO SECTION ESTILO PAS.cr */}
      <section 
        className="hero-section bg-fixed-mobile-scroll"
        style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: `linear-gradient(rgba(10, 10, 12, 0.4), rgba(10, 10, 12, 0.95)), url(${heroSection.bg_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container hero-grid" style={{
          zIndex: 2,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))',
          gap: '2.5rem',
          alignItems: 'center',
          width: '100%'
        }}>
          
          {/* Left: Heading & Main Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="hero-content-wrapper">
              
              {/* Logo Grande (Izquierda en PC, Abajo en celular) */}
              {livestream.churchLogo && (
                <div className="logo-wrapper" style={{ display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
                  <img 
                    src={livestream.churchLogo} 
                    alt="Logo Iglesia" 
                    className="hero-logo"
                    style={{ 
                      borderRadius: '50%', 
                      objectFit: 'cover', 
                      background: '#fff',
                      border: '4px solid rgba(255,255,255,0.15)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                    }} 
                  />
                </div>
              )}

              {/* Textos del Hero */}
              <div className="hero-text-wrapper">
                {livestream.isLive && (
                  <div style={{ display: 'inline-flex' }}>
                    <span style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        background: '#ef4444',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'pulse 1.5s infinite alternate'
                      }}></span>
                      TRANSMISIÓN EN VIVO ACTIVA
                    </span>
                  </div>
                )}
                
                <h1 style={{
                  fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
                  lineHeight: '1.1',
                  fontWeight: 800,
                  fontFamily: 'var(--font-display)',
                  background: 'linear-gradient(135deg, #ffffff 40%, var(--accent-color) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.03em',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <span>
                    {heroSection.title.includes('Río Cuarto') 
                      ? heroSection.title.replace('Río Cuarto', '').trim() 
                      : heroSection.title}
                  </span>
                  <span>
                    {heroSection.title.includes('Río Cuarto') && 'Río Cuarto'}
                  </span>
                </h1>
                
                <p style={{
                  fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                  maxWidth: '550px'
                }}>
                  {heroSection.subtitle}
                </p>
              </div>
            </div>

            {/* Poster / Live Embed representation */}
            <div className="glass-card" style={{
              padding: '1rem',
              background: 'rgba(18, 18, 22, 0.55)',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{
                width: '120px',
                height: '75px',
                background: '#000',
                borderRadius: '0.35rem',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-color)'
              }}>
                <Tv size={24} />
                {livestream.isLive && (
                  <span style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    background: '#ef4444',
                    borderRadius: '0.15rem',
                    fontSize: '0.55rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.3rem',
                    color: '#fff'
                  }}>LIVE</span>
                )}
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {livestream.isLive ? 'Transmitiendo Ahora' : 'Último Culto'}
                </span>
                <h3 style={{ fontSize: '0.95rem', margin: '0.1rem 0' }}>{livestream.title}</h3>
                <Link to="/live" style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                  Conectarse <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Quick Links / Pill Actions list */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            maxWidth: '380px',
            marginLeft: 'auto',
            width: '100%'
          }}>
            <Link to="/live" className="glass-card" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              background: 'rgba(18, 18, 22, 0.45)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Tv size={20} style={{ color: 'var(--accent-color)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Cultos en Directo</span>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </Link>

            <Link to="/galeria" className="glass-card" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              background: 'rgba(18, 18, 22, 0.45)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Calendar size={20} style={{ color: 'var(--accent-color)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Galerías de Fotos</span>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </Link>

            <Link to="/donaciones" className="glass-card" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              background: 'rgba(18, 18, 22, 0.45)',
              cursor: 'pointer'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Heart size={20} style={{ color: 'var(--accent-color)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Diezmos y Ofrendas</span>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </Link>

            {livestream?.churchAddress && (
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(livestream.churchAddress)}`} target="_blank" rel="noopener noreferrer" className="glass-card" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                background: 'rgba(var(--accent-color-rgb), 0.15)',
                border: '1px solid rgba(var(--accent-color-rgb), 0.3)',
                color: 'var(--text-primary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <MapPin size={20} style={{ color: 'var(--accent-color)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Visítanos</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{livestream.churchAddress || 'Ver mapa de ubicación'}</span>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 2. BIENVENIDA PASTORAL & LÍDERES */}
      <section style={{
        padding: '5rem 1.5rem',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        position: 'relative'
      }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))',
            gap: '3rem',
            alignItems: 'center',
            marginBottom: '4rem'
          }}>
            {/* Left: Text & Welcome */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'inline-flex' }}>
                <span style={{
                  background: 'rgba(var(--accent-color-rgb), 0.12)',
                  border: '1px solid rgba(var(--accent-color-rgb), 0.3)',
                  color: 'var(--accent-color)',
                  padding: '0.4rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Bienvenidos a IMR4
                </span>
              </div>
              
              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                lineHeight: '1.2',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                color: '#fff',
                margin: 0
              }}>
                {livestream?.welcomeTitle}
              </h2>

              <p style={{
                fontSize: '1.05rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.7',
                margin: 0,
                whiteSpace: 'pre-wrap'
              }}>
                {livestream?.welcomeText}
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>

                <button 
                  onClick={() => setIsContactModalOpen(true)}
                  className="btn btn-secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <MessageCircle size={16} /> Escríbenos
                </button>
              </div>
            </div>

            {/* Right: Pastoral Image Box */}
            <div style={{ position: 'relative', width: '100%', minHeight: '520px' }}>
              <div style={{
                position: 'absolute',
                top: '10%',
                left: '-5%',
                width: '100%',
                height: '100%',
                background: 'rgba(var(--accent-color-rgb), 0.05)',
                border: '1px solid rgba(var(--accent-color-rgb), 0.1)',
                borderRadius: '1.5rem',
                zIndex: 1
              }}></div>
              <div className="glass-card" style={{
                position: 'relative',
                padding: '1.5rem',
                background: 'rgba(18, 18, 22, 0.45)',
                borderRadius: '1.5rem',
                border: '1px solid var(--border-color)',
                zIndex: 2,
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                backdropFilter: 'blur(16px)'
              }}>
                <img 
                  src={livestream?.welcomeImageUrl} 
                  alt={livestream?.welcomePastorsTitle} 
                  style={{ 
                    width: '100%', 
                    height: '450px', 
                    objectFit: 'cover', 
                    borderRadius: '1rem',
                    marginBottom: '1rem'
                  }}
                />
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>{livestream?.welcomePastorsTitle}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: 700 }}>{livestream?.welcomePastorsSubtitle}</span>
                </div>
              </div>
            </div>
          </div>


        </div>
      </section>

      {/* 2. DYNAMIC HOMEPAGE SECTIONS (BANNERS IN BLOCKS DOWNWARD) */}
      {otherSections.map((sec) => (
        <section
          key={sec.id}
          className="bg-fixed-mobile-scroll"
          style={{
            position: 'relative',
            padding: '8rem 1.5rem',
            backgroundImage: `linear-gradient(rgba(10, 10, 12, 0.65), rgba(10, 10, 12, 0.75)), url(${sec.bg_image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderBottom: '1px solid var(--border-color)'
          }}
        >
          <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: '1000px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>
              {sec.title}
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
              {sec.subtitle}
            </p>

            {sec.schedules && sec.schedules.length > 0 && (
              <div style={{ position: 'relative', marginTop: '2rem' }}>
                <div className="swipe-indicator" style={{ marginBottom: '1.5rem', justifyContent: 'center' }}>
                  Desliza para ver más <ArrowRight size={16} />
                </div>
                <div className="scroll-container schedule-slider-container">
                  {sec.schedules.map((sched, idx) => {
                    const title = sched.desc || sched.day;
                    const cardImgUrl = getScheduleImage(sched, sec);
                    const isGeneral = !getMinistryForSchedule(title);
                    
                    return (
                      <div key={idx} className="scroll-item schedule-slider-card glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(10, 15, 30, 0.7)', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', borderRadius: '1.25rem', backdropFilter: 'blur(12px)' }}>
                        {cardImgUrl && (
                          <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.3)' }}>
                            <img src={cardImgUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', padding: '0 0.25rem', textAlign: 'left' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#e2e8f0', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                            <span>{sched.day}</span>
                            <span style={{ color: '#fff', fontWeight: 400 }}>{sched.time}</span>
                          </div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem', lineHeight: 1.1 }}>
                            {title}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fff', fontSize: '0.8rem' }}>
                            <MapPin size={14} />
                            <span>{livestream?.churchAddress || 'Campus Principal'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {sec.button_text && (
              <Link to={sec.button_url} className="btn btn-primary">
                {sec.button_text}
              </Link>
            )}
          </div>
        </section>
      ))}

      {/* 3. DYNAMIC MINISTRIES GRID (NUESTROS MINISTERIOS) */}
      <section style={{ 
        padding: '4rem 1.5rem',
        backgroundImage: livestream?.homeMinistriesBgUrl ? `linear-gradient(rgba(10, 10, 12, 0.8), rgba(10, 10, 12, 0.95)), url(${livestream.homeMinistriesBgUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Nuestros Ministerios</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Espacios adaptados especialmente para cada etapa de la vida y necesidad espiritual.
            </p>
            <div className="swipe-indicator">
              Desliza para ver más <ArrowRight size={16} />
            </div>
          </div>

          <div className="scroll-container">
            {ministries.map((min) => (
              <div key={min.id} className="glass-card scroll-item" style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '2rem',
                borderLeft: `4px solid ${min.accent_color}`,
                background: min.hero_image 
                  ? `linear-gradient(rgba(18, 18, 22, 0.75), rgba(18, 18, 22, 0.95)), url(${min.hero_image})`
                  : 'rgba(18, 18, 22, 0.65)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                <div>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                    overflow: 'hidden'
                  }}>
                    {min.logo_url ? (
                      <img src={min.logo_url} alt={min.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <MinistryIcon name={min.icon_name} color={min.accent_color} />
                    )}
                  </div>
                  <h3 style={{ fontSize: 'clamp(1.6rem, 6vw, 2rem)', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.1 }}>{min.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    {min.description}
                  </p>
                </div>
                <Link to={`/ministerio/${min.id}`} className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '0.6rem 1.25rem', fontSize: '0.9rem', background: '#3b82f6', color: '#ffffff', border: 'none' }}>
                  Ingresar al Sitio <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. UPCOMING ACTIVITIES CALENDAR */}
      <section style={{
        padding: '4rem 1.5rem',
        background: livestream?.homeActivitiesBgUrl ? `linear-gradient(rgba(10, 10, 12, 0.8), rgba(10, 10, 12, 0.95)), url(${livestream.homeActivitiesBgUrl})` : 'rgba(255,255,255,0.01)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Próximas Actividades</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Conoce nuestro calendario de eventos de este mes.</p>
            <div className="swipe-indicator">
              Desliza para ver más <ArrowRight size={16} />
            </div>
          </div>

          <div className="scroll-container">
            {activities.length > 0 ? (
              activities.map((act) => {
                const organizingMinistry = ministries.find(m => m.id === act.ministry_id);
                const accentColor = organizingMinistry ? organizingMinistry.accent_color : 'var(--accent-color)';
                const dateObj = new Date(act.date);
                
                return (
                  <div key={act.id} className="glass-card scroll-item" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'rgba(10, 10, 12, 0.6)' }}>
                    
                    {/* Encabezado del Post (Instagram Header) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {organizingMinistry?.logo_url ? (
                          <img src={organizingMinistry.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <MinistryIcon name={organizingMinistry?.icon_name || 'Sparkles'} color={accentColor} />
                        )}
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                          {organizingMinistry ? organizingMinistry.name.split(' - ')[0] : 'IMR4 Oficial'}
                        </span>
                        <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          {organizingMinistry?.location || 'Río Cuarto'}
                        </span>
                      </div>
                    </div>

                    {/* Foto Principal */}
                    {act.image_url ? (
                      <div style={{ width: '100%', aspectRatio: '4/5', background: '#000', position: 'relative' }}>
                        <img src={act.image_url} alt={act.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div style={{ width: '100%', aspectRatio: '4/5', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                        <Calendar size={64} style={{ opacity: 0.1, color: accentColor }} />
                      </div>
                    )}

                    {/* Cuerpo del post */}
                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
                        <Heart size={20} style={{ color: 'var(--accent-color)' }} />
                        <MessageCircle size={20} style={{ color: 'var(--text-muted)' }} />
                        <div style={{ flex: 1 }}></div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const shareUrl = `${window.location.origin}/actividad/${act.id}`;
                            if (navigator.share) {
                              navigator.share({
                                title: act.title,
                                text: '¡Mira esta actividad!',
                                url: shareUrl
                              }).catch(err => console.log('Error compartiendo:', err));
                            } else {
                              navigator.clipboard.writeText(shareUrl);
                              alert('¡Enlace copiado al portapapeles!');
                            }
                          }}
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Compartir"
                        >
                          <Share2 size={20} style={{ color: 'var(--text-muted)' }} />
                        </button>
                      </div>

                      {/* Título de la actividad, Fecha y Hora */}
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '0.5rem' }}>{act.title}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: accentColor, fontWeight: 700, fontSize: '0.95rem' }}>
                          <Calendar size={14} /> 
                          {dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                          <span>|</span>
                          <Clock size={14} />
                          {formatTime12h(act.time)}
                        </div>
                      </div>

                      <p style={{ 
                        fontSize: '0.85rem', 
                        color: 'var(--text-secondary)', 
                        lineHeight: '1.5',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {act.description}
                      </p>
                      
                      {act.description && act.description.length > 100 && (
                        <Link 
                          to={`/actividad/${act.id}`}
                          style={{
                            background: 'none', border: 'none', 
                            color: accentColor, fontWeight: 700, 
                            fontSize: '0.85rem', textAlign: 'left', 
                            padding: '0.5rem 0', cursor: 'pointer',
                            marginTop: '0.25rem',
                            display: 'inline-block',
                            textDecoration: 'none'
                          }}
                        >
                          Leer más...
                        </Link>
                      )}
                      
                      <div style={{ flex: 1 }}></div>
                      {organizingMinistry && (
                        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                          <Link to={`/ministerio/${organizingMinistry.id}`} className="btn btn-primary" style={{ width: '100%', padding: '0.6rem', fontSize: '0.9rem', borderRadius: '0.5rem', background: '#3b82f6', color: '#ffffff', border: 'none' }}>
                            Ir al Perfil del Ministerio
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                border: '1px dashed var(--border-color)',
                borderRadius: '0.5rem',
                color: 'var(--text-muted)'
              }}>
                <Bell size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <p>No hay próximas actividades programadas en este momento.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. NEWS / BLOG SECTION */}
      {blogPosts && blogPosts.length > 0 && (
        <section style={{
          padding: '4rem 1.5rem',
          background: livestream?.homeNewsBgUrl ? `linear-gradient(rgba(10, 10, 12, 0.8), rgba(10, 10, 12, 0.95)), url(${livestream.homeNewsBgUrl})` : 'var(--bg-surface)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <div className="container" style={{ maxWidth: '1000px' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Noticias y Novedades</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Mantente informado sobre lo último en nuestra congregación.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {blogPosts.map((blog) => (
                <div key={blog.id} className="glass-card blog-card-hover" style={{ 
                  padding: 0, 
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: 'column',
                  background: 'rgba(12, 13, 20, 0.45)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '1rem',
                  transition: 'all 0.3s ease'
                }}>
                  {blog.image_url && (
                    <div style={{ height: '200px', width: '100%', overflow: 'hidden' }}>
                      <img 
                        src={blog.image_url} 
                        alt={blog.title} 
                        className="blog-image-zoom"
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease'
                        }} 
                      />
                    </div>
                  )}
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {blog.category && (
                      <span style={{
                        alignSelf: 'flex-start',
                        background: 'rgba(59, 130, 246, 0.12)',
                        color: '#60a5fa',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.6rem',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '0.75rem'
                      }}>
                        {blog.category}
                      </span>
                    )}
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>
                      {blog.title}
                    </h3>
                    <p style={{ 
                      color: 'var(--text-secondary)', 
                      fontSize: '0.9rem', 
                      lineHeight: '1.6', 
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      marginBottom: '1.5rem',
                      flex: 1
                    }}>
                      {blog.content}
                    </p>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      marginTop: 'auto', 
                      paddingTop: '1rem', 
                      borderTop: '1px solid var(--border-color)' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Calendar size={13} /> 
                        {new Date(blog.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <Link 
                        to={`/noticia/${blog.id}`}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-color)',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          transition: 'color 0.2s ease',
                          textDecoration: 'none'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--accent-color)'}
                      >
                        Leer más <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. MAPA DE UBICACIÓN */}
      <section style={{
        padding: '4rem 1.5rem',
        background: 'var(--bg-base)',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>¿Dónde nos reunimos?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <MapPin size={16} style={{ color: 'var(--accent-color)' }} />
              {livestream?.churchAddress || 'Río Cuarto, Córdoba'}
            </p>
          </div>

          <div className="glass-card" style={{ 
            padding: 0, 
            overflow: 'hidden', 
            borderRadius: '1.5rem',
            border: '1px solid var(--border-color)',
            background: 'rgba(20, 20, 25, 0.4)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Mapa Embed en Modo Oscuro (Invertido) */}
            <div style={{ width: '100%', height: '400px', background: '#222' }}>
              {churchMapsUrl && churchMapsUrl.includes('maps/embed') ? (
                <iframe 
                  src={churchMapsUrl}
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, filter: 'grayscale(30%) brightness(0.85) contrast(1.05)' }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de la Iglesia"
                ></iframe>
              ) : churchMapsUrl ? (
                /* URL inválida (no es embed) — mostrar mensaje y botón para abrir */
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
                  <MapPin size={32} style={{ color: 'var(--accent-color)', opacity: 0.8 }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '340px', lineHeight: '1.6' }}>
                    Para mostrar el mapa incrustado, necesitás usar la URL de <strong style={{ color: 'var(--text-primary)' }}>Compartir → Insertar mapa</strong> de Google Maps (empieza con <code style={{ background: 'rgba(255,255,255,0.07)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.8rem' }}>maps/embed</code>).
                  </p>
                  <a href={churchMapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1.5rem', borderRadius: '999px' }}>
                    <MapPin size={14} style={{ display: 'inline', marginRight: '0.4rem' }} />
                    Abrir en Google Maps
                  </a>
                </div>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', gap: '0.5rem' }}>
                  <MapPin size={18} style={{ opacity: 0.5 }} />
                  Configurá el mapa en Admin → Datos de Iglesia → Google Maps URL
                </div>
              )}
            </div>
            
            <div style={{ 
              padding: '2.5rem 2rem', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '1.5rem',
              background: 'rgba(10, 10, 12, 0.6)'
            }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, textAlign: 'center', color: '#fff' }}>
                ¡Te esperamos con los brazos abiertos!
              </h3>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(livestream?.churchAddress || 'Río Cuarto, Alajuela, Costa Rica')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary map-btn-hover"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', flex: '1', minWidth: '220px', justifyContent: 'center' }}
                >
                  <MapPin size={18} /> Abrir en Google Maps
                </a>
                
                <a 
                  href={`https://waze.com/ul?q=${encodeURIComponent(livestream?.churchAddress || 'Río Cuarto, Alajuela, Costa Rica')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary map-btn-hover"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', flex: '1', minWidth: '220px', justifyContent: 'center', background: '#33ccff', color: '#000', border: 'none', fontWeight: 800 }}
                >
                  <MapPin size={18} /> Ir con Waze
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Modal */}
      <ContactFormModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />

    </div>
  );
}



