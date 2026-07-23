import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import './AulaVirtual.css';
import {
  BookOpen, Video, Sparkles, ArrowLeft, Shield, Heart, Home, Upload, Play, Download, Clock
} from 'lucide-react';

const AulaVirtual = () => {
  const navigate = useNavigate();

  // Obtenemos de forma segura el código guardado en localStorage
  const sessionData = JSON.parse(localStorage.getItem('estudiante_actual') || '{}');
  const codigoGuardado = sessionData.division_codigo || sessionData.codigo || 'GENESIS-2026';

  const [divisionInfo, setDivisionInfo] = useState(null);
  const [streamingConfig, setStreamingConfig] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [codigoGuardado]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Consultar la información de la división / aula actual
      const { data: divData, error: divError } = await supabase
        .from('divisiones')
        .select('*')
        .eq('codigo_acceso', codigoGuardado.trim())
        .maybeSingle();

      if (divError) {
        console.error('Error al obtener la división:', divError.message);
      } else if (divData) {
        setDivisionInfo(divData);
      }

      // 2. Consultar la configuración general (logo institucional) de streaming_config
      const { data: configData, error: configError } = await supabase
        .from('streaming_config')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (configError) {
        console.error('Error al obtener la configuración de la iglesia:', configError.message);
      } else if (configData) {
        setStreamingConfig(configData);
      }

    } catch (err) {
      console.error('Error inesperado:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc', fontWeight: 'bold', color: '#1e293b' }}>
        Cargando tu Aula Virtual... 🎒✨
      </div>
    );
  }

  return (
    <div className="aula-virtual-wrapper">

      {/* NAVEGACIÓN SUPERIOR */}
      <header className="aula-header">
        <div className="aula-header-left">
          <button onClick={() => navigate(-1)} className="aula-back-btn">
            <ArrowLeft size={24} color="#1e293b" />
          </button>

          {/* Logo institucional dinámico jalado desde streaming_config.church_logo_url */}
          <div className="aula-brand-icon" style={{ background: 'transparent', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {streamingConfig?.church_logo_url ? (
              <img
                src={streamingConfig.church_logo_url}
                alt="Logo Iglesia"
                style={{ width: '42px', height: '42px', objectFit: 'contain', borderRadius: '8px' }}
              />
            ) : (
              <Heart size={28} color="#ec4899" fill="#fce7f3" />
            )}
          </div>

          <div>
            <span className="aula-brand-sub">ESCUELA DOMINICAL</span>
            <h2 className="aula-brand-title">Aula Virtual</h2>
          </div>
        </div>

        <nav className="aula-nav-links">
          <button className={`aula-nav-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
            <Home size={18} /> Home
          </button>
          <button className={`aula-nav-btn ${activeTab === 'lessons' ? 'active' : ''}`} onClick={() => setActiveTab('lessons')}>
            <Sparkles size={18} /> Tareas
          </button>
          <button className={`aula-nav-btn ${activeTab === 'videos' ? 'active' : ''}`} onClick={() => setActiveTab('videos')}>
            <Video size={18} /> Videos
          </button>
          <button className={`aula-nav-btn ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}>
            <BookOpen size={18} /> Materiales
          </button>
        </nav>

        <div className="aula-header-right">
          <div className="aula-code-box">
            <span className="aula-code-label">CÓDIGO CLASE</span>
            <div className="aula-code-value">{divisionInfo?.codigo_acceso || codigoGuardado}</div>
          </div>
          <Shield size={28} color="#10b981" />
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="aula-container">

        {/* === HOME / BIENVENIDA === */}
        {activeTab === 'home' && (
          <div className="aula-hero">
            <div className="aula-hero-content">
              <span className="aula-hero-badge">¡Bienvenidos a clase!</span>
              <h1 className="aula-hero-title">
                {divisionInfo?.nombre ? `Clase ${divisionInfo.nombre}` : 'Clase Bíblica'}
              </h1>
              <p className="aula-hero-desc">
                {divisionInfo?.descripcion || 'Creciendo juntos en la fe.'}
              </p>
            </div>
          </div>
        )}

        {/* === TAREAS Y ACTIVIDADES === */}
        {activeTab === 'lessons' && (
          <div>
            <div className="aula-section-title">
              <span className="aula-tag-sub">Aprende jugando</span>
              <h3 className="aula-tag-main">Actividades de la Semana</h3>
            </div>

            <div className="aula-grid">
              {[1, 2].map((item) => (
                <div key={item} className="aula-task-card">
                  <div className="aula-task-header">
                    <span className="aula-task-badge">Para este Domingo</span>
                    <Clock size={16} color="#f59e0b" />
                  </div>
                  <h4 className="aula-task-title">Actividad Creativa #{item}</h4>
                  <p className="aula-task-desc">Sigue las instrucciones de tu maestro y comparte tu manualidad o dibujo de la clase de hoy.</p>
                  <button className="aula-btn-upload">
                    <Upload size={18} /> Entregar Actividad
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === VIDEOS === */}
        {activeTab === 'videos' && (
          <div>
            <div className="aula-section-title">
              <span className="aula-tag-sub">Multimedia</span>
              <h3 className="aula-tag-main">Videos de la Clase</h3>
            </div>

            <div className="aula-grid">
              {[1, 2, 3].map((item) => (
                <div key={item} className="aula-video-card">
                  <div className="aula-video-thumb">
                    <img src={`https://images.unsplash.com/photo-1519068737630-e5db30e12e42?auto=format&fit=crop&q=80&w=400&sig=${item}`} alt="Miniatura de video" />
                    <div className="aula-play-btn"><Play size={24} fill="white" /></div>
                  </div>
                  <div className="aula-video-info">
                    <h4>Historia Bíblica - Lección {item}</h4>
                    <p className="aula-video-subtitle">Publicado por el maestro</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === MATERIALES (RECURSOS) === */}
        {activeTab === 'resources' && (
          <div>
            <div className="aula-section-title">
              <span className="aula-tag-sub">Para imprimir o colorear</span>
              <h3 className="aula-tag-main">Materiales Descargables</h3>
            </div>

            <div className="aula-resource-list">
              {[1, 2].map((item) => (
                <div key={item} className="aula-resource-card">
                  <div className="aula-resource-icon">
                    <Download size={28} />
                  </div>
                  <div className="aula-resource-text">
                    <h4>Hoja de Actividades y Coloreo #{item}</h4>
                    <span className="aula-resource-meta">PDF • Formato oficial</span>
                  </div>
                  <button className="aula-btn-download">
                    Descargar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AulaVirtual;