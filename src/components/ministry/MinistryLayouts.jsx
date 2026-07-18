import React, { useState } from 'react';
import { Calendar, MapPin, Heart, MessageSquare, Play, Gamepad2, Puzzle, X } from 'lucide-react';
import PuzzleGame from './PuzzleGame';

export const PlayfulLayout = ({ ministry, ministryActivities, customThemeVars, getThemeClass }) => {
  const [showPuzzle, setShowPuzzle] = useState(false);
  const funZone = ministry.fun_zone || {};
  const puzzleData = funZone.puzzle || {};
  const videosData = funZone.videos || {};
  const hasFunZone = (puzzleData.enabled && puzzleData.image_url) || (videosData.enabled && videosData.youtube_url);

  return (
    <div className={getThemeClass(ministry)} style={{ ...customThemeVars, minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}>
      
      {/* Playful Animated Sky / Grass Background OR Custom Image */}
      {ministry.hero_image ? (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '75vh', backgroundImage: `url("${ministry.hero_image}")`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, #90EE90 100%)' }}></div>
        </div>
      ) : (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60vh', background: 'linear-gradient(to bottom, #87CEEB, #E0F6FF)', zIndex: 0 }}>
            {/* Clouds */}
            <div style={{ position: 'absolute', top: '10%', left: '10%', width: '120px', height: '40px', background: '#fff', borderRadius: '50px', opacity: 0.8, filter: 'blur(2px)' }}></div>
            <div style={{ position: 'absolute', top: '20%', right: '15%', width: '160px', height: '50px', background: '#fff', borderRadius: '50px', opacity: 0.9, filter: 'blur(2px)' }}></div>
          </div>
          <div style={{ position: 'absolute', top: '55vh', left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, #90EE90, #32CD32)', zIndex: 0 }}></div>
        </>
      )}

      {/* Content wrapper */}
      <div style={{ position: 'relative', zIndex: 1, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem', minHeight: '75vh', justifyContent: 'flex-end', paddingBottom: '10vh' }}>
        
        {/* Hero */}
        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.85)', padding: '2rem', borderRadius: '3rem', border: '4px dashed var(--accent-color)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxWidth: '800px', width: '100%', marginTop: '2rem' }}>
          {ministry.logo_url && (
            <img src={ministry.logo_url} alt="Logo" style={{ width: '150px', height: '150px', objectFit: 'contain', marginBottom: '1rem', filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.2))' }} />
          )}
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--accent-color)', textShadow: '2px 2px 0px #fff, 4px 4px 0px rgba(0,0,0,0.1)', lineHeight: 1.1, marginBottom: '1rem' }}>
            {ministry.hero_title || `¡Bienvenidos a ${ministry.name}!`}
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '2rem' }}>
            {ministry.hero_desc}
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={ministry.visual_settings?.primary_action_url || "#"} className="btn" style={{ background: 'var(--accent-color)', color: '#fff', fontSize: '1.2rem', padding: '1rem 2rem', borderRadius: '999px', border: 'none', boxShadow: '0 8px 0px rgba(0,0,0,0.2)', transform: 'translateY(-4px)', transition: 'all 0.1s', fontWeight: 900 }}>
              {ministry.visual_settings?.primary_action_text || "¡Quiero Participar!"}
            </a>
            <a href="#juegos" className="btn" style={{ background: '#3b82f6', color: '#fff', fontSize: '1.2rem', padding: '1rem 2rem', borderRadius: '999px', border: 'none', boxShadow: '0 8px 0px rgba(0,0,0,0.2)', transform: 'translateY(-4px)', transition: 'all 0.1s', fontWeight: 900 }}>
              ¡A Jugar! <Gamepad2 size={24} style={{ display: 'inline', marginLeft: '10px' }} />
            </a>
          </div>
        </div>

        {/* Schedule & Location Box */}
        {(ministry.schedule || ministry.location) && (
           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', width: '100%', maxWidth: '900px' }}>
              <div style={{ flex: '1 1 300px', background: '#FFD700', padding: '1.5rem', borderRadius: '2rem', border: '4px solid #FFA500', textAlign: 'center', boxShadow: '0 8px 15px rgba(0,0,0,0.1)', transform: 'rotate(-2deg)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#B8860B', marginBottom: '0.5rem' }}>¿Cuándo nos vemos?</h3>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#000' }}>{ministry.schedule}</p>
              </div>
              <div style={{ flex: '1 1 300px', background: '#FF69B4', padding: '1.5rem', borderRadius: '2rem', border: '4px solid #C71585', textAlign: 'center', boxShadow: '0 8px 15px rgba(0,0,0,0.1)', transform: 'rotate(2deg)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#8B008B', marginBottom: '0.5rem' }}>¿Dónde estamos?</h3>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{ministry.location}</p>
              </div>
           </div>
        )}

        {/* Zona de Diversión - Dynamic */}
        {hasFunZone && (
          <section id="juegos" style={{ width: '100%', maxWidth: '1000px', marginTop: '2rem' }}>
            <h2 style={{ fontSize: '3rem', textAlign: 'center', color: '#fff', textShadow: '2px 2px 0px #000', marginBottom: '2rem' }}>¡Zona de Diversión!</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              {/* Puzzle Card */}
              {puzzleData.enabled && (
                <div style={{ background: '#fff', borderRadius: '2rem', overflow: 'hidden', border: '4px solid #8A2BE2', boxShadow: '0 10px 20px rgba(0,0,0,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }}
                     onClick={() => setShowPuzzle(true)}
                     onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                     onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                   <div style={{ height: '150px', background: puzzleData.image_url ? `url(${puzzleData.image_url}) center/cover` : '#9370DB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     {!puzzleData.image_url && <Puzzle size={80} color="#fff" />}
                   </div>
                   <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                     <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4B0082', marginBottom: '1rem' }}>{puzzleData.title || 'Rompecabezas Bíblico'}</h3>
                     <button className="btn" style={{ background: '#8A2BE2', color: '#fff', borderRadius: '999px', padding: '0.5rem 1.5rem', fontWeight: 700 }}>Jugar ahora</button>
                   </div>
                </div>
              )}
              {/* Videos Card */}
              {videosData.enabled && videosData.youtube_url && (
                <a href={videosData.youtube_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#fff', borderRadius: '2rem', overflow: 'hidden', border: '4px solid #FF4500', boxShadow: '0 10px 20px rgba(0,0,0,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }}
                       onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                       onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                     <div style={{ height: '150px', background: '#FF6347', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Play size={80} color="#fff" />
                     </div>
                     <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                       <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8B0000', marginBottom: '1rem' }}>{videosData.title || 'Videos y Canciones'}</h3>
                       <span className="btn" style={{ background: '#FF4500', color: '#fff', borderRadius: '999px', padding: '0.5rem 1.5rem', fontWeight: 700, display: 'inline-block' }}>{videosData.button_text || 'Ver ahora'}</span>
                     </div>
                  </div>
                </a>
              )}
            </div>
          </section>
        )}

        {/* Puzzle Modal */}
        {showPuzzle && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
               onClick={(e) => { if (e.target === e.currentTarget) setShowPuzzle(false); }}
          >
            <div style={{ background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)', borderRadius: '2rem', padding: '1.5rem', maxWidth: '500px', width: '95%', maxHeight: '95vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '4px solid #4CAF50' }}>
              <button
                onClick={() => setShowPuzzle(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#ef4444', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', zIndex: 2, boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}
              >
                <X size={18} />
              </button>
              <PuzzleGame 
                imageUrl={puzzleData.image_url} 
                difficulty={puzzleData.difficulty || '3x3'} 
                title={puzzleData.title || 'Rompecabezas Bíblico'}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export const SoftLayout = ({ ministry, ministryActivities, customThemeVars, getThemeClass }) => {
  return (
    <div className={getThemeClass(ministry)} style={{ ...customThemeVars, minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', fontFamily: '"Georgia", serif', background: 'var(--bg-base)' }}>
      
      {/* Hero Section */}
      <div style={{ position: 'relative', width: '100%', height: '500px', overflow: 'hidden' }}>
        {ministry.hero_image ? (
          <>
            {/* Foto de fondo sin overlay pesado */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url("${ministry.hero_image}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              zIndex: 0
            }} />
            {/* Degradado sutil solo en la parte inferior para legibilidad del texto */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.55) 100%)',
              zIndex: 1
            }} />
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, var(--border-color), transparent)', opacity: 0.5, zIndex: 0 }} />
        )}
        
        {/* Logo del ministerio flotando en la esquina inferior izquierda */}
        {ministry.logo_url && (
          <div style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '1.5rem',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(8px)',
            borderRadius: '999px',
            padding: '0.5rem 1.2rem 0.5rem 0.5rem',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <img
              src={ministry.logo_url}
              alt={ministry.name}
              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.4)' }}
            />
            <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.03em', fontFamily: 'var(--font-body)' }}>
              {ministry.name}
            </span>
          </div>
        )}

        {/* Header Text Overlay */}
        <div style={{ position: 'absolute', bottom: '5%', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 2 }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', width: '100%', padding: '0 1.5rem' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 400, color: '#fff', marginBottom: '1rem', fontStyle: 'italic', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
              {ministry.hero_title || ministry.name}
            </h1>
            <div style={{ width: '50px', height: '2px', background: 'var(--accent-color)', margin: '0 auto 1.5rem auto' }}></div>
            <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.88)', lineHeight: '1.8', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
              {ministry.hero_desc}
            </p>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', top: '50%', right: '-10%', width: '300px', height: '300px', background: 'var(--accent-color)', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.1, zIndex: 0 }}></div>

      {/* Content wrapper */}
      <div style={{ position: 'relative', zIndex: 1, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Message / Contact Focus */}
        <div style={{ background: 'var(--bg-surface)', padding: '3rem', borderRadius: '1rem', boxShadow: '0 20px 40px rgba(0,0,0,0.03)', maxWidth: '800px', width: '100%', textAlign: 'center', border: '1px solid var(--border-color)' }}>
          <Heart size={40} style={{ color: 'var(--accent-color)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>No estás sola</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.7' }}>
            Sabemos que la vida tiene sus retos. Si necesitas oración, consejería o simplemente alguien que te escuche, estamos aquí para ti.
          </p>
          <a href={ministry.visual_settings?.primary_action_url || "#contacto"} className="btn" style={{ background: 'var(--accent-color)', color: '#fff', fontSize: '1.1rem', padding: '0.8rem 2.5rem', borderRadius: '0.5rem', border: 'none', transition: 'all 0.2s', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={20} /> Escríbenos un mensaje
          </a>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1000px', marginTop: '4rem' }}>
          
          {(ministry.schedule) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem', borderRight: '1px solid var(--border-color)' }}>
              <Calendar size={32} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Nuestras Reuniones</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{ministry.schedule}</p>
            </div>
          )}

          {(ministry.location) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
              <MapPin size={32} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Ubicación</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{ministry.location}</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
