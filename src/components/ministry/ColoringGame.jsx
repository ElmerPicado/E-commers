import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Palette, Download, RotateCcw, Check, Eraser } from 'lucide-react';

const ColoringGame = ({ gameData }) => {
  const pages = useMemo(() => {
    return (gameData?.pages || []).filter(p => p.image_url);
  }, [gameData]);

  const [activePageIdx, setActivePageIdx] = useState(0);
  const [color, setColor] = useState('#FF0000');
  const [tool, setTool] = useState('brush'); // 'brush' | 'fill'
  const [brushSize, setBrushSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const [finished, setFinished] = useState(false);
  const canvasRef = useRef(null);
  const [forceReload, setForceReload] = useState(0);

  // Reset when page changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pages.length) return;
    const page = pages[activePageIdx];
    setFinished(false);
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Fit to canvas size while keeping aspect
      const maxW = 600, maxH = 600;
      let w = img.width, h = img.height;
      const scale = Math.min(maxW / w, maxH / h);
      canvas.width = w * scale;
      canvas.height = h * scale;
      // White background so we can "color" over the drawing (line art assumed)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.onerror = () => {
      const maxW = 500, maxH = 500;
      canvas.width = maxW;
      canvas.height = maxH;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.font = '20px "Comic Sans MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Imagen no disponible', canvas.width / 2, canvas.height / 2);
    };
    img.src = page.image_url;
  }, [activePageIdx, pages, forceReload]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
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

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e);

    if (tool === 'fill') {
      // Simple-ish fill: flood fill at point
      try {
        floodFill(ctx, Math.round(x), Math.round(y), hexToRgba(color));
      } catch (err) {
        console.error(err);
      }
      setFinished(true);
      return;
    }

    // Eraser tool uses white color with larger size
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e) => {
    if (!isDrawing || tool === 'fill') return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    // Reset composite operation after eraser
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.globalCompositeOperation = 'source-over';
    }
    setFinished(true);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // Clear canvas and reload original image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Force reload by briefly changing the key
    setForceReload((r) => r + 1);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `mi-dibujo-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (pages.length === 0) {
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
        <Palette size={48} style={{ color: '#ccc', marginBottom: '1rem' }} />
        <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>¡Pronto habrá dibujos aquí!</p>
        <p style={{ fontSize: '0.9rem' }}>Las maestras están preparando dibujos para ti.</p>
      </div>
    );
  }

  const palette = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#00BFFF', '#0000FF', '#8A2BE2', '#FF1493', '#000000', '#FFFFFF', '#8B4513', '#32CD32'];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.25rem',
      padding: '1.5rem 1rem',
      fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '600px' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FF69B4', margin: 0, textShadow: '1px 1px 0 #fff' }}>
          {gameData?.title || 'Coloreando la Biblia'}
        </h3>
        {finished && (
          <span style={{ background: '#32CD32', color: '#fff', padding: '0.4rem 1rem', borderRadius: '999px', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', border: '3px solid #FFF' }}>
            <Check size={14} /> ¡Terminado!
          </span>
        )}
      </div>

      {/* Page selector */}
      {pages.length > 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', maxWidth: '600px' }}>
          {pages.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setActivePageIdx(idx)}
              style={{
                padding: '0.5rem 1rem',
                background: idx === activePageIdx ? 'linear-gradient(135deg, #FF69B4, #FF1493)' : '#FFF',
                color: idx === activePageIdx ? '#fff' : '#333',
                border: `2px solid ${idx === activePageIdx ? '#FF1493' : '#DDD'}`,
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {p.title || `Dibujo ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      <h4 style={{ margin: 0, color: '#4B0082', fontSize: '1.1rem' }}>{pages[activePageIdx]?.title}</h4>

      {/* Tools */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '600px' }}>
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {palette.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: c,
                border: `3px solid ${color === c ? '#333' : '#FFF'}`,
                cursor: 'pointer',
                boxShadow: color === c ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
              title={c}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', padding: '0.4rem', background: '#FFF', borderRadius: '0.75rem', border: '2px solid #FF69B4' }}>
          <button
            onClick={() => setTool('brush')}
            style={{
              padding: '0.35rem 0.8rem',
              background: tool === 'brush' ? '#FF69B4' : 'transparent',
              color: tool === 'brush' ? '#fff' : '#FF69B4',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            🖌️ Pincel
          </button>
          <button
            onClick={() => setTool('eraser')}
            style={{
              padding: '0.35rem 0.8rem',
              background: tool === 'eraser' ? '#FF69B4' : 'transparent',
              color: tool === 'eraser' ? '#fff' : '#FF69B4',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            🧽 Borrador
          </button>
          <button
            onClick={() => setTool('fill')}
            style={{
              padding: '0.35rem 0.8rem',
              background: tool === 'fill' ? '#FF69B4' : 'transparent',
              color: tool === 'fill' ? '#fff' : '#FF69B4',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            🪣 Rellenar
          </button>
        </div>
      </div>

      {(tool === 'brush' || tool === 'eraser') && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FF69B4' }}>Tamaño:</label>
          <input
            type="range"
            min="5"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
          />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FF69B4' }}>{brushSize}px</span>
        </div>
      )}

      {/* Canvas */}
      <div style={{
        background: '#FFF',
        padding: '0.5rem',
        borderRadius: '1.5rem',
        border: '5px solid #FF69B4',
        boxShadow: '0 12px 30px rgba(255, 105, 180, 0.25)'
      }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          style={{
            display: 'block',
            maxWidth: '100%',
            height: 'auto',
            cursor: tool === 'brush' ? 'crosshair' : tool === 'eraser' ? 'cell' : 'pointer',
            borderRadius: '1rem',
            touchAction: 'none'
          }}
        />
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={clearCanvas}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#FF69B4',
            color: '#fff',
            border: 'none',
            borderRadius: '999px',
            padding: '0.5rem 1.5rem',
            fontSize: '0.9rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 0px #c71585',
            transform: 'translateY(-2px)'
          }}
          onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 2px 0px #c71585'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 0px #c71585'; }}
        >
          <RotateCcw size={16} /> Limpiar
        </button>
        <button
          onClick={downloadCanvas}
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
            boxShadow: '0 4px 0px #228B22',
            transform: 'translateY(-2px)'
          }}
          onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 2px 0px #228B22'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 0px #228B22'; }}
        >
          <Download size={16} /> Descargar
        </button>
      </div>
    </div>
  );
};

// ========== Helpers ==========
function hexToRgba(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b, a: 255 };
}

