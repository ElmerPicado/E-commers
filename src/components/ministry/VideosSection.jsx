import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Play, Video as YoutubeIcon, Music, ChevronRight } from 'lucide-react';
import { GalleryContext } from '../../context/GalleryContext';

const VideosSection = ({ standalone = false }) => {
  const { ministries } = useContext(GalleryContext);
  const ninosMinistry = ministries.find(m => m.id === 'ninos');
  const funZone = ninosMinistry?.fun_zone || {};
  const videosData = funZone.videos || {};
  
  const enabled = videosData.enabled;
  const youtubeUrl = videosData.youtube_url;
  const title = videosData.title || 'Videos y Canciones';

  const videos = useMemo(() => {
    if (!enabled || !youtubeUrl) {
      return [{
        id: 'coming-soon',
        title,
        description: 'Las maestras están preparando una lista de videos y canciones especiales para ti. ¡Vuelve pronto!',
        youtubeUrl: null,
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: 'Próximamente',
        disabled: true
      }];
    }

    const urls = youtubeUrl.split(',').map(u => u.trim()).filter(Boolean);

    if (urls.length === 0) {
      return [{
        id: 'coming-soon',
        title,
        description: 'No hay videos configurados aún. El administrador puede agregar enlaces de YouTube en el panel de control.',
        youtubeUrl: null,
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: 'Próximamente',
        disabled: true
      }];
    }

    return urls.map((url, idx) => {
      const videoId = extractVideoId(url);
      return {
        id: `video-${idx}`,
        title: `Video ${idx + 1}`,
        description: 'Haz clic para ver en pantalla completa',
        youtubeUrl: url,
        thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : 'https://via.placeholder.com/480x270/87CEEB/FFF?text=Video',
        duration: 'Ver video',
        disabled: false
      };
    });
  }, [enabled, youtubeUrl, title]);

  function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  if (standalone) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 40%, #90EE90 100%)',
        padding: '2rem 1rem',
        fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '4rem', animation: 'float 3s ease-in-out infinite' }}>🎬</div>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
              fontWeight: 900,
              color: '#FF4500',
              textShadow: '2px 2px 0 #fff, 4px 4px 0 rgba(255,69,0,0.1)',
              margin: '1rem 0 0.5rem 0',
              fontFamily: '"Comic Sans MS", "Bubblegum Sans", cursive'
            }}>
              Videos y Canciones
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#555', fontWeight: 700 }}>
              Canta, aprende y diviértete con nuestros videos especiales
            </p>
            <style>{`
              @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-15px); }
              }
            `}</style>
          </header>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {videos.map((video) => (
              <article
                key={video.id}
                style={{
                  background: video.disabled ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.95)',
                  borderRadius: '2rem',
                  border: `4px solid ${video.disabled ? '#DDD' : '#FF4500'}`,
                  boxShadow: video.disabled
                    ? '0 8px 20px rgba(0,0,0,0.08)'
                    : '0 12px 30px rgba(255,69,0,0.2), 0 0 0 4px rgba(255,255,255,0.5) inset',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  opacity: video.disabled ? 0.7 : 1,
                  cursor: video.disabled ? 'not-allowed' : 'pointer',
                  position: 'relative'
                }}
                onMouseEnter={e => {
                  if (!video.disabled) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(255,69,0,0.3), 0 0 0 4px rgba(255,255,255,0.5) inset';
                  }
                }}
                onMouseLeave={e => {
                  if (!video.disabled) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(255,69,0,0.2), 0 0 0 4px rgba(255,255,255,0.5) inset';
                  }
                }}
              >
                <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                      filter: video.disabled ? 'grayscale(0.5) brightness(0.8)' : 'none'
                    }}
                    onError={e => {
                      e.currentTarget.src = 'https://via.placeholder.com/480x270/87CEEB/FFF?text=Video';
                    }}
                  />
                  {!video.disabled && (
                    <Link
                      to={`/ninos/videos/${video.id}`}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.3)',
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                    >
                      <div style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: '#FF4500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(255,69,0,0.5)',
                        transform: 'scale(0.9)',
                        transition: 'transform 0.2s ease'
                      }}>
                        <Play size={28} color="#fff" style={{ marginLeft: '4px' }} />
                      </div>
                    </Link>
                  )}
                  {video.disabled && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 900,
                      fontSize: '1rem'
                    }}>
                      <Music size={24} style={{ marginRight: '0.5rem' }} /> Próximamente
                    </div>
                  )}
                </div>

                <div style={{
                  padding: '1.25rem',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    color: video.disabled ? '#999' : '#333',
                    margin: '0 0 0.5rem 0',
                    lineHeight: 1.3
                  }}>
                    {video.title}
                  </h3>
                  <p style={{
                    fontSize: '0.85rem',
                    color: video.disabled ? '#999' : '#666',
                    lineHeight: 1.4,
                    margin: '0 0 1rem 0',
                    flex: 1
                  }}>
                    {video.description}
                  </p>
                  {!video.disabled && video.youtubeUrl && (
                    <Link
                      to={`/ninos/videos/${video.id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 1.2rem',
                        background: 'linear-gradient(135deg, #FF4500, #FF6347)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '999px',
                        fontSize: '0.9rem',
                        fontWeight: 900,
                        textDecoration: 'none',
                        boxShadow: '0 4px 0 #8B0000',
                        transform: 'translateY(-2px)',
                        transition: 'all 0.1s ease',
                        alignSelf: 'flex-start'
                      }}
                      onMouseDown={e => {
                        e.currentTarget.style.transform = 'translateY(0px)';
                        e.currentTarget.style.boxShadow = '0 1px 0 #8B0000';
                      }}
                      onMouseUp={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 0 #8B0000';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 0 #8B0000';
                      }}
                    >
                      <Play size={16} /> Ver video
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>

          {!standalone && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link
                to="/ninos/videos"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 2rem',
                  background: 'linear-gradient(135deg, #FF4500, #FF6347)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '999px',
                  fontSize: '1rem',
                  fontWeight: 900,
                  textDecoration: 'none',
                  boxShadow: '0 4px 0 #8B0000',
                  transform: 'translateY(-2px)'
                }}
              >
                Ver todos los videos <ChevronRight size={20} />
              </Link>
            </div>
          )}

          {standalone && (
            <div style={{ textAlign: 'center', marginTop: '3rem', padding: '0 1rem' }}>
              <Link
                to="/ministerio/ninos"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem 2.5rem',
                  background: '#FF6347',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '999px',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                  textDecoration: 'none',
                  boxShadow: '0 6px 0 #b83214',
                  transform: 'translateY(-3px)',
                  transition: 'all 0.1s ease'
                }}
                onMouseDown={e => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 2px 0 #b83214';
                }}
                onMouseUp={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 6px 0 #b83214';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 6px 0 #b83214';
                }}
              >
                <YoutubeIcon size={24} /> Volver al Ministerio
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <section id="videos" style={{ width: '100%', maxWidth: '1000px', margin: '2rem auto 0', padding: '0 1rem' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #FF4500, #FF6347, #FF8C00)',
          borderRadius: '2.5rem',
          padding: '2rem 1.5rem',
          border: '5px solid #FFD700',
          boxShadow: '0 15px 30px rgba(255,69,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <YoutubeIcon size={50} color="#FFD700" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }} />
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFD700', margin: 0, textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
            ¡Videos y Canciones!
          </h2>
          <Music size={50} color="#FFD700" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }} />
        </div>
        <p style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, margin: 0, textAlign: 'center', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
          Canta, aprende y diviértete con nuestros videos especiales para niños
        </p>
        <Link
          to="/ninos/videos"
          style={{
            background: '#FFD700',
            color: '#8B4500',
            padding: '0.6rem 2.5rem',
            borderRadius: '999px',
            fontSize: '1.1rem',
            fontWeight: 900,
            boxShadow: '0 5px 0 #b89b00',
            transform: 'translateY(-2px)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.1s ease'
          }}
          onMouseDown={e => {
            e.currentTarget.style.transform = 'translateY(0px)';
            e.currentTarget.style.boxShadow = '0 2px 0 #b89b00';
          }}
          onMouseUp={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 5px 0 #b89b00';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 5px 0 #b89b00';
          }}
        >
          Ver videos <ChevronRight size={20} />
        </Link>
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    </section>
  );
};

export default VideosSection;