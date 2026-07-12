import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { GalleryContext } from '../context/GalleryContext';

const FacebookIcon = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const InstagramIcon = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const MapPinIcon = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

export default function Footer() {
  const { ministries, livestream } = useContext(GalleryContext);

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
            {livestream.churchName || 'Iglesia Metodista Río Cuarto'}
          </h3>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            maxWidth: '300px',
            lineHeight: '1.6'
          }}>
            {livestream?.churchDescription || 'Una comunidad apasionada por compartir la gracia, fe y esperanza en Río Cuarto. Buscamos impactar vidas a través del amor y el servicio integral.'}
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
            {ministries.map((m) => (
              <li key={m.id}>
                <Link to={`/ministerio/${m.id}`} style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>
                  {m.name}
                </Link>
              </li>
            ))}
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
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <MapPinIcon size={16} color="var(--text-secondary)" style={{ marginTop: '2px' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              {livestream?.churchAddress || 'Río Cuarto, Córdoba, Argentina'}
            </p>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Email: {livestream?.churchEmail || 'contacto@imr4.org'}
          </p>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {livestream?.churchMapsUrl && (
              <a href={livestream.churchMapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} title="Ver en Google Maps">
                <MapPinIcon size={20} />
              </a>
            )}
            {livestream?.facebookUrl && (
              <a href={livestream.facebookUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>
                <FacebookIcon size={20} />
              </a>
            )}
            {livestream?.instagramUrl && (
              <a href={livestream.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>
                <InstagramIcon size={20} />
              </a>
            )}
          </div>
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
