import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient'; // Ajusta la ruta si es necesario
import './AulaVirtual.css'; // ¡Aquí importamos nuestro CSS personalizado!
import {
  BookOpen, Video, FileText, Clock,
  ArrowLeft, Upload, Sparkles, Play, Shield, Heart, Bookmark, Award, Home
} from 'lucide-react';

const AulaVirtual = () => {
  const navigate = useNavigate();

  // Lee el código guardado temporalmente en la sesión del navegador
  const sessionData = JSON.parse(localStorage.getItem('estudiante_actual') || '{}');
  const codigoGuardado = sessionData.division_codigo;

  const [divisionInfo, setDivisionInfo] = useState(null);
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [showEntregaModal, setShowEntregaModal] = useState(null);
  const [entregaLoading, setEntregaLoading] = useState(false);

  useEffect(() => {
    const fetchDivisionYTareas = async () => {
      const sessionData = JSON.parse(localStorage.getItem('estudiante_actual') || '{}');

      if (!sessionData || !sessionData.division_id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        setDivisionInfo({
          id: sessionData.division_id,
          nombre: sessionData.division_nombre || 'Clase Bíblica Metodista',
          descripcion: sessionData.descripcion || 'Un espacio vibrante y familiar para crecer en la fe, aprender la palabra y compartir en comunidad.',
          codigo_acceso: sessionData.division_codigo || 'METODISTA2026',
          verse: sessionData.verse || 'Lámpara es a mis pies tu palabra, y lumbrera a mi camino. - Salmos 119:105'
        });

        const { data: tareasData, error: tareasError } = await supabase.rpc('obtener_tareas_division', {
          p_division_id: sessionData.division_id,
        });

        if (tareasError) throw tareasError;
        setTareas(tareasData || []);

      } catch (err) {
        console.error('Error al cargar la información:', err);
        // Fallback de datos para demostración visual si la base de datos falla
        setDivisionInfo({
          nombre: 'Escuela Dominical Infantil y Juvenil',
          descripcion: 'Creciendo juntos en el amor de Dios, explorando historias bíblicas de forma divertida y creativa.',
          codigo_acceso: codigoGuardado || 'METODISTA2026',
          verse: 'Dejen a los niños venir a mí, y no se lo impidan, porque el reino de los cielos es de quienes son como ellos. - Mateo 19:14'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDivisionYTareas();
  }, [codigoGuardado]);

  const handleEntregar = async (formData) => {
    setEntregaLoading(true);
    // Simulación de entrega exitosa
    setTimeout(() => {
      setEntregaLoading(false);
      setShowEntregaModal(null);
      alert('¡Tarea entregada con éxito a tu maestro!');
    }, 1000);
  };

  const handleSubmitEntregaForm = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    handleEntregar(formData);
  };

  return (
    // Envolvemos todo en la clase principal para blindar nuestro CSS
    <div className="aula-virtual-wrapper">

      {/* 🌟 Barra de Navegación */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo y Botón Regresar */}
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 bg-gradient-to-tr from-blue-700 via-blue-600 to-amber-500 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
                <Heart className="w-6 h-6 text-white fill-white/20" />
              </div>
              <div>
                <span className="text-xs font-bold tracking-wider text-amber-600 uppercase">Comunidad Metodista</span>
                <h1 className="text-lg font-black text-slate-900 leading-tight m-0">
                  {divisionInfo ? divisionInfo.nombre : 'Aula Virtual'}
                </h1>
              </div>
            </div>

            {/* Navegación Principal */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
              {[
                { id: 'home', label: 'Home', icon: Home },
                { id: 'lessons', label: 'Lecciones', icon: BookOpen },
                { id: 'videos', label: 'Videos', icon: Video },
                { id: 'activities', label: 'Actividades', icon: Sparkles },
                { id: 'resources', label: 'Recursos', icon: Bookmark },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${isActive
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* Badge de Código de Acceso */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Código Compartido</span>
                <span className="px-3 py-1 bg-amber-50 border border-amber-200/60 text-amber-800 text-xs font-black rounded-xl tracking-widest shadow-inner">
                  {codigoGuardado || divisionInfo?.codigo_acceso || 'METODISTA2026'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold shadow-sm">
                <Shield className="w-5 h-5" />
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Navegación móvil inferior */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-4 py-2 flex justify-around shadow-lg">
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'lessons', label: 'Lecciones', icon: BookOpen },
          { id: 'videos', label: 'Videos', icon: Video },
          { id: 'activities', label: 'Actividades', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition ${isActive ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12">

        {/* ================= SECCIÓN 1: HOME ================= */}
        {activeTab === 'home' && (
          <div className="space-y-10 animate-fade-in">

            {/* AQUÍ APLICAMOS NUESTRO CSS PERSONALIZADO PARA EL HERO */}
            <div className="aula-container">
              <div className="aula-hero">
                <div className="aula-hero-overlay">
                  <div className="aula-hero-content">
                    <span className="aula-code">
                      ACCESO COMPARTIDO: {codigoGuardado || divisionInfo?.codigo_acceso || 'METODISTA2026'}
                    </span>
                    <h1>
                      {divisionInfo?.nombre || 'Escuela Dominical Infantil y Juvenil'}
                    </h1>
                    <p>
                      {divisionInfo?.descripcion || 'Creciendo juntos en el amor de Dios, explorando historias bíblicas de forma divertida y creativa.'}
                    </p>
                    <div className="aula-verse-box">
                      <span className="text-amber-400 font-serif text-xl leading-none">“</span>
                      <p style={{ margin: 0 }}>
                        {divisionInfo?.verse || 'Lámpara es a mis pies tu palabra, y lumbrera a mi camino. - Salmos 119:105'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Lecciones Activas', value: tareas.length || 4, icon: BookOpen, light: 'bg-blue-50 text-blue-700' },
                { label: 'Videos Bíblicos', value: '12+', icon: Video, light: 'bg-amber-50 text-amber-700' },
                { label: 'Actividades', value: '8+', icon: Sparkles, light: 'bg-emerald-50 text-emerald-700' },
                { label: 'Versículos Clave', value: '24', icon: Award, light: 'bg-purple-50 text-purple-700' },
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition">
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-1">{item.label}</p>
                    <p className="text-2xl font-black text-slate-800">{item.value}</p>
                  </div>
                  <div className={`p-3.5 rounded-2xl ${item.light}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                </div>
              ))}
            </div>

            {/* Lección Destacada */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">Destacado de la semana</span>
                  <h3 className="text-2xl font-black text-slate-900">Lección Principal</h3>
                </div>
                <button onClick={() => setActiveTab('lessons')} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Ver todas <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>

              <div className="bg-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/2 space-y-4">
                  <span className="px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 text-xs font-bold uppercase tracking-wider">
                    Escuela Dominical • Ciclo 2026
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                    "El Buen Pastor y las Ovejas: Conociendo Su Voz"
                  </h4>
                  <p className="text-blue-100/90 text-sm leading-relaxed">
                    Una hermosa enseñanza sobre cómo Jesús nos cuida, nos llama por nuestro nombre y nos guía siempre por sendas de justicia.
                  </p>
                </div>

                <div className="w-full md:w-1/2 flex justify-center">
                  <div className="w-full max-w-md aspect-video rounded-2xl overflow-hidden shadow-2xl relative group bg-slate-900 flex items-center justify-center cursor-pointer">
                    <img
                      src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800"
                      alt="Lección Destacada"
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition">
                      <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center shadow-xl transform group-hover:scale-110 transition">
                        <Play className="w-7 h-7 fill-slate-950 text-slate-950 ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================= PESTAÑA: LECCIONES ================= */}
        {activeTab === 'lessons' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-black text-slate-800">Lecciones Disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((_, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800">Lección {idx + 1}</h3>
                  <p className="text-slate-500 text-sm mt-2 mb-4">Aprende sobre las maravillas de Dios.</p>
                  <button className="w-full py-3 bg-blue-50 text-blue-700 font-bold rounded-2xl">
                    Ver Lección
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Otras pestañas resumidas para mantener el código corto y manejable */}
        {activeTab === 'videos' && <div className="animate-fade-in p-6 bg-white rounded-3xl shadow-sm"><h2 className="text-xl font-bold">Videos (Próximamente)</h2></div>}
        {activeTab === 'activities' && <div className="animate-fade-in p-6 bg-white rounded-3xl shadow-sm"><h2 className="text-xl font-bold">Actividades (Próximamente)</h2></div>}
        {activeTab === 'resources' && <div className="animate-fade-in p-6 bg-white rounded-3xl shadow-sm"><h2 className="text-xl font-bold">Recursos (Próximamente)</h2></div>}

      </main>

      {/* ================= MODAL DE ENTREGA ================= */}
      {showEntregaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowEntregaModal(null)}>
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black text-slate-800 mb-4">Entrega de Actividad</h3>
            <form onSubmit={handleSubmitEntregaForm} className="space-y-4">
              <input type="text" placeholder="Tu Nombre" className="w-full px-4 py-3 rounded-2xl border border-slate-200" required />
              <textarea placeholder="Comentario para el maestro" rows="3" className="w-full px-4 py-3 rounded-2xl border border-slate-200"></textarea>
              <input type="file" className="w-full" required />
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowEntregaModal(null)} className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-600 font-bold">Cancelar</button>
                <button type="submit" disabled={entregaLoading} className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white font-bold">{entregaLoading ? 'Enviando...' : 'Enviar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AulaVirtual;