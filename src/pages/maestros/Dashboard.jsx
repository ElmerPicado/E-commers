import React, { useState, useEffect } from 'react';
import {
  Users, BookOpen, Calendar, CheckSquare,
  Plus, Trash2, Clock, Menu, Bell, Shield, Briefcase, LayoutDashboard,
  LogOut, UserCheck, X, GraduationCap, MapPin, Tag, Key, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

// ==========================================
// COMPONENTES AUXILIARES & TARJETAS
// ==========================================

const StatCard = ({ title, value, icon: Icon, color = 'amber', subtitle }) => {
  const colorMap = {
    amber: { iconBg: '!bg-amber-100 !text-amber-800 !border-amber-200' },
    blue: { iconBg: '!bg-blue-100 !text-blue-800 !border-blue-200' },
    green: { iconBg: '!bg-emerald-100 !text-emerald-800 !border-emerald-200' },
    purple: { iconBg: '!bg-purple-100 !text-purple-800 !border-purple-200' },
  };

  const style = colorMap[color] || colorMap.amber;

  return (
    <div className="!bg-white !rounded-2xl !border !border-slate-200 !p-5 !shadow-sm flex items-center justify-between">
      <div className="space-y-1">
        <p className="!text-xs !font-bold !uppercase !tracking-wider !text-slate-500">{title}</p>
        <p className="!text-3xl !font-extrabold !text-slate-900">{value}</p>
        {subtitle && <p className="!text-xs !text-slate-600 !font-medium">{subtitle}</p>}
      </div>
      <div className={`!p-3.5 !rounded-2xl !border ${style.iconBg}`}>
        <Icon className="!w-6 !h-6" />
      </div>
    </div>
  );
};

// MODAL REUTILIZABLE CON MEJOR ESPACIADO Y BOTONES LIMPIOS
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 !bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="!bg-white !rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl !border !border-slate-200 space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 className="text-lg font-extrabold !text-slate-900 flex items-center gap-2">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl !text-slate-400 hover:!text-slate-700 hover:!bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// VISTAS DE ADMINISTRADOR
// ==========================================

const AdminDashboardView = ({
  maestros,
  asignaciones,
  divisiones,
  onOpenAddMaestro,
  onOpenAddAsignacion,
  onOpenAddDivision,
  onDeleteAsignacion
}) => {
  return (
    <div className="space-y-6">
      {/* Resumen Superior */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard title="Maestros Registrados" value={maestros.length} icon={Users} color="amber" subtitle="Personal activo del ministerio" />
        <StatCard title="Divisiones / Clases" value={divisiones.length} icon={GraduationCap} color="green" subtitle="Grupos de edad activos" />
        <StatCard title="Clases Programadas" value={asignaciones.length} icon={Briefcase} color="purple" subtitle="Asignaciones activas" />
      </div>

      {/* Acciones Rápidas */}
      <div className="flex flex-wrap items-center justify-between gap-4 !bg-white p-5 rounded-2xl !border !border-slate-200 !shadow-sm">
        <div>
          <h3 className="text-base font-extrabold !text-slate-900">Gestión de Clases del Ministerio</h3>
          <p className="text-xs !text-slate-600 font-medium mt-0.5">Administra maestros de Niños, Adolescentes y Jóvenes</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenAddDivision}
            className="px-4 py-2.5 !bg-slate-100 hover:!bg-slate-200 !text-slate-800 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95 border border-slate-200"
          >
            <Tag className="w-4 h-4 text-amber-700" />
            <span>+ Nueva División</span>
          </button>
          <button
            onClick={onOpenAddMaestro}
            className="px-4 py-2.5 !bg-slate-900 hover:!bg-slate-800 !text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Maestro</span>
          </button>
          <button
            onClick={onOpenAddAsignacion}
            className="px-4 py-2.5 !bg-amber-600 hover:!bg-amber-700 !text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Briefcase className="w-4 h-4" />
            <span>Asignar Clase</span>
          </button>
        </div>
      </div>

      {/* Tabla Principal de Asignaciones */}
      <div className="!bg-white rounded-2xl !border !border-slate-200 !shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between !bg-slate-50">
          <h4 className="font-extrabold !text-slate-900 text-base">Asignaciones Activas de Clases</h4>
          <span className="text-xs font-bold !bg-amber-100 !text-amber-900 px-3 py-1 rounded-full !border !border-amber-200">
            {asignaciones.length} Clases
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="!bg-slate-100/70 !text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <th className="p-4">Maestro Titular</th>
                <th className="p-4">Lección / Materia</th>
                <th className="p-4">División / Edad</th>
                <th className="p-4">Horario</th>
                <th className="p-4">Aula / Código Virtual</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {asignaciones.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center !text-slate-500 font-medium">
                    No hay clases asignadas aún. Haz clic en "Asignar Clase" para comenzar.
                  </td>
                </tr>
              ) : (
                asignaciones.map((asig) => {
                  const maestro = maestros.find(m => m.id === asig.maestroId);
                  return (
                    <tr key={asig.id} className="hover:!bg-slate-50 transition-colors">
                      <td className="p-4 font-bold !text-slate-900 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl !bg-slate-900 !text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                          {maestro?.nombre?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <p className="font-bold !text-slate-900">{maestro?.nombre || 'Maestro'}</p>
                          <p className="text-[11px] !text-slate-500 font-normal">{maestro?.email || 'sin correo'}</p>
                        </div>
                      </td>
                      <td className="p-4 font-bold !text-slate-900">{asig.materia}</td>
                      <td className="p-4 font-medium">
                        <span className="px-2.5 py-1 !bg-amber-100 !text-amber-900 font-bold text-xs rounded-md !border !border-amber-200">
                          {asig.grupo}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs !text-slate-600 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 !text-slate-400" />
                          {asig.horario || 'Domingos 10:00 AM'}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-semibold">
                        <div className="space-y-0.5">
                          <span className="flex items-center gap-1 !text-slate-700">
                            <MapPin className="w-3.5 h-3.5 !text-slate-400" />
                            {asig.aula || 'Salón Principal'}
                          </span>
                          {asig.codigoVirtual && (
                            <span className="flex items-center gap-1 text-[11px] !text-amber-700 font-bold">
                              <Key className="w-3 h-3 text-amber-600" /> Código: {asig.codigoVirtual}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => onDeleteAsignacion(asig.id)}
                          className="!text-slate-400 hover:!text-rose-600 p-2 rounded-xl hover:!bg-rose-50 transition-colors cursor-pointer"
                          title="Eliminar Clase"
                        >
                          <Trash2 className="w-4 h-4" />
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
};

const AdminMaestrosListView = ({ maestros, onDeleteMaestro, onOpenAddMaestro }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 !bg-white p-5 rounded-2xl !border !border-slate-200 !shadow-sm">
        <div>
          <h3 className="text-base font-extrabold !text-slate-900">Directorio de Maestros del Ministerio</h3>
          <p className="text-xs !text-slate-600 font-medium">Personal encargado de Niños, Adolescentes y Jóvenes</p>
        </div>
        <button
          onClick={onOpenAddMaestro}
          className="px-4 py-2.5 !bg-amber-600 hover:!bg-amber-700 !text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Nuevo Maestro</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {maestros.map((m) => (
          <div key={m.id} className="!bg-white rounded-2xl !border !border-slate-200 p-5 !shadow-sm hover:!shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl !bg-slate-900 !text-white flex items-center justify-center font-extrabold text-base shadow-sm">
                  {m.nombre.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold !text-slate-900 text-base">{m.nombre}</h4>
                  <p className="text-xs font-bold !text-amber-700">{m.especialidad || 'Maestro Titular'}</p>
                </div>
              </div>
              <button
                onClick={() => onDeleteMaestro(m.id)}
                className="!text-slate-400 hover:!text-rose-600 p-2 rounded-xl hover:!bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1">
              <p><strong className="!text-slate-900">Correo:</strong> {m.email || 'No registrado'}</p>
              <p><strong className="!text-slate-900">Teléfono / WhatsApp:</strong> {m.telefono || 'Sin teléfono'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// VISTAS DE DOCENTE / MAESTRO
// ==========================================

const MaestroResumenView = ({ asignacionesProfesor, maestroNombre }) => (
  <div className="space-y-6">
    <div className="!bg-slate-900 rounded-3xl p-6 sm:p-8 !text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <span className="px-3 py-1 !bg-amber-500/20 !text-amber-300 rounded-full text-xs font-bold border border-amber-500/30">
          Servidor / Maestro Activo
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold mt-3">¡Bienvenido de nuevo, {maestroNombre}! 👋</h2>
        <p className="!text-slate-300 text-xs sm:text-sm mt-1">Resumen de tus clases infantiles, juveniles y lecciones asignadas.</p>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <StatCard title="Mis Clases Asignadas" value={asignacionesProfesor.length} icon={BookOpen} color="amber" />
      <StatCard title="Frecuencia" value="Dominical" icon={Clock} color="green" />
      <StatCard title="Lecciones Listas" value="Activas" icon={CheckSquare} color="purple" />
    </div>

    <div className="!bg-white rounded-2xl !border !border-slate-200 p-6 !shadow-sm space-y-4">
      <h3 className="text-base font-extrabold !text-slate-900">Mis Clases y Grupos Asignados</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {asignacionesProfesor.length === 0 ? (
          <p className="text-sm !text-slate-500 col-span-2 py-4">No tienes clases asignadas por la administración en este momento.</p>
        ) : (
          asignacionesProfesor.map((clase) => (
            <div key={clase.id} className="p-4 rounded-xl !border !border-slate-200 hover:!border-amber-300 hover:!bg-amber-50/40 transition-all flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="p-3 !bg-amber-100 !text-amber-800 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold !text-slate-900 text-sm">{clase.materia}</h4>
                  <p className="text-xs !text-slate-600 font-medium">Grupo {clase.grupo} • {clase.aula}</p>
                  <p className="text-[11px] !text-amber-800 font-bold mt-0.5">{clase.horario}</p>
                </div>
              </div>
              <button className="px-3.5 py-2 !bg-slate-900 hover:!bg-slate-800 !text-white text-xs font-bold rounded-lg transition-colors cursor-pointer">
                Ver Aula
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

const CalendarioView = ({ asignaciones }) => {
  const dias = ['Domingo (Mañana)', 'Domingo (Tarde)', 'Entre Semana'];

  return (
    <div className="space-y-6">
      <div className="!bg-white p-5 rounded-2xl !border !border-slate-200 !shadow-sm flex justify-between items-center">
        <div>
          <h3 className="text-base font-extrabold !text-slate-900">Horario de Clases y Lecciones</h3>
          <p className="text-xs !text-slate-600 font-medium">Organización semanal de la Escuela Dominical y Jóvenes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {dias.map((dia, idx) => (
          <div key={dia} className="!bg-white rounded-2xl !border !border-slate-200 p-5 !shadow-sm space-y-4">
            <div className="pb-2 border-b border-slate-200 text-center">
              <span className="text-xs font-extrabold uppercase !text-amber-800 tracking-wider">{dia}</span>
            </div>
            <div className="space-y-3">
              {asignaciones.length === 0 ? (
                <p className="text-xs text-center !text-slate-400">Sin actividades agendadas</p>
              ) : (
                asignaciones.slice(idx % asignaciones.length, (idx % asignaciones.length) + 2).map((asig, i) => (
                  <div key={i} className="p-3.5 !bg-amber-50 !border !border-amber-200 rounded-xl space-y-1">
                    <p className="text-xs font-extrabold !text-slate-900 truncate">{asig.materia}</p>
                    <p className="text-[11px] font-semibold !text-amber-800">Grupo: {asig.grupo}</p>
                    <p className="text-[10px] !text-slate-600 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {asig.horario || '10:00 AM'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL (SISTEMA ESCOLAR Y JUVENIL)
// ==========================================

const SistemaEscolar = () => {
  const [currentUser, setCurrentUser] = useState({
    id: 'admin-01',
    nombre: 'Administrador Principal',
    role: 'admin',
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ESTADOS MODALES
  const [isAddMaestroOpen, setIsAddMaestroOpen] = useState(false);
  const [isAddAsignacionOpen, setIsAddAsignacionOpen] = useState(false);
  const [isAddDivisionOpen, setIsAddDivisionOpen] = useState(false);

  // DIVISIONES EDITABLES (Niños, Adolescentes, Jóvenes)
  const [divisiones, setDivisiones] = useState([
    { id: 'd1', nombre: 'Cuna / Párvulos (0-5 años)' },
    { id: 'd2', nombre: 'Primarios / Intermedios (6-11 años)' },
    { id: 'd3', nombre: 'Adolescentes (12-15 años)' },
    { id: 'd4', nombre: 'Jóvenes de Fe (16+ años)' }
  ]);

  // MAESTROS Y ASIGNACIONES
  const [maestros, setMaestros] = useState([
    { id: 'm1', nombre: 'Prof. Carlos García', especialidad: 'Adolescentes & Discipulado', email: 'carlos.garcia@educontrol.edu', telefono: '+506 8888-1111' },
    { id: 'm2', nombre: 'Profa. María Martínez', especialidad: 'Escuela Dominical Infantil', email: 'maria.martinez@educontrol.edu', telefono: '+506 8888-2222' }
  ]);

  const [asignaciones, setAsignaciones] = useState([
    { id: 'a1', maestroId: 'm1', materia: 'Historias Bíblicas & Valores', grupo: 'Primarios / Intermedios (6-11 años)', horario: 'Domingos 10:00 AM', aula: 'Salón Infantil A', codigoVirtual: '782910' },
    { id: 'a2', maestroId: 'm2', materia: 'Fundamentos de la Fe', grupo: 'Adolescentes (12-15 años)', horario: 'Domingos 11:30 AM', aula: 'Salón de Jóvenes', codigoVirtual: '439201' }
  ]);

  // FORMS
  const [newMaestro, setNewMaestro] = useState({ nombre: '', especialidad: '', email: '', telefono: '' });
  const [newAsignacion, setNewAsignacion] = useState({ maestroId: '', materia: '', grupo: '', horario: 'Domingos 10:00 AM', aula: 'Salón Principal' });
  const [newDivisionNombre, setNewDivisionNombre] = useState('');

  // CARGAR DESDE SUPABASE AL INICIAR (SI EXISTE CONEXIÓN)
  useEffect(() => {
    const fetchSupabaseData = async () => {
      try {
        setLoading(true);

        // 1. Cargar Maestros desde maestro_users
        const { data: dbMaestros, error: errM } = await supabase.from('maestro_users').select('*');
        if (!errM && dbMaestros && dbMaestros.length > 0) {
          setMaestros(dbMaestros.map(m => ({
            id: m.id,
            nombre: m.nombre || 'Maestro',
            especialidad: m.role || 'Maestro Titular',
            email: m.email,
            telefono: m.telefono || m.whatsapp || ''
          })));
        }

        // 2. Cargar Divisiones desde divisiones
        const { data: dbDiv, error: errD } = await supabase.from('divisiones').select('*').order('orden', { ascending: true });
        if (!errD && dbDiv && dbDiv.length > 0) {
          setDivisiones(dbDiv.map(d => ({ id: d.id, nombre: d.nombre })));
        }
      } catch (err) {
        console.log('Modo local activo:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSupabaseData();
  }, []);

  // HANDLERS
  const handleAddMaestro = async (e) => {
    e.preventDefault();
    if (!newMaestro.nombre) return;

    const id = `m_${Date.now()}`;
    const nuevo = { id, ...newMaestro };

    // Guardar en Supabase si está disponible
    try {
      await supabase.from('maestro_users').insert([{
        id,
        nombre: newMaestro.nombre,
        email: newMaestro.email || `${Date.now()}@ministerio.edu`,
        telefono: newMaestro.telefono,
        role: 'maestro'
      }]);
    } catch (err) {
      console.log('Guardado en estado local:', err);
    }

    setMaestros([...maestros, nuevo]);
    setNewMaestro({ nombre: '', especialidad: '', email: '', telefono: '' });
    setIsAddMaestroOpen(false);
  };

  const handleAddDivision = async (e) => {
    e.preventDefault();
    if (!newDivisionNombre.trim()) return;

    const id = `d_${Date.now()}`;
    const nueva = { id, nombre: newDivisionNombre.trim() };

    try {
      await supabase.from('divisiones').insert([{
        id,
        nombre: newDivisionNombre.trim(),
        activa: true
      }]);
    } catch (err) {
      console.log('Guardado local de división:', err);
    }

    setDivisiones([...divisiones, nueva]);
    setNewDivisionNombre('');
    setIsAddDivisionOpen(false);
  };

  const handleAddAsignacion = async (e) => {
    e.preventDefault();
    if (!newAsignacion.maestroId || !newAsignacion.materia) return;

    const codigoVirtual = Math.floor(100000 + Math.random() * 900000).toString();
    const id = `a_${Date.now()}`;
    const nueva = {
      id,
      ...newAsignacion,
      codigoVirtual
    };

    setAsignaciones([...asignaciones, nueva]);
    setNewAsignacion({ maestroId: '', materia: '', grupo: divisiones[0]?.nombre || '', horario: 'Domingos 10:00 AM', aula: 'Salón Principal' });
    setIsAddAsignacionOpen(false);
  };

  const handleDeleteMaestro = (id) => {
    setMaestros(maestros.filter(m => m.id !== id));
    setAsignaciones(asignaciones.filter(a => a.maestroId !== id));
  };

  const handleDeleteAsignacion = (id) => {
    setAsignaciones(asignaciones.filter(a => a.id !== id));
  };

  const cambiarARol = (role) => {
    if (role === 'maestro') {
      setCurrentUser({ id: 'm1', nombre: 'Prof. Carlos García', role: 'maestro' });
    } else {
      setCurrentUser({ id: 'admin-01', nombre: 'Administrador Principal', role: 'admin' });
    }
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
    <div className="min-h-screen !bg-[#fdfcfb] flex flex-col md:flex-row !text-slate-800 font-sans antialiased w-full">
      {/* OVERLAY MOBILE */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 !bg-slate-950/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* SIDEBAR OSCURO SÓLIDO (#0f172a / slate-900) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-50 !bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col shrink-0 ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-64'
          }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 shrink-0">
          <span className="font-black text-xl !text-white flex items-center gap-2.5">
            <div className="p-2 !bg-amber-600 !text-white rounded-xl shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            EduControl
          </span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1.5 rounded-lg !text-slate-400 hover:!bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-black uppercase !text-slate-400 tracking-wider mb-2">Navegación Ministerio</p>
          {currentMenus.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === item.id
                ? '!bg-amber-600 !text-white shadow-md'
                : '!text-slate-300 hover:!bg-slate-800 hover:!text-white'
                }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* SWITCHER DE PERFIL */}
        <div className="p-4 border-t border-slate-800 !bg-slate-950/40">
          {currentUser.role === 'admin' ? (
            <button
              onClick={() => cambiarARol('maestro')}
              className="w-full flex items-center justify-center gap-2 !bg-amber-600 hover:!bg-amber-700 !text-white p-3 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <UserCheck className="w-4 h-4" />
              <span>Modo Vista Maestro</span>
            </button>
          ) : (
            <button
              onClick={() => cambiarARol('admin')}
              className="w-full flex items-center justify-center gap-2 !bg-slate-800 hover:!bg-slate-700 !text-amber-400 border border-slate-700 p-3 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Volver a Administrador</span>
            </button>
          )}
        </div>
      </aside>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen !bg-[#fdfcfb]">
        {/* HEADER TOP CÁLIDO (#f4f1ea) */}
        <header className="h-16 !bg-[#f4f1ea] border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl hover:!bg-slate-200/60 !text-slate-700 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-extrabold !text-slate-900 capitalize">
              {currentMenus.find(m => m.id === activeTab)?.label || activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button className="p-2 !text-slate-500 hover:!text-slate-800 rounded-xl hover:!bg-slate-200/60 relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 !bg-amber-600 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 border-l pl-3 sm:pl-4 border-slate-300">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs !text-white shadow-xs ${currentUser.role === 'admin' ? '!bg-slate-900' : '!bg-amber-600'
                }`}>
                {currentUser.role === 'admin' ? 'A' : 'M'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-extrabold !text-slate-900">{currentUser.nombre}</p>
                <p className="text-[10px] !text-slate-600 font-bold uppercase">{currentUser.role === 'admin' ? 'Coordinador General' : 'Maestro Titular'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY CON FONDO ISLADO */}
        <main className="p-4 sm:p-6 md:p-8 flex-1 overflow-x-hidden max-w-7xl w-full mx-auto">
          {currentUser.role === 'admin' && (
            <>
              {activeTab === 'dashboard' && (
                <AdminDashboardView
                  maestros={maestros}
                  asignaciones={asignaciones}
                  divisiones={divisiones}
                  onOpenAddMaestro={() => setIsAddMaestroOpen(true)}
                  onOpenAddAsignacion={() => setIsAddAsignacionOpen(true)}
                  onOpenAddDivision={() => setIsAddDivisionOpen(true)}
                  onDeleteAsignacion={handleDeleteAsignacion}
                />
              )}
              {activeTab === 'maestros' && (
                <AdminMaestrosListView
                  maestros={maestros}
                  onDeleteMaestro={handleDeleteMaestro}
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
                <CalendarioView
                  asignaciones={asignaciones.filter(a => a.maestroId === currentUser.id)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* MODAL REGISTRAR NUEVO MAESTRO (CON BOTONES Y ESPACIADOS CORREGIDOS) */}
      <Modal
        isOpen={isAddMaestroOpen}
        onClose={() => setIsAddMaestroOpen(false)}
        title="Registrar Nuevo Maestro del Ministerio"
      >
        <form onSubmit={handleAddMaestro} className="space-y-5">
          <div>
            <label className="block text-xs font-extrabold !text-slate-800 uppercase tracking-wider mb-1.5">Nombre Completo del Maestro</label>
            <input
              type="text"
              placeholder="Ej. Profa. Ana López"
              value={newMaestro.nombre}
              onChange={e => setNewMaestro({ ...newMaestro, nombre: e.target.value })}
              className="w-full h-12 px-4 !bg-slate-50 border border-slate-300 rounded-2xl text-sm font-medium !text-slate-900 focus:!bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold !text-slate-800 uppercase tracking-wider mb-1.5">Enfoque / Ministerio</label>
            <input
              type="text"
              placeholder="Ej. Escuela Dominical Infantil / Jóvenes"
              value={newMaestro.especialidad}
              onChange={e => setNewMaestro({ ...newMaestro, especialidad: e.target.value })}
              className="w-full h-12 px-4 !bg-slate-50 border border-slate-300 rounded-2xl text-sm font-medium !text-slate-900 focus:!bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold !text-slate-800 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={newMaestro.email}
                onChange={e => setNewMaestro({ ...newMaestro, email: e.target.value })}
                className="w-full h-12 px-4 !bg-slate-50 border border-slate-300 rounded-2xl text-sm font-medium !text-slate-900 focus:!bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold !text-slate-800 uppercase tracking-wider mb-1.5">Teléfono / WhatsApp</label>
              <input
                type="text"
                placeholder="+506 8888-0000"
                value={newMaestro.telefono}
                onChange={e => setNewMaestro({ ...newMaestro, telefono: e.target.value })}
                className="w-full h-12 px-4 !bg-slate-50 border border-slate-300 rounded-2xl text-sm font-medium !text-slate-900 focus:!bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* FOOTER SEPARADO Y LIMPIO */}
          <div className="pt-5 border-t border-slate-200 flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsAddMaestroOpen(false)}
              className="px-5 py-3 !bg-slate-100 hover:!bg-slate-200 !text-slate-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 !bg-amber-600 hover:!bg-amber-700 !text-white rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
            >
              Guardar Maestro
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL AGREGAR ASIGNACIÓN DE CLASE */}
      <Modal
        isOpen={isAddAsignacionOpen}
        onClose={() => setIsAddAsignacionOpen(false)}
        title="Asignar Lección / Clase de Ministerio"
      >
        <form onSubmit={handleAddAsignacion} className="space-y-5">
          <div>
            <label className="block text-xs font-extrabold !text-slate-800 uppercase tracking-wider mb-1.5">Maestro Encargado</label>
            <select
              value={newAsignacion.maestroId}
              onChange={e => setNewAsignacion({ ...newAsignacion, maestroId: e.target.value })}
              className="w-full h-12 px-4 !bg-slate-50 border border-slate-300 rounded-2xl text-sm font-medium !text-slate-900 focus:!bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            >
              <option value="">Seleccionar Maestro...</option>
              {maestros.map(m => (
                <option key={m.id} value={m.id}>{m.nombre} ({m.especialidad || 'Titular'})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold !text-slate-800 uppercase tracking-wider mb-1.5">Lección / Tema de la Clase</label>
            <input
              type="text"
              placeholder="Ej. Historias Bíblicas & Valores / Discipulado"
              value={newAsignacion.materia}
              onChange={e => setNewAsignacion({ ...newAsignacion, materia: e.target.value })}
              className="w-full h-12 px-4 !bg-slate-50 border border-slate-300 rounded-2xl text-sm font-medium !text-slate-900 focus:!bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold !text-slate-800 uppercase tracking-wider mb-1.5">División / Rango de Edad</label>
              <select
                value={newAsignacion.grupo}
                onChange={e => setNewAsignacion({ ...newAsignacion, grupo: e.target.value })}
                className="w-full h-12 px-4 !bg-slate-50 border border-slate-300 rounded-2xl text-sm font-medium !text-slate-900 focus:!bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              >
                <option value="">Seleccionar Grupo...</option>
                {divisiones.map(d => <option key={d.id} value={d.nombre}>{d.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold !text-slate-800 uppercase tracking-wider mb-1.5">Salón / Aula Físico</label>
              <input
                type="text"
                placeholder="Ej. Salón Infantil A / Salón de Jóvenes"
                value={newAsignacion.aula}
                onChange={e => setNewAsignacion({ ...newAsignacion, aula: e.target.value })}
                className="w-full h-12 px-4 !bg-slate-50 border border-slate-300 rounded-2xl text-sm font-medium !text-slate-900 focus:!bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold !text-slate-800 uppercase tracking-wider mb-1.5">Horario Dominical / Fijo</label>
            <input
              type="text"
              placeholder="Ej. Domingos 10:00 AM"
              value={newAsignacion.horario}
              onChange={e => setNewAsignacion({ ...newAsignacion, horario: e.target.value })}
              className="w-full h-12 px-4 !bg-slate-50 border border-slate-300 rounded-2xl text-sm font-medium !text-slate-900 focus:!bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          {/* FOOTER SEPARADO Y LIMPIO */}
          <div className="pt-5 border-t border-slate-200 flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsAddAsignacionOpen(false)}
              className="px-5 py-3 !bg-slate-100 hover:!bg-slate-200 !text-slate-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 !bg-amber-600 hover:!bg-amber-700 !text-white rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
            >
              Guardar Asignación de Clase
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL CREAR NUEVA DIVISIÓN / GRUPO DE EDAD */}
      <Modal
        isOpen={isAddDivisionOpen}
        onClose={() => setIsAddDivisionOpen(false)}
        title="Crear Nueva División o Rango de Edad"
      >
        <form onSubmit={handleAddDivision} className="space-y-5">
          <div>
            <label className="block text-xs font-extrabold !text-slate-800 uppercase tracking-wider mb-1.5">Nombre de la División o Grupo</label>
            <input
              type="text"
              placeholder="Ej. Pre-Adolescentes (10-12 años) / Jóvenes Universitarios"
              value={newDivisionNombre}
              onChange={e => setNewDivisionNombre(e.target.value)}
              className="w-full h-12 px-4 !bg-slate-50 border border-slate-300 rounded-2xl text-sm font-medium !text-slate-900 focus:!bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="pt-5 border-t border-slate-200 flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsAddDivisionOpen(false)}
              className="px-5 py-3 !bg-slate-100 hover:!bg-slate-200 !text-slate-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 !bg-slate-900 hover:!bg-slate-800 !text-white rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
            >
              Crear División
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SistemaEscolar;