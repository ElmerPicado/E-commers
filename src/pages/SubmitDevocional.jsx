import React, { useState, useContext } from 'react';
import { GalleryContext } from '../context/GalleryContext';
import { BookOpen, User, Type, Link as LinkIcon, Send, CheckCircle, Image as ImageIcon, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { isSupabaseConfigured, supabase } from '../supabaseClient';

export default function SubmitDevocional() {
  const { addDevotional, devotionalCategories } = useContext(GalleryContext);

  const [authorName, setAuthorName] = useState('');
  const [authorBio, setAuthorBio] = useState('');
  const [authorPhotoFile, setAuthorPhotoFile] = useState(null);
  const [authorPhotoPreview, setAuthorPhotoPreview] = useState('');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [verse, setVerse] = useState('');
  const [content, setContent] = useState('');
  const [prayer, setPrayer] = useState('');
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLightMode, setIsLightMode] = useState(true);

  // Author Codes State
  const [enteredCode, setEnteredCode] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [wantsToRegister, setWantsToRegister] = useState(false);
  const [registerEmail, setRegisterEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleLoginCode = async () => {
    if (!enteredCode.trim()) return;
    setIsSearching(true);
    setLoginError('');
    try {
      const { data, error } = await supabase
        .from('devotional_authors')
        .select('*')
        .eq('code', enteredCode.trim().toUpperCase())
        .single();
        
      if (error || !data) {
        setLoginError('Código no encontrado. Intenta de nuevo.');
      } else {
        setAuthorName(data.name);
        setAuthorBio(data.bio || '');
        setAuthorPhotoPreview(data.photo_url || '');
        setAuthorPhotoFile(null); // Clear file since we have URL
        setIsLocked(true); // Lock inputs
      }
    } catch (err) {
      setLoginError('Error al buscar el código.');
    } finally {
      setIsSearching(false);
    }
  };

  const generateRandomCode = () => {
    const prefix = authorName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'AUT');
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${suffix}`;
  };

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
    } else if (isLocked && authorPhotoPreview && typeof authorPhotoPreview === 'string' && authorPhotoPreview.startsWith('http')) {
      finalPhotoUrl = authorPhotoPreview;
    }

    let savedCode = '';
    if (wantsToRegister && isSupabaseConfigured) {
      try {
        savedCode = generateRandomCode();
        const { error: authorError } = await supabase
          .from('devotional_authors')
          .insert([{
            code: savedCode,
            email: registerEmail.trim() || null,
            name: authorName,
            bio: authorBio,
            photo_url: finalPhotoUrl
          }]);
        if (authorError) {
          console.error('Error guardando autor:', authorError);
          // Proceed anyway but don't show code
          savedCode = ''; 
        }
      } catch (err) {
        console.error(err);
        savedCode = '';
      }
    }
    const baseSlug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;

    const newDevotional = {
      title,
      slug: uniqueSlug,
      verse: verse,
      content: content,
      prayer: prayer,
      category_id: categoryId || null,
      author_name: authorName,
      author_bio: authorBio,
      author_photo: finalPhotoUrl,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const result = await addDevotional(newDevotional);
    
    if (result && !result.success) {
      alert("Hubo un error al guardar tu devocional: " + result.error + "\nPor favor verifica tu conexión o contacta a soporte.");
      setIsSubmitting(false);
      return;
    }
    
    setGeneratedCode(savedCode);
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

  const lightModeVars = {
    '--bg-primary': '#f1f5f9',
    '--bg-surface': '#ffffff',
    '--text-primary': '#0f172a',
    '--text-secondary': '#475569',
    '--border-color': '#e2e8f0',
    '--input-bg': '#ffffff',
    '--card-bg': '#ffffff'
  };

  const darkModeVars = {
    '--bg-primary': 'var(--bg-base)',
    '--bg-surface': 'var(--bg-surface)',
    '--text-primary': 'var(--text-primary)',
    '--text-secondary': 'var(--text-secondary)',
    '--border-color': 'var(--border-color)',
    '--input-bg': 'rgba(255, 255, 255, 0.05)',
    '--card-bg': 'var(--bg-surface)'
  };

  const currentTheme = isLightMode ? lightModeVars : darkModeVars;

  if (isSubmitted) {
    return (
      <div style={{ ...currentTheme, background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', transition: 'background 0.3s ease' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '3rem 2rem', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: isLightMode ? '0 10px 25px rgba(0,0,0,0.05)' : 'none' }}>
          <CheckCircle size={64} style={{ color: '#10b981', margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '1rem' }}>¡Devocional Enviado!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Muchas gracias por compartir tu escrito. Ha sido enviado a revisión y pronto será categorizado y publicado por el equipo administrativo.
          </p>
          
          {generatedCode && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem' }}>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                Tu cuenta ha sido creada exitosamente. Para futuros devocionales, solo ingresa este código:
              </p>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#10b981', letterSpacing: '2px' }}>
                {generatedCode}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Guárdalo en un lugar seguro. ¡No tendrás que volver a llenar tus datos!
              </p>
            </div>
          )}

          <button 
            onClick={() => {
              setIsSubmitted(false);
              setTitle('');
              setCategoryId('');
              setVerse('');
              setContent('');
              setPrayer('');
              
              if (generatedCode) {
                setEnteredCode(generatedCode);
                setIsLocked(true);
                setWantsToRegister(false);
                setGeneratedCode('');
              } else if (!isLocked) {
                setAuthorName('');
                setAuthorBio('');
                setAuthorPhotoFile(null);
                setAuthorPhotoPreview('');
              }
            }}
            className="btn btn-secondary"
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            Escribir otro devocional
          </button>
          <Link to="/" style={{ color: 'var(--accent-color)', fontSize: '0.9rem', textDecoration: 'underline', display: 'inline-block' }}>
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...currentTheme, minHeight: '100vh', background: 'var(--bg-primary)', padding: '4rem 1.5rem 4rem 1.5rem', display: 'flex', justifyContent: 'center', transition: 'all 0.3s ease' }}>
      
      {/* Theme Toggle Button */}
      <button 
        onClick={() => setIsLightMode(!isLightMode)}
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 100,
          boxShadow: isLightMode ? '0 4px 6px rgba(0,0,0,0.05)' : '0 4px 6px rgba(0,0,0,0.2)'
        }}
        title={isLightMode ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
      >
        {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      <div style={{ maxWidth: '800px', width: '100%', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '3rem 4rem', boxShadow: isLightMode ? '0 10px 25px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.3s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <BookOpen size={48} style={{ color: 'var(--accent-color)', margin: '0 auto 1rem auto' }} />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>Escribe un Devocional</h1>
          <div style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6', background: isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
            <p style={{ marginBottom: '0.75rem' }}>
              <strong>¡Bienvenido!</strong> Este es un espacio abierto para bendecir a otros con la Palabra. Si Dios ha puesto un mensaje en tu corazón, nos encantaría compartirlo con nuestra comunidad.
            </p>
            <p style={{ fontSize: '0.95rem' }}>
              <strong>¿Cómo funciona?</strong> Al enviar tu devocional mediante este formulario, entrará a un estado de revisión. Nuestro equipo de administración lo leerá, lo asignará a la categoría correspondiente y, tras ser aprobado, será publicado oficialmente en la plataforma con tus créditos como autor.
            </p>
          </div>
        </div>

        {/* Login Section */}
        {!isLocked && (
          <div style={{ background: isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '1rem', border: '1px dashed var(--accent-color)', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              ¿Ya eres un escritor frecuente?
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', textAlign: 'center' }}>
              Ingresa tu código para autocompletar tus datos. Si eres nuevo, simplemente llena el formulario abajo.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '400px', width: '100%' }}>
              <input 
                type="text" 
                value={enteredCode} 
                onChange={(e) => setEnteredCode(e.target.value)} 
                placeholder="Ej. AUT-1234"
                style={{ ...inputStyle, background: 'var(--input-bg)' }}
              />
              <button 
                type="button" 
                onClick={handleLoginCode} 
                disabled={isSearching}
                className="btn btn-primary"
                style={{ padding: '0 1.5rem' }}
              >
                {isSearching ? 'Buscando...' : 'Autocompletar'}
              </button>
            </div>
            {loginError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{loginError}</p>}
          </div>
        )}

        {isLocked && (
          <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '1rem 1.5rem', borderRadius: '1rem', border: '1px solid rgba(37, 99, 235, 0.3)', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>Escribiendo como: {authorName}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tus datos han sido cargados automáticamente.</p>
            </div>
            <button 
              type="button" 
              onClick={() => {
                setIsLocked(false);
                setAuthorName('');
                setAuthorBio('');
                setAuthorPhotoPreview('');
                setEnteredCode('');
              }}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
            >
              Cambiar de autor
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Author Section */}
          <div style={{ background: isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
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
                  disabled={isLocked}
                  placeholder="Ej. Juan Pérez"
                  style={{ ...inputStyle, background: 'var(--input-bg)', opacity: isLocked ? 0.6 : 1 }} 
                />
              </div>
              
              <div>
                <label style={labelStyle}>Biografía Corta</label>
                <textarea 
                  value={authorBio} 
                  onChange={(e) => setAuthorBio(e.target.value)}
                  required
                  disabled={isLocked}
                  rows={3}
                  placeholder="Ej. Soy pastor de jóvenes, me apasiona la música y servir a Dios..."
                  style={{ ...inputStyle, background: 'var(--input-bg)', resize: 'vertical', opacity: isLocked ? 0.6 : 1 }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Aparecerá en la parte superior de tu devocional.
                </p>
              </div>

              <div>
                <label style={labelStyle}><ImageIcon size={14} style={{ display: 'inline', marginRight: '0.25rem' }} /> Foto de Perfil (Opcional)</label>
                {!isLocked ? (
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
                    style={{ ...inputStyle, padding: '0.5rem', background: 'var(--input-bg)' }} 
                  />
                ) : (
                  <div style={{ ...inputStyle, background: 'var(--input-bg)', opacity: 0.6, fontSize: '0.85rem' }}>
                    Foto cargada desde tu perfil
                  </div>
                )}
                {authorPhotoPreview && (
                  <div style={{ marginTop: '0.75rem', width: '90px', height: '110px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--border-color)' }}>
                    <img src={authorPhotoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div style={{ background: isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
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
                  style={{ ...inputStyle, background: 'var(--input-bg)', fontSize: '1.1rem', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={labelStyle}>Categoría del Devocional</label>
                <select 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  style={{ ...inputStyle, background: 'var(--input-bg)' }}
                >
                  <option value="" style={{ color: '#0f172a' }}>-- Seleccionar Categoría --</option>
                  {(devotionalCategories || []).map(c => (
                    <option key={c.id} value={c.id} style={{ color: '#0f172a' }}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Versículo Base</label>
                <textarea 
                  value={verse} 
                  onChange={(e) => setVerse(e.target.value)}
                  placeholder='"Porque de tal manera amó Dios al mundo..." Juan 3:16'
                  style={{ ...inputStyle, background: 'var(--input-bg)', resize: 'vertical', minHeight: '60px', fontStyle: 'italic' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Contenido del Devocional</label>
                <div style={{ background: isLightMode ? '#ffffff' : '#f8fafc', borderRadius: '0.5rem', overflow: 'hidden', color: '#000000', border: '1px solid var(--border-color)' }}>
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

              <div>
                <label style={labelStyle}>Oración Final</label>
                <textarea 
                  value={prayer} 
                  onChange={(e) => setPrayer(e.target.value)}
                  placeholder="Señor, te pido que esta palabra..."
                  style={{ ...inputStyle, background: 'var(--input-bg)', resize: 'vertical', minHeight: '80px' }}
                />
              </div>
            </div>
          </div>

          {/* Registration Checkbox (Only if not logged in) */}
          {!isLocked && (
            <div style={{ background: isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={wantsToRegister} 
                  onChange={(e) => setWantsToRegister(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                />
                <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Guardar mis datos para futuros devocionales
                </span>
              </label>
              
              {wantsToRegister && (
                <div style={{ marginTop: '0.5rem', paddingLeft: '2.25rem' }}>
                  <label style={labelStyle}>Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required={wantsToRegister}
                    placeholder="tucorreo@ejemplo.com"
                    style={{ ...inputStyle, background: 'var(--input-bg)', maxWidth: '400px' }}
                  />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Solo usaremos tu correo para asociarlo a tu perfil. Al enviar, te daremos un código de acceso en la siguiente pantalla.
                  </p>
                </div>
              )}
            </div>
          )}

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
