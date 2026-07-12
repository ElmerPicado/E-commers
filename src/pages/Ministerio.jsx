import React, { useContext } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { GalleryContext } from '../context/GalleryContext';
import { ArrowLeft, Calendar, ArrowRight, UserPlus, Image as ImageIcon, Sparkles, Flame, Heart, Shield, Sun, MapPin, Users, BookOpen, Coffee, Smile, Briefcase, Mail, MessageSquare } from 'lucide-react';

const InstagramIcon = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

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
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
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
  const ministryAlbums = albums.filter((album) => (album.ministry_id || album.category) === ministry.id);
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
    <div className={getThemeClass(ministry.id)} style={{ ...customThemeVars, minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      
      {/* Decorative Background Elements */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '-10%',
        width: '40%',
        height: '40%',
        background: 'var(--accent-color)',
        filter: 'blur(150px)',
        opacity: 0.15,
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '-10%',
        width: '40%',
        height: '40%',
        background: 'var(--accent-color)',
        filter: 'blur(150px)',
        opacity: 0.1,
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>
      
      {/* Hero */}
      <section style={{
        position: 'relative',
        padding: '8rem 1.5rem 6rem 1.5rem',
        minHeight: '65vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0c',
        borderBottom: '1px solid var(--border-color)',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Capa 1: Fondo borroso estirado */}
        {ministry.hero_image && (
          <div style={{
            position: 'absolute',
            top: '-5%', left: '-5%', right: '-5%', bottom: '-5%', // Evita bordes blancos del blur
            backgroundImage: `url("${ministry.hero_image}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(25px) brightness(0.25)',
            zIndex: 0
          }}></div>
        )}
        
        {/* Capa 2: Imagen nítida sin recortes (contain) */}
        {ministry.hero_image && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url("${ministry.hero_image}")`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 1
          }}></div>
        )}

        {/* Capa 3: Gradiente oscuro superior e inferior para que el texto resalte */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(rgba(10, 10, 12, 0.4) 0%, transparent 40%, transparent 60%, rgba(10, 10, 12, 0.9) 100%)',
          zIndex: 2,
          pointerEvents: 'none'
        }}></div>

        <div className="container" style={{ maxWidth: '800px', zIndex: 3, position: 'relative' }}>
          <div className="hero-badge" style={{ color: 'var(--accent-color)', borderColor: 'var(--accent-color)', background: 'rgba(255,255,255,0.03)' }}>
            {ministry.logo_url ? (
              <img src={ministry.logo_url} alt={ministry.name} style={{ width: '16px', height: '16px', objectFit: 'contain', borderRadius: '50%' }} />
            ) : (
              <IconMapper name={ministry.icon_name} size={14} />
            )}
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
            <Link to={`/galeria?min=${ministry.id}`} className="btn btn-secondary">
              Ver Fotos
            </Link>
            {ministry.instagram_url && (
              <a href={ministry.instagram_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0 0.8rem', display: 'flex', alignItems: 'center' }}>
                <InstagramIcon size={18} />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Pillars / Core info */}
      {(ministry.schedule || ministry.location || (ministry.pillars && ministry.pillars.some(p => p.title?.trim() || p.desc?.trim()))) && (
        <section style={{ padding: '3.5rem 1.5rem', position: 'relative', zIndex: 1 }}>
          <div className="container">
              {ministry.schedule && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Calendar size={18} />
                  <span>{ministry.schedule}</span>
                </div>
              )}
              {ministry.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                    fontWeight: 800,
                    fontSize: '0.65rem'
                  }}>M</div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {ministry.location}
                    {ministry.location_url && (
                      <a href={ministry.location_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }} title="Ver en Google Maps">
                        <MapPin size={14} />
                      </a>
                    )}
                  </span>
                </div>
              )}
            {ministry.pillars && ministry.pillars.some(p => p.title?.trim() || p.desc?.trim()) && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginTop: '2rem'
              }}>
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
            )}
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
                <div key={act.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'rgba(10, 10, 12, 0.6)' }}>
                  
                  {/* Header estilo Instagram */}
                  <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {ministry.logo_url ? (
                      <img src={ministry.logo_url} alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)', border: '1px solid var(--border-color)' }}>
                        <IconMapper name={ministry.icon_name} size={16} />
                      </div>
                    )}
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ministry.name}</span>
                  </div>

                  {/* Imagen grande */}
                  {act.image_url && (
                    <div style={{ width: '100%', aspectRatio: '4/5', background: '#000', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <img src={act.image_url} alt={act.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  {/* Cuerpo del post */}
                  <div style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <Heart size={20} style={{ color: 'var(--accent-color)' }} />
                      <MessageSquare size={20} style={{ color: 'var(--text-secondary)' }} />
                    </div>
                    
                    <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      <strong style={{ marginRight: '0.5rem' }}>{ministry.name.split(' ')[0]}</strong> 
                      <span style={{ fontWeight: 700 }}>{act.title}</span>
                    </p>
                    
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem', whiteSpace: 'pre-line' }}>
                      {act.description}
                    </p>
                    
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                       <Calendar size={12} /> {act.date} a las {act.time} hs
                       <span>•</span>
                       <MapPin size={12} /> {ministry.location}
                    </div>
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
            <Link to={`/galeria?min=${ministry.id}`} style={{
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
                <Link to={`/galeria?min=${ministry.id}&album=${album.id}`} key={album.id} className="glass-card" style={{ padding: '0', overflow: 'hidden', textDecoration: 'none', color: 'inherit', display: 'block' }}>
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
                      fontWeight: 700,
                      color: '#fff'
                    }}>
                      {album.photos?.length || 0} Fotos
                    </span>
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: 700 }}>
                      {album.date}
                    </span>
                    <h4 style={{ fontSize: '1rem', marginTop: '0.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                      {album.title}
                    </h4>
                  </div>
                </Link>
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
      {(ministry.contact_email || ministry.contact_link || ministry.contact_title) && (
      <section id="contacto" style={{ padding: '4rem 1.5rem', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border-color)', position: 'relative', zIndex: 1 }}>
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>{ministry.contact_title || 'Conéctate Con Nosotros'}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            {ministry.contact_desc || 'Queremos que seas parte de nuestras actividades semanales en Río Cuarto. Escríbenos para recibir notificaciones directas o resolver cualquier consulta.'}
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
            {ministry.contact_email && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Mail size={16} style={{ color: 'var(--accent-color)' }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{ministry.contact_email}</span>
              </div>
            )}
            {ministry.contact_link && (
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
                <MessageSquare size={16} /> {ministry.contact_button_text || 'Contactar por WhatsApp'}
              </a>
            )}
          </div>
        </div>
      </section>
      )}
    </div>
  );
}
