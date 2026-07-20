import React, { useContext, useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { GalleryContext } from '../context/GalleryContext';
import { ArrowLeft, RotateCcw, Trophy, Sparkles, X, ChevronRight, CheckCircle } from 'lucide-react';
import PuzzleGame from '../components/ministry/PuzzleGame';

const GamePlay = () => {
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const levelParam = searchParams.get('level');
  const { ministries } = useContext(GalleryContext);
  const ninosMinistry = ministries.find(m => m.id === 'ninos');
  const funZone = ninosMinistry?.fun_zone || {};
  const puzzleData = funZone.puzzle || {};
  const levels = puzzleData.levels || [];
  const gameTitle = puzzleData.title || 'Rompecabezas Bíblico';

  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [showLevelSelector, setShowLevelSelector] = useState(false);

  useEffect(() => {
    if (levelParam !== null) {
      const idx = parseInt(levelParam, 10);
      if (!isNaN(idx) && idx >= 0 && idx < levels.length) {
        setCurrentLevelIndex(idx);
      }
    }
  }, [levelParam, levels.length]);

  if ((gameId !== 'puzzle-biblico' && gameId !== 'biblical-puzzle') || levels.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 50%, #90EE90 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          background: 'rgba(255,255,255,0.95)',
          padding: '3rem 2rem',
          borderRadius: '3rem',
          border: '5px dashed #FF69B4',
          boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
          maxWidth: '500px'
        }}>
          <Sparkles size={64} color="#FF69B4" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#C71585', margin: '0 0 1rem 0' }}>
            ¡Juego no disponible!
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#666', margin: '0 0 2rem 0' }}>
            Este juego aún no está configurado. Pide a tu maestra que lo active en el panel de administración.
          </p>
          <Link to="/ninos/juegos" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#FF6347',
            color: '#fff',
            padding: '0.75rem 2rem',
            borderRadius: '999px',
            fontSize: '1.1rem',
            fontWeight: 900,
            textDecoration: 'none',
            boxShadow: '0 5px 0 #b83214',
            transform: 'translateY(-2px)'
          }}>
            <ArrowLeft size={20} /> Volver a Juegos
          </Link>
        </div>
      </div>
    );
  }

  const activeLevel = levels[currentLevelIndex];

  const goToLevel = (idx) => {
    setCurrentLevelIndex(idx);
    setShowLevelSelector(false);
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 50%, #90EE90 100%)',
      padding: '1rem',
      fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <button
            onClick={goBack}
            style={{
              background: '#FF6347',
              border: 'none',
              color: '#fff',
              padding: '0.6rem 1rem',
              borderRadius: '999px',
              fontSize: '1rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 5px 0 #b83214',
              transform: 'translateY(-2px)',
              flexShrink: 0
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 1px 0 #b83214'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 5px 0 #b83214'; }}
          >
            <ArrowLeft size={20} /> Volver
          </button>

          <h2 style={{
            flex: 1,
            textAlign: 'center',
            fontSize: '1.8rem',
            fontWeight: 900,
            color: '#4B0082',
            textShadow: '1px 1px 0 #fff',
            margin: 0
          }}>
            {gameTitle}
          </h2>

          <button
            onClick={() => setShowLevelSelector(true)}
            style={{
              background: '#FFD700',
              border: '3px solid #DAA520',
              color: '#8B4500',
              padding: '0.5rem 1rem',
              borderRadius: '999px',
              fontSize: '0.9rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 0 #b89b00',
              transform: 'translateY(-2px)',
              flexShrink: 0
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 1px 0 #b89b00'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 0 #b89b00'; }}
          >
            <Trophy size={16} /> Nivel {currentLevelIndex + 1}
          </button>
        </header>

        <PuzzleGame
          puzzleData={{
            ...puzzleData,
            levels: [activeLevel],
            title: `${gameTitle} - Nivel ${currentLevelIndex + 1}`
          }}
        />

        {levels.length > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
            padding: '1rem'
          }}>
            {levels.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToLevel(idx)}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: `3px solid ${idx === currentLevelIndex ? '#8A2BE2' : '#DDD'}`,
                  background: idx === currentLevelIndex ? '#8A2BE2' : '#FFF',
                  color: idx === currentLevelIndex ? '#fff' : '#666',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: idx === currentLevelIndex ? '0 4px 12px rgba(138,43,226,0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
                  transform: idx === currentLevelIndex ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.2s ease'
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}

        {showLevelSelector && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              background: '#fff',
              borderRadius: '2rem',
              padding: '2rem',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              border: '4px solid #FFD700'
            }}>
              <h3 style={{ textAlign: 'center', color: '#4B0082', fontSize: '1.5rem', fontWeight: 900, margin: '0 0 1.5rem 0' }}>
                Seleccionar Nivel
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.75rem' }}>
                {levels.map((level, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToLevel(idx)}
                    style={{
                      padding: '1rem',
                      borderRadius: '1rem',
                      border: `3px solid ${idx === currentLevelIndex ? '#8A2BE2' : '#DDD'}`,
                      background: idx === currentLevelIndex ? 'linear-gradient(135deg, #8A2BE2, #4B0082)' : '#FFF',
                      color: idx === currentLevelIndex ? '#fff' : '#333',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem',
                      boxShadow: idx === currentLevelIndex ? '0 4px 12px rgba(138,43,226,0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>Nivel {idx + 1}</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                      {level.difficulty === '4x4' ? '16 piezas' : '9 piezas'}
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowLevelSelector(false)}
                style={{
                  marginTop: '1.5rem',
                  width: '100%',
                  padding: '0.75rem',
                  background: '#FF6347',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '999px',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePlay;