import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { GalleryContext } from '../context/GalleryContext';
import { ArrowLeft, User, Calendar, Tag, Home, BookOpen, Sun, Moon, MessageCircle, Send, ChevronDown, ChevronUp } from 'lucide-react';
import './Devocionales.css';

export default function DevocionalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { devotionals, devotionalCategories, devotionalComments, addDevotionalComment } = useContext(GalleryContext);
  const [isLightMode, setIsLightMode] = useState(true);
  
  // Collapsible Sidebar Sections
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(window.innerWidth > 900);
  const [isRecentExpanded, setIsRecentExpanded] = useState(window.innerWidth > 900);

  // Comentarios state
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const devocional = useMemo(() => {
    return (devotionals || []).find(d => (d.id === id || d.slug === id) && d.status === 'published');
  }, [devotionals, id]);

  const getCategoryName = (catId) => {
    if (!catId) return 'Sin categoría';
    const cat = devotionalCategories?.find(c => c.id === catId);
    return cat ? cat.name : 'Sin categoría';
  };

  const recentDevotionals = useMemo(() => {
    return (devotionals || [])
      .filter(d => d.status === 'published' && d.id !== devocional?.id)
      .slice(0, 5); // Tomamos 5 devocionales extra
  }, [devotionals, devocional]);

  if (!devocional) {
    return (
      <div className="devocionales-page" style={{ paddingTop: '120px', textAlign: 'center', minHeight: '60vh' }}>
        <h2>Devocional no encontrado</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Es posible que el devocional haya sido eliminado o no esté publicado.</p>
        <button onClick={() => navigate('/devocionales')} className="btn btn-primary">Volver a Devocionales</button>
      </div>
    );
  }

  const devocionalCommentsList = (devotionalComments || []).filter(c => c.devotional_id === devocional.id);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentText.trim()) return;
    setIsSubmittingComment(true);
    const success = await addDevotionalComment({
      devotional_id: devocional.id,
      author_name: newCommentName,
      content: newCommentText
    });
    if (success) {
      setNewCommentName('');
      setNewCommentText('');
    }
    setIsSubmittingComment(false);
  };

  return (
    <div className={`devocionales-page ${!isLightMode ? 'dark' : ''}`} style={{ paddingTop: '100px' }}>
      
      {/* Floating Theme Toggle */}
      <button 
        onClick={() => setIsLightMode(!isLightMode)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 50,
          background: '#d97706',
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

      <div className="devocional-detail-layout">
        
        {/* Left Sidebar (Categories + Other Devotionals) */}
        <aside className="devocional-left-sidebar" style={{ position: 'sticky', top: '100px' }}>
          
          <div className="categories-sidebar" style={{ position: 'static', marginBottom: '1.5rem' }}>
            <h3 
              onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
              className="sidebar-accordion-header"
            >
              Categorías
              {isCategoriesExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </h3>
            {isCategoriesExpanded && (
              <div className="sidebar-accordion-content">
                <div 
                  className="category-item"
                  onClick={() => navigate('/devocionales')}
                >
                  Todos los temas
                </div>
                {(devotionalCategories || []).map(cat => (
                  <div 
                    key={cat.id}
                    className="category-item"
                    onClick={() => navigate('/devocionales')}
                  >
                    {cat.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <h3 
            onClick={() => setIsRecentExpanded(!isRecentExpanded)}
            className="sidebar-accordion-header authors-header"
          >
            Últimos Devocionales
            {isRecentExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </h3>
          {isRecentExpanded && (
            <div className="sidebar-accordion-content" style={{ gap: '1.25rem' }}>
              {recentDevotionals.length > 0 ? (
                recentDevotionals.map(dev => (
                  <div key={dev.id} onClick={() => navigate(`/devocionales/${dev.slug || dev.id}`)} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} className="recent-dev-card">
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem 0', lineHeight: 1.4 }}>
                      {dev.title}
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                      Autor: {dev.author_name}
                    </p>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No hay otros devocionales publicados aún.</p>
              )}
            </div>
          )}
        </aside>

        {/* Main Content (Middle) */}
        <div className="devocional-main detail-main-column" style={{ background: 'var(--card-bg)', padding: '2.5rem', borderRadius: '1rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Devocional diario</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem' }}>Un devocional diario para fortalecer tu relación con Dios.</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Devocional de Hoy</h2>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
              {new Date(devocional.created_at).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              <span style={{ margin: '0 0.5rem' }}>•</span>
              <span style={{ color: 'var(--accent-color)' }}>{getCategoryName(devocional.category_id)}</span>
            </div>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '1.5rem', lineHeight: 1.2 }}>
            {devocional.title}
          </h1>

          {devocional.verse && (
            <div className="devocional-verse-box">
              {devocional.verse.split('\n').map((line, i) => <p key={i} style={{ margin: i === 0 ? 0 : '0.5rem 0 0 0' }}>{line}</p>)}
            </div>
          )}

          <div 
            className="devocional-content-body" 
            style={{ minHeight: '30vh', marginBottom: '3rem', maxWidth: '800px' }}
            dangerouslySetInnerHTML={{ __html: (devocional.content || '').replace(/&nbsp;/g, ' ') }}
          />

          {devocional.prayer && (
            <div style={{ background: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '3rem' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: 0, marginBottom: '1rem' }}>
                <BookOpen size={18} /> Oración Final
              </h4>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                {devocional.prayer}
              </p>
            </div>
          )}

          {/* Sección de Comentarios */}
          <div style={{ marginTop: '4rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              <MessageCircle size={22} style={{ color: 'var(--accent-color)' }} /> Comentarios ({devocionalCommentsList.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {devocionalCommentsList.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No hay comentarios aún. ¡Sé el primero en comentar!</p>
              ) : (
                devocionalCommentsList.map(c => (
                  <div key={c.id} style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.author_name}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: 1.5 }}>{c.content}</p>
                  </div>
                ))
              )}
            </div>

            <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Deja un comentario</h4>
              <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <input 
                    type="text" 
                    value={newCommentName} 
                    onChange={e => setNewCommentName(e.target.value)} 
                    placeholder="Tu Nombre" 
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <textarea 
                    value={newCommentText} 
                    onChange={e => setNewCommentText(e.target.value)} 
                    placeholder="Escribe tu comentario o testimonio aquí..." 
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>
                <button type="submit" disabled={isSubmittingComment} className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem' }}>
                  {isSubmittingComment ? 'Enviando...' : <><Send size={16} /> Enviar Comentario</>}
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Sidebar (Right) */}
        <aside className="devocional-sidebar">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            Sobre el Autor
          </h3>
          <div className="author-sidebar-box" style={{ padding: '1.5rem', background: 'var(--card-bg)', borderRadius: '1rem', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            {devocional.author_photo ? (
              <img src={devocional.author_photo} alt={devocional.author_name} className="author-photo" style={{ width: '120px', height: '160px', borderRadius: '0.75rem', objectFit: 'cover', margin: '0 auto 1rem auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
            ) : (
              <div style={{ width: '120px', height: '160px', borderRadius: '0.75rem', background: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', margin: '0 auto 1rem auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <BookOpen size={48} />
              </div>
            )}
            <div className="author-info">
              <h4 style={{ color: 'var(--text-primary)' }}>{devocional.author_name}</h4>
              {devocional.author_role && <p style={{ color: 'var(--accent-color)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>{devocional.author_role}</p>}
              <p style={{ color: 'var(--text-secondary)' }}>{devocional.author_bio || "Escritor(a) de la comunidad de IMR4."}</p>
            </div>
          </div>
        </aside>

      </div>

      {/* PAUTA / CTA de IMR4 (Fuera del devocional, al final) */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto 4rem auto',
        paddingTop: '3rem',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '0.75rem',
        padding: '2rem'
      }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e3a8a', margin: 0 }}>
          Iglesia Metodista Río Cuarto
        </h3>
        <p style={{ color: '#475569', margin: 0, lineHeight: 1.6, fontSize: '1rem' }}>
          Este devocional ha sido compartido a través de nuestra plataforma. Te invitamos a conocer más de nuestra iglesia y descubrir más recursos espirituales.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            color: '#2563eb', fontWeight: 600, textDecoration: 'none'
          }} onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}>
            <Home size={18} /> Visitar Sitio
          </Link>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <Link to="/devocionales" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            color: '#2563eb', fontWeight: 600, textDecoration: 'none'
          }} onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}>
            <BookOpen size={18} /> Más Devocionales
          </Link>
        </div>
      </div>
    </div>
  );
}
