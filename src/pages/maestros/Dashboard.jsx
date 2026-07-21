import React, { useState, useEffect } from 'react';
import {
  Users, BookOpen, Calendar, FileText, CheckSquare, Settings,
  Plus, Search, Filter, Download, Trash2, Edit3, Eye,
  ChevronRight, AlertCircle, CheckCircle, Clock, Upload,
  ExternalLink, X, FolderOpen, Menu, Bell, User, Sparkles, Tag
} from 'lucide-react';

// ==========================================
// COMPONENTES REUTILIZABLES
// ==========================================

const StatCard = ({ title, value, icon: Icon, change, trend, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-xs font-semibold mt-2 flex items-center gap-1 ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
              <span>{trend === 'up' ? '↑' : '↓'}</span>
              <span>{change} vs mes anterior</span>
            </p>
          )}
        </div>
        <div className={`p-3.5 rounded-2xl border ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeMap = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizeMap[size]} transform transition-all border border-gray-100`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// VISTAS PRINCIPALES
// ==========================================

const ResumenView = ({ onNavigate }) => {
  return (
    <div className="space-y-8">
      {/* Header Banner de Bienvenida */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            ¡Hola, Prof. García! 👋
          </h2>
          <p className="text-blue-100 text-sm mt-1">Aquí tienes el resumen de tu actividad académica para hoy.</p>
        </div>
        <button
          onClick={() => onNavigate('biblioteca')}
          className="bg-white text-indigo-600 font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Gestionar Materiales
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Estudiantes Activos" value="128" icon={Users} change="12%" trend="up" color="blue" />
        <StatCard title="Clases Programadas" value="24" icon={Calendar} change="4%" trend="up" color="green" />
        <StatCard title="Materiales Subidos" value="86" icon={FolderOpen} change="8%" trend="up" color="purple" />
        <StatCard title="Tareas Pendientes" value="15" icon={CheckSquare} change="2%" trend="down" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Próximas Clases</h3>
              <p className="text-xs text-gray-500 mt-0.5">Sesiones agendadas para las próximas horas</p>
            </div>
            <button onClick={() => onNavigate('clases')} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Ver todas <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((_, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100/70 text-blue-600 rounded-xl">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Matemáticas Avanzadas</p>
                    <p className="text-xs text-gray-500 mt-0.5">Grupo 4A • 10:00 AM - 11:30 AM</p>
                  </div>
                </div>
                <span className="text-xs px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full font-semibold">
                  En vivo
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Actividad Reciente</h3>
          <p className="text-xs text-gray-500 mb-5">Notificaciones del sistema</p>
          <div className="space-y-4">
            {[
              { text: 'Entrega de tarea recibida', time: 'Hace 10 min', icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50' },
              { text: 'Nuevo material publicado', time: 'Hace 1 hora', icon: Upload, color: 'text-blue-500 bg-blue-50' },
              { text: 'Recordatorio de clase', time: 'Hace 3 horas', icon: Clock, color: 'text-amber-500 bg-amber-50' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3.5 text-sm p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-xl ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-xs">{item.text}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MaterialCard = ({ material, onDelete }) => (
  <div className="bg-white border border-gray-200/80 hover:border-blue-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
    <div>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
          {material.tipo === 'enlace' ? <ExternalLink className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
        </div>
        <button
          onClick={() => onDelete(material.id)}
          className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-colors"
          title="Eliminar material"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <h4 className="font-bold text-gray-900 text-base group-hover:text-indigo-600 transition-colors">
        {material.titulo}
      </h4>
      <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
        {material.descripcion || 'Sin descripción disponible.'}
      </p>
    </div>

    <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg uppercase tracking-wider">
        <Tag className="w-3 h-3" />
        {material.tipo || 'ARCHIVO'}
      </span>
      <button className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
        Ver detalles <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

const BibliotecaView = ({ materiales = [], onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = materiales.filter(m =>
    m.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>
        <div className="text-xs text-gray-500 font-semibold w-full sm:w-auto text-right">
          Mostrando <span className="text-gray-900 font-bold">{filtered.length}</span> recurso(s)
        </div>
      </div>

      {/* Grid de Materiales */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <MaterialCard key={item.id} material={item} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 text-center py-16 px-4">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-800">No hay materiales cargados</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Utiliza el botón superior para adjuntar tu primer documento o enlace externo.
          </p>
        </div>
      )}
    </div>
  );
};

// ==========================================
// FORMULARIOS
// ==========================================

const CrearMaterialForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'archivo',
    url_externo: '',
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (onSuccess) onSuccess(form);
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Título del Material *</label>
        <input
          type="text"
          value={form.titulo}
          onChange={e => setForm({ ...form, titulo: e.target.value })}
          placeholder="Ej: Guía de estudio 2026"
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Descripción</label>
        <textarea
          value={form.descripcion}
          onChange={e => setForm({ ...form, descripcion: e.target.value })}
          placeholder="Describe brevemente el contenido..."
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Tipo de Recurso</label>
        <select
          value={form.tipo}
          onChange={e => setForm({ ...form, tipo: e.target.value })}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
        >
          <option value="archivo">Documento / Archivo (PDF, Word, etc.)</option>
          <option value="enlace">Enlace Web Externo</option>
        </select>
      </div>

      {form.tipo === 'archivo' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) setForm({ ...form, file: e.dataTransfer.files[0] }); }}
          className={`border-2 border-dashed p-8 rounded-2xl text-center transition-colors cursor-pointer ${dragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 hover:border-indigo-300'}`}
        >
          <input
            type="file"
            onChange={e => setForm({ ...form, file: e.target.files[0] })}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            <Upload className="w-8 h-8 text-indigo-500 mb-2" />
            <span className="text-sm font-bold text-indigo-600">
              {form.file ? form.file.name : 'Selecciona un archivo o arrástralo aquí'}
            </span>
            <span className="text-xs text-gray-400 mt-1">Máximo 25MB (PDF, DOCX, PNG)</span>
          </label>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">URL Destino *</label>
          <input
            type="url"
            value={form.url_externo}
            onChange={e => setForm({ ...form, url_externo: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            placeholder="https://ejemplo.com/recurso"
            required
          />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => onSuccess && onSuccess(null)}
          className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Subiendo...' : 'Publicar Material'}
        </button>
      </div>
    </form>
  );
};

// ==========================================
// DASHBOARD PRINCIPAL
// ==========================================

const MaestrosDashboard = () => {
  const [activeTab, setActiveTab] = useState('resumen');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreateMaterial, setShowCreateMaterial] = useState(false);
  const [materiales, setMateriales] = useState([
    { id: '1', titulo: 'Guía de Álgebra Avanzada', descripcion: 'Ejercicios prácticos para el examen final del período.', tipo: 'archivo' },
    { id: '2', titulo: 'Documentación Oficial React', descripcion: 'Enlace web para consulta técnica de Hooks y componentes.', tipo: 'enlace' },
  ]);

  const handleAddMaterial = (newMat) => {
    if (newMat) {
      setMateriales(prev => [...prev, { ...newMat, id: Date.now().toString() }]);
    }
    setShowCreateMaterial(false);
  };

  const handleDeleteMaterial = (id) => {
    setMateriales(prev => prev.filter(m => m.id !== id));
  };

  const navItems = [
    { id: 'resumen', label: 'Resumen', icon: BookOpen },
    { id: 'biblioteca', label: 'Biblioteca', icon: FolderOpen },
    { id: 'clases', label: 'Clases', icon: Calendar },
    { id: 'estudiantes', label: 'Estudiantes', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Fijo y Adaptable */}
      <aside className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100">
          {sidebarOpen && <span className="font-extrabold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">EduControl</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Área Principal Dinámica (Ajusta sus márgenes dinámicamente) */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'pl-64' : 'pl-20'}`}>
        {/* Header Superior */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-30 flex items-center justify-between px-8">
          <h1 className="text-xl font-extrabold text-gray-900 capitalize tracking-tight">{activeTab}</h1>

          <div className="flex items-center gap-4">
            {activeTab === 'biblioteca' && (
              <button
                onClick={() => setShowCreateMaterial(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all"
              >
                <Plus className="w-4 h-4" />
                Subir Material
              </button>
            )}
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>

            <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                P
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-extrabold text-gray-900">Prof. García</p>
                <p className="text-[11px] text-gray-400 font-semibold">Docente Titular</p>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido Principal con Padding Cómodo */}
        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === 'resumen' && <ResumenView onNavigate={setActiveTab} />}
          {activeTab === 'biblioteca' && <BibliotecaView materiales={materiales} onDelete={handleDeleteMaterial} />}
          {activeTab === 'clases' && (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-400 font-medium">
              Módulo de Clases en construcción.
            </div>
          )}
          {activeTab === 'estudiantes' && (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-400 font-medium">
              Módulo de Estudiantes en construcción.
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <Modal
        isOpen={showCreateMaterial}
        onClose={() => setShowCreateMaterial(false)}
        title="Agregar Nuevo Material"
        size="md"
      >
        <CrearMaterialForm onSuccess={handleAddMaterial} />
      </Modal>
    </div>
  );
};

export default MaestrosDashboard;