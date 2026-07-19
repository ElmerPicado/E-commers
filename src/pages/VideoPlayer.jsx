import React, { useContext, useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { GalleryContext } from '../context/GalleryContext';
import { ArrowLeft, Video as YoutubeIcon, Volume2, VolumeX, Maximize2, Minimize2, Heart, Share2 } from 'lucide-react';

const VideoPlayer = () => {
  const { videoId } = useParams();
  const [searchParams] = useSearchParams();
  const { ministries } = useContext(GalleryContext);
  const ninosMinistry = ministries.find(m => m.id === 'ninos');
  const funZone = ninosMinistry?.fun_zone || {};
  const videosData = funZone.videos || {};

  const [videoData, setVideoData] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (!videosData.enabled || !videosData.youtube_url) {
      setVideoData({
        id: videoId,
        title: videosData.title || 'Video no disponible',
        url: null,
        disabled: true
      });
      return;
    }

    const urls = videosData.youtube_url.split(',').map(u => u.trim()).filter(Boolean);
    const idx = urls.findIndex(u => {
      const id = extractVideoId(u);
      return id === videoId || u.includes(videoId);
    });

    const targetUrl = idx >= 0 ? urls[idx] : urls[0];
    const videoIdExtracted = extractVideoId(targetUrl);

    setVideoData({
      id: videoIdExtracted || videoId,
      title: `Video ${idx >= 0 ? idx + 1 : 1}`,
      url: targetUrl,
      videoId: videoIdExtracted,
      disabled: false
    });
  }, [videoId, videosData]);

  function extractVideoId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  const embedUrl = videoData?.videoId
    ? `https://www.youtube.com/embed/${videoData.videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`
    : null;

  const goBack = () => window.history.back();

  const toggleFullscreen = () => {
    const playerContainer = document.getElementById('video-player-container');
    if (!playerContainer) return;

    if (!isFullscreen) {
      if (playerContainer.requestFullscreen) {
        playerContainer.requestFullscreen();
      } else if (playerContainer.webkitRequestFullscreen) {
        playerContainer.webkitRequestFullscreen();
      } else if (playerContainer.msRequestFullscreen) {
        playerContainer.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && isFullscreen) {
      toggleFullscreen();
    }
    if (e.key === ' ' && !isFullscreen) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  if (!videoData) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif'
      }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <YoutubeIcon size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>Cargando video...</h2>
        </div>
      </div>
    );
  }

  if (videoData.disabled || !embedUrl) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 50%, #90EE90 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          background: 'rgba(255,255,255,0.95)',
          padding: '3rem 2rem',
          borderRadius: '3rem',
          border: '5px dashed #FF69B4',
          boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
          maxWidth: '500px'
        }}>
          <YoutubeIcon size={64} color="#FF69B4" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#FF4500', margin: '0 0 1rem 0' }}>
            Video no disponible
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#666', margin: '0 0 2rem 0' }}>
            Este video aún no está configurado. Pide a tu maestra que agregue el enlace de YouTube en el panel de administración.
          </p>
          <Link to="/ninos/videos" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#FF6347',
            color: '#fff',
            padding: '0.75rem 2rem',
            borderRadius: '999px',
            fontSize: '1.1rem',
            fontWeight: 900,
            textDecoration: 'none',
            boxShadow: '0 5px 0 #b83214',
            transform: 'translateY(-2px)'
          }}>
            <ArrowLeft size={20} /> Volver a Videos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      id="video-player-container"
      style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif'
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <button
          onClick={goBack}
          style={{
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            padding: '0.6rem 1rem',
            borderRadius: '999px',
            fontSize: '0.9rem',
            fontWeight: 900,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        >
          <ArrowLeft size={20} /> Volver
        </button>

        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1 style={{
            margin: 0,
            fontSize: '1.2rem',
            fontWeight: 900,
            color: '#fff',
            textShadow: '1px 1px 4px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '300px'
          }}>
            {videoData.title}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              padding: '0.5rem',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button
            onClick={toggleFullscreen}
            style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              padding: '0.5rem',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          background: '#000'
        }}>
          <iframe
            src={embedUrl}
            title={videoData.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: '#000'
            }}
            referrerPolicy="origin"
          />
        </div>

        <div style={{
          flex: 1,
          background: 'linear-gradient(to top, #1a1a1a, #2a2a2a)',
          padding: '1.5rem',
          paddingTop: 'calc(100vh - 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            width: '100%',
            padding: '0 1rem'
          }}>
            <h2 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.5rem',
              fontWeight: 900,
              color: '#fff',
              textShadow: '1px 1px 4px rgba(0,0,0,0.5)'
            }}>
              {videoData.title}
            </h2>
            <p style={{
              margin: '0 0 1.5rem 0',
              fontSize: '1rem',
              color: '#CCC',
              lineHeight: 1.6
            }}>
              Disfruta de este video especial para niños. ¡Canta, aprende y diviértete con la Palabra de Dios!
            </p>

            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '1.5rem'
            }}>
              <button style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                padding: '0.75rem 1.5rem',
                borderRadius: '999px',
                fontSize: '0.9rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
            >
              <Heart size={18} /> Me gusta
            </button>
              <button style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                padding: '0.75rem 1.5rem',
                borderRadius: '999px',
                fontSize: '0.9rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
            >
              <Share2 size={18} /> Compartir
            </button>
              <Link
                to="/ninos/videos"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255,69,0,0.8)',
                  border: 'none',
                  color: '#fff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '999px',
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#FF4500'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,69,0,0.8)'}
              >
                <YoutubeIcon size={18} /> Más videos
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
        padding: '1rem',
        textAlign: 'center',
        color: '#888',
        fontSize: '0.75rem',
        pointerEvents: 'none',
        zIndex: 50
      }}>
        <p style={{ margin: 0 }}>
          Contenido seguro para niños • IMR4 Niños • Todos los derechos reservados
        </p>
      </footer>
    </div>
  );
};

export default VideoPlayer;