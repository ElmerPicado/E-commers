import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, Sparkles, ChevronRight, CheckCircle, Image as ImageIcon, X } from 'lucide-react';

const PuzzleGame = ({ puzzleData, initialLevelIndex = 0, onNextLevel }) => {
  // Parse levels with legacy fallback
  const levels = React.useMemo(() => {
    if (puzzleData && Array.isArray(puzzleData.levels) && puzzleData.levels.length > 0) {
      return puzzleData.levels;
    }
    if (puzzleData && puzzleData.image_url) {
      return [{
        id: 'legacy',
        image_url: puzzleData.image_url,
        answer: (puzzleData.answer || 'JONAS').toUpperCase().trim(),
        difficulty: puzzleData.difficulty || '3x3'
      }];
    }
    return [];
  }, [puzzleData]);

  const [currentLevelIndex, setCurrentLevelIndex] = useState(initialLevelIndex);

  // Sincronizar el nivel interno si cambia desde el menú de la aplicación
  useEffect(() => {
    if (initialLevelIndex !== undefined && initialLevelIndex !== currentLevelIndex) {
      setCurrentLevelIndex(initialLevelIndex);
    }
  }, [initialLevelIndex]);

  const activeLevel = levels[currentLevelIndex] || levels[0];

  // Game States
  const [pieces, setPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  const [moves, setMoves] = useState(0);

  // Word Game States
  const [userWord, setUserWord] = useState([]);
  const [isWordCorrect, setIsWordCorrect] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(1);

  // Celebration & Gallery States
  const [showConfetti, setShowConfetti] = useState(false);
  const [levelCleared, setLevelCleared] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Registro de niveles completados
  const [completedLevels, setCompletedLevels] = useState({});

  const title = puzzleData?.title || 'Rompecabezas Bíblico';
  const gridSize = activeLevel?.difficulty === '4x4' ? 4 : 3;
  const totalPieces = gridSize * gridSize;

  // Initializing Puzzle
  const generatePuzzle = useCallback(() => {
    if (!activeLevel) return;
    const ordered = Array.from({ length: totalPieces }, (_, i) => i);
    let shuffled;
    do {
      shuffled = [...ordered];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    } while (shuffled.every((val, idx) => val === idx));

    setPieces(shuffled);
    setSelectedPiece(null);
    setIsPuzzleSolved(false);
    setMoves(0);
    setLevelCleared(false);
  }, [activeLevel, totalPieces]);

  // Re-generate puzzle when level changes
  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  // Initialize Word Guesses
  useEffect(() => {
    if (activeLevel?.answer) {
      const ans = activeLevel.answer.toUpperCase();
      const length = ans.length;
      const initialWord = Array(length).fill('');
      if (length > 0) {
        initialWord[0] = ans[0];
      }
      setUserWord(initialWord);
      setIsWordCorrect(false);
      setActiveSlotIndex(1);
    }
  }, [activeLevel]);

  // Check if Jigsaw Puzzle is solved
  useEffect(() => {
    if (pieces.length > 0 && pieces.every((val, idx) => val === idx)) {
      setIsPuzzleSolved(true);
    }
  }, [pieces]);

  // Check if Word is correct
  useEffect(() => {
    if (activeLevel?.answer && userWord.length > 0) {
      const fullWord = userWord.join('').toUpperCase();
      const answerWord = activeLevel.answer.toUpperCase();
      if (fullWord === answerWord) {
        setIsWordCorrect(true);
      } else {
        setIsWordCorrect(false);
      }
    }
  }, [userWord, activeLevel]);

  // Check level clear condition
  useEffect(() => {
    if (isPuzzleSolved && isWordCorrect && !levelCleared) {
      setLevelCleared(true);
      setShowConfetti(true);

      setCompletedLevels(prev => ({ ...prev, [currentLevelIndex]: true }));

      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isPuzzleSolved, isWordCorrect, levelCleared, currentLevelIndex]);

  const handlePieceClick = (clickedIndex) => {
    if (isPuzzleSolved) return;

    if (selectedPiece === null) {
      setSelectedPiece(clickedIndex);
    } else {
      if (selectedPiece === clickedIndex) {
        setSelectedPiece(null);
        return;
      }
      const newPieces = [...pieces];
      [newPieces[selectedPiece], newPieces[clickedIndex]] = [newPieces[clickedIndex], newPieces[selectedPiece]];
      setPieces(newPieces);
      setSelectedPiece(null);
      setMoves(prev => prev + 1);
    }
  };

  const handleKeyboardClick = (char) => {
    if (isWordCorrect || !activeLevel) return;
    const ans = activeLevel.answer;

    const newWord = [...userWord];
    newWord[activeSlotIndex] = char;
    setUserWord(newWord);

    if (activeSlotIndex < ans.length - 1) {
      setActiveSlotIndex(activeSlotIndex + 1);
    }
  };

  const handleBackspace = () => {
    if (isWordCorrect || !activeLevel) return;
    const newWord = [...userWord];

    if (newWord[activeSlotIndex] !== '') {
      newWord[activeSlotIndex] = '';
    } else if (activeSlotIndex > 1) {
      newWord[activeSlotIndex - 1] = '';
      setActiveSlotIndex(activeSlotIndex - 1);
    }
    setUserWord(newWord);
  };

  const handleSlotClick = (index) => {
    if (isWordCorrect || index === 0) return;
    setActiveSlotIndex(index);
  };

  const handleNextLevelClick = () => {
    if (currentLevelIndex < levels.length - 1) {
      if (onNextLevel) onNextLevel();
      setCurrentLevelIndex(prev => prev + 1);
      setLevelCleared(false);
      setIsPuzzleSolved(false);
      setIsWordCorrect(false);
    } else {
      setGameFinished(true);
      setShowConfetti(true);
    }
  };

  const restartGame = () => {
    setCurrentLevelIndex(0);
    setGameFinished(false);
    setLevelCleared(false);
    setIsPuzzleSolved(false);
    setIsWordCorrect(false);
    setCompletedLevels({});
    setShowConfetti(false);
  };

  if (levels.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem 1rem',
        color: '#666',
        background: 'rgba(255,255,255,0.9)',
        borderRadius: '1.5rem',
        border: '3px dashed #ccc',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        <Sparkles size={40} style={{ color: '#ccc', marginBottom: '0.5rem' }} />
        <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>¡Pronto habrá un rompecabezas aquí!</p>
        <p style={{ fontSize: '0.85rem' }}>Las maestras están preparando algo divertido para ti.</p>
      </div>
    );
  }

  // Pantalla Final de Victoria (Copa Gigante y Mensaje de Ganador)
  if (gameFinished) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #FFF9C4, #FFE082)',
        padding: '2rem 1.5rem',
        borderRadius: '1.5rem',
        boxShadow: '0 12px 35px rgba(255, 193, 7, 0.4)',
        border: '4px solid #FFD700',
        width: '100%',
        maxWidth: '360px',
        margin: '1rem auto',
        boxSizing: 'border-box',
        fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '-10px',
                left: `${Math.random() * 100}%`,
                width: `${6 + Math.random() * 6}px`,
                height: `${6 + Math.random() * 6}px`,
                background: ['#FFD700', '#FF4500', '#00CED1', '#FF69B4', '#9370DB'][i % 5],
                borderRadius: '50%',
                animation: `confettiFall ${2 + Math.random() * 2}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: '#FFF',
            borderRadius: '50%',
            padding: '1.2rem',
            boxShadow: '0 8px 25px rgba(255, 215, 0, 0.6)',
            border: '4px solid #FFA500',
            animation: 'bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            <Trophy size={75} style={{ color: '#FFD700', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' }} />
          </div>

          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#D35400', margin: '0 0 0.3rem 0', textShadow: '1px 1px 0px #FFF' }}>
              ¡CAMPEÓN BÍBLICO! 🏆
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#7F8C8D', margin: 0, fontWeight: 700, lineHeight: 1.4 }}>
              ¡Increíble! Completaste todos los rompecabezas y descubriste todas las historias con éxito. 🌟
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.5rem' }}>
            <button
              onClick={() => setIsGalleryOpen(true)}
              style={{
                flex: 1,
                background: '#1E90FF',
                color: '#fff',
                border: 'none',
                borderRadius: '999px',
                padding: '0.7rem 1rem',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 0px #104E8B'
              }}
            >
              Ver Galería
            </button>
            <button
              onClick={restartGame}
              style={{
                flex: 1,
                background: '#27AE60',
                color: '#fff',
                border: 'none',
                borderRadius: '999px',
                padding: '0.7rem 1rem',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 0px #145A32'
              }}
            >
              Jugar de Nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem 0.5rem',
      position: 'relative',
      fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
      width: '100%',
      maxWidth: '100vw',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      {showConfetti && !gameFinished && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '-10px',
                left: `${Math.random() * 100}%`,
                width: `${6 + Math.random() * 6}px`,
                height: `${6 + Math.random() * 6}px`,
                background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE'][i % 10],
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                animation: `confettiFall ${2.5 + Math.random() * 1.5}s ease-in forwards`,
                animationDelay: `${Math.random() * 1.5}s`
              }}
            />
          ))}
          <style>{`
            @keyframes confettiFall {
              0% { transform: translateY(0) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* Top Banner - Title and Level Indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '340px',
        boxSizing: 'border-box',
        gap: '0.5rem'
      }}>
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: 900,
          color: '#4B0082',
          margin: 0,
          textShadow: '1px 1px 0px #fff',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {title}
        </h3>
        <span style={{
          background: '#FF1493',
          color: '#fff',
          padding: '0.3rem 0.8rem',
          borderRadius: '999px',
          fontWeight: 800,
          fontSize: '0.8rem',
          border: '2px solid #FFF',
          boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
          flexShrink: 0,
          whiteSpace: 'nowrap'
        }}>
          Nivel {currentLevelIndex + 1} de {levels.length}
        </span>
      </div>

      {/* Botón para abrir la galería de selección de niveles */}
      {levels.length > 1 && (
        <button
          onClick={() => setIsGalleryOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.9rem',
            background: '#FFF',
            color: '#1E90FF',
            border: '2px solid #1E90FF',
            borderRadius: '999px',
            fontWeight: 800,
            fontSize: '0.8rem',
            cursor: 'pointer',
            boxShadow: '0 3px 8px rgba(30, 144, 255, 0.2)'
          }}
        >
          <ImageIcon size={15} /> Cambiar Rompecabezas ({currentLevelIndex + 1}/{levels.length})
        </button>
      )}

      {/* Jigsaw Solver Board */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', width: '100%', maxWidth: '340px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.8rem', color: '#666', fontWeight: 700, padding: '0 0.25rem' }}>
          <span>🧩 Movs: {moves}</span>
          <span style={{ color: isPuzzleSolved ? '#228B22' : '#e67e22', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            {isPuzzleSolved ? <><CheckCircle size={13} /> ¡Completo!</> : '🧩 Arma el Rompecabezas'}
          </span>
        </div>

        {/* Puzzle Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gap: '3px',
          width: '100%',
          aspectRatio: '1 / 1',
          maxWidth: '340px',
          background: '#4B0082',
          padding: '4px',
          borderRadius: '1.25rem',
          boxShadow: '0 8px 20px rgba(75, 0, 130, 0.25)',
          transition: 'all 0.3s ease',
          border: isPuzzleSolved ? '4px solid #32CD32' : '4px solid #FFD700',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          position: 'relative',
          boxSizing: 'border-box'
        }}>
          {pieces.map((pieceIndex, gridIndex) => {
            const correctRow = Math.floor(pieceIndex / gridSize);
            const correctCol = pieceIndex % gridSize;
            const isSelected = selectedPiece === gridIndex;
            const isCorrectPosition = pieceIndex === gridIndex;

            return (
              <div
                key={gridIndex}
                onClick={() => handlePieceClick(gridIndex)}
                style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  backgroundImage: `url(${activeLevel.image_url})`,
                  backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                  backgroundPosition: gridSize > 1
                    ? `${(correctCol / (gridSize - 1)) * 100}% ${(correctRow / (gridSize - 1)) * 100}%`
                    : '0% 0%',
                  borderRadius: '0.4rem',
                  cursor: isPuzzleSolved ? 'default' : 'pointer',
                  border: isSelected
                    ? '3px solid #FFD700'
                    : isCorrectPosition && !isPuzzleSolved
                      ? '2px solid rgba(76, 175, 80, 0.6)'
                      : '2px solid transparent',
                  boxShadow: isSelected
                    ? '0 0 12px rgba(255, 215, 0, 0.8), inset 0 0 4px rgba(255, 215, 0, 0.3)'
                    : 'none',
                  transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                {isSelected && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255, 215, 0, 0.15)', borderRadius: '0.3rem' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Word Guessing Board */}
      <div style={{
        width: '100%',
        maxWidth: '340px',
        background: '#FFF',
        padding: '0.85rem',
        borderRadius: '1.25rem',
        boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
        border: '3px solid #1E90FF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.6rem',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h4 style={{ margin: 0, color: '#1E90FF', fontSize: '1rem', fontWeight: 800 }}>🤔 ¿Qué historia bíblica es?</h4>
          <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.75rem', color: '#666' }}>Completa las letras que hacen falta</p>
        </div>

        {/* Word Slots */}
        <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
          {userWord.map((char, index) => {
            const isFirst = index === 0;
            const isActive = index === activeSlotIndex;
            return (
              <div
                key={index}
                onClick={() => handleSlotClick(index)}
                style={{
                  width: '32px',
                  height: '38px',
                  borderRadius: '0.4rem',
                  border: isFirst
                    ? '2px solid #A0A0A0'
                    : isActive
                      ? '2.5px solid #1E90FF'
                      : '2px solid #DDD',
                  background: isFirst ? '#E0E0E0' : isActive ? '#E6F2FF' : '#FFF',
                  color: isFirst ? '#555' : '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  cursor: isFirst || isWordCorrect ? 'default' : 'pointer',
                  boxShadow: isActive ? '0 0 6px rgba(30, 144, 255, 0.4)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {char || '_'}
              </div>
            );
          })}
        </div>

        {/* Alphabet Virtual Keyboard */}
        {!isWordCorrect && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', width: '100%', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.15rem', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'].map(char => (
                <button
                  key={char}
                  onClick={() => handleKeyboardClick(char)}
                  style={{
                    background: '#F0F8FF',
                    border: '1.5px solid #B0C4DE',
                    borderRadius: '0.3rem',
                    minWidth: '22px',
                    height: '28px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    color: '#4682B4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 2px'
                  }}
                >
                  {char}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.15rem', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
              {['N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map(char => (
                <button
                  key={char}
                  onClick={() => handleKeyboardClick(char)}
                  style={{
                    background: '#F0F8FF',
                    border: '1.5px solid #B0C4DE',
                    borderRadius: '0.3rem',
                    minWidth: '22px',
                    height: '28px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    color: '#4682B4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 2px'
                  }}
                >
                  {char}
                </button>
              ))}
            </div>
            <button
              onClick={handleBackspace}
              style={{
                background: '#FFB6C1',
                border: '1.5px solid #FF69B4',
                color: '#C71585',
                borderRadius: '0.4rem',
                padding: '0.25rem 0.8rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                marginTop: '0.2rem'
              }}
            >
              Borrar letra ⌫
            </button>
          </div>
        )}

        {isWordCorrect && (
          <div style={{ color: '#228B22', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.95rem' }}>
            <CheckCircle size={16} /> ¡Excelente! Palabra Correcta
          </div>
        )}
      </div>

      {/* Victory Level Clear Board */}
      {levelCleared && (
        <div style={{
          textAlign: 'center',
          background: 'linear-gradient(135deg, #32CD32, #228B22)',
          padding: '1rem',
          borderRadius: '1.25rem',
          boxShadow: '0 6px 20px rgba(34, 139, 34, 0.25)',
          animation: 'bounceIn 0.4s ease-out',
          width: '100%',
          maxWidth: '340px',
          color: '#FFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.4rem',
          boxSizing: 'border-box'
        }}>
          <Sparkles size={30} style={{ color: '#FFD700', animation: 'spin 4s linear infinite' }} />
          <h4 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>
            ¡Nivel Completado! 🎉
          </h4>
          <p style={{ fontSize: '0.85rem', margin: 0, fontWeight: 700 }}>
            {currentLevelIndex === levels.length - 1 ? '¡Estás a un paso de la victoria total!' : '¡Desbloqueaste el siguiente nivel!'}
          </p>
          <button
            onClick={handleNextLevelClick}
            style={{
              background: '#FFD700',
              color: '#8B4500',
              border: 'none',
              borderRadius: '999px',
              padding: '0.5rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 0px #b89b00',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginTop: '0.3rem'
            }}
          >
            {currentLevelIndex === levels.length - 1 ? 'Ver Premio Final' : 'Siguiente Nivel'}
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Reset button */}
      {!levelCleared && (
        <button
          onClick={generatePuzzle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#8A2BE2',
            color: '#fff',
            border: 'none',
            borderRadius: '999px',
            padding: '0.4rem 1.2rem',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 3px 0px #5c18a3'
          }}
        >
          <RotateCcw size={14} />
          Mezclar de nuevo
        </button>
      )}

      {/* Modal Galería de Rompecabezas */}
      {isGalleryOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#FFF',
            borderRadius: '1.5rem',
            padding: '1.2rem',
            maxWidth: '480px',
            width: '100%',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            border: '4px solid #1E90FF',
            boxShadow: '0 15px 30px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <h4 style={{ margin: 0, color: '#1E90FF', fontSize: '1.1rem', fontWeight: 900 }}>
                🧩 Elige un Rompecabezas
              </h4>
              <button
                onClick={() => setIsGalleryOpen(false)}
                style={{
                  border: 'none',
                  background: '#F0F8FF',
                  color: '#1E90FF',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '0.8rem',
              overflowY: 'auto',
              paddingRight: '0.2rem'
            }}>
              {levels.map((lvl, idx) => {
                const isSelected = idx === currentLevelIndex;
                const isDone = completedLevels[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentLevelIndex(idx);
                      setLevelCleared(false);
                      setIsPuzzleSolved(false);
                      setIsWordCorrect(false);
                      setGameFinished(false);
                      setIsGalleryOpen(false);
                    }}
                    style={{
                      position: 'relative',
                      border: `3px solid ${isSelected ? '#1E90FF' : isDone ? '#32CD32' : '#E2E8F0'}`,
                      borderRadius: '1rem',
                      padding: '0.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: isSelected ? '#E6F2FF' : '#FFF',
                      boxShadow: isSelected ? '0 4px 10px rgba(30,144,255,0.3)' : '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    {isDone && (
                      <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: '#32CD32',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        zIndex: 2,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        ✓
                      </span>
                    )}
                    <div style={{ width: '100%', height: '75px', borderRadius: '0.6rem', overflow: 'hidden', background: '#F8FAFC', marginBottom: '0.3rem' }}>
                      <img
                        src={lvl.image_url}
                        crossOrigin="anonymous"
                        alt={lvl.answer || `Nivel ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: isSelected ? '#1E90FF' : '#333',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      Nivel {idx + 1}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default PuzzleGame;