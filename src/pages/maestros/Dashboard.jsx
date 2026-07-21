import React, { useState } from 'react';
import {
  Users, BookOpen, Calendar, CheckSquare,
  Plus, Search, Trash2, ChevronRight, CheckCircle,
  Clock, Menu, Bell, Shield, User, Briefcase, LayoutDashboard,
  LogOut, UserCheck
} from 'lucide-react';

// ==========================================
// COMPONENTES REUTILIZABLES
// ==========================================

const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 w-full">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3.5 rounded-2xl border ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

// ==========================================
// VISTAS DEL ADMINISTRADOR
// ==========================================

const AdminAsignacionesView = ({ asignaciones, maestros, grupos, onAsignar }) => {
  const [form, setForm] = useState({ maestroId: '', grupo: '', materia: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.maestroId && form.grupo && form.materia) {
      onAsignar(form);
      setForm({ maestroId: '', grupo: '', materia: '' });
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Formulario de Asignación */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm w-full">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-600" />
          Asignar Cátedra a Maestro
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Maestro</label>
            <select
              value={form.maestroId} onChange={e => setForm({ ...form, maestroId: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-indigo-500" required
            >
              <option value="">Seleccionar Maestro...</option>
              {maestros.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Materia / Asignatura</label>
            <input
              type="text" placeholder="Ej. Programación Web" value={form.materia} onChange={e => setForm({ ...form, materia: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-indigo-500" required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Grupo</label>
            <select
              value={form.grupo} onChange={e => setForm({ ...form, grupo: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-indigo-500" required
            >
              <option value="">Seleccionar Grupo...</option>
              {grupos.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white p-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-100">
            Guardar Asignación
          </button>
        </form>
      </div>

      {/* Tabla de Asignaciones */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Control de Asignaciones Institucionales</h3>
          <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2.5 py-1 rounded-md">{asignaciones.length} Activas</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-gray-400 font-bold uppercase text-xs border-b border-gray-100">
              <tr>
                <th className="p-4">Docente Titular</th>
                <th className="p-4">Materia</th>
                <th className="p-4">Grupo</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asignaciones.map((asig, idx) => {
                const maestro = maestros.find(m => m.id === asig.maestroId);
                return (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors border-b border-gray-50">
                    <td className="p-4 font-semibold text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {maestro?.nombre?.charAt(0) || 'D'}
                      </div>
                      {maestro?.nombre}
                    </td>
                    <td className="p-4 text-gray-600 font-medium">{asig.materia}</td>
                    <td className="p-4"><span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-xs">{asig.grupo}</span></td>
                    <td className="p-4 text-right">
                      <button className="text-gray-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// VISTAS DEL MAESTRO
// ==========================================

const MaestroResumenView = ({ asignacionesProfesor, maestroNombre }) => (
  <div className="space-y-6 w-full">
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
      <div>
        <h2 className="text-2xl font-bold">¡Bienvenido, {maestroNombre}! 👋</h2>
        <p className="text-blue-100 text-sm mt-1">Este es el panel con las asignaturas e imprecisiones asignadas por la administración.</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <StatCard title="Mis Grupos Asignados" value={asignacionesProfesor.length} icon={Users} color="blue" />
      <StatCard title="Clases Agendadas" value="4" icon={Calendar} color="green" />
      <StatCard title="Revisiones Pendientes" value="8" icon={CheckSquare} color="amber" />
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm w-full">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Cátedras Asignadas a Tu Perfil</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {asignacionesProfesor.map((clase, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100/70 text-indigo-600 rounded-xl shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{clase.materia}</p>
                <p className="text-xs text-gray-500 mt-0.5">Grupo {clase.grupo}</p>
              </div>
            </div>
            <button className="text-sm font-bold text-indigo-600 hover:underline">Acceder</button>
          </div>
        ))}
        {asignacionesProfesor.length === 0 && (
          <p className="text-gray-400 text-sm col-span-2 text-center py-6 border border-dashed rounded-xl">
            Aún no tienes asignaturas registradas por el Administrador.
          </p>
        )}
      </div>
    </div>
  </div>
);

// ==========================================
// CONTENEDOR PRINCIPAL
// ==========================================

const SistemaEscolar = () => {
  // Estado principal de sesión: Inicias directamente como ADMIN
  const [currentUser, setCurrentUser] = useState({
    id: 'admin-01',
    nombre: 'Administrador Principal',
    role: 'admin', // 'admin' o 'maestro'
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Datos Institucionales (BD Mock)
  const [maestros] = useState([
    { id: 'm1', nombre: 'Prof. García' },
    { id: 'm2', nombre: 'Profa. Martínez' }
  ]);
  const grupos = ['1A', '1B', '2A', '3C', '4A'];
  const [asignaciones, setAsignaciones] = useState([
    { maestroId: 'm1', materia: 'Matemáticas Avanzadas', grupo: '4A' },
    { maestroId: 'm1', materia: 'Física I', grupo: '1A' },
    { maestroId: 'm2', materia: 'Química Orgánica', grupo: '2A' },
  ]);

  const handleNuevaAsignacion = (nueva) => {
    setAsignaciones([...asignaciones, nueva]);
  };

  // Función de pruebas para simular entrar como el Maestro creado
  const probarComoMaestro = () => {
    setCurrentUser({
      id: 'm1',
      nombre: 'Prof. García',
      role: 'maestro'
    });
    setActiveTab('dashboard');
  };

  const volverAAdmin = () => {
    setCurrentUser({
      id: 'admin-01',
      nombre: 'Administrador Principal',
      role: 'admin'
    });
    setActiveTab('dashboard');
  };

  // Definición de Navegación por Perfil
  const adminMenus = [
    { id: 'dashboard', label: 'Panel Global', icon: LayoutDashboard },
    { id: 'asignaciones', label: 'Asignaciones y Grupos', icon: Briefcase },
    { id: 'maestros', label: 'Lista de Profesores', icon: Users },
  ];

  const maestroMenus = [
    { id: 'dashboard', label: 'Mi Resumen', icon: LayoutDashboard },
    { id: 'mis_clases', label: 'Mis Aulas', icon: BookOpen },
    { id: 'calendario', label: 'Mi Horario', icon: Calendar },
  ];

  const currentMenus = currentUser.role === 'admin' ? adminMenus : maestroMenus;

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-row relative overflow-x-hidden antialiased">

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'
          }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
          {sidebarOpen && (
            <span className="font-extrabold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              EduControl
            </span>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 mx-auto transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto mt-2">
          <div className={`text-[11px] font-bold text-gray-400 mb-3 px-2 uppercase tracking-wider ${!sidebarOpen && 'hidden'}`}>
            {currentUser.role === 'admin' ? 'Módulo de Gestión' : 'Área Docente'}
          </div>
          {currentMenus.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={!sidebarOpen ? item.label : undefined}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* BOTÓN MODO PRUEBA DE DOCENTE (Aparece en pie de menú) */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/50">
          {currentUser.role === 'admin' ? (
            <button
              onClick={probarComoMaestro}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white p-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
              title="Probar vista de un maestro registrado"
            >
              <UserCheck className="w-4 h-4" />
              {sidebarOpen && <span>Probar Cuenta Maestro</span>}
            </button>
          ) : (
            <button
              onClick={volverAAdmin}
              className="w-full flex items-center justify-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 p-2.5 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {sidebarOpen && <span>Volver a Admin</span>}
            </button>
          )}
        </div>
      </aside>

      {/* ÁREA PRINCIPAL DERECHA */}
      <div className={`flex-1 w-full min-w-0 transition-all duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'pl-64' : 'pl-20'}`}>

        {/* HEADER SUPERIOR CLEAN */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between px-6 w-full shrink-0">
          <h1 className="text-xl font-extrabold text-gray-900 capitalize tracking-tight flex items-center gap-2">
            {currentMenus.find(m => m.id === activeTab)?.label || activeTab}
          </h1>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white"></span>
            </button>

            <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-sm text-white ${currentUser.role === 'admin' ? 'bg-slate-900' : 'bg-indigo-600'}`}>
                {currentUser.role === 'admin' ? 'A' : 'P'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-extrabold text-gray-900">{currentUser.nombre}</p>
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">{currentUser.role === 'admin' ? 'Administrador' : 'Docente Titular'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 p-6 md:p-8 w-full max-w-7xl mx-auto">

          {/* PERFIL: ADMINISTRADOR */}
          {currentUser.role === 'admin' && (
            <>
              {activeTab === 'dashboard' && (
                <div className="space-y-6 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <StatCard title="Total Profesores" value={maestros.length} icon={Users} color="blue" />
                    <StatCard title="Grupos de la Institución" value={grupos.length} icon={BookOpen} color="green" />
                    <StatCard title="Asignaciones Activas" value={asignaciones.length} icon={Briefcase} color="purple" />
                  </div>
                  <AdminAsignacionesView
                    asignaciones={asignaciones}
                    maestros={maestros}
                    grupos={grupos}
                    onAsignar={handleNuevaAsignacion}
                  />
                </div>
              )}
              {activeTab === 'asignaciones' && (
                <AdminAsignacionesView
                  asignaciones={asignaciones}
                  maestros={maestros}
                  grupos={grupos}
                  onAsignar={handleNuevaAsignacion}
                />
              )}
              {activeTab === 'maestros' && (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 font-medium">
                  Módulo de Gestión de Profesores (Alta, Baja, Perfil).
                </div>
              )}
            </>
          )}

          {/* PERFIL: MAESTRO */}
          {currentUser.role === 'maestro' && (
            <>
              {activeTab === 'dashboard' && (
                <MaestroResumenView
                  asignacionesProfesor={asignaciones.filter(a => a.maestroId === currentUser.id)}
                  maestroNombre={currentUser.nombre}
                />
              )}
              {activeTab === 'mis_clases' && (
                <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-400 font-medium">
                  Aulas virtuales e interacción con los alumnos asignados.
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
};

export default SistemaEscolar;