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
          <div className="historia-timeline">
            {/* Línea central vertical */}
            <div className="timeline-center-line"></div>
            
            <div className="timeline-blocks">
              {historyBlocks.map((block, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div key={block.id} className={`timeline-block ${isEven ? 'block-right' : 'block-left'}`}>
                    
                    {/* Marcador del timeline */}
                    <div className="timeline-marker">
                      <span>{index + 1}</span>
                    </div>

                    {/* Contenido (Texto) */}
                    <div className="timeline-content text-content">
                      <h3 className="block-title">{block.title}</h3>
                      <p className="block-text">
                        {block.content}
                      </p>
                    </div>

                    {/* Media (Imagen o Video) */}
                    <div className="timeline-content media-content">
                      {(block.image_url || block.video_url) ? (
                        <div className="media-container">
                          {block.video_url ? (
                            <div className="video-wrapper">
                              <iframe 
                                src={block.video_url} 
                                title={block.title}
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                              ></iframe>
                            </div>
                          ) : (
                            <img 
                              src={block.image_url} 
                              alt={block.title} 
                              className="block-image"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="media-spacer"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
