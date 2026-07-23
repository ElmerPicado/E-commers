import React, { useState, useEffect } from 'react';
import {
  Users, BookOpen, Calendar, CheckSquare,
  Plus, Trash2, Clock, Menu, Bell, Shield, Briefcase, LayoutDashboard,
  LogOut, UserCheck, X, GraduationCap, MapPin, Tag, Key
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import './Dashboard.css';

/* ============================================
   MODAL REUTILIZABLE
   ============================================ */
const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div className="dash-modal-overlay" onClick={onClose}>
      <div className="dash-modal" onClick={e => e.stopPropagation()}>
        <div className="dash-modal-header">
          <h3 className="dash-modal-title">{title}</h3>
          <button className="dash-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="dash-modal-body">{children}</div>
        {footer && <div className="dash-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

/* ============================================
   STAT CARD
   ============================================ */
const StatCard = ({ title, value, icon: Icon, color = 'amber', subtitle }) => (
  <div className="dash-stat-card">
    <div>
      <p className="dash-stat-label">{title}</p>
      <p className="dash-stat-value">{value}</p>
      {subtitle && <p className="dash-stat-subtitle">{subtitle}</p>}
    </div>
    <div className={`dash-stat-icon ${color}`}>
      <Icon />
    </div>
  </div>
);

/* ============================================
   ADMIN DASHBOARD VIEW
   ============================================ */
const AdminDashboardView = ({
  maestros, asignaciones, divisiones,
  onOpenAddMaestro, onOpenAddAsignacion, onOpenAddDivision, onDeleteAsignacion
}) => (
  <div>
    {/* Stats */}
    <div className="dash-stats-grid">
      <StatCard title="Maestros Registrados" value={maestros.length} icon={Users} color="amber" subtitle="Personal activo del ministerio" />
      <StatCard title="Divisiones / Clases" value={divisiones.length} icon={GraduationCap} color="green" subtitle="Grupos de edad activos" />
      <StatCard title="Clases Programadas" value={asignaciones.length} icon={Briefcase} color="purple" subtitle="Asignaciones activas" />
    </div>

    {/* Actions */}
    <div className="dash-action-bar">
      <div>
        <p className="dash-action-title">Gestión de Clases y Aula Virtual</p>
        <p className="dash-action-desc">Administra maestros, códigos de acceso y aulas virtuales</p>
      </div>
      <div className="dash-action-btns">
        <button className="dash-btn dash-btn-outline" onClick={onOpenAddDivision}>
          <Tag size={16} /> + Nueva División
        </button>
        <button className="dash-btn dash-btn-dark" onClick={onOpenAddMaestro}>
          <Plus size={16} /> Nuevo Maestro
        </button>
        <button className="dash-btn dash-btn-primary" onClick={onOpenAddAsignacion}>
          <Briefcase size={16} /> Asignar Clase
        </button>
      </div>
    </div>

    {/* Table */}
    <div className="dash-table-container">
      <div className="dash-table-header">
        <h4 className="dash-table-title">Asignaciones Activas de Clases</h4>
        <span className="dash-table-badge">{asignaciones.length} Clases</span>
      </div>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Maestro Titular</th>
              <th>Lección / Materia</th>
              <th>División / Edad</th>
              <th>Horario</th>
              <th>Aula / Código Virtual</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {asignaciones.length === 0 ? (
              <tr>
                <td colSpan="6" className="dash-table-empty">
                  No hay clases asignadas aún. Haz clic en "Asignar Clase" para comenzar.
                </td>
              </tr>
            ) : (
              asignaciones.map(asig => {
                const maestro = maestros.find(m => m.id === asig.maestroId);
                return (
                  <tr key={asig.id}>
                    <td>
                      <div className="dash-maestro-cell">
                        <div className="dash-maestro-avatar">{maestro?.nombre?.charAt(0) || 'M'}</div>
                        <div>
                          <p className="dash-maestro-name">{maestro?.nombre || 'Maestro'}</p>
                          <p className="dash-maestro-email">{maestro?.email || 'sin correo'}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{asig.materia}</td>
                    <td><span className="dash-division-badge">{asig.grupo}</span></td>
                    <td>
                      <span className="dash-horario-cell">
                        <Clock size={14} /> {asig.horario || 'Domingos 10:00 AM'}
                      </span>
                    </td>
                    <td>
                      <div className="dash-aula-cell">
                        <span className="dash-aula-name"><MapPin size={14} /> {asig.aula || 'Salón Principal'}</span>
                        {asig.codigoVirtual && (
                          <span className="dash-codigo-virtual"><Key size={12} /> Código: {asig.codigoVirtual}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="dash-btn dash-btn-danger-ghost" onClick={() => onDeleteAsignacion(asig.id)} title="Eliminar Clase">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

/* ============================================
   ADMIN MAESTROS LIST VIEW
   ============================================ */
const AdminMaestrosListView = ({ maestros, onDeleteMaestro, onOpenAddMaestro }) => (
  <div>
    <div className="dash-action-bar" style={{ marginBottom: 24 }}>
      <div>
        <p className="dash-action-title">Directorio de Maestros del Ministerio</p>
        <p className="dash-action-desc">Personal encargado de Niños, Adolescentes y Jóvenes</p>
      </div>
      <button className="dash-btn dash-btn-primary" onClick={onOpenAddMaestro}>
        <Plus size={16} /> Agregar Nuevo Maestro
      </button>
    </div>

    <div className="dash-cards-grid">
      {maestros.map(m => (
        <div key={m.id} className="dash-person-card">
          <div className="dash-person-top">
            <div className="dash-person-info">
              <div className="dash-person-avatar">{m.nombre.charAt(0)}</div>
              <div>
                <p className="dash-person-name">{m.nombre}</p>
                <p className="dash-person-specialty">{m.especialidad || 'Maestro Titular'}</p>
              </div>
            </div>
            <button className="dash-btn dash-btn-danger-ghost" onClick={() => onDeleteMaestro(m.id)}>
              <Trash2 size={16} />
            </button>
          </div>
          <div className="dash-person-details">
            <p><strong>Correo:</strong> {m.email || 'No registrado'}</p>
            <p><strong>Teléfono / WhatsApp:</strong> {m.telefono || 'Sin teléfono'}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ============================================
   MAESTRO RESUMEN VIEW
   ============================================ */
const MaestroResumenView = ({ asignacionesProfesor, maestroNombre }) => (
  <div>
    <div className="dash-welcome-banner">
      <span className="dash-welcome-badge">Servidor / Maestro Activo</span>
      <h2 className="dash-welcome-title">¡Bienvenido de nuevo, {maestroNombre}! 👋</h2>
      <p className="dash-welcome-subtitle">Resumen de tus clases infantiles, juveniles y lecciones asignadas.</p>
    </div>

    <div className="dash-stats-grid">
      <StatCard title="Mis Clases Asignadas" value={asignacionesProfesor.length} icon={BookOpen} color="amber" />
      <StatCard title="Frecuencia" value="Dominical" icon={Clock} color="green" />
      <StatCard title="Lecciones Listas" value="Activas" icon={CheckSquare} color="purple" />
    </div>

    <div className="dash-clases-section">
      <h3 className="dash-clases-title">Mis Clases y Grupos Asignados</h3>
      <div className="dash-clases-grid">
        {asignacionesProfesor.length === 0 ? (
          <p style={{ color: 'var(--dash-text-muted)', gridColumn: '1 / -1', padding: '16px 0' }}>
            No tienes clases asignadas por la administración en este momento.
          </p>
        ) : (
          asignacionesProfesor.map(clase => (
            <div key={clase.id} className="dash-clase-card">
              <div className="dash-clase-left">
                <div className="dash-clase-icon"><BookOpen size={20} /></div>
                <div>
                  <p className="dash-clase-nombre">{clase.materia}</p>
                  <p className="dash-clase-grupo">Grupo {clase.grupo} • {clase.aula}</p>
                  <p className="dash-clase-horario">{clase.horario}</p>
                </div>
              </div>
              <button className="dash-btn-sm">Ver Aula</button>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

/* ============================================
   CALENDARIO VIEW
   ============================================ */
const CalendarioView = ({ asignaciones }) => {
  const dias = ['Domingo (Mañana)', 'Domingo (Tarde)', 'Entre Semana'];
  return (
    <div>
      <div className="dash-action-bar" style={{ marginBottom: 24 }}>
        <div>
          <p className="dash-action-title">Horario de Clases y Lecciones</p>
          <p className="dash-action-desc">Organización semanal de la Escuela Dominical y Jóvenes</p>
        </div>
      </div>

      <div className="dash-calendar-grid">
        {dias.map((dia, idx) => (
          <div key={dia} className="dash-calendar-day">
            <div className="dash-calendar-day-title">{dia}</div>
            {asignaciones.length === 0 ? (
              <p className="dash-calendar-empty">Sin actividades agendadas</p>
            ) : (
              asignaciones.slice(idx % asignaciones.length, (idx % asignaciones.length) + 2).map((asig, i) => (
                <div key={i} className="dash-calendar-event">
                  <p className="dash-calendar-event-title">{asig.materia}</p>
                  <p className="dash-calendar-event-group">Grupo: {asig.grupo}</p>
                  <p className="dash-calendar-event-time"><Clock size={12} /> {asig.horario || '10:00 AM'}</p>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================================
   COMPONENTE PRINCIPAL
   ============================================ */
const SistemaEscolar = () => {
  const [currentUser, setCurrentUser] = useState({
    id: 'admin-01', nombre: 'Administrador Principal', role: 'admin',
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modales
  const [isAddMaestroOpen, setIsAddMaestroOpen] = useState(false);
  const [isAddAsignacionOpen, setIsAddAsignacionOpen] = useState(false);
  const [isAddDivisionOpen, setIsAddDivisionOpen] = useState(false);

  // Generador de UUID para identificadores válidos en PostgreSQL
  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // Divisiones
  const [divisiones, setDivisiones] = useState([]);

  // Maestros
  const [maestros, setMaestros] = useState([]);

  // Asignaciones
  const [asignaciones, setAsignaciones] = useState([]);

  // Forms
  const [newMaestro, setNewMaestro] = useState({ nombre: '', especialidad: '', email: '', telefono: '' });
  const [newAsignacion, setNewAsignacion] = useState({ maestroId: '', materia: '', grupo: '', horario: 'Domingos 10:00 AM', aula: 'Salón Principal' });
  const [newDivisionNombre, setNewDivisionNombre] = useState('');

  // Cargar desde Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar Maestros
        const { data: dbMaestros, error: errM } = await supabase
          .from('maestro_users')
          .select('*');
        if (!errM && dbMaestros) {
          setMaestros(dbMaestros.map(m => ({
            id: m.id,
            nombre: m.nombre || 'Maestro',
            especialidad: m.role || 'Maestro Titular',
            email: m.email,
            telefono: m.telefono || m.whatsapp || ''
          })));
        } else if (errM) {
          console.error('Error cargando maestros de Supabase:', errM);
        }

        // Cargar Divisiones
        const { data: dbDiv, error: errD } = await supabase
          .from('divisiones')
          .select('*')
          .order('orden', { ascending: true });
        if (!errD && dbDiv) {
          setDivisiones(dbDiv.map(d => ({
            id: d.id,
            nombre: d.nombre
          })));
        } else if (errD) {
          console.error('Error cargando divisiones de Supabase:', errD);
        }

        // Cargar Asignaciones (si la tabla existe)
        const { data: dbAsig, error: errA } = await supabase
          .from('asignaciones')
          .select('*');
        if (!errA && dbAsig) {
          setAsignaciones(dbAsig.map(a => ({
            id: a.id,
            maestroId: a.maestro_id || a.maestroId || '',
            materia: a.materia || '',
            grupo: a.grupo || '',
            horario: a.horario || '',
            aula: a.aula || '',
            codigoVirtual: a.codigo_virtual || a.codigoVirtual || ''
          })));
        } else if (errA) {
          console.error('Error cargando asignaciones de Supabase:', errA);
        }
      } catch (err) {
        console.error('Error general al cargar datos de Supabase:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handlers
  const handleAddMaestro = async (e) => {
    e.preventDefault();
    if (!newMaestro.nombre) return;
    if (newMaestro.email && maestros.some(m => m.email?.toLowerCase() === newMaestro.email.toLowerCase())) {
      alert('Este correo electrónico ya está registrado con otro maestro.');
      return;
    }
    const id = generateUUID();
    const maestroData = {
      id,
      nombre: newMaestro.nombre,
      especialidad: newMaestro.especialidad || 'Maestro Titular',
      email: newMaestro.email || `${id}@ministerio.edu`,
      telefono: newMaestro.telefono || ''
    };

    try {
      const { error } = await supabase
        .from('maestro_users')
        .insert([{
          id,
          nombre: newMaestro.nombre,
          email: maestroData.email,
          telefono: newMaestro.telefono || null,
          whatsapp: newMaestro.telefono || null,
          role: 'maestro',
          activo: true
        }]);
      if (error) throw error;
    } catch (err) {
      console.error('Error al guardar maestro en Supabase:', err);
    }

    setMaestros(prev => [...prev, maestroData]);
    setNewMaestro({ nombre: '', especialidad: '', email: '', telefono: '' });
    setIsAddMaestroOpen(false);
  };

  const handleAddDivision = async (e) => {
    e.preventDefault();
    if (!newDivisionNombre.trim()) return;
    if (divisiones.some(d => d.nombre.toLowerCase() === newDivisionNombre.trim().toLowerCase())) {
      alert('Esta división o rango de edad ya existe.');
      return;
    }
    const id = generateUUID();
    const divisionData = {
      id,
      nombre: newDivisionNombre.trim()
    };

    try {
      const cleanName = newDivisionNombre.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      const codigo_acceso = `${cleanName}-${Math.floor(1000 + Math.random() * 9000)}`;

      const { error } = await supabase
        .from('divisiones')
        .insert([{
          id,
          nombre: divisionData.nombre,
          codigo_acceso,
          activa: true
        }]);
      if (error) throw error;
    } catch (err) {
      console.error('Error al guardar división en Supabase:', err);
    }

    setDivisiones(prev => [...prev, divisionData]);
    setNewDivisionNombre('');
    setIsAddDivisionOpen(false);
  };

  const handleAddAsignacion = async (e) => {
    e.preventDefault();
    if (!newAsignacion.maestroId || !newAsignacion.materia || !newAsignacion.grupo) {
      alert('Por favor, completa todos los campos requeridos.');
      return;
    }
    const id = generateUUID();
    const codigoVirtual = Math.floor(100000 + Math.random() * 900000).toString();
    const asignacionData = {
      id,
      ...newAsignacion,
      codigoVirtual
    };

    try {
      const { error: err1 } = await supabase
        .from('asignaciones')
        .insert([{
          id,
          maestro_id: newAsignacion.maestroId,
          materia: newAsignacion.materia,
          grupo: newAsignacion.grupo,
          horario: newAsignacion.horario,
          aula: newAsignacion.aula,
          codigo_virtual: codigoVirtual
        }]);
      if (err1) {
        const { error: err2 } = await supabase
          .from('asignaciones')
          .insert([{
            id,
            maestroId: newAsignacion.maestroId,
            materia: newAsignacion.materia,
            grupo: newAsignacion.grupo,
            horario: newAsignacion.horario,
            aula: newAsignacion.aula,
            codigoVirtual
          }]);
        if (err2) throw err2;
      }
    } catch (err) {
      console.error('Error al guardar asignación en Supabase:', err);
    }

    setAsignaciones(prev => [...prev, asignacionData]);
    setNewAsignacion({ maestroId: '', materia: '', grupo: '', horario: 'Domingos 10:00 AM', aula: 'Salón Principal' });
    setIsAddAsignacionOpen(false);
  };

  const handleDeleteMaestro = async (id) => {
    try {
      const { error } = await supabase
        .from('maestro_users')
        .delete()
        .eq('id', id);
      if (error) throw error;

      await supabase.from('asignaciones').delete().eq('maestro_id', id);
      await supabase.from('asignaciones').delete().eq('maestroId', id);
    } catch (err) {
      console.error('Error al eliminar maestro de Supabase:', err);
    }

    setMaestros(prev => prev.filter(m => m.id !== id));
    setAsignaciones(prev => prev.filter(a => a.maestroId !== id));
  };

  const handleDeleteAsignacion = async (id) => {
    try {
      const { error } = await supabase
        .from('asignaciones')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error al eliminar asignación de Supabase:', err);
    }

    setAsignaciones(prev => prev.filter(a => a.id !== id));
  };

  const cambiarARol = (role) => {
    setCurrentUser(role === 'maestro'
      ? { id: 'm1', nombre: 'Prof. Carlos García', role: 'maestro' }
      : { id: 'admin-01', nombre: 'Administrador Principal', role: 'admin' }
    );
    setActiveTab('dashboard');
    setSidebarOpen(false);
  };

  const adminMenus = [
    { id: 'dashboard', label: 'Panel Global', icon: LayoutDashboard },
    { id: 'maestros', label: 'Directorio de Maestros', icon: Users },
  ];
  const maestroMenus = [
    { id: 'dashboard', label: 'Mi Resumen', icon: LayoutDashboard },
    { id: 'calendario', label: 'Mi Horario Dominical', icon: Calendar },
  ];
  const currentMenus = currentUser.role === 'admin' ? adminMenus : maestroMenus;

  return (
    <div className="dashboard-root">
      {/* Mobile Overlay */}
      <div
        className={`dash-sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`dash-sidebar ${!sidebarOpen ? 'closed' : ''}`}>
        <div className="dash-sidebar-header">
          <span className="dash-sidebar-logo">
            <div className="dash-sidebar-logo-icon"><Shield size={20} /></div>
            EduControl
          </span>
          <button className="dash-sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="dash-sidebar-nav">
          <p className="dash-sidebar-nav-label">Navegación Ministerio</p>
          {currentMenus.map(item => (
            <button
              key={item.id}
              className={`dash-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="dash-sidebar-footer">
          {currentUser.role === 'admin' ? (
            <button className="dash-role-btn admin-to-maestro" onClick={() => cambiarARol('maestro')}>
              <UserCheck size={16} /> Modo Vista Maestro
            </button>
          ) : (
            <button className="dash-role-btn maestro-to-admin" onClick={() => cambiarARol('admin')}>
              <LogOut size={16} /> Volver a Administrador
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="dash-main">
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <button className="dash-mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <h1 className="dash-topbar-title">
              {currentMenus.find(m => m.id === activeTab)?.label || activeTab}
            </h1>
          </div>
          <div className="dash-topbar-right">
            <button className="dash-notification-btn">
              <Bell size={20} />
              <span className="dash-notification-dot" />
            </button>
            <div className="dash-user-info">
              <div className={`dash-user-avatar ${currentUser.role}`}>
                {currentUser.role === 'admin' ? 'A' : 'M'}
              </div>
              <div className="dash-user-details">
                <p className="dash-user-name">{currentUser.nombre}</p>
                <p className="dash-user-role">{currentUser.role === 'admin' ? 'Coordinador General' : 'Maestro Titular'}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="dash-body">
          {currentUser.role === 'admin' && (
            <>
              {activeTab === 'dashboard' && (
                <AdminDashboardView
                  maestros={maestros} asignaciones={asignaciones} divisiones={divisiones}
                  onOpenAddMaestro={() => setIsAddMaestroOpen(true)}
                  onOpenAddAsignacion={() => setIsAddAsignacionOpen(true)}
                  onOpenAddDivision={() => setIsAddDivisionOpen(true)}
                  onDeleteAsignacion={handleDeleteAsignacion}
                />
              )}
              {activeTab === 'maestros' && (
                <AdminMaestrosListView
                  maestros={maestros} onDeleteMaestro={handleDeleteMaestro}
                  onOpenAddMaestro={() => setIsAddMaestroOpen(true)}
                />
              )}
            </>
          )}
          {currentUser.role === 'maestro' && (
            <>
              {activeTab === 'dashboard' && (
                <MaestroResumenView
                  asignacionesProfesor={asignaciones.filter(a => a.maestroId === currentUser.id)}
                  maestroNombre={currentUser.nombre}
                />
              )}
              {activeTab === 'calendario' && (
                <CalendarioView asignaciones={asignaciones.filter(a => a.maestroId === currentUser.id)} />
              )}
            </>
          )}
        </main>
      </div>

      {/* ============ MODALES ============ */}

      {/* MODAL: Nuevo Maestro */}
      <Modal
        isOpen={isAddMaestroOpen}
        onClose={() => setIsAddMaestroOpen(false)}
        title="Registrar Nuevo Maestro del Ministerio"
        footer={
          <>
            <button className="dash-btn-cancel" onClick={() => setIsAddMaestroOpen(false)}>Cancelar</button>
            <button className="dash-btn-submit" onClick={handleAddMaestro}>Guardar Maestro</button>
          </>
        }
      >
        <form onSubmit={handleAddMaestro}>
          <div className="dash-field">
            <label className="dash-label">Nombre Completo del Maestro</label>
            <input className="dash-input" type="text" placeholder="Ej. Profa. Ana López" value={newMaestro.nombre}
              onChange={e => setNewMaestro({ ...newMaestro, nombre: e.target.value })} required />
          </div>
          <div className="dash-field">
            <label className="dash-label">Enfoque / Ministerio</label>
            <input className="dash-input" type="text" placeholder="Ej. Escuela Dominical Infantil / Jóvenes" value={newMaestro.especialidad}
              onChange={e => setNewMaestro({ ...newMaestro, especialidad: e.target.value })} required />
          </div>
          <div className="dash-field-row">
            <div className="dash-field">
              <label className="dash-label">Correo Electrónico</label>
              <input className="dash-input" type="email" placeholder="correo@ejemplo.com" value={newMaestro.email}
                onChange={e => setNewMaestro({ ...newMaestro, email: e.target.value })} />
            </div>
            <div className="dash-field">
              <label className="dash-label">Teléfono / WhatsApp</label>
              <input className="dash-input" type="text" placeholder="+506 8888-0000" value={newMaestro.telefono}
                onChange={e => setNewMaestro({ ...newMaestro, telefono: e.target.value })} />
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL: Asignar Clase */}
      <Modal
        isOpen={isAddAsignacionOpen}
        onClose={() => setIsAddAsignacionOpen(false)}
        title="Asignar Lección / Clase de Ministerio"
        footer={
          <>
            <button className="dash-btn-cancel" onClick={() => setIsAddAsignacionOpen(false)}>Cancelar</button>
            <button className="dash-btn-submit" onClick={handleAddAsignacion}>Guardar Asignación</button>
          </>
        }
      >
        <form onSubmit={handleAddAsignacion}>
          <div className="dash-field">
            <label className="dash-label">Maestro Encargado</label>
            <select className="dash-select" value={newAsignacion.maestroId}
              onChange={e => setNewAsignacion({ ...newAsignacion, maestroId: e.target.value })} required>
              <option value="">Seleccionar Maestro...</option>
              {maestros.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.especialidad || 'Titular'})</option>)}
            </select>
          </div>
          <div className="dash-field">
            <label className="dash-label">Lección / Tema de la Clase</label>
            <input className="dash-input" type="text" placeholder="Ej. Historias Bíblicas & Valores" value={newAsignacion.materia}
              onChange={e => setNewAsignacion({ ...newAsignacion, materia: e.target.value })} required />
          </div>
          <div className="dash-field-row">
            <div className="dash-field">
              <label className="dash-label">División / Rango de Edad</label>
              <select className="dash-select" value={newAsignacion.grupo}
                onChange={e => setNewAsignacion({ ...newAsignacion, grupo: e.target.value })} required>
                <option value="">Seleccionar Grupo...</option>
                {divisiones.map(d => <option key={d.id} value={d.nombre}>{d.nombre}</option>)}
              </select>
            </div>
            <div className="dash-field">
              <label className="dash-label">Salón / Aula Físico</label>
              <input className="dash-input" type="text" placeholder="Ej. Salón Infantil A" value={newAsignacion.aula}
                onChange={e => setNewAsignacion({ ...newAsignacion, aula: e.target.value })} required />
            </div>
          </div>
          <div className="dash-field">
            <label className="dash-label">Horario Dominical / Fijo</label>
            <input className="dash-input" type="text" placeholder="Ej. Domingos 10:00 AM" value={newAsignacion.horario}
              onChange={e => setNewAsignacion({ ...newAsignacion, horario: e.target.value })} required />
          </div>
        </form>
      </Modal>

      {/* MODAL: Nueva División */}
      <Modal
        isOpen={isAddDivisionOpen}
        onClose={() => setIsAddDivisionOpen(false)}
        title="Crear Nueva División o Rango de Edad"
        footer={
          <>
            <button className="dash-btn-cancel" onClick={() => setIsAddDivisionOpen(false)}>Cancelar</button>
            <button className="dash-btn-submit-dark" onClick={handleAddDivision}>Crear División</button>
          </>
        }
      >
        <form onSubmit={handleAddDivision}>
          <div className="dash-field">
            <label className="dash-label">Nombre de la División o Grupo</label>
            <input className="dash-input" type="text" placeholder="Ej. Pre-Adolescentes (10-12 años)" value={newDivisionNombre}
              onChange={e => setNewDivisionNombre(e.target.value)} required />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SistemaEscolar;