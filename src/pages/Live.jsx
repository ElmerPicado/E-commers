import React, { useContext } from 'react';
import LivePlayer from '../components/LivePlayer';
import { Calendar, HelpCircle } from 'lucide-react';
import { GalleryContext } from '../context/GalleryContext';

export default function Live() {
  const { livestream } = useContext(GalleryContext);
  return (
    <div className="theme-imr4 live-page-wrapper">
      <div className="container" style={{ maxWidth: '1000px', padding: 0 }}>
        
        {/* Header */}
        <div className="live-header-mobile-hide" style={{ textAlign: 'center', marginBottom: '3rem', padding: '0 1rem' }}>
          <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
            Sección Multimedia en Vivo
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
            Únete a nuestras transmisiones de video en vivo o escucha la transmisión oficial de nuestra Radio IMR4 en formato digital.
          </p>
        </div>

        {/* Live player module */}
        <LivePlayer />

        {/* Informative Grid */}
        <div style={{
          display: 'grid',
          gap: '1.5rem',
          marginTop: '2.5rem'
        }} className="grid-cols-2 live-info-grid">
          
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Calendar size={18} style={{ color: 'var(--accent-color)' }} />
              Programación de Transmisiones
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
              {livestream?.scheduleText}
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <HelpCircle size={18} style={{ color: 'var(--accent-color)' }} />
              ¿Problemas de Conexión?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
              {livestream?.connectionText}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
