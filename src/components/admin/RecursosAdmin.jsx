import React, { useContext, useState, useRef } from 'react';
import { GalleryContext } from '../../context/GalleryContext';
import { Plus, Trash2, Edit, FileText, Video, Link as LinkIcon, Upload, Image } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../supabaseClient';
import ImageUploadDropzone from './ImageUploadDropzone';

export default function RecursosAdmin({ triggerSuccess }) {
  const {
    resourceCategories,
    resources,
    addResourceCategory,
    deleteResourceCategory,
    addResource,
    updateResource,
    deleteResource,
    livestream,
    updateLivestream
  } = useContext(GalleryContext);

  const [bgUrl, setBgUrl] = useState('');
  const [bgFile, setBgFile] = useState(null);
  const [isBgUploading, setIsBgUploading] = useState(false);

  React.useEffect(() => {
    if (livestream?.resourcesBgUrl) setBgUrl(livestream.resourcesBgUrl);
  }, [livestream?.resourcesBgUrl]);

  const handleSaveBg = async () => {
    let finalUrl = bgUrl;
    if (bgFile && isSupabaseConfigured) {
      setIsBgUploading(true);
      try {
        const fileExt = bgFile.name.split('.').pop();
        const fileName = `resources_bg_${Date.now()}.${fileExt}`;
        const filePath = `banners/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, bgFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
        finalUrl = publicUrl;
      } catch (e) {
        alert('Error al subir imagen');
        setIsBgUploading(false);
        return;
      }
    }
    await updateLivestream({ ...livestream, resourcesBgUrl: finalUrl });
    setBgFile(null);
    setBgUrl(finalUrl);
    setIsBgUploading(false);
    triggerSuccess('Fondo de Biblioteca actualizado exitosamente.');
  };

  // Category State
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [isCreatingCat, setIsCreatingCat] = useState(false);

  // Resource State
  const [resAction, setResAction] = useState('create');
  const [editingResId, setEditingResId] = useState('');
  
  const [resTitle, setResTitle] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resCategoryId, setResCategoryId] = useState('');
  const [resType, setResType] = useState('document'); // document, video, link
  const [resFile, setResFile] = useState(null);
  const [resExternalUrl, setResExternalUrl] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setIsCreatingCat(true);
    const res = await addResourceCategory({ name: catName, description: catDesc });
    if (res.success) {
      triggerSuccess('Categoría creada exitosamente.');
      setCatName('');
      setCatDesc('');
    } else {
      alert(res.error || 'Error al crear la categoría.');
    }
    setIsCreatingCat(false);
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('¿Eliminar esta categoría? Los recursos asociados quedarán sin categoría.')) {
      await deleteResourceCategory(id);
      triggerSuccess('Categoría eliminada.');
    }
  };

  const loadResourceData = (id) => {
    const resource = resources.find(r => r.id === id);
    if (resource) {
      setResAction('edit');
      setEditingResId(resource.id);
      setResTitle(resource.title);
      setResDesc(resource.description || '');
      setResCategoryId(resource.category_id || '');
      setResType(resource.type);
      setResExternalUrl(resource.file_url || '');
      setResFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const resetResourceForm = () => {
    setResAction('create');
    setEditingResId('');
    setResTitle('');
    setResDesc('');
    setResCategoryId(resourceCategories[0]?.id || '');
    setResType('document');
    setResExternalUrl('');
    setResFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveResource = async (e) => {
    e.preventDefault();
    if (!resTitle || !resCategoryId) {
      alert("El título y la categoría son obligatorios.");
      return;
    }

    let finalUrl = resExternalUrl;

    if (resType === 'document' && resFile && isSupabaseConfigured) {
      setIsUploading(true);
      try {
        const fileExt = resFile.name.split('.').pop();
        const fileName = `${Date.now()}_${resFile.name.replace(/\s+/g, '_')}`;
        const filePath = `documents/${fileName}`;

        // Asume que el usuario ha creado un bucket llamado 'resources'
        const { error: uploadError } = await supabase.storage.from('resources').upload(filePath, resFile);
        
        if (uploadError) {
          console.error("Upload error details:", uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage.from('resources').getPublicUrl(filePath);
        finalUrl = publicUrl;
      } catch (err) {
        console.error('Error al subir el archivo:', err);
        alert('Error al subir el archivo. Verifica que exista el bucket "resources" en Supabase y tenga permisos públicos.');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    } else if (resType === 'document' && !resFile && resAction === 'create') {
      alert("Debes seleccionar un archivo para subir.");
      return;
    }

    const payload = {
      title: resTitle,
      description: resDesc,
      category_id: resCategoryId,
      type: resType,
      file_url: finalUrl
    };

    if (resAction === 'create') {
      const res = await addResource(payload);
      if (res.success) {
        triggerSuccess('Recurso añadido a la biblioteca.');
        resetResourceForm();
      } else {
        alert(res.error || 'Error al guardar el recurso.');
      }
    } else {
      await updateResource(editingResId, payload);
      triggerSuccess('Recurso actualizado.');
      resetResourceForm();
    }
  };

  const handleDeleteResource = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este recurso de la biblioteca?')) {
      await deleteResource(id);
      triggerSuccess('Recurso eliminado.');
      if (editingResId === id) resetResourceForm();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* SECCIÓN FONDO DE PANTALLA */}
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '0.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Image size={18} style={{ color: 'var(--accent-color)' }} /> Imagen de Portada (Biblioteca)
        </h3>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {isSupabaseConfigured ? (
              <ImageUploadDropzone 
                onFileSelect={(file) => setBgFile(file)} 
                previewUrl={bgFile ? URL.createObjectURL(bgFile) : bgUrl} 
                label="Subir Imagen de Portada" 
                size="large"
              />
            ) : (
              <>
                <input type="text" placeholder="URL de la imagen" value={bgUrl} onChange={(e) => setBgUrl(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.35rem', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', width: '100%' }} />
                {(bgUrl) && (
                  <div style={{ width: '250px', height: '100px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <img src={bgUrl} alt="Fondo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </>
            )}
            <button type="button" onClick={handleSaveBg} disabled={isBgUploading} className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem' }}>
              {isBgUploading ? 'Subiendo...' : 'Guardar Imagen'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }} className="grid-cols-2">
        
        {/* PANEL IZQUIERDO: CATEGORÍAS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Categorías de Recursos
            </h3>
            
            <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                placeholder="Nombre de categoría" 
                value={catName} 
                onChange={e => setCatName(e.target.value)} 
                required
                style={inputStyle}
              />
              <textarea 
                placeholder="Breve descripción (opcional)" 
                value={catDesc} 
                onChange={e => setCatDesc(e.target.value)}
                style={{ ...inputStyle, minHeight: '60px' }}
              />
              <button type="submit" disabled={isCreatingCat} className="btn btn-primary" style={{ padding: '0.5rem' }}>
                {isCreatingCat ? 'Guardando...' : 'Añadir Categoría'}
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {resourceCategories.map(cat => (
                <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{cat.name}</h4>
                    {cat.description && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{cat.description}</p>}
                  </div>
                  <button type="button" onClick={() => handleDeleteCategory(cat.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {resourceCategories.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No hay categorías aún.</p>}
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: GESTIÓN DE RECURSOS */}
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              {resAction === 'create' ? 'Subir Nuevo Recurso' : 'Editar Recurso'}
            </h3>
            {resAction === 'edit' && (
              <button type="button" onClick={resetResourceForm} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>
                Cancelar Edición
              </button>
            )}
          </div>

          <form onSubmit={handleSaveResource} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={labelStyle}>Título del Recurso</label>
                <input type="text" value={resTitle} onChange={e => setResTitle(e.target.value)} required style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={labelStyle}>Categoría</label>
                <select value={resCategoryId} onChange={e => setResCategoryId(e.target.value)} required style={selectStyle}>
                  <option value="">Selecciona...</option>
                  {resourceCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={labelStyle}>Descripción breve</label>
              <textarea value={resDesc} onChange={e => setResDesc(e.target.value)} style={{ ...inputStyle, minHeight: '60px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
              <label style={{ ...labelStyle, fontSize: '0.9rem' }}>Tipo de Contenido</label>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="radio" checked={resType === 'document'} onChange={() => setResType('document')} />
                  <FileText size={16} /> Documento (PDF, Doc, etc)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="radio" checked={resType === 'video'} onChange={() => setResType('video')} />
                  <Video size={16} /> Video de YouTube
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="radio" checked={resType === 'link'} onChange={() => setResType('link')} />
                  <LinkIcon size={16} /> Enlace Externo
                </label>
              </div>

              {resType === 'document' ? (
                <div style={{ marginTop: '0.5rem' }}>
                  <label style={labelStyle}>Subir Archivo {resAction === 'edit' && resExternalUrl && '(Deja en blanco para conservar el actual)'}</label>
                  <ImageUploadDropzone 
                    onFileSelect={(file) => setResFile(file)} 
                    previewUrl={null} 
                    label={resFile ? resFile.name : "Subir Documento (PDF, Doc, etc)"} 
                    accept="*/*"
                  />
                  {resAction === 'edit' && resExternalUrl && (
                    <a href={resExternalUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-color)' }}>Ver archivo actual</a>
                  )}
                </div>
              ) : (
                <div style={{ marginTop: '0.5rem' }}>
                  <label style={labelStyle}>URL del {resType === 'video' ? 'Video' : 'Enlace'}</label>
                  <input type="url" value={resExternalUrl} onChange={e => setResExternalUrl(e.target.value)} required={resAction === 'create' || resType !== 'document'} placeholder="https://..." style={inputStyle} />
                </div>
              )}
            </div>

            <button type="submit" disabled={isUploading} className="btn btn-primary" style={{ alignSelf: 'flex-end', marginTop: '0.5rem' }}>
              {isUploading ? 'Subiendo Archivo...' : (resAction === 'create' ? 'Guardar Recurso' : 'Actualizar Recurso')}
            </button>
          </form>

          {/* LIST OF EXISTING RESOURCES */}
          <div style={{ marginTop: '2rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Recursos Existentes</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {resources.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No has subido ningún recurso.</p>
              ) : (
                resources.map(res => (
                  <div key={res.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ color: 'var(--accent-color)' }}>
                        {res.type === 'document' && <FileText size={20} />}
                        {res.type === 'video' && <Video size={20} />}
                        {res.type === 'link' && <LinkIcon size={20} />}
                      </div>
                      <div>
                        <h5 style={{ margin: 0, fontSize: '0.95rem' }}>{res.title}</h5>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {resourceCategories.find(c => c.id === res.category_id)?.name || 'Sin categoría'}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" onClick={() => loadResourceData(res.id)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '0.25rem' }}>
                        <Edit size={16} />
                      </button>
                      <button type="button" onClick={() => handleDeleteResource(res.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const labelStyle = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' };
const inputStyle = {
  background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', color: 'var(--text-primary)',
  padding: '0.55rem 0.75rem', borderRadius: '0.35rem', outline: 'none', fontSize: '0.9rem', width: '100%', transition: 'border-color 0.2s'
};
const selectStyle = {
  background: 'rgba(18, 18, 22, 0.95)', border: '1px solid var(--border-color)', color: 'var(--text-primary)',
  padding: '0.55rem 0.75rem', borderRadius: '0.35rem', outline: 'none', fontSize: '0.9rem', width: '100%', cursor: 'pointer'
};
