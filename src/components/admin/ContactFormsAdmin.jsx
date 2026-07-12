import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Trash2, Mail, MailOpen, Phone, Calendar, User } from 'lucide-react';

export default function ContactFormsAdmin() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isSupabaseConfigured = !!supabase;

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase no configurado.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('contact_forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setForms(data || []);
    } catch (err) {
      console.error('Error fetching contact forms:', err);
      setError('Error al cargar los formularios.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    if (!isSupabaseConfigured) return;
    const newStatus = currentStatus === 'no_leido' ? 'leido' : 'no_leido';
    try {
      const { error: updateError } = await supabase
        .from('contact_forms')
        .update({ estado: newStatus })
        .eq('id', id);

      if (updateError) throw updateError;
      setForms(forms.map(f => f.id === id ? { ...f, estado: newStatus } : f));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error al actualizar el estado.');
    }
  };

  const deleteForm = async (id) => {
    if (!isSupabaseConfigured) return;
    if (!window.confirm('¿Seguro que deseas eliminar este registro?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('contact_forms')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setForms(forms.filter(f => f.id !== id));
    } catch (err) {
      console.error('Error deleting form:', err);
      alert('Error al eliminar el registro.');
    }
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Cargando formularios...</div>;
  }

  if (error) {
    return <div style={{ color: '#ef4444' }}>{error}</div>;
  }

  return (
    <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Mail size={20} style={{ color: 'var(--accent-color)' }} /> 
          Formularios de Contacto
        </h2>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Total: {forms.length} | Sin leer: {forms.filter(f => f.estado === 'no_leido').length}
        </div>
      </div>

      {forms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
          <MailOpen size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p>No hay formularios de contacto registrados.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Estado</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Fecha</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Nombre Completo</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Edad / Sexo</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Teléfono</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((form) => {
                const isUnread = form.estado === 'no_leido';
                return (
                  <tr key={form.id} style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: isUnread ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                    transition: 'background 0.2s'
                  }}>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <button 
                        onClick={() => toggleStatus(form.id, form.estado)}
                        style={{ 
                          background: isUnread ? '#ef4444' : 'transparent',
                          border: isUnread ? 'none' : '1px solid var(--text-secondary)',
                          color: isUnread ? '#fff' : 'var(--text-secondary)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '1rem',
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        {isUnread ? 'Nuevo' : 'Leído'}
                      </button>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={14} /> {formatDate(form.created_at)}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: isUnread ? 700 : 400 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={14} style={{ color: 'var(--text-secondary)' }} />
                        {form.nombre} {form.apellido}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                      {form.edad} años / {form.sexo}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <a 
                        href={`https://wa.me/${form.telefono.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-color)', fontWeight: 600, textDecoration: 'none' }}
                      >
                        <Phone size={14} /> {form.telefono}
                      </a>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => deleteForm(form.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.3rem 0.5rem' }}
                        title="Eliminar registro"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
