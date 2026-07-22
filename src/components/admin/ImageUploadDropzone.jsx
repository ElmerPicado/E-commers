import React, { useEffect } from 'react';
import { Upload } from 'lucide-react';

export default function ImageUploadDropzone({
  onFileSelect,
  previewUrl,
  size = 'small', // 'small' or 'large'
  label = 'Haz clic para seleccionar foto',
  multiple = false,
  onFilesSelect, // Optional, for multiple files
  accept = "image/*"
}) {
  const isLarge = size === 'large';
  const padding = isLarge ? '2rem' : '1rem';

  // Limpieza automática de URLs de tipo blob al desmontar el componente o cambiar el preview
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    if (multiple && onFilesSelect) {
      if (e.target.files && e.target.files.length > 0) {
        onFilesSelect(Array.from(e.target.files));
      }
    } else if (e.target.files && e.target.files[0]) {
      if (onFileSelect) onFileSelect(e.target.files[0]);
    }

    // Resetea el valor del input para permitir volver a subir el mismo archivo si se elimina
    e.target.value = null;
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%', flexDirection: isLarge ? 'column' : 'row' }}>
      <label style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: padding, border: '2px dashed var(--accent-color)', borderRadius: '0.5rem',
        cursor: 'pointer', background: 'rgba(255,255,255,0.02)', transition: 'all 0.3s',
        flex: 1, width: isLarge ? '100% ' : 'auto'
      }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
      >
        <Upload size={isLarge ? 32 : 20} style={{ color: 'var(--accent-color)', marginBottom: '0.5rem' }} />
        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: isLarge ? '1rem' : '0.85rem' }}>{label}</span>
        {isLarge && multiple && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Puedes subir múltiples fotos a la vez</span>}
        <input type="file" accept={accept} multiple={multiple} onChange={handleFileChange} style={{ display: 'none' }} />
      </label>

      {!multiple && previewUrl && (
        <div style={{ width: isLarge ? '100px' : '60px', height: isLarge ? '100px' : '60px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border-color)', flexShrink: 0, background: 'rgba(0,0,0,0.2)' }}>
          <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
    </div>
  );
}