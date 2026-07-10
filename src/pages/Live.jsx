import React from 'react';
import LivePlayer from '../components/LivePlayer';
import { Calendar, HelpCircle } from 'lucide-react';

export default function Live() {
  return (
    <div className="theme-imr4" style={{ minHeight: '100vh', padding: '6.5rem 1.5rem 4rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
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
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          marginTop: '2.5rem'
        }} className="grid-cols-2">
          
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Calendar size={18} style={{ color: 'var(--accent-color)' }} />
              Programación de Transmisiones
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: '1.5' }}>
              Nos conectamos en directo para nuestros cultos generales semanales:
            </p>
            <ul style={{
              listStyle: 'none',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}>
              <li><strong>Domingos 10:00 hs</strong> - Servicio de Adoración Dominical (Mañana)</li>
              <li><strong>Domingos 19:30 hs</strong> - Culto de Celebración y Palabra (Tarde)</li>
              <li><strong>Eventos Especiales</strong> - Conferencias juveniles y seminarios (se anuncia con antelación)</li>
            </ul>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <HelpCircle size={18} style={{ color: 'var(--accent-color)' }} />
              ¿Problemas de Conexión?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Si experimentas cortes en la reproducción del video, asegúrate de tener una velocidad de internet mínima de 5 Mbps. En caso de que la transmisión oficial se interrumpa, puedes sintonizar de respaldo directamente en nuestro canal de YouTube buscando "Iglesia Metodista Río Cuarto".
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: '1.5' }}>
              Para la radio, si el reproductor no inicia, recarga la página o verifica que el firewall de tu red no bloquee flujos de audio streaming.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
