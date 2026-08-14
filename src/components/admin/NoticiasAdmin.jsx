import React, { useState, useContext, useMemo } from 'react';
import { GalleryContext } from '../../context/GalleryContext';
import { supabase, isSupabaseConfigured } from '../../supabaseClient';
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  Globe,
  ExternalLink,
  Calendar,
  Image as ImageIcon,
  FileText,
  Upload,
  X,
  Search,
  CheckCircle,
  Tag
} from 'lucide-react';
import ImageUploadDropzone from './ImageUploadDropzone';
import { v4 as uuidv4 } from 'uuid';

export default function NoticiasAdmin({ triggerSuccess }) {
  const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost } = useContext(GalleryContext);

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Noticias');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [externalLink, setExternalLink] = useState('');
  const [orderIndex, setOrderIndex] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  const imagePreview = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    return imageUrl || null;
  }, [imageFile, imageUrl]);

  const inputStyle = {
    padding: '0.65rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--border-color)',
    background: 'rgba(255, 255, 255, 0.04)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none'
  };

  const labelStyle = {
    fontSize: '0.8rem',
    fontWeight: 600,
    marginBottom: '0.35rem',
    display: 'block',
    color: 'var(--text-primary)'
  };

  const resetForm = () => {
    setTitle('');
    setCategory('Noticias');
    setDate(new Date().toISOString().split('T')[0]);
    setContent('');
    setImageUrl('');
    setImageFile(null);
    setExternalLink('');
    setOrderIndex(blogPosts?.length > 0 ? Math.max(...blogPosts.map(p => p.order_index || 0)) + 1 : 1);
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (post) => {
    setIsEditing(true);
    setEditId(post.id);
    setTitle(post.title || '');
    setCategory(post.category || 'Noticias');
    setDate(post.created_at ? new Date(post.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setContent(post.content || post.description || '');
    setImageUrl(post.image_url || '');
    setImageFile(null);
    setExternalLink(post.external_link || '');
    setOrderIndex(post.order_index || 1);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('El título y la descripción son obligatorios.');
      return;
    }

    setIsUploading(true);
    let finalImageUrl = imageUrl;

    if (imageFile && isSupabaseConfigured) {
      try {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `news_${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const filePath = `news/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
        finalImageUrl = publicUrl;
      } catch (err) {
        console.error('Error al subir imagen de noticia:', err);
        alert('Ocurrió un error al subir la imagen. Se intentará guardar sin cambiar la imagen.');
      }
    }

    const postData = {
      title: title.trim(),
      category: category.trim(),
      content: content.trim(),
      image_url: finalImageUrl,
      external_link: externalLink.trim() || null,
      created_at: new Date(date).toISOString(),
      order_index: parseInt(orderIndex, 10) || 1
    };

    try {
      if (isEditing && editId) {
        await updateBlogPost(editId, postData);
        if (triggerSuccess) triggerSuccess('Noticia / Novedad actualizada exitosamente.');
      } else {
        const newPost = {
          ...postData,
          id: `news-${uuidv4()}`
        };
        await addBlogPost(newPost);
        if (triggerSuccess) triggerSuccess('Noticia / Novedad creada exitosamente.');
      }
      resetForm();
    } catch (err) {
      console.error('Error guardando noticia:', err);
      alert('Error al guardar la noticia en la base de datos.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta noticia/novedad?')) {
      await deleteBlogPost(id);
      if (triggerSuccess) triggerSuccess('Noticia / Novedad eliminada.');
    }
  };

  // Filtrar noticias para lista
  const newsList = useMemo(() => {
    return (blogPosts || []).filter(post => {
      // Excluir bloques específicos de historia que no son noticias generales si tienen categoria 'historia' estricta
      const isHistoryOnly = post.category === 'historia' && post.testimonies && post.testimonies.length > 0;
      if (isHistoryOnly) return false;

      const matchSearch = (post.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (post.content || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategoryFilter === 'all' || post.category === selectedCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [blogPosts, searchTerm, selectedCategoryFilter]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Sección */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Globe size={24} style={{ color: 'var(--accent-color)' }} /> Noticias y Novedades
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.35rem 0 0 0' }}>
            Administra artículos, publicaciones generales y enlaces externos a noticias para la congregación.
          </p>
        </div>
        {isEditing && (
          <button onClick={resetForm} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <X size={16} /> Cancelar Edición
          </button>
        )}
      </div>

      {/* Formulario Crear / Editar */}
      <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isEditing ? <Edit2 size={18} style={{ color: 'var(--accent-color)' }} /> : <Plus size={18} style={{ color: 'var(--accent-color)' }} />}
          {isEditing ? 'Editar Noticia / Novedad' : 'Publicar Nueva Noticia o Novedad'}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Título de la Noticia *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Gran Conferencia de Familias 2026"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Categoría / Etiqueta</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ ...inputStyle, background: 'rgba(18, 18, 22, 0.95)' }}
            >
              <option value="Noticias">Noticias</option>
              <option value="Novedades">Novedades</option>
              <option value="Anuncio">Anuncio Especial</option>
              <option value="Evento">Evento Destacado</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Fecha de Publicación *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Enlace Externo */}
        <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
          <label style={{ ...labelStyle, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ExternalLink size={16} /> Enlace Externo Opional (Link de artículo externo, sitio web o PDF)
          </label>
          <input
            type="url"
            value={externalLink}
            onChange={(e) => setExternalLink(e.target.value)}
            placeholder="https://ejemplo.com/noticia-completa"
            style={inputStyle}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>
            Si agregas un enlace externo, al hacer clic en "Leer noticia" en la página principal se redirigirá directamente al enlace.
          </span>
        </div>

        {/* Descripción / Contenido */}
        <div>
          <label style={labelStyle}>Descripción / Contenido *</label>
          <textarea
            required
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe el detalle de la noticia o actualización..."
            style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
          />
        </div>

        {/* Imagen Destacada */}
        <div>
          <label style={labelStyle}>Imagen Destacada (Portada)</label>
          <ImageUploadDropzone
            onFileSelect={(file) => setImageFile(file)}
            currentImageUrl={imagePreview}
            onClearImage={() => { setImageFile(null); setImageUrl(''); }}
          />
          <div style={{ marginTop: '0.5rem' }}>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="O pega la URL directa de la imagen (https://...)"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Botones del Formulario */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          {isEditing && (
            <button type="button" onClick={resetForm} className="btn btn-secondary">
              Cancelar
            </button>
          )}
          <button type="submit" disabled={isUploading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={16} /> {isUploading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Publicar Noticia')}
          </button>
        </div>
      </form>

      {/* Lista de Noticias Existentes */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} style={{ color: 'var(--accent-color)' }} /> Noticias Publicadas ({newsList.length})
          </h3>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', width: '100%', maxWidth: '400px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Buscar noticia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '2.2rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        {newsList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Globe size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>No se encontraron noticias registradas.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {newsList.map((post) => (
              <div key={post.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                
                {/* Image header */}
                {post.image_url && (
                  <div style={{ height: '160px', width: '100%', position: 'relative', background: '#000' }}>
                    <img src={post.image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {post.external_link && (
                      <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(59, 130, 246, 0.9)', color: '#fff', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                        <ExternalLink size={12} /> Link Externo
                      </span>
                    )}
                  </div>
                )}

                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ background: 'rgba(217, 119, 6, 0.15)', color: 'var(--accent-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                      {post.category || 'Noticias'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={12} />
                      {new Date(post.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>

                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
                    {post.title}
                  </h4>

                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                    {post.content || post.description}
                  </p>

                  {post.external_link && (
                    <a href={post.external_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#60a5fa', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}>
                      <ExternalLink size={12} /> {post.external_link}
                    </a>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <button onClick={() => handleEdit(post)} className="btn btn-secondary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                      <Edit2 size={14} /> Editar
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="btn btn-danger" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
