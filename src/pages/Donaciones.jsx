import React, { useContext } from 'react';
import { GalleryContext } from '../context/GalleryContext';
import { ArrowLeft, Smartphone, Building, Heart, MapPin, Copy, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Donaciones() {
  const { donationsConfig, livestream } = useContext(GalleryContext);
  const [copiedIndex, setCopiedIndex] = React.useState(null);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!donationsConfig) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        padding: '6rem 1.5rem 4rem 1.5rem',
        overflow: 'hidden'
      }}>
        {/* Background Image with Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${donationsConfig.hero_image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(10, 10, 12, 0.5) 0%, rgba(10, 10, 12, 0.95) 100%)',
          zIndex: 1
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '800px' }}>
          <Link to="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            marginBottom: '2rem',
            textDecoration: 'none',
            fontSize: '0.9rem',
            background: 'rgba(255,255,255,0.05)',
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <ArrowLeft size={16} /> Volver al Inicio
          </Link>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(var(--accent-color-rgb), 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-color)',
              border: '1px solid rgba(var(--accent-color-rgb), 0.3)'
            }}>
              <Heart size={32} />
            </div>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800,
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #fff 40%, var(--accent-color) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.1
          }}>
            {donationsConfig.title}
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.8,
            marginBottom: '2rem',
            fontStyle: 'italic'
          }}>
            "{donationsConfig.message}"
          </p>
        </div>
      </section>

      {/* Cuentas y SINPE Section */}
      <section style={{ padding: '0 1.5rem', marginTop: '-2rem', position: 'relative', zIndex: 3 }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem'
          }}>
            {/* SINPE Card */}
            {donationsConfig.sinpe_number && (
              <div className="glass-card" style={{
                padding: '2.5rem 2rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderTop: '3px solid var(--accent-color)'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  background: 'rgba(255,255,255,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  color: 'var(--accent-color)'
                }}>
                  <Smartphone size={40} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>
                  SINPE Móvil
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  A nombre de {livestream.churchName || 'la iglesia'}
                </p>
                
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '1rem 1.5rem',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  width: '100%',
                  justifyContent: 'center',
                  border: '1px dashed var(--border-color)'
                }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '0.05em', color: '#fff' }}>
                    {donationsConfig.sinpe_number}
                  </span>
                  <button 
                    onClick={() => handleCopy(donationsConfig.sinpe_number, 'sinpe')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: copiedIndex === 'sinpe' ? '#10b981' : 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'color 0.2s'
                    }}
                    title="Copiar Número"
                  >
                    {copiedIndex === 'sinpe' ? <CheckCircle2 size={24} /> : <Copy size={24} />}
                  </button>
                </div>
              </div>
            )}

            {/* Bank Accounts */}
            {donationsConfig.bank_accounts && donationsConfig.bank_accounts.length > 0 && (
              <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <Building size={24} style={{ color: 'var(--accent-color)' }} />
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>Cuentas Bancarias</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {donationsConfig.bank_accounts.map((account, index) => (
                    <div key={index} style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.75rem',
                      padding: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{account.bank}</span>
                          <span style={{ 
                            fontSize: '0.65rem', 
                            padding: '0.1rem 0.4rem', 
                            background: 'rgba(255,255,255,0.1)', 
                            borderRadius: '4px',
                            fontWeight: 600
                          }}>
                            {account.currency}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {account.type}: <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{account.number}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleCopy(account.number, `acc-${index}`)}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--border-color)',
                          color: copiedIndex === `acc-${index}` ? '#10b981' : 'var(--text-primary)',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'all 0.2s'
                        }}
                        title="Copiar Cuenta"
                      >
                        {copiedIndex === `acc-${index}` ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
