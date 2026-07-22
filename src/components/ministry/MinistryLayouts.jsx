import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Gamepad2, X, GraduationCap } from 'lucide-react';
import VideosSection from './VideosSection';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

// Modal Aula Virtual (Acceso Grupal Directo por División)
const AulaVirtualModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState('selection');
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleEstudianteSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const code = codigo.toUpperCase().trim();

      // 1. Validar directamente si el código existe en la vista de divisiones públicas
      const { data: division, error: divError } = await supabase
        .from('vw_divisiones_publicas')
        .select('id, nombre, codigo_acceso')
        .eq('codigo_acceso', code)
        .single();

      if (divError || !division) {
        throw new Error('Código de acceso inválido.');
      }

      // 2. Empaquetar los datos de la división para el aula grupal
      const aulaData = {
        division_id: division.id,
        division_nombre: division.nombre,
        division_codigo: division.codigo_acceso
      };

      setSuccess(true);
      console.log("¡Acceso concedido a la división!", aulaData);

      // 3. Guardar la sesión de la división en el navegador
      localStorage.setItem('estudiante_actual', JSON.stringify(aulaData));

      // 4. Redirigir al Aula Virtual
      setTimeout(() => {
        window.location.href = '/aula';
      }, 1000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderSelection = () => (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      <GraduationCap size={64} color="#8A2BE2" style={{ marginBottom: '1.5rem' }} />
      <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#4B0082', marginBottom: '0.5rem' }}>
        🏫 Aula Virtual IMR4
      </h2>
      <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
        ¿Cómo quieres entrar hoy?
      </p>

      {/* BOTÓN ÚNICO Y PRINCIPAL PARA ACCESO */}
      <button
        onClick={() => setStep('estudiante')}
        style={{
          padding: '1.25rem 2rem',
          background: 'linear-gradient(135deg, #1E90FF, #00BFFF)',
          color: '#fff',
          border: 'none',
          borderRadius: '999px',
          fontSize: '1.1rem',
          fontWeight: 900,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          boxShadow: '0 6px 0 #0066CC',
          transition: 'transform 0.1s',
          width: '100%',
          maxWidth: '300px',
          margin: '0 auto 1.5rem auto'
        }}
      >
        <GraduationCap size={24} /> INGRESAR CÓDIGO 🚀
      </button>

      {/* ENLACE DISCRETO EN EL PIE DE PÁGINA */}
      <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
        <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: '0.5rem' }}>
          ¿Perteneces al equipo docente?
        </p>
        <a
          href="/maestros/login"
          style={{
            fontSize: '0.8rem',
            color: '#8A2BE2',
            fontWeight: 700,
            textDecoration: 'underline',
            textUnderlineOffset: '4px'
          }}
        >
          Acceso a Panel de Maestras →
        </a>
      </div>
    </div>
  );

  const renderEstudiante = () => (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      <GraduationCap size={64} color="#1E90FF" style={{ marginBottom: '1.5rem' }} />
      <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1E90FF', marginBottom: '0.5rem' }}>
        🎒 Ingresar al Aula
      </h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Ingresa el código de acceso de tu división
      </p>
      <form onSubmit={handleEstudianteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '320px', margin: '0 auto' }}>
        <input
          type="text"
          value={codigo}
          onChange={e => setCodigo(e.target.value.toUpperCase())}
          placeholder="CÓDIGO-ACCESO"
          style={{
            padding: '1rem 1.5rem',
            fontSize: '1.1rem',
            fontWeight: 700,
            textAlign: 'center',
            letterSpacing: '0.1em',
            border: '3px solid #1E90FF',
            borderRadius: '1rem',
            background: '#fff',
            color: '#333',
            textTransform: 'uppercase'
          }}
          maxLength={30}
          required
          disabled={loading}
        />
        {error && <p style={{ color: '#FF4500', fontSize: '0.9rem', fontWeight: 700 }}>{error}</p>}
        {success && <p style={{ color: '#32CD32', fontSize: '0.9rem', fontWeight: 700 }}>✅ ¡Código válido! Redirigiendo...</p>}
        <button
          type="submit"
          disabled={loading || success}
          style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, #1E90FF, #00BFFF)',
            color: '#fff',
            border: 'none',
            borderRadius: '999px',
            fontSize: '1.1rem',
            fontWeight: 900,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 5px 0 #0066CC',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Verificando...' : 'Entrar al Aula 🚀'}
        </button>
      </form>
      <button
        onClick={() => { setStep('selection'); setCodigo(''); setError(''); }}
        style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#888', fontSize: '0.9rem', cursor: 'pointer' }}
      >
        ← Volver a opciones
      </button>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <div
        className="w-[92vw] max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-6 bg-white shadow-2xl relative"
        style={{ animation: 'slideUp 0.3s ease-out' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100 border-none cursor-pointer flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
        >
          <X size={24} />
        </button>

        {step === 'selection' && renderSelection()}
        {step === 'estudiante' && renderEstudiante()}

        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </div>
  );
};

