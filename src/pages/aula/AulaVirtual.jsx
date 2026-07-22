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
  const [step, setStep] = useState('login');
  const [estudiante, setEstudiante] = useState(null);
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [codigo, setCodigo] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showEntregaModal, setShowEntregaModal] = useState(null);
  const [entregaLoading, setEntregaLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const code = codigo.toUpperCase().trim();
      
      // 1. Buscar división por codigo_acceso (el código pertenece a divisiones)
      const { data: division, error: divError } = await supabase
        .from('divisiones')
        .select('id, nombre, codigo_acceso')
        .eq('codigo_acceso', code)
        .single();

      if (divError || !division) {
        throw new Error('Código de división inválido. Verifica e intenta de nuevo.');
      }

      // 2. Buscar estudiantes activos en esa división
      const { data: estudiantes, error: estError } = await supabase
        .from('estudiantes')
        .select('id, nombre, apellido, division_id, activo')
        .eq('division_id', division.id)
        .eq('activo', true);

      if (estError || !estudiantes || estudiantes.length === 0) {
        throw new Error('No hay estudiantes activos en esta división.');
      }

      // Por ahora tomamos el primer estudiante (o se podría mostrar selector si hay varios)
      const estudianteData = {
        ...estudiantes[0],
        division_nombre: division.nombre,
        division_codigo: division.codigo_acceso,
        division_id: division.id
      };
      
      setEstudiante(estudianteData);
      localStorage.setItem('aula_estudiante', JSON.stringify(estudianteData));
      setStep('dashboard');
      await loadTareas(estudianteData.id);
    } catch (err) {
      setLoginError(
        err instanceof Error
          ? err.message
          : 'Error al validar código'
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const loadTareas = async (estudianteId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('obtener_tareas_estudiante', {
        p_estudiante_id: estudianteId,
      });
      if (error) throw error;
      setTareas(data || []);
    } catch (err) {
      console.error('Error loading tareas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar sesión del estudiante desde localStorage al montar el componente
  useEffect(() => {
    const savedEstudiante = localStorage.getItem('aula_estudiante');
    if (savedEstudiante) {
      try {
        const parsed = JSON.parse(savedEstudiante);
        if (parsed && parsed.id) {
          setEstudiante(parsed);
          setStep('dashboard');
          loadTareas(parsed.id);
        }
      } catch (e) {
        console.error('Error al parsear sesión guardada de estudiante:', e);
      }
    }
  }, []);

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
      if (estudiante) await loadTareas(estudiante.id);
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
    formData.append('codigo_estudiante', codigo);
    formData.append('tarea_id', showEntregaModal.tarea_id);
    handleEntregar(formData);
  };

  const filteredTareas = tareas.filter(t =>
    activeFilter === 'all' || t.estado === activeFilter
  );

  // ================= NUEVA VISTA DE LOGIN REMODELADA =================
  if (step === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-400 via-indigo-500 to-purple-600 p-4 relative overflow-hidden">
        {/* Adornos infantiles flotantes de fondo */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl"></div>

        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border-4 border-white/50 text-center relative z-10">

          {/* Header con ícono grande e infantil */}
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-3 bg-gradient-to-tr from-yellow-300 to-amber-400 rounded-2xl rotate-3 flex items-center justify-center shadow-lg border-2 border-white">
              <GraduationCap className="w-12 h-12 text-amber-900 -rotate-3" />
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-black uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Aula Virtual IMR4
            </span>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">
              ¡Hola, Niño/a!
            </h1>
            <p className="text-sm font-semibold text-gray-500 mt-1">
              Ingresa tu código mágico para ver tus tareas
            </p>
          </div>

          {/* Formulario Estudiante */}
          <form onSubmit={handleLogin} className="space-y-5">
            {loginError && (
              <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 text-left animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {loginError}
              </div>
            )}

            <div className="text-left">
              <label className="block text-xs font-black text-purple-900 uppercase tracking-wider mb-2 text-center">
                Tu Código de Acceso:
              </label>
              <input
                type="text"
                value={codigo}
                onChange={e => setCodigo(e.target.value.toUpperCase())}
                placeholder="EJ: GENESIS-2026-001"
                className="w-full px-4 py-4 border-3 border-purple-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-500 text-center text-xl font-black tracking-widest font-mono uppercase bg-purple-50/50 text-purple-900 placeholder-purple-300 transition-all shadow-inner"
                required
                maxLength={30}
                disabled={loginLoading}
              />
            </div>

            {/* BOTÓN DIVERTIDO Y VISIBLE PARA NIÑOS */}
            <button
              type="submit"
              disabled={loginLoading || !codigo.trim()}
              className="w-full py-4 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xl rounded-2xl shadow-xl shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border-b-4 border-teal-700"
            >
              {loginLoading ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-6 h-6 stroke-[2.5]" />
                  <span>¡ENTRAR A MI CLASE!</span>
                </>
              )}
            </button>
          </form>

          {/* SECCIÓN INFERIOR DISCRETA PARA MAESTRAS / LÍDERES */}
          <div className="mt-8 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">
              ¿Eres la maestra o líder del grupo?
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline decoration-2 underline-offset-4 transition"
            >
              Acceso a Panel de Maestras →
            </button>
          </div>

          {/* Botón Volver */}
          <div className="mt-6">
            <button
              onClick={() => navigate('/ministerio/ninos')}
              className="text-gray-400 hover:text-gray-600 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Inicio
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ================= VISTA DASHBOARD =================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                <p className="text-sm text-gray-500">{estudiante?.division_nombre} · {estudiante?.nombre} {estudiante?.apellido}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                {estudiante?.division_codigo}
              </span>
              <button onClick={() => { setStep('login'); setCodigo(''); setEstudiante(null); localStorage.removeItem('aula_estudiante'); }} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
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

        {/* Filters */}
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

        {/* Tareas List */}
        {loading ? (
          <div className="text-center py-12">
            <svg className="animate-spin h-10 w-10 mx-auto text-blue-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            <p className="mt-2 text-gray-500">Cargando tareas...</p>
          </div>
        ) : filteredTareas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-500 mb-1">
              {activeFilter === 'all' ? 'No hay tareas asignadas' : `No hay tareas ${getEstadoBadge(activeFilter).label.toLowerCase()}`}
            </h3>
            <p className="text-gray-400">Cuando tu maestra asigne una tarea, aparecerá aquí.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTareas.map(tarea => {
              const badge = getEstadoBadge(tarea.estado);
              const Icon = getTipoIcon(tarea.tarea_tipo);
              const isVencida = tarea.tarea_fecha_entrega && new Date(tarea.tarea_fecha_entrega) < new Date() && tarea.estado === 'pendiente';

              return (
                <div key={tarea.tarea_id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${tarea.tarea_tipo === 'video' ? 'bg-red-100 text-red-600' : tarea.tarea_tipo === 'archivo' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{tarea.tarea_titulo}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                                <badge.icon className="w-3 h-3 inline mr-1" /> {badge.label}
                              </span>
                              {isVencida && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">⚠ Vencida</span>}
                              <span>{tarea.seccion_nombre}</span>
                              <span>{tarea.division_nombre}</span>
                            </div>
                          </div>
                        </div>

                        {tarea.tarea_descripcion && (
                          <p className="text-gray-600 mb-3">{tarea.tarea_descripcion}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Clase: {formatDate(tarea.clase_fecha)}
                          </span>
                          {tarea.tarea_fecha_entrega && (
                            <span className={`flex items-center gap-1 ${isVencida ? 'text-red-500 font-medium' : ''}`}>
                              <Target className="w-4 h-4" />
                              Entrega: {formatDate(tarea.tarea_fecha_entrega)}
                            </span>
                          )}
                        </div>

                        {tarea.url_recurso && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <a href={tarea.url_recurso} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                              <Eye className="w-4 h-4" />
                              Ver material de la tarea
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {tarea.estado === 'pendiente' && (
                          <button
                            onClick={() => setShowEntregaModal(tarea)}
                            className={`${styles.btnPrimary} text-sm px-4`}
                          >
                            <Upload className="w-4 h-4 mr-1" /> Entregar
                          </button>
                        )}
                        {tarea.estado === 'entregado' && (
                          <div className="text-xs text-blue-600">
                            Entregado: {tarea.entregado_en ? formatDate(tarea.entregado_en) : ''}
                          </div>
                        )}
                        {tarea.estado === 'revisado' && (
                          <div className="text-right">
                            <div className="text-xs text-green-600">Revisado</div>
                            {tarea.nota !== null && (
                              <div className="flex items-center gap-1 text-sm font-medium text-green-700">
                                <Star className="w-4 h-4 fill-current" />
                                Nota: {tarea.nota}/10
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {tarea.estado === 'revisado' && tarea.feedback && (
                    <div className="bg-green-50 border-t p-4 px-5">
                      <p className="font-medium text-green-800 mb-1">Retroalimentación de tu maestra:</p>
                      <p className="text-gray-700">{tarea.feedback}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Entrega Modal */}
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
                  {showEntregaModal.tarea_tipo === 'archivo' && (
                    <div>
                      <label className={styles.label}>Subir archivo</label>
                      <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mp3,.wav,.doc,.docx" className={styles.input} required />
                    </div>
                  )}
                  {showEntregaModal.tarea_tipo === 'enlace' && (
                    <div>
                      <label className={styles.label}>URL de entrega</label>
                      <input type="url" name="url_entrega" className={styles.input} placeholder="https://..." required />
                    </div>
                  )}
                  {showEntregaModal.tarea_tipo === 'cuestionario' && (
                    <div>
                      <label className={styles.label}>Tus respuestas (JSON)</label>
                      <textarea name="respuesta_json" className={`${styles.input} font-mono text-sm`} rows={6} placeholder='{"pregunta1": "respuesta", "pregunta2": "respuesta"}' required></textarea>
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