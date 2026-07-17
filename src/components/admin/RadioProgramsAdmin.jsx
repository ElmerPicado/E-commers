import React, { useState, useContext, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../../supabaseClient';
import { GalleryContext } from '../../context/GalleryContext';
import { UploadCloud, Trash2, Edit2, CheckCircle, Radio } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ImageUploadDropzone from './ImageUploadDropzone';
import { resolveImageUrl } from '../../utils/imageUtils';

export default function RadioProgramsAdmin() {
  const { radioPrograms, addRadioProgram, updateRadioProgram, deleteRadioProgram } = useContext(GalleryContext);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');
  
  const [title, setTitle] = useState('');
  const [host, setHost] = useState('');
  const [schedule, setSchedule] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef(null);

  const resetForm = () => {
    setIsEditing(false);
    setEditingId('');
    setTitle('');
    setHost('');
    setSchedule('');
    setDescription('');
    setIsActive(true);
    setImageFile(null);
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEdit = (program) => {
    setIsEditing(true);
    setEditingId(program.id);
    setTitle(program.title);
    setHost(program.host || '');
    setSchedule(program.schedule_time || '');
    setDescription(program.description || '');
    setIsActive(program.is_active);
    setImageUrl(program.image_url || '');
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;

    setUploading(true);
    let finalImageUrl = imageUrl;

    try {
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `radio_${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('photos')
          .upload(fileName, imageFile, { upsert: false });

        if (error) {
          console.error("Upload error:", error);
          alert('Error al subir la imagen. Verifica las políticas de storage de Supabase.');
          setUploading(false);
          return;
        }

        const { data: pubData } = supabase.storage
          .from('photos')
          .getPublicUrl(fileName);

        finalImageUrl = pubData.publicUrl;
      }

      const programData = {
        title,
        host,
        schedule_time: schedule,
        description,
        is_active: isActive,
        image_url: resolveImageUrl(finalImageUrl)
      };

      if (isEditing) {
        await updateRadioProgram(editingId, programData);
        setSuccessMsg('Programa actualizado correctamente.');
      } else {
        await addRadioProgram({ id: uuidv4(), ...programData });
        setSuccessMsg('Programa creado correctamente.');
      }

      setTimeout(() => setSuccessMsg(''), 3000);
      resetForm();

    } catch (err) {
      console.error(err);
      alert('Hubo un error al procesar el programa.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este programa de radio?")) {
      await deleteRadioProgram(id);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.65rem 1rem',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.35rem',
    color: 'var(--text-primary)',
    fontSize: '0.85rem'
  };

  return (
    <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <Radio size={24} color="var(--accent-color)" />
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Parrilla de Programación (Radio)</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Formulario */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
            {isEditing ? 'Editar Programa' : 'Crear Nuevo Programa'}
          </h4>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Título del Programa *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} required />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Locutor / Conductor</label>
                <input type="text" value={host} onChange={(e) => setHost(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Horario (ej. L a V, 10 AM)</label>
                <input type="text" value={schedule} onChange={(e) => setSchedule(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Descripción Corta</label>
              <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Portada del Programa (Subir o URL)</label>
              {isSupabaseConfigured ? (
                <ImageUploadDropzone 
                  onFileSelect={(file) => setImageFile(file)} 
                  previewUrl={imageFile ? URL.createObjectURL(imageFile) : imageUrl} 
                  label="Subir Portada" 
                />
              ) : (
                <>
                  <input type="text" placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} style={inputStyle} />
                  {(imageUrl) && (
                    <div style={{ marginTop: '0.5rem', width: '60px', height: '60px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={{ width: '16px', height: '16px' }} />
              <label htmlFor="isActive" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Programa Activo (Mostrar en la web)</label>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={uploading} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                {uploading ? 'Guardando...' : (isEditing ? 'Actualizar Programa' : 'Crear Programa')}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="btn btn-secondary">Cancelar</button>
              )}
            </div>
            
            {successMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                <CheckCircle size={16} /> {successMsg}
              </div>
            )}
          </form>
        </div>

        {/* Lista de Programas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Programas Registrados ({radioPrograms?.length || 0})</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {(!radioPrograms || radioPrograms.length === 0) ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No hay programas registrados.</p>
            ) : (
              radioPrograms.map((prog) => (
                <div key={prog.id} className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: prog.is_active ? '3px solid var(--accent-color)' : '3px solid var(--border-color)' }}>
                  
                  {prog.image_url ? (
                    <img src={prog.image_url} alt={prog.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.35rem' }} />
                  ) : (
                    <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Radio size={24} color="var(--text-muted)" />
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prog.title}</h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{prog.schedule_time || 'Sin horario'} • {prog.host || 'Varios'}</p>
                    <p style={{ fontSize: '0.7rem', color: prog.is_active ? 'var(--accent-color)' : 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {prog.is_active ? 'EN EMISIÓN' : 'INACTIVO'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEdit(prog)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.35rem' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(prog.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.35rem' }}>
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
  );
}
