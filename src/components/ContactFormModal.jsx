import React, { useState } from 'react';
import { X, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function ContactFormModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    edad: '',
    sexo: '',
    telefono: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: submitError } = await supabase
        .from('contact_forms')
        .insert([{
          nombre: formData.nombre,
          apellido: formData.apellido,
          edad: parseInt(formData.edad, 10),
          sexo: formData.sexo,
          telefono: formData.telefono
        }]);

      if (submitError) throw submitError;

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({ nombre: '', apellido: '', edad: '', sexo: '', telefono: '' });
        onClose();
      }, 3000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Hubo un problema al enviar tus datos. Inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--border-color)',
    background: 'rgba(0,0,0,0.2)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(5px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '1rem',
        padding: '2rem',
        width: '100%',
        maxWidth: '450px',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle size={64} color="var(--accent-color)" />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>¡Datos Enviados!</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Gracias por contactarnos. Nos comunicaremos contigo muy pronto.</p>
          </div>
        ) : (
          <>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Déjanos tus datos</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Completa el formulario y nos pondremos en contacto contigo.
            </p>

            {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nombre *</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} style={inputStyle} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Apellido *</label>
                  <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} style={inputStyle} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Edad *</label>
                  <input type="number" name="edad" value={formData.edad} onChange={handleChange} style={inputStyle} min="1" max="120" required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Sexo *</label>
                  <select name="sexo" value={formData.sexo} onChange={handleChange} style={inputStyle} required>
                    <option value="">Seleccione...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Número de Teléfono *</label>
                <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} style={inputStyle} placeholder="+506 ..." required />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }} disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : <><Send size={18} /> Enviar Datos</>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
