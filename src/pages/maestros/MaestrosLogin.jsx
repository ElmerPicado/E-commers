import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
  ShieldAlert,
  LogIn,
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';

export default function MaestrosLogin() {
  const navigate = useNavigate();
  const [loginMode, setLoginMode] = useState('email'); // 'email' | 'username'
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const switchMode = (mode) => {
    setLoginMode(mode);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const identifier = loginMode === 'email' ? email : username;
    if (!identifier || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setIsLoading(true);

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
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error inesperado al intentar acceder.'
      );
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="theme-imr4"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--bg-default)',
        position: 'relative'
      }}
    >
      {/* Botón Volver (Alineado arriba en el contenedor global) */}
      <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}>
        <button
          onClick={() => navigate('/ministerio/ninos')}
          className="btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          Volver a Niños
        </button>
      </div>

      {/* Tarjeta idéntica al Login de Admin */}
      <div
        className="glass-card animate-fade-in"
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
      >
        {/* Encabezado con Icono Centrado */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              border: '1px solid var(--border-color)'
            }}
          >
            <ShieldAlert size={32} style={{ color: 'var(--accent-color)' }} />
          </div>
          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              marginBottom: '0.25rem',
              color: 'var(--text-primary)'
            }}
          >
            IMR4 Maestros
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Plataforma Educativa · Área Docente
          </p>
        </div>

        {/* Selector de modo de Login (Email / Username) */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '0.25rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border-color)',
            gap: '0.25rem'
          }}
        >
          <button
            type="button"
            onClick={() => switchMode('email')}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '0.375rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              background:
                loginMode === 'email' ? 'var(--accent-color)' : 'transparent',
              color: loginMode === 'email' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            <Mail size={15} />
            Email Auth
          </button>
          <button
            type="button"
            onClick={() => switchMode('username')}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '0.375rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              background:
                loginMode === 'username' ? 'var(--accent-color)' : 'transparent',
              color: loginMode === 'username' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            <User size={15} />
            Admin Local
          </button>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                textAlign: 'center'
              }}
            >
              {error}
            </div>
          )}

          {loginMode === 'email' ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <label
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}
              >
                Correo Electrónico
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maestra@imr4.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <label
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}
              >
                Usuario
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>
          )}

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <label
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-secondary)'
              }}
            >
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 2.75rem 0.75rem 2.75rem',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{
              marginTop: '0.5rem',
              padding: '0.85rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isLoading ? (
              'Verificando...'
            ) : (
              <>
                <LogIn size={18} /> Acceder a la Plataforma
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}