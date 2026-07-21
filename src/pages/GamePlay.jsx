import React, { useContext, useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { GalleryContext } from '../context/GalleryContext';
import { ArrowLeft, Trophy, Sparkles } from 'lucide-react';
import PuzzleGame from '../components/ministry/PuzzleGame';
import MemoryGame from '../components/ministry/MemoryGame';
import TriviaGame from '../components/ministry/TriviaGame';
import ColoringGame from '../components/ministry/ColoringGame';

// Map of game IDs to their config keys in fun_zone
const GAME_CONFIG = {
  'biblical-puzzle': { section: 'puzzle', Component: PuzzleGame, title: 'Rompecabezas Bíblico' },
  'puzzle-biblico': { section: 'puzzle', Component: PuzzleGame, title: 'Rompecabezas Bíblico' },
  'memory-verse': { section: 'memory', Component: MemoryGame, title: 'Memoria de Versículos' },
  'bible-trivia': { section: 'trivia', Component: TriviaGame, title: 'Trivia Bíblica Kids' },
  'coloring-book': { section: 'coloring', Component: ColoringGame, title: 'Coloreando la Biblia' }
};

const GamePlay = () => {
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const levelParam = searchParams.get('level');
  const { ministries } = useContext(GalleryContext);
  const ninosMinistry = ministries.find(m => m.id === 'ninos');
  const funZone = ninosMinistry?.fun_zone || {};

  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [showLevelSelector, setShowLevelSelector] = useState(false);

  const gameMeta = GAME_CONFIG[gameId];

  // For puzzle: support levels and level selector
  const puzzleData = funZone.puzzle || {};
  const puzzleLevels = puzzleData.levels || [];

  useEffect(() => {
    if (levelParam !== null) {
      const idx = parseInt(levelParam, 10);
      if (!isNaN(idx) && idx >= 0 && idx < puzzleLevels.length) {
        setCurrentLevelIndex(idx);
      }
    }
  }, [levelParam, puzzleLevels.length]);

  // Unknown / disabled game -> fallback screen
  if (!gameMeta) {
    return renderUnavailable();
  }

  const sectionData = funZone[gameMeta.section] || {};
  const isPuzzle = gameMeta.section === 'puzzle';

  // Videos: just embed YouTube
  if (gameMeta.section === 'videos' && sectionData.enabled) {
    return renderVideos(sectionData);
  }

  // Puzzle needs level handling in GamePlay (multi-level UI)
  if (isPuzzle) {
    if (puzzleLevels.length === 0) {
      return renderUnavailable();
    }
    const activeLevel = puzzleLevels[currentLevelIndex];
    const gameTitle = sectionData.title || gameMeta.title;

    return (
      <GameShell
        gameTitle={gameTitle}
        onBack={goBack}
        rightHeader={
          <button
            onClick={() => setShowLevelSelector(true)}
            style={buttonStyle('#FFD700', '#b89b00')}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 1px 0 #b89b00'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 0 #b89b00'; }}
          >
            <Trophy size={16} /> Nivel {currentLevelIndex + 1}
          </button>
        }
      >
        <PuzzleGame
          puzzleData={{
            ...sectionData,
            levels: [activeLevel],
            title: `${gameTitle} - Nivel ${currentLevelIndex + 1}`,
            hasNextLevel: currentLevelIndex < puzzleLevels.length - 1,
            onNextLevel: () => { setCurrentLevelIndex(currentLevelIndex + 1); window.scrollTo({top: 0, behavior: 'smooth'}); }
          }}
        />

        {puzzleLevels.length > 1 && (
          <LevelPager
            levels={puzzleLevels}
            currentIdx={currentLevelIndex}
            onSelect={(idx) => { setCurrentLevelIndex(idx); setShowLevelSelector(false); }}
          />
        )}

        {showLevelSelector && (
          <LevelSelectorModal
            levels={puzzleLevels}
            currentIdx={currentLevelIndex}
            onPick={(idx) => { setCurrentLevelIndex(idx); setShowLevelSelector(false); }}
            onClose={() => setShowLevelSelector(false)}
          />
        )}
      </GameShell>
    );
  }

  // Memory, Trivia, Coloring - just render the component
  if (!sectionData.enabled) {
    return renderUnavailable();
  }

  const GameComponent = gameMeta.Component;
  const gameTitle = sectionData.title || gameMeta.title;

  return (
    <GameShell gameTitle={gameTitle} onBack={goBack}>
      <GameComponent gameData={sectionData} />
    </GameShell>
  );
};

// ============ Helper components ============
function goBack() {
  window.history.back();
}

const GameShell = ({ gameTitle, onBack, rightHeader, children }) => (
  <div className="theme-ninos" style={{
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 50%, #90EE90 100%)',
    padding: '1rem',
    fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif'
  }}>
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <button
          onClick={onBack}
          style={buttonStyle('#FF6347', '#b83214')}
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

        {rightHeader || <div style={{ flexShrink: 0, width: '90px' }} />}
      </header>

      {children}
    </div>
  </div>
);

const LevelPager = ({ levels, currentIdx, onSelect }) => (
  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', padding: '1rem' }}>
    {levels.map((_, idx) => (
      <button
        key={idx}
        onClick={() => onSelect(idx)}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: `3px solid ${idx === currentIdx ? '#8A2BE2' : '#DDD'}`,
          background: idx === currentIdx ? '#8A2BE2' : '#FFF',
          color: idx === currentIdx ? '#fff' : '#666',
          fontWeight: 900,
          fontSize: '1rem',
          cursor: 'pointer',
          boxShadow: idx === currentIdx ? '0 4px 12px rgba(138,43,226,0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
          transform: idx === currentIdx ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.2s ease'
        }}
      >
        {idx + 1}
      </button>
    ))}
  </div>
);

