import React, { useState, useRef } from 'react';

interface MapSelectionOverlayProps {
  onSelectionComplete: (bounds: { x: number; y: number; width: number; height: number }) => void;
  onCancel: () => void;
}

export const MapSelectionOverlay: React.FC<MapSelectionOverlayProps> = ({ onSelectionComplete, onCancel }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getRelativeCoordinates = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100
    };
  };

  const handleStart = (clientX: number, clientY: number) => {
    const coords = getRelativeCoordinates(clientX, clientY);
    setStartPoint(coords);
    setCurrentPoint(coords);
    setIsDrawing(true);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDrawing) return;
    const coords = getRelativeCoordinates(clientX, clientY);
    setCurrentPoint(coords);
  };

  const handleEnd = () => {
    if (!isDrawing || !startPoint || !currentPoint) return;
    setIsDrawing(false);

    // Calculate bounds
    const x = Math.min(startPoint.x, currentPoint.x);
    const y = Math.min(startPoint.y, currentPoint.y);
    const width = Math.abs(currentPoint.x - startPoint.x);
    const height = Math.abs(currentPoint.y - startPoint.y);

    // Only trigger if the selection is significant enough (e.g., > 1% width/height)
    if (width > 1 && height > 1) {
      onSelectionComplete({ x, y, width, height });
    } else {
      setStartPoint(null);
      setCurrentPoint(null);
    }
  };

  // Mouse Events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch Events for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling while drawing
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  };

  const handleMouseLeave = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setStartPoint(null);
      setCurrentPoint(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-20 cursor-crosshair touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Instruction Overlay (visible when not drawing) */}
      {!isDrawing && !startPoint && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full pointer-events-none select-none whitespace-nowrap z-30">
          Click and drag to select an area
        </div>
      )}

      {/* Selection Box */}
      {startPoint && currentPoint && (
        <div
          className="absolute border-2 border-[#1F2937] bg-gray-800/20 shadow-[0_0_0_9999px_rgba(0,0,0,0.3)] pointer-events-none"
          style={{
            left: `${Math.min(startPoint.x, currentPoint.x)}%`,
            top: `${Math.min(startPoint.y, currentPoint.y)}%`,
            width: `${Math.abs(currentPoint.x - startPoint.x)}%`,
            height: `${Math.abs(currentPoint.y - startPoint.y)}%`,
          }}
        />
      )}
      
      {/* Close/Cancel Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onCancel();
        }}
        className="absolute top-2 right-2 p-1.5 bg-white text-slate-600 rounded-full shadow-md hover:bg-slate-50 hover:text-red-500 transition-colors z-40 cursor-pointer pointer-events-auto"
        title="Cancel Selection"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};