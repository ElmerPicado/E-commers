import React, { useState, useContext } from 'react';
import { GalleryContext } from '../context/GalleryContext';
import { BookOpen, User, Type, Link as LinkIcon, Send, CheckCircle, Image as ImageIcon, Sun, Moon, Home, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import ImageUploadDropzone from '../components/admin/ImageUploadDropzone';

export default function SubmitDevocional() {
  const { addDevotional, devotionalCategories, livestream } = useContext(GalleryContext);

  const [authorName, setAuthorName] = useState('');
  const [authorBio, setAuthorBio] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorPhotoFile, setAuthorPhotoFile] = useState(null);
  const [authorPhotoPreview, setAuthorPhotoPreview] = useState('');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [verse, setVerse] = useState('');
  const [content, setContent] = useState('');
  const [prayer, setPrayer] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [devotionalImageFile, setDevotionalImageFile] = useState(null);
  const [devotionalImagePreview, setDevotionalImagePreview] = useState('');
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLightMode = true; // Forzamos modo claro para el formulario interior

  // Author Codes State
  const [enteredCode, setEnteredCode] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  // Recovery State
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveredCode, setRecoveredCode] = useState(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const [hasCodeAnswer, setHasCodeAnswer] = useState(null);
  const [wantsToRegister, setWantsToRegister] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [pendingCode, setPendingCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleRecoverCode = async () => {
    setIsRecovering(true);
    setRecoveredCode(null);
    const { data, error } = await supabase
      .from('devotional_authors')
      .select('code')
      .eq('email', recoveryEmail.trim().toLowerCase())
      .single();
    
    if (data) {
      setRecoveredCode(data.code);
    } else {
      alert("No encontramos ningún código asociado a este correo electrónico.");
    }
    setIsRecovering(false);
  };

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

  const handleRegisterAuthor = async () => {
    if (!authorName.trim()) {
      alert("Por favor ingresa tu nombre de autor.");
      return;
    }
    if (!authorBio.trim()) {
      alert("Por favor ingresa una biografía corta.");
      return;
    }
    if (!authorEmail.trim()) {
      alert("Por favor, ingresa tu correo electrónico para poder registrarte.");
      return;
    }
    
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
        alert('Hubo un error al subir la foto. Se guardará sin foto.');
      }
    }

    const codeToSave = generateRandomCode();
    try {
      const { error: insertError } = await supabase
        .from('devotional_authors')
        .insert({
          code: codeToSave,
          name: authorName,
          bio: authorBio,
          photo_url: finalPhotoUrl,
          email: authorEmail.trim().toLowerCase()
        });
      if (insertError) {
        if (insertError.code === '23505') {
          alert("Error: El correo electrónico ya está registrado. Por favor, usa otro correo o recupera tu código.");
        } else {
          alert("Error al registrar autor: " + insertError.message);
        }
        setIsSubmitting(false);
        return;
      }
      
      // Success
      setGeneratedCode(codeToSave);
      setEnteredCode(codeToSave);
      setIsLocked(true);
      setWantsToRegister(false); // They are now registered
      setIsSubmitting(false);
      if (finalPhotoUrl) {
        setAuthorPhotoPreview(finalPhotoUrl);
        setAuthorPhotoFile(null);
      }
      alert(`✅ Autor registrado correctamente.\n\nTu código de autor es:\n${codeToSave}\n\nGuárdalo para futuros devocionales. Ahora puedes continuar escribiendo.`);
    } catch (err) {
      console.error(err);
      alert("Error al registrar tu perfil de autor.");
      setIsSubmitting(false);
    }
  };


  const handleContinueToStep2 = () => {
    if (!isLocked) {
      if (!authorName.trim()) {
        alert("Por favor ingresa tu nombre de autor.");
        return;
      }
      
      const lowerName = authorName.trim().toLowerCase();
      if (lowerName === 'anónimo' || lowerName === 'anonimo') {
        alert('El nombre "Anónimo" está reservado. Por favor, utiliza la opción "Quiero ser Anónimo" al inicio si no deseas mostrar tu nombre, o usa tu nombre real.');
        return;
      }

      if (!authorBio.trim()) {
        alert("Por favor ingresa una biografía corta.");
        return;
      }
    }
    setCurrentStep(2);
    window.scrollTo(0, 0);
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

        if (isLocked && enteredCode) {
          await supabase
            .from('devotional_authors')
            .update({ photo_url: finalPhotoUrl })
            .eq('code', enteredCode.trim().toUpperCase());
          
          // Update the photo in all previous devotionals from the same author name
          await supabase
            .from('devotionals')
            .update({ author_photo: finalPhotoUrl })
            .eq('author_name', authorName);
        }
      } catch (err) {
        console.error('Error uploading photo:', err);
        alert('Hubo un error al subir la foto. Se enviará sin foto.');
      }
    } else if (isLocked && authorPhotoPreview && typeof authorPhotoPreview === 'string' && authorPhotoPreview.startsWith('http')) {
      finalPhotoUrl = authorPhotoPreview;
    }

    const baseSlug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;

    let finalDevotionalContent = content;

    // Upload devotional image if present
    let finalDevotionalImageUrl = '';
    if (devotionalImageFile && isSupabaseConfigured) {
      try {
        const fileExt = devotionalImageFile.name.split('.').pop();
        const fileName = `dev_image_${Date.now()}.${fileExt}`;
        const filePath = `devotionals/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, devotionalImageFile);
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
          finalDevotionalImageUrl = publicUrl;
        }
      } catch (err) {
        console.error('Error uploading devotional image:', err);
      }
    }

    if (finalDevotionalImageUrl) {
      finalDevotionalContent += `<div style="margin-top: 2rem; text-align: center;"><img src="${finalDevotionalImageUrl}" style="max-width: 100%; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" alt="Imagen del devocional" /></div>`;
    }

    if (youtubeLink.trim()) {
      const match = youtubeLink.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
      const videoId = (match && match[2].length === 11) ? match[2] : null;
      if (videoId) {
        finalDevotionalContent += `<div style="margin-top: 2rem; text-align: center;"><iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 0.5rem; max-width: 800px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></iframe></div>`;
      } else {
        // Fallback for non-youtube links or malformed links
        finalDevotionalContent += `<div style="margin-top: 2rem; text-align: center;"><a href="${youtubeLink}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">Ver video adjunto</a></div>`;
      }
    }

    const newDevotional = {
      title,
      slug: uniqueSlug,
      verse: verse,
      content: finalDevotionalContent,
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
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const inputStyle = {
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--border-color)',
    background: '#ffffff',
    color: '#000000',
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
                setPendingCode('');
              }
              setYoutubeLink('');
              setDevotionalImageFile(null);
              setDevotionalImagePreview('');
              setCurrentStep(1);
            }}
            className="btn btn-secondary"
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            Escribir otro devocional
          </button>
          <Link to="/devocionales" style={{ color: 'var(--accent-color)', fontSize: '0.9rem', textDecoration: 'underline', display: 'inline-block' }}>
            Ir a Devocionales
          </Link>
        </div>
      </div>
    );
  }

  const bgStyle = livestream?.formBgUrl ? {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.85)), url(${livestream.formBgUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  } : {
    background: 'var(--bg-primary)'
  };

  const formCardStyle = {
    background: 'var(--card-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.75rem',
    padding: 'clamp(1.5rem, 4vw, 2.5rem)',
    boxShadow: isLightMode ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
    marginBottom: '1.25rem',
    position: 'relative',
    overflow: 'hidden'
  };

  const headerCardStyle = {
    ...formCardStyle,
    borderTop: '10px solid var(--accent-color)'
  };

  return (
    <div style={{ ...currentTheme, minHeight: '100vh', ...bgStyle, padding: '2rem 1rem 4rem 1rem', display: 'flex', justifyContent: 'center', transition: 'all 0.3s ease' }}>

      <div style={{ maxWidth: '768px', width: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header Card */}
        <div style={headerCardStyle}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {livestream?.churchLogo ? (
            <img 
              src={livestream.churchLogo} 
              alt={livestream.churchName || 'Iglesia Metodista de Río Cuarto'} 
              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%', margin: '0 auto 1rem auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
            />
          ) : (
            <BookOpen size={48} style={{ color: 'var(--accent-color)', margin: '0 auto 1rem auto' }} />
          )}
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-color)', margin: '0 0 0.5rem 0', fontWeight: 700 }}>
            {livestream?.churchName || 'Iglesia Metodista de Río Cuarto'}
          </h4>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>Escribe un Devocional</h1>
          <div style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6', background: isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              <strong>¡Bienvenido!</strong> Este es un espacio abierto para bendecir a otros con la Palabra. Si Dios ha puesto un mensaje en tu corazón, nos encantaría compartirlo con nuestra comunidad.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'inline-flex', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-color)', color: '#ffffff', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: '0.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>1</span>
                <br/>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tus Datos</span>
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem', opacity: 0.8 }}>Ingresa o carga tu perfil de autor.</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'inline-flex', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-color)', color: '#ffffff', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: '0.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>2</span>
                <br/>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>El Mensaje</span>
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem', opacity: 0.8 }}>Escribe tu devocional y versículo.</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'inline-flex', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-color)', color: '#ffffff', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: '0.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>3</span>
                <br/>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Revisión</span>
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem', opacity: 0.8 }}>Lo leeremos y lo publicaremos.</p>
              </div>
            </div>

            <style>{`
              @keyframes bounce-slow {
                0%, 100% { transform: translateY(-5%); }
                50% { transform: translateY(5%); }
              }
              .animate-bounce-slow {
                animation: bounce-slow 2s infinite ease-in-out;
              }
            `}</style>

            <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--accent-color)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>
                Desliza hacia abajo
              </span>
              <ChevronDown className="animate-bounce-slow" size={24} />
            </div>
          </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          {currentStep === 1 && (
            <>
              {/* Login Section */}
        {!isLocked && hasCodeAnswer === null && (
          <div style={formCardStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                ¿Ya eres un escritor frecuente y tienes un código?
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '500px' }}>
                Si tienes un código de autor, selecciona <strong>"Sí, ya tengo mi código"</strong> para cargar tu perfil. Si solo deseas escribir esta vez o es tu primera vez, selecciona <strong>"Soy nuevo"</strong>.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1rem' }}>
                <button type="button" onClick={() => setHasCodeAnswer('yes')} className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem', fontWeight: 700 }}>Sí, ya tengo mi código</button>
                <button type="button" onClick={() => setHasCodeAnswer('no')} className="btn" style={{ background: '#f97316', border: 'none', color: '#ffffff', padding: '0.85rem 2rem', fontSize: '1.05rem', fontWeight: 700 }}>Soy nuevo</button>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
                <button type="button" onClick={() => {
                  setHasCodeAnswer('anon');
                  setAuthorName('Anónimo');
                  setAuthorBio('Espero poder bendecirte con este mensaje poderoso.');
                  setAuthorEmail('');
                  setAuthorPhotoFile(null);
                  setAuthorPhotoPreview('');
                  setIsLocked(true);
                }} className="btn" style={{ background: 'var(--bg-surface)', border: '1px dashed var(--text-secondary)', color: 'var(--text-secondary)', padding: '0.5rem 1.25rem', fontSize: '0.9rem', fontWeight: 600 }}>
                  Quiero ser Anónimo
                </button>
              </div>
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <button type="button" onClick={() => setHasCodeAnswer('forgot')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                  ¿Olvidaste tu código?
                </button>
              </div>
            </div>
          </div>
        )}

        {!isLocked && hasCodeAnswer === 'yes' && (
          <div style={formCardStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Ingresa tu código de escritor frecuente
              </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', textAlign: 'center' }}>
              Ingresa tu código para autocompletar tus datos.
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
            <button type="button" onClick={() => setHasCodeAnswer(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', marginTop: '1rem' }}>Volver atrás</button>
            </div>
          </div>
        )}

        {!isLocked && hasCodeAnswer === 'no' && (
          <div style={{ ...formCardStyle, borderLeft: '6px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
              ¡Bienvenido! Por favor completa tus datos de autor a continuación para publicar tu devocional.
            </p>
            <button type="button" onClick={() => setHasCodeAnswer(null)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>Volver atrás</button>
            </div>
          </div>
        )}

        {!isLocked && hasCodeAnswer === 'forgot' && (
          <div style={{ ...formCardStyle, borderLeft: '6px solid #f59e0b' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem' }}>Recuperar código de escritor</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Ingresa el correo electrónico con el que te registraste y buscaremos tu código.</p>
            <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '400px' }}>
              <input type="email" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" style={{ ...inputStyle, background: 'var(--input-bg)' }} />
              <button type="button" onClick={handleRecoverCode} disabled={isRecovering || !recoveryEmail} className="btn btn-primary" style={{ padding: '0 1.5rem' }}>
                {isRecovering ? 'Buscando...' : 'Recuperar'}
              </button>
            </div>
            {recoveredCode && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '1rem', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
                <p style={{ color: '#10b981', fontWeight: 600, fontSize: '0.95rem' }}>¡Código encontrado!</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>{recoveredCode}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Guárdalo en un lugar seguro. Ahora puedes darle a "Volver atrás" y elegir "Sí, ya tengo mi código".</p>
              </div>
              )}
              <button type="button" onClick={() => { setHasCodeAnswer(null); setRecoveredCode(null); setRecoveryEmail(''); }} style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', alignSelf: 'flex-start' }}>Volver atrás</button>
            </div>
          </div>
        )}

        {isLocked && (
          <div style={{ ...formCardStyle, borderLeft: '6px solid #2563eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>Escribiendo como: {authorName}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {hasCodeAnswer === 'anon' 
                  ? 'Tus datos han sido cargados como Anónimo y tu identidad estará oculta.' 
                  : 'Tus datos han sido cargados automáticamente.'}
              </p>
            </div>
            <button 
              type="button" 
              onClick={() => {
                setIsLocked(false);
                setAuthorName('');
                setAuthorBio('');
                setAuthorEmail('');
                setAuthorPhotoPreview('');
                setEnteredCode('');
                setHasCodeAnswer(null);
              }}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
            >
              Cambiar de autor
            </button>
          </div>
        </div>
        )}

        {/* Author Section */}
        {(isLocked || hasCodeAnswer === 'no') && (
          <>
            <div style={formCardStyle}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} /> Datos del Autor
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
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
            </div>

            {/* Opciones de Registro y Foto */}
              {!isLocked && (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.75rem', marginTop: '1.5rem', border: '1px solid var(--border-color)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={wantsToRegister} 
                      onChange={(e) => setWantsToRegister(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                    />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Quiero registrarme como escritor frecuente (Me permite subir una foto de perfil y recuperar mi código por correo).
                    </span>
                  </label>
                </div>
              )}

              {(isLocked || wantsToRegister) && hasCodeAnswer !== 'anon' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  {wantsToRegister && !isLocked && (
                    <div>
                      <label style={labelStyle}>Correo Electrónico (Para recuperar tu código)</label>
                      <input 
                        type="email" 
                        value={authorEmail} 
                        onChange={(e) => setAuthorEmail(e.target.value)}
                        required
                        placeholder="ejemplo@correo.com"
                        style={{ ...inputStyle, background: 'var(--input-bg)' }} 
                      />
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        No será público, solo se usa si olvidas tu código.
                      </p>
                    </div>
                  )}

                  <div>
                    <label style={labelStyle}><ImageIcon size={14} style={{ display: 'inline', marginRight: '0.25rem' }} /> Foto de Perfil (Opcional)</label>
                    <ImageUploadDropzone 
                      onFileSelect={(file) => {
                        if (file) {
                          setAuthorPhotoFile(file);
                          setAuthorPhotoPreview(URL.createObjectURL(file));
                        }
                      }} 
                      previewUrl={authorPhotoPreview} 
                      label="Subir Foto de Perfil" 
                    />
                    {isLocked && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Si subes una nueva foto, actualizaremos tu perfil.
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>

            <div style={{ ...formCardStyle, display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {wantsToRegister && !isLocked ? (
                <button 
                  type="button" 
                  onClick={handleRegisterAuthor}
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ padding: '1rem 2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                >
                  {isSubmitting ? 'Registrando...' : 'Registrarme Ahora'}
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={handleContinueToStep2}
                  className="btn btn-primary"
                  style={{ padding: '1rem 2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                >
                  Continuar a redactar devocional
                </button>
              )}
            </div>
          </>
        )}
        </>
      )}

        {currentStep === 2 && (
          <>
            


            {/* Content Section */}
            <div style={formCardStyle}>
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
                        ['link', 'video', 'clean']
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
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Imagen Adjunta (Opcional)</label>
                <ImageUploadDropzone 
                  onFileSelect={(file) => {
                    if (file) {
                      setDevotionalImageFile(file);
                      setDevotionalImagePreview(URL.createObjectURL(file));
                    }
                  }} 
                  previewUrl={devotionalImagePreview} 
                  label="Subir Portadilla" 
                  size="large"
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Si deseas agregar una imagen al final del devocional.
                </p>
              </div>

              <div>
                <label style={labelStyle}>Enlace de YouTube (Opcional)</label>
                <input 
                  type="url" 
                  value={youtubeLink} 
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  placeholder="Ej. https://www.youtube.com/watch?v=..."
                  style={{ ...inputStyle, background: 'var(--input-bg)' }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Aparecerá como un video al final de tu devocional.
                </p>
              </div>
            </div>
          </div>

          <div style={{ ...formCardStyle, display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <button 
              type="button" 
              onClick={() => {
                setCurrentStep(1);
                window.scrollTo(0, 0);
              }}
              className="btn"
              style={{ padding: '1rem 2rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            >
              Volver atrás
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ padding: '1rem 2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              {isSubmitting ? 'Enviando...' : (
                <>
                  <Send size={20} /> Enviar Devocional
                </>
              )}
            </button>
          </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.2s' }}>
            <Home size={16} /> Ir al Inicio
          </Link>
          <Link to="/devocionales" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.2s' }}>
            <BookOpen size={16} /> Leer Devocionales
          </Link>
        </div>
      </form>
      </div>
    </div>
  );
}
