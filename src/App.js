import React, { useEffect, useRef, useState } from 'react';
import { FaRegArrowAltCircleUp } from 'react-icons/fa';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const ctx = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });
  const endPos = useRef({ x: 0, y: 0 });
  const [frameSize, setFrameSize] = useState({ width: 1, height: 1 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [startX, setStartX] = useState(-2);
  const [startY, setStartY] = useState(-2);
  const [endX, setEndX] = useState(2);
  const [endY, setEndY] = useState(2);

  // Define mandelbrot function
  const mandelbrot = (startX, startY, endX, endY, maxIterations, ctx, width, height) => {
    var imageData = ctx.createImageData(width, height);
    var data = imageData.data;

    const getColor = (iter) => {
      // Define a color gradient
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
          // Inside the Mandelbrot set - set color to black
          data[pixelPos] = 0;
          data[pixelPos + 1] = 0;
          data[pixelPos + 2] = 0;
          data[pixelPos + 3] = 255;
        } else {
          // Outside the Mandelbrot set - set color based on iteration count
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
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'; // Light gray color for grid lines

    // Horizontal lines
    for (let y = 0; y < height; y += 50) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }

    // Vertical lines
    for (let x = 0; x < width; x += 50) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }

    ctx.stroke();

    // Update frame size
    setFrameSize({ width: Math.abs(endX - startX), height: Math.abs(endY - startY) });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    ctx.current = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const iter = (endX - startX)/4 < 1 ? 1000 : 100

    mandelbrot(startX, startY, endX, endY, iter, ctx.current, width, height); // Default Mandelbrot set
  }, [startX, startY, endX, endY]);

  const handleMouseDown = (e) => {
    const x = mousePosition.x;
    const y = mousePosition.y;
    startPos.current = { x, y };
  };

  const handleMouseUp = (e) => {
    const x = mousePosition.x;
    const y = mousePosition.y;
    endPos.current = { x, y };

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Normalize coordinates
    const startX = Math.min(startPos.current.x, x);
    const startY = Math.min(startPos.current.y, y);
    const endX = Math.max(startPos.current.x, x);
    const endY = Math.max(startPos.current.y, y);

    // Calculate aspect ratio
    const aspectRatio = width / height;

    // Calculate new endX and endY to maintain aspect ratio
    let newEndX = startX + Math.abs(endX - startX);
    let newEndY = startY + Math.abs(endY - startY);
    if (Math.abs(newEndX - startX) / Math.abs(newEndY - startY) > aspectRatio) {
      newEndY = startY + (Math.abs(endX - startX) / aspectRatio) * (endY > startY ? 1 : -1);
    } else {
      newEndX = startX + Math.abs(endY - startY) * aspectRatio * (endX > startX ? 1 : -1);
    }

    // Update state
    setStartX(startX);
    setStartY(startY);
    setEndX(newEndX);
    setEndY(newEndY);
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = startX + (((e.clientX - rect.left) / rect.width) * Math.abs(startX - endX));
    const y = startY + (((e.clientY - rect.top) / rect.height) * Math.abs(startY - endY));
    setMousePosition({ x, y });
  };

  const reset = (e) => {
    setStartX(-2);
    setStartY(-2);
    setEndX(2);
    setEndY(2);
  }

  return (
    <div className="app">

        <p className="title">
          <p>Mandelbrot Set Visualization {(endX - startX)/4 < 1 ? 
          <button className="reset-button" onClick={reset}><FaRegArrowAltCircleUp /><span className='tooltip'>Reset Frame</span>
          </button> 
          : ""}</p>
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
        ></canvas></div>
    </div>
  );
}

export default App;