import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, CheckCircle, X, ChevronRight, RotateCcw, Award } from 'lucide-react';

const TriviaGame = ({ gameData }) => {
  const questions = useMemo(() => {
    return (gameData?.questions || []).filter(q => q.question && q.options && q.options.length >= 2);
  }, [gameData]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  // Reset state when questions change
  useEffect(() => {
    setCurrentIdx(0);
    setSelected(null);
    setCorrect(0);
    setAnswered(false);
    setGameFinished(false);
  }, [questions]);

  if (questions.length === 0) {
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
        <Trophy size={48} style={{ color: '#ccc', marginBottom: '1rem' }} />
        <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>¡Pronto habrá preguntas aquí!</p>
        <p style={{ fontSize: '0.9rem' }}>Las maestras están preparando la trivia bíblica.</p>
      </div>
    );
  }

  if (gameFinished) {
    const total = questions.length;
    const pct = Math.round((correct / total) * 100);
    const message = pct === 100 ? '¡Perfecto! Eres un campeón bíblico 🏆'
      : pct >= 70 ? '¡Muy bien! Sabes mucho de la Biblia 🌟'
      : pct >= 50 ? '¡Bien hecho! Sigue aprendiendo 📖'
      : '¡Buen intento! Vuelve a intentarlo 💪';

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
        fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
        maxWidth: '500px',
        margin: '0 auto',
        width: '100%'
      }}>
        <Award size={80} style={{ filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.2))' }} />
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
          {pct >= 70 ? '¡Eres un Campeón!' : '¡Buen Intento!'}
        </h2>
        <div style={{ background: 'rgba(255,255,255,0.25)', padding: '1.5rem 2rem', borderRadius: '1.5rem', border: '3px solid rgba(255,255,255,0.4)' }}>
          <p style={{ fontSize: '3rem', fontWeight: 900, margin: 0 }}>
            {correct} / {total}
          </p>
          <p style={{ fontSize: '1.2rem', margin: '0.5rem 0 0 0', fontWeight: 700 }}>
            [{pct}%]
          </p>
        </div>
        <p style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>
          {message}
        </p>
        <button
          onClick={() => {
            setCurrentIdx(0);
            setSelected(null);
            setCorrect(0);
            setAnswered(false);
            setGameFinished(false);
          }}
          style={{
            background: '#fff',
            color: '#FFA500',
            border: 'none',
            borderRadius: '999px',
            padding: '0.75rem 2.5rem',
            fontSize: '1.2rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 6px 0px #b83214',
            transform: 'translateY(-3px)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 2px 0px #b83214'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 0px #b83214'; }}
        >
          <RotateCcw size={20} /> ¡Jugar de nuevo!
        </button>
      </div>
    );
  }

  const current = questions[currentIdx];

  const handleAnswer = (optIdx) => {
    if (answered) return;
    setSelected(optIdx);
    setAnswered(true);
    if (optIdx === current.correct) {
      setCorrect((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setGameFinished(true);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.5rem',
      padding: '1.5rem 1rem',
      fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
      maxWidth: '500px',
      margin: '0 auto',
      width: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFA500', margin: 0, textShadow: '1px 1px 0 #fff' }}>
          {gameData?.title || 'Trivia Bíblica'}
        </h3>
        <span style={{
          background: current.correct === selected && answered ? '#32CD32' : '#FF1493',
          color: '#fff',
          padding: '0.4rem 1.2rem',
          borderRadius: '999px',
          fontWeight: 800,
          fontSize: '0.9rem',
          border: '3px solid #FFF'
        }}>
          Pregunta {currentIdx + 1}/{questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', height: '12px', background: '#FFF', borderRadius: '999px', overflow: 'hidden', border: '3px solid #FFA500' }}>
        <div style={{
          height: '100%',
          width: `${((currentIdx) / questions.length) * 100}%`,
          background: 'linear-gradient(90deg, #FFD700, #FFA500)',
          transition: 'width 0.3s ease'
        }} />
      </div>

      <div style={{
        background: '#FFF',
        padding: '2rem 1.5rem',
        borderRadius: '1.5rem',
        boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
        border: '3px solid #FFA500',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h4 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#4B0082', textAlign: 'center' }}>
          {current.question}
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {current.options.map((option, optIdx) => {
            const isSelected = selected === optIdx;
            const isCorrect = answered && optIdx === current.correct;
            const isWrong = answered && isSelected && optIdx !== current.correct;

            let bg = '#F0F8FF';
            let color = '#4682B4';
            let border = '2px solid #FFD700';
            let icon = null;

            if (isCorrect) {
              bg = '#32CD32';
              color = '#fff';
              border = '2px solid #228B22';
              icon = <CheckCircle size={20} color="#fff" />;
            } else if (isWrong) {
              bg = '#FF6B6B';
              color = '#fff';
              border = '2px solid #c92a2a';
              icon = <X size={20} color="#fff" />;
            } else if (answered) {
              bg = '#F0F8FF';
              color = '#888';
              border = '2px solid #DDD';
            }

            return (
              <button
                key={optIdx}
                onClick={() => handleAnswer(optIdx)}
                disabled={answered}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1.25rem',
                  background: bg,
                  color: color,
                  border: border,
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: answered ? 'default' : 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  flexShrink: 0
                }}>
                  {icon ? icon : String.fromCharCode(65 + optIdx)}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div style={{
            marginTop: '0.5rem',
            padding: '0.75rem',
            background: selected === current.correct ? 'rgba(34, 139, 34, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderRadius: '0.75rem',
            textAlign: 'center',
            color: selected === current.correct ? '#228B22' : '#c92a2a',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center'
          }}>
            {selected === current.correct ? (
              <><CheckCircle size={20} /> ¡Correcto! 🎉</>
            ) : (
              <><X size={20} /> La respuesta correcta es "{current.options[current.correct]}"</>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={!answered}
        style={{
          background: answered ? '#FFD700' : '#DDD',
          color: '#8B4500',
          border: 'none',
          borderRadius: '999px',
          padding: '0.75rem 2rem',
          fontSize: '1.1rem',
          fontWeight: 800,
          cursor: answered ? 'pointer' : 'not-allowed',
          boxShadow: answered ? '0 5px 0px #b89b00' : 'none',
          transform: answered ? 'translateY(-2px)' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        {currentIdx === questions.length - 1 ? 'Ver Resultado' : 'Siguiente'}
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default TriviaGame;
