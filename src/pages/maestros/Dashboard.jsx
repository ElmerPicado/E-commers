import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import './Dashboard.css';
import {
  PlusCircle, BookOpen, Users, Settings, Trash2, Edit3, Save, X, Shield, ArrowLeft, CheckCircle, AlertCircle
} from 'lucide-react';

const SistemaEscolar = () => {
  const navigate = useNavigate();

  // Estados principales
  const [divisiones, setDivisiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('divisiones'); // 'divisiones' o 'general'

  // Estados para el formulario de crear/editar división
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    codigo_acceso: '',
    orden: 1
  });

  const [mensajeFeedback, setMensajeFeedback] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    fetchDivisiones();
  }, []);

  // 1. Obtener todas las divisiones de Supabase
  const fetchDivisiones = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('divisiones')
        .select('*')
        .order('orden', { ascending: true });

      if (error) throw error;
      setDivisiones(data || []);
    } catch (error) {
      console.error('Error al cargar divisiones:', error.message);
      mostrarAlerta('error', 'No se pudieron cargar las divisiones.');
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

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Abrir modal para crear
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ nombre: '', descripcion: '', codigo_acceso: '', orden: divisiones.length + 1 });
    setShowModal(true);
  };

  // Abrir modal para editar
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
        // Actualizar
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
        // Crear Nueva Aula/División
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
      fetchDivisiones();
    } catch (error) {
      console.error('Error al guardar:', error.message);
      mostrarAlerta('error', `Error al guardar: ${error.message}`);
    }
  };

  // 3. Eliminar División
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta división? Los alumnos vinculados a este código ya no podrán ingresar.')) return;

    try {
      const { error } = await supabase
        .from('divisiones')
        .delete()
        .eq('id', id);

      if (error) throw error;
      mostrarAlerta('success', 'División eliminada correctamente.');
      fetchDivisiones();
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

        <div className="admin-actions-bar">
          <div className="admin-tabs">
            <button
              className={`admin-tab-btn ${activeTab === 'divisiones' ? 'active' : ''}`}
              onClick={() => setActiveTab('divisiones')}
            >
              <BookOpen size={18} /> Gestión de Aulas (Divisiones)
            </button>
          </div>

          <button className="admin-btn-primary" onClick={handleOpenCreate}>
            <PlusCircle size={20} /> Crear Nueva Aula
          </button>
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

    </div>
  );
};

export default SistemaEscolar;