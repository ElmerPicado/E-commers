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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden font-sans">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <header className="max-w-6xl mx-auto w-full pt-2 z-10">
        <button
          onClick={() => navigate('/ministerio/ninos')}
          className="text-slate-400 hover:text-white text-sm font-semibold inline-flex items-center gap-2 transition-all duration-200 bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Niños</span>
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center py-10 z-10">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-slate-800/80 p-8 sm:p-10 rounded-3xl shadow-2xl relative">

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-indigo-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20 border border-purple-400/30">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              IMR4 Maestros
            </h1>
            <p className="text-sm font-medium text-slate-400 mt-1">
              Plataforma Educativa · Área Docente
            </p>
          </div>

          <div className="mb-6 flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={() => switchMode('email')}
              className={`flex-1 min-w-[140px] px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${loginMode === 'email'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Email Auth</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => switchMode('username')}
              className={`flex-1 min-w-[140px] px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${loginMode === 'username'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <User className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Admin Local</span>
              </div>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {loginMode === 'email' ? (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Correo Electrónico
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 z-10 pointer-events-none text-slate-500 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maestra@imr4.com"
                    autoComplete="off"
                    data-1p-ignore
                    data-lpignore="true"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm font-medium"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Nombre de Usuario
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 z-10 pointer-events-none text-slate-500 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    autoComplete="off"
                    data-1p-ignore
                    data-lpignore="true"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm font-medium"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 z-10 pointer-events-none text-slate-500 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  data-1p-ignore
                  data-lpignore="true"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 z-10 text-slate-500 hover:text-slate-300 p-1 flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50 border-b-2 border-indigo-800"
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
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>Acceder a la Plataforma</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs font-medium text-slate-500 mt-6">
            Acceso exclusivo para el equipo docente autorizado.
          </p>
        </div>
      </main>

      <footer className="text-center py-2 text-xs font-medium text-slate-600 z-10">
        IMR4 · Plataforma Educativa
      </footer>
    </div>
  );
};

export default MaestrosLogin;