const LevelSelectorModal = ({ levels, currentIdx, onPick, onClose }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
  }}>
    <div style={{
      background: '#fff', borderRadius: '2rem', padding: '2rem',
      maxWidth: '400px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '4px solid #FFD700'
    }}>
      <h3 style={{ textAlign: 'center', color: '#4B0082', fontSize: '1.5rem', fontWeight: 900, margin: '0 0 1.5rem 0' }}>
        Seleccionar Nivel
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.75rem' }}>
        {levels.map((level, idx) => (
          <button
            key={idx}
            onClick={() => onPick(idx)}
            style={{
              padding: '1rem', borderRadius: '1rem',
              border: `3px solid ${idx === currentIdx ? '#8A2BE2' : '#DDD'}`,
              background: idx === currentIdx ? 'linear-gradient(135deg, #8A2BE2, #4B0082)' : '#FFF',
              color: idx === currentIdx ? '#fff' : '#333',
              fontWeight: 900, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
              boxShadow: idx === currentIdx ? '0 4px 12px rgba(138,43,226,0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>Nivel {idx + 1}</span>
            <p style={{ fontSize: '0.95rem', margin: 0, fontWeight: 700 }}>
            {puzzleData.hasNextLevel === false || (puzzleData.hasNextLevel === undefined && currentLevelIndex === levels.length - 1) ? '¡Completaste todo el juego!' : '¡Desbloqueaste el siguiente nivel!'}
          </p>
          <button
            onClick={() => {
              if (puzzleData.onNextLevel && puzzleData.hasNextLevel) {
                puzzleData.onNextLevel();
              } else {
                goToNextLevel();
              }
            }}
        style={{
          marginTop: '1.5rem', width: '100%', padding: '0.75rem',
          background: '#FF6347', border: 'none', color: '#fff', borderRadius: '999px',
          fontWeight: 900, fontSize: '1rem', cursor: 'pointer'
        }}
      >
        Cerrar
      </button>
    </div>
  </div>
);

// Renders embedded videos (just shows the card linking to YouTube for simplicity, or embeds)
function renderVideos(videosData) {
  const url = videosData.youtube_url || '';
  const button = videosData.button_text || 'Ver ahora';
  let embedUrl = '';
  if (url) {
    // Try to extract a YouTube channel/playlist/video URL into an embeddable one
    const ytMatch = url.match(/youtube\.com\/(?:channel\/|@|c\/|playlist\?list=|watch\?v=)?([\w-]+)/);
    if (ytMatch) {
      embedUrl = url.includes('playlist') || url.includes('list=')
        ? `https://www.youtube.com/embed/videoseries?list=${(url.match(/list=([\w-]+)/) || [])[1] || ''}`
        : `https://www.youtube.com/embed/${ytMatch[1]}`;
    } else {
      embedUrl = url;
    }
  }

  return (
    <div className="theme-ninos" style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 50%, #90EE90 100%)',
      padding: '1rem',
      fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <button
            onClick={goBack}
            style={buttonStyle('#FF6347', '#b83214')}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 1px 0 #b83214'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 5px 0 #b83214'; }}
          >
            <ArrowLeft size={20} /> Volver
          </button>
          <h2 style={{
            flex: 1, textAlign: 'center', fontSize: '1.8rem', fontWeight: 900,
            color: '#4B0082', textShadow: '1px 1px 0 #fff', margin: 0
          }}>
            {videosData.title || 'Videos y Canciones'}
          </h2>
          <div style={{ flexShrink: 0, width: '90px' }} />
        </header>

        {embedUrl ? (
          <div style={{ background: '#fff', borderRadius: '1.5rem', overflow: 'hidden', border: '4px solid #FF6B35', boxShadow: '0 10px 25px rgba(255,107,53,0.25)' }}>
            <iframe
              src={embedUrl}
              title="Videos y Canciones"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: '100%', height: '450px', border: 'none', display: 'block' }}
            />
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: '3rem 2rem', color: '#666',
            background: 'rgba(255,255,255,0.9)', borderRadius: '2rem', border: '4px dashed #FF6B35'
          }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>Las maestras están preparando los videos. ¡Vuelve pronto!</p>
          </div>
        )}

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.85rem 2rem', background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
              color: '#fff', borderRadius: '999px', fontSize: '1rem', fontWeight: 900,
              textDecoration: 'none', boxShadow: '0 5px 0px #b83214', transform: 'translateY(-2px)',
              alignSelf: 'center'
            }}
          >
            ▶ {button}
          </a>
        )}
      </div>
    </div>
  );
}

