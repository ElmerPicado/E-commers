import React, { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GalleryContext } from '../context/GalleryContext';
import { Image as ImageIcon, Calendar, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';

const AlbumCard = ({ album, onClick, getCategoryLabel }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [displayPhotos, setDisplayPhotos] = useState([]);

  useEffect(() => {
    if (album.photos && album.photos.length > 0) {
      // Pick up to 3 random photos for the slideshow, ensuring there's variety
      const shuffled = [...album.photos].sort(() => 0.5 - Math.random());
      setDisplayPhotos(shuffled.slice(0, 3));
    }
  }, [album.photos]);

  useEffect(() => {
    let interval;
    if (displayPhotos.length > 1) {
      // Start slightly staggered so they don't all flip at the exact same moment
      const timeout = setTimeout(() => {
        interval = setInterval(() => {
          setCurrentIdx(prev => (prev + 1) % displayPhotos.length);
        }, 3000 + Math.random() * 1000);
      }, Math.random() * 2000);
      
      return () => {
        clearTimeout(timeout);
        clearInterval(interval);
      }
    }
  }, [displayPhotos]);

  return (
    <div
      onClick={onClick}
      className="glass-card"
      style={{
        padding: '0',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <div style={{ height: '240px', width: '100%', overflow: 'hidden', position: 'relative', background: '#000' }}>
        {displayPhotos.length > 0 ? (
          <img
            src={displayPhotos[currentIdx]}
            alt={album.title}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              transition: 'opacity 0.8s ease-in-out, transform 0.5s ease-out' 
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)'
          }}>
            <ImageIcon size={36} />
          </div>
        )}
        <span style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          background: 'rgba(0,0,0,0.8)',
          border: '1px solid var(--border-color)',
          padding: '0.2rem 0.5rem',
          borderRadius: '0.25rem',
          fontSize: '0.65rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          color: 'var(--accent-color)'
        }}>
          {getCategoryLabel(album.category)}
        </span>
        <span style={{
          position: 'absolute',
          bottom: '0.75rem',
          right: '0.75rem',
          background: 'rgba(0,0,0,0.7)',
          padding: '0.2rem 0.5rem',
          borderRadius: '0.25rem',
          fontSize: '0.7rem',
          fontWeight: 700
        }}>
          {album.photos?.length || 0} Fotos
        </span>
      </div>

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.85rem', textTransform: 'capitalize' }}>
           <Calendar size={14} /> 
           <span>{album.date}</span>
        </div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.2 }}>
          {album.title}
        </h3>
        
        {album.description && (
          <p style={{ 
            fontSize: '0.9rem', 
            color: 'var(--text-secondary)', 
            lineHeight: 1.6, 
            whiteSpace: 'pre-line',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            margin: '0 0 0.5rem 0'
          }}>
            {album.description}
          </p>
        )}
        <span style={{ color: 'var(--accent-color)', fontWeight: 700, fontSize: '0.85rem', display: 'inline-block', marginTop: 'auto' }}>
          Leer más...
        </span>
      </div>
    </div>
  );
};

