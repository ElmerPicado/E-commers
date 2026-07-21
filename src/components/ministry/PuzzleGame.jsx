import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, Sparkles, X, ChevronRight, CheckCircle } from 'lucide-react';

const PuzzleGame = ({ puzzleData }) => {
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

  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const activeLevel = levels[currentLevelIndex];

  // Game States
  const [pieces, setPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  const [moves, setMoves] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Word Game States
  const [userWord, setUserWord] = useState([]); // Array of characters representing user's current guess
  const [isWordCorrect, setIsWordCorrect] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(1); // Auto-focus starts at first empty slot (1)

  // Celebration States
  const [showConfetti, setShowConfetti] = useState(false);
  const [levelCleared, setLevelCleared] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

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

  // Preloading level image
  useEffect(() => {
    if (activeLevel?.image_url) {
      setImageLoaded(false);
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => {
        console.error("Failed to load puzzle image, retrying...");
        setTimeout(() => {
          img.src = activeLevel.image_url + (activeLevel.image_url.includes('?') ? '&' : '?') + 'retry=' + Date.now();
        }, 1500);
      };
      // Append timestamp to bypass Safari cache issues
      img.src = activeLevel.image_url + (activeLevel.image_url.includes('?') ? '&' : '?') + 't=' + Date.now();
    }
  }, [activeLevel]);

  // Re-generate puzzle when level changes
  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  // Initialize Word Guesses
  useEffect(() => {
    if (activeLevel?.answer) {
      const ans = activeLevel.answer.toUpperCase();
      const length = ans.length;
      // Pre-fill first letter and leave rest blank
      const initialWord = Array(length).fill('');
      if (length > 0) {
        initialWord[0] = ans[0];
      }
      setUserWord(initialWord);
      setIsWordCorrect(false);
      setActiveSlotIndex(1); // Focus first blank slot
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

  // Check level clear condition (Both Puzzle & Word solved)
  useEffect(() => {
    if (isPuzzleSolved && isWordCorrect && !levelCleared) {
      setLevelCleared(true);
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isPuzzleSolved, isWordCorrect, levelCleared]);

  const handlePieceClick = (clickedIndex) => {
    if (isPuzzleSolved) return;

    if (selectedPiece === null) {
      setSelectedPiece(clickedIndex);
    } else {
      if (selectedPiece === clickedIndex) {
        setSelectedPiece(null);
        return;
      }
      // Swap pieces
      const newPieces = [...pieces];
      [newPieces[selectedPiece], newPieces[clickedIndex]] = [newPieces[clickedIndex], newPieces[selectedPiece]];
      setPieces(newPieces);
      setSelectedPiece(null);
      setMoves(prev => prev + 1);
    }
  };

  // Keyboard / Word Logic
  const handleKeyboardClick = (char) => {
    if (isWordCorrect || !activeLevel) return;
    const ans = activeLevel.answer;
    
    // Find next empty slot or fill the active one
    const newWord = [...userWord];
    newWord[activeSlotIndex] = char;
    setUserWord(newWord);

    // Auto-focus next slot
    if (activeSlotIndex < ans.length - 1) {
      setActiveSlotIndex(activeSlotIndex + 1);
    }
  };

  const handleBackspace = () => {
    if (isWordCorrect || !activeLevel) return;
    const newWord = [...userWord];
    
    // Clear active slot, or go back and clear previous slot
    if (newWord[activeSlotIndex] !== '') {
      newWord[activeSlotIndex] = '';
    } else if (activeSlotIndex > 1) {
      newWord[activeSlotIndex - 1] = '';
      setActiveSlotIndex(activeSlotIndex - 1);
    }
    setUserWord(newWord);
  };

  const handleSlotClick = (index) => {
    if (isWordCorrect) return;
    // Don't allow selecting the first letter as it is fixed
    if (index === 0) return;
    setActiveSlotIndex(index);
  };

  const goToNextLevel = () => {
    if (currentLevelIndex < levels.length - 1) {
      setCurrentLevelIndex(prev => prev + 1);
      setLevelCleared(false);
      setIsPuzzleSolved(false);
      setIsWordCorrect(false);
    } else {
      setGameFinished(true);
    }
  };

  const restartGame = () => {
    setCurrentLevelIndex(0);
    setGameFinished(false);
    setLevelCleared(false);
    setIsPuzzleSolved(false);
    setIsWordCorrect(false);
  };

  if (levels.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem 2rem',
        color: '#666',
        background: 'rgba(255,255,255,0.9)',
        borderRadius: '2rem',
        border: '4px dashed #ccc'
      }}>
        <Sparkles size={48} style={{ color: '#ccc', marginBottom: '1rem' }} />
        <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>¡Pronto habrá un rompecabezas aquí!</p>
        <p style={{ fontSize: '0.9rem' }}>Las maestras están preparando algo divertido para ti.</p>
      </div>
    );
  }

  if (gameFinished) {
    return (
      <div style={{
        textAlign: 'center',
        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
        padding: '3rem 2rem',
        borderRadius: '2rem',
        boxShadow: '0 10px 30px rgba(255, 165, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        color: '#fff',
        fontFamily: '"Comic Sans MS", sans-serif'
      }}>
        <Trophy size={80} style={{ filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.2))', animation: 'wiggle 1s ease-in-out infinite' }} />
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
          ¡Eres un Campeón Bíblico!
        </h2>
        <p style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>
          ¡Completaste todos los niveles y adivinaste todas las historias! 🌟
        </p>
        <button
          onClick={restartGame}
          style={{
            background: '#8A2BE2',
            color: '#fff',
            border: 'none',
            borderRadius: '999px',
            padding: '0.75rem 2.5rem',
            fontSize: '1.2rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 6px 0px #5c18a3',
            transform: 'translateY(-3px)',
            transition: 'all 0.1s ease',
            marginTop: '1rem'
          }}
          onMouseDown={e => {
            e.currentTarget.style.transform = 'translateY(0px)';
            e.currentTarget.style.boxShadow = '0 2px 0px #5c18a3';
          }}
          onMouseUp={e => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 6px 0px #5c18a3';
          }}
        >
          ¡Jugar de nuevo!
        </button>
        <style>{`
          @keyframes wiggle {
            0%, 100% { transform: rotate(-5deg); }
            50% { transform: rotate(5deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '1.5rem',
      padding: '1.5rem 1rem',
      position: 'relative',
      fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif'
    }}>
      {/* Confetti falling */}
      {showConfetti && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '-10px',
                left: `${Math.random() * 100}%`,
                width: `${8 + Math.random() * 8}px`,
                height: `${8 + Math.random() * 8}px`,
                background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE'][i % 10],
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                animation: `confettiFall ${2.5 + Math.random() * 1.5}s ease-in forwards`,
                animationDelay: `${Math.random() * 1.5}s`,
                transform: `rotate(${Math.random() * 360}deg)`
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

      {/* Top Banner - Level Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '400px' }}>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#4B0082', margin: 0, textShadow: '1px 1px 0px #fff' }}>
          {title}
        </h3>
        <span style={{ background: '#FF1493', color: '#fff', padding: '0.4rem 1.2rem', borderRadius: '999px', fontWeight: 800, fontSize: '0.9rem', border: '3px solid #FFF', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          Nivel {currentLevelIndex + 1} de {levels.length}
        </span>
      </div>

      {/* Jigsaw Solver Board */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%', maxWidth: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.85rem', color: '#666', fontWeight: 700, padding: '0 0.5rem' }}>
          <span>🧩 Movimientos: {moves}</span>
          <span style={{ color: isPuzzleSolved ? '#228B22' : '#e67e22', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {isPuzzleSolved ? <><CheckCircle size={14} /> ¡Rompecabezas Completo!</> : '🧩 Arma el Rompecabezas'}
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
          opacity: imageLoaded ? 1 : 0.4,
          transition: 'all 0.3s ease',
          border: isPuzzleSolved ? '4px solid #32CD32' : '4px solid #FFD700',
          touchAction: 'none',
          userSelect: 'none',
          '-webkit-user-select': 'none',
          position: 'relative'
        }}>
          {!imageLoaded && (
             <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
               <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.8)', borderRadius: '1rem', color: '#4B0082', fontWeight: 800 }}>Cargando...</div>
             </div>
          )}
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
                  backgroundPosition: `${correctCol * (100 / (gridSize - 1))}% ${correctRow * (100 / (gridSize - 1))}%`,
                  borderRadius: '0.5rem',
                  cursor: isPuzzleSolved ? 'default' : 'pointer',
                  border: isSelected 
                    ? '3px solid #FFD700' 
                    : isCorrectPosition && !isPuzzleSolved
                      ? '3px solid rgba(76, 175, 80, 0.6)' 
                      : '3px solid transparent',
                  boxShadow: isSelected 
                    ? '0 0 15px rgba(255, 215, 0, 0.8), inset 0 0 5px rgba(255, 215, 0, 0.3)' 
                    : 'none',
                  transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                {isSelected && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255, 215, 0, 0.15)', borderRadius: '0.4rem' }} />
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
        padding: '1rem',
        borderRadius: '1.25rem',
        boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
        border: '3px solid #1E90FF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h4 style={{ margin: 0, color: '#1E90FF', fontSize: '1.1rem', fontWeight: 800 }}>🤔 ¿Qué historia bíblica es?</h4>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#666' }}>Completa las letras que hacen falta</p>
        </div>

        {/* Word Slots */}
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {userWord.map((char, index) => {
            const isFirst = index === 0;
            const isActive = index === activeSlotIndex;
            return (
              <div
                key={index}
                onClick={() => handleSlotClick(index)}
                style={{
                  width: '36px',
                  height: '42px',
                  borderRadius: '0.5rem',
                  border: isFirst 
                    ? '3px solid #A0A0A0' 
                    : isActive 
                      ? '3px solid #1E90FF' 
                      : '3px solid #DDD',
                  background: isFirst ? '#E0E0E0' : isActive ? '#E6F2FF' : '#FFF',
                  color: isFirst ? '#555' : '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  cursor: isFirst || isWordCorrect ? 'default' : 'pointer',
                  boxShadow: isActive ? '0 0 8px rgba(30, 144, 255, 0.4)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {char || '_'}
              </div>
            );
          })}
        </div>

        {/* Alphabet virtual keyboard */}
        {!isWordCorrect && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {['A','B','C','D','E','F','G','H','I','J','K','L','M'].map(char => (
                <button
                  key={char}
                  onClick={() => handleKeyboardClick(char)}
                  style={{
                    background: '#F0F8FF',
                    border: '2px solid #B0C4DE',
                    borderRadius: '0.35rem',
                    width: '26px',
                    height: '32px',
                    fontSize: '1rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    color: '#4682B4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {char}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {['N','O','P','Q','R','S','T','U','V','W','X','Y','Z'].map(char => (
                <button
                  key={char}
                  onClick={() => handleKeyboardClick(char)}
                  style={{
                    background: '#F0F8FF',
                    border: '2px solid #B0C4DE',
                    borderRadius: '0.35rem',
                    width: '26px',
                    height: '32px',
                    fontSize: '1rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    color: '#4682B4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
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
                border: '2px solid #FF69B4',
                color: '#C71585',
                borderRadius: '0.5rem',
                padding: '0.25rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                marginTop: '0.25rem'
              }}
            >
              Borrar letra ⌫
            </button>
          </div>
        )}

        {isWordCorrect && (
          <div style={{ color: '#228B22', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '1.1rem' }}>
            <CheckCircle size={18} /> ¡Excelente! Palabra Correcta
          </div>
        )}
      </div>

      {/* Victory Level Clear Board */}
      {levelCleared && (
        <div style={{
          textAlign: 'center',
          background: 'linear-gradient(135deg, #32CD32, #228B22)',
          padding: '1.25rem',
          borderRadius: '1.25rem',
          boxShadow: '0 6px 20px rgba(34, 139, 34, 0.25)',
          animation: 'bounceIn 0.4s ease-out',
          width: '100%',
          maxWidth: '340px',
          color: '#FFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Sparkles size={36} style={{ color: '#FFD700', animation: 'spin 4s linear infinite' }} />
          <h4 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
            ¡Nivel Completado! 🎉
          </h4>
          <p style={{ fontSize: '0.95rem', margin: 0, fontWeight: 700 }}>
            {currentLevelIndex === levels.length - 1 ? '¡Completaste todo el juego!' : '¡Desbloqueaste el siguiente nivel!'}
          </p>
          <button
            onClick={goToNextLevel}
            style={{
              background: '#FFD700',
              color: '#8B4500',
              border: 'none',
              borderRadius: '999px',
              padding: '0.6rem 2rem',
              fontSize: '1.1rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 5px 0px #b89b00',
              transform: 'translateY(-2px)',
              transition: 'all 0.1s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem'
            }}
            onMouseDown={e => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 2px 0px #b89b00';
            }}
            onMouseUp={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 5px 0px #b89b00';
            }}
          >
            {currentLevelIndex === levels.length - 1 ? 'Terminar Juego' : 'Siguiente Nivel'}
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Reset button (Mix puzzle again) */}
      {!levelCleared && (
        <button
          onClick={generatePuzzle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#8A2BE2',
            color: '#fff',
            border: 'none',
            borderRadius: '999px',
            padding: '0.5rem 1.5rem',
            fontSize: '0.9rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 0px #5c18a3',
            transform: 'translateY(-2px)',
            transition: 'all 0.1s ease'
          }}
          onMouseDown={e => {
            e.currentTarget.style.transform = 'translateY(0px)';
            e.currentTarget.style.boxShadow = '0 2px 0px #5c18a3';
          }}
          onMouseUp={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 0px #5c18a3';
          }}
        >
          <RotateCcw size={16} />
          Mezclar de nuevo
        </button>
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
