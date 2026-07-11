import React, { useState, useContext, useEffect } from 'react';
import { GalleryContext } from '../../context/GalleryContext';
import { supabase, isSupabaseConfigured } from '../../supabaseClient';
import { ArrowLeft, User, Calendar, Image as ImageIcon, Save, Plus, Trash2, Upload } from 'lucide-react';

export default function MinistryDashboardAdmin({ ministryId, onBack, triggerSuccess }) {
  const {
    ministries,
    updateMinistry,
    activities,
    addActivity,
    deleteActivity,
    albums,
    addAlbum,
    deleteAlbum,
    addPhotoToAlbum
  } = useContext(GalleryContext);

  const [activeTab, setActiveTab] = useState('profile');
  
  // Ministry data
  const min = ministries.find(m => m.id === ministryId);
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
  const [minSchedule, setMinSchedule] = useState(min?.schedule || '');
  const [minLocation, setMinLocation] = useState(min?.location || '');
  const [minLocationUrl, setMinLocationUrl] = useState(min?.location_url || '');
  const [minEmail, setMinEmail] = useState(min?.contact_email || '');
  const [minLink, setMinLink] = useState(min?.contact_link || '');
  const [minInstagram, setMinInstagram] = useState(min?.instagram_url || '');
  
  const [pillar1Title, setPillar1Title] = useState(min?.pillars?.[0]?.title || '');
  const [pillar1Desc, setPillar1Desc] = useState(min?.pillars?.[0]?.desc || '');
  const [pillar2Title, setPillar2Title] = useState(min?.pillars?.[1]?.title || '');
  const [pillar2Desc, setPillar2Desc] = useState(min?.pillars?.[1]?.desc || '');
  const [pillar3Title, setPillar3Title] = useState(min?.pillars?.[2]?.title || '');
  const [pillar3Desc, setPillar3Desc] = useState(min?.pillars?.[2]?.desc || '');

  // Activity Form State
  const [actTitle, setActTitle] = useState('');
  const [actDate, setActDate] = useState(new Date().toISOString().split('T')[0]);
  const [actTime, setActTime] = useState('20:00');
  const [actDesc, setActDesc] = useState('');
  const [actLocationUrl, setActLocationUrl] = useState('');

  // Gallery Form State
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumDate, setNewAlbumDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAlbumDesc, setNewAlbumDesc] = useState('');
  const [selectedAlbumId, setSelectedAlbumId] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);

  // Handlers
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const updates = {
      name: minName,
      description: minDesc,
      hero_title: minHeroTitle,
      hero_desc: minHeroDesc,
      accent_color: minColor,
      logo_url: minLogoUrl,
      schedule: minSchedule,
      location: minLocation,
      location_url: minLocationUrl,
      contact_email: minEmail,
      contact_link: minLink,
      instagram_url: minInstagram,
      pillars: [
        { icon: 'Calendar', title: pillar1Title, desc: pillar1Desc },
        { icon: 'MapPin', title: pillar2Title, desc: pillar2Desc },
        { icon: 'Users', title: pillar3Title, desc: pillar3Desc }
      ]
    };
    await updateMinistry(ministryId, updates);
    triggerSuccess('Perfil del ministerio actualizado.');
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    const newAct = {
      id: `act-${Date.now()}`,
      title: actTitle,
      date: actDate,
      time: actTime,
      description: actDesc,
      location_url: actLocationUrl,
      image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80', // default
      ministry_id: ministryId
    };
    await addActivity(newAct);
    setActTitle('');
    setActDesc('');
    setActLocationUrl('');
    triggerSuccess('Actividad creada para este ministerio.');
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    const newAlbum = {
      id: `album-${Date.now()}`,
      title: newAlbumTitle,
      description: newAlbumDesc,
      category: ministryId, // keep for backward compatibility
      ministry_id: ministryId,
      date: newAlbumDate,
      photos: []
    };
    await addAlbum(newAlbum);
    setNewAlbumTitle('');
    setNewAlbumDesc('');
    triggerSuccess('Álbum creado exitosamente.');
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
      setNewPhotoUrl('');
    }
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!selectedAlbumId) {
      alert('Selecciona un álbum primero');
      return;
    }

    if (isSupabaseConfigured && selectedFiles.length > 0) {
      setIsPhotoUploading(true);
      try {
        let uploadedUrls = [];
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${selectedAlbumId}/${fileName}`;

          const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, file);
          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
          uploadedUrls.push(publicUrl);
        }
        for (const url of uploadedUrls) {
          await addPhotoToAlbum(selectedAlbumId, url);
        }
        setSelectedFiles([]);
        triggerSuccess('Fotos subidas y agregadas con éxito al álbum.');
      } catch (err) {
        console.error(err);
        alert('Error al subir las fotos.');
      } finally {
        setIsPhotoUploading(false);
      }
    } else if (newPhotoUrl.trim()) {
      await addPhotoToAlbum(selectedAlbumId, newPhotoUrl.trim());
      setNewPhotoUrl('');
      triggerSuccess('Enlace de foto agregado con éxito al álbum.');
    }
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
        <button onClick={() => setActiveTab('profile')} className={`btn ${activeTab === 'profile' ? 'btn-primary' : ''}`} style={{ background: activeTab !== 'profile' ? 'transparent' : '', color: activeTab !== 'profile' ? 'var(--text-secondary)' : '' }}>
          <User size={16} /> Perfil y Configuración
        </button>
        <button onClick={() => setActiveTab('activities')} className={`btn ${activeTab === 'activities' ? 'btn-primary' : ''}`} style={{ background: activeTab !== 'activities' ? 'transparent' : '', color: activeTab !== 'activities' ? 'var(--text-secondary)' : '' }}>
          <Calendar size={16} /> Actividades ({minActivities.length})
        </button>
        <button onClick={() => setActiveTab('photos')} className={`btn ${activeTab === 'photos' ? 'btn-primary' : ''}`} style={{ background: activeTab !== 'photos' ? 'transparent' : '', color: activeTab !== 'photos' ? 'var(--text-secondary)' : '' }}>
          <ImageIcon size={16} /> Galería ({minAlbums.length})
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
           <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Información General</h3>
           
           <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
               <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nombre del Ministerio</label>
               <input type="text" value={minName} onChange={(e) => setMinName(e.target.value)} style={inputStyle} required />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
               <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Color Temático</label>
               <input type="color" value={minColor} onChange={(e) => setMinColor(e.target.value)} style={{ ...inputStyle, padding: '0.2rem', height: '38px', cursor: 'pointer' }} />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
               <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Logo del Ministerio (URL)</label>
               <input type="text" placeholder="https://..." value={minLogoUrl} onChange={(e) => setMinLogoUrl(e.target.value)} style={inputStyle} />
             </div>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
             <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Descripción (Página de Inicio)</label>
             <input type="text" value={minDesc} onChange={(e) => setMinDesc(e.target.value)} style={inputStyle} required />
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
               <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Título Hero (Sub-sitio)</label>
               <input type="text" value={minHeroTitle} onChange={(e) => setMinHeroTitle(e.target.value)} style={inputStyle} />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
               <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Descripción Larga (Sub-sitio)</label>
               <textarea value={minHeroDesc} onChange={(e) => setMinHeroDesc(e.target.value)} style={{ ...inputStyle, minHeight: '60px' }} />
             </div>
           </div>

           {/* Core Pillars */}
           <div style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.01)' }}>
             <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-color)', marginBottom: '0.75rem' }}>Pilares / Horarios Específicos</span>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
               <div>
                 <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Pilar 1</span>
                 <input type="text" placeholder="Título" value={pillar1Title} onChange={(e) => setPillar1Title(e.target.value)} style={{ ...inputStyle, fontSize: '0.8rem', margin: '4px 0' }} />
                 <input type="text" placeholder="Descripción" value={pillar1Desc} onChange={(e) => setPillar1Desc(e.target.value)} style={{ ...inputStyle, fontSize: '0.8rem' }} />
               </div>
               <div>
                 <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Pilar 2</span>
                 <input type="text" placeholder="Título" value={pillar2Title} onChange={(e) => setPillar2Title(e.target.value)} style={{ ...inputStyle, fontSize: '0.8rem', margin: '4px 0' }} />
                 <input type="text" placeholder="Descripción" value={pillar2Desc} onChange={(e) => setPillar2Desc(e.target.value)} style={{ ...inputStyle, fontSize: '0.8rem' }} />
               </div>
               <div>
                 <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Pilar 3</span>
                 <input type="text" placeholder="Título" value={pillar3Title} onChange={(e) => setPillar3Title(e.target.value)} style={{ ...inputStyle, fontSize: '0.8rem', margin: '4px 0' }} />
                 <input type="text" placeholder="Descripción" value={pillar3Desc} onChange={(e) => setPillar3Desc(e.target.value)} style={{ ...inputStyle, fontSize: '0.8rem' }} />
               </div>
             </div>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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
               <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>WhatsApp Link</label>
               <input type="text" value={minLink} onChange={(e) => setMinLink(e.target.value)} style={inputStyle} />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
               <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Instagram (URL)</label>
               <input type="text" value={minInstagram} onChange={(e) => setMinInstagram(e.target.value)} style={inputStyle} placeholder="https://instagram.com/..." />
             </div>
           </div>

           <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', marginTop: '0.5rem' }}>
             <Save size={16} /> Guardar Perfil del Ministerio
           </button>
        </form>
      )}

      {/* TAB 2: ACTIVITIES */}
      {activeTab === 'activities' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
          {/* Create Activity Form */}
          <form onSubmit={handleCreateActivity} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Nueva Actividad</h3>
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
            <button type="submit" className="btn btn-primary">
              <Plus size={16} /> Crear Actividad
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
                  <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
                    <div>
                      <strong style={{ color: '#fff' }}>{act.title}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{act.date} | {act.time}</div>
                    </div>
                    <button onClick={() => { deleteActivity(act.id); triggerSuccess('Actividad eliminada.'); }} className="btn btn-danger" style={{ padding: '0.35rem 0.6rem' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
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
              <button type="submit" className="btn btn-primary">
                <Plus size={16} /> Crear Álbum
              </button>
            </form>

            <form onSubmit={handleAddPhoto} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Subir Foto</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Seleccionar Álbum</label>
                <select value={selectedAlbumId} onChange={(e) => setSelectedAlbumId(e.target.value)} style={selectStyle} required>
                  <option value="" disabled>-- Elige un álbum --</option>
                  {minAlbums.map(a => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                  ))}
                </select>
              </div>

              {isSupabaseConfigured && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-color)' }}>Archivo(s) Local(es)</label>
                  <input type="file" accept="image/*" multiple onChange={handleFileChange} style={{ fontSize: '0.8rem' }} />
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-color)' }}>O Enlace URL</label>
                <input type="text" placeholder="https://..." value={newPhotoUrl} onChange={(e) => { setNewPhotoUrl(e.target.value); setSelectedFiles([]); }} style={inputStyle} />
              </div>

              <button type="submit" className="btn btn-primary" disabled={isPhotoUploading}>
                {isPhotoUploading ? 'Subiendo...' : 'Agregar Foto'}
              </button>
            </form>
          </div>

          {/* Albums List */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Álbumes del Ministerio</h3>
            {minAlbums.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No hay álbumes para este ministerio.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {minAlbums.map(album => (
                  <div key={album.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{album.title}</strong>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {album.photos?.length || 0} fotos | {album.date}
                      </div>
                    </div>
                    <button onClick={() => { deleteAlbum(album.id); triggerSuccess('Álbum eliminado.'); }} className="btn btn-danger" style={{ padding: '0.4rem 0.75rem' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
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
