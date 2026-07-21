import React, { useState } from 'react';
import {
  Users, BookOpen, Calendar, CheckSquare,
  Plus, Search, Trash2, ChevronRight,
  Clock, Menu, Bell, Shield, Briefcase, LayoutDashboard,
  LogOut, UserCheck
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 w-full flex items-center justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{title}</p>
        <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3.5 rounded-2xl border ${colorMap[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

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
    <div className="w-full space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm w-full">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-600 shrink-0" />
          Asignar Cátedra a Maestro
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Maestro</label>
            <select
              value={form.maestroId}
              onChange={e => setForm({ ...form, maestroId: e.target.value })}
              className="w-full h-11 px-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              required
            >
              <option value="">Seleccionar Maestro...</option>
              {maestros.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Materia / Asignatura</label>
            <input
              type="text"
              placeholder="Ej. Programación Web"
              value={form.materia}
              onChange={e => setForm({ ...form, materia: e.target.value })}
              className="w-full h-11 px-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Grupo</label>
            <select
              value={form.grupo}
              onChange={e => setForm({ ...form, grupo: e.target.value })}
              className="w-full h-11 px-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              required
            >
              <option value="">Seleccionar Grupo...</option>
              {grupos.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-indigo-200 flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Guardar Asignación</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden w-full">
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/70 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">Control de Asignaciones Institucionales</h3>
          <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">{asignaciones.length} Activas</span>
        </div>
        
        {/* Vista para Pantallas Grandes (Tabla) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-400 font-bold uppercase text-[11px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="p-4">Docente Titular</th>
                <th className="p-4">Materia</th>
                <th className="p-4">Grupo</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {asignaciones.map((asig, idx) => {
                const maestro = maestros.find(m => m.id === asig.maestroId);
                return (
                  <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-4 font-semibold text-gray-900 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                        {maestro?.nombre?.charAt(0) || 'D'}
                      </div>
                      {maestro?.nombre}
                    </td>
                    <td className="p-4 text-gray-600 font-medium">{asig.materia}</td>
                    <td className="p-4"><span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-xs border border-indigo-100">{asig.grupo}</span></td>
                    <td className="p-4 text-right">
                      <button className="text-gray-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Vista Móvil (Tarjetas) */}
        <div className="block md:hidden divide-y divide-gray-100">
          {asignaciones.map((asig, idx) => {
            const maestro = maestros.find(m => m.id === asig.maestroId);
            return (
              <div key={idx} className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                    {maestro?.nombre?.charAt(0) || 'D'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{maestro?.nombre}</p>
                    <p className="text-xs text-gray-500 truncate">{asig.materia}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-bold text-[10px]">
                      Grupo {asig.grupo}
                    </span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const MaestroResumenView = ({ asignacionesProfesor, maestroNombre }) => (
  <div className="w-full space-y-6">
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">¡Bienvenido, {maestroNombre}! 👋</h2>
        <p className="text-blue-100 text-xs sm:text-sm mt-1">Este es el panel con las asignaturas asignadas por la administración.</p>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 w-full">
      <StatCard title="Mis Grupos Asignados" value={asignacionesProfesor.length} icon={Users} color="blue" />
      <StatCard title="Clases Agendadas" value="4" icon={Calendar} color="green" />
      <StatCard title="Revisiones Pendientes" value="8" icon={CheckSquare} color="amber" />
    </div>

    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm w-full">
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Cátedras Asignadas a Tu Perfil</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {asignacionesProfesor.map((clase, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-sm hover:bg-indigo-50/20 transition-all">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{clase.materia}</p>
                <p className="text-xs text-gray-500 mt-0.5">Grupo {clase.grupo}</p>
              </div>
            </div>
            <button className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-lg shrink-0">
              Acceder
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SistemaEscolar = () => {
  const [currentUser, setCurrentUser] = useState({
    id: 'admin-01',
    nombre: 'Administrador Principal',
    role: 'admin',
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const probarComoMaestro = () => {
    setCurrentUser({ id: 'm1', nombre: 'Prof. García', role: 'maestro' });
    setActiveTab('dashboard');
    setSidebarOpen(false);
  };

  const volverAAdmin = () => {
    setCurrentUser({ id: 'admin-01', nombre: 'Administrador Principal', role: 'admin' });
    setActiveTab('dashboard');
    setSidebarOpen(false);
  };

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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row m-0 p-0 text-slate-800 font-sans">
      {/* OVERLAY PARA MÓVIL */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* SIDEBAR RESPONSIVO */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-50 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-64'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 shrink-0">
          <span className="font-black text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600 shrink-0" />
            EduControl
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          {currentMenus.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === item.id
                  ? 'bg-indigo-50 text-indigo-600 shadow-xs'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          {currentUser.role === 'admin' ? (
            <button
              onClick={probarComoMaestro}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white p-3 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-sm active:scale-95"
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>Probar Cuenta Maestro</span>
            </button>
          ) : (
            <button
              onClick={volverAAdmin}
              className="w-full flex items-center justify-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 p-3 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Volver a Admin</span>
            </button>
          )}
        </div>
      </aside>

      {/* CONTENEDOR PRINCIPAL DERECHO */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 capitalize tracking-tight truncate">
              {currentMenus.find(m => m.id === activeTab)?.label || activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white"></span>
            </button>

            <div className="flex items-center gap-2.5 sm:gap-3 border-l pl-3 sm:pl-4 border-gray-200">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shadow-sm text-white ${currentUser.role === 'admin' ? 'bg-slate-900' : 'bg-indigo-600'}`}>
                {currentUser.role === 'admin' ? 'A' : 'P'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-extrabold text-gray-900">{currentUser.nombre}</p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{currentUser.role === 'admin' ? 'Administrador' : 'Docente Titular'}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 md:p-8 flex-1 overflow-x-hidden">
          {currentUser.role === 'admin' && (
            <div className="space-y-6 w-full max-w-7xl mx-auto">
              {activeTab === 'dashboard' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full">
                    <StatCard title="Total Profesores" value={maestros.length} icon={Users} color="blue" />
                    <StatCard title="Grupos Institución" value={grupos.length} icon={BookOpen} color="green" />
                    <StatCard title="Asignaciones Activas" value={asignaciones.length} icon={Briefcase} color="purple" />
                  </div>
                  <AdminAsignacionesView
                    asignaciones={asignaciones}
                    maestros={maestros}
                    grupos={grupos}
                    onAsignar={handleNuevaAsignacion}
                  />
                </>
              )}
              {activeTab === 'asignaciones' && (
                <AdminAsignacionesView
                  asignaciones={asignaciones}
                  maestros={maestros}
                  grupos={grupos}
                  onAsignar={handleNuevaAsignacion}
                />
              )}
            </div>
          )}

          {currentUser.role === 'maestro' && (
            <div className="w-full max-w-7xl mx-auto">
              <MaestroResumenView
                asignacionesProfesor={asignaciones.filter(a => a.maestroId === currentUser.id)}
                maestroNombre={currentUser.nombre}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SistemaEscolar;