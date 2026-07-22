import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Palette, Download, RotateCcw, Check, Image as ImageIcon, X, Maximize2, Minimize2 } from 'lucide-react';

const ColoringGame = ({ gameData }) => {
  const pages = useMemo(() => {
    return (gameData?.pages || []).filter(p => p.image_url);
  }, [gameData]);

  const [activePageIdx, setActivePageIdx] = useState(0);
  const [color, setColor] = useState('#FF0000');
  const [tool, setTool] = useState('brush'); // 'brush' | 'eraser' | 'fill'
  const [brushSize, setBrushSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const [finished, setFinished] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const templateImageRef = useRef(null);

  const [dimensions, setDimensions] = useState({ width: 320, height: 320 });
  const [currentImgUrl, setCurrentImgUrl] = useState('');

  // Configuración segura de dimensiones y carga de imagen principal
  useEffect(() => {
    if (!pages.length) return;
    const page = pages[activePageIdx];
    if (!page?.image_url) return;

    // Evitamos problemas de caché y URLs blob malformadas
    const rawUrl = page.image_url;
    const cacheBustedUrl = rawUrl.startsWith('blob:')
      ? rawUrl
      : rawUrl + (rawUrl.includes('?') ? '&' : '?') + 't=' + Date.now();

    setCurrentImgUrl(cacheBustedUrl);

    const img = new Image();
    if (!rawUrl.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      templateImageRef.current = img;

      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const isMobile = screenWidth <= 480;

      let maxW, maxH;

      if (isFullscreen) {
        maxW = screenWidth - 32;
        maxH = screenHeight - (isMobile ? 180 : 210);
      } else {
        maxW = isMobile ? Math.min(screenWidth - 32, 340) : Math.min(screenWidth - 40, 500);
        maxH = isMobile ? Math.min(screenHeight * 0.38, 380) : Math.min(screenHeight * 0.5, 500);
      }

      let w = img.width || 300;
      let h = img.height || 300;
      const scale = Math.min(maxW / w, maxH / h);

      const finalW = Math.max(Math.round(w * scale), 200);
      const finalH = Math.max(Math.round(h * scale), 200);

      const currentCanvas = canvasRef.current;
      let savedDataUrl = null;
      if (currentCanvas && currentCanvas.width > 0 && currentCanvas.height > 0) {
        try {
          savedDataUrl = currentCanvas.toDataURL('image/png');
        } catch (e) {
          console.warn("No se pudo respaldar el canvas anterior:", e);
        }
      }

      setDimensions({ width: finalW, height: finalH });

      setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = finalW;
        canvas.height = finalH;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, finalW, finalH);

        if (savedDataUrl) {
          const savedImg = new Image();
          savedImg.onload = () => {
            ctx.drawImage(savedImg, 0, 0, finalW, finalH);
          };
          savedImg.src = savedDataUrl;
        } else {
          ctx.drawImage(img, 0, 0, finalW, finalH);
        }
      }, 50);
    };

    img.onerror = (err) => {
      console.error("Error al cargar la imagen del dibujo:", err);
    };

    img.src = cacheBustedUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [activePageIdx, pages, isFullscreen]);

  const getPos = (e) => {
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

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e);

    if (tool === 'fill') {
      try {
        floodFill(ctx, Math.round(x), Math.round(y), hexToRgba(color));
      } catch (err) {
        console.error(err);
      }
      setFinished(true);
      return;
    }

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'source-over';
      const size = brushSize * 1.5;

      if (templateImageRef.current) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(templateImageRef.current, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || tool === 'fill') return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e);

    if (tool === 'eraser') {
      const size = brushSize * 1.5;
      if (templateImageRef.current) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(templateImageRef.current, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setFinished(true);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (templateImageRef.current) {
      ctx.drawImage(templateImageRef.current, 0, 0, canvas.width, canvas.height);
    }

    setFinished(false);
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
      gap: '0.6rem',
      padding: '0.4rem',
      fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
      ...(isFullscreen ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#FFF0F5',
        zIndex: 9998,
        overflowY: 'auto',
        padding: '0.6rem'
      } : {})
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '500px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FF69B4', margin: 0, textShadow: '1px 1px 0 #fff' }}>
          {gameData?.title || 'Coloreando la Biblia'}
        </h3>
        {finished && (
          <span style={{ background: '#32CD32', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem', border: '2px solid #FFF' }}>
            <Check size={14} /> ¡Terminado!
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {pages.length > 1 && (
          <button
            onClick={() => setIsGalleryOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.9rem',
              background: '#FFF',
              color: '#FF69B4',
              border: '2px solid #FF69B4',
              borderRadius: '999px',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              boxShadow: '0 3px 8px rgba(255, 105, 180, 0.2)'
            }}
          >
            <ImageIcon size={15} /> Cambiar Dibujo ({activePageIdx + 1}/{pages.length})
          </button>
        )}
        <span style={{ color: '#4B0082', fontWeight: 800, fontSize: '0.9rem' }}>
          {pages[activePageIdx]?.title}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '500px' }}>
        {palette.map((c) => (
          <button
            key={c}
            onClick={() => { setColor(c); if (tool === 'eraser') setTool('brush'); }}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: c,
              border: `2px solid ${color === c && tool !== 'eraser' ? '#333' : '#FFF'}`,
              cursor: 'pointer',
              boxShadow: color === c && tool !== 'eraser' ? '0 2px 6px rgba(0,0,0,0.3)' : 'none',
              transition: 'all 0.15s ease'
            }}
            title={c}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center', padding: '0.2rem', background: '#FFF', borderRadius: '0.6rem', border: '2px solid #FF69B4' }}>
          <button
            onClick={() => setTool('brush')}
            style={{
              padding: '0.25rem 0.5rem',
              background: tool === 'brush' ? '#FF69B4' : 'transparent',
              color: tool === 'brush' ? '#fff' : '#FF69B4',
              border: 'none',
              borderRadius: '0.4rem',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.75rem'
            }}
          >
            🖌️ Pincel
          </button>
          <button
            onClick={() => setTool('eraser')}
            style={{
              padding: '0.25rem 0.5rem',
              background: tool === 'eraser' ? '#FF69B4' : 'transparent',
              color: tool === 'eraser' ? '#fff' : '#FF69B4',
              border: 'none',
              borderRadius: '0.4rem',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.75rem'
            }}
          >
            🧽 Borrador
          </button>
          <button
            onClick={() => setTool('fill')}
            style={{
              padding: '0.25rem 0.5rem',
              background: tool === 'fill' ? '#FF69B4' : 'transparent',
              color: tool === 'fill' ? '#fff' : '#FF69B4',
              border: 'none',
              borderRadius: '0.4rem',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.75rem'
            }}
          >
            🪣 Rellenar
          </button>
        </div>

        {(tool === 'brush' || tool === 'eraser') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <input
              type="range"
              min="5"
              max="40"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              style={{ width: '80px' }}
            />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FF69B4' }}>{brushSize}px</span>
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          background: '#FFF',
          borderRadius: '1.2rem',
          border: '4px solid #FF69B4',
          boxShadow: '0 8px 20px rgba(255, 105, 180, 0.2)',
          overflow: 'hidden',
          touchAction: 'none'
        }}
      >
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
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            cursor: tool === 'brush' ? 'crosshair' : tool === 'eraser' ? 'cell' : 'pointer',
            zIndex: 1
          }}
        />

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? "Minimizar" : "Pantalla completa"}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            zIndex: 10,
            background: 'rgba(255, 255, 255, 0.9)',
            border: '2px solid #FF69B4',
            color: '#FF69B4',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
            transition: 'transform 0.1s ease'
          }}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center', paddingBottom: isFullscreen ? '1rem' : '0' }}>
        <button
          onClick={clearCanvas}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#FF69B4',
            color: '#fff',
            border: 'none',
            borderRadius: '999px',
            padding: '0.4rem 1.1rem',
            fontSize: '0.8rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 3px 0px #c71585'
          }}
        >
          <RotateCcw size={14} /> Limpiar
        </button>
        <button
          onClick={downloadCanvas}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#32CD32',
            color: '#fff',
            border: 'none',
            borderRadius: '999px',
            padding: '0.4rem 1.1rem',
            fontSize: '0.8rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 3px 0px #228B22'
          }}
        >
          <Download size={14} /> Descargar
        </button>
      </div>

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
            border: '4px solid #FF69B4',
            boxShadow: '0 15px 30px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <h4 style={{ margin: 0, color: '#4B0082', fontSize: '1.1rem', fontWeight: 900 }}>
                🎨 Elige un dibujo
              </h4>
              <button
                onClick={() => setIsGalleryOpen(false)}
                style={{
                  border: 'none',
                  background: '#FFF0F5',
                  color: '#FF1493',
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
              {pages.map((p, idx) => {
                const isSelected = idx === activePageIdx;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setActivePageIdx(idx);
                      setIsGalleryOpen(false);
                    }}
                    style={{
                      border: `3px solid ${isSelected ? '#FF69B4' : '#E2E8F0'}`,
                      borderRadius: '1rem',
                      padding: '0.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: isSelected ? '#FFF0F5' : '#FFF',
                      boxShadow: isSelected ? '0 4px 10px rgba(255,105,180,0.3)' : '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div style={{ width: '100%', height: '75px', borderRadius: '0.6rem', overflow: 'hidden', background: '#F8FAFC', marginBottom: '0.3rem' }}>
                      <img
                        src={p.image_url}
                        {...(!p.image_url.startsWith('blob:') ? { crossOrigin: "anonymous" } : {})}
                        alt={p.title || `Dibujo ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: isSelected ? '#FF1493' : '#333',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {p.title || `Dibujo ${idx + 1}`}
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

function hexToRgba(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b, a: 255 };
}

function floodFill(ctx, startX, startY, fillColor) {
  const canvas = ctx.canvas;
  const width = canvas.width;
  const height = canvas.height;

  if (startX < 0 || startY < 0 || startX >= width || startY >= height) return;

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const startPos = (startY * width + startX) * 4;
  const startR = data[startPos];
  const startG = data[startPos + 1];
  const startB = data[startPos + 2];

  if (startR < 80 && startG < 80 && startB < 80) return;

  const colorMatch = (pos) => {
    const r = data[pos];
    const g = data[pos + 1];
    const b = data[pos + 2];

    if (r < 100 && g < 100 && b < 100) return false;

    const tolerance = 35;
    return (
      Math.abs(r - startR) <= tolerance &&
      Math.abs(g - startG) <= tolerance &&
      Math.abs(b - startB) <= tolerance
    );
  };

  const queue = [[startX, startY]];
  const visited = new Uint8Array(width * height);

  while (queue.length > 0) {
    const [x, y] = queue.pop();
    if (x < 0 || x >= width || y < 0 || y >= height) continue;

    const pixelIndex = y * width + x;
    if (visited[pixelIndex]) continue;

    const dataIndex = pixelIndex * 4;
    if (!colorMatch(dataIndex)) continue;

    data[dataIndex] = fillColor.r;
    data[dataIndex + 1] = fillColor.g;
    data[dataIndex + 2] = fillColor.b;
    data[dataIndex + 3] = 255;

    visited[pixelIndex] = 1;

    queue.push([x + 1, y]);
    queue.push([x - 1, y]);
    queue.push([x, y + 1]);
    queue.push([x, y - 1]);
  }

  ctx.putImageData(imgData, 0, 0);
}

export default ColoringGame;