import './AulaVirtual.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
  BookOpen, Video, FileText, CheckCircle, Clock, AlertCircle,
  ArrowLeft, Upload, Eye, Star, Target, MessageSquare, GraduationCap,
  Home, Compass, Award, Bookmark, Heart, Sparkles, Play, Shield, Users
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
  const [activeFilter, setActiveFilter] = useState('all');
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
          banner_img: sessionData.banner_img || 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&q=80&w=1200',
          theme_color: sessionData.theme_color || '#1e40af', // Blue principal
          verse: sessionData.verse || '"Lámpara es a mis pies tu palabra, y lumbrera a mi camino." - Salmos 119:105'
        });

        const { data: tareasData, error: tareasError } = await supabase.rpc('obtener_tareas_division', {
          p_division_id: sessionData.division_id,
        });

        if (tareasError) throw tareasError;
        setTareas(tareasData || []);

      } catch (err) {
        console.error('Error al cargar la información:', err);
        // Fallback de datos para demostración visual si la tabla/rpc falla
        setDivisionInfo({
          nombre: 'Escuela Dominical Infantil y Juvenil',
          descripcion: 'Creciendo juntos en el amor de Dios, explorando historias bíblicas de forma divertida y creativa.',
          codigo_acceso: codigoGuardado || 'METODISTA2026',
          banner_img: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&q=80&w=1200',
          theme_color: '#1e40af',
          verse: '"Dejen a los niños venir a mí, y no se lo impidan, porque el reino de los cielos es de quienes son como ellos." - Mateo 19:14'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDivisionYTareas();
  }, [codigoGuardado]);

  const handleEntregar = async (formData) => {
    setEntregaLoading(true);
    // Simulación de entrega exitosa para el flujo sin cuentas tradicionales
    setTimeout(() => {
      setEntregaLoading(false);
      setShowEntregaModal(null);
      alert('¡Tarea entregada con éxito a tu maestro!');
    }, 1000);
  };

  const handleSubmitEntregaForm = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    handleEntregar(formData);
  };

  const filteredTareas = tareas.filter(t =>
    activeFilter === 'all' || t.estado === activeFilter
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-900">

      {/* 🌟 Barra de Navegación Estilo Duolingo / Netflix / Iglesia */}
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
                <h1 className="text-lg font-black text-slate-900 leading-tight">
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

            {/* Badge de Código de Acceso (Sin login tradicional) */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Código de Acceso</span>
                <span className="px-3 py-1 bg-amber-50 border border-amber-200/60 text-amber-800 text-xs font-black rounded-xl tracking-widest shadow-inner">
                  {codigoGuardado || divisionInfo?.codigo_acceso || 'METODISTA'}
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
          { id: 'resources', label: 'Recursos', icon: Bookmark },
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

            {/* Hero Banner Personalizable */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 min-h-[380px] flex items-end border border-slate-800">
              <div className="absolute inset-0">
                <img
                  src={divisionInfo?.banner_img || "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&q=80&w=1200"}
                  alt="Banner Aula Virtual"
                  className="w-full h-full object-cover object-center opacity-40 scale-105 transform hover:scale-100 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
              </div>

              <div className="relative z-10 p-6 sm:p-10 lg:p-12 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-2xl space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-extrabold tracking-wide uppercase backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Iglesia Metodista • Educación Cristiana
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                    {divisionInfo?.nombre || 'Clase Bíblica'}
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
                    {divisionInfo?.descripcion || 'Un espacio cálido y seguro para aprender de la palabra de Dios en comunidad.'}
                  </p>

                  {/* Versículo Bíblico Semanal */}
                  <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-sm italic font-medium flex items-start gap-3 shadow-inner">
                    <span className="text-amber-400 font-serif text-xl leading-none">“</span>
                    <p>{divisionInfo?.verse || '"Lámpara es a mis pies tu palabra..." - Salmos 119:105'}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 shrink-0">
                  <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                    <span className="block text-[10px] uppercase tracking-wider text-slate-300 font-bold mb-1">Acceso Compartido</span>
                    <span className="text-lg font-black text-amber-300 tracking-wider">
                      {codigoGuardado || divisionInfo?.codigo_acceso || 'METODISTA'}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('lessons')}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-600/30 transition transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Explorar Lecciones</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            </div>

            {/* Estadísticas / Indicadores amigables (Sin ERP ni dashboards corporativos) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Lecciones Activas', value: tareas.length || 4, icon: BookOpen, color: 'from-blue-500 to-blue-600', light: 'bg-blue-50 text-blue-700' },
                { label: 'Videos Bíblicos', value: '12+', icon: Video, color: 'from-amber-500 to-amber-600', light: 'bg-amber-50 text-amber-700' },
                { label: 'Actividades', value: '8+', icon: Sparkles, color: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50 text-emerald-700' },
                { label: 'Versículos Clave', value: '24', icon: Award, color: 'from-purple-500 to-purple-600', light: 'bg-purple-50 text-purple-700' },
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

            {/* ================= SECCIÓN 2: FEATURED LESSON ================= */}
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

              <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8 border border-blue-700/50">
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="w-full md:w-1/2 space-y-4 relative z-10">
                  <span className="px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 text-xs font-bold uppercase tracking-wider">
                    Escuela Dominical • Ciclo 2026
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                    "El Buen Pastor y las Ovejas: Conociendo Su Voz"
                  </h4>
                  <p className="text-blue-100/90 text-sm leading-relaxed">
                    Una hermosa enseñanza sobre cómo Jesús nos cuida, nos llama por nuestro nombre y nos guía siempre por sendas de justicia y amor verdadero.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <span className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" /> 45 minutos
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-300" /> Juan 10:11-15
                    </span>
                  </div>
                </div>

                <div className="w-full md:w-1/2 flex justify-center relative z-10">
                  <div className="w-full max-w-md aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 relative group cursor-pointer bg-slate-900 flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800"
                      alt="Lección Destacada"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition">
                      <div className="w-16 h-16 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xl transform group-hover:scale-110 transition">
                        <Play className="w-7 h-7 fill-slate-950 ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ================= SECCIÓN 3: RECOMMENDED VIDEO ================= */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">Multimedia</span>
                  <h3 className="text-2xl font-black text-slate-900">Video Recomendado</h3>
                </div>
                <button onClick={() => setActiveTab('videos')} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Biblioteca de videos <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: 'Historia de David y Goliat Animada', desc: 'Descubre cómo la fe en Dios vence cualquier gigante.', duration: '12 min', tag: 'Niños y Jóvenes', img: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=600' },
                  { title: 'El Sermón del Monte Explicado', desc: 'Principios prácticos para vivir el amor cristiano hoy.', duration: '18 min', tag: 'Juvenil / Adultos', img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600' },
                  { title: 'Cantos de Alabanza Infantil', desc: '¡Canta y baila con alegría para honrar a nuestro Creador!', duration: '15 min', tag: 'Familia', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600' },
                ].map((vid, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                    <div>
                      <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-slate-100">
                        <img src={vid.img} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold">
                          {vid.tag}
                        </div>
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg">
                            <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-800 text-base mb-1 group-hover:text-blue-600 transition">{vid.title}</h4>
                      <p className="text-slate-500 text-xs line-clamp-2">{vid.desc}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-bold">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500" /> {vid.duration}</span>
                      <span className="text-blue-600 group-hover:underline">Ver video →</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ================= SECCIÓN 4: ACTIVITIES SECTION ================= */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">Interactivo y Divertido</span>
                  <h3 className="text-2xl font-black text-slate-900">Actividades y Tareas de la Clase</h3>
                </div>
                <button onClick={() => setActiveTab('activities')} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Ver todas <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tareas.slice(0, 4).map((tarea) => (
                  <div key={tarea.tarea_id || Math.random()} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider">
                          Actividad Bíblica
                        </span>
                        <span className="text-xs font-bold text-slate-400">Semana en curso</span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-800">{tarea.tarea_titulo || 'Memorización del Versículo Clave'}</h4>
                      <p className="text-slate-500 text-sm">{tarea.tarea_descripcion || 'Completa la actividad en casa y compártela con tu grupo.'}</p>
                    </div>
                    <button
                      onClick={() => setShowEntregaModal(tarea)}
                      className="shrink-0 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
                    >
                      <Upload className="w-4 h-4" /> Entregar
                    </button>
                  </div>
                ))}
                {tareas.length === 0 && (
                  <>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-black uppercase tracking-wider">Manualidad</span>
                        <h4 className="text-lg font-bold text-slate-800">Creando un Mural de Promesas</h4>
                        <p className="text-slate-500 text-sm">Dibuja tu versículo favorito y tráelo decorado al próximo encuentro.</p>
                      </div>
                      <button onClick={() => alert('¡Listo para participar!')} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md transition shrink-0">
                        Participar
                      </button>
                    </div>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider">Trivia Bíblica</span>
                        <h4 className="text-lg font-bold text-slate-800">Quiz: Los Viajes del Apóstol Pablo</h4>
                        <p className="text-slate-500 text-sm">Pon a prueba lo que aprendimos en la lección dominical.</p>
                      </div>
                      <button onClick={() => alert('¡Iniciando trivia!')} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md transition shrink-0">
                        Comenzar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* ================= SECCIÓN 5: RESOURCE LIBRARY ================= */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-purple-600 uppercase tracking-wider">Material de Apoyo</span>
                  <h3 className="text-2xl font-black text-slate-900">Biblioteca de Recursos</h3>
                </div>
                <button onClick={() => setActiveTab('resources')} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Ver todo <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: 'Guía para Padres y Maestros', type: 'PDF • 2.4 MB', icon: FileText, color: 'bg-amber-50 text-amber-600' },
                  { title: 'Hojas para Colorear y Memorizar', type: 'PDF • 5.1 MB', icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
                  { title: 'Himnario Metodista Juvenil', type: 'Audio / Letras', icon: Sparkles, color: 'bg-purple-50 text-purple-600' },
                  { title: 'Calendario de Actividades 2026', type: 'PDF • 1.2 MB', icon: Bookmark, color: 'bg-emerald-50 text-emerald-600' },
                ].map((res, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition flex flex-col justify-between gap-4 group cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-2xl ${res.color}`}>
                        <res.icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Descargable</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition mb-1">{res.title}</h4>
                      <p className="text-slate-400 text-xs font-medium">{res.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

        {/* ================= PESTAÑA: LECCIONES ================= */}
        {activeTab === 'lessons' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 text-white shadow-lg">
              <h2 className="text-3xl font-black mb-2">Lecciones Bíblicas</h2>
              <p className="text-blue-100 text-sm max-w-xl">
                Explora todas las lecciones diseñadas para nutrir la fe de niños, jóvenes y familias en nuestra comunidad metodista.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'La Creación y el Amor de Dios', desc: 'Génesis 1 y 2 • El maravilloso diseño del universo.', duration: '40 min', status: 'Disponible' },
                { title: 'Noé y el Arca de la Fe', desc: 'Génesis 6-9 • Confiar en Dios en tiempos difíciles.', duration: '45 min', status: 'Disponible' },
                { title: 'El Buen Samaritano', desc: 'Lucas 10:25-37 • El verdadero significado del prójimo.', duration: '35 min', status: 'Disponible' },
                { title: 'David y Goliat', desc: '1 Samuel 17 • Venciendo gigantes con la ayuda del Señor.', duration: '50 min', status: 'Disponible' },
                { title: 'El Nacimiento de Jesús', desc: 'Lucas 2 • La gran luz que alumbró al mundo.', duration: '45 min', status: 'Disponible' },
                { title: 'La Parábola del Hijo Pródigo', desc: 'Lucas 15:11-32 • El perdón y el amor incondicional del Padre.', duration: '40 min', status: 'Disponible' },
              ].map((lesson, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider">
                        Lección {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" /> {lesson.duration}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{lesson.title}</h3>
                    <p className="text-slate-500 text-sm">{lesson.desc}</p>
                  </div>
                  <button onClick={() => alert(`Abriendo: ${lesson.title}`)} className="w-full py-3 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold rounded-2xl transition text-sm flex items-center justify-center gap-2">
                    <BookOpen className="w-4 h-4" /> Ver Lección Completa
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= PESTAÑA: VIDEOS ================= */}
        {activeTab === 'videos' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-3xl p-8 text-white shadow-lg">
              <h2 className="text-3xl font-black mb-2">Videos y Multimedia</h2>
              <p className="text-amber-100 text-sm max-w-xl">
                Disfruta de historias animadas, reflexiones juveniles, alabanzas y cápsulas educativas para toda la familia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'La Creación Animada', duration: '14 min', category: 'Niños' },
                { title: 'El Arca de Noé', duration: '20 min', category: 'Niños' },
                { title: 'José en Egipto', duration: '25 min', category: 'Juvenil' },
                { title: 'El Sermón del Monte', duration: '18 min', category: 'General' },
                { title: 'Canciones de Escuela Dominical', duration: '30 min', category: 'Familia' },
                { title: 'Historias del Nuevo Testamento', duration: '22 min', category: 'Juvenil' },
              ].map((v, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 hover:shadow-xl transition group">
                  <div className="relative aspect-video rounded-2xl bg-slate-900 overflow-hidden mb-4 flex items-center justify-center">
                    <img src={`https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600&t=${idx}`} alt={v.title} className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition duration-500" />
                    <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-full">
                      {v.category}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                        <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-blue-600 transition">{v.title}</h3>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500" /> {v.duration}</span>
                    <span className="text-blue-600">Reproducir ahora</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= PESTAÑA: ACTIVIDADES ================= */}
        {activeTab === 'activities' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-lg">
              <h2 className="text-3xl font-black mb-2">Actividades y Tareas</h2>
              <p className="text-emerald-100 text-sm max-w-xl">
                Participa enviando tus tareas, dibujos o manualidades utilizando el código de acceso de tu clase.
              </p>
            </div>

            <div className="space-y-4">
              {tareas.map(tarea => (
                <div key={tarea.tarea_id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition">
                  <div className="space-y-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black uppercase rounded-full">
                      {tarea.tarea_tipo || 'Actividad'}
                    </span>
                    <h3 className="text-xl font-bold text-slate-800">{tarea.tarea_titulo}</h3>
                    <p className="text-slate-500 text-sm">{tarea.tarea_descripcion || 'Sin descripción adicional.'}</p>
                  </div>
                  <button
                    onClick={() => setShowEntregaModal(tarea)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 shrink-0"
                  >
                    <Upload className="w-4 h-4" /> Entregar Actividad
                  </button>
                </div>
              ))}
              {tareas.length === 0 && (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                  <Sparkles className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-800 mb-1">¡Todo al día!</h3>
                  <p className="text-slate-500 text-sm">No hay entregas pendientes en este momento. Consulta las lecciones anteriores.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= PESTAÑA: RECURSOS ================= */}
        {activeTab === 'resources' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-3xl p-8 text-white shadow-lg">
              <h2 className="text-3xl font-black mb-2">Biblioteca de Recursos</h2>
              <p className="text-purple-100 text-sm max-w-xl">
                Descarga hojas de trabajo, himnos, manuales metodistas y guías familiares en formato digital.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Guía de Estudio Bíblico Familiar', desc: 'Material semanal para reflexionar en casa con los hijos.', format: 'PDF • 3.2 MB' },
                { title: 'Cuaderno de Colorear Histórico', desc: 'Ilustraciones de personajes bíblicos para los más pequeños.', format: 'PDF • 8.5 MB' },
                { title: 'Himnario Metodista Tradicional', desc: 'Selección de cantos sagrados y de avivamiento.', format: 'PDF / Audio' },
                { title: 'Devocional Juvenil 2026', desc: 'Lecturas diarias enfocadas en jóvenes con propósito.', format: 'PDF • 4.1 MB' },
                { title: 'Manual para Líderes de Escuela Dominical', desc: 'Herramientas pedagógicas para la enseñanza cristiana.', format: 'PDF • 2.8 MB' },
                { title: 'Mapas de Tierras Bíblicas', desc: 'Cartografía histórica para comprender mejor las escrituras.', format: 'PDF • 5.0 MB' },
              ].map((res, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition flex flex-col justify-between gap-6">
                  <div className="space-y-2">
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-black uppercase rounded-full">
                      {res.format}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800">{res.title}</h3>
                    <p className="text-slate-500 text-sm">{res.desc}</p>
                  </div>
                  <button onClick={() => alert(`Descargando: ${res.title}`)} className="w-full py-3 bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 font-bold rounded-2xl transition text-sm flex items-center justify-center gap-2">
                    <Bookmark className="w-4 h-4" /> Descargar Recurso
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ================= MODAL DE ENTREGA DE TAREA ================= */}
      {showEntregaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowEntregaModal(null)}>
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Entrega de Actividad</span>
                <h3 className="text-xl font-black text-slate-800">{showEntregaModal.tarea_titulo}</h3>
              </div>
              <button onClick={() => setShowEntregaModal(null)} className="w-10 h-10 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmitEntregaForm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tu Nombre o Nombre de Familia</label>
                <input
                  type="text"
                  name="nombre_estudiante"
                  required
                  placeholder="Ej. Familia Pérez / Juanito"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Comentario o Nota para el Maestro</label>
                <textarea
                  name="comentario"
                  rows="3"
                  placeholder="Escribe un mensaje breve sobre tu trabajo..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subir Archivo o Foto de la Tarea</label>
                <input
                  type="file"
                  name="file"
                  required
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowEntregaModal(null)} className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm transition">
                  Cancelar
                </button>
                <button type="submit" disabled={entregaLoading} className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition flex items-center gap-2">
                  {entregaLoading ? 'Enviando...' : 'Enviar Tarea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AulaVirtual;