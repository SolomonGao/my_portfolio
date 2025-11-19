import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './components/Scene';
import DesktopUI from './components/DesktopUI';
import { ViewState } from './types';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.IDLE);

  const handleShutdown = () => {
    setViewState(ViewState.SHUTTING_DOWN);
    // Simulate shutdown time before returning to IDLE
    setTimeout(() => {
      setViewState(ViewState.IDLE);
    }, 2500);
  };

  return (
    <div className="w-full h-full relative bg-black overflow-hidden">
      
      {/* 3D Canvas Container with Blur Effect */}
      <div className={`absolute inset-0 transition-all duration-1000 ease-in-out ${viewState === ViewState.FOCUSED ? 'filter blur-sm opacity-50 scale-105' : 'opacity-100'}`}>
        <Canvas shadows dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Scene viewState={viewState} setViewState={setViewState} />
          </Suspense>
        </Canvas>
      </div>

      {/* IDLE Overlay */}
      {viewState === ViewState.IDLE && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/50 text-xs bg-white/5 border border-white/10 px-6 py-2 rounded-full backdrop-blur-md pointer-events-none select-none animate-pulse tracking-wider uppercase z-10">
          Click the Monitor to Login
        </div>
      )}

      {/* Operating System UI */}
      {viewState === ViewState.FOCUSED && (
        <DesktopUI onExit={handleShutdown} />
      )}

      {/* Shutdown Screen Overlay */}
      {viewState === ViewState.SHUTTING_DOWN && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center text-white animate-fadeIn">
           <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-blue-600 mb-4"></div>
           <span className="text-sm tracking-widest font-light">SHUTTING DOWN SYSTEM...</span>
        </div>
      )}
    </div>
  );
};

export default App;