import React, { useState, Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './components/Scene';
import DesktopUI from './components/DesktopUI';
import SplashScreen from './components/SplashScreen';
import { ViewState } from './types';
import { MusicProvider, useMusic } from './context/MusicContext';

const AppContent: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.SPLASH);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { play } = useMusic();

  const handleShutdown = () => {
    setViewState(ViewState.SHUTTING_DOWN);
    // Simulate shutdown time before returning to SPLASH (Reset system)
    timeoutRef.current = setTimeout(() => {
      setViewState(ViewState.SPLASH);
    }, 4000); 
  };

  const skipShutdown = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setViewState(ViewState.SPLASH);
  };

  // Handle entry from Splash Screen
  const handleEnterSystem = () => {
    // Browser requires user interaction to play audio
    play(); 
    setViewState(ViewState.IDLE);
  };

  // Global Listener for ESC to exit Desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && viewState === ViewState.FOCUSED) {
        setViewState(ViewState.IDLE);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewState]);

  return (
    <div className="w-full h-full relative bg-black overflow-hidden">
        
      {/* 3D Canvas Container */}
      {/* We keep the canvas active even in Splash to show the rotating room background */}
      <div className={`absolute inset-0 transition-all duration-1000 ease-in-out 
          ${viewState === ViewState.FOCUSED ? 'filter blur-sm opacity-50 scale-105' : ''}
          ${viewState === ViewState.SPLASH ? 'filter brightness-50 scale-100' : ''}
          ${viewState === ViewState.IDLE ? 'opacity-100 scale-100' : ''}
      `}>
        <Canvas shadows dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Scene viewState={viewState} setViewState={setViewState} />
          </Suspense>
        </Canvas>
      </div>

      {/* Splash Screen Overlay */}
      {viewState === ViewState.SPLASH && (
        <SplashScreen onEnter={handleEnterSystem} />
      )}

      {/* IDLE Overlay - Click prompt when waiting to enter Desktop */}
      {viewState === ViewState.IDLE && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/50 text-xs bg-white/5 border border-white/10 px-6 py-2 rounded-full backdrop-blur-md pointer-events-none select-none animate-pulse tracking-wider uppercase z-10">
          Click the Monitor to Login
        </div>
      )}

      {/* Control Guide (Visible in IDLE/FOCUSED) */}
      {viewState !== ViewState.SPLASH && viewState !== ViewState.SHUTTING_DOWN && (
        <div className="absolute bottom-4 left-4 pointer-events-none select-none opacity-70 hover:opacity-100 transition-opacity z-20">
          <div className="flex flex-col gap-2 text-[10px] text-white/80 tracking-widest font-light font-mono uppercase">
            {viewState === ViewState.IDLE && (
              <>
                <div className="flex items-center gap-2">
                  <span className="bg-white/10 border border-white/20 rounded px-1.5 py-0.5 min-w-[20px] text-center text-yellow-400 font-bold">A</span>
                  <span>Vol +</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-white/10 border border-white/20 rounded px-1.5 py-0.5 min-w-[20px] text-center text-yellow-400 font-bold">D</span>
                  <span>Vol -</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-white/10 border border-white/20 rounded px-1.5 py-0.5 min-w-[20px] text-center font-bold">Ctrl</span>
                  <span>RGB Menu</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-white/10 border border-white/20 rounded px-1.5 py-0.5 min-w-[40px] text-center font-bold">Space</span>
                  <span>Toggle View</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-white/10 border border-white/20 rounded px-1.5 py-0.5 min-w-[20px] text-center font-bold">🖱️</span>
                  <span>Scroll Zoom</span>
                </div>
              </>
            )}
            {viewState === ViewState.FOCUSED && (
              <div className="flex items-center gap-2 text-blue-300 animate-pulse">
                <span className="bg-blue-500/20 border border-blue-500/50 rounded px-1.5 py-0.5 min-w-[20px] text-center font-bold">ESC</span>
                <span>Exit to Room</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Operating System UI */}
      {viewState === ViewState.FOCUSED && (
        <DesktopUI onExit={handleShutdown} />
      )}

      {/* Shutdown Screen Overlay */}
      {viewState === ViewState.SHUTTING_DOWN && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center text-white animate-fadeIn">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-blue-600 mb-8"></div>
            <span className="text-sm tracking-widest font-light mb-8">SHUTTING DOWN SYSTEM...</span>
            
            <button 
              onClick={skipShutdown}
              className="px-4 py-2 border border-gray-700 rounded text-xs text-gray-500 hover:border-gray-500 hover:text-gray-300 transition-colors uppercase tracking-widest"
            >
              Skip Sequence 
            </button>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <MusicProvider>
      <AppContent />
    </MusicProvider>
  );
};

export default App;