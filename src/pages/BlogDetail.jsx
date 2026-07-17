import React, { useContext, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GalleryContext } from '../context/GalleryContext';
import { Calendar, ArrowLeft, Share2 } from 'lucide-react';

export default function BlogDetail() {
  const { id } = useParams();
  const { blogPosts } = useContext(GalleryContext);

  const blog = blogPosts.find(b => b.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!blog) {
    return (
      <div className="theme-imr4" style={{ minHeight: '100vh', padding: '10rem 2rem', textAlign: 'center' }}>
        <h2 style={{ color: '#fff' }}>Artículo no encontrado</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Volver al Inicio</Link>
      </div>
    );
  }

  return (
    <div className="theme-imr4" style={{ minHeight: '100vh', padding: '8rem 1.5rem', background: 'var(--bg-base)' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '2rem', textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Volver al Inicio
        </Link>

        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', background: 'var(--bg-surface)' }}>
          {/* Header Image */}
          {blog.image_url && (
            <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', position: 'relative' }}>
              <img src={blog.image_url} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {/* Content */}
          <div style={{ padding: '3rem 2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              {blog.category && (
                <span style={{
                  background: 'rgba(59, 130, 246, 0.12)',
                  color: '#60a5fa',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '0.4rem 1rem',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {blog.category}
                </span>
              )}
              
              <button 
                onClick={() => {
                  const shareUrl = window.location.href;
                  if (navigator.share) {
                    navigator.share({
                      title: blog.title,
                      text: '¡Mira este blog!',
                      url: shareUrl
                    }).catch(err => console.log('Error compartiendo:', err));
                  } else {
                    navigator.clipboard.writeText(shareUrl);
                    alert('¡Enlace copiado al portapapeles!');
                  }
                }}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginLeft: 'auto' }}
                title="Copiar Enlace"
              >
                <Share2 size={16} /> Compartir
              </button>
            </div>

            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>
              {blog.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <Calendar size={16} /> 
              {new Date(blog.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>

            <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
              {blog.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
