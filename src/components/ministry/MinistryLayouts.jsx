import React, { useState } from 'react';
import { Calendar, MapPin, Heart, MessageSquare, Play, Gamepad2, Puzzle, X, Video as YoutubeIcon, Music } from 'lucide-react';
import VideosSection from './VideosSection';

export const PlayfulLayout = ({ 
  ministry, 
  ministryActivities, 
  ministryAlbums,
  customThemeVars, 
  getThemeClass,
  setSelectedActivity,
  setSelectedAlbum,
  setLightboxIndex
}) => {
  const funZone = ministry.fun_zone || {};
  const puzzleData = funZone.puzzle || {};
  const videosData = funZone.videos || {};
  const hasFunZone = (puzzleData.enabled && (puzzleData.image_url || (puzzleData.levels && puzzleData.levels.length > 0))) || (videosData.enabled && videosData.youtube_url);

  return (
    <div className={getThemeClass(ministry)} style={{ ...customThemeVars, minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}>
      
      {/* Playful Animated Sky / Grass Background */}
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
        
        {/* REGULAR DOMINICAL HOME SCREEN */}
        <>
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
              <a href="/ninos/juegos" className="btn" style={{ background: '#3b82f6', color: '#fff', fontSize: '1.2rem', padding: '1rem 2rem', borderRadius: '999px', border: 'none', boxShadow: '0 8px 0px rgba(0,0,0,0.2)', transform: 'translateY(-4px)', transition: 'all 0.1s', fontWeight: 900, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
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

          {/* Fun Zone Banner - Always visible */}
          <section id="juegos" style={{ width: '100%', maxWidth: '1000px', marginTop: '2rem' }}>
            <a
              href="/ninos/juegos"
              style={{ 
                background: 'linear-gradient(135deg, #8A2BE2, #FF1493, #FF4500)', 
                borderRadius: '2.5rem', 
                padding: '2.5rem 2rem', 
                cursor: 'pointer', 
                border: '5px solid #FFD700', 
                boxShadow: '0 15px 30px rgba(138, 43, 226, 0.3)', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '1rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
                position: 'relative',
                overflow: 'hidden',
                textDecoration: 'none',
                color: 'inherit'
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(138, 43, 226, 0.4)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(138, 43, 226, 0.3)'; }}
            >
              {/* Decorative floating emojis */}
              <div style={{ position: 'absolute', top: '10px', left: '20px', fontSize: '2rem', opacity: 0.4, animation: 'float 3s ease-in-out infinite' }}>🧩</div>
              <div style={{ position: 'absolute', top: '15px', right: '25px', fontSize: '2rem', opacity: 0.4, animation: 'float 3s ease-in-out infinite 0.5s' }}>🎬</div>
              <div style={{ position: 'absolute', bottom: '10px', left: '30%', fontSize: '2rem', opacity: 0.3, animation: 'float 3s ease-in-out infinite 1s' }}>⭐</div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Gamepad2 size={50} color="#FFD700" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }} />
                <h2 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#FFD700', margin: 0, textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
                  ¡Zona de Juegos!
                </h2>
                <Gamepad2 size={50} color="#FFD700" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }} />
              </div>
              <p style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 700, margin: 0, textAlign: 'center', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                Rompecabezas Bíblicos, Videos, Canciones y ¡Mucho Más!
              </p>
              <div style={{ background: '#FFD700', color: '#8B4500', padding: '0.6rem 2.5rem', borderRadius: '999px', fontSize: '1.2rem', fontWeight: 900, boxShadow: '0 5px 0 #b89b00', transform: 'translateY(-2px)' }}>
                ENTRAR A JUGAR 🚀
              </div>
              <style>{`
                @keyframes float {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-10px); }
                }
              `}</style>
            </a>
          </section>

          {/* Videos Section */}
          <section id="videos" style={{ width: '100%', maxWidth: '1000px', marginTop: '1rem' }}>
            <VideosSection ministry={ministry} />
          </section>

          {/* Activities Section - Playful Style */}
          {ministryActivities && ministryActivities.length > 0 && (
            <section style={{ padding: '3rem 1.5rem', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FF1493', textAlign: 'center', marginBottom: '2rem', textShadow: '2px 2px 0px #FFF, 4px 4px 0px rgba(0,0,0,0.1)', fontFamily: '"Comic Sans MS", "Bubblegum Sans", cursive' }}>
                🌟 ¡Nuestras Actividades! 🌟
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
                {ministryActivities.map((act) => (
                  <div key={act.id} onClick={() => setSelectedActivity(act)} style={{ width: '100%', maxWidth: '320px', background: '#FFF', borderRadius: '2rem', overflow: 'hidden', border: '4px solid #32CD32', boxShadow: '0 10px 20px rgba(0,0,0,0.15)', cursor: 'pointer', transition: 'transform 0.2s', transform: 'scale(1)', ':hover': { transform: 'scale(1.05)' } }}>
                    {act.image_url ? (
                      <div style={{ height: '200px', width: '100%', background: '#f0f0f0' }}>
                        <img src={act.image_url} alt={act.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div style={{ height: '150px', background: '#32CD32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={60} color="#fff" />
                      </div>
                    )}
                    <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                      <div style={{ background: '#FFD700', color: '#8B4500', display: 'inline-block', padding: '0.25rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 800, marginBottom: '1rem', border: '2px solid #DAA520' }}>
                        {new Date(act.date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </div>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#228B22', marginBottom: '0.5rem', lineHeight: 1.2 }}>{act.title}</h3>
                      <p style={{ color: '#666', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Gallery Section - Playful Style */}
          {ministryAlbums && ministryAlbums.length > 0 && (
            <section style={{ padding: '3rem 1.5rem', width: '100%', maxWidth: '1000px', margin: '0 auto', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.5))', borderRadius: '3rem' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1E90FF', textAlign: 'center', marginBottom: '2rem', textShadow: '2px 2px 0px #FFF, 4px 4px 0px rgba(0,0,0,0.1)', fontFamily: '"Comic Sans MS", "Bubblegum Sans", cursive' }}>
                📸 ¡Nuestros Recuerdos! 📸
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
                {ministryAlbums.map((album) => (
                  <div key={album.id} style={{ width: '100%', maxWidth: '300px', background: '#FFF', borderRadius: '2rem', padding: '1rem', border: '4px solid #1E90FF', boxShadow: '0 10px 20px rgba(0,0,0,0.15)', transform: `rotate(${Math.random() * 6 - 3}deg)` }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0000CD', textAlign: 'center', marginBottom: '1rem' }}>{album.title}</h3>
                    {album.photos && album.photos.length > 0 ? (
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '1', borderRadius: '1rem', overflow: 'hidden', cursor: 'pointer', border: '2px solid #87CEEB' }} onClick={() => { setSelectedAlbum(album); setLightboxIndex(0); }}>
                        <img src={album.photos[0]} alt={album.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(30, 144, 255, 0.8)', color: '#fff', textAlign: 'center', padding: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
                          Ver {album.photos.length} fotos
                        </div>
                      </div>
                    ) : (
                         <div style={{ width: '100%', aspectRatio: '1', background: '#F0F8FF', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E90FF', fontWeight: 700 }}>
                           Sin fotos aún
                         </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
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