// Flood fill algorithm (simple stack-based)
function floodFill(ctx, x, y, fillColor) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const startIdx = (y * w + x) * 4;
  const startColor = {
    r: data[startIdx],
    g: data[startIdx + 1],
    b: data[startIdx + 2],
    a: data[startIdx + 3]
  };

  // Don't fill if same color
  if (startColor.r === fillColor.r && startColor.g === fillColor.g && startColor.b === fillColor.b) return;

  const stack = [{ x, y }];
  const visited = new Set();

  while (stack.length > 0) {
    const { x: px, y: py } = stack.pop();
    if (px < 0 || py < 0 || px >= w || py >= h) continue;
    const key = `${px},${py}`;
    if (visited.has(key)) continue;

    const idx = (py * w + px) * 4;
    if (
      data[idx] !== startColor.r ||
      data[idx + 1] !== startColor.g ||
      data[idx + 2] !== startColor.b ||
      data[idx + 3] !== startColor.a
    ) continue;

    visited.add(key);
    data[idx] = fillColor.r;
    data[idx + 1] = fillColor.g;
    data[idx + 2] = fillColor.b;
    data[idx + 3] = fillColor.a;

    stack.push({ x: px + 1, y: py });
    stack.push({ x: px - 1, y: py });
    stack.push({ x: px, y: py + 1 });
    stack.push({ x: px, y: py - 1 });
  }

  ctx.putImageData(imgData, 0, 0);
}

export default ColoringGame;
