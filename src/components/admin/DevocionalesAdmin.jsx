import React, { useState, useContext } from 'react';
import { GalleryContext } from '../../context/GalleryContext';
import { BookOpen, CheckCircle, Clock, XCircle, Edit, Trash2, Plus, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function DevocionalesAdmin({ triggerSuccess }) {
  const { 
    devotionals, 
    devotionalCategories, 
    updateDevotional, 
    deleteDevotional, 
    addDevotionalCategory, 
    deleteDevotionalCategory 
  } = useContext(GalleryContext);

  const [newCatName, setNewCatName] = useState('');
  
  const [editingDevId, setEditingDevId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editVerse, setEditVerse] = useState('');
  const [editPrayer, setEditPrayer] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editStatus, setEditStatus] = useState('pending');
  const [editAuthorName, setEditAuthorName] = useState('');
  const [editAuthorBio, setEditAuthorBio] = useState('');

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

  // Categorías
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    
    await addDevotionalCategory({
      id: `cat-${uuidv4()}`,
      name: newCatName
    });
    
    setNewCatName('');
    triggerSuccess('Categoría creada exitosamente.');
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta categoría? Los devocionales que la tengan asignada quedarán sin categoría.')) {
      await deleteDevotionalCategory(id);
      triggerSuccess('Categoría eliminada.');
    }
  };

  // Devocionales
  const startEditing = (dev) => {
    setEditingDevId(dev.id);
    setEditTitle(dev.title);
    setEditVerse(dev.verse || '');
    setEditContent(dev.content);
    setEditPrayer(dev.prayer || '');
    setEditCategoryId(dev.category_id || '');
    setEditStatus(dev.status || 'pending');
    setEditAuthorName(dev.author_name || '');
    setEditAuthorBio(dev.author_bio || '');
  };

  const cancelEditing = () => {
    setEditingDevId(null);
  };

  const handleUpdateDevotional = async (e, forcedStatus = null) => {
    if (e) e.preventDefault();
    const finalStatus = forcedStatus || editStatus;
    
    await updateDevotional(editingDevId, {
      title: editTitle,
      verse: editVerse,
      content: editContent,
      prayer: editPrayer,
      category_id: editCategoryId || null,
      status: finalStatus,
      author_name: editAuthorName,
      author_bio: editAuthorBio
    });
    setEditingDevId(null);
    
    let msg = 'Devocional actualizado exitosamente.';
    if (forcedStatus === 'published') msg = '¡Devocional publicado exitosamente!';
    if (forcedStatus === 'pending') msg = 'Devocional despublicado y devuelto a pendientes.';
    if (forcedStatus === 'rejected') msg = 'Devocional rechazado.';
    
    triggerSuccess(msg);
  };

  const handleDeleteDevotional = async (id) => {
    if (window.confirm('¿Eliminar devocional permanentemente?')) {
      await deleteDevotional(id);
      triggerSuccess('Devocional eliminado.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* SECCIÓN CATEGORÍAS */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', margin: 0 }}>
          <BookOpen size={20} style={{ color: 'var(--accent-color)' }} /> 
          Categorías de Devocionales
        </h2>

        <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Nueva Categoría</label>
            <input 
              type="text" 
              value={newCatName} 
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Ej. Amor y Gracia"
              style={inputStyle}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={!newCatName.trim()} style={{ padding: '0.65rem 1rem' }}>
            <Plus size={18} /> Agregar
          </button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {(!devotionalCategories || devotionalCategories.length === 0) && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No hay categorías. Agrega una arriba.</p>
          )}
          {(devotionalCategories || []).map(cat => (
            <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.5rem 0.25rem 0.75rem', borderRadius: '2rem', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem' }}>{cat.name}</span>
              <button onClick={() => handleDeleteCategory(cat.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <XCircle size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN DEVOCIONALES ENVIADOS */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', margin: 0 }}>
          <BookOpen size={20} style={{ color: 'var(--accent-color)' }} /> 
          Bandeja de Devocionales
        </h2>

        {(!devotionals || devotionals.length === 0) ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>No hay devocionales enviados aún.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(devotionals || []).map(dev => {
              const isEditing = editingDevId === dev.id;
              
              if (isEditing) {
                return (
                  <form key={dev.id} onSubmit={handleUpdateDevotional} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--accent-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Revisión de Devocional</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginTop: '0.5rem', padding: '1rem', background: 'rgba(0,0,0,0.1)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                      <div>
                        <label style={labelStyle}>Nombre del Autor</label>
                        <input type="text" value={editAuthorName} onChange={e => setEditAuthorName(e.target.value)} style={inputStyle} required />
                      </div>
                      <div>
                        <label style={labelStyle}>Biografía del Autor</label>
                        <textarea value={editAuthorBio} onChange={e => setEditAuthorBio(e.target.value)} style={{ ...inputStyle, minHeight: '60px' }} />
                      </div>
                    </div>
                    
                    <div>
                      <label style={labelStyle}>Título</label>
                      <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} style={inputStyle} required />
                    </div>

                    <div>
                      <label style={labelStyle}>Versículo</label>
                      <textarea value={editVerse} onChange={e => setEditVerse(e.target.value)} style={{ ...inputStyle, minHeight: '90px' }} />
                    </div>

                    <div>
                      <label style={labelStyle}>Contenido</label>
                      <div style={{ background: '#ffffff', borderRadius: '0.5rem', overflow: 'hidden', color: '#000000', border: '1px solid var(--border-color)' }}>
                        <ReactQuill 
                          theme="snow" 
                          value={editContent} 
                          onChange={setEditContent} 
                          style={{ height: '350px', border: 'none' }}
                          modules={{
                            toolbar: [
                              [{ 'header': [1, 2, 3, false] }],
                              ['bold', 'italic', 'underline', 'strike'],
                              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                              ['link', 'clean']
                            ]
                          }}
                        />
                      </div>
                      <style>{`
                        .ql-container {
                          font-size: 1.05rem;
                          font-family: inherit;
                          border-bottom-left-radius: 0.5rem;
                          border-bottom-right-radius: 0.5rem;
                          border: none !important;
                        }
                        .ql-toolbar {
                          border-top-left-radius: 0.5rem;
                          border-top-right-radius: 0.5rem;
                          background: #f8fafc;
                          border: none !important;
                          border-bottom: 1px solid #e2e8f0 !important;
                        }
                        .ql-editor {
                          min-height: 350px;
                        }
                      `}</style>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                      <label style={labelStyle}>Oración</label>
                      <textarea value={editPrayer} onChange={e => setEditPrayer(e.target.value)} style={{ ...inputStyle, minHeight: '120px' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={labelStyle}>Categoría</label>
                        <select value={editCategoryId} onChange={e => setEditCategoryId(e.target.value)} style={inputStyle} required>
                          <option value="" style={{ color: '#0f172a' }}>-- Seleccionar Categoría --</option>
                          {(devotionalCategories || []).map(c => (
                            <option key={c.id} value={c.id} style={{ color: '#0f172a' }}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                      
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {editStatus === 'published' ? (
                          <button type="button" onClick={() => handleUpdateDevotional(null, 'pending')} className="btn" style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '0.65rem 1rem', borderRadius: '0.5rem', fontWeight: 600 }}>
                            Des-publicar
                          </button>
                        ) : (
                          <button type="button" onClick={() => handleUpdateDevotional(null, 'published')} className="btn" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.65rem 1rem', borderRadius: '0.5rem', fontWeight: 600 }}>
                            <CheckCircle size={16} style={{ marginRight: '0.4rem', display: 'inline' }} />
                            Publicar
                          </button>
                        )}
                        <button type="button" onClick={() => handleUpdateDevotional(null, 'rejected')} className="btn" style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '0.65rem 1rem', borderRadius: '0.5rem', fontWeight: 600 }}>
                          Rechazar
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="button" onClick={cancelEditing} className="btn btn-secondary">Cancelar</button>
                        <button type="submit" className="btn btn-primary"><Save size={16} style={{ marginRight: '0.5rem' }} /> Guardar Cambios</button>
                      </div>
                    </div>
                  </form>
                );
              }

              // Vista normal en lista
              let statusColor = '#eab308'; // pending (yellow)
              let statusText = 'Pendiente';
              let StatusIcon = Clock;

              if (dev.status === 'published') {
                statusColor = '#10b981'; // green
                statusText = 'Publicado';
                StatusIcon = CheckCircle;
              } else if (dev.status === 'rejected') {
                statusColor = '#ef4444'; // red
                statusText = 'Rechazado';
                StatusIcon = XCircle;
              }

              const catName = devotionalCategories?.find(c => c.id === dev.category_id)?.name || 'Sin categoría';

              return (
                <div key={dev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: '1 1 300px' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: statusColor, fontSize: '0.75rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: '1rem', border: `1px solid ${statusColor}40`, background: `${statusColor}10` }}>
                        <StatusIcon size={12} /> {statusText}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.5rem', borderRadius: '1rem' }}>
                        {catName}
                      </span>
                    </div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{dev.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Por: <strong>{dev.author_name}</strong> - {new Date(dev.created_at).toLocaleDateString()}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => startEditing(dev)} className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
                      <Edit size={14} style={{ marginRight: '0.3rem' }} /> Revisar
                    </button>
                    <button onClick={() => handleDeleteDevotional(dev.id)} className="btn btn-danger" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
