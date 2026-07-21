import React, { useContext, useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Puzzle, Brain, Trophy, Sparkles, ChevronRight } from 'lucide-react';
import { GalleryContext } from '../context/GalleryContext';

// Hook local para detectar pantallas móviles
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

const GamesGrid = () => {
  const { ministries } = useContext(GalleryContext);
  const isMobile = useIsMobile();

  const ninosMinistry = ministries?.find(m => m.id === 'ninos');
  const funZone = ninosMinistry?.fun_zone || {};

  const puzzleData = funZone.puzzle || {};
  const memoryData = funZone.memory || {};
  const triviaData = funZone.trivia || {};
  const coloringData = funZone.coloring || {};

  const puzzleLevels = puzzleData.levels || [];
  const hasImageOnly = !Array.isArray(puzzleLevels) || puzzleLevels.length === 0 ? Boolean(puzzleData.image_url) : false;
  const effectivePuzzleLevels = puzzleLevels.length > 0 ? puzzleLevels : (hasImageOnly ? [{ id: 'legacy', image_url: puzzleData.image_url }] : []);

  const games = useMemo(() => {
    const gameList = [];

    const mCards = memoryData.cards || [];
    const tQuestions = triviaData.questions || [];
    const cPages = coloringData.pages || [];

    // Puzzle
    const puzzleEnabled = puzzleData.enabled && effectivePuzzleLevels.length > 0;
    gameList.push({
      id: 'biblical-puzzle',
      title: puzzleData.title || 'Rompecabezas', // Título un poco más corto por si acaso
      description: puzzleEnabled
        ? `Arma la imagen y adivina la historia. ${effectivePuzzleLevels.length} niveles.`
        : '¡Vuelve pronto!',
      icon: Puzzle,
      color: '#8A2BE2',
      gradient: 'linear-gradient(135deg, #8A2BE2, #4B0082)',
      path: '/ninos/juegos/biblical-puzzle',
      badge: puzzleEnabled ? 'Listo' : 'Pronto',
      disabled: !puzzleEnabled,
      features: ['Rompecabezas', 'Adivina', 'Niveles']
    });

    // Memory
    const memoryEnabled = memoryData.enabled && mCards.length > 0;
    gameList.push({
      id: 'memory-verse',
      title: memoryData.title || 'Memoria',
      description: memoryEnabled
        ? `Encuentra las parejas de la Palabra. ${mCards.length} tarjetas.`
        : '¡Vuelve pronto!',
      icon: Brain,
      color: '#32CD32',
      gradient: 'linear-gradient(135deg, #32CD32, #228B22)',
      path: '/ninos/juegos/memory-verse',
      badge: memoryEnabled ? 'Listo' : 'Pronto',
      disabled: !memoryEnabled,
      features: ['Parejas', 'Versículos', 'Tiempo']
    });

    // Trivia
    const triviaEnabled = triviaData.enabled && tQuestions.length > 0;
    gameList.push({
      id: 'bible-trivia',
      title: triviaData.title || 'Trivia Kids',
      description: triviaEnabled
        ? `Responde y gana coronas. ${tQuestions.length} preguntas.`
        : '¡Vuelve pronto!',
      icon: Trophy,
      color: '#FFD700',
      gradient: 'linear-gradient(135deg, #FFD700, #FFA500)',
      path: '/ninos/juegos/bible-trivia',
      badge: triviaEnabled ? 'Listo' : 'Pronto',
      disabled: !triviaEnabled,
      features: ['Preguntas', 'Puntaje', 'Logros']
    });

    // Coloring
    const coloringEnabled = coloringData.enabled && cPages.length > 0;
    gameList.push({
      id: 'coloring-book',
      title: coloringData.title || 'Colorear',
      description: coloringEnabled
        ? `Da vida a las historias con colores. ${cPages.length} dibujos.`
        : '¡Vuelve pronto!',
      icon: Sparkles,
      color: '#FF69B4',
      gradient: 'linear-gradient(135deg, #FF69B4, #FF1493)',
      path: '/ninos/juegos/coloring-book',
      badge: coloringEnabled ? 'Listo' : 'Pronto',
      disabled: !coloringEnabled,
      features: ['Dibujos', 'Pinceles', 'Guardar']
    });

    return gameList;
  }, [
    effectivePuzzleLevels.length, puzzleData.title, puzzleData.enabled,
    JSON.stringify(memoryData), JSON.stringify(triviaData), JSON.stringify(coloringData)
  ]);

  return (
    <div className="theme-ninos" style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 40%, #90EE90 100%)',
      padding: isMobile ? '1rem 0.5rem' : '2rem 1rem',
      fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
      boxSizing: 'border-box'
    }}>
      <header style={{
        textAlign: 'center',
        marginBottom: isMobile ? '1rem' : '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: isMobile ? '0.2rem' : '0.5rem'
      }}>
        {/* Icono en flujo normal (arriba de las letras sin solaparse) */}
        <div style={{
          fontSize: isMobile ? '2.5rem' : '4rem',
          lineHeight: 1
        }}>
          🎮
        </div>

        <h1 style={{
          fontSize: 'clamp(1.8rem, 7vw, 3.5rem)',
          fontWeight: 900,
          color: '#4B0082',
          textShadow: '2px 2px 0 #fff, 4px 4px 0 rgba(75,0,130,0.1)',
          margin: 0,
          fontFamily: '"Comic Sans MS", "Bubblegum Sans", cursive'
        }}>
          ¡Zona de Juegos!
        </h1>

        <p style={{
          fontSize: isMobile ? '0.9rem' : '1.2rem',
          color: '#555',
          fontWeight: 700,
          padding: '0 0.5rem',
          margin: 0
        }}>
          Elige tu aventura
        </p>
      </header>
      {/* CONTENEDOR GRID CORREGIDO PARA 2 COLUMNAS EN MÓVIL */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: isMobile ? '0.6rem' : '1.5rem' // Espacio más pequeño entre tarjetas en móvil
      }}>
        {games.map((game) => (
          <article
            key={game.id}
            style={{
              background: game.disabled ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.95)',
              borderRadius: isMobile ? '1.2rem' : '2.5rem',
              border: `${isMobile ? '3px' : '5px'} solid ${game.disabled ? '#DDD' : game.color}`,
              boxShadow: game.disabled
                ? '0 4px 10px rgba(0,0,0,0.05)'
                : `0 6px 15px ${game.color}22, 0 0 0 3px rgba(255,255,255,0.5) inset`,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
          >
            {/* Cabecera minificada para móvil */}
            <div style={{
              background: game.gradient,
              padding: isMobile ? '0.6rem' : '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <game.icon size={isMobile ? 24 : 48} color="#fff" />
              </div>
              <span style={{
                position: 'relative',
                zIndex: 1,
                background: 'rgba(255,255,255,0.2)',
                padding: isMobile ? '0.2rem 0.5rem' : '0.35rem 1rem',
                borderRadius: '999px',
                fontSize: isMobile ? '0.6rem' : '0.75rem',
                fontWeight: 900,
                color: '#fff'
              }}>
                {game.badge}
              </span>
            </div>

            {/* Cuerpo de la tarjeta adaptable */}
            <div style={{ padding: isMobile ? '0.6rem' : '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h2 style={{
                fontSize: isMobile ? '0.95rem' : '1.4rem',
                fontWeight: 900,
                color: game.disabled ? '#999' : '#333',
                margin: '0 0 0.3rem 0',
                lineHeight: 1.2
              }}>
                {game.title}
              </h2>
              <p style={{
                fontSize: isMobile ? '0.75rem' : '0.9rem',
                color: game.disabled ? '#999' : '#666',
                lineHeight: 1.3,
                margin: '0 0 0.6rem 0',
                flex: 1
              }}>
                {game.description}
              </p>

              {/* Lista de características (se oculta en móvil para que no colapse el diseño) */}
              {!isMobile && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {game.features.map((feature, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#555', fontWeight: 600 }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: game.color, flexShrink: 0 }} />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Botón de acción */}
            <div style={{
              padding: isMobile ? '0.5rem' : '1rem 1.5rem 1.5rem',
              borderTop: `2px dashed ${game.disabled ? '#EEE' : game.color}33`
            }}>
              {game.disabled ? (
                <button
                  disabled
                  style={{
                    width: '100%',
                    padding: isMobile ? '0.5rem' : '0.85rem',
                    background: '#DDD',
                    color: '#888',
                    border: 'none',
                    borderRadius: '999px',
                    fontSize: isMobile ? '0.75rem' : '1rem',
                    fontWeight: 900,
                    cursor: 'not-allowed'
                  }}
                >
                  Cerrado
                </button>
              ) : (
                <Link
                  to={game.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.2rem',
                    width: '100%',
                    padding: isMobile ? '0.5rem' : '0.85rem',
                    background: game.gradient,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '999px',
                    fontSize: isMobile ? '0.75rem' : '0.95rem',
                    fontWeight: 900,
                    textDecoration: 'none',
                    boxShadow: `0 ${isMobile ? '2px' : '4px'} 0 ${game.color}CC`
                  }}
                >
                  {isMobile ? '¡JUGAR!' : '¡JUGAR AHORA!'} <ChevronRight size={isMobile ? 14 : 18} />
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Botón de regreso inferior */}
      <div style={{ textAlign: 'center', marginTop: isMobile ? '1.5rem' : '3rem' }}>
        <Link
          to="/ministerio/ninos"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: isMobile ? '0.6rem 1.2rem' : '1rem 2.5rem',
            background: '#FF6347',
            color: '#fff',
            border: 'none',
            borderRadius: '999px',
            fontSize: isMobile ? '0.85rem' : '1.1rem',
            fontWeight: 900,
            textDecoration: 'none',
            boxShadow: '0 4px 0 #b83214'
          }}
        >
          <Gamepad2 size={isMobile ? 18 : 24} /> Volver
        </Link>
      </div>

    </div>
    </div >
  );
};

export default GamesGrid;