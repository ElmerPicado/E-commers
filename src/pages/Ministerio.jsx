import React, { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GalleryContext } from '../context/GalleryContext';
import { Flame, Heart, Shield, Sun, Sparkles, Calendar, MapPin, Users, BookOpen, Coffee, Smile, Briefcase, Mail, MessageSquare, Image as ImageIcon, ArrowRight } from 'lucide-react';

// Mapper to dynamically render icon components
const IconMapper = ({ name, size = 20, className = "" }) => {
  const icons = {
    Flame: <Flame size={size} className={className} />,
    Heart: <Heart size={size} className={className} />,
    Shield: <Shield size={size} className={className} />,
    Sun: <Sun size={size} className={className} />,
    Sparkles: <Sparkles size={size} className={className} />,
    Calendar: <Calendar size={size} className={className} />,
    MapPin: <MapPin size={size} className={className} />,
    Users: <Users size={size} className={className} />,
    BookOpen: <BookOpen size={size} className={className} />,
    Coffee: <Coffee size={size} className={className} />,
    Smile: <Smile size={size} className={className} />,
    Briefcase: <Briefcase size={size} className={className} />
  };
  return icons[name] || <Sparkles size={size} className={className} />;
};

export default function Ministerio() {
  const { id } = useParams();
  const { ministries, albums, activities } = useContext(GalleryContext);

  const ministry = ministries.find((m) => m.id === id);

  if (!ministry) {
    return (
      <div className="theme-imr4" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6.5rem 1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Ministerio no encontrado</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>La sección que buscas no existe o fue eliminada.</p>
          <Link to="/" className="btn btn-primary">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  // Filter photos and activities specific to this ministry
  const ministryAlbums = albums.filter((album) => album.category === ministry.id);
  const ministryActivities = activities.filter((act) => act.ministry_id === ministry.id);

  // Compute local dark themes based on ministry ID to give it a custom background style
  const getThemeClass = (mid) => {
    switch (mid) {
      case 'unanimes': return 'theme-unanimes';
      case 'mujeres': return 'theme-mujeres';
      case 'hombres': return 'theme-hombres';
      case 'ninos': return 'theme-ninos';
      default: return 'theme-imr4'; // default fallback for dynamically created ministries
    }
  };

  // Custom inline theme variable overrides for newly created ministries
  const customThemeVars = {
    '--accent-color': ministry.accent_color,
    '--accent-color-rgb': '16, 185, 129', // placeholder
  };

  return (
    <div className={getThemeClass(ministry.id)} style={{ ...customThemeVars, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Hero */}
      <section style={{
        padding: '6.5rem 1.5rem 4rem 1.5rem',
        background: `linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(0, 0, 0, 0) 100%)`,
        borderBottom: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="hero-badge" style={{ color: 'var(--accent-color)', borderColor: 'var(--accent-color)', background: 'rgba(255,255,255,0.03)' }}>
            <IconMapper name={ministry.icon_name} size={14} />
            {ministry.name.toUpperCase()}
          </div>
          <h1 className="gradient-text" style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', background: `linear-gradient(135deg, #fff 40%, var(--accent-color) 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {ministry.hero_title}
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.7' }}>
            {ministry.hero_desc}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="#contacto" className="btn btn-primary" style={{ background: 'var(--accent-color)', color: '#000' }}>
              Participar
            </a>
            <Link to="/galeria" className="btn btn-secondary">
              Ver Fotos
            </Link>
          </div>
        </div>
      </section>

      {/* Pillars / Core info (reads pillars array from DB) */}
      {ministry.pillars && ministry.pillars.length > 0 && (
        <section style={{ padding: '3.5rem 1.5rem' }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem'
            }} className="grid-cols-3">
              {ministry.pillars.map((pillar, idx) => (
                <div key={idx} className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    color: 'var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    border: '1px solid var(--border-color)'
                  }}>
                    <IconMapper name={pillar.icon} size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{pillar.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Activities specific to this ministry */}
      {ministryActivities.length > 0 && (
        <section style={{ padding: '3.5rem 1.5rem', background: 'rgba(255, 255, 255, 0.01)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Próximas Actividades</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Eventos programados de {ministry.name}. ¡Súmate!</p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {ministryActivities.map((act) => (
                <div key={act.id} className="glass-card" style={{ display: 'flex', gap: '1rem', padding: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    textAlign: 'center',
                    minWidth: '70px'
                  }}>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {new Date(act.date).toLocaleString('es-ES', { month: 'short' })}
                    </span>
                    <span style={{ display: 'block', fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-color)', lineHeight: '1.1' }}>
                      {new Date(act.date).getDate() + 1}
                    </span>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{act.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Hora: {act.time} hs | Lugar: {ministry.location}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {act.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery moments */}
      <section style={{ padding: '4rem 1.5rem' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Fotografías Recientes</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nuestras últimas reuniones y momentos capturados en fotos.</p>
            </div>
            <Link to="/galeria" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--accent-color)',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}>
              Ver todas las fotos <ArrowRight size={14} />
            </Link>
          </div>

          {ministryAlbums.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {ministryAlbums.slice(0, 3).map((album) => (
                <div key={album.id} className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                  <div style={{ height: '180px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                    {album.photos && album.photos.length > 0 ? (
                      <img
                        src={album.photos[0]}
                        alt={album.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'rgba(255,255,255,0.02)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)'
                      }}>
                        <ImageIcon size={32} />
                      </div>
                    )}
                    <span style={{
                      position: 'absolute',
                      bottom: '0.75rem',
                      right: '0.75rem',
                      background: 'rgba(0,0,0,0.7)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}>
                      {album.photos?.length || 0} Fotos
                    </span>
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: 700 }}>
                      {album.date}
                    </span>
                    <h4 style={{ fontSize: '1rem', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                      {album.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              background: 'rgba(255,255,255,0.01)',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)'
            }}>
              <ImageIcon size={32} style={{ marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.9rem' }}>No hay fotos registradas aún para este ministerio.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA / Contact */}
      <section id="contacto" style={{ padding: '4rem 1.5rem', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Conéctate Con Nosotros</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            Queremos que seas parte de nuestras actividades semanales en Río Cuarto. Escríbenos para recibir notificaciones directas o resolver cualquier consulta.
          </p>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Mail size={16} style={{ color: 'var(--accent-color)' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{ministry.contact_email}</span>
            </div>
            <a
              href={ministry.contact_link}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
              style={{
                marginTop: '0.5rem',
                background: 'var(--accent-color)',
                color: '#000',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <MessageSquare size={16} /> Contactar por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
