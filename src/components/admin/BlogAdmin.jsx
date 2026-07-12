import React, { useState, useContext } from 'react';
import { Plus, Trash2, Edit, Save, Video, Image as ImageIcon, BookOpen } from 'lucide-react';
import { GalleryContext } from '../../context/GalleryContext';
import { v4 as uuidv4 } from 'uuid';

export default function BlogAdmin({ triggerSuccess }) {
  const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost } = useContext(GalleryContext);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [orderIndex, setOrderIndex] = useState(1);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const inputStyle = {
    padding: '0.65rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--border-color)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    width: '100%',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    fontSize: '0.8rem',
    fontWeight: 600,
    marginBottom: '0.35rem',
    display: 'block'
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setImageUrl('');
    setVideoUrl('');
    setOrderIndex(blogPosts?.length > 0 ? Math.max(...blogPosts.map(p => p.order_index || 0)) + 1 : 1);
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (post) => {
    setTitle(post.title);
    setContent(post.content);
    setImageUrl(post.image_url || '');
    setVideoUrl(post.video_url || '');
    setOrderIndex(post.order_index || 1);
    setIsEditing(true);
    setEditId(post.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const postData = {
      title,
      content,
      image_url: imageUrl,
      video_url: videoUrl,
      category: 'historia',
      order_index: parseInt(orderIndex, 10) || 1,
    };

    if (isEditing) {
      await updateBlogPost(editId, postData);
      triggerSuccess('Bloque actualizado correctamente');
    } else {
      postData.id = `blog-${uuidv4()}`;
      postData.created_at = new Date().toISOString();
      await addBlogPost(postData);
      triggerSuccess('Bloque creado correctamente');
    }
    
    resetForm();
  };

  const handleDelete = async (id) => {
    await deleteBlogPost(id);
    setShowDeleteConfirm(null);
    triggerSuccess('Bloque eliminado');
  };

  // Filtrar solo los que sean de historia (por si quedan otros residuales)
  const historyPosts = (blogPosts || []).filter(post => !post.category || post.category === 'historia');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', margin: 0 }}>
          <BookOpen size={20} style={{ color: 'var(--accent-color)' }} /> 
          {isEditing ? 'Editar Bloque de Historia' : 'Crear Nuevo Bloque de Historia'}
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Título del bloque</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              required
              style={inputStyle}
              placeholder="Ej. Nuestros Inicios, El primer pastor..."
            />
          </div>

          <div>
            <label style={labelStyle}>Contenido (Texto principal)</label>
            <textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
              placeholder="Escribe la historia o descripción de este bloque aquí..."
            ></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>URL de Imagen (Opcional)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <ImageIcon size={18} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  value={imageUrl} 
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '2.2rem' }}
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <div>
              <label style={labelStyle}>URL de Video de YouTube (Opcional)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Video size={18} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  value={videoUrl} 
                  onChange={(e) => setVideoUrl(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '2.2rem' }}
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Usa el formato /embed/ para YouTube.</p>
            </div>
          </div>
          
          <div style={{ width: '150px' }}>
            <label style={labelStyle}>Orden en la línea de tiempo</label>
            <input 
              type="number" 
              value={orderIndex} 
              onChange={(e) => setOrderIndex(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
            {isEditing && (
              <button 
                type="button" 
                onClick={resetForm}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            )}
            <button 
              type="submit"
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {isEditing ? <Save size={16} /> : <Plus size={16} />}
              {isEditing ? 'Guardar Cambios' : 'Añadir a Historia'}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', margin: 0 }}>Bloques de Nuestra Historia</h3>
        
        {historyPosts.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>No hay bloques creados aún en tu historia.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {historyPosts.map((post) => (
              <div key={post.id} style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '1rem', 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '0.5rem',
                gap: '1rem'
              }}>
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                      Orden: {post.order_index}
                    </span>
                  </div>
                  <h4 style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>{post.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {post.content}
                  </p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handleEdit(post)}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem' }}
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  
                  {showDeleteConfirm === post.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.35rem', padding: '0.25rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                      <span style={{ fontSize: '0.8rem', color: '#ef4444', padding: '0 0.5rem', fontWeight: 600 }}>¿Eliminar?</span>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', minHeight: 'auto' }}
                      >
                        Sí
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(null)}
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', marginLeft: '0.25rem', minHeight: 'auto' }}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setShowDeleteConfirm(post.id)}
                      className="btn btn-danger"
                      style={{ padding: '0.5rem' }}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
