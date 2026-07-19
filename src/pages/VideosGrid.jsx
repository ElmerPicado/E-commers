import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GalleryContext } from '../context/GalleryContext';
import { Video as YoutubeIcon, Play, Music, Heart, Sparkles, ChevronRight } from 'lucide-react';

const VideosGrid = () => {
  const { ministries } = useContext(GalleryContext);
  const ninosMinistry = ministries.find(m => m.id === 'ninos');
  const funZone = ninosMinistry?.fun_zone || {};
  const videosData = funZone.videos || {};
  const youtubeUrl = videosData.youtube_url || '';

  const videoList = useMemo(() => {
    if (!youtubeUrl) {
      return [{
        id: 'coming-soon',
        title: videosData.title || 'Videos y Canciones',
        description: 'Las maestras están preparando una lista de videos especiales. ¡Vuelve pronto!',
        thumbnail: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&h=225&fit=crop',
        url: null,
        comingSoon: true
      }];
    }

    const videos = [];
    try {
      const url = new URL(youtubeUrl);
      if (url.hostname.includes('youtube.com') && url.pathname.includes('playlist')) {
        const playlistId = url.searchParams.get('list');
        for (let i = 1; i <= 6; i++) {
          videos.push({
            id: `playlist-${i}`,
            title: `Video ${i} de la lista`,
            description: 'Canción o historia bíblica para niños',
            thumbnail: `https://img.youtube.com/vi/placeholder${i}/maxresdefault.jpg`,
            url: `https://www.youtube.com/embed/videoseries?list=${playlistId}&index=${i}`,
            playlistId
          });
        }
      } else if (url.hostname.includes('youtu.be') || url.pathname.includes('/watch') || url.pathname.includes('/embed')) {
        const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
        videos.push({
          id: videoId,
          title: 'Video Principal',
          description: 'Video destacado del canal',
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          url: `https://www.youtube.com/embed/${videoId}`,
          videoId
        });
      } else if (url.hostname.includes('youtube.com') && url.pathname.includes('/channel') || url.pathname.includes('/c/') || url.pathname.includes('/@')) {
        for (let i = 1; i <= 6; i++) {
          videos.push({
            id: `channel-${i}`,
            title: `Video ${i}`,
            description: 'Contenido del canal de YouTube',
            thumbnail: `https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop&sat=-100`,
            url: youtubeUrl,
            channelUrl: youtubeUrl
          });
        }
      }
    } catch (e) {
      console.warn('Invalid YouTube URL:', youtubeUrl);
    }

    return videos.length > 0 ? videos : [{
      id: 'invalid-url',
      title: videosData.title || 'Videos y Canciones',
      description: 'El enlace de YouTube no es válido. Verifica la configuración en el panel de administración.',
      thumbnail: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&h=225&fit=crop',
      url: null,
      error: true
    }];
  }, [youtubeUrl, videosData.title]);

  const extractVideoId = (url) => {
    if (!url) return null;
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
      if (u.pathname.includes('/embed/')) return u.pathname.split('/embed/')[1].split('?')[0];
      return u.searchParams.get('v');
    } catch {
      return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 40%, #90EE90 100%)',
      padding: '2rem 1rem',
      fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif'
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <header style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: '-2rem', left: '50%', transform: 'translateX(-50%)',
            fontSize: '4rem', animation: 'float 3s ease-in-out infinite'
          }}>🎬</div>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
            fontWeight: 900,
            color: '#FF4500',
            textShadow: '2px 2px 0 #fff, 4px 4px 0 rgba(255,69,0,0.1)',
            margin: '1.5rem 0 0.5rem 0',
            fontFamily: '"Comic Sans MS", "Bubblegum Sans", cursive'
          }}>
            Videos y Canciones
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#555', fontWeight: 700, margin: 0 }}>
            Canta, aprende y diviértete con contenido seguro para niños
          </p>
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateX(-50%) translateY(0); }
              50% { transform: translateX(-50%) translateY(-15px); }
            }
          `}</style>
        </header>

        {videoList.some(v => v.comingSoon || v.error) && (
          <div style={{
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '2rem',
            border: '4px dashed #FF4500',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '2rem',
            boxShadow: '0 8px 25px rgba(255,69,0,0.15)'
          }}>
            <YoutubeIcon size={48} color="#FF4500" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#8B0000', margin: '0 0 0.5rem 0' }}>
              {videoList[0].comingSoon ? '¡Próximamente!' : 'Configuración necesaria'}
            </h3>
            <p style={{ color: '#666', fontSize: '1rem', margin: '0 0 1rem 0', fontWeight: 600 }}>
              {videoList[0].description}
            </p>
            {videoList[0].error && (
              <p style={{ color: '#FF4500', fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>
                ⚠️ El administrador debe configurar una URL válida de YouTube en la Zona de Diversión.
              </p>
            )}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {videoList.map((video, idx) => {
            const videoId = extractVideoId(video.url);
            const thumbnail = videoId
              ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
              : video.thumbnail;

            const isComingSoon = video.comingSoon || video.error || !video.url;
            const isPlaylist = video.playlistId;
            const isChannel = video.channelUrl;

            return (
              <article
                key={video.id}
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: '2rem',
                  border: `4px solid ${isComingSoon ? '#DDD' : '#FF4500'}`,
                  boxShadow: isComingSoon
                    ? '0 8px 20px rgba(0,0,0,0.08)'
                    : '0 12px 30px rgba(255,69,0,0.2), 0 0 0 4px rgba(255,255,255,0.5) inset',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  opacity: isComingSoon ? 0.7 : 1,
                  cursor: isComingSoon ? 'not-allowed' : 'pointer',
                  position: 'relative',
                  transform: `rotate(${Math.random() * 4 - 2}deg)`
                }}
                onMouseEnter={e => {
                  if (!isComingSoon) {
                    e.currentTarget.style.transform = `rotate(${Math.random() * 4 - 2}deg) scale(1.02)`;
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(255,69,0,0.3), 0 0 0 4px rgba(255,255,255,0.5) inset';
                  }
                }}
                onMouseLeave={e => {
                  if (!isComingSoon) {
                    e.currentTarget.style.transform = `rotate(${Math.random() * 4 - 2}deg)`;
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(255,69,0,0.2), 0 0 0 4px rgba(255,255,255,0.5) inset';
                  }
                }}
              >
                <div style={{
                  position: 'relative',
                  aspectRatio: '16/9',
                  background: '#000',
                  overflow: 'hidden'
                }}>
                  <img
                    src={thumbnail}
                    alt={video.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                      opacity: isComingSoon ? 0.5 : 1
                    }}
                    onError={e => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop';
                    }}
                  />

                  {!isComingSoon && (
                    <Link
                      to={`/ninos/videos/${video.id}`}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.4)',
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        zIndex: 2
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0}
                    >
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'rgba(255,69,0,0.95)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(255,69,0,0.5)',
                        transform: 'scale(0.9)',
                        transition: 'transform 0.2s ease'
                      }}>
                        <Play size={28} color="#fff" style={{ marginLeft: '3px' }} />
                      </div>
                    </Link>
                  )}

                  {isComingSoon && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0,0,0,0.6)',
                      color: '#fff',
                      padding: '1rem',
                      textAlign: 'center',
                      zIndex: 2
                    }}>
                      <Sparkles size={32} style={{ marginBottom: '0.5rem', animation: 'spin 2s linear infinite' }} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                        {video.comingSoon ? 'Próximamente' : video.error ? 'Error de config.' : 'No disponible'}
                      </span>
                      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                  )}

                  <div style={{
                    position: 'absolute',
                    bottom: '0.5rem',
                    right: '0.5rem',
                    background: 'rgba(0,0,0,0.8)',
                    color: '#fff',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    fontFamily: 'monospace'
                  }}>
                    {isPlaylist ? '▶ Lista' : isChannel ? '📺 Canal' : '▶ Video'}
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  flex: 1
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    color: isComingSoon ? '#999' : '#333',
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {video.title}
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    color: isComingSoon ? '#BBB' : '#666',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {video.description}
                  </p>
                </div>

                <div style={{
                  padding: '0.75rem 1rem 1rem',
                  borderTop: `2px dashed ${isComingSoon ? '#EEE' : '#FF450033'}`,
                  background: isComingSoon ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.5)'
                }}>
                  {isComingSoon ? (
                    <button
                      disabled
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'linear-gradient(135deg, #DDD, #BBB)',
                        color: '#888',
                        border: 'none',
                        borderRadius: '999px',
                        fontSize: '0.95rem',
                        fontWeight: 900,
                        cursor: 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Music size={18} /> Próximamente
                    </button>
                  ) : (
                    <Link
                      to={`/ninos/videos/${video.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        width: '100%',
                        padding: '0.75rem',
                        background: 'linear-gradient(135deg, #FF4500, #FF6347)',
                        color: '#fff',
                        borderRadius: '999px',
                        fontSize: '0.95rem',
                        fontWeight: 900,
                        textDecoration: 'none',
                        boxShadow: '0 4px 0 #8B0000',
                        transition: 'transform 0.1s'
                      }}
                      onMouseDown={e => e.currentTarget.style.transform = 'translateY(0)'}
                      onMouseUp={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    >
                      <Play size={18} /> Ver video
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <footer style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
            Todo el contenido es revisado y aprobado por el equipo pastoral de IMR4 Niños
          </p>
        </footer>
      </div>
    </div>
  );
};

export default VideosGrid;