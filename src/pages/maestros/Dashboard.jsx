import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import './Dashboard.css';
import {
  PlusCircle, BookOpen, Users, Settings, Trash2, Edit3, Save, X, Shield, ArrowLeft, CheckCircle, AlertCircle, Calendar, Key
} from 'lucide-react';

const SistemaEscolar = () => {
  const navigate = useNavigate();

  // Estados principales
  const [divisiones, setDivisiones] = useState([]);
  const [maestros, setMaestros] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('divisiones'); // 'divisiones' o 'general'

  // Estados para el modal de crear/editar división
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    codigo_acceso: '',
    orden: 1
  });

  // Nuevos estados para Modales y Acciones Avanzadas (Maestros, Cronogramas, Vistas Previas)
  const [isModalMaestroOpen, setIsModalMaestroOpen] = useState(false);
  const [isModalAsignarOpen, setIsModalAsignarOpen] = useState(false);
  const [modalDetalleTipo, setModalDetalleTipo] = useState(null); // 'maestros', 'divisiones', 'clases'

  // Formulario Maestro
  const [nombreMaestro, setNombreMaestro] = useState('');
  const [ministerioMaestro, setMinisterioMaestro] = useState('');
  const [emailMaestro, setEmailMaestro] = useState('');
  const [telefonoMaestro, setTelefonoMaestro] = useState('');
  const [passwordVisible, setPasswordVisible] = useState('');

  // Formulario Asignación con Cronograma
  const [selectedMaestro, setSelectedMaestro] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [materia, setMateria] = useState('');
  const [horario, setHorario] = useState('');
  const [aula, setAula] = useState('');
  const [codigoVirtual, setCodigoVirtual] = useState('');
  const [fechasCronograma, setFechasCronograma] = useState('');

  const [mensajeFeedback, setMensajeFeedback] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    fetchDatosGenerales();
  }, []);

  // 1. Obtener todas las divisiones, maestros y asignaciones de Supabase
  const fetchDatosGenerales = async () => {
    try {
      setLoading(true);

      const [{ data: divData }, { data: mData }, { data: aData }] = await Promise.all([
        supabase.from('divisiones').select('*').order('orden', { ascending: true }),
        supabase.from('maestro_users').select('*'),
        supabase.from('asignaciones').select('*, maestro_users(nombre, email), divisiones(nombre)')
      ]);

      setDivisiones(divData || []);
      setMaestros(mData || []);
      setAsignaciones(aData || []);
    } catch (error) {
      console.error('Error al cargar datos:', error.message);
      mostrarAlerta('error', 'No se pudieron cargar los datos del sistema.');
    } finally {
      setLoading(false);
    }
  };

  const mostrarAlerta = (tipo, texto) => {
    setMensajeFeedback({ tipo, texto });
    setTimeout(() => {
      setMensajeFeedback({ tipo: '', texto: '' });
    }, 4000);
  };

  // Manejar cambios en el formulario de divisiones
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ nombre: '', descripcion: '', codigo_acceso: '', orden: divisiones.length + 1 });
    setShowModal(true);
  };

  const handleOpenEdit = (div) => {
    setEditingId(div.id);
    setFormData({
      nombre: div.nombre || '',
      descripcion: div.descripcion || '',
      codigo_acceso: div.codigo_acceso || '',
      orden: div.orden || 1
    });
    setShowModal(true);
  };

  // 2. Guardar o Actualizar División en Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.codigo_acceso) {
      mostrarAlerta('error', 'El nombre y el código de acceso son obligatorios.');
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('divisiones')
          .update({
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            codigo_acceso: formData.codigo_acceso.toUpperCase().trim(),
            orden: parseInt(formData.orden) || 1
          })
          .eq('id', editingId);

        if (error) throw error;
        mostrarAlerta('success', '¡División actualizada correctamente!');
      } else {
        const { error } = await supabase
          .from('divisiones')
          .insert([{
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            codigo_acceso: formData.codigo_acceso.toUpperCase().trim(),
            orden: parseInt(formData.orden) || 1
          }]);

        if (error) throw error;
        mostrarAlerta('success', '¡Nueva aula/división creada con éxito!');
      }

      setShowModal(false);
      fetchDatosGenerales();
    } catch (error) {
      console.error('Error al guardar:', error.message);
      mostrarAlerta('error', `Error al guardar: ${error.message}`);
    }
  };

  // 3. Guardar Nuevo Maestro con Contraseña Visible y Auth
  const handleGuardarMaestro = async (e) => {
    e.preventDefault();
    const passwordGen = passwordVisible || Math.random().toString(36).slice(-8);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailMaestro,
        password: passwordGen,
      });

      if (authError) throw authError;

      const userId = authData.user?.id;

      const { error: dbError } = await supabase.from('maestro_users').insert([
        {
          id: userId,
          nombre: nombreMaestro,
          email: emailMaestro,
          ministerio: ministerioMaestro,
          telefono: telefonoMaestro,
          password_visible: passwordGen
        }
      ]);

      if (dbError) throw dbError;

      mostrarAlerta('success', `¡Maestro registrado! Contraseña: ${passwordGen}`);
      setIsModalMaestroOpen(false);
      setNombreMaestro(''); setEmailMaestro(''); setMinisterioMaestro(''); setTelefonoMaestro(''); setPasswordVisible('');
      fetchDatosGenerales();
    } catch (error) {
      console.error('Error al registrar maestro:', error.message);
      mostrarAlerta('error', `Error: ${error.message}`);
    }
  };

  // 4. Guardar Asignación / Cronograma con múltiples fechas
  const handleGuardarAsignacion = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('asignaciones').insert([
        {
          maestro_id: selectedMaestro,
          division_id: selectedDivision,
          materia,
          horario,
          aula,
          codigo_virtual: codigoVirtual,
          fechas_cronograma: fechasCronograma
        }
      ]);

      if (error) throw error;

      mostrarAlerta('success', '¡Cronograma de clases asignado con éxito!');
      setIsModalAsignarOpen(false);
      setSelectedMaestro(''); setSelectedDivision(''); setMateria(''); setHorario(''); setAula(''); setCodigoVirtual(''); setFechasCronograma('');
      fetchDatosGenerales();
    } catch (error) {
      console.error('Error al asignar cronograma:', error.message);
      mostrarAlerta('error', `Error al asignar: ${error.message}`);
    }
  };

  // 5. Eliminar División
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta división? Los alumnos vinculados a este código ya no podrán ingresar.')) return;

    try {
      const { error } = await supabase
        .from('divisiones')
        .delete()
        .eq('id', id);

      if (error) throw error;
      mostrarAlerta('success', 'División eliminada correctamente.');
      fetchDatosGenerales();
    } catch (error) {
      console.error('Error al eliminar:', error.message);
      mostrarAlerta('error', 'No se pudo eliminar la división.');
    }
  };

  return (
    <div className="sistema-escolar-container">

      {/* HEADER DE ADMINISTRACIÓN */}
      <header className="admin-header">
        <div className="admin-header-left">
          <button onClick={() => navigate(-1)} className="admin-back-btn">
            <ArrowLeft size={22} />
          </button>
          <div>
            <span className="admin-subtitle">Panel de Control General</span>
            <h1 className="admin-title">Sistema Escolar y Aulas</h1>
          </div>
        </div>
        <div className="admin-header-right">
          <Shield size={24} color="#10b981" />
          <span className="admin-badge">Administrador</span>
        </div>
      </header>

      {/* ALERTAS DE FEEDBACK */}
      {mensajeFeedback.texto && (
        <div className={`admin-alert ${mensajeFeedback.tipo}`}>
          {mensajeFeedback.tipo === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{mensajeFeedback.texto}</span>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL DEL DASHBOARD */}
      <main className="admin-main">

        {/* TARJETAS INTERACTIVAS SUPERIORES (FUNCIONAN COMO BOTONES) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>

          <div
            onClick={() => setModalDetalleTipo('maestros')}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 cursor-pointer hover:border-amber-500 transition transform hover:-translate-y-1"
            style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <p className="text-sm font-semibold text-gray-500 uppercase" style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Maestros Registrados</p>
            <h3 className="text-4xl font-extrabold text-slate-800 mt-2" style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: '10px 0' }}>{maestros.length}</h3>
            <p className="text-xs text-amber-600 font-medium mt-2" style={{ fontSize: '12px', color: '#d97706', fontWeight: '600' }}>Haz clic para ver directorio y contraseñas &rarr;</p>
          </div>

          <div
            onClick={() => setModalDetalleTipo('divisiones')}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 cursor-pointer hover:border-emerald-500 transition transform hover:-translate-y-1"
            style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <p className="text-sm font-semibold text-gray-500 uppercase" style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Divisiones / Clases</p>
            <h3 className="text-4xl font-extrabold text-slate-800 mt-2" style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: '10px 0' }}>{divisiones.length}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-2" style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>Haz clic para ver grupos &rarr;</p>
          </div>

          <div
            onClick={() => setModalDetalleTipo('clases')}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 cursor-pointer hover:border-purple-500 transition transform hover:-translate-y-1"
            style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <p className="text-sm font-semibold text-gray-500 uppercase" style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Clases Programadas</p>
            <h3 className="text-4xl font-extrabold text-slate-800 mt-2" style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: '10px 0' }}>{asignaciones.length}</h3>
            <p className="text-xs text-purple-600 font-medium mt-2" style={{ fontSize: '12px', color: '#7c3aed', fontWeight: '600' }}>Haz clic para ver cronogramas &rarr;</p>
          </div>

        </div>

        <div className="admin-actions-bar" style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div className="admin-tabs">
            <button
              className={`admin-tab-btn ${activeTab === 'divisiones' ? 'active' : ''}`}
              onClick={() => setActiveTab('divisiones')}
            >
              <BookOpen size={18} /> Gestión de Aulas (Divisiones)
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
            <button className="admin-btn-primary" onClick={() => setIsModalMaestroOpen(true)} style={{ background: '#0f172a', color: '#fff', padding: '10px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}>
              <PlusCircle size={20} /> Nuevo Maestro
            </button>
            <button className="admin-btn-primary" onClick={() => setIsModalAsignarOpen(true)} style={{ background: '#d97706', color: '#fff', padding: '10px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}>
              <Calendar size={20} /> Asignar Clase / Cronograma
            </button>
            <button className="admin-btn-primary" onClick={handleOpenCreate} style={{ background: '#10b981', color: '#fff', padding: '10px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}>
              <PlusCircle size={20} /> Crear Nueva Aula
            </button>
          </div>
        </div>

        {/* SECCIÓN DE DIVISIONES */}
        {activeTab === 'divisiones' && (
          <div className="admin-card-section">
            <div className="section-header-text">
              <h3>Divisiones y Grupos Activos</h3>
              <p>Administra los nombres, descripciones y códigos de acceso que utilizarán los estudiantes en el Aula Virtual.</p>
            </div>

            {loading ? (
              <div className="admin-loading">Cargando aulas registradas...</div>
            ) : divisiones.length === 0 ? (
              <div className="admin-empty">No hay divisiones registradas. ¡Crea la primera!</div>
            ) : (
              <div className="admin-grid">
                {divisiones.map((div) => (
                  <div key={div.id} className="division-card">
                    <div className="division-card-header">
                      <span className="division-order">Orden #{div.orden}</span>
                      <span className="division-code-tag">{div.codigo_acceso}</span>
                    </div>
                    <h4 className="division-name">{div.nombre}</h4>
                    <p className="division-desc">{div.descripcion || 'Sin descripción asignada.'}</p>

                    <div className="division-card-actions">
                      <button className="btn-action edit" onClick={() => handleOpenEdit(div)}>
                        <Edit3 size={16} /> Editar
                      </button>
                      <button className="btn-action delete" onClick={() => handleDelete(div.id)}>
                        <Trash2 size={16} /> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* MODAL PARA CREAR / EDITAR DIVISIÓN */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingId ? 'Editar Aula / División' : 'Crear Nueva Aula o División'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Nombre del Grupo / División (Ej. Génesis, Éxodo, Promesa)</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Éxodo"
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción o Rango de Edades</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Ej. Niños 9-11 años - Caminando con Jesús"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Código de Acceso Único</label>
                  <input
                    type="text"
                    name="codigo_acceso"
                    value={formData.codigo_acceso}
                    onChange={handleChange}
                    placeholder="Ej. EXODO-2026"
                    required
                  />
                  <small style={{ color: '#64748b', fontSize: '12px' }}>Este código lo usará el alumno para entrar.</small>
                </div>

                <div className="form-group">
                  <label>Orden de Visualización</label>
                  <input
                    type="number"
                    name="orden"
                    value={formData.orden}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={18} /> {editingId ? 'Guardar Cambios' : 'Crear División'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PARA NUEVO MAESTRO (CON CONTRASEÑA VISIBLE) */}
      {isModalMaestroOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Registrar Nuevo Maestro</h3>
              <button className="modal-close" onClick={() => setIsModalMaestroOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleGuardarMaestro} className="modal-form">
              <div className="form-group">
                <label>Nombre Completo</label>
                <input type="text" placeholder="Ej. Juan Pérez" value={nombreMaestro} onChange={e => setNombreMaestro(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Ministerio / Enfoque</label>
                <input type="text" placeholder="Ej. Escuela Dominical" value={ministerioMaestro} onChange={e => setMinisterioMaestro(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Correo Electrónico (Acceso)</label>
                <input type="email" placeholder="correo@ejemplo.com" value={emailMaestro} onChange={e => setEmailMaestro(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input type="text" placeholder="Número de contacto" value={telefonoMaestro} onChange={e => setTelefonoMaestro(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Contraseña Visible (Opcional - Se autogenera si se deja vacío)</label>
                <input type="text" placeholder="Ej. Clave1234" value={passwordVisible} onChange={e => setPasswordVisible(e.target.value)} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalMaestroOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary"><Save size={18} /> Guardar Maestro</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PARA ASIGNAR CLASE / CRONOGRAMA MENSUAL */}
      {isModalAsignarOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Asignar Clase / Cronograma Mensual</h3>
              <button className="modal-close" onClick={() => setIsModalAsignarOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleGuardarAsignacion} className="modal-form">
              <div className="form-group">
                <label>Seleccionar Maestro Titular</label>
                <select value={selectedMaestro} onChange={e => setSelectedMaestro(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="">Seleccione un maestro...</option>
                  {maestros.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Seleccionar División / Aula</label>
                <select value={selectedDivision} onChange={e => setSelectedDivision(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="">Seleccione una división...</option>
                  {divisiones.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Materia o Lección</label>
                <input type="text" placeholder="Ej. El Arca de Noé / Tema Libre" value={materia} onChange={e => setMateria(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Cronograma de Fechas (Ej: 02/08, 09/08, 16/08 o fechas del mes)</label>
                <input type="text" placeholder="Ej. Domingos de Agosto" value={fechasCronograma} onChange={e => setFechasCronograma(e.target.value)} required />
              </div>
              <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Horario</label>
                  <input type="text" placeholder="Ej. 10:00 AM" value={horario} onChange={e => setHorario(e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Aula Física</label>
                  <input type="text" placeholder="Ej. Salón Principal" value={aula} onChange={e => setAula(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Código Virtual (Opcional)</label>
                <input type="text" placeholder="Ej. 625882" value={codigoVirtual} onChange={e => setCodigoVirtual(e.target.value)} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalAsignarOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary"><Save size={18} /> Guardar Cronograma</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DINÁMICO PARA LAS TARJETAS SUPERIORES */}
      {modalDetalleTipo && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 style={{ textTransform: 'uppercase' }}>
                {modalDetalleTipo === 'maestros' && 'Directorio de Maestros y Contraseñas Visibles'}
                {modalDetalleTipo === 'divisiones' && 'Resumen de Divisiones Activas'}
                {modalDetalleTipo === 'clases' && 'Cronogramas y Clases Programadas'}
              </h3>
              <button className="modal-close" onClick={() => setModalDetalleTipo(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginTop: '15px' }}>
              {modalDetalleTipo === 'maestros' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {maestros.length === 0 ? <p>No hay maestros registrados.</p> : maestros.map(m => (
                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div>
                        <p style={{ fontWeight: 'bold', color: '#1e293b' }}>{m.nombre}</p>
                        <p style={{ fontSize: '12px', color: '#64748b' }}>{m.email} | Tel: {m.telefono || 'N/A'}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Contraseña:</span>
                        <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '6px', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '13px' }}>
                          {m.password_visible || 'No registrada'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {modalDetalleTipo === 'divisiones' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {divisiones.length === 0 ? <p>No hay divisiones registradas.</p> : divisiones.map(d => (
                    <div key={d.id} style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{d.nombre}</span>
                        <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{d.codigo_acceso}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>{d.descripcion || 'Sin descripción'}</p>
                    </div>
                  ))}
                </div>
              )}

              {modalDetalleTipo === 'clases' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {asignaciones.length === 0 ? <p>No hay clases programadas.</p> : asignaciones.map(a => (
                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div>
                        <p style={{ fontWeight: 'bold', color: '#b45309' }}>{a.materia}</p>
                        <p style={{ fontSize: '12px', color: '#334155' }}>Maestro: <b>{a.maestro_users?.nombre || 'Por asignar'}</b></p>
                        <p style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', marginTop: '3px' }}>Fechas: {a.fechas_cronograma}</p>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '12px', color: '#475569' }}>
                        <p><b>{a.divisiones?.nombre}</b></p>
                        <p>{a.horario}</p>
                        <p style={{ color: '#059669' }}>{a.aula}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ marginTop: '20px' }}>
              <button type="button" className="btn-secondary" onClick={() => setModalDetalleTipo(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SistemaEscolar;