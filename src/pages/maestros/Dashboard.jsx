import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import './Dashboard.css';
import {
  PlusCircle, BookOpen, Users, Settings, Trash2, Edit3, Save, X, Shield, ArrowLeft, CheckCircle, AlertCircle, Calendar, Key, LayoutDashboard, CalendarDays, Tags, ChevronDown
} from 'lucide-react';

const SistemaEscolar = () => {
  const navigate = useNavigate();

  // Estados principales
  constких divisionesState = useState([]);
  const divisiones = divisionesState[0];
  const setDivisiones = divisionesState[1];

  const maestrosState = useState([]);
  const maestros = maestrosState[0];
  const setMaestros = maestrosState[1];

  const asignacionesState = useState([]);
  const asignaciones = asignacionesState[0];
  const setAsignaciones = asignacionesState[1];

  const loadingState = useState(true);
  const loading = loadingState[0];
  const setLoading = loadingState[1];

  // Estados para alertas visuales
  const [alerta, setAlerta] = useState({ tipo: '', mensaje: '' });

  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ tipo, mensaje });
    setTimeout(() => {
      setAlerta({ tipo: '', mensaje: '' });
    }, 4000);
  };

  // Carga de datos desde Supabase
  const fetchDatosGenerales = async () => {
    try {
      setLoading(true);

      const [{ data: divData }, { data: mData }, { data: aData }] = await Promise.all([
        supabase.from('divisiones').select('*').order('orden', { ascending: true }),
        supabase.from('maestro_users').select('*'),
        supabase.from('asignaciones').select('*')
      ]);

      setDivisiones(divData || []);
      setMaestros(mData || []);
      setAsignaciones(aData || []);
    } catch (error) {
      console.error('Error al cargar datos:', error.message);
      mostrarAlerta('error', 'No se pudieron cargar los datos del sistema.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatosGenerales();
  }, []);

  return (
    <div className="sistema-escolar-container">
      {/* --- BARRA LATERAL (SIDEBAR) --- */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <Shield size={22} /> EduControl
        </div>

        <p className="sidebar-section-title">Navegación Ministerio</p>
        <ul className="sidebar-nav">
          <li>
            <a href="#" className="active">
              <LayoutDashboard size={18} /> Panel Global
            </a>
          </li>
          <li>
            <a href="#">
              <Users size={18} /> Directorio de Maestros
            </a>
          </li>
        </ul>
      </aside>

      {/* --- CONTENIDO DERECHA --- */}
      <div className="admin-main-content">
        {/* --- BARRA SUPERIOR (HEADER) --- */}
        <header className="admin-top-bar">
          <h1 className="top-bar-title">Panel Global</h1>
          <div className="top-bar-user">
            <div>
              <span className="user-name">Administrador Principal</span>
              <br />
              <span className="user-role">COORDINADOR GENERAL</span>
            </div>
            <div className="user-avatar">A</div>
            <ChevronDown size={16} />
          </div>
        </header>

        {/* --- PÁGINA DE CONTENIDO --- */}
        <main className="admin-page-content">
          {/* Alertas dinámicas */}
          {alerta.mensaje && (
            <div className={`admin-alert ${alerta.tipo}`}>
              {alerta.tipo === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{alerta.mensaje}</span>
            </div>
          )}

          {/* Tarjetas de Estadísticas */}
          <section className="admin-stats-grid">
            <article className="stat-card">
              <div className="stat-info">
                <h3 className="stat-title">MAESTROS REGISTRADOS</h3>
                <p className="stat-value">{maestros.length}</p>
                <p className="stat-subtitle">Personal activo del ministerio</p>
              </div>
              <div className="stat-icon-container stat-icon-users">
                <Users size={20} />
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-info">
                <h3 className="stat-title">DIVISIONES / CLASES</h3>
                <p className="stat-value">{divisiones.length}</p>
                <p className="stat-subtitle">Grupos de edad activos</p>
              </div>
              <div className="stat-icon-container stat-icon-divisions">
                <BookOpen size={20} />
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-info">
                <h3 className="stat-title">CLASES PROGRAMADAS</h3>
                <p className="stat-value">{asignaciones.length}</p>
                <p className="stat-subtitle">Asignaciones activas</p>
              </div>
              <div className="stat-icon-container stat-icon-classes">
                <CalendarDays size={20} />
              </div>
            </article>
          </section>

          {/* Sección de Gestión de Clases */}
          <section className="admin-management-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Gestión de Clases del Ministerio</h2>
                <p className="section-subtitle">Administra maestros de Niños, Adolescentes y Jóvenes</p>
              </div>
              <div className="header-actions">
                <button className="btn-black">
                  <Tags size={16} /> + Nueva División
                </button>
                <button className="btn-black">
                  <PlusCircle size={16} /> + Nuevo Maestro
                </button>
                <button className="btn-orange">
                  <CalendarDays size={16} /> Asignar Clase
                </button>
              </div>
            </div>

            {/* Tabla de Asignaciones */}
            {loading ? (
              <div className="admin-loading">Cargando asignaciones...</div>
            ) : asignaciones.length === 0 ? (
              <div className="admin-empty">No hay clases programadas actualmente.</div>
            ) : (
              <table className="assignments-table">
                <thead>
                  <tr>
                    <th>MAESTRO TITULAR</th>
                    <th>LECCIÓN / MATERIA</th>
                    <th>DIVISIÓN / EDAD</th>
                    <th>HORARIO</th>
                    <th>AULA / CÓDIGO VIRTUAL</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {asignaciones.map((a) => {
                    const maestroEncontrado = maestros.find((m) => m.id === a.maestro_id);
                    const divisionEncontrada = divisiones.find((d) => d.id === a.division_id);

                    return (
                      <tr key={a.id}>
                        <td>
                          <div className="user-cell">
                            <div className="cell-avatar">
                              {maestroEncontrado?.nombre ? maestroEncontrado.nombre.charAt(0) : 'M'}
                            </div>
                            <div className="cell-user-info">
                              <span className="cell-user-name">
                                {maestroEncontrado ? maestroEncontrado.nombre : 'Por asignar'}
                              </span>
                              <span className="cell-user-email">
                                {maestroEncontrado ? maestroEncontrado.email : 'Sin correo'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: '#1e293b' }}>{a.materia || 'Sin materia'}</strong>
                        </td>
                        <td>
                          <span className="tag-yellow">
                            {divisionEncontrada ? divisionEncontrada.nombre : 'Sin división'}
                          </span>
                        </td>
                        <td>
                          <div className="time-info">
                            <Calendar size={14} />
                            <span>{a.horario || 'Por definir'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="location-info">
                            <span className="location-room">📍 {a.aula || 'Salón Principal'}</span>
                            <span className="location-code">🔑 Código: {a.codigo_virtual || 'N/A'}</span>
                          </div>
                        </td>
                        <td>
                          <button
                            className="action-icon"
                            title="Eliminar asignación"
                            onClick={() => console.log('Eliminar', a.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default SistemaEscolar;