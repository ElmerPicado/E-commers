import React, { useState, useContext } from 'react';
import { Plus, Trash2, Edit, Save, Video, Image as ImageIcon, BookOpen, Upload } from 'lucide-react';
import { GalleryContext } from '../../context/GalleryContext';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../supabaseClient';

export default function BlogAdmin({ triggerSuccess }) {
  const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost, livestream, updateLivestream } = useContext(GalleryContext);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // History Hero Background Config
  const [historyBgUrl, setHistoryBgUrl] = useState(livestream?.historyBgUrl || '');
  const [historyBgFile, setHistoryBgFile] = useState(null);
  const [isBgUploading, setIsBgUploading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [orderIndex, setOrderIndex] = useState(1);
  const [testimonies, setTestimonies] = useState([]);

  // Sub-form para testimonios
  const [isAddingTestimony, setIsAddingTestimony] = useState(false);
  const [editingTestimonyId, setEditingTestimonyId] = useState(null);
  const [tName, setTName] = useState('');
  const [tRole, setTRole] = useState('');
  const [tPhoto, setTPhoto] = useState('');
  const [tPhotoFile, setTPhotoFile] = useState(null);
  const [tContent, setTContent] = useState('');
  const [tMedia, setTMedia] = useState('');
  const [tMediaFiles, setTMediaFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
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
    setTestimonies([]);
    setIsEditing(false);
    setEditId(null);
    resetTestimonyForm();
  };

  const resetTestimonyForm = () => {
    setIsAddingTestimony(false);
    setEditingTestimonyId(null);
    setTName('');
    setTRole('');
    setTPhoto('');
    setTPhotoFile(null);
    setTContent('');
    setTMedia('');
    setTMediaFiles([]);
  };

  const handleEdit = (post) => {
    setTitle(post.title);
    setContent(post.content);
    setImageUrl(post.image_url || '');
    setVideoUrl(post.video_url || '');
    setOrderIndex(post.order_index || 1);
    setTestimonies(post.testimonies || []);
    setIsEditing(true);
    setEditId(post.id);
  };

  const handleSaveTestimony = async () => {
    if (!tName.trim() || !tContent.trim()) {
      alert("El nombre y el relato son obligatorios.");
      return;
    }
    
    setIsUploading(true);
    let finalPhotoUrl = tPhoto;

    // Upload main photo
    if (tPhotoFile) {
      try {
        const fileExt = tPhotoFile.name.split('.').pop();
        const fileName = `history_${Date.now()}_${Math.floor(Math.random()*1000)}.${fileExt}`;
        const filePath = `history/${fileName}`;
        const { error } = await supabase.storage.from('photos').upload(filePath, tPhotoFile);
        if (!error) {
          const { data } = supabase.storage.from('photos').getPublicUrl(filePath);
          finalPhotoUrl = data.publicUrl;
        }
      } catch (err) {
        console.error("Error uploading photo", err);
      }
    }

    const mediaList = tMedia.split(',').map(s => s.trim()).filter(Boolean);

    // Upload extra media
    if (tMediaFiles && tMediaFiles.length > 0) {
      for (const file of Array.from(tMediaFiles)) {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `history_media_${Date.now()}_${Math.floor(Math.random()*1000)}.${fileExt}`;
          const filePath = `history/${fileName}`;
          const { error } = await supabase.storage.from('photos').upload(filePath, file);
          if (!error) {
            const { data } = supabase.storage.from('photos').getPublicUrl(filePath);
            mediaList.push(data.publicUrl);
          }
        } catch (err) {
          console.error("Error uploading media", err);
        }
      }
    }

    if (editingTestimonyId) {
      setTestimonies(prev => prev.map(t => t.id === editingTestimonyId ? {
        id: editingTestimonyId,
        authorName: tName,
        authorRole: tRole,
        authorPhoto: finalPhotoUrl,
        content: tContent,
        mediaUrls: mediaList
      } : t));
    } else {
      setTestimonies(prev => [...prev, {
        id: `t-${uuidv4()}`,
        authorName: tName,
        authorRole: tRole,
        authorPhoto: finalPhotoUrl,
        content: tContent,
        mediaUrls: mediaList
      }]);
    }
    setIsUploading(false);
    resetTestimonyForm();
  };

  const handleEditTestimony = (t) => {
    setTName(t.authorName || '');
    setTRole(t.authorRole || '');
    setTPhoto(t.authorPhoto || '');
    setTContent(t.content || '');
    setTMedia((t.mediaUrls || []).join(', '));
    setEditingTestimonyId(t.id);
    setIsAddingTestimony(true);
  };

  const handleDeleteTestimony = (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este testimonio?")) {
      setTestimonies(prev => prev.filter(t => t.id !== id));
    }
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
      testimonies: testimonies
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

  const handleUpdateHistoryBg = async () => {
    let finalBgUrl = historyBgUrl;

    if (historyBgFile) {
      setIsBgUploading(true);
      try {
        const fileExt = historyBgFile.name.split('.').pop();
        const fileName = `history_bg_${Date.now()}.${fileExt}`;
        const filePath = `banners/${fileName}`;
        const { error } = await supabase.storage.from('photos').upload(filePath, historyBgFile);
        if (!error) {
          const { data } = supabase.storage.from('photos').getPublicUrl(filePath);
          finalBgUrl = data.publicUrl;
        }
      } catch (err) {
        console.error("Error uploading background", err);
      }
      setIsBgUploading(false);
    }

    await updateLivestream({ ...livestream, historyBgUrl: finalBgUrl });
    setHistoryBgUrl(finalBgUrl);
    setHistoryBgFile(null);
    triggerSuccess('Foto de portada actualizada');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Background Config */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', margin: 0 }}>
          <ImageIcon size={20} style={{ color: 'var(--accent-color)' }} /> 
          Foto de Portada General (Nuestra Historia)
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Esta es la foto de fondo grande que aparece en la parte superior de la página "Nuestra Historia".
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <input 
                type="text" 
                value={historyBgUrl} 
                onChange={(e) => setHistoryBgUrl(e.target.value)}
                style={inputStyle}
                placeholder="URL de la imagen (o sube un archivo)..."
                disabled={historyBgFile !== null}
              />
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setHistoryBgFile(e.target.files[0])} 
                  style={{ ...inputStyle, padding: '0.4rem' }} 
                />
                {historyBgFile && <button type="button" onClick={() => setHistoryBgFile(null)} className="btn btn-danger" style={{ padding: '0.4rem' }}><Trash2 size={16} /></button>}
              </div>
            </div>
            {(historyBgUrl || historyBgFile) && (
              <div style={{ width: '150px', height: '80px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                <img src={historyBgFile ? URL.createObjectURL(historyBgFile) : historyBgUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>
          <div>
            <button type="button" onClick={handleUpdateHistoryBg} disabled={isBgUploading} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
              {isBgUploading ? 'Subiendo...' : 'Guardar Portada'}
            </button>
          </div>
        </div>
      </div>

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

          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-primary)' }}>Personajes / Testimonios en este Bloque</h3>
              {!isAddingTestimony && (
                <button type="button" onClick={() => setIsAddingTestimony(true)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  + Agregar Personaje
                </button>
              )}
            </div>

            {testimonies.length > 0 && !isAddingTestimony && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                {testimonies.map(t => (
                  <div key={t.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {t.authorPhoto ? (
                        <img src={t.authorPhoto} alt={t.authorName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={20} color="var(--text-muted)" />
                        </div>
                      )}
                      <div>
                        <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-primary)' }}>{t.authorName}</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.authorRole}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" onClick={() => handleEditTestimony(t)} className="btn btn-primary" style={{ padding: '0.4rem' }}><Edit size={14} /></button>
                      <button type="button" onClick={() => handleDeleteTestimony(t.id)} className="btn btn-danger" style={{ padding: '0.4rem' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isAddingTestimony && (
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--accent-color)', borderRadius: '0.75rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-color)' }}>{editingTestimonyId ? 'Editar' : 'Nuevo'} Personaje</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Nombre Completo</label>
                    <input type="text" value={tName} onChange={e => setTName(e.target.value)} style={inputStyle} placeholder="Ej. Yamileth Anchia" />
                  </div>
                  <div>
                    <label style={labelStyle}>Cargo / Título</label>
                    <input type="text" value={tRole} onChange={e => setTRole(e.target.value)} style={inputStyle} placeholder="Ej. Pastora, Fundadora..." />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>URL de Foto de Perfil (Opcional)</label>
                    <input type="text" value={tPhoto} onChange={e => setTPhoto(e.target.value)} style={inputStyle} placeholder="https://..." disabled={tPhotoFile !== null} />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginBottom: '0.5rem' }}>O sube un archivo desde tu dispositivo:</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => setTPhotoFile(e.target.files[0])} 
                        style={{ ...inputStyle, padding: '0.4rem' }} 
                      />
                      {tPhotoFile && <button type="button" onClick={() => setTPhotoFile(null)} className="btn btn-danger" style={{ padding: '0.4rem' }}><Trash2 size={16} /></button>}
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Media Adicional (Fotos/Videos extra)</label>
                    <input type="text" value={tMedia} onChange={e => setTMedia(e.target.value)} style={inputStyle} placeholder="URLs de YouTube o fotos separadas por coma" />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginBottom: '0.5rem' }}>O selecciona múltiples fotos para subir:</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input 
                        type="file" 
                        accept="image/*,video/*" 
                        multiple 
                        onChange={e => setTMediaFiles(e.target.files)} 
                        style={{ ...inputStyle, padding: '0.4rem' }} 
                      />
                      {tMediaFiles.length > 0 && <button type="button" onClick={() => setTMediaFiles([])} className="btn btn-danger" style={{ padding: '0.4rem' }}><Trash2 size={16} /></button>}
                    </div>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Relato / Historia</label>
                  <textarea value={tContent} onChange={e => setTContent(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Cuenta la historia desde la perspectiva de esta persona..."></textarea>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={handleSaveTestimony} disabled={isUploading} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                    {isUploading ? 'Subiendo archivos...' : 'Guardar Personaje'}
                  </button>
                  <button type="button" onClick={resetTestimonyForm} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Cancelar</button>
                </div>
              </div>
            )}
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
                  {post.testimonies && post.testimonies.length > 0 && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontWeight: 600 }}>
                        {post.testimonies.length} Personaje(s)
                      </span>
                    </div>
                  )}
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
