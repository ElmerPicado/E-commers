import React, { useContext, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { GalleryContext } from '../context/GalleryContext';
import { ArrowLeft, User, Calendar, Tag, Home, BookOpen } from 'lucide-react';
import './Devocionales.css';

export default function DevocionalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { devotionals, devotionalCategories } = useContext(GalleryContext);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const devocional = useMemo(() => {
    return (devotionals || []).find(d => d.id === id && d.status === 'published');
  }, [devotionals, id]);

  const getCategoryName = (catId) => {
    if (!catId) return 'Sin categoría';
    const cat = devotionalCategories?.find(c => c.id === catId);
    return cat ? cat.name : 'Sin categoría';
  };

  const recentDevotionals = useMemo(() => {
    return (devotionals || [])
      .filter(d => d.status === 'published' && d.id !== id)
      .slice(0, 5); // Tomamos 5 devocionales extra
  }, [devotionals, id]);

  if (!devocional) {
    return (
      <div className="devocionales-page" style={{ paddingTop: '120px', textAlign: 'center', minHeight: '60vh' }}>
        <h2>Devocional no encontrado</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Es posible que el devocional haya sido eliminado o no esté publicado.</p>
        <button onClick={() => navigate('/devocionales')} className="btn btn-primary">Volver a Devocionales</button>
      </div>
    );
  }

  return (
    <div className="devocionales-page" style={{ paddingTop: '100px' }}>
      <div className="devocional-detail-layout">
        
        {/* Left Sidebar (Other Devotionals) */}
        <aside className="devocional-left-sidebar" style={{ position: 'sticky', top: '100px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            Últimos Devocionales
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {recentDevotionals.length > 0 ? (
              recentDevotionals.map(dev => (
                <div key={dev.id} onClick={() => navigate(`/devocionales/${dev.id}`)} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} className="recent-dev-card">
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', margin: '0 0 0.25rem 0', lineHeight: 1.4 }}>
                    {dev.title}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    Por {dev.author_name}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No hay otros devocionales publicados aún.</p>
            )}
          </div>
        </aside>

        {/* Main Content (Middle) */}
        <div className="devocional-main detail-main-column" style={{ background: '#f8fafc', padding: '2.5rem', borderRadius: '1rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#334155', margin: 0 }}>Devocional diario</h1>
            <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.5rem' }}>Un devocional diario para fortalecer tu relación con Dios.</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#334155', margin: 0 }}>Devocional de Hoy</h2>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
              {new Date(devocional.created_at).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              <span style={{ margin: '0 0.5rem' }}>•</span>
              <span style={{ color: '#d97706' }}>{getCategoryName(devocional.category_id)}</span>
            </div>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', marginBottom: '1.5rem', lineHeight: 1.2 }}>
            {devocional.title}
          </h1>

          {devocional.verse && (
            <div style={{ background: '#f8fafc', padding: '1.5rem 2rem', borderRadius: '0.5rem', marginBottom: '2.5rem', color: '#334155', fontSize: '1.1rem', lineHeight: 1.6 }}>
              {devocional.verse.split('\n').map((line, i) => <p key={i} style={{ margin: i === 0 ? 0 : '0.5rem 0 0 0' }}>{line}</p>)}
            </div>
          )}

          <div 
            className="devocional-content-body" 
            style={{ minHeight: '30vh', marginBottom: '3rem', maxWidth: '800px' }}
            dangerouslySetInnerHTML={{ __html: (devocional.content || '').replace(/&nbsp;/g, ' ') }}
          />

          {devocional.prayer && (
            <div style={{ background: 'rgba(37, 99, 235, 0.05)', border: '1px dashed rgba(37, 99, 235, 0.3)', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '3rem' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: '#1e3a8a', marginTop: 0, marginBottom: '1rem' }}>
                <BookOpen size={18} /> Oración Final
              </h4>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#334155', lineHeight: 1.6, fontStyle: 'italic' }}>
                {devocional.prayer}
              </p>
            </div>
          )}

          {/* PAUTA / CTA de IMR4 */}
          <div style={{
            marginTop: '3rem',
            padding: '1.25rem 1.5rem',
            background: '#ffffff',
            borderLeft: '4px solid #3b82f6',
            borderRadius: '0 0.5rem 0.5rem 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left',
            gap: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a', margin: 0 }}>
              Iglesia Ministerio Restauración 4
            </h3>
            <p style={{ color: '#475569', maxWidth: '100%', margin: 0, lineHeight: 1.5, fontSize: '0.9rem' }}>
              Este devocional ha sido compartido a través de nuestra plataforma. Te invitamos a conocer más de nuestra iglesia y descubrir más recursos espirituales.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              <Link to="/" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                background: '#2563eb', color: 'white', padding: '0.5rem 1rem', fontSize: '0.85rem',
                borderRadius: '0.5rem', fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s'
              }} onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'} onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}>
                <Home size={14} /> Visitar Sitio
              </Link>
              <Link to="/devocionales" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                background: 'white', color: '#2563eb', padding: '0.5rem 1rem', border: '1px solid #bfdbfe', fontSize: '0.85rem',
                borderRadius: '0.5rem', fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s'
              }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                <BookOpen size={14} /> Más Devocionales
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar (Right) */}
        <aside className="devocional-sidebar">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            Sobre el Autor
          </h3>
          <div className="author-sidebar-box" style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            {devocional.author_photo ? (
              <img src={devocional.author_photo} alt={devocional.author_name} className="author-photo" />
            ) : (
              <div className="author-photo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', color: '#94a3b8' }}>
                <BookOpen size={48} />
              </div>
            )}
            <div className="author-info">
              <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Escrito por</span>
              <h4 style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>{devocional.author_name}</h4>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{devocional.author_bio}</p>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
