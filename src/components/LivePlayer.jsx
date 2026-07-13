import React, { useState, useContext, useEffect, useRef } from 'react';
import { Play, Pause, Send, Radio as RadioIcon, Volume2, User, Tv, Info, Calendar } from 'lucide-react';
import { GalleryContext } from '../context/GalleryContext';

export default function LivePlayer() {
  const { livestream, radio, addChatMessage, radioPrograms } = useContext(GalleryContext);
  const [inputText, setInputText] = useState('');
  const [userName, setUserName] = useState('');
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);
  const chatContainerRef = useRef(null);
  const audioRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [livestream.chatMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const sender = userName.trim() || 'Invitado';
    addChatMessage({
      user: sender,
      text: inputText.trim()
    });
    setInputText('');
  };

  const toggleRadio = () => {
    if (!audioRef.current) return;
    
    if (isRadioPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.log("Audio play blocked or error:", err);
      });
    }
    setIsRadioPlaying(!isRadioPlaying);
  };

  // Auto-convert standard YouTube URLs to embed URLs
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;

    // Matches youtu.be/, watch?v=, live/
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return url;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. SECCION LIVESTREAM DE VIDEO */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Tv className="text-blue-500" size={24} style={{ color: 'var(--accent-color)' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Transmisión en Vivo</h2>
          </div>
          {livestream.isLive ? (
            <span style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                background: '#ef4444',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'pulse 1.5s infinite alternate'
              }}></span>
              TRANSMITIENDO AHORA
            </span>
          ) : (
            <span style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700
            }}>
              FUERA DE LÍNEA
            </span>
          )}
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {livestream.title}
        </p>

        {/* Video Player and Chat container */}
        <div className="live-player-container">
          
          {/* Iframe player */}
          <div style={{
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%', // 16:9 Aspect Ratio
            background: '#000',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            alignSelf: 'flex-start' // prevent stretching
          }}>
            {livestream.isLive ? (
              <iframe
                src={getEmbedUrl(livestream.videoUrl)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                title={livestream.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            ) : (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                color: 'var(--text-muted)',
                padding: '2rem',
                textAlign: 'center'
              }}>
                <Tv size={48} />
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>No hay transmisión en vivo en este momento</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {livestream.youtubeChannelUrl ? (
                      <a href={livestream.youtubeChannelUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}>
                        Visita nuestro canal
                      </a>
                    ) : (
                      "Visita nuestro canal"
                    )} para ver transmisiones anteriores o conéctate en nuestros horarios habituales.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Chat */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: '350px',
            background: 'rgba(255, 255, 255, 0.01)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.75rem',
            overflow: 'hidden'
          }}>
            {/* Chat header */}
            <div style={{
              padding: '0.75rem',
              borderBottom: '1px solid var(--border-color)',
              background: 'rgba(255, 255, 255, 0.02)',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>Chat de la Comunidad</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)' }}>En línea</span>
            </div>

            {/* Chat messages */}
            <div 
              ref={chatContainerRef}
              style={{
              flex: 1,
              padding: '0.75rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              maxHeight: '400px', // More height on desktop, ok on mobile
              minHeight: '200px',
              scrollBehavior: 'smooth'
            }}>
              {(livestream.realtimeChatMessages || livestream.chatMessages || []).map((msg) => (
                <div key={msg.id} style={{
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                  background: 'rgba(255,255,255,0.02)',
                  padding: '0.5rem',
                  borderRadius: '0.35rem',
                  borderLeft: '2px solid var(--accent-color)'
                }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', marginRight: '0.4rem', fontSize: '0.8rem' }}>
                    {msg.user || msg.user_name}:
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {msg.text || msg.message}
                  </span>
                </div>
              ))}
            </div>

            {/* Chat form inputs */}
            <form onSubmit={handleSendMessage} style={{
              padding: '0.75rem',
              borderTop: '1px solid var(--border-color)',
              background: 'rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <User size={12} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Tu Nombre"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.75rem',
                    padding: '0.2rem 0',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.25rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    padding: '0.4rem 0.6rem',
                    outline: 'none'
                  }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', borderRadius: '0.25rem' }}>
                  <Send size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 2. SECCION RADIO EN VIVO */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RadioIcon className="text-emerald-500" size={24} style={{ color: 'var(--accent-color)' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Radio IMR4 Online</h2>
          </div>
          {radio.isLive && (
            <span style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700
            }}>
              RADIO EN VIVO
            </span>
          )}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          padding: '1.25rem',
          borderRadius: '0.75rem',
          flexWrap: 'wrap'
        }}>
          {/* Audio stream placeholder element */}
          <audio
            ref={audioRef}
            src={radio.audioUrl}
            preload="none"
          ></audio>

          {/* Large Play/Pause Button */}
          <button
            onClick={toggleRadio}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--accent-color)',
              color: '#000',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 14px rgba(var(--accent-color-rgb), 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isRadioPlaying ? <Pause size={24} fill="#000" /> : <Play size={24} fill="#000" style={{ marginLeft: '4px' }} />}
          </button>

          {/* Info & Radio Visualizer */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              {radio.title}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
              <Volume2 size={12} />
              Audio de alta fidelidad para edificar tu día
            </p>

            {/* Simulated radio wave indicator */}
            {isRadioPlaying && (
              <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '20px', marginTop: '0.75rem' }}>
                {[...Array(12)].map((_, i) => {
                  const delay = (i * 0.15).toFixed(2);
                  return (
                    <span
                      key={i}
                      style={{
                        width: '3px',
                        background: 'var(--accent-color)',
                        borderRadius: '1px',
                        animation: `pulseHeight 1.2s ease-in-out infinite alternate`,
                        animationDelay: `${delay}s`,
                        height: '5px'
                      }}
                    ></span>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            background: 'rgba(255, 255, 255, 0.01)',
            border: '1px solid var(--border-color)'
          }}>
            <Info size={14} />
            <span>Transmisión en formato digital AAC+</span>
          </div>
        </div>
      </div>

      {/* 3. PARRILLA DE PROGRAMACIÓN DE RADIO */}
      {radioPrograms && radioPrograms.filter(p => p.is_active).length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Calendar size={20} color="var(--accent-color)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Programación Destacada</h3>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {radioPrograms.filter(p => p.is_active).map(prog => (
              <div key={prog.id} className="glass-card" style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{ height: '140px', width: '100%', position: 'relative' }}>
                  {prog.image_url ? (
                    <img src={prog.image_url} alt={prog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, var(--bg-surface), rgba(255,255,255,0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <RadioIcon size={40} color="var(--text-muted)" opacity={0.5} />
                    </div>
                  )}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    bottom: '0.75rem',
                    left: '1rem',
                    right: '1rem'
                  }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                      {prog.title}
                    </h4>
                    {prog.host && (
                      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                        <User size={12} /> {prog.host}
                      </p>
                    )}
                  </div>
                </div>
                
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {prog.schedule_time && (
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.35rem', 
                      background: 'rgba(var(--accent-color-rgb), 0.1)', 
                      color: 'var(--accent-color)', 
                      padding: '0.35rem 0.75rem', 
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      marginBottom: '0.75rem',
                      alignSelf: 'flex-start'
                    }}>
                      <Calendar size={14} /> {prog.schedule_time}
                    </div>
                  )}
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>
                    {prog.description || 'Sintonízanos para disfrutar de este programa especial diseñado para ti.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Styled animation keyframes for visualizer & live indicator */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        @keyframes pulseHeight {
          0% { height: 4px; }
          100% { height: 20px; }
        }
      `}</style>
    </div>
  );
}
