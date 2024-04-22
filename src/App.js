import React, { useEffect, useRef, useState } from 'react';
import { FaRegArrowAltCircleUp, FaTimes } from 'react-icons/fa';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const ctx = useRef(null);
  const overlayCtx = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startPosOverlay = useRef({ x: 0, y: 0 });
  const endPos = useRef({ x: 0, y: 0 });
  const endPosOverlay = useRef({ x: 0, y: 0 });
  const [frameSize, setFrameSize] = useState({ width: 1, height: 1 });
  const [clicking, isClicking] = useState(false);
  const [show, setShow] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mousePositionOverlay, setMousePositionOverlay] = useState({ x: 0, y: 0 });
  const [startX, setStartX] = useState(-2);
  const [startY, setStartY] = useState(-2);
  const [endX, setEndX] = useState(2);
  const [endY, setEndY] = useState(2);

  const mandelbrot = (startX, startY, endX, endY, maxIterations, ctx, width, height) => {
    var imageData = ctx.createImageData(width, height);
    var data = imageData.data;

    const getColor = (iter) => {
      const colorScale = 255 / maxIterations;
      const red = Math.floor(iter * colorScale);
      const green = Math.floor(iter * colorScale * 1.5);
      const blue = Math.floor(iter * colorScale * 2);
      return [red, green, blue];
    };
  
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let zx = 0;
        let zy = 0;
        const cx = startX + (endX - startX) * x / width;
        const cy = startY + (endY - startY) * y / height;
        let iter = 0;
  
        while (iter < maxIterations && zx * zx + zy * zy < 4) {
          const zxtemp = zx * zx - zy * zy + cx;
          zy = 2 * zx * zy + cy;
          zx = zxtemp;
          iter++;
        }
  
        const pixelPos = (y * width + x) * 4;
        if (iter === maxIterations) {
          data[pixelPos] = 0;
          data[pixelPos + 1] = 0;
          data[pixelPos + 2] = 0;
          data[pixelPos + 3] = 255;
        } else {
          const color = getColor(iter);
          data[pixelPos] = color[0];
          data[pixelPos + 1] = color[1];
          data[pixelPos + 2] = color[2];
          data[pixelPos + 3] = 255;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';

    for (let y = 0; y < height; y += 50) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }

    for (let x = 0; x < width; x += 50) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }

    ctx.stroke();
    setFrameSize({ width: Math.abs(endX - startX), height: Math.abs(endY - startY) });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    ctx.current = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const iter = 1000

    mandelbrot(startX, startY, endX, endY, iter, ctx.current, width, height);
  }, [startX, startY, endX, endY]);

  const updateOverlayCanvas = () => {
    const overlayCanvas = overlayCanvasRef.current;
    overlayCtx.current = overlayCanvas.getContext('2d');
    overlayCtx.current.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    overlayCtx.current.fillStyle = 'rgba(255, 0, 0, 0.5)';
    overlayCtx.current.fillRect(startPos.current.x, startPos.current.y, endPos.current.x - startPos.current.x, endPos.current.y - startPos.current.y);
  };

  const handleMouseDown = (e) => {
    isClicking(true)
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
    const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);
    const xa = mousePositionOverlay.x
    const ya = mousePositionOverlay.y

    startPos.current = { x, y };
    startPosOverlay.current = { x:xa, y:ya };

    console.log(startPos.current)
    console.log(startPosOverlay.current)

    updateOverlayCanvas();
  };

  const handleMouseUp = (e) => {
    const x = mousePositionOverlay.x;
    const y = mousePositionOverlay.y;
    endPosOverlay.current = { x, y };

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    console.log(endPos.current)
    console.log(endPosOverlay.current)
    
    const startX = Math.min(startPosOverlay.current.x, x);
    const startY = Math.min(startPosOverlay.current.y, y);
    const endX = Math.max(startPosOverlay.current.x, x);
    const endY = Math.max(startPosOverlay.current.y, y);

    const aspectRatio = width / height;

    let newEndX = startX + Math.abs(endX - startX);
    let newEndY = startY + Math.abs(endY - startY);
    if (Math.abs(newEndX - startX) / Math.abs(newEndY - startY) > aspectRatio) {
      newEndY = startY + (Math.abs(endX - startX) / aspectRatio) * (endY > startY ? 1 : -1);
    } else {
      newEndX = startX + Math.abs(endY - startY) * aspectRatio * (endX > startX ? 1 : -1);
    }

    setStartX(startX);
    setStartY(startY);
    setEndX(newEndX);
    setEndY(newEndY);
    isClicking(false);
    const overlay = overlayCanvasRef.current;
    const overlayCtx = overlay.getContext('2d'); 
    overlayCtx.clearRect(0, 0, canvas.width, canvas.height);
    startPos.current = { x:0, y:0 };
    endPos.current = { x:0, y:0 };
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = startX + (((e.clientX - rect.left) / rect.width) * Math.abs(startX - endX));
    const y = startY + (((e.clientY - rect.top) / rect.height) * Math.abs(startY - endY));
    setMousePositionOverlay({ x, y });
    const xa = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
    const ya = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);
    endPos.current = { x:xa, y:ya };
    if (clicking) {
      
      updateOverlayCanvas();
    }
  };

  const reset = (e) => {
    setStartX(-2);
    setStartY(-2);
    setEndX(2);
    setEndY(2);
  }

  return (
    <div className="app">
      {show ? <p className="instructions">Click and drag on the canvas to zoom in on a specific area.<button className="reset-button" onClick={() => setShow(false)}><FaTimes />
      </button></p> : ""}
      <p className="reset">{(endX - startX)/4 < 1 ? 
        <button className="reset-button" onClick={reset}><FaRegArrowAltCircleUp /><span className='tooltip'>Reset Frame</span>
        </button> 
        : ""}</p>
      <p className="title">
        <p>Mandelbrot Set Visualization</p>
        <p>Location: ({1*(startX + (endX - startX) / 2).toFixed(8)}, {-1*(startY + (endY - startY) / 2).toFixed(8)})</p>
        <p>Scale: {(endX - startX)/4}</p>
      </p>
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
          style={{ border: '1px solid black' }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        ></canvas>
        <canvas
          ref={overlayCanvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        ></canvas>
      </div>
    </div>
  );
}

export default App;
