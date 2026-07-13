import React, { useContext, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { GalleryContext } from '../context/GalleryContext';
import { ArrowLeft, Calendar, ArrowRight, UserPlus, Image as ImageIcon, Sparkles, Flame, Heart, Shield, Sun, MapPin, Users, BookOpen, Coffee, Smile, Briefcase, Mail, MessageSquare, X, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

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
      <section className="hero-section-min" style={{
        position: 'relative',
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
          background: 'linear-gradient(rgba(10, 10, 12, 0.7) 0%, rgba(10, 10, 12, 0.45) 50%, rgba(10, 10, 12, 0.9) 100%)',
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
            <a href="#galeria" className="btn btn-secondary">
              Ver Fotos
            </a>
            {ministry.instagram_url && (
              <a href={ministry.instagram_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0 0.8rem', display: 'flex', alignItems: 'center' }}>
                <InstagramIcon size={18} />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Schedule / Location Block (Estilo PAS) */}
      {(ministry.schedule || ministry.location || ministry.instagram_url) && (
        <section style={{ padding: '3rem 1.5rem', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            
            {/* Redes sociales */}
            {ministry.instagram_url && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <a href={ministry.instagram_url} target="_blank" rel="noopener noreferrer" style={{
                  width: '40px', height: '40px', borderRadius: '8px', background: '#e1306c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: 'transform 0.2s'
                }}>
                  <InstagramIcon size={20} />
                </a>
              </div>
            )}

            {/* Horario Principal */}
            {ministry.schedule && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, textTransform: 'uppercase', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  {ministry.schedule}
                </h2>
              </div>
            )}

            {/* Ubicación y Acción */}
            {ministry.location && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <MapPin size={18} style={{ color: 'var(--accent-color)' }} />
                  {ministry.location}
                </p>
                {ministry.location_url && (
                  <a href={ministry.location_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem', borderRadius: '999px' }}>
                    ¿CÓMO LLEGAR?
                  </a>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Pillars / Core info (Estilo Alternado Zig-Zag) */}
      {ministry.pillars && ministry.pillars.some(p => p.title?.trim() || p.desc?.trim()) && (
        <section style={{ padding: '4rem 1.5rem', position: 'relative', zIndex: 1 }}>
          <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '4rem', maxWidth: '1000px' }}>
              {ministry.pillars.map((pillar, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div key={idx} className="grid-cols-2" style={{ 
                    display: 'grid', 
                    gap: '2rem', 
                    alignItems: 'center' 
                  }}>
                    {/* Imagen / Fondo (Cambia de lado según si es par o impar en Desktop) */}
                    <div style={{ 
                      order: isEven ? 1 : 2,
                      width: '100%', 
                      aspectRatio: '16/10',
                      borderRadius: '1rem',
                      overflow: 'hidden',
                      position: 'relative',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)'
                    }}>
                      {pillar.image_url ? (
                        <img src={pillar.image_url} alt={pillar.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.1, color: 'var(--accent-color)' }}>
                          <IconMapper name={pillar.icon} size={100} />
                        </div>
                      )}
                    </div>
                    
                    {/* Texto */}
                    <div style={{ order: isEven ? 2 : 1, padding: '1rem' }}>
                      <h3 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem', color: '#fff', lineHeight: 1.1 }}>
                        {pillar.title}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.7' }}>
                        {pillar.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
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
              <div className="swipe-indicator">
                Desliza para ver más <ArrowRight size={16} />
              </div>
            </div>

            <div className="scroll-container">
              {ministryActivities.map((act) => (
                <div key={act.id} className="glass-card scroll-item" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'rgba(10, 10, 12, 0.6)' }}>
                  
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

                  {/* Cuerpo del post (Híbrido Evento + Instagram) */}
                  <div style={{ padding: '1.25rem' }}>
                    {/* Fecha y Hora prominentes en 12h */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.85rem', textTransform: 'capitalize' }}>
                       <Calendar size={14} /> 
                       <span>
                         {new Date(act.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                       </span>
                       <span>•</span>
                       <span>
                         {(() => {
                           if (!act.time) return '';
                           let [h, m] = act.time.split(':');
                           let ampm = h >= 12 ? 'PM' : 'AM';
                           h = h % 12 || 12;
                           return `${h}:${m} ${ampm}`;
                         })()}
                       </span>
                    </div>

                    {/* Título de la actividad gigante */}
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.2 }}>
                      {act.title}
                    </h3>
                    
                    {/* Descripción */}
                    <p style={{ 
                      fontSize: '0.9rem', 
                      color: 'var(--text-secondary)', 
                      lineHeight: 1.6, 
                      whiteSpace: 'pre-line',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {act.description}
                    </p>
                    
                    {act.description && act.description.length > 100 && (
                      <button 
                        onClick={() => setSelectedActivity(act)}
                        style={{
                          background: 'none', border: 'none', 
                          color: 'var(--accent-color)', fontWeight: 700, 
                          fontSize: '0.85rem', textAlign: 'left', 
                          padding: '0.5rem 0', cursor: 'pointer',
                          display: 'inline-block',
                          marginBottom: '0.5rem'
                        }}
                      >
                        Leer más...
                      </button>
                    )}
                    
                    {/* Footer de la tarjeta con ubicación y likes (Instagram feel) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={14} /> {act.location_url ? <a href={act.location_url} target="_blank" rel="noreferrer" style={{color: 'inherit'}}>{ministry.location}</a> : ministry.location}
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Heart size={18} style={{ color: 'var(--accent-color)', cursor: 'pointer' }} />
                        <MessageSquare size={18} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery moments */}
      <section id="galeria" style={{ padding: '4rem 1.5rem' }}>
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
                <div 
                  key={album.id} 
                  onClick={() => {
                    setSelectedAlbum(album);
                    setLightboxIndex(0);
                  }}
                  className="glass-card" 
                  style={{ padding: '0', overflow: 'hidden', cursor: 'pointer', color: 'inherit', display: 'block' }}
                >
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

      {/* Activity Modal */}
      {selectedActivity && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(5px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            position: 'relative',
            background: 'rgba(20, 20, 24, 0.95)'
          }}>
            <button 
              onClick={() => setSelectedActivity(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                width: '32px', height: '32px',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>&times;</span>
            </button>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', paddingRight: '2rem', color: '#fff' }}>
              {selectedActivity.title}
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--accent-color)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={14} /> 
                {new Date(selectedActivity.date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {selectedActivity.time && (
                  <>
                    <Calendar size={14} />
                    {(() => {
                      let [h, m] = selectedActivity.time.split(':');
                      let ampm = h >= 12 ? 'PM' : 'AM';
                      h = h % 12 || 12;
                      return `${h}:${m} ${ampm}`;
                    })()}
                  </>
                )}
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
              {selectedActivity.description}
            </p>
            
            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedActivity(null)} style={{ padding: '0.6rem 1.5rem' }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Album Lightbox Modal */}
      {selectedAlbum && lightboxIndex !== null && (
        <div
          onClick={() => setSelectedAlbum(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.95)',
            zIndex: 100000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedAlbum(null)}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              color: '#fff',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>

          {selectedAlbum.photos && selectedAlbum.photos.length > 0 ? (
            <>
              {/* Navigation Buttons */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev === 0 ? selectedAlbum.photos.length - 1 : prev - 1));
                }}
                style={{
                  position: 'absolute',
                  left: '1.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  color: '#fff',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev === selectedAlbum.photos.length - 1 ? 0 : prev + 1));
                }}
                style={{
                  position: 'absolute',
                  right: '1.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  color: '#fff',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChevronRight size={24} />
              </button>

              {/* Main Image */}
              <img
                src={selectedAlbum.photos[lightboxIndex]}
                alt={`Lightbox ${lightboxIndex + 1}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: '90%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  borderRadius: '0.25rem',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
                }}
              />

              {/* Caption */}
              <div style={{ marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center' }}>
                <span style={{ fontWeight: 600, color: '#fff', display: 'block', marginBottom: '0.25rem' }}>{selectedAlbum.title}</span>
                Imagen {lightboxIndex + 1} de {selectedAlbum.photos.length}
              </div>
            </>
          ) : (
             <div style={{ color: '#fff', textAlign: 'center' }}>Este álbum no tiene fotos.</div>
          )}
        </div>
      )}

    </div>
  );
}
