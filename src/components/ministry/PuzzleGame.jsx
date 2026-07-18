import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, Sparkles } from 'lucide-react';

const PuzzleGame = ({ imageUrl, difficulty = '3x3', title = 'Rompecabezas Bíblico' }) => {
  const gridSize = difficulty === '4x4' ? 4 : 3;
  const totalPieces = gridSize * gridSize;
  
  const [pieces, setPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [moves, setMoves] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Generate shuffled pieces
  const generatePuzzle = useCallback(() => {
    const ordered = Array.from({ length: totalPieces }, (_, i) => i);
    // Fisher-Yates shuffle, ensuring it's not already solved
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
    setIsSolved(false);
    setMoves(0);
    setShowConfetti(false);
  }, [totalPieces]);

  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  // Preload the image
  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.src = imageUrl;
    }
  }, [imageUrl]);

  // Check if puzzle is solved
  useEffect(() => {
    if (pieces.length > 0 && pieces.every((val, idx) => val === idx)) {
      setIsSolved(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [pieces]);

  const handlePieceClick = (clickedIndex) => {
    if (isSolved) return;

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

  if (!imageUrl) {
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

  const pieceSize = 100 / gridSize;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '1.5rem',
      padding: '2rem',
      position: 'relative'
    }}>
      {/* Confetti Effect */}
      {showConfetti && (
        <div style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          overflow: 'hidden'
        }}>
          {Array.from({ length: 50 }).map((_, i) => (
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
                animation: `confettiFall ${2 + Math.random() * 2}s ease-in forwards`,
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

      {/* Title */}
      <h3 style={{
        fontSize: '2rem',
        fontWeight: 900,
        color: '#4B0082',
        textShadow: '2px 2px 0px rgba(0,0,0,0.1)',
        fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
        margin: 0
      }}>
        {title}
      </h3>

      {/* Info Bar */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.9)',
        padding: '0.75rem 2rem',
        borderRadius: '999px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '3px solid #FFD700'
      }}>
        <span style={{ fontWeight: 700, color: '#4B0082', fontFamily: '"Comic Sans MS", sans-serif' }}>
          🧩 Movimientos: {moves}
        </span>
        <span style={{ fontWeight: 700, color: '#4B0082', fontFamily: '"Comic Sans MS", sans-serif' }}>
          📐 {difficulty}
        </span>
      </div>

      {/* Help Text */}
      {!isSolved && (
        <p style={{
          color: '#666',
          fontSize: '1rem',
          fontWeight: 600,
          fontFamily: '"Comic Sans MS", sans-serif',
          margin: 0,
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          👆 Toca dos piezas para intercambiarlas
          <style>{`
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
          `}</style>
        </p>
      )}

      {/* Puzzle Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gap: '4px',
        width: '100%',
        maxWidth: '400px',
        aspectRatio: '1 / 1',
        background: '#4B0082',
        padding: '4px',
        borderRadius: '1rem',
        boxShadow: '0 10px 30px rgba(75, 0, 130, 0.3)',
        opacity: imageLoaded ? 1 : 0.3,
        transition: 'opacity 0.3s'
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
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                backgroundPosition: `${correctCol * (100 / (gridSize - 1))}% ${correctRow * (100 / (gridSize - 1))}%`,
                borderRadius: '0.5rem',
                cursor: isSolved ? 'default' : 'pointer',
                border: isSelected 
                  ? '3px solid #FFD700' 
                  : isCorrectPosition && !isSolved
                    ? '3px solid rgba(76, 175, 80, 0.5)' 
                    : '3px solid transparent',
                boxShadow: isSelected 
                  ? '0 0 20px rgba(255, 215, 0, 0.6), inset 0 0 10px rgba(255, 215, 0, 0.2)' 
                  : '0 2px 4px rgba(0,0,0,0.1)',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(255, 215, 0, 0.15)',
                  animation: 'selectedPulse 1s ease-in-out infinite'
                }} />
              )}
            </div>
          );
        })}
        <style>{`
          @keyframes selectedPulse {
            0%, 100% { background: rgba(255, 215, 0, 0.15); }
            50% { background: rgba(255, 215, 0, 0.3); }
          }
        `}</style>
      </div>

      {/* Reference Image (small) */}
      <details style={{ width: '100%', maxWidth: '400px' }}>
        <summary style={{
          cursor: 'pointer',
          color: '#4B0082',
          fontWeight: 700,
          fontSize: '0.9rem',
          fontFamily: '"Comic Sans MS", sans-serif',
          textAlign: 'center',
          padding: '0.5rem',
          userSelect: 'none'
        }}>
          🖼️ Ver imagen de referencia
        </summary>
        <img
          src={imageUrl}
          alt="Referencia"
          style={{
            width: '100%',
            borderRadius: '1rem',
            marginTop: '0.5rem',
            border: '3px solid #E0E0E0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        />
      </details>

      {/* Victory Message */}
      {isSolved && (
        <div style={{
          textAlign: 'center',
          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
          padding: '2rem',
          borderRadius: '2rem',
          boxShadow: '0 10px 30px rgba(255, 165, 0, 0.3)',
          animation: 'bounceIn 0.5s ease-out',
          width: '100%',
          maxWidth: '400px'
        }}>
          <Trophy size={48} style={{ color: '#fff', marginBottom: '0.5rem' }} />
          <h3 style={{
            fontSize: '2rem',
            fontWeight: 900,
            color: '#fff',
            margin: '0 0 0.5rem 0',
            fontFamily: '"Comic Sans MS", sans-serif',
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
          }}>
            ¡Lo lograste! 🎉
          </h3>
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 600,
            fontFamily: '"Comic Sans MS", sans-serif',
            margin: 0
          }}>
            ¡Completaste el rompecabezas en {moves} movimientos!
          </p>
          <style>{`
            @keyframes bounceIn {
              0% { transform: scale(0.3); opacity: 0; }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* Shuffle Button */}
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
          padding: '0.75rem 2rem',
          fontSize: '1.1rem',
          fontWeight: 800,
          fontFamily: '"Comic Sans MS", sans-serif',
          cursor: 'pointer',
          boxShadow: '0 6px 0px rgba(0,0,0,0.2)',
          transform: 'translateY(-3px)',
          transition: 'all 0.1s ease'
        }}
        onMouseDown={e => {
          e.currentTarget.style.transform = 'translateY(0px)';
          e.currentTarget.style.boxShadow = '0 2px 0px rgba(0,0,0,0.2)';
        }}
        onMouseUp={e => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 6px 0px rgba(0,0,0,0.2)';
        }}
      >
        <RotateCcw size={20} />
        {isSolved ? '¡Jugar de nuevo!' : 'Mezclar de nuevo'}
      </button>
    </div>
  );
};

export default PuzzleGame;
