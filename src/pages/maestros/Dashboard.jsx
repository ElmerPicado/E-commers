import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import './Dashboard.css';
import {
  PlusCircle, BookOpen, Users, Trash2, Edit3, X, Shield, CheckCircle, AlertCircle, Calendar, LayoutDashboard, CalendarDays, Tags, ChevronDown, Key
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

  // Estados para modales de Crear/Editar ('division', 'maestro', 'asignacion')
  const [modalTipo, setModalTipo] = useState(null);
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

  // Función para guardar / actualizar registros según la tabla correspondiente
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
      } else if (modalTipo === 'maestro') {
        if (editandoId) {
          await supabase.from('maestro_users').update(formData).eq('id', editandoId);
        } else {
          await supabase.from('maestro_users').insert([formData]);
        }
        mostrarAlerta('success', 'Maestro y credenciales guardados exitosamente.');
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
      {/* --- BARRA LATERAL (SIDEBAR) --- */}
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
                    <h2 className="section-title">Gestión de Clases del Ministerio</h2>
                    <p className="section-subtitle">Administra maestros de Niños, Adolescentes y Jóvenes</p>
                  </div>
                  <div className="header-actions">
                    <button className="btn-black" onClick={() => { setModalTipo('division'); setFormData({}); setEditandoId(null); }}>
                      <Tags size={16} /> + Nueva División
                    </button>
                    <button className="btn-black" onClick={() => { setModalTipo('maestro'); setFormData({}); setEditandoId(null); }}>
                      <PlusCircle size={16} /> + Nuevo Maestro
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
                <button className="btn-black" onClick={() => { setModalTipo('maestro'); setFormData({}); setEditandoId(null); }}>
                  <PlusCircle size={16} /> + Nuevo Maestro
                </button>
              </div>
              <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '20px' }}>
                {maestros.map(m => (
                  <div key={m.id} className="stat-card" style={{ flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                      <div className="cell-avatar" style={{ width: '40px', height: '40px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#3b82f6', color: '#fff', borderRadius: '50%' }}>
                        {m.nombre ? m.nombre.charAt(0) : 'M'}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <h4 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>{m.nombre}</h4>
                        <span style={{ fontSize: '13px', color: '#64748b', wordBreak: 'break-all' }}>{m.email}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', width: '100%', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                      <button className="btn-black" style={{ flex: 1, padding: '6px', fontSize: '12px' }} onClick={() => { setModalTipo('maestro'); setFormData(m); setEditandoId(m.id); }}>
                        Editar
                      </button>
                      <button className="action-icon" style={{ color: '#ef4444' }} onClick={() => handleEliminar('maestro_users', m.id)}>
                        <Trash2 size={16} />
                      </button>
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
                  <p className="section-subtitle">Administra los grupos de edad y descripciones</p>
                </div>
                <button className="btn-orange" onClick={() => { setModalTipo('division'); setFormData({}); setEditandoId(null); }}>
                  <Tags size={16} /> + Nueva División
                </button>
              </div>
              <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '20px' }}>
                {divisiones.map(d => (
                  <div key={d.id} className="stat-card" style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="tag-yellow" style={{ marginBottom: '8px', display: 'inline-block' }}>Orden: {d.orden}</span>
                      <h3 style={{ margin: '5px 0', fontSize: '16px', color: '#1e293b' }}>{d.nombre}</h3>
                      <p style={{ fontSize: '13px', color: '#64748b' }}>{d.descripcion || 'Sin descripción asignada.'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px', width: '100%', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
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

      {/* --- MODAL CENTRALIZADO CON POSICIONAMIENTO FORZADO AL CENTRO --- */}
      {modalTipo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }} onClick={() => setModalTipo(null)}>
          <div style={{
            background: '#ffffff',
            padding: '24px',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>
                {modalTipo === 'division' && (editandoId ? 'Editar División' : 'Nueva División')}
                {modalTipo === 'maestro' && (editandoId ? 'Editar Maestro' : 'Nuevo Maestro con Credenciales')}
                {modalTipo === 'asignacion' && (editandoId ? 'Editar Asignación de Clase' : 'Asignar Nueva Clase')}
              </h3>
              <button onClick={() => setModalTipo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {modalTipo === 'division' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>Nombre de la División</label>
                    <input type="text" value={formData.nombre || ''} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>Descripción</label>
                    <textarea value={formData.descripcion || ''} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} rows="3" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>Orden (Número)</label>
                    <input type="number" value={formData.orden || ''} onChange={(e) => setFormData({ ...formData, orden: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                </>
              )}

              {modalTipo === 'maestro' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>Nombre Completo</label>
                    <input type="text" value={formData.nombre || ''} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>Correo Electrónico</label>
                    <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>Contraseña de Acceso</label>
                    <input type="text" value={formData.password || ''} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Contraseña para el maestro" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
                  </div>
                </>
              )}

              {modalTipo === 'asignacion' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>Maestro Titular</label>
                    <select
                      value={formData.maestro_id || ''}
                      onChange={(e) => setFormData({ ...formData, maestro_id: e.target.value })}
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
                      required
                    >
                      <option value="">Selecciona un maestro...</option>
                      {maestros.map(m => (
                        <option key={m.id} value={m.id}>{m.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>División / Grupo</label>
                    <select
                      value={formData.division_id || ''}
                      onChange={(e) => setFormData({ ...formData, division_id: e.target.value })}
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
                      required
                    >
                      <option value="">Selecciona una división...</option>
                      {divisiones.map(d => (
                        <option key={d.id} value={d.id}>{d.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>Materia / Lección</label>
                    <input type="text" value={formData.materia || ''} onChange={(e) => setFormData({ ...formData, materia: e.target.value })} placeholder="Ej: Fundamentos de Fe" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>Horario</label>
                    <input type="text" value={formData.horario || ''} onChange={(e) => setFormData({ ...formData, horario: e.target.value })} placeholder="Ej: Domingos 10:00 AM" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>Aula</label>
                    <input type="text" value={formData.aula || ''} onChange={(e) => setFormData({ ...formData, aula: e.target.value })} placeholder="Ej: Salón Principal" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>Código Virtual</label>
                    <input type="text" value={formData.codigo_virtual || ''} onChange={(e) => setFormData({ ...formData, codigo_virtual: e.target.value })} placeholder="Ej: 105967" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setModalTipo(null)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f1f5f9', cursor: 'pointer', fontWeight: '500' }}>Cancelar</button>
                <button type="submit" className="btn-orange" style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SistemaEscolar;