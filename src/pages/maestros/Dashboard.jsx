import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
  LayoutDashboard, BookOpen, Calendar, Users, Bell, LogOut,
  Plus, Upload, FileText, Video, Image, Link2,
  ChevronDown, ChevronRight, Search, Filter,
  Download, Eye, Edit, Trash2, MoreVertical,
  AlertCircle, CheckCircle, Clock, Mail, MessageSquare,
  GraduationCap, Award, TrendingUp, FolderOpen, List
} from 'lucide-react';

const MaestrosDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inicio');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data
  const [proximasClases, setProximasClases] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [stats, setStats] = useState({
    proximasClases: 0,
    materialesTotal: 0,
    tareasPendientes: 0,
    notificacionesNoLeidas: 0,
  });

  // UI State
  const [showCreateClase, setShowCreateClase] = useState(false);
  const [showCreateMaterial, setShowCreateMaterial] = useState(false);
  const [searchMaterial, setSearchMaterial] = useState('');
  const [filterTipo, setFilterTipo] = useState('all');
  const [selectedSeccion, setSelectedSeccion] = useState(null);
  const [secciones, setSecciones] = useState([]);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/maestros/login');
        return;
      }
      setUser(session.user);
      await fetchPerfil(session.user.id);
      setLoading(false);
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await fetchPerfil(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        navigate('/maestros/login');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchPerfil = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('maestro_users')
        .select('*, division:divisiones(*)')
        .eq('id', userId)
        .single();
      if (error) throw error;
      setProfile(data);
      await loadDashboardData(userId);
    } catch (err) {
      console.error('Error fetching perfil:', err);
    }
  };

  const loadDashboardData = async (maestroId) => {
    try {
      // Próximas clases
      const { data: clases } = await supabase.rpc('obtener_clases_maestro', {
        p_maestro_id: maestroId,
        p_desde: new Date().toISOString().split('T')[0],
        p_hasta: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      });
      setProximasClases(clases || []);

      // Materiales (últimos 20)
      const { data: mats } = await supabase
        .from('materiales')
        .select('*, seccion:secciones(*), creado_por_user:maestro_users(*)')
        .order('created_at', { ascending: false })
        .limit(20);
      setMateriales(mats || []);

      // Secciones para filtros
      const { data: secs } = await supabase
        .from('secciones')
        .select('id, nombre, parent_id')
        .eq('activa', true)
        .order('orden');
      setSecciones(secs || []);

      // Notificaciones
      const { data: notifs } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('usuario_id', maestroId)
        .order('created_at', { ascending: false })
        .limit(10);
      setNotificaciones(notifs || []);

      // Stats
      const { count: matsCount } = await supabase
        .from('materiales')
        .select('*', { count: 'exact', head: true });
      
      setStats({
        proximasClases: clases?.length || 0,
        materialesTotal: matsCount || 0,
        tareasPendientes: 0,
        notificacionesNoLeidas: notifs?.filter(n => !n.leida).length || 0,
      });
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/maestros/login');
  };

  const formatDate = (dateStr) => 
    new Date(dateStr).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  const getTipoIcon = (tipo) => tipo === 'archivo' ? FileText : Link2;
  const getMimeIcon = (mime) => {
    if (!mime) return FileText;
    if (mime.startsWith('image/')) return Image;
    if (mime.startsWith('video/')) return Video;
    if (mime === 'application/pdf') return FileText;
    return FileText;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white font-sans">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} fixed h-full bg-white border-r shadow-lg transition-all duration-300 z-40`} style={{ left: 0, top: 0 }}>
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className={`${sidebarOpen ? 'text-lg font-bold' : 'hidden'} text-blue-700`}>IMR4 Maestros</h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700">
            {sidebarOpen ? '⟵' : '⟶'}
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {[
            { id: 'inicio', icon: LayoutDashboard, label: 'Inicio' },
            { id: 'biblioteca', icon: BookOpen, label: 'Biblioteca' },
            { id: 'calendario', icon: Calendar, label: 'Calendario' },
            { id: 'videoteca', icon: Video, label: 'Videoteca' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                activeTab === item.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              } ${!sidebarOpen && 'justify-center'}`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className={`${sidebarOpen ? 'flex items-center gap-3' : 'flex justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{profile?.nombre || user?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{profile?.role?.replace('_', ' ')}</p>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="mt-3 w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Salir</span>}
          </button>
        </div>
      </aside>

      <main className={`ml-64 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`} style={{ minHeight: '100vh' }}>
        <header className="sticky top-0 bg-white/90 backdrop-blur-sm border-b z-30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{['Inicio', 'Biblioteca', 'Calendario', 'Videoteca'][['inicio', 'biblioteca', 'calendario', 'videoteca'].indexOf(activeTab)]}</h2>
              <p className="text-gray-500">Panel de control para maestras líderes</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-full hover:bg-gray-100">
                <Bell className="w-6 h-6 text-gray-600" />
                {stats.notificacionesNoLeidas > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {stats.notificacionesNoLeidas > 9 ? '9+' : stats.notificacionesNoLeidas}
                  </span>
                )}
              </button>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {activeTab === 'inicio' && (
            <DashboardHome 
              proximasClases={proximasClases} 
              stats={stats}
              onCreateClase={() => setShowCreateClase(true)}
              formatDate={formatDate}
            />
          )}

          {activeTab === 'biblioteca' && (
            <BibliotecaView
              materiales={materiales}
              secciones={secciones}
              searchMaterial={searchMaterial}
              setSearchMaterial={setSearchMaterial}
              filterTipo={filterTipo}
              setFilterTipo={setFilterTipo}
              selectedSeccion={selectedSeccion}
              setSelectedSeccion={setSelectedSeccion}
              onCreateMaterial={() => setShowCreateMaterial(true)}
              getTipoIcon={getTipoIcon}
              getMimeIcon={getMimeIcon}
              formatDate={formatDate}
            />
          )}

          {activeTab === 'calendario' && (
            <CalendarioView
              proximasClases={proximasClases}
              onCreateClase={() => setShowCreateClase(true)}
              formatDate={formatDate}
            />
          )}

          {activeTab === 'videoteca' && (
            <VideotecaView />
          )}
        </div>
      </main>

      {/* Modal Crear Clase */}
      {showCreateClase && (
        <Modal onClose={() => setShowCreateClase(false)} title="Programar Nueva Clase" size="lg">
          <CrearClaseForm onSuccess={() => { setShowCreateClase(false); loadDashboardData(user.id); }} />
        </Modal>
      )}

      {/* Modal Crear Material */}
      {showCreateMaterial && (
        <Modal onClose={() => setShowCreateMaterial(false)} title="Subir Material" size="lg">
          <CrearMaterialForm secciones={secciones} onSuccess={() => { setShowCreateMaterial(false); loadDashboardData(user.id); }} />
        </Modal>
      )}
    </div>
  );
};

// ========== COMPONENTES AUXILIARES ==========

const DashboardHome = ({ proximasClases, stats, onCreateClase, formatDate }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Próximas Clases', value: stats.proximasClases, icon: Calendar, color: 'bg-blue-500' },
        { label: 'Materiales', value: stats.materialesTotal, icon: BookOpen, color: 'bg-green-500' },
        { label: 'Tareas Pendientes', value: stats.tareasPendientes, icon: FileText, color: 'bg-yellow-500' },
        { label: 'Notificaciones', value: stats.notificacionesNoLeidas, icon: Bell, color: 'bg-red-500' },
      ].map(item => (
        <div key={item.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-3xl font-bold text-gray-800">{item.value}</p>
            </div>
            <div className={`p-3 rounded-full ${item.color}`}>
              <item.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h3 className="text-lg font-semibold">Próximas Clases</h3>
        <button onClick={onCreateClase} className="btn-primary">
          <Plus className="w-4 h-4 mr-1" /> Nueva Clase
        </button>
      </div>
      <div className="divide-y">
        {proximasClases.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No hay clases programadas</p>
            <button onClick={onCreateClase} className="mt-3 btn-primary inline-flex">
              <Plus className="w-4 h-4 mr-1" /> Programar primera clase
            </button>
          </div>
        ) : (
          <>
            {proximasClases.slice(0, 5).map(clase => (
              <div key={clase.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{clase.titulo_clase}</p>
                    <p className="text-sm text-gray-500">{formatDate(clase.fecha)} · {clase.division_nombre} · {clase.seccion_nombre}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${clase.enviada_notificacion ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {clase.enviada_notificacion ? 'Notificada' : 'Pendiente'}
                  </span>
                </div>
              </div>
            ))}
            {proximasClases.length > 5 && (
              <div className="p-4 text-center border-t">
                <button className="text-blue-600 hover:underline">Ver todas las {proximasClases.length} clases</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  </div>
);

const BibliotecaView = ({ 
  materiales, secciones, searchMaterial, setSearchMaterial, 
  filterTipo, setFilterTipo, selectedSeccion, setSelectedSeccion,
  onCreateMaterial, getTipoIcon, getMimeIcon, formatDate 
}) => {
  const [viewMode, setViewMode] = useState('grid');

  const filtered = materiales.filter((m) => {
    const matchSearch = m.titulo.toLowerCase().includes(searchMaterial.toLowerCase());
    const matchTipo = filterTipo === 'all' || m.tipo === filterTipo;
    const matchSeccion = !selectedSeccion || m.seccion_id === selectedSeccion;
    return matchSearch && matchTipo && matchSeccion;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-2">
          <button onClick={onCreateMaterial} className="btn-primary">
            <Upload className="w-4 h-4 mr-1" /> Subir Material
          </button>
        </div>
        <div className="flex gap-2 flex-1 sm:flex-none">
          <input
            type="text"
            placeholder="Buscar materiales..."
            value={searchMaterial}
            onChange={e => setSearchMaterial(e.target.value)}
            className="input flex-1 max-w-xs"
          />
          <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} className="input w-36">
            <option value="all">Todos</option>
            <option value="archivo">Archivos</option>
            <option value="enlace">Enlaces</option>
          </select>
          <select value={selectedSeccion || ''} onChange={e => setSelectedSeccion(e.target.value || null)} className="input w-48">
            <option value="">Todas las secciones</option>
            {secciones.filter(s => !s.parent_id).map(s => (
              <optgroup key={s.id} label={s.nombre}>
                {secciones.filter(sub => sub.parent_id === s.id).map(sub => (
                  <option key={sub.id} value={sub.id}>— {sub.nombre}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}><LayoutDashboard className="w-5 h-5" /></button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}><List className="w-5 h-5" /></button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((m) => (
            <MaterialCard key={m.id} material={m} getTipoIcon={getTipoIcon} getMimeIcon={getMimeIcon} formatDate={formatDate} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4">Material</th>
                <th className="p-4 hidden md:table-cell">Sección</th>
                <th className="p-4 hidden lg:table-cell">Tipo</th>
                <th className="p-4 hidden lg:table-cell">Subido por</th>
                <th className="p-4">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${m.tipo === 'archivo' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                        {getMimeIcon(m.mime_type)}
                      </div>
                      <div>
                        <p className="font-medium">{m.titulo}</p>
                        <p className="text-sm text-gray-500">{m.descripcion || 'Sin descripción'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-sm">{m.seccion?.nombre}</td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className={`px-2 py-1 rounded text-xs ${m.tipo === 'archivo' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {m.tipo === 'archivo' ? 'Archivo' : 'Enlace'}
                    </span>
                  </td>
                  <td className="p-4 hidden lg:table-cell text-sm text-gray-500">{m.creado_por_user?.nombre}</td>
                  <td className="p-4 text-sm text-gray-500">{formatDate(m.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FolderOpen className="w-16 h-16 mx-auto mb-3 text-gray-300" />
          <p>No se encontraron materiales</p>
        </div>
      )}
    </div>
  )

const MaterialCard = ({ material, getTipoIcon, getMimeIcon, formatDate }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition flex flex-col h-full">
    <div className="flex items-start justify-between mb-3">
      <div className={`p-3 rounded-lg ${material.tipo === 'archivo' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
        {getMimeIcon(material.mime_type)}
      </div>
      <span className={`px-2 py-1 rounded text-xs ${material.tipo === 'archivo' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
        {material.tipo === 'archivo' ? 'Archivo' : 'Enlace'}
      </span>
    </div>
    <h4 className="font-medium text-gray-800 mb-1 line-clamp-2">{material.titulo}</h4>
    <p className="text-sm text-gray-500 mb-3 line-clamp-2 flex-1">{material.descripcion || 'Sin descripción'}</p>
    <div className="flex items-center justify-between text-xs text-gray-400">
      <span>{material.seccion?.nombre}</span>
      <span>{formatDate(material.created_at)}</span>
    </div>
  </div>
);

const CalendarioView = ({ proximasClases, onCreateClase, formatDate }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold">Calendario de Clases</h3>
      <button onClick={onCreateClase} className="btn-primary">
        <Plus className="w-4 h-4 mr-1" /> Programar Clase
      </button>
    </div>
    <div className="space-y-3">
      {proximasClases.map(clase => (
        <div key={clase.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{clase.titulo_clase}</p>
              <p className="text-sm text-gray-500">{formatDate(clase.fecha)} · {clase.division_nombre} · {clase.seccion_nombre}</p>
              {clase.material_titulo && <p className="text-xs text-blue-600 mt-1">📎 {clase.material_titulo}</p>}
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${clase.enviada_notificacion ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {clase.enviada_notificacion ? 'Notificada' : 'Pendiente WhatsApp'}
            </span>
          </div>
        </div>
      ))}
      {proximasClases.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-16 h-16 mx-auto mb-3 text-gray-300" />
          <p>No hay clases programadas</p>
        </div>
      )}
    </div>
  </div>
);

const VideotecaView = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold">Videoteca Educativa</h3>
      <button className="btn-primary"><Plus className="w-4 h-4 mr-1" /> Subir Video</button>
    </div>
    <div className="text-center py-12 text-gray-500">
      <Video className="w-16 h-16 mx-auto mb-3 text-gray-300" />
      <p className="text-lg font-medium">Próximamente</p>
      <p className="text-sm">Gestión de videos para aulas virtuales</p>
    </div>
  </div>
);

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className={`bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto w-full ${size === 'lg' ? 'max-w-2xl' : 'max-w-md'}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const CrearClaseForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    division_id: '',
    seccion_id: '',
    material_id: '',
    maestro_asistente_id: '',
    titulo_clase: '',
    notas: '',
    enviar_notificacion: false,
  });
  const [loading, setLoading] = useState(false);
  const [divisiones, setDivisiones] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [asistentes, setAsistentes] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [d, s, m, a] = await Promise.all([
        supabase.from('divisiones').select('id, nombre').eq('activa', true).order('orden'),
        supabase.from('secciones').select('id, nombre, parent_id').eq('activa', true).order('orden'),
        supabase.from('materiales').select('id, titulo').order('titulo'),
        supabase.from('maestro_users').select('id, nombre').eq('activa', true).neq('role', 'admin_maestros'),
      ]);
      setDivisiones(d.data || []);
      setSecciones(s.data || []);
      setMateriales(m.data || []);
      setAsistentes(a.data || []);
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crear-clase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      onSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear clase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Fecha *</label>
          <input type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} className="input" required />
        </div>
        <div>
          <label className="label">División *</label>
          <select value={form.division_id} onChange={e => setForm({...form, division_id: e.target.value})} className="input" required>
            <option value="">Seleccionar</option>
            {divisiones.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Sección *</label>
          <select value={form.seccion_id} onChange={e => setForm({...form, seccion_id: e.target.value})} className="input" required>
            <option value="">Seleccionar</option>
            {secciones.filter(s => !s.parent_id).map(s => (
              <optgroup key={s.id} label={s.nombre}>
                {secciones.filter(sub => sub.parent_id === s.id).map(sub => (
                  <option key={sub.id} value={sub.id}>— {sub.nombre}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Material (opcional)</label>
          <select value={form.material_id} onChange={e => setForm({...form, material_id: e.target.value})} className="input">
            <option value="">Sin material específico</option>
            {materiales.map(m => <option key={m.id} value={m.id}>{m.titulo}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Título de la Clase *</label>
        <input type="text" value={form.titulo_clase} onChange={e => setForm({...form, titulo_clase: e.target.value})} className="input" placeholder="Ej: La Creación - Génesis 1" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Maestro Asistente</label>
          <select value={form.maestro_asistente_id} onChange={e => setForm({...form, maestro_asistente_id: e.target.value})} className="input">
            <option value="">Ninguno</option>
            {asistentes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Notas</label>
        <textarea value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} className="input" rows={3} placeholder="Observaciones para los maestros..." />
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={form.enviar_notificacion} onChange={e => setForm({...form, enviar_notificacion: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
        <span className="text-sm">Enviar notificación por WhatsApp al crear</span>
      </label>
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onSuccess} className="btn-secondary">Cancelar</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Guardando...' : 'Crear Clase'}
        </button>
      </div>
    </form>
  );
};

const CrearMaterialForm = ({ secciones, onSuccess }) => {
  const [form, setForm] = useState({
    seccion_id: '',
    titulo: '',
    descripcion: '',
    tipo: 'archivo',
    file: null,
    url_externo: '',
    publicado_en_web: false,
  });
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.tipo === 'archivo' && !form.file) return alert('Selecciona un archivo');
    if (form.tipo === 'enlace' && !form.url_externo) return alert('Ingresa la URL');

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const fd = new FormData();
      fd.append('seccion_id', form.seccion_id);
      fd.append('titulo', form.titulo);
      if (form.descripcion) fd.append('descripcion', form.descripcion);
      fd.append('tipo', form.tipo);
      if (form.file) fd.append('file', form.file);
      if (form.url_externo) fd.append('url_externo', form.url_externo);
      if (form.publicado_en_web) fd.append('publicado_en_web', 'true');

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-material`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
        body: fd,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      onSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al subir material');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === 'dragenter' || e.type === 'dragover'); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files[0]) setForm({...form, file: e.dataTransfer.files[0] }); };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
      <div>
        <label className="label">Sección *</label>
        <select value={form.seccion_id} onChange={e => setForm({...form, seccion_id: e.target.value})} className="input" required>
          <option value="">Seleccionar sección</option>
          {secciones.filter(s => !s.parent_id).map(s => (
            <optgroup key={s.id} label={s.nombre}>
              {secciones.filter(sub => sub.parent_id === s.id).map(sub => (
                <option key={sub.id} value={sub.id}>— {sub.nombre}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Título *</label>
        <input type="text" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} className="input" required />
      </div>
      <div>
        <label className="label">Descripción</label>
        <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} className="input" rows={2} />
      </div>
      <div>
        <label className="label">Tipo *</label>
        <div className="flex gap-4">
          {['archivo', 'enlace'].map(t => (
            <label key={t} className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border-2 ${form.tipo === t ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="tipo" value={t} checked={form.tipo === t} onChange={e => setForm({...form, tipo: e.target.value})} className="w-4 h-4 text-blue-600" />
              <span className="capitalize">{t}</span>
            </label>
          ))}
        </div>
      </div>
      {form.tipo === 'archivo' && (
        <div className={`border-2 border-dashed rounded-lg p-6 text-center transition ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mp3,.wav,.doc,.docx,.ppt,.pptx" onChange={e => e.target.files[0] && setForm({...form, file: e.target.files[0]})} className="hidden" id="file-input" ref={el => el?.click()} />
          <label htmlFor="file-input" className="cursor-pointer">
            <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">Arrastra un archivo o haz clic para seleccionar</p>
            <p className="text-xs text-gray-400 mt-1">PDF, imágenes, video, audio, Office (máx 100MB)</p>
          </label>
          {form.file && <p className="mt-2 text-sm text-green-600">✓ {form.file.name} ({(form.file.size/1024/1024).toFixed(1)} MB)</p>}
        </div>
      )}
      {form.tipo === 'enlace' && (
        <div>
          <label className="label">URL *</label>
          <input type="url" value={form.url_externo} onChange={e => setForm({...form, url_externo: e.target.value})} className="input" placeholder="https://youtube.com/... o https://drive.google.com/..." required />
        </div>
      )}
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={form.publicado_en_web} onChange={e => setForm({...form, publicado_en_web: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
        <span className="text-sm">Publicar también en la web pública (videoteca)</span>
      </label>
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onSuccess} className="btn-secondary">Cancelar</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Subiendo...' : 'Subir Material'}
        </button>
      </div>
    </form>
  );
};

};

// Estilos inline para botones/inputs
const style = document.createElement('style');
style.textContent = `
  .btn-primary { @apply bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed; }
  .btn-secondary { @apply bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition; }
  .input { @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent; }
  .label { @apply block text-sm font-medium text-gray-700 mb-1; }
`;
document.head.appendChild(style);

export default MaestrosDashboard;