import React, { useContext, useState } from 'react';
import { GalleryContext } from '../context/GalleryContext';
import { Tv, Radio, Layers, Users, CheckCircle, AlertTriangle, Save, Plus, Trash2, Edit } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import MinistryDashboardAdmin from '../components/admin/MinistryDashboardAdmin';

export default function Admin() {
  const {
    livestream,
    radio,
    homeSections,
    ministries,
    updateLivestream,
    updateRadio,
    updateHomeSection,
    addHomeSection,
    deleteHomeSection,
    addMinistry,
    deleteMinistry
  } = useContext(GalleryContext);

  const [activeTab, setActiveTab] = useState('streaming');
  const [activeMinistryId, setActiveMinistryId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // 1. Streaming state
  const [liveTitle, setLiveTitle] = useState(livestream.title);
  const [liveUrl, setLiveUrl] = useState(livestream.videoUrl);
  const [isLive, setIsLive] = useState(livestream.isLive);
  const [churchLogo, setChurchLogo] = useState(livestream.churchLogo || '');
  const [facebookUrl, setFacebookUrl] = useState(livestream.facebookUrl || '');
  const [instagramUrl, setInstagramUrl] = useState(livestream.instagramUrl || '');
  const [radioTitle, setRadioTitle] = useState(radio.title);
  const [radioUrl, setRadioUrl] = useState(radio.audioUrl);
  const [isRadioLive, setIsRadioLive] = useState(radio.isLive);

  // 2. Home Sections state
  const [secAction, setSecAction] = useState('edit');
  const [editingSectionId, setEditingSectionId] = useState(homeSections[0]?.id || '');
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionSubtitle, setSectionSubtitle] = useState('');
  const [sectionBtnText, setSectionBtnText] = useState('');
  const [sectionBtnUrl, setSectionBtnUrl] = useState('');
  const [sectionBgFile, setSectionBgFile] = useState(null);
  const [sectionBgUrlText, setSectionBgUrlText] = useState('');
  const [sectionOrder, setSectionOrder] = useState(1);
  const [isSectionUploading, setIsSectionUploading] = useState(false);

  const loadSectionData = (secId) => {
    const sec = homeSections.find(s => s.id === secId);
    if (sec) {
      setEditingSectionId(secId);
      setSectionTitle(sec.title);
      setSectionSubtitle(sec.subtitle);
      setSectionBtnText(sec.button_text || '');
      setSectionBtnUrl(sec.button_url || '');
      setSectionBgUrlText(sec.bg_image);
      setSectionOrder(sec.order_index || 1);
      setSectionBgFile(null);
    }
  };

  React.useEffect(() => {
    if (homeSections.length > 0 && !sectionTitle && secAction === 'edit') {
      loadSectionData(homeSections[0].id);
    }
  }, [homeSections, secAction]);

  // 3. Ministry state (Create only, Edit is in dashboard)
  const [newMinId, setNewMinId] = useState('');
  const [newMinName, setNewMinName] = useState('');
  const [newMinDesc, setNewMinDesc] = useState('');
  const [newMinColor, setNewMinColor] = useState('#3b82f6');

  // SUBMITS
  const handleUpdateStreaming = (e) => {
    e.preventDefault();
    updateLivestream({ title: liveTitle, videoUrl: liveUrl, isLive: isLive, churchLogo: churchLogo, facebookUrl: facebookUrl, instagramUrl: instagramUrl });
    updateRadio({ title: radioTitle, audioUrl: radioUrl, isLive: isRadioLive });
    triggerSuccess('Configuración de transmisiones guardada.');
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    let bgUrl = sectionBgUrlText;

    if (isSupabaseConfigured && sectionBgFile) {
      setIsSectionUploading(true);
      try {
        const fileExt = sectionBgFile.name.split('.').pop();
        const fileName = `bg-${Date.now()}.${fileExt}`;
        const filePath = `banners/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, sectionBgFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
        bgUrl = publicUrl;
      } catch (err) {
        console.error('Error uploading section bg:', err);
        alert('Error al subir la imagen.');
        setIsSectionUploading(false);
        return;
      }
      setIsSectionUploading(false);
    }

    const payload = {
      title: sectionTitle,
      subtitle: sectionSubtitle,
      button_text: sectionBtnText,
      button_url: sectionBtnUrl,
      bg_image: bgUrl,
      order_index: parseInt(sectionOrder, 10)
    };

    if (secAction === 'create') {
      const newId = `banner-${Date.now()}`;
      await addHomeSection({ id: newId, ...payload });
      triggerSuccess('Banner creado exitosamente.');
      setSecAction('edit');
      setEditingSectionId(newId);
    } else {
      await updateHomeSection(editingSectionId, payload);
      triggerSuccess('Banner actualizado con éxito.');
    }
    setSectionBgFile(null);
    setSectionBgUrlText(bgUrl);
  };

  const handleCreateMinistry = async (e) => {
    e.preventDefault();
    const newMinistry = {
      id: newMinId.toLowerCase().trim().replace(/\s+/g, '-'),
      name: newMinName,
      description: newMinDesc,
      accent_color: newMinColor,
      hero_title: `Bienvenido a ${newMinName}`,
      hero_desc: 'Un espacio de bendición.',
      icon_name: 'Sparkles',
      schedule: '',
      location: '',
      contact_email: '',
      contact_link: '',
      pillars: []
    };
    await addMinistry(newMinistry);
    setNewMinId('');
    setNewMinName('');
    setNewMinDesc('');
    triggerSuccess('Ministerio creado. Entra al dashboard para configurar los detalles.');
  };

  // RENDER MINISTRY DASHBOARD IF SELECTED
  if (activeMinistryId) {
    return (
      <div className="theme-imr4" style={{ minHeight: '100vh', padding: '6.5rem 1.5rem 4rem 1.5rem' }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          {successMsg && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={16} /> {successMsg}
            </div>
          )}
          <MinistryDashboardAdmin 
            ministryId={activeMinistryId} 
            onBack={() => setActiveMinistryId(null)} 
            triggerSuccess={triggerSuccess} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="theme-imr4" style={{ minHeight: '100vh', padding: '6.5rem 1.5rem 4rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Panel de Control General</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Administra transmisiones, banners y accesos a los ministerios.</p>
          {isSupabaseConfigured ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '0.5rem 1.25rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <CheckCircle size={16} /> Base de Datos Supabase Conectada
            </div>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.3)', color: '#f97316', padding: '0.5rem 1.25rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <AlertTriangle size={16} /> Almacenamiento Local (Modo Demo)
            </div>
          )}
        </div>

        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}

        {/* Global Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'streaming', label: 'Transmisiones', icon: <Tv size={16} /> },
            { id: 'home_sections', label: 'Banners de Inicio', icon: <Layers size={16} /> },
            { id: 'ministries', label: 'Lista de Ministerios', icon: <Users size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem',
                background: activeTab === tab.id ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                border: 'none', borderBottom: activeTab === tab.id ? '2px solid var(--accent-color)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--accent-color)' : 'var(--text-secondary)',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: STREAMING */}
        {activeTab === 'streaming' && (
          <div className="animate-fade-in grid-cols-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}><Tv size={20} style={{ color: 'var(--accent-color)' }} /> Streaming YouTube</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Título</label><input type="text" value={liveTitle} onChange={(e) => setLiveTitle(e.target.value)} style={inputStyle} /></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Enlace Embed</label><input type="text" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} style={inputStyle} /></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Logo Global de IMR4 (URL)</label><input type="text" placeholder="https://..." value={churchLogo} onChange={(e) => setChurchLogo(e.target.value)} style={inputStyle} /></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Facebook Iglesia (URL)</label><input type="text" placeholder="https://facebook.com/..." value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} style={inputStyle} /></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Instagram Iglesia (URL)</label><input type="text" placeholder="https://instagram.com/..." value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} style={inputStyle} /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><input type="checkbox" id="isLive" checked={isLive} onChange={(e) => setIsLive(e.target.checked)} style={{ width: '16px', height: '16px' }} /><label htmlFor="isLive" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>En Vivo Activo</label></div>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}><Radio size={20} style={{ color: 'var(--accent-color)' }} /> Radio Online</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Título</label><input type="text" value={radioTitle} onChange={(e) => setRadioTitle(e.target.value)} style={inputStyle} /></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Stream URL</label><input type="text" value={radioUrl} onChange={(e) => setRadioUrl(e.target.value)} style={inputStyle} /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><input type="checkbox" id="isRadioLive" checked={isRadioLive} onChange={(e) => setIsRadioLive(e.target.checked)} style={{ width: '16px', height: '16px' }} /><label htmlFor="isRadioLive" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>En Vivo Activo</label></div>
              </div>
            </div>
            <button onClick={handleUpdateStreaming} className="btn btn-primary" style={{ gridColumn: 'span 2' }}><Save size={16} /> Guardar Transmisiones</button>
          </div>
        )}

        {/* TAB 2: BANNERS */}
        {activeTab === 'home_sections' && (
          <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}><Layers size={20} style={{ color: 'var(--accent-color)' }} /> Banners de Inicio</h2>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Operación:</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="radio" checked={secAction === 'create'} onChange={() => {
                    setSecAction('create'); setSectionTitle(''); setSectionSubtitle(''); setSectionBtnText(''); setSectionBtnUrl(''); setSectionBgUrlText(''); setSectionOrder(homeSections.length + 1); setSectionBgFile(null);
                  }} /> Crear Nuevo Banner
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="radio" checked={secAction === 'edit'} onChange={() => { setSecAction('edit'); loadSectionData(homeSections[0]?.id); }} /> Editar Existente
                </label>
            </div>

            <form onSubmit={handleSaveSection} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }} className="grid-cols-2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {secAction === 'edit' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Selecciona Banner</label>
                      <select value={editingSectionId} onChange={(e) => loadSectionData(e.target.value)} style={selectStyle}>
                        {homeSections.map((sec) => (<option key={sec.id} value={sec.id}>{sec.title || sec.id}</option>))}
                      </select>
                      {homeSections.length > 0 && (
                        <button type="button" onClick={() => { 
                          if(confirm('¿Eliminar banner?')) { 
                            deleteHomeSection(editingSectionId); 
                            triggerSuccess('Banner eliminado.'); 
                            const remaining = homeSections.filter(s => s.id !== editingSectionId);
                            if (remaining.length > 0) {
                              loadSectionData(remaining[0].id);
                            } else {
                              setSecAction('create');
                              setSectionTitle(''); setSectionSubtitle(''); setSectionBtnText(''); setSectionBtnUrl(''); setSectionBgUrlText(''); setSectionBgFile(null);
                            }
                          } 
                        }} className="btn btn-danger" style={{ marginTop: '0.5rem' }}><Trash2 size={14}/> Eliminar Banner</button>
                      )}
                    </div>
                  )}
                  {sectionBgUrlText && (
                    <div style={{ marginTop: '1rem', border: '1px solid var(--border-color)', borderRadius: '0.35rem', overflow: 'hidden', height: '140px' }}>
                      <img src={sectionBgUrlText} alt="Fondo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Título</label><input type="text" value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} style={inputStyle} required /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Subtítulo</label><textarea value={sectionSubtitle} onChange={(e) => setSectionSubtitle(e.target.value)} style={{ ...inputStyle, minHeight: '60px' }} required /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Texto Botón</label><input type="text" value={sectionBtnText} onChange={(e) => setSectionBtnText(e.target.value)} style={inputStyle} /></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Enlace Botón</label><input type="text" value={sectionBtnUrl} onChange={(e) => setSectionBtnUrl(e.target.value)} style={inputStyle} /></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Orden</label><input type="number" value={sectionOrder} onChange={(e) => setSectionOrder(e.target.value)} style={inputStyle} /></div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px dashed var(--border-color)', padding: '0.75rem', borderRadius: '0.35rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-color)' }}>Imagen de Fondo</span>
                    {isSupabaseConfigured ? <input type="file" accept="image/*" onChange={(e) => setSectionBgFile(e.target.files[0])} style={{ fontSize: '0.8rem' }} /> : <input type="text" placeholder="URL" value={sectionBgUrlText} onChange={(e) => setSectionBgUrlText(e.target.value)} style={inputStyle} />}
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }} disabled={isSectionUploading}>{isSectionUploading ? 'Subiendo...' : 'Guardar Banner'}</button>
            </form>
          </div>
        )}

        {/* TAB 3: MINISTRIES LIST */}
        {activeTab === 'ministries' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}><Plus size={20} style={{ color: 'var(--accent-color)' }} /> Registrar Nuevo Ministerio</h2>
              <form onSubmit={handleCreateMinistry} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr auto', gap: '1rem', alignItems: 'end' }} className="grid-cols-1">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Slug (ID corto, ej: jovenes)</label><input type="text" value={newMinId} onChange={(e) => setNewMinId(e.target.value)} style={inputStyle} required /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nombre</label><input type="text" value={newMinName} onChange={(e) => setNewMinName(e.target.value)} style={inputStyle} required /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Color</label><input type="color" value={newMinColor} onChange={(e) => setNewMinColor(e.target.value)} style={{ ...inputStyle, padding: '0.2rem', height: '38px' }} /></div>
                  <button type="submit" className="btn btn-primary" style={{ height: '38px' }}>Crear</button>
              </form>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Selecciona un Ministerio para Administrar</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {ministries.map((m) => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: m.accent_color }}></span>
                      <div>
                        <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{m.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {m.id}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setActiveMinistryId(m.id)} className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}><Edit size={14} style={{ marginRight: '0.5rem' }}/> Entrar al Dashboard</button>
                      <button onClick={() => { if (confirm(`¿Eliminar ${m.name}? Esto no eliminará automáticamente sus fotos si no las borraste primero.`)) { deleteMinistry(m.id); triggerSuccess('Ministerio eliminado.'); } }} className="btn btn-danger" style={{ padding: '0.4rem 0.6rem' }}><Trash2 size={16} /></button>
                    </div>
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

const inputStyle = {
  background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', color: 'var(--text-primary)',
  padding: '0.55rem 0.75rem', borderRadius: '0.35rem', outline: 'none', fontSize: '0.9rem', width: '100%', transition: 'border-color 0.2s'
};
const selectStyle = {
  background: 'rgba(18, 18, 22, 0.95)', border: '1px solid var(--border-color)', color: 'var(--text-primary)',
  padding: '0.55rem 0.75rem', borderRadius: '0.35rem', outline: 'none', fontSize: '0.9rem', width: '100%', cursor: 'pointer'
};
