import React, { useState, useContext } from 'react';
import { GalleryContext } from '../context/GalleryContext';
import { BookOpen, User, Type, Link as LinkIcon, Send, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { isSupabaseConfigured, supabase } from '../supabaseClient';

export default function SubmitDevocional() {
  const { addDevotional } = useContext(GalleryContext);

  const [authorName, setAuthorName] = useState('');
  const [authorBio, setAuthorBio] = useState('');
  const [authorPhotoFile, setAuthorPhotoFile] = useState(null);
  const [authorPhotoPreview, setAuthorPhotoPreview] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let finalPhotoUrl = '';
    
    if (authorPhotoFile && isSupabaseConfigured) {
      try {
        const fileExt = authorPhotoFile.name.split('.').pop();
        const fileName = `author_${Date.now()}.${fileExt}`;
        const filePath = `authors/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, authorPhotoFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
        finalPhotoUrl = publicUrl;
      } catch (err) {
        console.error('Error uploading photo:', err);
        alert('Hubo un error al subir la foto. Se enviará sin foto.');
      }
    }

    const newDevotional = {
      title,
      content,
      author_name: authorName,
      author_bio: authorBio,
      author_photo: finalPhotoUrl,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    await addDevotional(newDevotional);
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const inputStyle = {
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--border-color)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    width: '100%',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
    display: 'block',
    color: 'var(--text-secondary)'
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg-surface)' }}>
        <div className="glass-card max-w-md w-full text-center p-10 flex flex-col items-center gap-4">
          <CheckCircle size={64} style={{ color: '#10b981' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>¡Devocional Enviado!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Muchas gracias por compartir tu escrito. Ha sido enviado a revisión y pronto será categorizado y publicado por el equipo administrativo.
          </p>
          <button 
            onClick={() => {
              setIsSubmitted(false);
              setAuthorName('');
              setAuthorBio('');
              setAuthorPhotoFile(null);
              setAuthorPhotoPreview('');
              setTitle('');
              setContent('');
            }}
            className="btn btn-secondary mt-4"
          >
            Enviar otro devocional
          </button>
          <Link to="/" style={{ color: 'var(--accent-color)', fontSize: '0.9rem', marginTop: '1rem', textDecoration: 'underline' }}>
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '6rem 1.5rem 4rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-card" style={{ maxWidth: '800px', width: '100%', padding: '2rem 3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <BookOpen size={48} style={{ color: 'var(--accent-color)', margin: '0 auto 1rem auto' }} />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Escribe un Devocional</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Comparte lo que Dios ha puesto en tu corazón. Tu escrito será revisado por nuestro equipo antes de ser publicado en la plataforma.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Author Section */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} /> Datos del Autor
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Nombre Completo</label>
                <input 
                  type="text" 
                  value={authorName} 
                  onChange={(e) => setAuthorName(e.target.value)}
                  required
                  placeholder="Ej. Juan Pérez"
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={labelStyle}><ImageIcon size={14} style={{ display: 'inline', marginRight: '0.25rem' }} /> Foto de Perfil (Opcional)</label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setAuthorPhotoFile(file);
                      setAuthorPhotoPreview(URL.createObjectURL(file));
                    }
                  }}
                  style={{ ...inputStyle, padding: '0.5rem', background: 'rgba(255, 255, 255, 0.05)' }} 
                />
                {authorPhotoPreview && (
                  <div style={{ marginTop: '0.75rem', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border-color)' }}>
                    <img src={authorPhotoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <label style={labelStyle}>Biografía Corta</label>
              <textarea 
                value={authorBio} 
                onChange={(e) => setAuthorBio(e.target.value)}
                required
                rows={3}
                placeholder="Ej. Soy pastor de jóvenes, me apasiona la música y servir a Dios..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Aparecerá en la parte superior de tu devocional.
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Type size={20} style={{ color: 'var(--accent-color)' }} />
              Cuerpo del Devocional
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Título del Devocional</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Un título que atrape..."
                  style={{ ...inputStyle, fontSize: '1.1rem', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={labelStyle}>Contenido del Devocional</label>
                <div style={{ background: '#ffffff', borderRadius: '0.5rem', overflow: 'hidden', color: '#000000' }}>
                  <ReactQuill 
                    theme="snow" 
                    value={content} 
                    onChange={setContent} 
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
                  }
                  .ql-toolbar {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    background: #f8fafc;
                  }
                  .ql-editor {
                    min-height: 300px;
                  }
                `}</style>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ padding: '1rem 2rem', fontSize: '1.1rem', alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            {isSubmitting ? 'Enviando...' : (
              <>
                <Send size={20} /> Enviar Devocional para Revisión
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
