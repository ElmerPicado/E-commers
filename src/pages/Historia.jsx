import React, { useContext, useState, useRef } from 'react';
import { GalleryContext } from '../context/GalleryContext';
import { Clock, BookOpen, Video, Image as ImageIcon, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import './Historia.css';

const MediaCarousel = ({ mediaUrls }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -current.offsetWidth / 2 : current.offsetWidth / 2;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ position: 'relative', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
      {mediaUrls.length > 3 && (
        <>
          <button onClick={() => scroll('left')} className="carousel-nav-btn left">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => scroll('right')} className="carousel-nav-btn right">
            <ChevronRight size={24} />
          </button>
        </>
      )}
      <div ref={scrollRef} className="newspaper-media-grid" style={{ marginTop: 0, borderTop: 'none', paddingTop: 0 }}>
        {mediaUrls.map((media, mIdx) => {
          const isString = typeof media === 'string';
          const url = isString ? media : media.url;
          const caption = isString ? '' : media.caption;
          const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
          const isDirectVideo = url.match(/\.(mp4|webm|ogg)(\?.*)?$/i);

          return (
            <figure key={mIdx} className="newspaper-media-item" style={{ margin: 0, overflow: 'hidden' }}>
              {isYoutube ? (
                <iframe 
                  src={url.includes('watch?v=') ? url.replace('watch?v=', 'embed/').split('&')[0] : url.replace('youtu.be/', 'youtube.com/embed/').split('?')[0]} 
                  title={`Video adicional ${mIdx + 1}`}
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="video-item"
                  style={{ width: '100%', display: 'block' }}
                ></iframe>
              ) : isDirectVideo ? (
                <video src={url} controls className="video-item" style={{ width: '100%', display: 'block' }}></video>
              ) : (
                <img src={url} alt={caption || 'Media adicional'} className="image-item" style={{ width: '100%', display: 'block' }} />
              )}
              {caption && (
                <figcaption style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', textAlign: 'center', margin: 0 }}>
                  {caption}
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>
    </div>
  );
};

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
      <section className="historia-hero" style={livestream?.historyBgUrl ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.75)), url(${livestream.historyBgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        color: '#ffffff',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
      } : {}}>
        <div className="historia-hero-content">
          <BookOpen size={64} className="hero-icon" />
          <h1 className="hero-title" style={livestream?.historyBgUrl ? { color: '#ffffff' } : {}}>Nuestra Historia</h1>
          <p className="hero-subtitle" style={livestream?.historyBgUrl ? { color: 'rgba(255, 255, 255, 0.9)' } : {}}>
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
                  {block.content && (
                    <div 
                      className="era-description ql-editor-display" 
                      dangerouslySetInnerHTML={{ __html: block.content }} 
                    />
                  )}
                </div>

                {block.testimonies && block.testimonies.length > 0 && (
                  <div className="testimonies-list">
                    {block.testimonies.map((t, tIdx) => (
                      <div key={t.id} className="newspaper-article">
                        {/* Newspaper Body */}
                        <div className="newspaper-body">
                          <div className={`newspaper-author-block ${tIdx % 2 === 0 ? 'image-left' : 'image-right'}`}>
                            {t.authorPhoto ? (
                              <img src={t.authorPhoto} alt={t.authorName} className="newspaper-author-image" />
                            ) : (
                              <div className="newspaper-author-image placeholder-image">
                                <User size={48} />
                              </div>
                            )}
                            <div className="newspaper-author-info">
                              <p className="newspaper-author-name">{t.authorName}</p>
                              <p className="newspaper-author-role">{t.authorRole}</p>
                            </div>
                          </div>
                          
                          <div 
                            className="newspaper-text-container ql-editor-display"
                            dangerouslySetInnerHTML={{ __html: t.content }}
                          />
                          
                          <div style={{ clear: 'both' }}></div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Combined Additional Media Carousel for the entire block */}
                    {(() => {
                      const combinedMedia = block.testimonies.reduce((acc, t) => {
                        if (t.mediaUrls && t.mediaUrls.length > 0) {
                          return [...acc, ...t.mediaUrls];
                        }
                        return acc;
                      }, []);

                      if (combinedMedia.length > 0) {
                        return (
                          <div style={{ marginTop: '2rem' }}>
                            <MediaCarousel mediaUrls={combinedMedia} />
                          </div>
                        );
                      }
                      return null;
                    })()}
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
