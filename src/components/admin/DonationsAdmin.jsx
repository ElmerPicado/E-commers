import React, { useState, useContext, useEffect } from 'react';
import { GalleryContext } from '../../context/GalleryContext';
import { Save, Plus, Trash2, Building, Smartphone, Heart, Image as ImageIcon } from 'lucide-react';

export default function DonationsAdmin() {
  const { donationsConfig, updateDonationsConfig } = useContext(GalleryContext);
  
  const [localConfig, setLocalConfig] = useState({
    hero_image: '',
    title: '',
    message: '',
    sinpe_number: '',
    bank_accounts: []
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (donationsConfig) {
      setLocalConfig(donationsConfig);
    }
  }, [donationsConfig]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDonationsConfig(localConfig);
      alert('Configuración guardada exitosamente');
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const addAccount = () => {
    setLocalConfig(prev => ({
      ...prev,
      bank_accounts: [...prev.bank_accounts, { bank: '', currency: 'CRC', type: 'Cuenta IBAN', number: '' }]
    }));
  };

  const removeAccount = (index) => {
    setLocalConfig(prev => ({
      ...prev,
      bank_accounts: prev.bank_accounts.filter((_, i) => i !== index)
    }));
  };

  const updateAccount = (index, field, value) => {
    const newAccounts = [...localConfig.bank_accounts];
    newAccounts[index] = { ...newAccounts[index], [field]: value };
    setLocalConfig(prev => ({ ...prev, bank_accounts: newAccounts }));
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Heart size={24} style={{ color: 'var(--accent-color)' }} />
        <h2 style={{ fontSize: '1.5rem' }}>Diezmos y Ofrendas</h2>
      </div>

      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ImageIcon size={20} style={{ color: 'var(--text-muted)' }} /> Textos e Imágenes
        </h3>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="form-group">
            <label>Imagen Principal (URL)</label>
            <input 
              type="url" 
              className="form-control" 
              value={localConfig.hero_image} 
              onChange={e => setLocalConfig({...localConfig, hero_image: e.target.value})}
              required
            />
            {localConfig.hero_image && (
              <img src={localConfig.hero_image} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '0.5rem', marginTop: '1rem' }} />
            )}
          </div>

          <div className="form-group">
            <label>Título de la Página</label>
            <input 
              type="text" 
              className="form-control" 
              value={localConfig.title} 
              onChange={e => setLocalConfig({...localConfig, title: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Mensaje Principal (Descripción o Versículo)</label>
            <textarea 
              className="form-control" 
              value={localConfig.message} 
              onChange={e => setLocalConfig({...localConfig, message: e.target.value})}
              rows="4"
              required
            ></textarea>
          </div>

          <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Smartphone size={20} style={{ color: 'var(--accent-color)' }} /> SINPE Móvil
            </h3>
            <label>Número de Teléfono</label>
            <input 
              type="text" 
              className="form-control" 
              value={localConfig.sinpe_number} 
              onChange={e => setLocalConfig({...localConfig, sinpe_number: e.target.value})}
              placeholder="Ej: 8888-8888"
            />
          </div>

          <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={20} style={{ color: '#3b82f6' }} /> Cuentas Bancarias
              </h3>
              <button type="button" onClick={addAccount} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                <Plus size={16} /> Añadir Cuenta
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {localConfig.bank_accounts.map((acc, index) => (
                <div key={index} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', position: 'relative' }}>
                  <button 
                    type="button" 
                    onClick={() => removeAccount(index)}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  >
                    <Trash2 size={18} />
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Banco</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={acc.bank}
                        onChange={e => updateAccount(index, 'bank', e.target.value)}
                        placeholder="Ej: Banco Nacional"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Moneda</label>
                      <select 
                        className="form-control" 
                        value={acc.currency}
                        onChange={e => updateAccount(index, 'currency', e.target.value)}
                      >
                        <option value="CRC">Colones (CRC)</option>
                        <option value="USD">Dólares (USD)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tipo de Cuenta</label>
                      <select 
                        className="form-control" 
                        value={acc.type}
                        onChange={e => updateAccount(index, 'type', e.target.value)}
                      >
                        <option value="Cuenta IBAN">Cuenta IBAN</option>
                        <option value="Cuenta Corriente">Cuenta Corriente</option>
                        <option value="Cuenta de Ahorros">Cuenta de Ahorros</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Número de Cuenta</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={acc.number}
                      onChange={e => updateAccount(index, 'number', e.target.value)}
                      placeholder="Ej: CR12 3456 7890 1234 5678 90"
                      required
                    />
                  </div>
                </div>
              ))}
              {localConfig.bank_accounts.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem' }}>No hay cuentas bancarias registradas.</p>
              )}
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2rem' }}>
              <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Información'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
