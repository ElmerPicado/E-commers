import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RotateCcw, Trophy, CheckCircle, Brain } from 'lucide-react';

const MemoryGame = ({ gameData }) => {
  const cards = useMemo(() => {
    const list = (gameData?.cards || []).filter(c => c.verse && c.reference);
    return list;
  }, [gameData]);

  // Build pairs: each card becomes two matching tiles (verse + reference)
  const [tiles, setTiles] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [locked, setLocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const initBoard = useCallback(() => {
    const pairs = [];
    cards.forEach((c, idx) => {
      pairs.push({ id: `v-${idx}`, cardIndex: idx, type: 'verse', text: c.verse, image: c.image_url });
      pairs.push({ id: `r-${idx}`, cardIndex: idx, type: 'reference', text: c.reference, image: c.image_url });
    });
    // Shuffle
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    setTiles(pairs);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameFinished(false);
    setLocked(false);
  }, [cards]);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  const handleTileClick = (index) => {
    if (locked || gameFinished) return;
    if (flipped.includes(index)) return;
    if (matched.includes(tiles[index].id)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setLocked(true);
      const [a, b] = newFlipped;
      const tileA = tiles[a];
      const tileB = tiles[b];
      if (tileA.cardIndex === tileB.cardIndex && tileA.type !== tileB.type) {
        // Match
        setTimeout(() => {
          setMatched((prev) => [...prev, tileA.id, tileB.id]);
          setFlipped([]);
          setLocked(false);
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (tiles.length > 0 && matched.length === tiles.length) {
      setGameFinished(true);
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [matched, tiles]);

  if (cards.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem 2rem',
        color: '#666',
        background: 'rgba(255,255,255,0.9)',
        borderRadius: '2rem',
        border: '4px dashed #ccc',
        fontFamily: '"Comic Sans MS", sans-serif'
      }}>
        <Brain size={48} style={{ color: '#ccc', marginBottom: '1rem' }} />
        <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>¡Pronto habrá tarjetas aquí!</p>
        <p style={{ fontSize: '0.9rem' }}>Las maestras están preparando versículos para ti.</p>
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
                background: ['#32CD32', '#228B22', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#98D8C8', '#F7DC6F'][i % 8],
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '500px' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#228B22', margin: 0, textShadow: '1px 1px 0px #fff' }}>
          {gameData?.title || 'Memoria de Versículos'}
        </h3>
        <span style={{ background: '#FF1493', color: '#fff', padding: '0.4rem 1.2rem', borderRadius: '999px', fontWeight: 800, fontSize: '0.9rem', border: '3px solid #FFF' }}>
          Movimientos: {moves}
        </span>
      </div>

      {gameFinished ? (
        <div style={{
          textAlign: 'center',
          background: 'linear-gradient(135deg, #32CD32, #228B22)',
          padding: '3rem 2rem',
          borderRadius: '2rem',
          boxShadow: '0 10px 30px rgba(34, 139, 34, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          color: '#fff',
          width: '100%',
          maxWidth: '500px'
        }}>
          <Trophy size={80} style={{ filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.2))' }} />
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0, textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
            ¡Lo Lograste! 🎉
          </h2>
          <p style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>
            Completaste el juego en {moves} movimientos.
          </p>
          <button
            onClick={initBoard}
            style={{
              background: '#FFD700',
              color: '#8B4500',
              border: 'none',
              borderRadius: '999px',
              padding: '0.75rem 2.5rem',
              fontSize: '1.2rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 6px 0px #b89b00',
              transform: 'translateY(-3px)'
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 2px 0px #b89b00'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 0px #b89b00'; }}
          >
            ¡Jugar de nuevo!
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
          width: '100%',
          maxWidth: '500px',
          padding: '1rem',
          background: '#228B22',
          borderRadius: '1.5rem',
          boxShadow: '0 10px 25px rgba(34, 139, 34, 0.25)'
        }}>
          {tiles.map((tile, idx) => {
            const isFlipped = flipped.includes(idx) || matched.includes(tile.id);
            const isMatched = matched.includes(tile.id);
            return (
              <div
                key={tile.id}
                onClick={() => handleTileClick(idx)}
                style={{
                  aspectRatio: '3 / 4',
                  borderRadius: '1rem',
                  cursor: isFlipped ? 'default' : 'pointer',
                  perspective: '1000px',
                  border: isMatched ? '3px solid #FFD700' : '3px solid transparent'
                }}
              >
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  transition: 'transform 0.5s',
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}>
                  {/* Back of card */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(135deg, #32CD32, #228B22)',
                    borderRadius: '1rem',
                    border: '3px solid #fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    color: '#fff',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                  }}>
                    📖
                  </div>
                  {/* Front of card */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    background: isMatched ? '#FFD700' : '#fff',
                    color: '#333',
                    borderRadius: '1rem',
                    border: `3px solid ${isMatched ? '#32CD32' : '#1E90FF'}`,
                    transform: 'rotateY(180deg)',
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    fontSize: tile.type === 'reference' ? '1.2rem' : '0.85rem',
                    fontWeight: 700,
                    overflow: 'hidden',
                    gap: '0.25rem'
                  }}>
                    {tile.image && (
                      <img src={tile.image} alt="" style={{ width: '100%', maxHeight: '60px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                    )}
                    <span>{tile.text}</span>
                    {isMatched && <CheckCircle size={18} color="#228B22" style={{ position: 'absolute', top: '6px', right: '6px' }} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!gameFinished && (
        <button
          onClick={initBoard}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#32CD32',
            color: '#fff',
            border: 'none',
            borderRadius: '999px',
            padding: '0.5rem 1.5rem',
            fontSize: '0.9rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 0px #1f8a1f',
            transform: 'translateY(-2px)'
          }}
          onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 2px 0px #1f8a1f'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 0px #1f8a1f'; }}
        >
          <RotateCcw size={16} /> Reiniciar
        </button>
      )}
    </div>
  );
};

export default MemoryGame;
