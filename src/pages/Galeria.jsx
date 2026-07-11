import React, { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GalleryContext } from '../context/GalleryContext';
import { ImageIcon, Calendar, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Galeria() {
  const { albums } = useContext(GalleryContext);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const minQuery = queryParams.get('min');
  
  const [selectedCategory, setSelectedCategory] = useState(minQuery || 'todos');
  
  useEffect(() => {
    if (minQuery) {
      setSelectedCategory(minQuery);
    }
  }, [minQuery]);

  const [activeAlbum, setActiveAlbum] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Category tags mappings
  const categories = [
    { key: 'todos', label: 'Todos' },
    { key: 'general', label: 'General' },
    { key: 'juvenil', label: 'Jóvenes' },
    { key: 'mujeres', label: 'Mujeres' },
    { key: 'hombres', label: 'Hombres' },
    { key: 'ninos', label: 'Niños' }
  ];

  const getCategoryLabel = (catKey) => {
    const found = categories.find(c => c.key === catKey);
    return found ? found.label : catKey;
  };

  // Filter logic
  const filteredAlbums = selectedCategory === 'todos'
    ? albums
    : albums.filter(album => album.category === selectedCategory);

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    if (activeAlbum && lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev === 0 ? activeAlbum.photos.length - 1 : prev - 1));
    }
  };

  const nextPhoto = (e) => {
    e.stopPropagation();
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
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {activeAlbum.photos?.length || 0} imágenes
              </span>
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
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem'
              }}>
                {filteredAlbums.map((album) => (
                  <div
                    key={album.id}
                    onClick={() => setActiveAlbum(album)}
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
                    <div style={{ height: '180px', width: '100%', overflow: 'hidden', position: 'relative', background: '#000' }}>
                      {album.photos && album.photos.length > 0 ? (
                        <img
                          src={album.photos[0]}
                          alt={album.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
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
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.35rem' }}>
                        <Calendar size={10} /> {album.date}
                      </span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', flexGrow: 1 }}>
                        {album.title}
                      </h3>
                      <span style={{
                        alignSelf: 'flex-start',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--accent-color)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        marginTop: '0.5rem'
                      }}>
                        Ver álbum &rarr;
                      </span>
                    </div>
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
