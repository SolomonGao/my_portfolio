import React, { useState, useRef, useEffect, useCallback } from 'react';
import WindowFrame from '../ui/WindowFrame';

interface GymAppProps {
  onClose: () => void;
}

const GymApp: React.FC<GymAppProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'WON' | 'LOST'>('IDLE');
  const [muscleMass, setMuscleMass] = useState(0);
  
  // Game Constants
  const WIN_TIME_MS = 3000;
  const GRAVITY = 0.5;
  const JUMP_FORCE = -8;
  const BAR_HEIGHT = 300; // px (internal logic height)
  const TARGET_HEIGHT = 80; // px
  
  // Refs for loop performance (avoiding re-renders 60fps)
  const barRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const positionRef = useRef(BAR_HEIGHT / 2);
  const velocityRef = useRef(0);
  const timeInZoneRef = useRef(0);
  
  // Target Zone (Dynamic in V2, Static for now)
  const targetY = 100; // Top position of target zone
  const targetBottom = targetY + TARGET_HEIGHT;

  const startGame = () => {
    setGameState('PLAYING');
    positionRef.current = BAR_HEIGHT - 20;
    velocityRef.current = 0;
    timeInZoneRef.current = 0;
  };

  const jump = useCallback(() => {
    if (gameState === 'PLAYING') {
      velocityRef.current = JUMP_FORCE;
    }
  }, [gameState]);

  // Game Loop
  const updateGame = useCallback(() => {
    if (gameState !== 'PLAYING') return;

    // 1. Physics
    velocityRef.current += GRAVITY;
    positionRef.current += velocityRef.current;

    // Bounds checking
    if (positionRef.current < 0) {
      positionRef.current = 0;
      velocityRef.current = 0;
    }
    if (positionRef.current > BAR_HEIGHT - 20) { // 20 is cursor height
      positionRef.current = BAR_HEIGHT - 20;
      velocityRef.current = 0; // Hit floor
    }

    // 2. Update UI (Direct DOM manipulation for smoothness)
    if (barRef.current) {
      barRef.current.style.top = `${positionRef.current}px`;
    }

    // 3. Check Zone
    const cursorCenter = positionRef.current + 10; // center of cursor
    const inZone = cursorCenter >= targetY && cursorCenter <= targetBottom;

    // Update Win Progress
    const progressBar = document.getElementById('win-progress');
    if (inZone) {
      timeInZoneRef.current += 16.67; // ~60fps frame time
      if (progressBar) {
        progressBar.style.width = `${(timeInZoneRef.current / WIN_TIME_MS) * 100}%`;
        progressBar.style.backgroundColor = '#10b981'; // green
      }
    } else {
      // Decay progress if out of zone? Optional. Let's just pause it or slow decay.
      timeInZoneRef.current = Math.max(0, timeInZoneRef.current - 5);
      if (progressBar) {
        progressBar.style.width = `${(timeInZoneRef.current / WIN_TIME_MS) * 100}%`;
        progressBar.style.backgroundColor = '#ef4444'; // red warning
      }
    }

    // 4. Win/Loss Condition
    if (timeInZoneRef.current >= WIN_TIME_MS) {
      setGameState('WON');
      setMuscleMass(prev => prev + 1.5); // Gains!
    }

    requestRef.current = requestAnimationFrame(updateGame);
  }, [gameState, targetBottom, targetY]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, updateGame]);

  return (
    <WindowFrame title="Gym Tracker Pro" onClose={onClose}>
      <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-50 select-none" onMouseDown={jump} onTouchStart={jump}>
        
        {/* Stats Header */}
        <div className="absolute top-4 right-6 bg-white px-4 py-2 rounded-lg shadow-sm border">
          <span className="text-xs text-gray-500 uppercase font-bold block">Muscle Mass</span>
          <span className="text-2xl font-black text-orange-500">{muscleMass.toFixed(1)} lbs</span>
        </div>

        {/* Main Game Area */}
        {gameState === 'IDLE' && (
          <div className="text-center">
            <h2 className="text-4xl font-black mb-2 text-gray-800">READY TO LIFT?</h2>
            <p className="text-gray-500 mb-8">Keep the bar in the green zone to gain muscle.</p>
            <button 
              onClick={startGame}
              className="bg-black text-white text-xl font-bold py-4 px-12 rounded-xl shadow-xl hover:scale-105 transition-transform"
            >
              START WORKOUT
            </button>
          </div>
        )}

        {gameState === 'WON' && (
           <div className="text-center animate-scaleIn">
             <h2 className="text-5xl font-black mb-4 text-green-600">GOOD SET!</h2>
             <p className="text-gray-600 mb-8 text-lg">+1.5 lbs Muscle Mass Gained</p>
             <button 
               onClick={startGame}
               className="bg-orange-500 text-white font-bold py-3 px-8 rounded-lg shadow hover:bg-orange-600 transition-colors"
             >
               Do Another Set
             </button>
           </div>
        )}

        {gameState === 'PLAYING' && (
          <div className="flex gap-8 items-center h-full w-full max-w-md animate-fadeIn">
            
            {/* The Game Bar */}
            <div className="relative w-16 bg-gray-200 rounded-full border-4 border-gray-300 overflow-hidden shadow-inner" style={{ height: `${BAR_HEIGHT}px` }}>
              
              {/* Target Zone */}
              <div 
                className="absolute w-full bg-green-400/30 border-y-2 border-green-500/50"
                style={{ top: `${targetY}px`, height: `${TARGET_HEIGHT}px` }}
              >
                <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] font-bold text-green-700 opacity-50">ZONE</div>
              </div>

              {/* Player Cursor */}
              <div 
                ref={barRef}
                className="absolute left-1 w-12 h-5 bg-orange-500 rounded-md shadow-lg border border-orange-600 transition-transform duration-75 ease-linear"
                style={{ top: `${BAR_HEIGHT / 2}px` }} // Initial visual pos
              >
                <div className="w-full h-full bg-white/20 rounded-md"></div>
              </div>

            </div>

            {/* Instructions / Progress */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="text-center">
                <p className="font-bold text-gray-400 text-sm mb-2">SET PROGRESS</p>
                <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div id="win-progress" className="h-full w-0 bg-green-500 transition-all duration-100"></div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 mt-4 text-center">
                <span className="text-3xl animate-pulse">👆</span>
                <p className="text-sm font-bold text-gray-600 mt-2">Click / Tap to Push Up</p>
                <p className="text-xs text-gray-400">Fight gravity!</p>
              </div>
            </div>

          </div>
        )}
      </div>
    </WindowFrame>
  );
};

export default GymApp;