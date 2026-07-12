import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Tv, ChevronRight, Flame, Heart, Shield, Sun, Sparkles, Calendar, MapPin, Bell, Clock } from 'lucide-react';
import { GalleryContext } from '../context/GalleryContext';

// Icon mapper for dynamic ministry icons
const MinistryIcon = ({ name, color }) => {
  const style = { color: color };
  switch (name) {
    case 'Flame': return <Flame size={28} style={style} />;
    case 'Heart': return <Heart size={28} style={style} />;
    case 'Shield': return <Shield size={28} style={style} />;
    case 'Sun': return <Sun size={28} style={style} />;
    default: return <Sparkles size={28} style={style} />;
  }
};

export default function Home() {
  const { livestream, homeSections, ministries, activities } = useContext(GalleryContext);

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
      <section style={{
        position: 'relative',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        padding: '6rem 1.5rem 4rem 1.5rem',
        backgroundImage: `linear-gradient(rgba(10, 10, 12, 0.4), rgba(10, 10, 12, 0.95)), url(${heroSection.bg_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container grid-cols-2" style={{
          zIndex: 2,
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '2.5rem',
          alignItems: 'center',
          width: '100%'
        }}>
          
          {/* Left: Heading & Main Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
              fontSize: '3.8rem',
              lineHeight: '1.05',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              background: 'linear-gradient(135deg, #ffffff 40%, var(--accent-color) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em'
            }}>
              {heroSection.title}
            </h1>
            
            <p style={{
              fontSize: '1.2rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              maxWidth: '550px'
            }}>
              {heroSection.subtitle}
            </p>

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

            <div className="glass-card" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              background: 'rgba(18, 18, 22, 0.45)',
              cursor: 'pointer'
            }} onClick={() => alert('Información de Ofrendas: CBU Metodista Río Cuarto 0110438220043820128374 (simulado)')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Heart size={20} style={{ color: 'var(--accent-color)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Diezmos y Ofrendas</span>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>

            {livestream?.churchMapsUrl && (
              <a href={livestream.churchMapsUrl} target="_blank" rel="noopener noreferrer" className="glass-card" style={{
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

      {/* 2. DYNAMIC HOMEPAGE SECTIONS (BANNERS IN BLOCKS DOWNWARD) */}
      {otherSections.map((sec) => (
        <section
          key={sec.id}
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
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                margin: '0 auto 2.5rem auto',
                maxWidth: '800px',
                textAlign: 'left'
              }}>
                {sec.schedules.map((sched, idx) => (
                  <div key={idx} className="glass-card" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '1.5rem', 
                    background: 'rgba(10, 10, 14, 0.85)', 
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>{sched.desc || sched.day}</span>
                      {sched.desc && <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{sched.day}</span>}
                    </div>
                    <div style={{ color: 'var(--accent-color)', fontWeight: 700, fontSize: '1.05rem', whiteSpace: 'nowrap', paddingLeft: '1.5rem' }}>
                      {sched.time}
                    </div>
                  </div>
                ))}
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

      {/* 3. DYNAMIC MINISTRIES GRID (NUESTRAS DIVISIONES) */}
      <section style={{ padding: '4rem 1.5rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Nuestras Divisiones</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Espacios adaptados especialmente para cada etapa de la vida y necesidad espiritual.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1.5rem'
          }} className="grid-cols-2">
            {ministries.map((min) => (
              <div key={min.id} className="glass-card" style={{
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
                    borderRadius: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem'
                  }}>
                    <MinistryIcon name={min.icon_name} color={min.accent_color} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>{min.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    {min.description}
                  </p>
                </div>
                <Link to={`/ministerio/${min.id}`} className="btn btn-secondary" style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
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
        background: 'rgba(255,255,255,0.01)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Próximas Actividades</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Conoce nuestro calendario de eventos de este mes.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activities.length > 0 ? (
              activities.map((act) => {
                const organizingMinistry = ministries.find(m => m.id === act.ministry_id);
                const accentColor = organizingMinistry ? organizingMinistry.accent_color : 'var(--accent-color)';
                const dateObj = new Date(act.date);
                
                return (
                  <div key={act.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr auto',
                    alignItems: 'center',
                    padding: '1.25rem 1.5rem',
                    background: 'var(--bg-surface)',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border-color)',
                    gap: '1.5rem'
                  }} className="grid-cols-1">
                    
                    {/* Date Block */}
                    <div style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.35rem',
                      padding: '0.4rem 0.6rem',
                      textAlign: 'center'
                    }}>
                      <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {dateObj.toLocaleString('es-ES', { month: 'short' })}
                      </span>
                      <span style={{ display: 'block', fontSize: '1.3rem', fontWeight: 800, color: accentColor, lineHeight: '1.1' }}>
                        {dateObj.getDate() + 1}
                      </span>
                    </div>

                    {/* Content */}
                    <div>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: accentColor,
                        background: 'rgba(255,255,255,0.04)',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '0.2rem',
                        display: 'inline-block',
                        marginBottom: '0.35rem'
                      }}>
                        {organizingMinistry ? organizingMinistry.name.split(' - ')[0] : 'General'}
                      </span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem' }}>{act.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{act.description}</p>
                    </div>

                    {/* Time / Link */}
                    <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                      <span style={{ display: 'block', fontWeight: 700, color: 'var(--text-primary)' }}>{act.time} hs</span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        <MapPin size={10} style={{ display: 'inline', marginRight: '2px' }} />
                        {organizingMinistry ? organizingMinistry.location : 'IMR4'}
                      </span>
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


    </div>
  );
}