export default function Galeria() {
  const { albums, ministries } = useContext(GalleryContext);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const minQuery = queryParams.get('min');
  const albumQuery = queryParams.get('album');
  
  const [selectedCategory, setSelectedCategory] = useState(minQuery || 'todos');
  const [activeAlbum, setActiveAlbum] = useState(null);

  // Swipe logic states for lightbox
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const handleTouchStart = (e) => setTouchStartX(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEndX(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    if (touchStartX - touchEndX > 50) nextPhoto(new Event('swipe'));
    if (touchStartX - touchEndX < -50) prevPhoto(new Event('swipe'));
    setTouchStartX(0);
    setTouchEndX(0);
  };
  const [lightboxIndex, setLightboxIndex] = useState(null);
  
  useEffect(() => {
    if (minQuery) {
      setSelectedCategory(minQuery);
    }
    if (albumQuery && albums.length > 0) {
      const target = albums.find(a => a.id === albumQuery);
      if (target) {
        setActiveAlbum(target);
        if (target.category) setSelectedCategory(target.category);
      }
    }
  }, [minQuery, albumQuery, albums]);

  // Category tags mappings dynamically built from ministries
  const dynamicCategories = ministries ? ministries.map(m => {
    let label = m.name
      .replace(/Ministerio de /gi, '')
      .replace(/Ministerio /gi, '')
      .replace(/Red /gi, '')
      .replace(/IMR4 /gi, '') // Quitar IMR4 del principio
      .trim();
    
    // Tomar la primera palabra de lo que queda
    label = label.split(' ')[0];
    
    return {
      key: m.id,
      label: label
    };
  }) : [];
  
  const categories = [
    { key: 'todos', label: 'Todos' },
    { key: 'general', label: 'General' },
    ...dynamicCategories
  ];

  const getCategoryLabel = (catKey) => {
    const found = categories.find(c => c.key === catKey);
    return found ? found.label : catKey;
  };

  // Filter logic
  const filteredAlbums = selectedCategory === 'todos'
    ? albums
    : albums.filter(album => album.category === selectedCategory || album.ministry_id === selectedCategory);

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const prevPhoto = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (activeAlbum && lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev === 0 ? activeAlbum.photos.length - 1 : prev - 1));
    }
  };

  const nextPhoto = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (activeAlbum && lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev === activeAlbum.photos.length - 1 ? 0 : prev + 1));
    }
  };

  return (
    <div className="theme-imr4" style={{ minHeight: '100vh', padding: '6.5rem 1.5rem 4rem 1.5rem' }}>
      <div className="container">
        
        {/* Main Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Galerías de Fotos</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
            Explora las fotos de nuestras actividades y servicios organizadas por bloques de eventos. Utiliza los filtros para encontrar tu ministerio.
          </p>
        </div>

        {/* If viewing an active album */}
        {activeAlbum ? (
          <div className="animate-slide-up">
            <button
              onClick={() => { setActiveAlbum(null); closeLightbox(); }}
              className="btn btn-secondary"
              style={{ marginBottom: '1.5rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            >
              &larr; Volver a los álbumes
            </button>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <span style={{
                  fontSize: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--accent-color)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  {getCategoryLabel(activeAlbum.category)}
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>{activeAlbum.date}</span>
                </span>
                <h2 style={{ fontSize: '1.8rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>{activeAlbum.title}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {activeAlbum.description || `Fotos del ministerio de ${getCategoryLabel(activeAlbum.category)}`}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {activeAlbum.photos?.length || 0} imágenes cargadas
                </span>
                {activeAlbum.drive_link && (
                  <a href={activeAlbum.drive_link} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ImageIcon size={16} /> Ver Álbum Completo Externo
                  </a>
                )}
              </div>
            </div>

            {/* Photos Grid */}
            {activeAlbum.photos && activeAlbum.photos.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1rem'
              }}>
                {activeAlbum.photos.map((photo, idx) => (
                  <div
                    key={idx}
                    onClick={() => openLightbox(idx)}
                    style={{
                      height: '180px',
                      borderRadius: '0.5rem',
                      overflow: 'hidden',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      background: 'var(--bg-surface)'
                    }}
                  >
                    <img
                      src={photo}
                      alt={`Foto ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                border: '1px dashed var(--border-color)',
                borderRadius: '0.5rem',
                color: 'var(--text-muted)'
              }}>
                <ImageIcon size={48} style={{ marginBottom: '1rem' }} />
                <p>Este álbum no tiene fotos cargadas todavía.</p>
              </div>
            )}
          </div>
        ) : (
          /* List of Albums with filter */
          <div className="animate-fade-in">
            {/* Filter buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginBottom: '2.5rem',
              alignItems: 'center'
            }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginRight: '0.5rem'
              }}>
                <Filter size={14} /> Filtrar por:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`btn ${selectedCategory === cat.key ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.85rem',
                    borderRadius: '9999px',
                    border: '1px solid var(--border-color)',
                    background: selectedCategory === cat.key ? 'var(--accent-color)' : 'transparent',
                    color: selectedCategory === cat.key ? '#000' : 'var(--text-secondary)'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Albums grid */}
            {filteredAlbums.length > 0 ? (
              <div className="scroll-container">
                {filteredAlbums.map((album) => (
                  <div key={album.id} className="scroll-item" style={{ minWidth: '280px', flex: '0 0 auto' }}>
                    <AlbumCard 
                      album={album} 
                      onClick={() => setActiveAlbum(album)} 
                      getCategoryLabel={getCategoryLabel} 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                color: 'var(--text-muted)'
              }}>
                <ImageIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>No se encontraron álbumes en esta categoría.</p>
              </div>
            )}
          </div>
        )}

        {/* Lightbox / Overlay Modal */}
        {lightboxIndex !== null && activeAlbum && (
          <div
            onClick={closeLightbox}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.95)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                color: '#fff',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={prevPhoto}
              style={{
                position: 'absolute',
                left: '1.5rem',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                color: '#fff',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={nextPhoto}
              style={{
                position: 'absolute',
                right: '1.5rem',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                color: '#fff',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronRight size={24} />
            </button>

            {/* Main Image */}
            <img
              key={lightboxIndex}
              src={activeAlbum.photos[lightboxIndex]}
              alt={`Lightbox ${lightboxIndex + 1}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '90%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '0.25rem',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
              }}
            />

            {/* Caption */}
            <div style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
              Imagen {lightboxIndex + 1} de {activeAlbum.photos.length}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
