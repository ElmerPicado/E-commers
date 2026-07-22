import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Download, Sparkles, ChevronRight, Image as ImageIcon, X, Trash2 } from 'lucide-react';

const ColoringGame = ({ coloringData, initialLevelIndex = 0, onNextLevel }) => {
  // Parse levels with legacy fallback
  const levels = React.useMemo(() => {
    if (coloringData && Array.isArray(coloringData.levels) && coloringData.levels.length > 0) {
      return coloringData.levels;
    }
    if (coloringData && coloringData.image_url) {
      return [{
        id: 'legacy',
        image_url: coloringData.image_url,
        title: coloringData.title || 'Noé y el Arca'
      }];
    }
    return [];
  }, [coloringData]);

  const [currentLevelIndex, setCurrentLevelIndex] = useState(initialLevelIndex);

  useEffect(() => {
    if (initialLevelIndex !== undefined && initialLevelIndex !== currentLevelIndex) {
      setCurrentLevelIndex(initialLevelIndex);
    }
  }, [initialLevelIndex]);

  const activeLevel = levels[currentLevelIndex] || levels[0];

  // Tool states: 'brush', 'eraser', 'fill'
  const [tool, setTool] = useState('brush');
  const [brushColor, setBrushColor] = useState('#FF0000');
  const [brushSize, setBrushSize] = useState(20);

  // Gallery & Completion states
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [completedDrawings, setCompletedDrawings] = useState({});
  const [gameFinished, setGameFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);

  const title = activeLevel?.title || coloringData?.title || 'Coloreando la Biblia';

  // Cargar imagen de fondo en el Canvas de forma segura (CORS fix)
  const drawBaseImage = useCallback((callback) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = "anonymous"; // Solución clave para evitar errores CORS y bloqueos blob
    img.src = activeLevel.image_url;

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([snapshot]);
      if (callback) callback();
    };

    img.onerror = () => {
      console.error("No se pudo cargar la imagen de forma directa. Verificando políticas del servidor.");
    };
  }, [activeLevel]);

  // Inicializar canvas al cambiar de nivel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Definir tamaño interno fijo de alta resolución para el lienzo
    canvas.width = 600;
    canvas.height = 800;
    drawBaseImage();
  }, [currentLevelIndex, drawBaseImage]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (tool === 'fill') {
      // Acción de relleno (Flood Fill básico o marca de progreso)
      floodFill(Math.floor(x), Math.floor(y), brushColor);
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
    }
  };

  const draw = (e) => {
    if (!isDrawing || tool === 'fill') return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.closePath();

    // Guardar estado en historial
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev, snapshot]);

    // Marcar como completado/avanzado
    setCompletedDrawings(prev => ({ ...prev, [currentLevelIndex]: true }));
  };

  // Algoritmo simplificado de relleno (Flood Fill)
  const floodFill = (startX, startY, fillColor) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const targetIdx = (startY * canvas.width + startX) * 4;
    const startR = data[targetIdx];
    const startG = data[targetIdx + 1];
    const startB = data[targetIdx + 2];
    const startA = data[targetIdx + 3];

    // Convertir color HEX a RGB
    const rHex = parseInt(fillColor.slice(1, 3), 16);
    const gHex = parseInt(fillColor.slice(3, 5), 16);
    const bHex = parseInt(fillColor.slice(5, 7), 16);

    if (startR === rHex && startG === gHex && startB === bHex) return;

    // Límite simple para evitar bloqueos por recursión profunda en JS
    const queue = [[startX, startY]];
    const visited = new Uint8Array(canvas.width * canvas.height);

    while (queue.length > 0) {
      const [x, y] = queue.pop();
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
      const idx = y * canvas.width + x;
      if (visited[idx]) continue;
      visited[idx] = 1;

      const pIdx = idx * 4;
      // Comprobar si el píxel coincide con el color original (con tolerancia para bordes)
      if (
        Math.abs(data[pIdx] - startR) < 30 &&
        Math.abs(data[pIdx + 1] - startG) < 30 &&
        Math.abs(data[pIdx + 2] - startB) < 30
      ) {
        data[pIdx] = rHex;
        data[pIdx + 1] = gHex;
        data[pIdx + 2] = bHex;
        data[pIdx + 3] = 255;

        queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev, snapshot]);
    setCompletedDrawings(prev => ({ ...prev, [currentLevelIndex]: true }));
  };

  const clearCanvas = () => {
    drawBaseImage();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `coloreo-${currentLevelIndex + 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Exportación bloqueada por políticas CORS del servidor de imágenes:", error);
      window.open(activeLevel.image_url, "_blank");
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.8rem',
      padding: '1rem 0.5rem',
      fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
      width: '100%',
      maxWidth: '100vw',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      {/* Encabezado y Selector */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '360px',
        boxSizing: 'border-box'
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#4B0082', margin: 0 }}>
          {title}
        </h3>
        <button
          onClick={() => setIsGalleryOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.3rem 0.8rem',
            background: '#FFF',
            color: '#1E90FF',
            border: '2px solid #1E90FF',
            borderRadius: '999px',
            fontWeight: 800,
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
        >
          <ImageIcon size={14} /> Dibujo ({currentLevelIndex + 1}/{levels.length})
        </button>
      </div>

      {/* Paleta de Colores y Herramientas */}
      <div style={{
        width: '100%',
        maxWidth: '360px',
        background: '#FFF',
        padding: '0.75rem',
        borderRadius: '1.25rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        border: '3px solid #FF69B4',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        boxSizing: 'border-box'
      }}>
        {/* Colores */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          {['#FF0000', '#FF8C00', '#FFD700', '#32CD32', '#00CED1', '#1E90FF', '#9370DB', '#FF69B4', '#000000', '#8B4500', '#FFFFFF'].map(c => (
            <button
              key={c}
              onClick={() => { setBrushColor(c); if (tool === 'eraser') setTool('brush'); }}
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: c,
                border: brushColor === c && tool !== 'eraser' ? '3px solid #333' : '2px solid #ddd',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
          ))}
        </div>

        {/* Herramientas (Pincel, Borrador, Relleno) y Grosor */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            <button
              onClick={() => setTool('brush')}
              style={{
                padding: '0.25rem 0.6rem',
                borderRadius: '999px',
                border: 'none',
                background: tool === 'brush' ? '#FF1493' : '#F0F0F0',
                color: tool === 'brush' ? '#FFF' : '#333',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Pincel
            </button>
            <button
              onClick={() => setTool('eraser')}
              style={{
                padding: '0.25rem 0.6rem',
                borderRadius: '999px',
                border: 'none',
                background: tool === 'eraser' ? '#FF1493' : '#F0F0F0',
                color: tool === 'eraser' ? '#FFF' : '#333',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Borrador
            </button>
            <button
              onClick={() => setTool('fill')}
              style={{
                padding: '0.25rem 0.6rem',
                borderRadius: '999px',
                border: 'none',
                background: tool === 'fill' ? '#FF1493' : '#F0F0F0',
                color: tool === 'fill' ? '#FFF' : '#333',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Rellenar
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>Tamaño:</span>
            <input
              type="range"
              min="5"
              max="40"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              style={{ width: '70px' }}
            />
          </div>
        </div>
      </div>

      {/* Lienzo / Canvas Interactivo */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '360px',
        aspectRatio: '3 / 4',
        background: '#FFF',
        borderRadius: '1.25rem',
        overflow: 'hidden',
        border: '4px solid #FFD700',
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
        touchAction: 'none'
      }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ width: '100%', height: '100%', display: 'block', cursor: tool === 'fill' ? 'copy' : 'crosshair' }}
        />
      </div>

      {/* Botones de AcciónInferiores */}
      <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '360px' }}>
        <button
          onClick={clearCanvas}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem',
            background: '#FF6B6B',
            color: '#fff',
            border: 'none',
            borderRadius: '999px',
            padding: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 3px 0px #c53b3b'
          }}
        >
          <Trash2 size={15} /> Limpiar
        </button>
        <button
          onClick={handleDownload}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem',
            background: '#27AE60',
            color: '#fff',
            border: 'none',
            borderRadius: '999px',
            padding: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 3px 0px #145A32'
          }}
        >
          <Download size={15} /> Descargar
        </button>
      </div>

      {/* Modal de Galería / Selección de Dibujos */}
      {isGalleryOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
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
            maxWidth: '420px',
            width: '100%',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            border: '4px solid #1E90FF',
            boxShadow: '0 15px 30px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <h4 style={{ margin: 0, color: '#1E90FF', fontSize: '1.1rem', fontWeight: 900 }}>
                🎨 Elige un Dibujo
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
                const isDone = completedDrawings[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentLevelIndex(idx);
                      setIsGalleryOpen(false);
                    }}
                    style={{
                      position: 'relative',
                      border: `3px solid ${isSelected ? '#1E90FF' : isDone ? '#32CD32' : '#E2E8F0'}`,
                      borderRadius: '1rem',
                      padding: '0.4rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: isSelected ? '#E6F2FF' : '#FFF'
                    }}
                  >
                    <div style={{ width: '100%', height: '80px', borderRadius: '0.5rem', overflow: 'hidden', background: '#F8FAFC', marginBottom: '0.3rem' }}>
                      <img
                        src={lvl.image_url}
                        crossOrigin="anonymous"
                        alt={lvl.title || `Dibujo ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: '#333' }}>
                      Dibujo {idx + 1}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColoringGame;