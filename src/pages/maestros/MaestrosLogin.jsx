import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, LogIn } from 'lucide-react';

const MaestrosLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;

      // Verificar que es maestro
      const { data: perfil, error: perfilError } = await supabase
        .from('maestro_users')
        .select('role, activo')
        .eq('id', data.user.id)
        .single();

      if (perfilError || !perfil) {
        await supabase.auth.signOut();
        throw new Error('No tienes acceso a la plataforma de maestros');
      }

      if (!perfil.activo) {
        await supabase.auth.signOut();
        throw new Error('Tu cuenta está desactivada. Contacta al administrador');
      }

      if (!['maestro', 'maestro_lider', 'admin_maestros'].includes(perfil.role)) {
        await supabase.auth.signOut();
        throw new Error('Rol no autorizado');
      }

      setTimeout(() => {
        navigate('/maestros');
      }, 800);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 relative overflow-hidden">
      {/* Glow de fondo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header simple con botón volver */}
      <header className="max-w-7xl mx-auto w-full pt-4 z-10">
        <button
          onClick={() => navigate('/ministerio/ninos')}
          className="text-slate-400 hover:text-white text-sm font-medium inline-flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Niños
        </button>
      </header>

      {/* Card Formulario */}
      <main className="flex-1 flex items-center justify-center py-12 z-10">
        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl">
          
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              IMR4 Maestros
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Plataforma Educativa · Área de Maestras
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Campo Correo */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maestra@imr4.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-sm"
                  required
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botón Acceder */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/25 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Ingresando...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Acceder a la Plataforma</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            Acceso exclusivo para equipo docente autorizado.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-600 z-10">
        IMR4 · Plataforma Educativa
      </footer>
    </div>
  );
};

export default MaestrosLogin;