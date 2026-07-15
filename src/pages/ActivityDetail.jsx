import React, { useContext, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GalleryContext } from '../context/GalleryContext';
import { Calendar, Clock, MapPin, ArrowLeft, Heart, MessageSquare, Share2 } from 'lucide-react';
import MinistryIcon from '../components/MinistryIcon';

export default function ActivityDetail() {
  const { id } = useParams();
  const { activities, ministries } = useContext(GalleryContext);

  const act = activities.find(a => a.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!act) {
    return (
      <div className="theme-imr4" style={{ minHeight: '100vh', padding: '10rem 2rem', textAlign: 'center' }}>
        <h2 style={{ color: '#fff' }}>Actividad no encontrada</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Volver al Inicio</Link>
      </div>
    );
  }

  const organizingMinistry = ministries.find(m => m.id === act.ministry_id);
  const accentColor = organizingMinistry ? organizingMinistry.accent_color : 'var(--accent-color)';
  const dateObj = new Date(act.date + 'T00:00:00');

  const formatTime12h = (time) => {
    if (!time) return '';
    let [h, m] = time.split(':');
    let ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  return (
    <div className="theme-imr4" style={{ minHeight: '100vh', padding: '8rem 1.5rem', background: 'var(--bg-base)' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '2rem', textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Volver al Inicio
        </Link>

        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', background: 'var(--bg-surface)' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {organizingMinistry?.logo_url ? (
                <img src={organizingMinistry.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <MinistryIcon name={organizingMinistry?.icon_name || 'Sparkles'} color={accentColor} />
              )}
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                {organizingMinistry ? organizingMinistry.name : 'Evento General IMR4'}
              </span>
              <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {organizingMinistry?.location || 'Iglesia IMR4'}
              </span>
            </div>
          </div>

          {/* Imagen */}
          {act.image_url ? (
            <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', position: 'relative' }}>
              <img src={act.image_url} alt={act.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div style={{ width: '100%', aspectRatio: '21/9', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border-color)' }}>
              <Calendar size={64} style={{ opacity: 0.1, color: accentColor }} />
            </div>
          )}

          {/* Cuerpo */}
          <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
              <Heart size={24} style={{ color: 'var(--accent-color)' }} />
              <MessageSquare size={24} style={{ color: 'var(--text-muted)' }} />
              <div style={{ flex: 1 }}></div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('¡Enlace copiado al portapapeles!');
                }}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                title="Copiar Enlace"
              >
                <Share2 size={16} /> Compartir
              </button>
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '1rem' }}>
              {act.title}
            </h1>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: accentColor, fontWeight: 700 }}>
                <Calendar size={20} /> 
                {dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: accentColor, fontWeight: 700 }}>
                <Clock size={20} />
                {formatTime12h(act.time)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                <MapPin size={20} />
                {act.location_url ? <a href={act.location_url} target="_blank" rel="noreferrer" style={{color: 'inherit'}}>{organizingMinistry?.location || 'Ver Mapa'}</a> : (organizingMinistry?.location || 'Río Cuarto')}
              </div>
            </div>

            <div style={{ 
              fontSize: '1.1rem', 
              color: 'var(--text-secondary)', 
              lineHeight: '1.8',
              whiteSpace: 'pre-line',
              marginBottom: '3rem'
            }}>
              {act.description}
            </div>

            {act.registration_url && (
              <div style={{ marginTop: '2rem', padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: `2px solid ${accentColor}40`, textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#fff', fontWeight: 800 }}>
                  ¡Inscripciones Abiertas!
                </h3>
                {act.registration_deadline && (
                  <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Fecha límite: <strong>{new Date(act.registration_deadline).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit' })}</strong>
                  </p>
                )}
                <a href={act.registration_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-block', padding: '1rem 3rem', fontSize: '1.1rem', background: accentColor, color: '#000', border: 'none', borderRadius: '50px', fontWeight: 700 }}>
                  Inscríbete Aquí
                </a>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
