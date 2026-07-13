import React, { useContext, useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GalleryContext } from '../context/GalleryContext';
import { BookOpen, User, Calendar, Tag, Sun, Moon, Search } from 'lucide-react';
import './Devocionales.css';

const normalizeText = (text) => {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

export default function Devocionales() {
  const { devotionals, devotionalCategories, livestream } = useContext(GalleryContext);
  const navigate = useNavigate();
  
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [activeAuthorName, setActiveAuthorName] = useState('all');
  const [isLightMode, setIsLightMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400); // 400ms debounce to prevent lag
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filtrar solo los publicados
  const publishedDevotionals = useMemo(() => {
    return (devotionals || []).filter(d => d.status === 'published');
  }, [devotionals]);

  const uniqueAuthors = useMemo(() => {
    const authors = publishedDevotionals.map(d => d.author_name).filter(Boolean);
    return [...new Set(authors)].sort((a, b) => a.localeCompare(b));
  }, [publishedDevotionals]);

  const filteredDevotionals = useMemo(() => {
    return publishedDevotionals.filter(d => {
      const matchCategory = activeCategoryId === 'all' || d.category_id === activeCategoryId;
      const matchAuthor = activeAuthorName === 'all' || d.author_name === activeAuthorName;
      
      let matchSearch = true;
      if (debouncedSearchTerm.trim()) {
        const query = normalizeText(debouncedSearchTerm);
        const contentStr = normalizeText(d.content);
        const titleStr = normalizeText(d.title);
        const verseStr = normalizeText(d.verse);
        const authorStr = normalizeText(d.author_name);
        matchSearch = titleStr.includes(query) || 
                      contentStr.includes(query) || 
                      verseStr.includes(query) || 
                      authorStr.includes(query);
      }

      return matchCategory && matchAuthor && matchSearch;
    });
  }, [publishedDevotionals, activeCategoryId, activeAuthorName, debouncedSearchTerm]);

  const getCategoryName = (id) => {
    if (!id) return 'Sin categoría';
    const cat = devotionalCategories?.find(c => c.id === id);
    return cat ? cat.name : 'Sin categoría';
  };

  const headerBgStyle = livestream?.formBgUrl ? {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.75)), url(${livestream.formBgUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    color: '#ffffff',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
  } : {};

  return (
    <div className={`devocionales-page ${!isLightMode ? 'dark' : ''}`}>
      
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
        {isLightMode ? <Moon size={24} /> : <Sun size={24} />}
      </button>

      <div className="devocionales-header" style={headerBgStyle}>
        <h1 style={livestream?.formBgUrl ? { color: '#ffffff' } : {}}>Devocionales</h1>
        <p style={livestream?.formBgUrl ? { color: 'rgba(255, 255, 255, 0.9)' } : {}}>Un espacio de reflexión, crecimiento espiritual y comunión con la palabra de Dios, escrito por nuestra comunidad.</p>
      </div>

      <div className="devocionales-layout">
        <aside className="categories-sidebar">
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem', marginTop: 0 }}>
              Buscar
            </h3>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Palabras clave..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              />
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            </div>
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem', marginTop: 0 }}>
            Categorías
          </h3>
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

          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem', marginTop: '2.5rem' }}>
            Autores
          </h3>
          <div 
            className={`category-item ${activeAuthorName === 'all' ? 'active' : ''}`}
            onClick={() => setActiveAuthorName('all')}
          >
            Todos los autores
          </div>
          {uniqueAuthors.map(author => (
            <div 
              key={author}
              className={`category-item ${activeAuthorName === author ? 'active' : ''}`}
              onClick={() => setActiveAuthorName(author)}
            >
              {author}
            </div>
          ))}
        </aside>

        <main className="devocionales-grid" style={{ paddingBottom: '4rem' }}>
          {filteredDevotionals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b', background: '#f8fafc', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
              <BookOpen size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem auto' }} />
              <h2 style={{ fontSize: '1.25rem', color: '#334155', marginBottom: '0.5rem' }}>No hay devocionales aquí</h2>
              <p>Pronto nuestros escritores compartirán más contenido inspirador en esta sección.</p>
            </div>
          ) : (
            <>
              {filteredDevotionals.map(dev => (
                <article key={dev.id} className="devocional-card" onClick={() => navigate(`/devocionales/${dev.slug || dev.id}`)} style={{ cursor: 'pointer' }}>
                  <div className="meta">
                    <span style={{ color: '#2563eb', fontWeight: 600 }}>{getCategoryName(dev.category_id)}</span>
                    <span>•</span>
                    <span>{new Date(dev.created_at).toLocaleDateString()}</span>
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.3 }}>
                    <Link to={`/devocionales/${dev.slug || dev.id}`} style={{ color: '#0f172a', textDecoration: 'none' }} onMouseOver={(e) => e.target.style.color = '#2563eb'} onMouseOut={(e) => e.target.style.color = '#0f172a'}>
                      {dev.title}
                    </Link>
                  </h2>
                  <Link to={`/devocionales/${dev.slug || dev.id}`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem',
                    color: '#2563eb', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none'
                  }} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'}>
                    Leer devocional &rarr;
                  </Link>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                    {dev.author_photo ? (
                      <img src={dev.author_photo} alt={dev.author_name} style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        <BookOpen size={16} />
                      </div>
                    )}
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Autor: {dev.author_name}</span>
                  </div>
                </article>
              ))}
            </>
          )}

          {/* CTA para agregar un devocional */}
          <div style={{
            marginTop: '3rem',
            padding: '2rem',
            background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(37,99,235,0.1) 100%)',
            borderRadius: '1rem',
            border: '1px solid rgba(37,99,235,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1rem'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a', margin: 0 }}>
              ¿Quieres aportar un devocional?
            </h3>
            <p style={{ color: '#334155', maxWidth: '600px', margin: 0, lineHeight: 1.6 }}>
              Si eres pastor, líder o simplemente Dios ha puesto una palabra en tu corazón que deseas compartir con nuestra comunidad, puedes enviarnos tu escrito para ser publicado.
            </p>
            <button onClick={() => navigate('/devocional')} className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.75rem 2rem', fontWeight: 600 }}>
              Escribir Devocional
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
