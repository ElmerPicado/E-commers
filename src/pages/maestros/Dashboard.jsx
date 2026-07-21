import React, { useState, useEffect } from 'react';
import {
  Users, BookOpen, Calendar, FileText, CheckSquare, Settings,
  Plus, Search, Filter, Download, Trash2, Edit3, Eye,
  ChevronRight, AlertCircle, CheckCircle, Clock, Upload,
  ExternalLink, X, FolderOpen, Menu, Bell, User
} from 'lucide-react';

// ==========================================
// COMPONENTES REUTILIZABLES
// ==========================================

const StatCard = ({ title, value, icon: Icon, change, trend, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-xs font-medium mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? '↑' : '↓'} {change} vs mes anterior
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl border ${colorMap[color]}`}>
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-xl shadow-xl w-full ${sizeMap[size]} transform transition-all`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Estudiantes Activos" value="128" icon={Users} change="12%" trend="up" color="blue" />
        <StatCard title="Clases Programadas" value="24" icon={Calendar} change="4%" trend="up" color="green" />
        <StatCard title="Materiales Subidos" value="86" icon={FolderOpen} change="8%" trend="up" color="purple" />
        <StatCard title="Tareas Pendientes" value="15" icon={CheckSquare} change="2%" trend="down" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Próximas Clases</h2>
            <button onClick={() => onNavigate('clases')} className="text-sm font-medium text-blue-600 hover:underline">
              Ver todas
            </button>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((_, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Matemáticas Avanzadas</p>
                    <p className="text-xs text-gray-500">Grupo 4A • 10:00 AM - 11:30 AM</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                  En vivo
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Actividad Reciente</h2>
          <div className="space-y-4">
            {[
              { text: 'Entrega de tarea recibida', time: 'Hace 10 min', icon: CheckCircle, color: 'text-green-500' },
              { text: 'Nuevo material publicado', time: 'Hace 1 hora', icon: Upload, color: 'text-blue-500' },
              { text: 'Recordatorio de clase', time: 'Hace 3 horas', icon: Clock, color: 'text-amber-500' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm">
                <item.icon className={`w-5 h-5 mt-0.5 ${item.color}`} />
                <div>
                  <p className="text-gray-800 font-medium">{item.text}</p>
                  <p className="text-xs text-gray-400">{item.time}</p>
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
  <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow flex items-start justify-between">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
        {material.tipo === 'enlace' ? <ExternalLink className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 text-sm">{material.titulo}</h4>
        <p className="text-xs text-gray-500 mt-1">{material.descripcion}</p>
        <span className="inline-block mt-2 text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
          {material.tipo?.toUpperCase() || 'ARCHIVO'}
        </span>
      </div>
    </div>
    <button onClick={() => onDelete(material.id)} className="text-gray-400 hover:text-red-600 p-1">
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);

const BibliotecaView = ({ materiales = [], onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = materiales.filter(m =>
    m.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <MaterialCard key={item.id} material={item} onDelete={onDelete} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FolderOpen className="w-16 h-16 mx-auto mb-3 text-gray-300" />
          <p>No se encontraron materiales</p>
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
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título del Material *</label>
        <input
          type="text"
          value={form.titulo}
          onChange={e => setForm({ ...form, titulo: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          value={form.descripcion}
          onChange={e => setForm({ ...form, descripcion: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Material</label>
        <select
          value={form.tipo}
          onChange={e => setForm({ ...form, tipo: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
        >
          <option value="archivo">Archivo (PDF, Imagen, etc.)</option>
          <option value="enlace">Enlace Externo</option>
        </select>
      </div>

      {form.tipo === 'archivo' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) setForm({ ...form, file: e.dataTransfer.files[0] }); }}
          className={`border-2 border-dashed p-6 rounded-lg text-center ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        >
          <input
            type="file"
            onChange={e => setForm({ ...form, file: e.target.files[0] })}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer text-blue-600 font-medium text-sm">
            {form.file ? form.file.name : 'Haz clic para seleccionar o arrastra un archivo'}
          </label>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL Externo *</label>
          <input
            type="url"
            value={form.url_externo}
            onChange={e => setForm({ ...form, url_externo: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            placeholder="https://..."
            required
          />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => onSuccess && onSuccess(null)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Subiendo...' : 'Subir Material'}
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
    { id: '1', titulo: 'Guía de Álgebra', descripcion: 'Ejercicios para el examen final', tipo: 'archivo' },
    { id: '2', titulo: 'Documentación React', descripcion: 'Enlace oficial', tipo: 'enlace' },
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          {sidebarOpen && <span className="font-bold text-xl text-blue-600">EduControl</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`} style={{ minHeight: '100vh' }}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between px-6">
          <h1 className="text-xl font-bold text-gray-800 capitalize">{activeTab}</h1>

          <div className="flex items-center gap-4">
            {activeTab === 'biblioteca' && (
              <button
                onClick={() => setShowCreateMaterial(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Subir Material
              </button>
            )}
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                P
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-700">Prof. García</p>
                <p className="text-xs text-gray-400">Docente</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <div className="p-6">
          {activeTab === 'resumen' && <ResumenView onNavigate={setActiveTab} />}
          {activeTab === 'biblioteca' && <BibliotecaView materiales={materiales} onDelete={handleDeleteMaterial} />}
          {activeTab === 'clases' && (
            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
              Módulo de Clases en construcción.
            </div>
          )}
          {activeTab === 'estudiantes' && (
            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
              Módulo de Estudiantes en construcción.
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
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