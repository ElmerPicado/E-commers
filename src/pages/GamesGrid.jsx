import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Puzzle, Brain, Trophy, Sparkles, ChevronRight, Video } from 'lucide-react';
import { GalleryContext } from '../context/GalleryContext';

const GamesGrid = () => {
  const { ministries } = useContext(GalleryContext);
  const ninosMinistry = ministries.find(m => m.id === 'ninos');
  const funZone = ninosMinistry?.fun_zone || {};
  
  // Read config per game
  const puzzleData = funZone.puzzle || {};
  const videosData = funZone.videos || {};
  const memoryData = funZone.memory || {};
  const triviaData = funZone.trivia || {};
  const coloringData = funZone.coloring || {};

  const puzzleLevels = puzzleData.levels || [];
  const hasImageOnly = !Array.isArray(puzzleLevels) || puzzleLevels.length === 0 ? Boolean(puzzleData.image_url) : false;
  const effectivePuzzleLevels = puzzleLevels.length > 0 ? puzzleLevels : (hasImageOnly ? [{ id: 'legacy', image_url: puzzleData.image_url }] : []);

  const games = useMemo(() => {
    const gameList = [];

    // Puzzle - enabled based on puzzle.enabled AND has levels
    const puzzleEnabled = puzzleData.enabled && effectivePuzzleLevels.length > 0;
    gameList.push({
      id: 'biblical-puzzle',
      title: puzzleData.title || 'Rompecabezas Bíblico',
      description: puzzleEnabled
        ? `Arma la imagen y adivina la historia bíblica. ${effectivePuzzleLevels.length} nivel${effectivePuzzleLevels.length > 1 ? 'es' : ''} disponible${effectivePuzzleLevels.length > 1 ? 's' : ''}.`
        : 'Las maestras están preparando los niveles. ¡Vuelve pronto!',
      icon: Puzzle,
      color: '#8A2BE2',
      gradient: 'linear-gradient(135deg, #8A2BE2, #4B0082)',
      levels: effectivePuzzleLevels.length,
      path: '/ninos/juegos/biblical-puzzle',
      badge: effectivePuzzleLevels.length > 1 ? 'Múltiples niveles' : effectivePuzzleLevels.length === 1 ? '1 nivel' : 'Próximamente',
      disabled: !puzzleEnabled,
      features: ['Rompecabezas interactivo', 'Adivina la palabra', 'Progresión de niveles']
    });

    // Videos - enabled based on videos.enabled
    const videosEnabled = videosData.enabled;
    gameList.push({
      id: 'bible-videos',
      title: videosData.title || 'Videos y Canciones',
      description: videosEnabled
        ? 'Disfruta videos y canciones bíblicas para niños.'
        : 'Esta sección está deshabilitada por las maestras.',
      icon: Video,
      color: '#FF6B35',
      gradient: 'linear-gradient(135deg, #FF6B35, #F7931E)',
      levels: 0,
      path: '/ninos/juegos/bible-videos',
      badge: videosEnabled ? 'Disponible' : 'Deshabilitado',
      disabled: !videosEnabled,
      features: ['Videos de YouTube Kids', 'Canciones bíblicas', 'Contenido seguro']
    });

    // Memory - enabled based on memory.enabled AND has cards
    const memoryCards = memoryData.cards || [];
    const memoryEnabled = memoryData.enabled && memoryCards.length > 0;
    gameList.push({
      id: 'memory-verse',
      title: memoryData.title || 'Memoria de Versículos',
      description: memoryEnabled
        ? `Encuentra las parejas y memoriza la Palabra. ${memoryCards.length} tarjeta${memoryCards.length > 1 ? 's' : ''} disponible${memoryCards.length > 1 ? 's' : ''}.`
        : 'Las maestras están preparando las tarjetas. ¡Vuelve pronto!',
      icon: Brain,
      color: '#32CD32',
      gradient: 'linear-gradient(135deg, #32CD32, #228B22)',
      levels: memoryCards.length,
      path: '/ninos/juegos/memory-verse',
      badge: memoryEnabled ? `${memoryCards.length} tarjetas` : 'Próximamente',
      disabled: !memoryEnabled,
      features: ['Cartas memorables', 'Versículos bíblicos', 'Temporizador']
    });

    // Trivia - enabled based on trivia.enabled AND has questions
    const triviaQuestions = triviaData.questions || [];
    const triviaEnabled = triviaData.enabled && triviaQuestions.length > 0;
    gameList.push({
      id: 'bible-trivia',
      title: triviaData.title || 'Trivia Bíblica Kids',
      description: triviaEnabled
        ? `Responde preguntas y gana coronas de sabiduría. ${triviaQuestions.length} pregunta${triviaQuestions.length > 1 ? 's' : ''} disponible${triviaQuestions.length > 1 ? 's' : ''}.`
        : 'Las maestras están preparando las preguntas. ¡Vuelve pronto!',
      icon: Trophy,
      color: '#FFD700',
      gradient: 'linear-gradient(135deg, #FFD700, #FFA500)',
      levels: triviaQuestions.length,
      path: '/ninos/juegos/bible-trivia',
      badge: triviaEnabled ? `${triviaQuestions.length} preguntas` : 'Próximamente',
      disabled: !triviaEnabled,
      features: ['Preguntas por edad', 'Modo carrera', 'Logros']
    });

    // Coloring - enabled based on coloring.enabled AND has pages
    const coloringPages = coloringData.pages || [];
    const coloringEnabled = coloringData.enabled && coloringPages.length > 0;
    gameList.push({
      id: 'coloring-book',
      title: coloringData.title || 'Coloreando la Biblia',
      description: coloringEnabled
        ? `Da vida a las historias bíblicas con colores. ${coloringPages.length} dibujo${coloringPages.length > 1 ? 's' : ''} disponible${coloringPages.length > 1 ? 's' : ''}.`
        : 'Las maestras están preparando los dibujos. ¡Vuelve pronto!',
      icon: Sparkles,
      color: '#FF69B4',
      gradient: 'linear-gradient(135deg, #FF69B4, #FF1493)',
      levels: coloringPages.length,
      path: '/ninos/juegos/coloring-book',
      badge: coloringEnabled ? `${coloringPages.length} dibujos` : 'Próximamente',
      disabled: !coloringEnabled,
      features: ['Dibujos para colorear', 'Galería de obras', 'Guardar y compartir']
    });

    return gameList;
  }, [
    effectivePuzzleLevels, puzzleData.title, puzzleData.enabled,
    videosData.enabled, videosData.title,
    memoryCards, memoryData.enabled, memoryData.title,
    triviaQuestions, triviaData.enabled, triviaData.title,
    coloringPages, coloringData.enabled, coloringData.title
  ]);

  return (
    <div className="theme-ninos" style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 40%, #90EE90 100%)',
      padding: '2rem 1rem',
      fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>


        <header style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: '-2rem', left: '50%', transform: 'translateX(-50%)',
            fontSize: '4rem'
          }}>🎮</div>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
            fontWeight: 900,
            color: '#4B0082',
            textShadow: '2px 2px 0 #fff, 4px 4px 0 rgba(75,0,130,0.1)',
            margin: '1.5rem 0 0.5rem 0',
            fontFamily: '"Comic Sans MS", "Bubblegum Sans", cursive'
          }}>
            ¡Zona de Juegos!
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#555',
            fontWeight: 700,
            textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
          }}>
            Elige tu aventura y diviértete aprendiendo la Palabra
          </p>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {games.map((game) => (
            <article
              key={game.id}
              style={{
                background: game.disabled ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.95)',
                borderRadius: '2.5rem',
                border: `5px solid ${game.disabled ? '#DDD' : game.color}`,
                boxShadow: game.disabled
                  ? '0 8px 20px rgba(0,0,0,0.08)'
                  : `0 12px 30px ${game.color}33, 0 0 0 4px rgba(255,255,255,0.5) inset`,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                opacity: game.disabled ? 0.7 : 1,
                cursor: game.disabled ? 'not-allowed' : 'pointer',
                position: 'relative',
                transform: `rotate(${Math.random() * 4 - 2}deg)`
              }}
              onMouseEnter={e => {
                if (!game.disabled) {
                  e.currentTarget.style.transform = `rotate(${Math.random() * 4 - 2}deg) scale(1.02)`;
                  e.currentTarget.style.boxShadow = `0 20px 40px ${game.color}44, 0 0 0 4px rgba(255,255,255,0.5) inset`;
                }
              }}
              onMouseLeave={e => {
                if (!game.disabled) {
                  e.currentTarget.style.transform = `rotate(${Math.random() * 4 - 2}deg)`;
                  e.currentTarget.style.boxShadow = `0 12px 30px ${game.color}33, 0 0 0 4px rgba(255,255,255,0.5) inset`;
                }
              }}
            >
              <div style={{
                background: game.gradient,
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <game.icon size={48} color="#fff" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                </div>
                <div style={{
                  position: 'absolute',
                  right: '-20px',
                  top: '-20px',
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  filter: 'blur(10px)'
                }} />
                <span style={{
                  position: 'relative',
                  zIndex: 1,
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(4px)',
                  padding: '0.35rem 1rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  color: '#fff',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}>
                  {game.badge}
                </span>
              </div>

              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h2 style={{
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  color: game.disabled ? '#999' : '#333',
                  margin: '0 0 0.5rem 0',
                  lineHeight: 1.3
                }}>
                  {game.title}
                </h2>
                <p style={{
                  fontSize: '0.9rem',
                  color: game.disabled ? '#999' : '#666',
                  lineHeight: 1.5,
                  margin: '0 0 1rem 0',
                  flex: 1
                }}>
                  {game.description}
                </p>

                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem'
                }}>
                  {game.features.map((feature, idx) => (
                    <li key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      color: game.disabled ? '#BBB' : '#555',
                      fontWeight: 600
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: game.disabled ? '#DDD' : game.color,
                        flexShrink: 0
                      }} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{
                padding: '1rem 1.5rem 1.5rem',
                borderTop: `3px dashed ${game.disabled ? '#EEE' : game.color}33`,
                background: game.disabled ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.5)'
              }}>
                {game.disabled ? (
                  <button
                    disabled
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      background: 'linear-gradient(135deg, #DDD, #BBB)',
                      color: '#888',
                      border: 'none',
                      borderRadius: '999px',
                      fontSize: '1rem',
                      fontWeight: 900,
                      cursor: 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Sparkles size={18} /> {game.badge}
                  </button>
                ) : (
                  <Link
                    to={game.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.85rem',
                      background: game.gradient,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '999px',
                      fontSize: '1rem',
                      fontWeight: 900,
                      textDecoration: 'none',
                      boxShadow: `0 6px 0 ${game.color}CC`,
                      transform: 'translateY(-3px)',
                      transition: 'all 0.1s ease'
                    }}
                    onMouseDown={e => {
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = `0 2px 0 ${game.color}CC`;
                    }}
                    onMouseUp={e => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = `0 6px 0 ${game.color}CC`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = `0 6px 0 ${game.color}CC`;
                    }}
                  >
                    ¡JUGAR AHORA! <ChevronRight size={20} />
                  </Link>
                )}
              </div>

              {game.levels > 0 && !game.disabled && (
                <div style={{
                  position: 'absolute',
                  bottom: '1.5rem',
                  right: '1.5rem',
                  background: '#fff',
                  border: `3px solid ${game.color}`,
                  borderRadius: '1rem',
                  padding: '0.35rem 0.75rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    color: game.color,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <Trophy size={12} /> {game.levels} nivel{game.levels > 1 ? 'es' : ''}
                  </span>
                </div>
              )}
            </article>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem', padding: '0 1rem' }}>
          <Link
            to="/ministerio/ninos"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2.5rem',
              background: '#FF6347',
              color: '#fff',
              border: 'none',
              borderRadius: '999px',
              fontSize: '1.1rem',
              fontWeight: 900,
              textDecoration: 'none',
              boxShadow: '0 6px 0 #b83214',
              transform: 'translateY(-3px)',
              transition: 'all 0.1s ease'
            }}
            onMouseDown={e => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 2px 0 #b83214';
            }}
            onMouseUp={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 6px 0 #b83214';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 6px 0 #b83214';
            }}
          >
            <Gamepad2 size={24} /> Volver al Ministerio
          </Link>
        </div>

      </div>
    </div>
  );
};

export default GamesGrid;