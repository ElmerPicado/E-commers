import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
  BookOpen, Video, FileText, CheckCircle, Clock, AlertCircle,
  ArrowLeft, Upload, Eye, Star, Target, MessageSquare, LogOut, GraduationCap, Sparkles
} from 'lucide-react';

// === Clases de estilos reutilizables ===
const styles = {
  btnPrimary: "inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed",
  btnSecondary: "inline-flex items-center justify-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition",
  input: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
  label: "block text-sm font-medium text-gray-700 mb-1"
};

// === Helper Functions ===
const formatDate = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', weekday: 'short' }) : 'Sin fecha';

const getEstadoBadge = (estado) => {
  switch (estado) {
    case 'pendiente': return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pendiente' };
    case 'entregado': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Upload, label: 'Entregado' };
    case 'revisado': return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Revisado' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: AlertCircle, label: estado };
  }
};

const getTipoIcon = (tipo) => {
  switch (tipo) {
    case 'video': return Video;
    case 'archivo': return FileText;
    case 'enlace': return Eye;
    case 'cuestionario': return MessageSquare;
    default: return FileText;
  }
};

const AulaVirtual = () => {
  const navigate = useNavigate();
  const [divisionInfo, setDivisionInfo] = useState(null);
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showEntregaModal, setShowEntregaModal] = useState(null);
  const [entregaLoading, setEntregaLoading] = useState(false);

  // Cargar datos de la división por defecto al iniciar la pantalla
  useEffect(() => {
    const initDivision = async () => {
      setLoading(true);
      try {
        // Puedes cambiar o automatizar cómo seleccionas la división aquí (por ejemplo, por ID o código fijo de la clase)
        const { data: division, error: divError } = await supabase
          .from('divisiones')
          .select('id, nombre, codigo_acceso')
          .limit(1)
          .single();

        if (divError || !division) throw new Error('No se encontró ninguna división configurada.');

        setDivisionInfo(division);
        await loadTareas(division.id);
      } catch (err) {
        console.error('Error al inicializar la división:', err);
      } finally {
        setLoading(false);
      }
    };

    initDivision();
  }, []);

  const loadTareas = async (divisionId) => {
    try {
      const { data, error } = await supabase.rpc('obtener_tareas_division', {
        p_division_id: divisionId,
      });
      if (error) throw error;
      setTareas(data || []);
    } catch (err) {
      console.error('Error loading tareas:', err);
    }
  };

  const handleEntregar = async (formData) => {
    setEntregaLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-entrega`, {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setShowEntregaModal(null);
      if (divisionInfo) await loadTareas(divisionInfo.id);
      alert('¡Entrega realizada correctamente!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al entregar');
    } finally {
      setEntregaLoading(false);
    }
  };

  const handleSubmitEntregaForm = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append('division_id', divisionInfo?.id);
    formData.append('tarea_id', showEntregaModal.tarea_id);
    handleEntregar(formData);
  };

  const filteredTareas = tareas.filter(t =>
    activeFilter === 'all' || t.estado === activeFilter
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/ministerio/ninos')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Aula Virtual</h1>
                <p className="text-sm text-gray-500">{divisionInfo?.nombre || 'Cargando división...'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                {divisionInfo?.codigo_acceso}
              </span>
              <button onClick={() => navigate('/login')} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold">
                Panel Maestras
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Tareas', value: tareas.length, icon: FileText, color: 'bg-blue-500' },
            { label: 'Pendientes', value: tareas.filter(t => t.estado === 'pendiente').length, icon: Clock, color: 'bg-yellow-500' },
            { label: 'Entregadas', value: tareas.filter(t => t.estado === 'entregado').length, icon: Upload, color: 'bg-blue-500' },
            { label: 'Revisadas', value: tareas.filter(t => t.estado === 'revisado').length, icon: CheckCircle, color: 'bg-green-500' },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                </div>
                <div className={`p-3 rounded-full ${item.color}`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'pendiente', 'entregado', 'revisado'].map(f => {
              const badge = getEstadoBadge(f);
              const Icon = badge.icon;
              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeFilter === f
                    ? `${badge.bg} ${badge.text}`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  <Icon className="w-4 h-4 inline mr-1" />
                  {f === 'all' ? 'Todas' : badge.label}
                  <span className="ml-1 px-2 py-0.5 bg-white/50 rounded-full text-xs">
                    {f === 'all' ? tareas.length : tareas.filter(t => t.estado === f).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <svg className="animate-spin h-10 w-10 mx-auto text-blue-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            <p className="mt-2 text-gray-500">Cargando espacio de la división...</p>
          </div>
        ) : filteredTareas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-500 mb-1">
              {activeFilter === 'all' ? 'No hay tareas en esta división' : `No hay tareas ${getEstadoBadge(activeFilter).label.toLowerCase()}`}
            </h3>
            <p className="text-gray-400">Las actividades asignadas aparecerán aquí.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTareas.map(tarea => {
              const badge = getEstadoBadge(tarea.estado);
              const Icon = getTipoIcon(tarea.tarea_tipo);

              return (
                <div key={tarea.tarea_id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{tarea.tarea_titulo}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                                <badge.icon className="w-3 h-3 inline mr-1" /> {badge.label}
                              </span>
                              <span>{tarea.seccion_nombre}</span>
                            </div>
                          </div>
                        </div>

                        {tarea.tarea_descripcion && (
                          <p className="text-gray-600 mb-3">{tarea.tarea_descripcion}</p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          onClick={() => setShowEntregaModal(tarea)}
                          className={`${styles.btnPrimary} text-sm px-4`}
                        >
                          <Upload className="w-4 h-4 mr-1" /> Entregar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showEntregaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowEntregaModal(null)}>
            <div className="w-[92vw] max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-6 bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
                <h3 className="font-semibold">Entregar Tarea</h3>
                <button onClick={() => setShowEntregaModal(null)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
              </div>
              <div className="p-4">
                <h4 className="font-medium mb-1">{showEntregaModal.tarea_titulo}</h4>
                <p className="text-sm text-gray-500 mb-4">{showEntregaModal.tarea_descripcion}</p>

                <form onSubmit={handleSubmitEntregaForm} className="space-y-4">
                  <div>
                    <label className={styles.label}>Tu Nombre / Participante</label>
                    <input type="text" name="nombre_estudiante" className={styles.input} placeholder="Escribe tu nombre aquí" required />
                  </div>
                  {showEntregaModal.tarea_tipo === 'archivo' && (
                    <div>
                      <label className={styles.label}>Subir archivo</label>
                      <input type="file" name="file" className={styles.input} required />
                    </div>
                  )}
                  {showEntregaModal.tarea_tipo === 'enlace' && (
                    <div>
                      <label className={styles.label}>URL de entrega</label>
                      <input type="url" name="url_entrega" className={styles.input} placeholder="https://..." required />
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={() => setShowEntregaModal(null)} className={styles.btnSecondary}>
                      Cancelar
                    </button>
                    <button type="submit" disabled={entregaLoading} className={styles.btnPrimary}>
                      {entregaLoading ? 'Enviando...' : 'Entregar Tarea'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AulaVirtual;