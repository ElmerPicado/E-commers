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
                  {block.content && <p className="era-description">{block.content}</p>}
                </div>

                {block.testimonies && block.testimonies.length > 0 && (
                  <div className="testimonies-list">
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                      <h3 className="newspaper-headline" style={{ display: 'inline-block', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>Relatos Históricos</h3>
                    </div>
                    {block.testimonies.map((t) => (
                      <div key={t.id} className="newspaper-article">
                        {/* Newspaper Body */}
                        <div className="newspaper-body">
                          <div className="newspaper-author-block">
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
                          
                          <div className="newspaper-text-container">
                            {t.content.split('\n').map((paragraph, pIdx) => {
                              if (!paragraph.trim()) return null;
                              // Si empieza con ¿ o termina con ? o empieza con P:
                              const isQuestion = paragraph.trim().startsWith('¿') || 
                                                 paragraph.trim().endsWith('?') || 
                                                 paragraph.trim().toUpperCase().startsWith('P:');
                              
                              if (isQuestion) {
                                return (
                                  <h4 key={pIdx} className="newspaper-question">
                                    {paragraph}
                                  </h4>
                                );
                              }
                              
                              return <p key={pIdx} className="newspaper-text">{paragraph}</p>;
                            })}
                          </div>
                          
                          <div style={{ clear: 'both' }}></div>
                        </div>

                        {/* Additional Media */}
                        {t.mediaUrls && t.mediaUrls.length > 0 && (
                          <div className="newspaper-media-grid">
                            {t.mediaUrls.map((url, idx) => {
                              const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
                              const isDirectVideo = url.match(/\.(mp4|webm|ogg)(\?.*)?$/i);
                              
                              if (isYoutube) {
                                const videoUrl = url.includes('watch?v=') 
                                  ? url.replace('watch?v=', 'embed/').split('&')[0]
                                  : url.includes('youtu.be/') 
                                    ? url.replace('youtu.be/', 'youtube.com/embed/').split('?')[0]
                                    : url;
                                return (
                                  <iframe 
                                    key={idx} 
                                    src={videoUrl} 
                                    className="newspaper-media-item video-item" 
                                    frameBorder="0" 
                                    allowFullScreen
                                  ></iframe>
                                );
                              } else if (isDirectVideo) {
                                return (
                                  <video 
                                    key={idx} 
                                    src={url} 
                                    controls 
                                    className="newspaper-media-item video-item"
                                  ></video>
                                );
                              }
                              return <img key={idx} src={url} alt="Media adicional" className="newspaper-media-item image-item" />;
                            })}
                          </div>
                        )}
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
