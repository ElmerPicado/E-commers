import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  LogIn,
  AlertCircle,
  User
} from 'lucide-react';

const MaestrosLogin = () => {
  const navigate = useNavigate();
  const [loginMode, setLoginMode] = useState('email'); // 'email' | 'username'
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const switchMode = (mode) => {
    setLoginMode(mode);
    setErrorMsg(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      let targetEmail = email.trim();

      if (loginMode === 'username') {
        const { data: foundEmail, error: rpcError } = await supabase.rpc(
          'get_email_by_username',
          { p_username: username.trim() }
        );

        if (rpcError || !foundEmail) {
          throw new Error('El usuario ingresado no existe o no está habilitado.');
        }
        targetEmail = foundEmail;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Credenciales incorrectas. Revisa tu contraseña.');
        }
        throw authError;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('teacher_profiles')
          .select('role, full_name')
          .eq('id', data.user.id)
          .single();

        sessionStorage.setItem(
          'teacher_session',
          JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            role: profile?.role || 'maestro',
            name: profile?.full_name || 'Docente'
          })
        );

        if (profile?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/maestros/dashboard');
        }
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error inesperado al intentar acceder.'
      );
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden font-sans text-slate-100">

      {/* Luces de fondo (Efecto Blur Sofisticado) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header superior estructurado */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between z-10">
        <button
          onClick={() => navigate('/ministerio/ninos')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Niños</span>
        </button>
      </header>

      {/* Contenedor Principal (Tarjeta equilibrada) */}
      <main className="flex-1 flex items-center justify-center py-8 z-10">
        <div className="w-full max-w-lg bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 p-8 sm:p-10 rounded-3xl shadow-2xl">

          {/* Logo y Encabezado */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-indigo-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20 border border-purple-400/30">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              IMR4 Maestros
            </h1>
            <p className="text-sm font-normal text-slate-400 mt-1.5">
              Plataforma Educativa · Área Docente
            </p>
          </div>

          {/* Selector de Modo */}
          <div className="mb-6 p-1.5 bg-slate-950/60 rounded-2xl border border-slate-800 flex gap-2">
            <button
              type="button"
              onClick={() => switchMode('email')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${loginMode === 'email'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <Mail className="w-4 h-4" />
              <span>Email Auth</span>
            </button>
            <button
              type="button"
              onClick={() => switchMode('username')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${loginMode === 'username'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <User className="w-4 h-4" />
              <span>Admin Local</span>
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleLogin} className="space-y-5">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {loginMode === 'email' ? (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Correo Electrónico
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maestra@imr4.com"
                    className="w-full h-12 pl-12 pr-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Nombre de Usuario
                </label>
                <div className="relative flex items-center">
                  <User className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full h-12 pl-12 pr-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <Lock className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-12 pr-12 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Verificando...</span>
                </div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Acceder a la Plataforma</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs font-normal text-slate-500 mt-8">
            Acceso exclusivo para el equipo docente autorizado.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs font-normal text-slate-500 z-10">
        IMR4 · Plataforma Educativa
      </footer>
    </div>
  );
};

export default MaestrosLogin;