function renderUnavailable() {
  return (
    <div className="theme-ninos" style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 50%, #90EE90 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem',
      fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif'
    }}>
      <div style={{
        textAlign: 'center', background: 'rgba(255,255,255,0.95)', padding: '3rem 2rem',
        borderRadius: '3rem', border: '5px dashed #FF69B4', boxShadow: '0 15px 35px rgba(0,0,0,0.15)', maxWidth: '500px'
      }}>
        <Sparkles size={64} color="#FF69B4" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#C71585', margin: '0 0 1rem 0' }}>
          ¡Juego no disponible!
        </h2>
        <p style={{ fontSize: '1.1rem', color: '#666', margin: '0 0 2rem 0' }}>
          Este juego aún no está configurado. Pide a tu maestra que lo active en el panel de administración.
        </p>
        <Link to="/ninos/juegos" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: '#FF6347', color: '#fff', padding: '0.75rem 2rem', borderRadius: '999px',
          fontSize: '1.1rem', fontWeight: 900, textDecoration: 'none', boxShadow: '0 5px 0 #b83214', transform: 'translateY(-2px)'
        }}>
          <ArrowLeft size={20} /> Volver a Juegos
        </Link>
      </div>
    </div>
  );
}

function buttonStyle(bg, shadow) {
  return {
    background: bg,
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
    boxShadow: `0 5px 0 ${shadow}`,
    transform: 'translateY(-2px)',
    flexShrink: 0
  };
}

export default GamePlay;
