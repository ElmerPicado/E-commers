import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import './Dashboard.css';
import {
  PlusCircle, BookOpen, Users, Trash2, Edit3, Save, X, Shield, CheckCircle, AlertCircle, Calendar, LayoutDashboard, CalendarDays, Tags, ChevronDown
} from 'lucide-react';

const SistemaEscolar = () => {
  const navigate = useNavigate();

  // Estados principales de datos
  const [divisiones, setDivisiones] = useState([]);
  const [maestros, setMaestros] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Navegación interna por pestañas del menú lateral
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'maestros', 'divisiones'

  // Estados para alertas visuales
  const [alerta, setAlerta] = useState({ tipo: '', mensaje: '' });

  // Estados para modales de Crear/Editar
  const [modalTipo, setModalTipo] = useState(null); // 'division', 'asignacion'
  const [formData, setFormData] = useState({});
  const [editandoId, setEditandoId] = useState(null);

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

  // Función para guardar / actualizar registros
  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (modalTipo === 'division') {
        if (editandoId) {
          await supabase.from('divisiones').update(formData).eq('id', editandoId);
        } else {
          await supabase.from('divisiones').insert([formData]);
        }
        mostrarAlerta('success', 'División guardada exitosamente.');
      } else if (modalTipo === 'asignacion') {
        if (editandoId) {
          await supabase.from('asignaciones').update(formData).eq('id', editandoId);
        } else {
          await supabase.from('asignaciones').insert([formData]);
        }
        mostrarAlerta('success', 'Asignación guardada exitosamente.');
      }
      setModalTipo(null);
      setFormData({});
      setEditandoId(null);
      fetchDatosGenerales();
    } catch (error) {
      console.error('Error al guardar:', error);
      mostrarAlerta('error', 'Ocurrió un error al guardar el registro.');
    }
  };

  // Función para eliminar registros
  const handleEliminar = async (tabla, id) => {
    if (!window.confirm('¿Estás seguro de eliminar este elemento?')) return;
    try {
      const { error } = await supabase.from(tabla).delete().eq('id', id);
      if (error) throw error;
      mostrarAlerta('success', 'Registro eliminado correctamente.');
      fetchDatosGenerales();
    } catch (error) {
      console.error('Error al eliminar:', error);
      mostrarAlerta('error', 'No se pudo eliminar el registro.');
    }
  };

  return (
    <div className="sistema-escolar-container">
      {/* --- BARRA LATERAL (SIDEBAR) ORDENADA --- */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <Shield size={22} /> EduControl
        </div>

        <p className="sidebar-section-title">Navegación Principal</p>
        <ul className="sidebar-nav">
          <li>
            <a href="#dashboard" className={activeTab === 'dashboard' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
              <LayoutDashboard size={18} /> Panel Global
            </a>
          </li>
          <li>
            <a href="#maestros" className={activeTab === 'maestros' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('maestros'); }}>
              <Users size={18} /> Directorio de Maestros
            </a>
          </li>
          <li>
            <a href="#divisiones" className={activeTab === 'divisiones' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('divisiones'); }}>
              <BookOpen size={18} /> Divisiones / Clases
            </a>
          </li>
        </ul>
      </aside>

      {/* --- CONTENIDO DERECHA --- */}
      <div className="admin-main-content">
        {/* --- BARRA SUPERIOR (HEADER) --- */}
        <header className="admin-top-bar">
          <h1 className="top-bar-title">
            {activeTab === 'dashboard' && 'Panel Global de Control'}
            {activeTab === 'maestros' && 'Directorio de Maestros'}
            {activeTab === 'divisiones' && 'Gestión de Divisiones y Grupos'}
          </h1>
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

          {/* VISTA 1: PANEL GLOBAL */}
          {activeTab === 'dashboard' && (
            <>
              {/* Tarjetas de Estadísticas */}
              <section className="admin-stats-grid">
                <article className="stat-card" onClick={() => setActiveTab('maestros')} style={{ cursor: 'pointer' }}>
                  <div className="stat-info">
                    <h3 className="stat-title">MAESTROS REGISTRADOS</h3>
                    <p className="stat-value">{maestros.length}</p>
                    <p className="stat-subtitle">Personal activo del ministerio</p>
                  </div>
                  <div className="stat-icon-container stat-icon-users">
                    <Users size={20} />
                  </div>
                </article>

                <article className="stat-card" onClick={() => setActiveTab('divisiones')} style={{ cursor: 'pointer' }}>
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

              {/* Sección de Gestión de Asignaciones */}
              <section className="admin-management-section">
                <div className="section-header">
                  <div>
                    <h2 className="section-title">Asignaciones Activas de Clases</h2>
                    <p className="section-subtitle">Administra los horarios y maestros asignados</p>
                  </div>
                  <div className="header-actions">
                    <button className="btn-black" onClick={() => { setModalTipo('division'); setFormData({}); setEditandoId(null); }}>
                      <Tags size={16} /> + Nueva División
                    </button>
                    <button className="btn-orange" onClick={() => { setModalTipo('asignacion'); setFormData({}); setEditandoId(null); }}>
                      <CalendarDays size={16} /> Asignar Clase
                    </button>
                  </div>
                </div>

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
                                  <span className="cell-user-name">{maestroEncontrado ? maestroEncontrado.nombre : 'Por asignar'}</span>
                                  <span className="cell-user-email">{maestroEncontrado ? maestroEncontrado.email : 'Sin correo'}</span>
                                </div>
                              </div>
                            </td>
                            <td><strong>{a.materia || 'Sin materia'}</strong></td>
                            <td><span className="tag-yellow">{divisionEncontrada ? divisionEncontrada.nombre : 'Sin división'}</span></td>
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
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="action-icon" title="Editar asignación" onClick={() => { setModalTipo('asignacion'); setFormData(a); setEditandoId(a.id); }}>
                                  <Edit3 size={16} />
                                </button>
                                <button className="action-icon" title="Eliminar asignación" onClick={() => handleEliminar('asignaciones', a.id)}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </section>
            </>
          )}

          {/* VISTA 2: DIRECTORIO DE MAESTROS */}
          {activeTab === 'maestros' && (
            <section className="admin-management-section">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Directorio de Maestros Registrados</h2>
                  <p className="section-subtitle">Listado del personal activo habilitado en el sistema</p>
                </div>
              </div>
              <div className="admin-grid" style={{ marginTop: '20px' }}>
                {maestros.map(m => (
                  <div key={m.id} className="stat-card" style={{ flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="cell-avatar" style={{ width: '40px', height: '40px', fontSize: '16px' }}>{m.nombre ? m.nombre.charAt(0) : 'M'}</div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>{m.nombre}</h4>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>{m.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* VISTA 3: DIVISIONES / CLASES */}
          {activeTab === 'divisiones' && (
            <section className="admin-management-section">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Divisiones y Grupos Activos</h2>
                  <p className="section-subtitle">Administra los grupos de edad, descripciones y códigos de acceso</p>
                </div>
                <button className="btn-orange" onClick={() => { setModalTipo('division'); setFormData({}); setEditandoId(null); }}>
                  <Tags size={16} /> + Nueva División
                </button>
              </div>
              <div className="admin-grid" style={{ marginTop: '20px' }}>
                {divisiones.map(d => (
                  <div key={d.id} className="stat-card" style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span className="tag-yellow">Orden: {d.orden}</span>
                        {d.codigo_acceso && <span style={{ fontSize: '11px', fontFamily: 'monospace', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{d.codigo_acceso}</span>}
                      </div>
                      <h3 style={{ margin: '5px 0', fontSize: '16px', color: '#1e293b' }}>{d.nombre}</h3>
                      <p style={{ fontSize: '13px', color: '#64748b' }}>{d.descripcion || 'Sin descripción asignada.'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                      <button className="btn-black" style={{ flex: 1, padding: '6px', fontSize: '12px' }} onClick={() => { setModalTipo('division'); setFormData(d); setEditandoId(d.id); }}>
                        Editar
                      </button>
                      <button className="action-icon" style={{ color: '#ef4444' }} onClick={() => handleEliminar('divisiones', d.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* --- MODAL CENTRALIZADO Y FLOTANTE PARA CREAR / EDITAR --- */}
      {modalTipo && (
        <div className="modal-overlay" onClick={() => setModalTipo(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalTipo === 'division' && (editandoId ? 'Editar División' : 'Nueva División')}
                {modalTipo === 'asignacion' && (editandoId ? 'Editar Asignación de Clase' : 'Asignar Nueva Clase')}
              </h3>
              <button className="modal-close" onClick={() => setModalTipo(null)}><X size={18} /></button>
            </div>

            <form onSubmit={handleGuardar} className="modal-form">
              {modalTipo === 'division' && (
                <>
                  <div className="form-group">
                    <label>Nombre de la Clase / División</label>
                    <input type="text" value={formData.nombre || ''} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} placeholder="Ej: Clase Génesis" required />
                  </div>

                  <div className="form-group">
                    <label>Código de Acceso (Aula Virtual)</label>
                    <input type="text" value={formData.codigo_acceso || ''} onChange={(e) => setFormData({ ...formData, codigo_acceso: e.target.value })} placeholder="Ej: GENESIS-2026" required />
                  </div>

                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea value={formData.descripcion || ''} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} placeholder="Ej: Niños 6-8 años - Primeros pasos en la fe" rows="3" />
                  </div>

                  <div className="form-group">
                    <label>Orden (Número)</label>
                    <input type="number" value={formData.orden || ''} onChange={(e) => setFormData({ ...formData, orden: e.target.value })} />
                  </div>
                </>
              )}

              {modalTipo === 'asignacion' && (
                <>
                  <div className="form-group">
                    <label>Maestro Titular</label>
                    <select
                      value={formData.maestro_id || ''}
                      onChange={(e) => setFormData({ ...formData, maestro_id: e.target.value })}
                      required
                    >
                      <option value="">Selecciona un maestro...</option>
                      {maestros.map(m => (
                        <option key={m.id} value={m.id}>{m.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>División / Grupo</label>
                    <select
                      value={formData.division_id || ''}
                      onChange={(e) => setFormData({ ...formData, division_id: e.target.value })}
                      required
                    >
                      <option value="">Selecciona una división...</option>
                      {divisiones.map(d => (
                        <option key={d.id} value={d.id}>{d.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Materia / Lección</label>
                    <input type="text" value={formData.materia || ''} onChange={(e) => setFormData({ ...formData, materia: e.target.value })} placeholder="Ej: Fundamentos de Fe" required />
                  </div>

                  <div className="form-group">
                    <label>Horario</label>
                    <input type="text" value={formData.horario || ''} onChange={(e) => setFormData({ ...formData, horario: e.target.value })} placeholder="Ej: Domingos 10:00 AM" />
                  </div>

                  <div className="form-group">
                    <label>Aula</label>
                    <input type="text" value={formData.aula || ''} onChange={(e) => setFormData({ ...formData, aula: e.target.value })} placeholder="Ej: Salón Principal" />
                  </div>

                  <div className="form-group">
                    <label>Código Virtual</label>
                    <input type="text" value={formData.codigo_virtual || ''} onChange={(e) => setFormData({ ...formData, codigo_virtual: e.target.value })} placeholder="Ej: 105967" />
                  </div>
                </>
              )}

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModalTipo(null)}>Cancelar</button>
                <button type="submit" className="btn-orange">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SistemaEscolar;