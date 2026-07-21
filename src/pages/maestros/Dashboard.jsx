import React, { useState } from 'react';
import {
  Users, BookOpen, Calendar, CheckSquare,
  Plus, Search, Trash2, ChevronRight,
  Clock, Menu, Bell, Shield, Briefcase, LayoutDashboard,
  LogOut, UserCheck
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white',
    purple: 'bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-600 group-hover:text-white',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-600 group-hover:text-white',
  };

  return (
    <div className="group bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 w-full flex items-center justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{title}</p>
        <p className="text-3xl font-black text-gray-900 mt-2">{value}</p>
      </div>
      <div className={`p-4 rounded-2xl border transition-all duration-300 ${colorMap[color]}`}>
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
    <div className="w-full space-y-8">
      {/* TARJETA DE FORMULARIO DE ASIGNACIÓN */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all w-full">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-900">Asignar Cátedra a Maestro</h3>
            <p className="text-xs text-gray-400 font-medium">Asigna una nueva materia y grupo a un profesor titulado</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Maestro</label>
            <select
              value={form.maestroId}
              onChange={e => setForm({ ...form, maestroId: e.target.value })}
              className="w-full h-12 px-4 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            >
              <option value="">Seleccionar Maestro...</option>
              {maestros.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Materia / Asignatura</label>
            <input
              type="text"
              placeholder="Ej. Programación Web"
              value={form.materia}
              onChange={e => setForm({ ...form, materia: e.target.value })}
              className="w-full h-12 px-4 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Grupo</label>
            <select
              value={form.grupo}
              onChange={e => setForm({ ...form, grupo: e.target.value })}
              className="w-full h-12 px-4 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            >
              <option value="">Seleccionar Grupo...</option>
              {grupos.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl text-sm font-bold transition-all shadow-md hover:shadow-indigo-200 flex items-center justify-center gap-2 active:scale-98"
            >
              <Plus className="w-5 h-5" />
              <span>Guardar Asignación</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECCIÓN DE TARJETAS DE ASIGNACIONES */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div>
            <h3 className="font-extrabold text-gray-900 text-lg">Asignaciones Institucionales</h3>
            <p className="text-xs text-gray-400 font-medium">Control de materias impertidas actualmente</p>
          </div>
          <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3.5 py-1.5 rounded-full border border-indigo-100 shadow-xs">
            {asignaciones.length} Cátedras Activas
          </span>
        </div>

        {/* REJILLA DE TARJETAS (GRID CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {asignaciones.map((asig, idx) => {
            const maestro = maestros.find(m => m.id === asig.maestroId);
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/40 rounded-bl-full -mr-6 -mt-6 pointer-events-none transition-all group-hover:bg-indigo-100/50" />

                <div>
                  {/* Avatar y Grupo */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-indigo-100 shrink-0">
                        {maestro?.nombre?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <p className="font-extrabold text-gray-900 text-base group-hover:text-indigo-600 transition-colors leading-tight">
                          {maestro?.nombre}
                        </p>
                        <p className="text-xs font-semibold text-gray-400 mt-0.5">Docente Titular</p>
                      </div>
                    </div>
                  </div>

                  {/* Detalle Materia */}
                  <div className="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/80">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Asignatura</p>
                    <p className="text-base font-extrabold text-gray-800 mt-0.5">{asig.materia}</p>
                  </div>
                </div>

                {/* Footer de Tarjeta */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase">Grupo:</span>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl font-black text-xs border border-indigo-100">
                      {asig.grupo}
                    </span>
                  </div>
                  <button className="text-gray-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const MaestroResumenView = ({ asignacionesProfesor, maestroNombre }) => (
  <div className="w-full space-y-8">
    <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full relative overflow-hidden">
      <div className="relative z-10">
        <h2 className="text-2xl sm:text-3xl font-black">¡Bienvenido, {maestroNombre}! 👋</h2>
        <p className="text-blue-100 text-sm mt-1.5 font-medium">Este es el panel con las asignaturas asignadas por la administración escolar.</p>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full">
      <StatCard title="Mis Grupos Asignados" value={asignacionesProfesor.length} icon={Users} color="blue" />
      <StatCard title="Clases Agendadas" value="4" icon={Calendar} color="green" />
      <StatCard title="Revisiones Pendientes" value="8" icon={CheckSquare} color="amber" />
    </div>

    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm w-full">
      <h3 className="text-lg font-extrabold text-gray-900 mb-6">Cátedras Asignadas a Tu Perfil</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
        {asignacionesProfesor.map((clase, idx) => (
          <div key={idx} className="flex items-center justify-between p-5 border border-gray-100 rounded-2xl hover:border-indigo-200 hover:shadow-lg hover:-translate-y-0.5 bg-white transition-all duration-300">
            <div className="flex items-center gap-4 min-w-0">
              <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-gray-900 text-base truncate">{clase.materia}</p>
                <p className="text-xs font-semibold text-gray-400 mt-0.5">Grupo {clase.grupo}</p>
              </div>
            </div>
            <button className="text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-xl shadow-sm transition-all shrink-0">
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