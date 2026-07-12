import React, { useContext, useState } from 'react';
import { GalleryContext } from '../context/GalleryContext';
import { Tv, Radio, Layers, Users, CheckCircle, AlertTriangle, Save, Plus, Trash2, Edit, Settings, Image, FileText, LogOut, Lock, UserPlus } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import MinistryDashboardAdmin from '../components/admin/MinistryDashboardAdmin';
import RadioProgramsAdmin from '../components/admin/RadioProgramsAdmin';
import DonationsAdmin from '../components/admin/DonationsAdmin';
import ContactFormsAdmin from '../components/admin/ContactFormsAdmin';
import { Heart, Mail } from 'lucide-react';

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
    deleteMinistry,
    blogPosts,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    adminUser,
    adminUsersList,
    logout,
    fetchAdminUsers,
    addAdminUser,
    deleteAdminUser
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
  const [churchName, setChurchName] = useState(livestream.churchName || 'IMR4');
  const [churchLogo, setChurchLogo] = useState(livestream.churchLogo || '');
  const [churchLogoFile, setChurchLogoFile] = useState(null);
  const [youtubeChannelUrl, setYoutubeChannelUrl] = useState(livestream.youtubeChannelUrl || '');
  const [isStreamingUploading, setIsStreamingUploading] = useState(false);
  const [facebookUrl, setFacebookUrl] = useState(livestream.facebookUrl || '');
  const [instagramUrl, setInstagramUrl] = useState(livestream.instagramUrl || '');
  const [churchAddress, setChurchAddress] = useState(livestream.churchAddress || 'Río Cuarto, Córdoba, Argentina');
  const [churchMapsUrl, setChurchMapsUrl] = useState(livestream.churchMapsUrl || '');
  const [churchEmail, setChurchEmail] = useState(livestream.churchEmail || 'contacto@imr4.org');
  const [churchDescription, setChurchDescription] = useState(livestream.churchDescription || 'Una comunidad apasionada por compartir la gracia, fe y esperanza en Río Cuarto. Buscamos impactar vidas a través del amor y el servicio integral.');
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
  const [sectionSchedules, setSectionSchedules] = useState([]);
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
      setSectionSchedules(sec.schedules || []);
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

  // 4. Blogs State
  const [blogAction, setBlogAction] = useState('create');
  const [editingBlogId, setEditingBlogId] = useState('');
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogImageUrl, setBlogImageUrl] = useState('');
  const [blogImageFile, setBlogImageFile] = useState(null);
  const [blogOrder, setBlogOrder] = useState(1);
  const [isBlogUploading, setIsBlogUploading] = useState(false);

  const loadBlogData = (blogId) => {
    const blog = blogPosts?.find(b => b.id === blogId);
    if (blog) {
      setEditingBlogId(blogId);
      setBlogTitle(blog.title);
      setBlogContent(blog.content);
      setBlogImageUrl(blog.image_url || '');
      setBlogOrder(blog.order_index || 1);
      setBlogImageFile(null);
    }
  };

  React.useEffect(() => {
    if (blogPosts?.length > 0 && !blogTitle && blogAction === 'edit') {
      loadBlogData(blogPosts[0].id);
    }
  }, [blogPosts, blogAction]);

  // 5. Admin Users State
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [isAdminCreating, setIsAdminCreating] = useState(false);

  React.useEffect(() => {
    if (activeTab === 'admin_users') {
      fetchAdminUsers();
    }
  }, [activeTab]);

  // SUBMITS
  const handleUpdateStreaming = async (e) => {
    e.preventDefault();
    
    let logoUrl = churchLogo;
    
    if (churchLogoFile && isSupabaseConfigured) {
      setIsStreamingUploading(true);
      try {
        const fileExt = churchLogoFile.name.split('.').pop();
        const fileName = `logo_${Date.now()}.${fileExt}`;
        const filePath = `logos/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, churchLogoFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
        logoUrl = publicUrl;
      } catch (err) {
        console.error('Error uploading logo:', err);
        alert('Error al subir el logo.');
        setIsStreamingUploading(false);
        return;
      }
      setIsStreamingUploading(false);
    }

    updateLivestream({ 
      title: liveTitle, 
      videoUrl: liveUrl, 
      isLive: isLive,
      churchName: churchName,
      churchLogo: logoUrl, 
      facebookUrl: facebookUrl, 
      instagramUrl: instagramUrl,
      churchAddress: churchAddress,
      churchMapsUrl: churchMapsUrl,
      churchEmail: churchEmail,
      churchDescription: churchDescription,
      youtubeChannelUrl: youtubeChannelUrl
    });
    setChurchLogo(logoUrl);
    setChurchLogoFile(null);
    updateRadio({ title: radioTitle, audioUrl: radioUrl, isLive: isRadioLive });
    triggerSuccess('Configuración general guardada.');
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
      order_index: parseInt(sectionOrder, 10),
      schedules: sectionSchedules
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

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    let finalImageUrl = blogImageUrl;

    if (isSupabaseConfigured && blogImageFile) {
      setIsBlogUploading(true);
      try {
        const fileExt = blogImageFile.name.split('.').pop();
        const fileName = `blog-${Date.now()}.${fileExt}`;
        const filePath = `blogs/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, blogImageFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
        finalImageUrl = publicUrl;
      } catch (err) {
        console.error('Error uploading blog image:', err);
        alert('Error al subir la imagen del blog.');
        setIsBlogUploading(false);
        return;
      }
      setIsBlogUploading(false);
    }

    const blogData = {
      title: blogTitle,
      content: blogContent,
      image_url: finalImageUrl,
      order_index: parseInt(blogOrder, 10)
    };

    if (blogAction === 'create') {
      blogData.id = `blog-${Date.now()}`;
      await addBlogPost(blogData);
      triggerSuccess('Blog / Noticia creada.');
      setBlogTitle('');
      setBlogContent('');
      setBlogImageFile(null);
      setBlogImageUrl('');
    } else {
      await updateBlogPost(editingBlogId, blogData);
      triggerSuccess('Blog / Noticia actualizada.');
    }
  };

  // RENDER MINISTRY DASHBOARD IF SELECTED
  if (activeMinistryId) {
    return (
      <div className="theme-imr4 admin-panel" style={{ minHeight: '100vh', padding: '6.5rem 1.5rem 4rem 1.5rem' }}>
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
    <div className="theme-imr4 admin-panel" style={{ minHeight: '100vh', padding: '6.5rem 1.5rem 4rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative' }}>
          <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Panel de Control General</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Administra transmisiones, banners y accesos a los ministerios.</p>
          
          <button 
            onClick={logout}
            className="btn btn-secondary" 
            style={{ position: 'absolute', top: 0, right: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>

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
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: 'rgba(16, 185, 129, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(16, 185, 129, 1)',
            color: '#fff',
            padding: '1rem 1.5rem',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            zIndex: 9999,
            animation: 'slideUp 0.3s ease-out forwards',
            fontWeight: 600
          }}>
            <CheckCircle size={20} /> {successMsg}
          </div>
        )}

        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>

        {/* Global Tabs */}
        <div className="admin-tabs-container" style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'streaming', label: 'Streaming & Radio', icon: <Tv size={16} /> },
            { id: 'church_data', label: 'Datos de la Iglesia', icon: <Settings size={16} /> },
            { id: 'home_sections', label: 'Banners de Inicio', icon: <Layers size={16} /> },
            { id: 'global_gallery', label: 'Galería General', icon: <Image size={16} />, onClick: () => setActiveMinistryId('general') },
            { id: 'ministries', label: 'Lista de Ministerios', icon: <Users size={16} /> },
            { id: 'donations', label: 'Diezmos y Ofrendas', icon: <Heart size={16} /> },
            { id: 'contact_forms', label: 'Formularios de Contacto', icon: <Mail size={16} /> },
            { id: 'blogs', label: 'Noticias / Blogs', icon: <FileText size={16} /> },
            { id: 'admin_users', label: 'Administradores', icon: <Lock size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={tab.onClick ? tab.onClick : () => setActiveTab(tab.id)}
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
          <div className="animate-fade-in grid-cols-2" style={{ display: 'grid', gap: '2rem' }}>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}><Tv size={20} style={{ color: 'var(--accent-color)' }} /> Streaming YouTube</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Título de Transmisión</label><input type="text" value={liveTitle} onChange={(e) => setLiveTitle(e.target.value)} style={inputStyle} /></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Enlace Embed (Para el video en vivo)</label><input type="text" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} style={inputStyle} /></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>URL del Canal de YouTube</label><input type="text" placeholder="https://youtube.com/@..." value={youtubeChannelUrl} onChange={(e) => setYoutubeChannelUrl(e.target.value)} style={inputStyle} /></div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><input type="checkbox" id="isLive" checked={isLive} onChange={(e) => setIsLive(e.target.checked)} style={{ width: '16px', height: '16px' }} /><label htmlFor="isLive" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Transmisión de Video en Vivo Activa</label></div>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}><Radio size={20} style={{ color: 'var(--accent-color)' }} /> Radio Online</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Título</label><input type="text" value={radioTitle} onChange={(e) => setRadioTitle(e.target.value)} style={inputStyle} /></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Stream URL</label><input type="text" value={radioUrl} onChange={(e) => setRadioUrl(e.target.value)} style={inputStyle} /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><input type="checkbox" id="isRadioLive" checked={isRadioLive} onChange={(e) => setIsRadioLive(e.target.checked)} style={{ width: '16px', height: '16px' }} /><label htmlFor="isRadioLive" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Radio Online Activa</label></div>
              </div>
            </div>
            
            <div style={{ gridColumn: 'span 2' }}>
              <button type="button" onClick={handleUpdateStreaming} className="btn btn-primary" disabled={isStreamingUploading}>
                {isStreamingUploading ? 'Subiendo...' : <><Save size={16} /> Guardar Configuración de Streaming</>}
              </button>
            </div>

            {/* Parrilla de Programación */}
            <div style={{ gridColumn: 'span 2' }}>
              <RadioProgramsAdmin />
            </div>
          </div>
        )}

        {/* TAB 1.5: DATOS DE LA IGLESIA */}
        {activeTab === 'church_data' && (
          <div className="animate-fade-in glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}><Settings size={20} style={{ color: 'var(--accent-color)' }} /> Datos Generales de la Iglesia</h2>
            <div className="grid-cols-2" style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nombre / Siglas (ej: IMR4)</label>
                  <input type="text" value={churchName} onChange={(e) => setChurchName(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Logo Global de la Iglesia</span>
                  </div>
                  {isSupabaseConfigured ? <input type="file" accept="image/*" onChange={(e) => setChurchLogoFile(e.target.files[0])} style={{ fontSize: '0.8rem' }} /> : <input type="text" placeholder="URL" value={churchLogo} onChange={(e) => setChurchLogo(e.target.value)} style={inputStyle} />}
                  {(churchLogo || churchLogoFile) && (
                    <div style={{ marginTop: '0.5rem', width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <img src={churchLogoFile ? URL.createObjectURL(churchLogoFile) : churchLogo} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'rgba(255,255,255,0.1)' }} />
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Descripción de la Iglesia (Aparece en el pie de página)</label><textarea value={churchDescription} onChange={(e) => setChurchDescription(e.target.value)} style={{ ...inputStyle, minHeight: '100px' }} /></div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Facebook (URL)</label><input type="text" placeholder="https://facebook.com/..." value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} style={inputStyle} /></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Instagram (URL)</label><input type="text" placeholder="https://instagram.com/..." value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} style={inputStyle} /></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Dirección Física (Texto)</label><input type="text" placeholder="Ej: Río Cuarto..." value={churchAddress} onChange={(e) => setChurchAddress(e.target.value)} style={inputStyle} /></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Google Maps (URL)</label><input type="text" placeholder="https://maps.app.goo.gl/..." value={churchMapsUrl} onChange={(e) => setChurchMapsUrl(e.target.value)} style={inputStyle} /></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Email de Contacto</label><input type="email" placeholder="contacto@imr4.org" value={churchEmail} onChange={(e) => setChurchEmail(e.target.value)} style={inputStyle} /></div>
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <button type="button" onClick={handleUpdateStreaming} className="btn btn-primary" disabled={isStreamingUploading}>
                {isStreamingUploading ? 'Subiendo...' : <><Save size={16} /> Guardar Datos de Iglesia</>}
              </button>
            </div>
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
                    setSecAction('create'); setSectionTitle(''); setSectionSubtitle(''); setSectionBtnText(''); setSectionBtnUrl(''); setSectionBgUrlText(''); setSectionOrder(homeSections.length + 1); setSectionSchedules([]); setSectionBgFile(null);
                  }} /> Crear Nuevo Banner
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="radio" checked={secAction === 'edit'} onChange={() => { setSecAction('edit'); loadSectionData(homeSections[0]?.id); }} /> Editar Existente
                </label>
            </div>

            <form onSubmit={handleSaveSection} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="grid-cols-2" style={{ display: 'grid', gap: '1.5rem' }}>
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
                              setSectionTitle(''); setSectionSubtitle(''); setSectionBtnText(''); setSectionBtnUrl(''); setSectionBgUrlText(''); setSectionSchedules([]); setSectionBgFile(null);
                            }
                          } 
                        }} className="btn btn-danger" style={{ marginTop: '0.5rem' }}><Trash2 size={14}/> Eliminar Banner</button>
                      )}
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
                    {(sectionBgUrlText || sectionBgFile) && (
                      <div style={{ marginTop: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.35rem', overflow: 'hidden', height: '140px' }}>
                        <img src={sectionBgFile ? URL.createObjectURL(sectionBgFile) : sectionBgUrlText} alt="Fondo Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.02)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Horarios (Opcional)</h4>
                    {sectionSchedules.map((sched, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <input type="text" placeholder="Día" value={sched.day} onChange={(e) => { const newS = [...sectionSchedules]; newS[idx].day = e.target.value; setSectionSchedules(newS); }} style={{ ...inputStyle, flex: 1 }} />
                        <input type="text" placeholder="Hora" value={sched.time} onChange={(e) => { const newS = [...sectionSchedules]; newS[idx].time = e.target.value; setSectionSchedules(newS); }} style={{ ...inputStyle, flex: 1 }} />
                        <input type="text" placeholder="Descripción" value={sched.desc} onChange={(e) => { const newS = [...sectionSchedules]; newS[idx].desc = e.target.value; setSectionSchedules(newS); }} style={{ ...inputStyle, flex: 2 }} />
                        <button type="button" onClick={() => setSectionSchedules(sectionSchedules.filter((_, i) => i !== idx))} className="btn btn-danger" style={{ padding: '0.5rem' }}><Trash2 size={14} /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setSectionSchedules([...sectionSchedules, { day: '', time: '', desc: '' }])} className="btn btn-secondary" style={{ alignSelf: 'flex-start', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}><Plus size={14} /> Añadir Horario</button>
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
                  <div key={m.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '200px' }}>
                      <span style={{ minWidth: '16px', height: '16px', borderRadius: '50%', background: m.accent_color }}></span>
                      <div>
                        <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{m.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {m.id}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button onClick={() => setActiveMinistryId(m.id)} className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}><Edit size={14} style={{ marginRight: '0.5rem' }}/> Entrar al Dashboard</button>
                      <button onClick={() => { if (confirm(`¿Eliminar ${m.name}? Esto no eliminará automáticamente sus fotos si no las borraste primero.`)) { deleteMinistry(m.id); triggerSuccess('Ministerio eliminado.'); } }} className="btn btn-danger" style={{ padding: '0.4rem 0.6rem' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
      </div>
            </div>
            
            <RadioProgramsAdmin />
          </div>
        )}

        {/* TAB 4: BLOGS */}
        {activeTab === 'blogs' && (
          <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}><FileText size={20} style={{ color: 'var(--accent-color)' }} /> Noticias / Blogs</h2>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Operación:</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="radio" checked={blogAction === 'create'} onChange={() => {
                    setBlogAction('create'); setBlogTitle(''); setBlogContent(''); setBlogImageUrl(''); setBlogOrder(blogPosts?.length ? blogPosts.length + 1 : 1); setBlogImageFile(null);
                  }} /> Crear Nueva Noticia
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="radio" checked={blogAction === 'edit'} onChange={() => { setBlogAction('edit'); if (blogPosts?.length) loadBlogData(blogPosts[0].id); }} /> Editar Existente
                </label>
            </div>

            <form onSubmit={handleSaveBlog} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {blogAction === 'edit' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Seleccionar Publicación a Editar</label>
                      <select value={editingBlogId} onChange={(e) => loadBlogData(e.target.value)} style={inputStyle}>
                        {(blogPosts || []).map(b => (
                          <option key={b.id} value={b.id}>{b.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Título de la Publicación</label>
                    <input type="text" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} required style={inputStyle} />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Contenido / Texto Principal</label>
                    <textarea value={blogContent} onChange={(e) => setBlogContent(e.target.value)} required style={{ ...inputStyle, minHeight: '150px' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Imagen Destacada</span>
                    {isSupabaseConfigured ? <input type="file" accept="image/*" onChange={(e) => setBlogImageFile(e.target.files[0])} style={{ fontSize: '0.8rem' }} /> : <input type="text" placeholder="URL de la imagen" value={blogImageUrl} onChange={(e) => setBlogImageUrl(e.target.value)} style={inputStyle} />}
                    {(blogImageUrl || blogImageFile) && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                          <img src={blogImageFile ? URL.createObjectURL(blogImageFile) : blogImageUrl} alt="Blog Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <button type="button" onClick={() => { setBlogImageFile(null); setBlogImageUrl(''); }} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                          Quitar Foto
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Orden (Prioridad)</label>
                    <input type="number" value={blogOrder} onChange={(e) => setBlogOrder(e.target.value)} style={inputStyle} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                {blogAction === 'edit' && editingBlogId && (
                  <button type="button" onClick={async () => {
                    if(window.confirm('¿Eliminar esta publicación?')) {
                      await deleteBlogPost(editingBlogId);
                      triggerSuccess('Publicación eliminada.');
                      setBlogAction('create');
                      setBlogTitle(''); setBlogContent(''); setBlogImageUrl(''); setBlogImageFile(null);
                    }
                  }} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                    <Trash2 size={16} /> Eliminar Publicación
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={isBlogUploading} style={{ marginLeft: 'auto' }}>
                  {isBlogUploading ? 'Guardando...' : <><Save size={16} /> Guardar Publicación</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 6: ADMIN USERS */}
        {activeTab === 'admin_users' && (
          <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}><Lock size={20} style={{ color: 'var(--accent-color)' }} /> Usuarios Administradores</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }} className="grid-cols-2">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserPlus size={16} /> Crear Nuevo Administrador</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newAdminUser || !newAdminPass) return;
                  setIsAdminCreating(true);
                  const res = await addAdminUser(newAdminUser, newAdminPass);
                  if (res.success) {
                    triggerSuccess('Usuario administrador creado.');
                    setNewAdminUser('');
                    setNewAdminPass('');
                  } else {
                    alert(res.message);
                  }
                  setIsAdminCreating(false);
                }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Usuario</label>
                    <input type="text" value={newAdminUser} onChange={(e) => setNewAdminUser(e.target.value)} required placeholder="ej: multimedia" style={inputStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Contraseña</label>
                    <input type="password" value={newAdminPass} onChange={(e) => setNewAdminPass(e.target.value)} required placeholder="••••••••" style={inputStyle} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={isAdminCreating || !newAdminUser || !newAdminPass} style={{ marginTop: '0.5rem' }}>
                    {isAdminCreating ? 'Creando...' : 'Crear Usuario'}
                  </button>
                </form>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Lista de Administradores</h3>
                {adminUsersList.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Cargando usuarios...</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {adminUsersList.map(user => (
                      <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{user.username}</p>
                          {user.created_at && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Creado: {new Date(user.created_at).toLocaleDateString()}</p>}
                        </div>
                        {user.username !== 'imr4' && (
                          <button 
                            type="button" 
                            onClick={async () => {
                              if(window.confirm(`¿Eliminar al administrador ${user.username}?`)) {
                                await deleteAdminUser(user.id);
                                triggerSuccess('Usuario eliminado.');
                              }
                            }}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}
                            title="Eliminar usuario"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                        {user.username === 'imr4' && (
                          <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontWeight: 600 }}>Maestro</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* TAB 7: DONATIONS */}
        {activeTab === 'donations' && (
          <div className="animate-fade-in">
            <DonationsAdmin />
          </div>
        )}

        {/* TAB 8: CONTACT FORMS */}
        {activeTab === 'contact_forms' && (
          <div className="animate-fade-in">
            <ContactFormsAdmin />
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
