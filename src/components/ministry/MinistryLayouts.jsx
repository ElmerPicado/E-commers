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
        window.location.href = '/aula-virtual';
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

      {/* BOTÓN ÚNICO Y PRINCIPAL PARA NIÑOS / ACCESO */}
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