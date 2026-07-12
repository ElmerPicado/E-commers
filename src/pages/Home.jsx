import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Tv, ChevronRight, Flame, Heart, Shield, Sun, Sparkles, Calendar, MapPin, Bell, Clock, MessageCircle } from 'lucide-react';
import { GalleryContext } from '../context/GalleryContext';

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
  const { livestream, homeSections, ministries, activities, blogPosts } = useContext(GalleryContext);

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
      <section className="hero-section" style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: '1 1 min-content' }}>
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

              {/* Logo Grande a la derecha */}
              {livestream.churchLogo && (
                <div style={{ display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
                  <img 
                    src={livestream.churchLogo} 
                    alt="Logo Iglesia" 
                    style={{ 
                      width: '160px', 
                      height: '160px', 
                      borderRadius: '50%', 
                      objectFit: 'cover', 
                      background: '#fff',
                      border: '4px solid rgba(255,255,255,0.15)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                    }} 
                  />
                </div>
              )}
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

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem' 
          }}>
            {activities.length > 0 ? (
              activities.map((act) => {
                const organizingMinistry = ministries.find(m => m.id === act.ministry_id);
                const accentColor = organizingMinistry ? organizingMinistry.accent_color : 'var(--accent-color)';
                const dateObj = new Date(act.date);
                
                return (
                  <div key={act.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'rgba(10, 10, 12, 0.6)' }}>
                    
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
                      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Heart size={20} style={{ color: 'var(--accent-color)' }} />
                        <MessageCircle size={20} style={{ color: 'var(--text-muted)' }} />
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

                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1 }}>{act.description}</p>
                      
                      {organizingMinistry && (
                        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                          <Link to={`/ministerio/${organizingMinistry.id}`} className="btn btn-secondary" style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', borderRadius: '0.5rem', color: accentColor }}>
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
          background: 'var(--bg-surface)'
        }}>
          <div className="container" style={{ maxWidth: '1000px' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Noticias y Novedades</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Mantente informado sobre lo último en nuestra congregación.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {blogPosts.map((blog) => (
                <div key={blog.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {blog.image_url && (
                    <div style={{ height: '200px', width: '100%', overflow: 'hidden' }}>
                      <img src={blog.image_url} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', fontWeight: 800 }}>{blog.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', flex: 1 }}>
                      {blog.content}
                    </p>
                    <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Calendar size={14} /> 
                      {new Date(blog.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
