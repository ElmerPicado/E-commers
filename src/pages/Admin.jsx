import React, { useContext, useState } from 'react';
import { GalleryContext } from '../context/GalleryContext';
import { Tv, Radio, Image, Plus, Trash2, Save, Upload, CheckCircle, AlertTriangle, Layers, Calendar, Users } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../supabaseClient';

export default function Admin() {
  const {
    albums,
    livestream,
    radio,
    homeSections,
    ministries,
    activities,
    addAlbum,
    deleteAlbum,
    addPhotoToAlbum,
    updateLivestream,
    updateRadio,
    updateHomeSection,
    addMinistry,
    deleteMinistry,
    updateMinistry,
    addActivity,
    deleteActivity
  } = useContext(GalleryContext);

  // Tab state
  const [activeTab, setActiveTab] = useState('streaming');

  // Success message states
  const [successMsg, setSuccessMsg] = useState('');

  // Local helper for showing temporary success banner
  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // 1. Streaming state
  const [liveTitle, setLiveTitle] = useState(livestream.title);
  const [liveUrl, setLiveUrl] = useState(livestream.videoUrl);
  const [isLive, setIsLive] = useState(livestream.isLive);
  const [radioTitle, setRadioTitle] = useState(radio.title);
  const [radioUrl, setRadioUrl] = useState(radio.audioUrl);
  const [isRadioLive, setIsRadioLive] = useState(radio.isLive);

  // 2. Home Sections state
  const [editingSectionId, setEditingSectionId] = useState(homeSections[0]?.id || 'hero');
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionSubtitle, setSectionSubtitle] = useState('');
  const [sectionBtnText, setSectionBtnText] = useState('');
  const [sectionBtnUrl, setSectionBtnUrl] = useState('');
  const [sectionBgFile, setSectionBgFile] = useState(null);
  const [sectionBgUrlText, setSectionBgUrlText] = useState('');
  const [isSectionUploading, setIsSectionUploading] = useState(false);

  // Load section into form fields when selected
  const loadSectionData = (secId) => {
    const sec = homeSections.find(s => s.id === secId);
    if (sec) {
      setEditingSectionId(secId);
      setSectionTitle(sec.title);
      setSectionSubtitle(sec.subtitle);
      setSectionBtnText(sec.button_text || '');
      setSectionBtnUrl(sec.button_url || '');
      setSectionBgUrlText(sec.bg_image);
      setSectionBgFile(null);
    }
  };

  // Trigger load on first render/selection if fields are empty
  React.useEffect(() => {
    if (homeSections.length > 0 && !sectionTitle) {
      loadSectionData(homeSections[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeSections]);

  // 3. Ministry state & actions
  const [minAction, setMinAction] = useState('create'); // 'create' | 'edit'
  const [selectedMinIdToEdit, setSelectedMinIdToEdit] = useState('');
  
  const [newMinId, setNewMinId] = useState('');
  const [newMinName, setNewMinName] = useState('');
  const [newMinDesc, setNewMinDesc] = useState('');
  const [newMinHeroTitle, setNewMinHeroTitle] = useState('');
  const [newMinHeroDesc, setNewMinHeroDesc] = useState('');
  const [newMinColor, setNewMinColor] = useState('#3b82f6');
  const [newMinIcon, setNewMinIcon] = useState('Sparkles');
  const [newMinSchedule, setNewMinSchedule] = useState('');
  const [newMinLocation, setNewMinLocation] = useState('');
  const [newMinEmail, setNewMinEmail] = useState('');
  const [newMinLink, setNewMinLink] = useState('');
  
  // Pillars for the new ministry
  const [pillar1Title, setPillar1Title] = useState('');
  const [pillar1Desc, setPillar1Desc] = useState('');
  const [pillar2Title, setPillar2Title] = useState('');
  const [pillar2Desc, setPillar2Desc] = useState('');
  const [pillar3Title, setPillar3Title] = useState('');
  const [pillar3Desc, setPillar3Desc] = useState('');

  const loadMinistryDataToForm = (minId) => {
    const min = ministries.find(m => m.id === minId);
    if (min) {
      setSelectedMinIdToEdit(minId);
      setNewMinId(min.id);
      setNewMinName(min.name);
      setNewMinDesc(min.description);
      setNewMinHeroTitle(min.hero_title);
      setNewMinHeroDesc(min.hero_desc);
      setNewMinColor(min.accent_color);
      setNewMinIcon(min.icon_name);
      setNewMinSchedule(min.schedule);
      setNewMinLocation(min.location);
      setNewMinEmail(min.contact_email);
      setNewMinLink(min.contact_link);
      if (min.pillars && min.pillars.length >= 3) {
        setPillar1Title(min.pillars[0].title);
        setPillar1Desc(min.pillars[0].desc);
        setPillar2Title(min.pillars[1].title);
        setPillar2Desc(min.pillars[1].desc);
        setPillar3Title(min.pillars[2].title);
        setPillar3Desc(min.pillars[2].desc);
      }
    }
  };

  // 4. New Activity state
  const [actTitle, setActTitle] = useState('');
  const [actDate, setActDate] = useState(new Date().toISOString().split('T')[0]);
  const [actTime, setActTime] = useState('20:00');
  const [actDesc, setActDesc] = useState('');
  const [actMinId, setActMinId] = useState('general');

  // 5. Gallery state
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumCategory, setNewAlbumCategory] = useState('general');
  const [newAlbumDate, setNewAlbumDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAlbumId, setSelectedAlbumId] = useState(albums[0]?.id || '');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);

  const sampleUrls = [
    'https://images.unsplash.com/photo-1544427920-c49bcffe85a6?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523580494863-6f30312245d4?w=800&auto=format&fit=crop&q=80'
  ];

  // SUBMITS

  const handleUpdateStreaming = (e) => {
    e.preventDefault();
    updateLivestream({ title: liveTitle, videoUrl: liveUrl, isLive: isLive });
    updateRadio({ title: radioTitle, audioUrl: radioUrl, isLive: isRadioLive });
    triggerSuccess('Configuración de transmisiones de video y radio guardada con éxito.');
  };

  const handleUpdateSection = async (e) => {
    e.preventDefault();
    let bgUrl = sectionBgUrlText;

    if (isSupabaseConfigured && sectionBgFile) {
      setIsSectionUploading(true);
      try {
        const fileExt = sectionBgFile.name.split('.').pop();
        const fileName = `bg-${editingSectionId}-${Date.now()}.${fileExt}`;
        const filePath = `banners/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, sectionBgFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
        bgUrl = publicUrl;
      } catch (err) {
        console.error('Error uploading section background:', err);
        alert('Error al subir la imagen a Supabase.');
        setIsSectionUploading(false);
        return;
      }
      setIsSectionUploading(false);
    }

    await updateHomeSection(editingSectionId, {
      title: sectionTitle,
      subtitle: sectionSubtitle,
      button_text: sectionBtnText,
      button_url: sectionBtnUrl,
      bg_image: bgUrl
    });

    setSectionBgFile(null);
    setSectionBgUrlText(bgUrl);
    triggerSuccess('Sección de página de inicio actualizada con éxito.');
  };

  const handleSaveMinistry = async (e) => {
    e.preventDefault();
    if (!newMinId.trim() || !newMinName.trim()) return;

    // Assemble dynamic pillars array
    const pillars = [
      { icon: 'Calendar', title: pillar1Title || 'Horario', desc: pillar1Desc || 'Por programar' },
      { icon: 'MapPin', title: pillar2Title || 'Lugar', desc: pillar2Desc || 'IMR4' },
      { icon: 'Sparkles', title: pillar3Title || 'Actividades', desc: pillar3Desc || 'Espacio dinámico' }
    ];

    const ministryData = {
      id: newMinId.trim().toLowerCase().replace(/[^a-z0-9]/g, ''),
      name: newMinName.trim(),
      description: newMinDesc.trim(),
      hero_title: newMinHeroTitle.trim() || newMinName.trim(),
      hero_desc: newMinHeroDesc.trim() || newMinDesc.trim(),
      accent_color: newMinColor,
      icon_name: newMinIcon,
      pillars: pillars,
      schedule: newMinSchedule.trim() || 'Por definir',
      location: newMinLocation.trim() || 'Salón Principal',
      contact_email: newMinEmail.trim() || 'contacto@imr4.org',
      contact_link: newMinLink.trim() || 'https://wa.me/#'
    };

    if (minAction === 'edit') {
      await updateMinistry(selectedMinIdToEdit, ministryData);
      triggerSuccess(`Cambios del ministerio "${newMinName}" guardados con éxito.`);
    } else {
      await addMinistry(ministryData);
      triggerSuccess(`Ministerio "${newMinName}" creado con éxito.`);
    }

    // Reset fields
    setNewMinId('');
    setNewMinName('');
    setNewMinDesc('');
    setNewMinHeroTitle('');
    setNewMinHeroDesc('');
    setNewMinSchedule('');
    setNewMinLocation('');
    setNewMinEmail('');
    setNewMinLink('');
    setPillar1Title(''); setPillar1Desc('');
    setPillar2Title(''); setPillar2Desc('');
    setPillar3Title(''); setPillar3Desc('');
    setSelectedMinIdToEdit('');
    setMinAction('create');
  };

  const handleCreateActivity = (e) => {
    e.preventDefault();
    if (!actTitle.trim()) return;

    addActivity({
      id: `act-${Date.now()}`,
      title: actTitle.trim(),
      date: actDate,
      time: actTime,
      description: actDesc.trim(),
      image_url: 'https://images.unsplash.com/photo-1523580494863-6f30312245d4?w=800&q=80',
      ministry_id: actMinId
    });

    setActTitle('');
    setActDesc('');
    triggerSuccess('Actividad programada en el calendario con éxito.');
  };

  const handleCreateAlbum = (e) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) return;

    addAlbum({
      id: `album-${Date.now()}`,
      title: newAlbumTitle.trim(),
      category: newAlbumCategory,
      date: newAlbumDate,
      photos: []
    });

    setNewAlbumTitle('');
    triggerSuccess('Álbum fotográfico creado con éxito.');
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!selectedAlbumId) return;

    if (isSupabaseConfigured && selectedFile) {
      setIsPhotoUploading(true);
      try {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${selectedAlbumId}/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, selectedFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
        await addPhotoToAlbum(selectedAlbumId, publicUrl);
        setSelectedFile(null);
        triggerSuccess('Foto subida y agregada con éxito al álbum.');
      } catch (err) {
        console.error(err);
        alert('Error al subir la foto.');
      } finally {
        setIsPhotoUploading(false);
      }
    } else if (newPhotoUrl.trim()) {
      await addPhotoToAlbum(selectedAlbumId, newPhotoUrl.trim());
      setNewPhotoUrl('');
      triggerSuccess('Enlace de foto agregado con éxito al álbum.');
    }
  };

  return (
    <div className="theme-imr4" style={{ minHeight: '100vh', padding: '6.5rem 1.5rem 4rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
            Panel de Control
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            Administra transmisiones, secciones visuales de inicio, ministerios, calendario de actividades y galerías de fotos.
          </p>

          {/* Connection Status */}
          {isSupabaseConfigured ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              padding: '0.5rem 1.25rem',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              <CheckCircle size={16} />
              Base de Datos Supabase Conectada (Tiempo real activo)
            </div>
          ) : (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(249, 115, 22, 0.08)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              color: '#f97316',
              padding: '0.5rem 1.25rem',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              <AlertTriangle size={16} />
              Almacenamiento Local (Edita el archivo .env para conectar a la nube)
            </div>
          )}
        </div>

        {/* Global Temporary Success Message */}
        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            padding: '0.75rem 1.25rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeIn 0.3s'
          }}>
            <CheckCircle size={16} />
            {successMsg}
          </div>
        )}

        {/* Tab switchers */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '2rem',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'streaming', label: 'Transmisiones', icon: <Tv size={16} /> },
            { id: 'home_sections', label: 'Secciones Inicio', icon: <Layers size={16} /> },
            { id: 'ministries', label: 'Ministerios', icon: <Users size={16} /> },
            { id: 'activities', label: 'Actividades', icon: <Calendar size={16} /> },
            { id: 'photos', label: 'Galería de Fotos', icon: <Image size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                background: activeTab === tab.id ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-color)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--accent-color)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: STREAMING CONFIG (VIDEO & RADIO) */}
        {activeTab === 'streaming' && (
          <div className="animate-fade-in grid-cols-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            
            {/* Live stream */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <Tv size={20} style={{ color: 'var(--accent-color)' }} />
                Streaming de Video (YouTube Live)
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Título de la Transmisión</label>
                  <input type="text" value={liveTitle} onChange={(e) => setLiveTitle(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Enlace Embed de YouTube</label>
                  <input type="text" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" id="isLive" checked={isLive} onChange={(e) => setIsLive(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                  <label htmlFor="isLive" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Habilitar señal de transmisión En Vivo</label>
                </div>
              </div>
            </div>

            {/* Radio stream */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <Radio size={20} style={{ color: 'var(--accent-color)' }} />
                Radio Online
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Título del Programa de Radio</label>
                  <input type="text" value={radioTitle} onChange={(e) => setRadioTitle(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>URL del Stream de Audio</label>
                  <input type="text" value={radioUrl} onChange={(e) => setRadioUrl(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" id="isRadioLive" checked={isRadioLive} onChange={(e) => setIsRadioLive(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                  <label htmlFor="isRadioLive" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Marcar radio como activa En Vivo</label>
                </div>
              </div>
            </div>

            <button onClick={handleUpdateStreaming} className="btn btn-primary" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
              <Save size={16} /> Guardar Cambios de Transmisión
            </button>
          </div>
        )}

        {/* TAB 2: SECCIONES DE INICIO (ESTILO BANNERS PAS.cr) */}
        {activeTab === 'home_sections' && (
          <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <Layers size={20} style={{ color: 'var(--accent-color)' }} />
              Editar Banners de Fondo (Página de Inicio)
            </h2>

            <form onSubmit={handleUpdateSection} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }} className="grid-cols-2">
                
                {/* Selector de Banner a editar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Selecciona el Banner a editar</label>
                  <select
                    value={editingSectionId}
                    onChange={(e) => loadSectionData(e.target.value)}
                    style={selectStyle}
                  >
                    {homeSections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.id === 'hero' ? 'Banner Principal (Hero)' : sec.title}
                      </option>
                    ))}
                  </select>
                  <div style={{ marginTop: '1rem', border: '1px solid var(--border-color)', borderRadius: '0.35rem', overflow: 'hidden', height: '120px' }}>
                    <img src={sectionBgUrlText} alt="Previsualización de fondo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>

                {/* Form fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Título Principal</label>
                    <input type="text" value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} style={inputStyle} required />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Subtítulo / Descripción</label>
                    <textarea value={sectionSubtitle} onChange={(e) => setSectionSubtitle(e.target.value)} style={{ ...inputStyle, minHeight: '60px', fontFamily: 'inherit' }} required />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Texto del Botón</label>
                      <input type="text" value={sectionBtnText} onChange={(e) => setSectionBtnText(e.target.value)} style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Enlace del Botón</label>
                      <input type="text" value={sectionBtnUrl} onChange={(e) => setSectionBtnUrl(e.target.value)} style={inputStyle} />
                    </div>
                  </div>

                  {/* Bg upload */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px dashed var(--border-color)', padding: '0.75rem', borderRadius: '0.35rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-color)' }}>Imagen de Fondo</span>
                    {isSupabaseConfigured ? (
                      <input type="file" accept="image/*" onChange={(e) => setSectionBgFile(e.target.files[0])} style={{ fontSize: '0.8rem' }} />
                    ) : (
                      <input type="text" placeholder="URL de la imagen de fondo" value={sectionBgUrlText} onChange={(e) => setSectionBgUrlText(e.target.value)} style={inputStyle} />
                    )}
                  </div>
                </div>

              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }} disabled={isSectionUploading}>
                {isSectionUploading ? 'Subiendo Imagen...' : 'Guardar Cambios del Banner'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: DYNAMIC MINISTRIES MANAGER */}
        {activeTab === 'ministries' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Form to create/edit ministry */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <Plus size={20} style={{ color: 'var(--accent-color)' }} />
                {minAction === 'edit' ? 'Editar Contenido de Ministerio Existente' : 'Crear / Agregar Nuevo Ministerio'}
              </h2>

              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Operación:</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="minAction"
                    value="create"
                    checked={minAction === 'create'}
                    onChange={() => {
                      setMinAction('create');
                      setNewMinId('');
                      setNewMinName('');
                      setNewMinDesc('');
                      setNewMinHeroTitle('');
                      setNewMinHeroDesc('');
                      setNewMinSchedule('');
                      setNewMinLocation('');
                      setNewMinEmail('');
                      setNewMinLink('');
                      setPillar1Title(''); setPillar1Desc('');
                      setPillar2Title(''); setPillar2Desc('');
                      setPillar3Title(''); setPillar3Desc('');
                      setSelectedMinIdToEdit('');
                    }}
                  />
                  Crear Nuevo
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="minAction"
                    value="edit"
                    checked={minAction === 'edit'}
                    onChange={() => setMinAction('edit')}
                  />
                  Editar Existente
                </label>
              </div>

              {minAction === 'edit' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-color)' }}>
                    Selecciona el Ministerio a Modificar
                  </label>
                  <select
                    value={selectedMinIdToEdit}
                    onChange={(e) => loadMinistryDataToForm(e.target.value)}
                    style={selectStyle}
                    required
                  >
                    <option value="" disabled>-- Elige un ministerio --</option>
                    {ministries.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <form onSubmit={handleSaveMinistry} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: '1rem' }} className="grid-cols-2">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Slug Único (Minúsculas/ID)</label>
                    <input
                      type="text"
                      placeholder="ej: nissi"
                      value={newMinId}
                      onChange={(e) => setNewMinId(e.target.value)}
                      style={inputStyle}
                      disabled={minAction === 'edit'}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nombre del Ministerio</label>
                    <input type="text" placeholder="ej: Danza Nissi" value={newMinName} onChange={(e) => setNewMinName(e.target.value)} style={inputStyle} required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Color Temático</label>
                    <input type="color" value={newMinColor} onChange={(e) => setNewMinColor(e.target.value)} style={{ ...inputStyle, padding: '0.2rem', height: '38px', cursor: 'pointer' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Icono Visual</label>
                    <select value={newMinIcon} onChange={(e) => setNewMinIcon(e.target.value)} style={selectStyle}>
                      <option value="Sparkles">Destellos (Danza/Artes)</option>
                      <option value="Flame">Fuego (Jóvenes)</option>
                      <option value="Heart">Corazón (Mujeres)</option>
                      <option value="Shield">Escudo (Hombres)</option>
                      <option value="Sun">Sol (Niños)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Resumen para Página de Inicio</label>
                    <input type="text" placeholder="ej: Nuestro grupo de expresión y danza litúrgica..." value={newMinDesc} onChange={(e) => setNewMinDesc(e.target.value)} style={inputStyle} required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Título Hero (Sub-sitio)</label>
                    <input type="text" placeholder="ej: Adorando a Dios en Movimiento" value={newMinHeroTitle} onChange={(e) => setNewMinHeroTitle(e.target.value)} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Descripción Larga (Sub-sitio)</label>
                  <textarea placeholder="Detalles de la misión del ministerio..." value={newMinHeroDesc} onChange={(e) => setNewMinHeroDesc(e.target.value)} style={{ ...inputStyle, minHeight: '60px', fontFamily: 'inherit' }} />
                </div>

                {/* Core Pillars Details */}
                <div style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.01)' }}>
                  <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-color)', marginBottom: '0.75rem' }}>Configuración de 3 Pilares de Actividades (Páginas de Ministerio)</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }} className="grid-cols-1">
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Pilar 1 (Reuniones)</span>
                      <input type="text" placeholder="Título (ej: Horarios)" value={pillar1Title} onChange={(e) => setPillar1Title(e.target.value)} style={{ ...inputStyle, fontSize: '0.8rem', margin: '4px 0' }} />
                      <input type="text" placeholder="Desc (ej: Sábados 18hs)" value={pillar1Desc} onChange={(e) => setPillar1Desc(e.target.value)} style={{ ...inputStyle, fontSize: '0.8rem' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Pilar 2 (Ubicación)</span>
                      <input type="text" placeholder="Título (ej: Ensayos)" value={pillar2Title} onChange={(e) => setPillar2Title(e.target.value)} style={{ ...inputStyle, fontSize: '0.8rem', margin: '4px 0' }} />
                      <input type="text" placeholder="Desc (ej: Salón Auxiliar)" value={pillar2Desc} onChange={(e) => setPillar2Desc(e.target.value)} style={{ ...inputStyle, fontSize: '0.8rem' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Pilar 3 (Especial)</span>
                      <input type="text" placeholder="Título (ej: Requisitos)" value={pillar3Title} onChange={(e) => setPillar3Title(e.target.value)} style={{ ...inputStyle, fontSize: '0.8rem', margin: '4px 0' }} />
                      <input type="text" placeholder="Desc (ej: Corazón dispuesto)" value={pillar3Desc} onChange={(e) => setPillar3Desc(e.target.value)} style={{ ...inputStyle, fontSize: '0.8rem' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }} className="grid-cols-2">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Horario Corto</label>
                    <input type="text" placeholder="ej: Viernes 19:30 hs" value={newMinSchedule} onChange={(e) => setNewMinSchedule(e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Lugar</label>
                    <input type="text" placeholder="ej: Salón Principal" value={newMinLocation} onChange={(e) => setNewMinLocation(e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Email de Contacto</label>
                    <input type="email" placeholder="nissi@imr4.org" value={newMinEmail} onChange={(e) => setNewMinEmail(e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>WhatsApp Link</label>
                    <input type="text" placeholder="https://wa.me/..." value={newMinLink} onChange={(e) => setNewMinLink(e.target.value)} style={inputStyle} />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', marginTop: '0.5rem' }}>
                  <Save size={16} /> {minAction === 'edit' ? 'Guardar Cambios del Ministerio' : 'Crear Ministerio'}
                </button>
              </form>
            </div>

            {/* List of existing ministries */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Ministerios Activos</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {ministries.map((m) => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: m.accent_color }}></span>
                      <strong>{m.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({m.id})</span>
                    </div>
                    {/* Only allow deleting custom ministries, or allow deleting all */}
                    <button
                      onClick={() => {
                        if (confirm(`¿Estás seguro de eliminar el ministerio "${m.name}"?`)) {
                          deleteMinistry(m.id);
                          triggerSuccess(`Ministerio "${m.name}" eliminado.`);
                        }
                      }}
                      className="btn btn-danger"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: CALENDAR / UPCOMING ACTIVITIES */}
        {activeTab === 'activities' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Form to schedule event */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <Calendar size={20} style={{ color: 'var(--accent-color)' }} />
                Programar Próxima Actividad / Evento
              </h2>

              <form onSubmit={handleCreateActivity} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem' }} className="grid-cols-2">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nombre de la Actividad</label>
                    <input type="text" placeholder="ej: Ensayo Especial, Campamento..." value={actTitle} onChange={(e) => setActTitle(e.target.value)} style={inputStyle} required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Fecha</label>
                    <input type="date" value={actDate} onChange={(e) => setActDate(e.target.value)} style={inputStyle} required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Hora</label>
                    <input type="time" value={actTime} onChange={(e) => setActTime(e.target.value)} style={inputStyle} required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Organiza</label>
                    <select value={actMinId} onChange={(e) => setActMinId(e.target.value)} style={selectStyle}>
                      <option value="general">General (Toda la iglesia)</option>
                      {ministries.map(m => (
                        <option key={m.id} value={m.id}>{m.name.split(' - ')[0]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Descripción / Detalles</label>
                  <textarea placeholder="Lugar, detalles importantes o requerimientos..." value={actDesc} onChange={(e) => setActDesc(e.target.value)} style={{ ...inputStyle, minHeight: '60px', fontFamily: 'inherit' }} required />
                </div>

                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', marginTop: '0.5rem' }}>
                  <Plus size={16} /> Programar Actividad
                </button>
              </form>
            </div>

            {/* List of calendar events */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Calendario Activo</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {activities.map((act) => {
                  const oMin = ministries.find(m => m.id === act.ministry_id);
                  return (
                    <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '0.35rem' }}>
                      <div>
                        <strong style={{ color: '#fff' }}>{act.title}</strong>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.15rem 0.4rem', borderRadius: '0.2rem', marginLeft: '0.5rem', color: oMin ? oMin.accent_color : 'var(--text-muted)' }}>
                          {oMin ? oMin.name.split(' - ')[0] : 'General'}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          Fecha: {act.date} | Hora: {act.time} hs
                        </div>
                      </div>
                      <button onClick={() => { deleteActivity(act.id); triggerSuccess('Actividad eliminada.'); }} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: GALLERY & PHOTO UPLOADS */}
        {activeTab === 'photos' && (
          <div className="animate-fade-in grid-cols-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            
            {/* Create Album */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <Plus size={20} style={{ color: 'var(--accent-color)' }} />
                Crear Álbum / Evento
              </h2>

              <form onSubmit={handleCreateAlbum} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nombre del Álbum</label>
                  <input type="text" placeholder="ej: Domingo 23, Campamento 2026" value={newAlbumTitle} onChange={(e) => setNewAlbumTitle(e.target.value)} style={inputStyle} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Categoría / Organizador</label>
                    <select value={newAlbumCategory} onChange={(e) => setNewAlbumCategory(e.target.value)} style={selectStyle}>
                      <option value="general">General</option>
                      {ministries.map(m => (
                        <option key={m.id} value={m.id}>{m.name.split(' - ')[0]}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Fecha</label>
                    <input type="date" value={newAlbumDate} onChange={(e) => setNewAlbumDate(e.target.value)} style={inputStyle} required />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                  Crear Álbum
                </button>
              </form>
            </div>

            {/* Upload photos to album */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <Upload size={20} style={{ color: 'var(--accent-color)' }} />
                Subir Fotos al Álbum
              </h2>

              <form onSubmit={handleAddPhoto} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Seleccionar Álbum de Destino</label>
                  <select value={selectedAlbumId} onChange={(e) => setSelectedAlbumId(e.target.value)} style={selectStyle} required>
                    <option value="" disabled>-- Elige un álbum --</option>
                    {albums.map((album) => (
                      <option key={album.id} value={album.id}>
                        {album.title} ({album.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px dashed var(--border-color)', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.01)' }}>
                  
                  {isSupabaseConfigured ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-color)' }}>Opción A: Subir imagen local</label>
                      <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: '0.8rem' }} />
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      (Subida física requiere credenciales de Supabase en .env)
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-color)' }}>{isSupabaseConfigured ? 'Opción B: Pegar enlace URL' : 'Pegar enlace URL'}</label>
                    <input type="text" placeholder="https://enlace.com/foto.jpg" value={newPhotoUrl} onChange={(e) => { setNewPhotoUrl(e.target.value); setSelectedFile(null); }} style={inputStyle} />
                  </div>
                </div>

                {/* Sample Loader */}
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {sampleUrls.map((url, i) => (
                    <button key={i} type="button" onClick={() => loadSampleUrl(url)} style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '0.25rem', cursor: 'pointer' }}>
                      Foto Muestra {i + 1}
                    </button>
                  ))}
                </div>

                <button type="submit" className="btn btn-primary" disabled={isPhotoUploading}>
                  {isPhotoUploading ? 'Subiendo...' : 'Agregar Foto'}
                </button>
              </form>
            </div>

            {/* List and Delete Album */}
            <div className="glass-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Álbumes Activos</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {albums.map((album) => (
                  <div key={album.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '0.35rem' }}>
                    <div>
                      <strong>{album.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                        ({album.category}) | {album.photos?.length || 0} fotos | {album.date}
                      </span>
                    </div>
                    <button onClick={() => { deleteAlbum(album.id); triggerSuccess('Álbum eliminado.'); }} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

// STYLES TO KEEP ADMIN STUNNING & DARK
const inputStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid var(--border-color)',
  color: 'var(--text-primary)',
  padding: '0.55rem 0.75rem',
  borderRadius: '0.35rem',
  outline: 'none',
  fontSize: '0.9rem',
  width: '100%',
  transition: 'border-color 0.2s'
};

const selectStyle = {
  background: 'rgba(18, 18, 22, 0.95)',
  border: '1px solid var(--border-color)',
  color: 'var(--text-primary)',
  padding: '0.55rem 0.75rem',
  borderRadius: '0.35rem',
  outline: 'none',
  fontSize: '0.9rem',
  width: '100%',
  cursor: 'pointer'
};
