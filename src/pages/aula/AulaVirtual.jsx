import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import './AulaVirtual.css'; // Nuestro CSS puro
import {
  BookOpen, Video, Sparkles, ArrowLeft, Shield, Heart, Bookmark, Award, Home
} from 'lucide-react';

const AulaVirtual = () => {
  const navigate = useNavigate();
  const sessionData = JSON.parse(localStorage.getItem('estudiante_actual') || '{}');
  const codigoGuardado = sessionData.division_codigo;

  const [divisionInfo, setDivisionInfo] = useState(null);
  const [tareas, setTareas] = useState([]);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    // Simulamos la carga de datos para que puedas ver el diseño
    setDivisionInfo({
      nombre: 'Escuela Dominical Infantil y Juvenil',
      descripcion: 'Creciendo juntos en el amor de Dios, explorando historias bíblicas de forma divertida y creativa.',
      codigo_acceso: codigoGuardado || 'GENESIS-2026',
      verse: 'Dejen a los niños venir a mí, y no se lo impidan, porque el reino de los cielos es de quienes son como ellos. - Mateo 19:14'
    });
    setTareas([1, 2, 3, 4]); // 4 tareas simuladas
  }, [codigoGuardado]);

  return (
    <div className="aula-virtual-wrapper">

      {/* NAVEGACIÓN */}
      <header className="aula-header">
        <div className="aula-header-left">
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <Heart size={32} color="#2563eb" fill="#bfdbfe" />
          <div>
            <span style={{ fontSize: '10px', color: '#d97706', fontWeight: 'bold' }}>COMUNIDAD METODISTA</span>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '900' }}>Aula Virtual</h2>
          </div>
        </div>

        <nav className="aula-nav-links">
          <button className={`aula-nav-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
            <Home size={18} /> Home
          </button>
          <button className={`aula-nav-btn ${activeTab === 'lessons' ? 'active' : ''}`} onClick={() => setActiveTab('lessons')}>
            <BookOpen size={18} /> Lecciones
          </button>
        </nav>

        <div className="aula-header-right">
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' }}>CÓDIGO COMPARTIDO</span>
            <div style={{ fontWeight: '900', color: '#92400e' }}>{divisionInfo?.codigo_acceso}</div>
          </div>
          <Shield size={24} color="#2563eb" />
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="aula-container">

        {activeTab === 'home' && (
          <>
            {/* HERO */}
            <div className="aula-hero">
              <div className="aula-hero-content">
                <span className="aula-code">
                  ACCESO COMPARTIDO: {divisionInfo?.codigo_acceso}
                </span>
                <h1>{divisionInfo?.nombre}</h1>
                <p>{divisionInfo?.descripcion}</p>
                <div className="aula-verse-box">
                  <span style={{ color: '#fbbf24', fontSize: '24px' }}>“</span>
                  <p>{divisionInfo?.verse}</p>
                </div>
              </div>
            </div>

            {/* ESTADÍSTICAS (Soluciona el problema de la imagen) */}
            <div className="aula-stats-grid">
              <div className="aula-stat-card">
                <div className="aula-stat-info">
                  <p className="aula-stat-label">Lecciones Activas</p>
                  <p className="aula-stat-value">{tareas.length}</p>
                </div>
                <div className="aula-stat-icon icon-blue"><BookOpen size={24} /></div>
              </div>

              <div className="aula-stat-card">
                <div className="aula-stat-info">
                  <p className="aula-stat-label">Videos Bíblicos</p>
                  <p className="aula-stat-value">12+</p>
                </div>
                <div className="aula-stat-icon icon-amber"><Video size={24} /></div>
              </div>

              <div className="aula-stat-card">
                <div className="aula-stat-info">
                  <p className="aula-stat-label">Actividades</p>
                  <p className="aula-stat-value">8+</p>
                </div>
                <div className="aula-stat-icon icon-emerald"><Sparkles size={24} /></div>
              </div>

              <div className="aula-stat-card">
                <div className="aula-stat-info">
                  <p className="aula-stat-label">Versículos Clave</p>
                  <p className="aula-stat-value">24</p>
                </div>
                <div className="aula-stat-icon icon-purple"><Award size={24} /></div>
              </div>
            </div>

            {/* LECCIÓN DESTACADA */}
            <div className="aula-section-title">
              <div>
                <span>Destacado de la semana</span>
                <h3>Lección Principal</h3>
              </div>
            </div>

            <div className="aula-featured-card">
              <div className="aula-featured-text">
                <span className="aula-featured-badge">Escuela Dominical • Ciclo 2026</span>
                <h4>"El Buen Pastor y las Ovejas: Conociendo Su Voz"</h4>
                <p>Una hermosa enseñanza sobre cómo Jesús nos cuida, nos llama por nuestro nombre y nos guía siempre por sendas de justicia y amor verdadero.</p>
              </div>
              <div className="aula-featured-image">
                <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800" alt="Lección" />
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
};

export default AulaVirtual;