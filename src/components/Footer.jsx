import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-color)',
      padding: '3rem 1.5rem',
      marginTop: 'auto',
      transition: 'background-color 0.3s, border-color 0.3s'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2.5rem',
        marginBottom: '2rem'
      }}>
        {/* About IMR4 */}
        <div>
          <h3 style={{
            fontSize: '1.25rem',
            marginBottom: '1rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 800
          }}>
            Iglesia Metodista Río Cuarto
          </h3>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            maxWidth: '300px',
            lineHeight: '1.6'
          }}>
            Una comunidad apasionada por compartir la gracia, fe y esperanza en Río Cuarto.
            Buscamos impactar vidas a través del amor y el servicio integral.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1rem',
            color: 'var(--text-primary)'
          }}>
            Ministerios
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
            <li>
              <Link to="/unanimes" style={{ color: 'var(--text-secondary)', hover: 'color: var(--accent-color)', transition: 'color 0.2s' }}>
                Red Juvenil Unánimes
              </Link>
            </li>
            <li>
              <Link to="/mujeres" style={{ color: 'var(--text-secondary)', hover: 'color: var(--accent-color)', transition: 'color 0.2s' }}>
                Ministerio de Mujeres
              </Link>
            </li>
            <li>
              <Link to="/hombres" style={{ color: 'var(--text-secondary)', hover: 'color: var(--accent-color)', transition: 'color 0.2s' }}>
                Ministerio de Hombres
              </Link>
            </li>
            <li>
              <Link to="/ninos" style={{ color: 'var(--text-secondary)', hover: 'color: var(--accent-color)', transition: 'color 0.2s' }}>
                IMR4 Niños
              </Link>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1rem',
            color: 'var(--text-primary)'
          }}>
            Recursos
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
            <li>
              <Link to="/galeria" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>
                Galería de Fotos
              </Link>
            </li>
            <li>
              <Link to="/live" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>
                En Vivo & Radio
              </Link>
            </li>
            <li>
              <Link to="/admin" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>
                Administración
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1rem',
            color: 'var(--text-primary)'
          }}>
            Contacto
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Dirección: Río Cuarto, Córdoba, Argentina
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Email: contacto@imr4.org
          </p>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '2rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
      }}>
        <span>&copy; {new Date().getFullYear()} IMR4. Todos los derechos reservados.</span>
        <span>Diseñado para Iglesia Metodista Río Cuarto.</span>
      </div>
    </footer>
  );
}
