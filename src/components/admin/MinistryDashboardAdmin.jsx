import React, { useState, useContext, useEffect } from 'react';
import { GalleryContext } from '../../context/GalleryContext';
import { supabase, isSupabaseConfigured } from '../../supabaseClient';
import { ArrowLeft, User, Calendar, Image as ImageIcon, Save, Plus, Trash2, Upload, Edit2, Palette, Gamepad2 } from 'lucide-react';
import ImageUploadDropzone from './ImageUploadDropzone';
import { resolveImageUrl } from '../../utils/imageUtils';

export default function MinistryDashboardAdmin({ ministryId, onBack, triggerSuccess, initialTab }) {
  const {
    ministries,
    updateMinistry,
    activities,
    addActivity,
    deleteActivity,
    updateActivity,
    albums,
    addAlbum,
    deleteAlbum,
    updateAlbum,
    addPhotoToAlbum,
    removePhotoFromAlbum
  } = useContext(GalleryContext);

  const [activeTab, setActiveTab] = useState(initialTab || (ministryId === 'general' ? 'photos' : 'profile'));
  
  // Ministry data
  const min = ministryId === 'general' 
    ? { id: 'general', name: 'Iglesia General', accent_color: '#10b981' } 
    : ministries.find(m => m.id === ministryId);
  const minActivities = activities.filter(a => a.ministry_id === ministryId);
  // We check if album has ministry_id, if not fallback to category to match older records
  const minAlbums = albums.filter(a => (a.ministry_id || a.category) === ministryId);

  // Profile Form State
  const [minName, setMinName] = useState(min?.name || '');
  const [minDesc, setMinDesc] = useState(min?.description || '');
  const [minHeroTitle, setMinHeroTitle] = useState(min?.hero_title || '');
  const [minHeroDesc, setMinHeroDesc] = useState(min?.hero_desc || '');
  const [minColor, setMinColor] = useState(min?.accent_color || '#3b82f6');
  const [minLogoUrl, setMinLogoUrl] = useState(min?.logo_url || '');
  const [minLogoFile, setMinLogoFile] = useState(null);
  const [isMinLogoUploading, setIsMinLogoUploading] = useState(false);
  const [minHeroImageUrl, setMinHeroImageUrl] = useState(min?.hero_image || '');
  const [minHeroImageFile, setMinHeroImageFile] = useState(null);
  const [isMinHeroUploading, setIsMinHeroUploading] = useState(false);
  const [minSchedule, setMinSchedule] = useState(min?.schedule || '');
  const [minLocation, setMinLocation] = useState(min?.location || '');
  const [minLocationUrl, setMinLocationUrl] = useState(min?.location_url || '');
  const [minEmail, setMinEmail] = useState(min?.contact_email || '');
  const [minLink, setMinLink] = useState(min?.contact_link || '');
  const [minInstagram, setMinInstagram] = useState(min?.instagram_url || '');
  const [minContactTitle, setMinContactTitle] = useState(min?.contact_title || '');
  const [minContactDesc, setMinContactDesc] = useState(min?.contact_desc || '');
  const [minContactButtonText, setMinContactButtonText] = useState(min?.contact_button_text || '');
  
  // Visual Settings State
  const [minThemeMode, setMinThemeMode] = useState(min?.visual_settings?.theme_mode || 'dark');
  const [minLayoutStyle, setMinLayoutStyle] = useState(min?.visual_settings?.layout_style || 'modern');
  const [minPrimaryActionText, setMinPrimaryActionText] = useState(min?.visual_settings?.primary_action_text || 'Participar');
  const [minPrimaryActionUrl, setMinPrimaryActionUrl] = useState(min?.visual_settings?.primary_action_url || '#contacto');
  const [minPillarsLabel, setMinPillarsLabel] = useState(min?.visual_settings?.custom_labels?.pillars || 'Pilares');
  
  const [minPillars, setMinPillars] = useState(() => {
    if (min?.pillars && min.pillars.length > 0) {
      return min.pillars.map((p, i) => ({ ...p, _localId: i, file: null }));
    }
    return [
      { _localId: 0, icon: 'Calendar', title: '', desc: '', image_url: '', file: null },
      { _localId: 1, icon: 'MapPin', title: '', desc: '', image_url: '', file: null },
      { _localId: 2, icon: 'Users', title: '', desc: '', image_url: '', file: null }
    ];
  });

  const addPillar = () => {
    setMinPillars([...minPillars, { _localId: Date.now(), icon: 'Info', title: '', desc: '', image_url: '', file: null }]);
  };

  const removePillar = (id) => {
    setMinPillars(minPillars.filter(p => p._localId !== id));
  };

  const updatePillar = (id, field, value) => {
    setMinPillars(minPillars.map(p => p._localId === id ? { ...p, [field]: value } : p));
  };

  // Fun Zone State
  const [minFunZonePuzzleEnabled, setMinFunZonePuzzleEnabled] = useState(min?.fun_zone?.puzzle?.enabled ?? true);
  const [minFunZonePuzzleTitle, setMinFunZonePuzzleTitle] = useState(min?.fun_zone?.puzzle?.title || 'Rompecabezas Bíblico');
  const [minFunZonePuzzleDifficulty, setMinFunZonePuzzleDifficulty] = useState(min?.fun_zone?.puzzle?.difficulty || '3x3');
  const [minFunZonePuzzleImageUrl, setMinFunZonePuzzleImageUrl] = useState(min?.fun_zone?.puzzle?.image_url || '');
  const [minFunZonePuzzleImageFile, setMinFunZonePuzzleImageFile] = useState(null);
  
  const [minFunZoneVideosEnabled, setMinFunZoneVideosEnabled] = useState(min?.fun_zone?.videos?.enabled ?? true);
  const [minFunZoneVideosTitle, setMinFunZoneVideosTitle] = useState(min?.fun_zone?.videos?.title || 'Videos y Canciones');
  const [minFunZoneVideosUrl, setMinFunZoneVideosUrl] = useState(min?.fun_zone?.videos?.youtube_url || '');
  const [minFunZoneVideosButtonText, setMinFunZoneVideosButtonText] = useState(min?.fun_zone?.videos?.button_text || 'Ver ahora');
  
  const [isMinFunZoneUploading, setIsMinFunZoneUploading] = useState(false);

  // Activity Form State
  const [actTitle, setActTitle] = useState('');
  const [actDate, setActDate] = useState(new Date().toISOString().split('T')[0]);
  const [actTime, setActTime] = useState('20:00');
  const [actDesc, setActDesc] = useState('');
  const [actLocationUrl, setActLocationUrl] = useState('');
  const [actImageFile, setActImageFile] = useState(null);
  const [isActUploading, setIsActUploading] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState(null);

  const loadActivityData = (activity) => {
    setEditingActivityId(activity.id);
    setActTitle(activity.title || '');
    setActDate(activity.date || '');
    setActTime(activity.time || '');
    setActDesc(activity.description || '');
    setActLocationUrl(activity.location_url || '');
    setActImageFile(null); // image preview can be handled later if needed
  };

  const cancelActivityEdit = () => {
    setEditingActivityId(null);
    setActTitle('');
    setActDesc('');
    setActLocationUrl('');
    setActImageFile(null);
  };

  // Gallery Form State
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumDate, setNewAlbumDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAlbumDesc, setNewAlbumDesc] = useState('');
  const [newAlbumDriveLink, setNewAlbumDriveLink] = useState('');
  const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);

  // Handlers
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    let finalLogoUrl = minLogoUrl;

    if (minLogoFile && isSupabaseConfigured) {
      setIsMinLogoUploading(true);
      try {
        const fileExt = minLogoFile.name.split('.').pop();
        const fileName = `minlogo_${Date.now()}.${fileExt}`;
        const filePath = `logos/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, minLogoFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
        finalLogoUrl = publicUrl;
      } catch (err) {
        console.error('Error uploading logo:', err);
        alert('Error al subir el logo del ministerio.');
        setIsMinLogoUploading(false);
        return;
      }
      setIsMinLogoUploading(false);
    }

    let finalHeroImageUrl = minHeroImageUrl;

    if (minHeroImageFile && isSupabaseConfigured) {
      setIsMinHeroUploading(true);
      try {
        const fileExt = minHeroImageFile.name.split('.').pop();
        const fileName = `minhero_${Date.now()}.${fileExt}`;
        const filePath = `banners/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, minHeroImageFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
        finalHeroImageUrl = publicUrl;
      } catch (err) {
        console.error('Error uploading hero image:', err);
        alert('Error al subir la portada del ministerio.');
        setIsMinHeroUploading(false);
        return;
      }
      setIsMinHeroUploading(false);
    }

    setIsMinHeroUploading(true); // Reusing upload state to disable save button
    const finalPillars = [];
    for (const p of minPillars) {
      let finalPillarImgUrl = p.image_url || '';
      if (p.file && isSupabaseConfigured) {
        try {
          const fileExt = p.file.name.split('.').pop();
          const fileName = `pillar_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `pillars/${fileName}`;
          const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, p.file);
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
            finalPillarImgUrl = publicUrl;
          }
        } catch (err) {
          console.error('Error uploading pillar image:', err);
        }
      }
      finalPillars.push({ icon: p.icon, title: p.title, desc: p.desc, image_url: finalPillarImgUrl });
    }
    setIsMinHeroUploading(false);

    let finalPuzzleImageUrl = minFunZonePuzzleImageUrl;
    if (minFunZonePuzzleImageFile && isSupabaseConfigured) {
      setIsMinFunZoneUploading(true);
      try {
        const fileExt = minFunZonePuzzleImageFile.name.split('.').pop();
        const fileName = `puzzle_${Date.now()}.${fileExt}`;
        const filePath = `funzone/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, minFunZonePuzzleImageFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
        finalPuzzleImageUrl = publicUrl;
      } catch (err) {
        console.error('Error uploading puzzle image:', err);
        alert('Error al subir la imagen del rompecabezas.');
        setIsMinFunZoneUploading(false);
        return;
      }
      setIsMinFunZoneUploading(false);
    }

    const updates = {
      name: minName,
      description: minDesc,
      hero_title: minHeroTitle,
      hero_desc: minHeroDesc,
      accent_color: minColor,
      logo_url: resolveImageUrl(finalLogoUrl),
      hero_image: resolveImageUrl(finalHeroImageUrl),
      schedule: minSchedule,
      location: minLocation,
      location_url: minLocationUrl,
      contact_email: minEmail,
      contact_link: minLink,
      instagram_url: minInstagram,
      contact_title: minContactTitle,
      contact_desc: minContactDesc,
      contact_button_text: minContactButtonText,
      pillars: finalPillars,
      visual_settings: {
        theme_mode: minThemeMode,
        layout_style: minLayoutStyle,
        primary_action_text: minPrimaryActionText,
        primary_action_url: minPrimaryActionUrl,
        custom_labels: { pillars: minPillarsLabel }
      },
      fun_zone: {
        puzzle: {
          enabled: minFunZonePuzzleEnabled,
          title: minFunZonePuzzleTitle,
          difficulty: minFunZonePuzzleDifficulty,
          image_url: resolveImageUrl(finalPuzzleImageUrl)
        },
        videos: {
          enabled: minFunZoneVideosEnabled,
          title: minFunZoneVideosTitle,
          youtube_url: minFunZoneVideosUrl,
          button_text: minFunZoneVideosButtonText
        }
      }
    };
    await updateMinistry(ministryId, updates);
    setMinLogoUrl(finalLogoUrl);
    setMinLogoFile(null);
    setMinHeroImageUrl(finalHeroImageUrl);
    setMinHeroImageFile(null);
    setMinFunZonePuzzleImageUrl(finalPuzzleImageUrl);
    setMinFunZonePuzzleImageFile(null);
    triggerSuccess('Perfil del ministerio actualizado.');
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    let finalImageUrl = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'; // default

    if (actImageFile && isSupabaseConfigured) {
      setIsActUploading(true);
      try {
        const fileExt = actImageFile.name.split('.').pop();
        const fileName = `act_${Date.now()}.${fileExt}`;
        const filePath = `activities/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, actImageFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
        finalImageUrl = publicUrl;
      } catch (err) {
        console.error('Error uploading activity image:', err);
        alert('Error al subir la imagen de la actividad.');
        setIsActUploading(false);
        return;
      }
      setIsActUploading(false);
    }

    const updates = {
      title: actTitle,
      date: actDate,
      time: actTime,
      description: actDesc,
      location_url: actLocationUrl,
      ministry_id: ministryId
    };
    
    if (finalImageUrl !== 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80') {
      updates.image_url = finalImageUrl;
    }

    if (editingActivityId) {
      await updateActivity(editingActivityId, updates);
      triggerSuccess('Actividad actualizada.');
      cancelActivityEdit();
    } else {
      updates.id = `act-${Date.now()}`;
      if (!updates.image_url) updates.image_url = finalImageUrl; // fallback for new
      await addActivity(updates);
      triggerSuccess('Actividad creada para este ministerio.');
      cancelActivityEdit();
    }
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    const newAlbumId = `album-${Date.now()}`;
    const newAlbum = {
      id: newAlbumId,
      title: newAlbumTitle,
      description: newAlbumDesc,
      drive_link: newAlbumDriveLink,
      category: ministryId, // keep for backward compatibility
      ministry_id: ministryId,
      date: newAlbumDate,
      photos: []
    };
    await addAlbum(newAlbum);
    // En lugar de limpiar y salir, abrimos el álbum para editar e ingresar fotos
    setEditingAlbumId(newAlbumId);
    triggerSuccess('Álbum creado exitosamente. Ahora puedes agregar fotos.');
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
      setNewPhotoUrl('');
    }
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    const targetAlbumId = editingAlbumId || selectedAlbumId;
    if (!targetAlbumId) {
      alert('Selecciona un álbum primero');
      return;
    }

    if (isSupabaseConfigured && selectedFiles.length > 0) {
      setIsPhotoUploading(true);
      try {
        const uploadPromises = selectedFiles.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${targetAlbumId}/${fileName}`;

          const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, file);
          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
          return publicUrl;
        });
        
        const uploadedUrls = await Promise.all(uploadPromises);

        const addPromises = uploadedUrls.map(url => addPhotoToAlbum(targetAlbumId, url));
        await Promise.all(addPromises);
        setSelectedFiles([]);
        triggerSuccess('Fotos subidas y agregadas con éxito al álbum.');
      } catch (err) {
        console.error(err);
        alert('Error al subir las fotos.');
      } finally {
        setIsPhotoUploading(false);
      }
    } else if (newPhotoUrl.trim()) {
      await addPhotoToAlbum(targetAlbumId, resolveImageUrl(newPhotoUrl.trim()));
      setNewPhotoUrl('');
      triggerSuccess('Enlace de foto agregado con éxito al álbum.');
    }
  };

  const handleUpdateAlbum = async (e) => {
    e.preventDefault();
    if (!editingAlbumId) return;
    await updateAlbum(editingAlbumId, {
      title: newAlbumTitle,
      date: newAlbumDate,
      description: newAlbumDesc,
      drive_link: newAlbumDriveLink
    });
    triggerSuccess('Información del álbum actualizada.');
  };

  const openEditAlbum = (album) => {
    setEditingAlbumId(album.id);
    setNewAlbumTitle(album.title || '');
    setNewAlbumDate(album.date || '');
    setNewAlbumDesc(album.description || '');
    setNewAlbumDriveLink(album.drive_link || '');
  };

  const closeEditAlbum = () => {
    setEditingAlbumId(null);
    setNewAlbumTitle('');
    setNewAlbumDate(new Date().toISOString().split('T')[0]);
    setNewAlbumDesc('');
    setNewAlbumDriveLink('');
    setSelectedFiles([]);
    setNewPhotoUrl('');
  };

  if (!min) return <div>Ministerio no encontrado</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header and Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <button onClick={onBack} className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem' }}>
          <ArrowLeft size={16} /> Volver
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: min.accent_color }}></div>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Dashboard: {min.name}</h2>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        {ministryId !== 'general' && (
          <button onClick={() => setActiveTab('profile')} className={`btn ${activeTab === 'profile' ? 'btn-primary' : ''}`} style={{ background: activeTab !== 'profile' ? 'transparent' : '', color: activeTab !== 'profile' ? 'var(--text-secondary)' : '' }}>
            <User size={16} /> Perfil
          </button>
        )}
        {ministryId !== 'general' && (
          <button onClick={() => setActiveTab('visual')} className={`btn ${activeTab === 'visual' ? 'btn-primary' : ''}`} style={{ background: activeTab !== 'visual' ? 'transparent' : '', color: activeTab !== 'visual' ? 'var(--text-secondary)' : '' }}>
            <Palette size={16} /> Identidad Visual
          </button>
        )}
        {ministryId !== 'general' && (
          <button onClick={() => setActiveTab('activities')} className={`btn ${activeTab === 'activities' ? 'btn-primary' : ''}`} style={{ background: activeTab !== 'activities' ? 'transparent' : '', color: activeTab !== 'activities' ? 'var(--text-secondary)' : '' }}>
            <Calendar size={16} /> Actividades ({minActivities.length})
          </button>
        )}
        {ministryId !== 'general' && minLayoutStyle === 'playful' && (
          <button onClick={() => setActiveTab('fun_zone')} className={`btn ${activeTab === 'fun_zone' ? 'btn-primary' : ''}`} style={{ background: activeTab !== 'fun_zone' ? 'transparent' : '', color: activeTab !== 'fun_zone' ? 'var(--text-secondary)' : '' }}>
            <Gamepad2 size={16} /> Zona de Diversión
          </button>
        )}
        <button onClick={() => setActiveTab('photos')} className={`btn ${activeTab === 'photos' ? 'btn-primary' : ''}`} style={{ background: activeTab !== 'photos' ? 'transparent' : '', color: activeTab !== 'photos' ? 'var(--text-secondary)' : '' }}>
          <ImageIcon size={16} /> Galería ({minAlbums.length})
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
           <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Información General</h3>
           
           <div className="grid-cols-3" style={{ display: 'grid', gap: '1rem' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
               <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nombre del Ministerio</label>
               <input type="text" value={minName} onChange={(e) => setMinName(e.target.value)} style={inputStyle} required />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
               <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Color Temático</label>
               <input type="color" value={minColor} onChange={(e) => setMinColor(e.target.value)} style={{ ...inputStyle, padding: '0.2rem', height: '38px', cursor: 'pointer' }} />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Logo del Ministerio (Subir o URL)</label>
                {isSupabaseConfigured ? (
                  <ImageUploadDropzone 
                    onFileSelect={(file) => setMinLogoFile(file)} 
                    previewUrl={minLogoFile ? URL.createObjectURL(minLogoFile) : minLogoUrl} 
                    label="Subir Logo" 
                  />
                ) : (
                  <>
                    <input type="text" placeholder="https://..." value={minLogoUrl} onChange={(e) => setMinLogoUrl(e.target.value)} style={inputStyle} />
                    {(minLogoUrl) && (
                      <div style={{ marginTop: '0.5rem', width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#000' }}>
                        <img src={minLogoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                  </>
                )}
              </div>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
             <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Descripción (Página de Inicio)</label>
             <input type="text" value={minDesc} onChange={(e) => setMinDesc(e.target.value)} style={inputStyle} required />
           </div>

           <div className="grid-cols-2" style={{ display: 'grid', gap: '1rem' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
               <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Título Hero (Sub-sitio)</label>
               <input type="text" value={minHeroTitle} onChange={(e) => setMinHeroTitle(e.target.value)} style={inputStyle} />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
               <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Descripción Larga (Sub-sitio)</label>
               <textarea value={minHeroDesc} onChange={(e) => setMinHeroDesc(e.target.value)} style={{ ...inputStyle, minHeight: '60px' }} />
             </div>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px dashed var(--border-color)', padding: '0.75rem', borderRadius: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Foto de Portada del Ministerio (Fondo)</label>
              {isSupabaseConfigured ? (
                 <ImageUploadDropzone 
                   onFileSelect={(file) => setMinHeroImageFile(file)} 
                   previewUrl={minHeroImageFile ? URL.createObjectURL(minHeroImageFile) : minHeroImageUrl} 
                   label="Subir Portada" 
                   size="large"
                 />
              ) : (
                <>
                  <input type="text" placeholder="URL..." value={minHeroImageUrl} onChange={(e) => setMinHeroImageUrl(e.target.value)} style={inputStyle} />
                  {(minHeroImageUrl) && (
                    <div style={{ marginTop: '0.5rem', width: '100%', height: '100px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#111' }}>
                      <img src={minHeroImageUrl} alt="Hero Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </>
              )}
            </div>

           {/* Core Pillars */}
           <div style={{ border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.01)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
               <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-color)' }}>Tarjetas de Información (Pilares)</span>
               <button type="button" onClick={addPillar} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>+ Agregar Tarjeta</button>
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {minPillars.map((pillar, index) => (
                 <div key={pillar._localId} className="grid-cols-4" style={{ display: 'grid', gap: '1rem', alignItems: 'flex-start', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.35rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                   <div>
                     <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Icono & Título</span>
                     <input type="text" placeholder="Ej: Calendar, Heart..." value={pillar.icon} onChange={(e) => updatePillar(pillar._localId, 'icon', e.target.value)} style={{ ...inputStyle, fontSize: '0.8rem', margin: '4px 0' }} />
                     <input type="text" placeholder="Título" value={pillar.title} onChange={(e) => updatePillar(pillar._localId, 'title', e.target.value)} style={{ ...inputStyle, fontSize: '0.8rem' }} />
                   </div>
                   <div>
                     <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Descripción Corta</span>
                     <textarea placeholder="Texto explicativo..." value={pillar.desc} onChange={(e) => updatePillar(pillar._localId, 'desc', e.target.value)} style={{ ...inputStyle, fontSize: '0.8rem', margin: '4px 0', minHeight: '68px' }} />
                   </div>
                   <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Imagen de Fondo</span>
                      <ImageUploadDropzone 
                        onFileSelect={(file) => updatePillar(pillar._localId, 'file', file)} 
                        previewUrl={pillar.file ? URL.createObjectURL(pillar.file) : pillar.image_url} 
                        label="Fondo" 
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removePillar(pillar._localId)} 
                      title="Eliminar tarjeta"
                      style={{ 
                        background: 'rgba(239,68,68,0.12)',
                        border: '1px solid rgba(239,68,68,0.35)',
                        borderRadius: '0.5rem',
                        padding: '0.5rem 0.65rem',
                        cursor: 'pointer',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'center',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                      onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                    >
                      <Trash2 size={16} />
                   </button>
                 </div>
               ))}
             </div>
           </div>

           <div className="grid-cols-3" style={{ display: 'grid', gap: '1rem' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
               <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Horario Corto</label>
               <input type="text" value={minSchedule} onChange={(e) => setMinSchedule(e.target.value)} style={inputStyle} />
             </div>
             <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Lugar de Reunión</label><input type="text" value={minLocation} onChange={(e) => setMinLocation(e.target.value)} style={inputStyle} /></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Link Google Maps</label><input type="text" placeholder="https://maps.app.goo.gl/..." value={minLocationUrl} onChange={(e) => setMinLocationUrl(e.target.value)} style={inputStyle} /></div>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
               <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Email</label>
               <input type="email" value={minEmail} onChange={(e) => setMinEmail(e.target.value)} style={inputStyle} />
             </div>
           </div>
           
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
               <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Título de Contacto</label>
               <input type="text" value={minContactTitle} onChange={(e) => setMinContactTitle(e.target.value)} style={inputStyle} placeholder="Conéctate Con Nosotros" />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
               <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Texto del Botón</label>
               <input type="text" value={minContactButtonText} onChange={(e) => setMinContactButtonText(e.target.value)} style={inputStyle} placeholder="Contactar por WhatsApp" />
             </div>
           </div>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
             <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Descripción de Contacto</label>
             <textarea value={minContactDesc} onChange={(e) => setMinContactDesc(e.target.value)} style={{ ...inputStyle, minHeight: '60px' }} placeholder="Queremos que seas parte de nuestras actividades..." />
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
               <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Enlace del Botón (WhatsApp o Grupo)</label>
               <input type="text" value={minLink} onChange={(e) => setMinLink(e.target.value)} style={inputStyle} />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
               <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Instagram (URL)</label>
               <input type="text" value={minInstagram} onChange={(e) => setMinInstagram(e.target.value)} style={inputStyle} placeholder="https://instagram.com/..." />
             </div>
           </div>

           <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', marginTop: '0.5rem' }} disabled={isMinLogoUploading || isMinHeroUploading}>
             {(isMinLogoUploading || isMinHeroUploading) ? 'Subiendo...' : <><Save size={16} /> Guardar Perfil del Ministerio</>}
           </button>
        </form>
      )}

      {/* TAB VISUAL */}
      {activeTab === 'visual' && (
        <form onSubmit={handleSaveProfile} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
           <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Identidad Visual y Estilo</h3>
           <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '-0.5rem' }}>
             Configura el aspecto y sensación de este ministerio para darle su propia personalidad.
           </p>

           <div className="grid-cols-2" style={{ display: 'grid', gap: '1.5rem', marginTop: '1rem' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
               <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Modo de Tema</label>
               <select value={minThemeMode} onChange={(e) => setMinThemeMode(e.target.value)} style={{ ...inputStyle, appearance: 'auto' }}>
                 <option value="dark">Modo Oscuro (Ej: Jóvenes, Hombres)</option>
                 <option value="light">Modo Claro (Ej: Mujeres, Niños)</option>
               </select>
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
               <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Estilo de Diseño (Layout)</label>
               <select value={minLayoutStyle} onChange={(e) => setMinLayoutStyle(e.target.value)} style={{ ...inputStyle, appearance: 'auto' }}>
                 <option value="modern">Moderno (Industrial, Neón)</option>
                 <option value="warm">Cálido (Acogedor, Delicado)</option>
                 <option value="playful">Divertido (Bordes redondeados, Juguetón)</option>
               </select>
             </div>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
             <h4 style={{ fontSize: '1rem', margin: 0 }}>Textos de Secciones</h4>
             <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cambia los títulos genéricos por los que mejor se adapten a tu ministerio.</p>
             
             <div className="grid-cols-2" style={{ display: 'grid', gap: '1.5rem', marginTop: '0.5rem' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                 <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Título para "Pilares" (Ej: Grupos de Apoyo, Clases)</label>
                 <input type="text" value={minPillarsLabel} onChange={(e) => setMinPillarsLabel(e.target.value)} style={inputStyle} placeholder="Pilares" />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                 <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Botón Principal de Llamado a la Acción</label>
                 <input type="text" value={minPrimaryActionText} onChange={(e) => setMinPrimaryActionText(e.target.value)} style={inputStyle} placeholder="Participar" />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                 <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Destino del Botón Principal</label>
                 <input type="text" value={minPrimaryActionUrl} onChange={(e) => setMinPrimaryActionUrl(e.target.value)} style={inputStyle} placeholder="#contacto" />
               </div>
             </div>
           </div>

           <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', marginTop: '1rem' }} disabled={isMinLogoUploading || isMinHeroUploading}>
             <Save size={16} /> Guardar Identidad Visual
           </button>
        </form>
      )}

      {/* TAB FUN ZONE */}
      {activeTab === 'fun_zone' && minLayoutStyle === 'playful' && (
        <form onSubmit={handleSaveProfile} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>🎮 Zona de Diversión</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Configura los juegos y videos para la sección infantil interactiva.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>🧩 Rompecabezas Bíblico</h4>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={minFunZonePuzzleEnabled} onChange={(e) => setMinFunZonePuzzleEnabled(e.target.checked)} />
                <span style={{ fontSize: '0.9rem' }}>Habilitar sección</span>
              </label>
            </div>
            
            <div className="grid-cols-2" style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Título del Rompecabezas</label>
                <input type="text" value={minFunZonePuzzleTitle} onChange={(e) => setMinFunZonePuzzleTitle(e.target.value)} style={inputStyle} disabled={!minFunZonePuzzleEnabled} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Dificultad (Grid)</label>
                <select value={minFunZonePuzzleDifficulty} onChange={(e) => setMinFunZonePuzzleDifficulty(e.target.value)} style={selectStyle} disabled={!minFunZonePuzzleEnabled}>
                  <option value="3x3">Fácil (3x3 - 9 piezas)</option>
                  <option value="4x4">Normal (4x4 - 16 piezas)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Imagen a Armar (Sube una imagen cuadrada idealmente)</label>
              {isSupabaseConfigured ? (
                <ImageUploadDropzone 
                  onFileSelect={(file) => setMinFunZonePuzzleImageFile(file)} 
                  previewUrl={minFunZonePuzzleImageFile ? URL.createObjectURL(minFunZonePuzzleImageFile) : minFunZonePuzzleImageUrl} 
                  label="Subir Imagen del Rompecabezas" 
                />
              ) : (
                <>
                  <input type="text" placeholder="URL de imagen..." value={minFunZonePuzzleImageUrl} onChange={(e) => setMinFunZonePuzzleImageUrl(e.target.value)} style={inputStyle} disabled={!minFunZonePuzzleEnabled} />
                  {(minFunZonePuzzleImageUrl) && (
                    <div style={{ marginTop: '0.5rem', width: '150px', height: '150px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#111' }}>
                      <img src={minFunZonePuzzleImageUrl} alt="Puzzle Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>🎬 Videos y Canciones (YouTube)</h4>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={minFunZoneVideosEnabled} onChange={(e) => setMinFunZoneVideosEnabled(e.target.checked)} />
                <span style={{ fontSize: '0.9rem' }}>Habilitar sección</span>
              </label>
            </div>
            
            <div className="grid-cols-2" style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Título de la Tarjeta</label>
                <input type="text" value={minFunZoneVideosTitle} onChange={(e) => setMinFunZoneVideosTitle(e.target.value)} style={inputStyle} disabled={!minFunZoneVideosEnabled} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Texto del Botón</label>
                <input type="text" value={minFunZoneVideosButtonText} onChange={(e) => setMinFunZoneVideosButtonText(e.target.value)} style={inputStyle} disabled={!minFunZoneVideosEnabled} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>URL del Canal o Lista de YouTube Kids</label>
              <input type="text" placeholder="https://youtube.com/..." value={minFunZoneVideosUrl} onChange={(e) => setMinFunZoneVideosUrl(e.target.value)} style={inputStyle} disabled={!minFunZoneVideosEnabled} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', marginTop: '0.5rem' }} disabled={isMinFunZoneUploading}>
            {isMinFunZoneUploading ? 'Subiendo imagen...' : <><Save size={16} /> Guardar Zona de Diversión</>}
          </button>
        </form>
      )}

      {/* TAB 2: ACTIVITIES */}
      {activeTab === 'activities' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
          {/* Create Activity Form */}
          <form onSubmit={handleCreateActivity} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{editingActivityId ? 'Editar Actividad' : 'Nueva Actividad'}</h3>
              {editingActivityId && (
                <button type="button" onClick={cancelActivityEdit} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Cancelar</button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Título</label>
              <input type="text" value={actTitle} onChange={(e) => setActTitle(e.target.value)} style={inputStyle} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Fecha</label>
                <input type="date" value={actDate} onChange={(e) => setActDate(e.target.value)} style={inputStyle} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Hora</label>
                <input type="time" value={actTime} onChange={(e) => setActTime(e.target.value)} style={inputStyle} required />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Link de Google Maps (Lugar del evento)</label>
              <input type="text" placeholder="https://maps.app.goo.gl/..." value={actLocationUrl} onChange={(e) => setActLocationUrl(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Descripción</label>
              <textarea value={actDesc} onChange={(e) => setActDesc(e.target.value)} style={{ ...inputStyle, minHeight: '80px' }} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Imagen de la Actividad (Opcional)</label>
              <input type="file" accept="image/*" onChange={(e) => setActImageFile(e.target.files[0])} style={{ fontSize: '0.8rem' }} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isActUploading}>
              {isActUploading ? 'Guardando...' : (editingActivityId ? <><Save size={16} /> Actualizar Actividad</> : <><Plus size={16} /> Crear Actividad</>)}
            </button>
          </form>

          {/* Activities List */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Actividades Programadas</h3>
            {minActivities.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No hay actividades registradas en este ministerio.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {minActivities.map(act => (
                  <div key={act.id} 
                       onClick={() => loadActivityData(act)}
                       style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', border: editingActivityId === act.id ? `1px solid ${min.accent_color}` : '1px solid var(--border-color)', borderRadius: '0.5rem', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {act.image_url && <img src={act.image_url} alt="" style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover' }} />}
                      <div>
                        <strong style={{ color: '#fff' }}>{act.title}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{act.date} | {act.time}</div>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteActivity(act.id); if(editingActivityId === act.id) cancelActivityEdit(); triggerSuccess('Actividad eliminada.'); }} className="btn btn-danger" style={{ padding: '0.35rem 0.6rem' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: GALLERY */}
      {activeTab === 'photos' && (
        <div style={{ display: 'grid', gridTemplateColumns: editingAlbumId ? '1fr' : '1fr 1.5fr', gap: '1.5rem' }}>
          
          {editingAlbumId ? (
            <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ImageIcon size={18} /> Editar Álbum y Administrar Fotos</h3>
                <button type="button" onClick={closeEditAlbum} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
                  Volver a la Lista
                </button>
              </div>

              {/* Edit Meta Form */}
              <form id="album-meta-form" onSubmit={handleUpdateAlbum} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Título del Álbum</label>
                  <input type="text" value={newAlbumTitle} onChange={(e) => setNewAlbumTitle(e.target.value)} style={inputStyle} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Fecha</label>
                  <input type="date" value={newAlbumDate} onChange={(e) => setNewAlbumDate(e.target.value)} style={inputStyle} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Enlace de Google Drive / Externo</label>
                  <input type="text" placeholder="https://drive.google.com/..." value={newAlbumDriveLink || ''} onChange={(e) => setNewAlbumDriveLink(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Descripción (Opcional)</label>
                  <textarea value={newAlbumDesc} onChange={(e) => setNewAlbumDesc(e.target.value)} style={{ ...inputStyle, minHeight: '40px' }} />
                </div>
                <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', display: 'none' }}>
                  {/* Botón movido al final */}
                </div>
              </form>

              {/* Upload New Photos inside Edit Mode */}
              <form onSubmit={handleAddPhoto} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)' }}>Añadir Nuevas Fotos</h4>
                {isSupabaseConfigured && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <ImageUploadDropzone 
                      onFilesSelect={(files) => setSelectedFiles(files)} 
                      multiple={true}
                      size="large"
                      label="Haz clic para seleccionar fotos" 
                    />
                    {selectedFiles.length > 0 && (
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', fontWeight: 600 }}>{selectedFiles.length} foto(s) seleccionada(s):</p>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          {Array.from(selectedFiles).map((file, idx) => (
                            <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '0.5rem', overflow: 'hidden', border: '2px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                              <img src={URL.createObjectURL(file)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {!isSupabaseConfigured && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>O Enlace URL</label>
                    <input type="text" placeholder="https://..." value={newPhotoUrl} onChange={(e) => setNewPhotoUrl(e.target.value)} style={inputStyle} />
                  </div>
                )}
                <button type="submit" className="btn btn-primary" disabled={isPhotoUploading} style={{ alignSelf: 'flex-start' }}>
                  {isPhotoUploading ? 'Subiendo...' : <><Plus size={16} /> Subir Foto(s) al Álbum</>}
                </button>
              </form>

              {/* Photos Grid for Deletion */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Fotos Actuales en el Álbum</h4>
                {minAlbums.find(a => a.id === editingAlbumId)?.photos?.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                    {minAlbums.find(a => a.id === editingAlbumId).photos.map((photoUrl, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '100%', aspectRatio: '1', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <img src={photoUrl} alt={`Foto ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('¿Seguro que deseas eliminar esta foto?')) {
                              removePhotoFromAlbum(editingAlbumId, photoUrl);
                            }
                          }}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'rgba(239, 68, 68, 0.9)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '0.25rem',
                            padding: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Eliminar Foto"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No hay fotos en este álbum.</p>
                )}
              </div>

              {/* Botón Final de Guardar Todo */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" form="album-meta-form" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.95rem' }}>
                  <Save size={16} style={{ marginRight: '0.5rem' }} /> Guardar Información del Álbum
                </button>
              </div>

            </div>
          ) : (
            <>
              {/* Form Create Album */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <form onSubmit={handleCreateAlbum} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1.2rem', margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Crear Nuevo Álbum</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Título del Álbum</label>
                    <input type="text" value={newAlbumTitle} onChange={(e) => setNewAlbumTitle(e.target.value)} style={inputStyle} required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Fecha</label>
                    <input type="date" value={newAlbumDate} onChange={(e) => setNewAlbumDate(e.target.value)} style={inputStyle} required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Descripción (Opcional)</label>
                    <textarea value={newAlbumDesc} onChange={(e) => setNewAlbumDesc(e.target.value)} style={{ ...inputStyle, minHeight: '60px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Enlace de Google Drive / Externo (Opcional)</label>
                    <input type="text" placeholder="https://drive.google.com/..." value={newAlbumDriveLink || ''} onChange={(e) => setNewAlbumDriveLink(e.target.value)} style={inputStyle} />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    <Plus size={16} /> Crear Álbum
                  </button>
                </form>
              </div>

              {/* Albums List */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Álbumes del Ministerio</h3>
                {minAlbums.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No hay álbumes en este ministerio.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {minAlbums.map(album => (
                      <div key={album.id} 
                           onClick={() => openEditAlbum(album)}
                           style={{ 
                             display: 'flex', 
                             justifyContent: 'space-between', 
                             alignItems: 'center', 
                             padding: '1rem', 
                             background: 'rgba(255,255,255,0.02)', 
                             border: '1px solid var(--border-color)', 
                             borderRadius: '0.5rem',
                             cursor: 'pointer',
                             transition: 'background 0.2s ease'
                           }}
                           onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                           onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                           >
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{album.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{album.photos?.length || 0} fotos | {album.date}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button type="button" onClick={() => openEditAlbum(album)} className="btn btn-primary" style={{ padding: '0.4rem' }} title="Editar Álbum">
                            <Edit2 size={14} />
                          </button>
                          <button type="button" onClick={(e) => {
                            e.stopPropagation(); // Evitar abrir edición si da clic en borrar
                            if(window.confirm('¿Seguro que deseas eliminar el álbum entero?')) deleteAlbum(album.id);
                          }} className="btn btn-secondary" style={{ padding: '0.4rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }} title="Eliminar Álbum Completo">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}

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