export const PlayfulLayout = ({
  ministry,
  ministryActivities,
  ministryAlbums,
  customThemeVars,
  getThemeClass,
  setSelectedActivity,
  setSelectedAlbum,
  setLightboxIndex
}) => {
  const [showAulaVirtual, setShowAulaVirtual] = useState(false);

  return (
    <div className={getThemeClass(ministry)} style={{ ...customThemeVars, minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}>

      {ministry.hero_image ? (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '75vh', backgroundImage: `url("${ministry.hero_image}")`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, #90EE90 100%)' }}></div>
        </div>
      ) : (
        <div>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60vh', background: 'linear-gradient(to bottom, #87CEEB, #E0F6FF)', zIndex: 0 }}>
            <div style={{ position: 'absolute', top: '10%', left: '10%', width: '120px', height: '40px', background: '#fff', borderRadius: '50px', opacity: 0.8, filter: 'blur(2px)' }}></div>
            <div style={{ position: 'absolute', top: '20%', right: '15%', width: '160px', height: '50px', background: '#fff', borderRadius: '50px', opacity: 0.9, filter: 'blur(2px)' }}></div>
          </div>
          <div style={{ position: 'absolute', top: '55vh', left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, #90EE90, #32CD32)', zIndex: 0 }}></div>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem', minHeight: '75vh', justifyContent: 'flex-end', paddingBottom: '10vh' }}>
        <div>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.85)', padding: '2rem', borderRadius: '3rem', border: '4px dashed var(--accent-color)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxWidth: '800px', width: '100%', marginTop: '2rem' }}>
            {ministry.logo_url && (
              <img src={ministry.logo_url} alt="Logo" style={{ width: '150px', height: '150px', objectFit: 'contain', marginBottom: '1rem', filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.2))' }} />
            )}
            <h1 style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', fontWeight: 900, color: 'var(--accent-color)', textShadow: '2px 2px 0px #fff, 4px 4px 0px rgba(0,0,0,0.1)', lineHeight: 1.1, marginBottom: '1rem' }}>
              {ministry.hero_title || `¡Bienvenidos a ${ministry.name}!`}
            </h1>
            <p style={{ fontSize: 'clamp(1rem, 4vw, 1.2rem)', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '2rem' }}>
              {ministry.hero_desc}
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={ministry.visual_settings?.primary_action_url || "#"} className="btn" style={{ background: 'var(--accent-color)', color: '#fff', fontSize: 'clamp(1rem, 4vw, 1.2rem)', padding: '0.8rem 1.5rem', borderRadius: '999px', border: 'none', boxShadow: '0 8px 0px rgba(0,0,0,0.2)', transform: 'translateY(-4px)', transition: 'all 0.1s', fontWeight: 900 }}>
                {ministry.visual_settings?.primary_action_text || "¡Quiero Participar!"}
              </a>
              <Link to="/ninos/juegos" className="btn" style={{ background: '#3b82f6', color: '#fff', fontSize: 'clamp(1rem, 4vw, 1.2rem)', padding: '0.8rem 1.5rem', borderRadius: '999px', border: 'none', boxShadow: '0 8px 0px rgba(0,0,0,0.2)', transform: 'translateY(-4px)', transition: 'all 0.1s', fontWeight: 900, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                ¡A Jugar! <Gamepad2 size={20} style={{ display: 'inline', marginLeft: '5px' }} />
              </Link>
              <button
                onClick={() => setShowAulaVirtual(true)}
                className="btn"
                style={{ background: 'linear-gradient(135deg, #8A2BE2, #1E90FF)', color: '#fff', fontSize: 'clamp(1rem, 4vw, 1.2rem)', padding: '0.8rem 1.5rem', borderRadius: '999px', border: 'none', boxShadow: '0 8px 0px rgba(30,144,255,0.5)', transform: 'translateY(-4px)', transition: 'all 0.1s', fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <GraduationCap size={20} style={{ display: 'inline', marginLeft: '5px' }} /> Aula Virtual
              </button>
            </div>
          </div>

          {(ministry.schedule || ministry.location) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', width: '100%', maxWidth: '900px', boxSizing: 'border-box', marginTop: '1.5rem' }}>
              <div style={{ flex: '1 1 280px', background: '#FFD700', padding: '1.5rem', borderRadius: '2rem', border: '4px solid #FFA500', textAlign: 'center', boxShadow: '0 8px 15px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#B8860B', marginBottom: '0.5rem' }}>¿Cuándo nos vemos?</h3>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#000' }}>{ministry.schedule}</p>
              </div>
              <div style={{ flex: '1 1 280px', background: '#FF69B4', padding: '1.5rem', borderRadius: '2rem', border: '4px solid #C71585', textAlign: 'center', boxShadow: '0 8px 15px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#8B008B', marginBottom: '0.5rem' }}>¿Dónde estamos?</h3>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{ministry.location}</p>
              </div>
            </div>
          )}

          <section id="videos" style={{ width: '100%', maxWidth: '1000px', marginTop: '2rem' }}>
            <VideosSection ministry={ministry} />
          </section>

          {ministryActivities && ministryActivities.length > 0 && (
            <section style={{ padding: '3rem 1.5rem', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FF1493', textAlign: 'center', marginBottom: '2rem', textShadow: '2px 2px 0px #FFF, 4px 4px 0px rgba(0,0,0,0.1)' }}>
                🌟 ¡Nuestras Actividades! 🌟
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
                {ministryActivities.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => setSelectedActivity(act)}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    style={{
                      width: '100%',
                      maxWidth: '320px',
                      background: '#FFF',
                      borderRadius: '2rem',
                      overflow: 'hidden',
                      border: '4px solid #32CD32',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      transform: 'scale(1)'
                    }}
                  >
                    {act.image_url ? (
                      <div style={{ height: '200px', width: '100%', background: '#f0f0f0' }}>
                        <img src={act.image_url} alt={act.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div style={{ height: '150px', background: '#32CD32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={60} color="#fff" />
                      </div>
                    )}
                    <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                      <div style={{ background: '#FFD700', color: '#8B4500', display: 'inline-block', padding: '0.25rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 800, marginBottom: '1rem', border: '2px solid #DAA520' }}>
                        {new Date(act.date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </div>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#228B22', marginBottom: '0.5rem', lineHeight: 1.2 }}>{act.title}</h3>
                      <p style={{ color: '#666', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {showAulaVirtual && (
        <AulaVirtualModal isOpen={showAulaVirtual} onClose={() => setShowAulaVirtual(false)} />
      )}
    </div>
  );
};

export const SoftLayout = ({
  ministry,
  ministryActivities,
  customThemeVars,
  getThemeClass
}) => {
  return (
    <div className={getThemeClass(ministry)} style={{ ...customThemeVars, minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', fontFamily: '"Poppins", "Segoe UI", sans-serif' }}>
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '50%', height: '50%', background: 'var(--accent-color)', filter: 'blur(120px)', opacity: 0.2, zIndex: 0, pointerEvents: 'none', borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '45%', height: '45%', background: 'var(--accent-color)', filter: 'blur(120px)', opacity: 0.15, zIndex: 0, pointerEvents: 'none', borderRadius: '50%' }}></div>

      <section style={{ position: 'relative', zIndex: 1, padding: '5rem 1.5rem 4rem', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {ministry.logo_url && (
            <img src={ministry.logo_url} alt={ministry.name} style={{ width: '90px', height: '90px', objectFit: 'contain', marginBottom: '1.5rem', borderRadius: '50%', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }} />
          )}
          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 3.2rem)', fontWeight: 700, color: 'var(--accent-color)', marginBottom: '1rem', lineHeight: 1.2 }}>
            {ministry.hero_title || `Bienvenida a ${ministry.name}`}
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto 2rem' }}>
            {ministry.hero_desc}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={ministry.visual_settings?.primary_action_url || "#contacto"} className="btn btn-primary" style={{ background: 'var(--accent-color)', color: '#fff', padding: '0.9rem 2rem', borderRadius: '999px', border: 'none', fontSize: '1rem', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
              {ministry.visual_settings?.primary_action_text || 'Participar'}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};