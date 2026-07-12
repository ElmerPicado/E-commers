import React, { useContext, useState, useMemo, useEffect } from 'react';
import { GalleryContext } from '../context/GalleryContext';
import { ArrowLeft, User, Calendar, Tag } from 'lucide-react';
import './Devocionales.css';

export default function Devocionales() {
  const { devotionals, devotionalCategories } = useContext(GalleryContext);
  
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [selectedDevocional, setSelectedDevocional] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedDevocional]);

  // Filtrar solo los publicados
  const publishedDevotionals = useMemo(() => {
    return (devotionals || []).filter(d => d.status === 'published');
  }, [devotionals]);

  const filteredDevotionals = useMemo(() => {
    if (activeCategoryId === 'all') return publishedDevotionals;
    return publishedDevotionals.filter(d => d.category_id === activeCategoryId);
  }, [publishedDevotionals, activeCategoryId]);

  const getCategoryName = (id) => {
    if (!id) return 'Sin categoría';
    const cat = devotionalCategories?.find(c => c.id === id);
    return cat ? cat.name : 'Sin categoría';
  };

  if (selectedDevocional) {
    return (
      <div className="devocionales-page" style={{ paddingTop: '80px' }}>
        <div className="devocionales-layout" style={{ display: 'block' }}>
          <div className="devocional-detail">
            <button className="back-button" onClick={() => setSelectedDevocional(null)}>
              <ArrowLeft size={18} /> Volver a los devocionales
            </button>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', lineHeight: 1.2 }}>
              {selectedDevocional.title}
            </h1>
            
            <div className="meta" style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Calendar size={14}/> {new Date(selectedDevocional.created_at).toLocaleDateString()}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Tag size={14}/> {getCategoryName(selectedDevocional.category_id)}</span>
            </div>

            <div className="author-box">
              {selectedDevocional.author_photo ? (
                <img src={selectedDevocional.author_photo} alt={selectedDevocional.author_name} className="author-photo" />
              ) : (
                <div className="author-photo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', color: '#94a3b8' }}>
                  <User size={32} />
                </div>
              )}
              <div className="author-info">
                <h4>{selectedDevocional.author_name}</h4>
                <p>{selectedDevocional.author_bio}</p>
              </div>
            </div>

            <div className="devocional-content-body">
              {selectedDevocional.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="devocionales-page">
      <header className="devocionales-header">
        <h1>Devocionales</h1>
        <p>Un espacio de reflexión, crecimiento espiritual y comunión con la palabra de Dios, escrito por nuestra comunidad.</p>
      </header>

      <div className="devocionales-layout">
        <aside className="categories-sidebar">
          <h3>Categorías</h3>
          <div 
            className={`category-item ${activeCategoryId === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategoryId('all')}
          >
            Todos los temas
          </div>
          {(devotionalCategories || []).map(cat => (
            <div 
              key={cat.id}
              className={`category-item ${activeCategoryId === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategoryId(cat.id)}
            >
              {cat.name}
            </div>
          ))}
        </aside>

        <main className="devocionales-grid">
          {filteredDevotionals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b', background: '#f8fafc', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
              <BookOpen size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem auto' }} />
              <h2 style={{ fontSize: '1.25rem', color: '#334155', marginBottom: '0.5rem' }}>No hay devocionales aquí</h2>
              <p>Pronto nuestros escritores compartirán más contenido inspirador en esta sección.</p>
            </div>
          ) : (
            filteredDevotionals.map(dev => (
              <article key={dev.id} className="devocional-card" onClick={() => setSelectedDevocional(dev)}>
                <div className="meta">
                  <span style={{ color: '#2563eb', fontWeight: 600 }}>{getCategoryName(dev.category_id)}</span>
                  <span>•</span>
                  <span>{new Date(dev.created_at).toLocaleDateString()}</span>
                </div>
                <h2>{dev.title}</h2>
                <p className="excerpt">{dev.content}</p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  {dev.author_photo ? (
                    <img src={dev.author_photo} alt={dev.author_name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                      <User size={16} />
                    </div>
                  )}
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Por {dev.author_name}</span>
                </div>
              </article>
            ))
          )}
        </main>
      </div>
    </div>
  );
}
