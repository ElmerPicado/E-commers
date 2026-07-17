import React, { useContext, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { GalleryContext } from '../context/GalleryContext';
import { ArrowLeft, Calendar, ArrowRight, UserPlus, Image as ImageIcon, Sparkles, Flame, Heart, Shield, Sun, MapPin, Users, BookOpen, Coffee, Smile, Briefcase, Mail, MessageSquare, X, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { PlayfulLayout, SoftLayout } from '../components/ministry/MinistryLayouts';
import { resolveImageUrl } from '../utils/imageUtils';

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

  // Swipe logic states for lightbox
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const handleTouchStart = (e) => setTouchStartX(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEndX(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    if (touchStartX - touchEndX > 50) nextPhoto(new Event('swipe'));
    if (touchStartX - touchEndX < -50) prevPhoto(new Event('swipe'));
    setTouchStartX(0);
    setTouchEndX(0);
  };

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
  const getThemeClass = (min) => {
    if (min.visual_settings?.theme_mode === 'light') {
       return 'theme-light';
    }
    switch (min.id) {
      case 'unanimes': return 'theme-unanimes';
      case 'mujeres': return 'theme-mujeres';
      case 'hombres': return 'theme-hombres';
      case 'ninos': return 'theme-ninos';
      default: return 'theme-imr4'; // default fallback for dynamically created ministries
    }
  };

  const visualSettings = ministry.visual_settings || {};
  const layoutStyle = visualSettings.layout_style || 
                      (ministry.id === 'ninos' ? 'playful' : 
                       ministry.id === 'mujeres' ? 'soft' : 'modern');
  const primaryActionText = visualSettings.primary_action_text || 'Participar';
  const primaryActionUrl = visualSettings.primary_action_url || '#contacto';
  const pillarsLabel = visualSettings.custom_labels?.pillars || 'Pilares del Ministerio';

  // Helper to get RGB from Hex for dynamic neon backgrounds
  const hexToRgb = (hex) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    return `${r}, ${g}, ${b}`;
  };

  // Custom inline theme variable overrides for newly created ministries
  const customThemeVars = {
    '--accent-color': ministry.accent_color,
    '--accent-color-rgb': hexToRgb(ministry.accent_color), 
  };

  if (layoutStyle === 'playful') {
    return <PlayfulLayout ministry={ministry} ministryActivities={ministryActivities} customThemeVars={customThemeVars} getThemeClass={getThemeClass} />;
  }

  if (layoutStyle === 'soft') {
    return <SoftLayout ministry={ministry} ministryActivities={ministryActivities} customThemeVars={customThemeVars} getThemeClass={getThemeClass} />;
  }

  return (
    <div className={getThemeClass(ministry)} style={{ ...customThemeVars, minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      
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
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-base)',
        borderBottom: '1px solid var(--border-color)',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        
        {/* Imagen con bordes desvanecidos (efecto neblina) */}
        {ministry.hero_image && (
          <div style={{ 
            gridArea: 'stack', 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative'
          }}>
            <img 
              src={ministry.hero_image} 
              alt={ministry.name}
              style={{
                width: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                /* Efecto de desvanecido tipo neblina en los bordes */
                WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
                maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)'
              }}
            />
          </div>
        )}

        <div className="container" style={{ 
          width: '90%',
          maxWidth: '800px', 
          paddingTop: '4rem',
          paddingBottom: '2rem',
          zIndex: 3 
        }}>
          <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '1.5rem', border: '1px solid', color: 'var(--accent-color)', borderColor: 'var(--accent-color)', background: 'rgba(255,255,255,0.03)' }}>
            {ministry.logo_url ? (
              <img src={ministry.logo_url} alt={ministry.name} style={{ width: '16px', height: '16px', objectFit: 'contain', borderRadius: '50%' }} />
            ) : (
              <IconMapper name={ministry.icon_name} size={14} />
            )}
            {ministry.name.toUpperCase()}
          </div>
          <h1 className="gradient-text" style={{ fontSize: 'clamp(2.2rem, 8vw, 3.5rem)', fontWeight: 800, marginBottom: '1.5rem', background: `linear-gradient(135deg, #fff 40%, var(--accent-color) 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: '1.1' }}>
            {ministry.hero_title}
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.7' }}>
            {ministry.hero_desc}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href={primaryActionUrl} className="btn btn-primary" style={{ background: 'var(--accent-color)', color: visualSettings.theme_mode === 'light' ? '#fff' : '#000' }}>
              {primaryActionText}
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
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, textTransform: 'uppercase', color: visualSettings.theme_mode === 'light' ? 'var(--text-primary)' : '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
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

      {/* Ministry Description */}
      {ministry.description && (
        <section style={{ padding: '3rem 1.5rem', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--accent-color)', fontWeight: 800 }}>Acerca de {ministry.name}</h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
              {ministry.description}
            </p>
          </div>
        </section>
      )}

      {/* Pillars / Core info (Estilo Alternado Zig-Zag) */}
      {ministry.pillars && ministry.pillars.some(p => p.title?.trim() || p.desc?.trim()) && (
        <section style={{ padding: '4rem 1.5rem', position: 'relative', zIndex: 1 }}>
          <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '4rem', maxWidth: '1000px' }}>
              <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '-1.5rem', color: visualSettings.theme_mode === 'light' ? 'var(--text-primary)' : '#fff' }}>
                {pillarsLabel}
              </h2>
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
                      borderRadius: layoutStyle === 'playful' ? '2rem' : '1rem',
                      overflow: 'hidden',
                      position: 'relative',
                      background: visualSettings.theme_mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
                      border: layoutStyle === 'warm' ? 'none' : '1px solid var(--border-color)',
                      boxShadow: layoutStyle === 'warm' ? '0 10px 30px -10px rgba(0,0,0,0.05)' : 'none'
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
                      <h3 style={{ fontSize: layoutStyle === 'playful' ? '2.5rem' : '2.2rem', fontWeight: 800, marginBottom: '1rem', color: visualSettings.theme_mode === 'light' ? 'var(--text-primary)' : '#fff', lineHeight: 1.1, fontFamily: layoutStyle === 'playful' ? 'var(--font-display)' : 'inherit' }}>
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
                    
                    {act.registration_url && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', border: `1px solid var(--accent-color)40` }}>
                          <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: '#fff', fontWeight: 600 }}>
                            ¡Inscripciones Abiertas!
                          </p>
                          {act.registration_deadline && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                              Cierre: {new Date(act.registration_deadline).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit' })}
                            </p>
                          )}
                          <a href={act.registration_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'block', width: '100%', padding: '0.5rem', fontSize: '0.85rem', textAlign: 'center', background: 'var(--accent-color)', color: '#000', border: 'none' }} onClick={(e) => e.stopPropagation()}>
                            Inscríbete Aquí
                          </a>
                        </div>
                    )}
                    
                    {/* Footer de la tarjeta con ubicación y likes (Instagram feel) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={14} /> {act.location_url ? <a href={act.location_url} target="_blank" rel="noreferrer" style={{color: 'inherit'}}>{ministry.location}</a> : ministry.location}
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <Heart size={18} style={{ color: 'var(--accent-color)', cursor: 'pointer' }} />
                        <MessageSquare size={18} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
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
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '0.25rem' }}
                          title="Compartir"
                        >
                          <Share2 size={18} style={{ color: 'var(--text-secondary)' }} />
                        </button>
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
            <div className="scroll-container">
              {ministryAlbums.slice(0, 3).map((album) => (
                <div 
                  key={album.id} 
                  className="scroll-item"
                  onClick={() => {
                    setSelectedAlbum(album);
                    setLightboxIndex(0);
                  }}
                  style={{ 
                    cursor: 'pointer', 
                    borderRadius: '1rem', 
                    overflow: 'hidden', 
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-surface)',
                    transition: 'transform 0.2s',
                    minWidth: '280px',
                    flex: '0 0 auto'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ height: '240px', width: '100%', overflow: 'hidden', position: 'relative', background: '#000' }}>
                    {album.photos && album.photos.length > 0 ? (
                      <img
                        src={resolveImageUrl(album.photos[0])}
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
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.85rem', textTransform: 'capitalize' }}>
                       <Calendar size={14} /> 
                       <span>{album.date}</span>
                    </div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.2, color: 'var(--text-primary)' }}>
                      {album.title}
                    </h3>
                    
                    {album.description && (
                      <p style={{ 
                        fontSize: '0.9rem', 
                        color: 'var(--text-secondary)', 
                        lineHeight: 1.6, 
                        whiteSpace: 'pre-line',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        margin: '0 0 0.5rem 0'
                      }}>
                        {album.description}
                      </p>
                    )}
                    <span style={{ color: 'var(--accent-color)', fontWeight: 700, fontSize: '0.85rem', display: 'inline-block', marginTop: 'auto' }}>
                      Leer más...
                    </span>
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
                  color: visualSettings.theme_mode === 'light' ? '#fff' : '#000',
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
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 100000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
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
                onClick={prevPhoto}
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
                onClick={nextPhoto}
                style={{
                  position: 'absolute',
                  right: '1.5rem',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  width: '48px', height: '48px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <ChevronRight size={24} />
              </button>

              {/* Main Image */}
              <img
                key={lightboxIndex}
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


