import React, { useContext, useState } from 'react';
import { GalleryContext } from '../context/GalleryContext';
import { Clock, BookOpen, Video, Image as ImageIcon, Sun, Moon } from 'lucide-react';
import './Historia.css';

export default function Historia() {
  const { blogPosts, livestream } = useContext(GalleryContext);
  const [isLightMode, setIsLightMode] = useState(true);

  // Filtrar solo los de la categoría 'historia' y ordenarlos
  const historyBlocks = (blogPosts || [])
    .filter(post => !post.category || post.category === 'historia')
    .sort((a, b) => a.order_index - b.order_index);

  return (
    <div className={`historia-page ${!isLightMode ? 'dark' : ''}`}>
      
      {/* Floating Theme Toggle */}
      <button 
        onClick={() => setIsLightMode(!isLightMode)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 50,
          background: 'var(--accent-color)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          transition: 'transform 0.3s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Moon size={24} style={{ display: isLightMode ? 'block' : 'none' }} />
        <Sun size={24} style={{ display: !isLightMode ? 'block' : 'none' }} />
      </button>

      {/* Hero Section */}
      <section className="historia-hero" style={livestream?.formBgUrl ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.75)), url(${livestream.formBgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        color: '#ffffff',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
      } : {}}>
        <div className="historia-hero-content">
          <BookOpen size={64} className="hero-icon" />
          <h1 className="hero-title" style={livestream?.formBgUrl ? { color: '#ffffff' } : {}}>Nuestra Historia</h1>
          <p className="hero-subtitle" style={livestream?.formBgUrl ? { color: 'rgba(255, 255, 255, 0.9)' } : {}}>
            Descubre cómo Dios ha guiado cada paso de nuestra iglesia desde sus inicios hasta el día de hoy.
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="historia-timeline-section">
        {historyBlocks.length === 0 ? (
          <div className="historia-empty">
            <Clock size={48} className="empty-icon" />
            <p>Pronto compartiremos más detalles sobre nuestra historia.</p>
          </div>
        ) : (
          <div className="historia-blocks-container">
            {historyBlocks.map((block, index) => (
              <div key={block.id} className="history-era-block">
                <div className="era-header">
                  <div className="era-number">{index + 1}</div>
                  <h2 className="era-title">{block.title}</h2>
                  {block.content && <p className="era-description">{block.content}</p>}
                </div>

                {block.testimonies && block.testimonies.length > 0 && (
                  <div className="testimonies-list">
                    {block.testimonies.map((t) => (
                      <div key={t.id} className="testimony-row">
                        <div className="testimony-author">
                          {t.authorPhoto ? (
                            <img src={t.authorPhoto} alt={t.authorName} className="testimony-photo" />
                          ) : (
                            <div className="testimony-photo-placeholder">
                              <User size={48} />
                            </div>
                          )}
                          <h4 className="testimony-name">{t.authorName}</h4>
                          <span className="testimony-role">{t.authorRole}</span>
                        </div>
                        
                        <div className="testimony-content">
                          <p className="testimony-text">{t.content}</p>
                          
                          {t.mediaUrls && t.mediaUrls.length > 0 && (
                            <div className="testimony-media-grid">
                              {t.mediaUrls.map((url, idx) => {
                                const isVideo = url.includes('youtube.com') || url.includes('youtu.be');
                                if (isVideo) {
                                  const videoUrl = url.includes('watch?v=') 
                                    ? url.replace('watch?v=', 'embed/').split('&')[0]
                                    : url.includes('youtu.be/') 
                                      ? url.replace('youtu.be/', 'youtube.com/embed/').split('?')[0]
                                      : url;
                                  return (
                                    <iframe 
                                      key={idx} 
                                      src={videoUrl} 
                                      className="testimony-media-item video-item" 
                                      frameBorder="0" 
                                      allowFullScreen
                                    ></iframe>
                                  );
                                }
                                return <img key={idx} src={url} alt="Media adicional" className="testimony-media-item image-item" />;
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
