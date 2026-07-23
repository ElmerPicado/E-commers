import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import './AulaVirtual.css';
import {
  BookOpen, Video, Sparkles, ArrowLeft, Shield, Heart, Award, Home, Upload, Play, Download, Clock
} from 'lucide-react';

const AulaVirtual = () => {
  const navigate = useNavigate();
  const sessionData = JSON.parse(localStorage.getItem('estudiante_actual') || '{}');
  const codigoGuardado = sessionData.division_codigo;

  const [divisionInfo, setDivisionInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    // Simulamos la carga de datos de la división/asignación
    setDivisionInfo({
      nombre: 'Adolescentes (13-15 años)', // Ejemplo para probar el tono
      descripcion: 'Explorando la fe, haciendo preguntas difíciles y creciendo juntos en comunidad.',
      codigo_acceso: codigoGuardado || 'TEENS-2026',
      verse: 'Ninguno tenga en poco tu juventud, sino sé ejemplo de los creyentes. - 1 Timoteo 4:12'
    });
  }, [codigoGuardado]);

  return (
    <div className="aula-virtual-wrapper">

      {/* NAVEGACIÓN (Se mantiene igual a la que ya teníamos) */}
      <header className="aula-header">
        <div className="aula-header-left">
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <Heart size={32} color="#ec4899" fill="#fce7f3" />
          <div>
            <span style={{ fontSize: '10px', color: '#8b5cf6', fontWeight: 'bold' }}>COMUNIDAD METODISTA</span>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '900' }}>Aula Virtual</h2>
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
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' }}>CÓDIGO CLASE</span>
            <div style={{ fontWeight: '900', color: '#1e293b' }}>{divisionInfo?.codigo_acceso}</div>
          </div>
          <Shield size={24} color="#10b981" />
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="aula-container">

        {/* === HOME === (Se mantiene tu código anterior aquí) */}
        {activeTab === 'home' && (
          <div className="aula-hero">
            {/* ... Tu código del hero y estadísticas aquí ... */}
            <div className="aula-hero-content">
              <span className="aula-code">¡Bienvenido a tu clase!</span>
              <h1>{divisionInfo?.nombre}</h1>
              <p>{divisionInfo?.descripcion}</p>
            </div>
          </div>
        )}

        {/* === PESTAÑA: TAREAS Y ACTIVIDADES === */}
        {activeTab === 'lessons' && (
          <div>
            <div className="aula-section-title">
              <div>
                <span>Aprende haciendo</span>
                <h3>Actividades de la Semana</h3>
              </div>
            </div>

            <div className="aula-grid">
              {[1, 2].map((item) => (
                <div key={item} className="aula-task-card">
                  <div className="aula-task-header">
                    <span className="aula-task-badge">Para este Domingo</span>
                    <Clock size={16} color="#f59e0b" />
                  </div>
                  <h4 className="aula-task-title">Dibujo: El Arca de Noé</h4>
                  <p className="aula-task-desc">Dibuja tu animal favorito que subió al arca y cuéntanos por qué lo elegiste. ¡Tómale una foto y súbela aquí!</p>
                  <button className="aula-btn-upload">
                    <Upload size={18} /> Entregar Actividad
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === PESTAÑA: VIDEOS === */}
        {activeTab === 'videos' && (
          <div>
            <div className="aula-section-title">
              <div>
                <span>Cine Bíblico</span>
                <h3>Videos de la Clase</h3>
              </div>
            </div>

            <div className="aula-grid">
              {[1, 2, 3].map((item) => (
                <div key={item} className="aula-video-card">
                  <div className="aula-video-thumb">
                    <img src={`https://images.unsplash.com/photo-1519068737630-e5db30e12e42?auto=format&fit=crop&q=80&w=400&sig=${item}`} alt="Miniatura de video" />
                    <div className="aula-play-btn"><Play size={24} fill="white" /></div>
                  </div>
                  <div className="aula-video-info">
                    <h4>La Creación - Día {item}</h4>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Publicado por tu maestro</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === PESTAÑA: MATERIALES (RECURSOS) === */}
        {activeTab === 'resources' && (
          <div>
            <div className="aula-section-title">
              <div>
                <span>Para imprimir o leer</span>
                <h3>Materiales Descargables</h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2].map((item) => (
                <div key={item} className="aula-resource-card">
                  <div className="aula-resource-icon">
                    <Download size={28} />
                  </div>
                  <div className="aula-resource-text">
                    <h4>Hoja para Colorear - Salmos 23</h4>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>PDF • 2.4 MB</span>
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