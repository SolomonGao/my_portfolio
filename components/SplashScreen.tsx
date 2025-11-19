import React from 'react';

interface SplashScreenProps {
  onEnter: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  return (
    <div 
      className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center overflow-hidden select-none font-sans"
      onClick={onEnter}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-black/60 to-black"></div>
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%]"></div>

      <div className="relative z-20 flex flex-col items-center text-center p-8">
        
        {/* Glitch Title */}
        <div className="relative mb-8 group cursor-pointer">
          <h1 className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 tracking-tighter drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] animate-pulse">
            THE DEN
          </h1>
          <div className="absolute inset-0 text-6xl md:text-9xl font-black text-cyan-500/30 animate-ping opacity-50 tracking-tighter" aria-hidden="true">
            THE DEN
          </div>
          <p className="text-cyan-300/80 font-mono text-sm md:text-xl tracking-[0.5em] uppercase mt-4 border-t border-cyan-900/50 pt-4">
            Digital Portfolio System
          </p>
        </div>

        {/* Enter Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); onEnter(); }}
          className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-none mt-12 transition-all hover:scale-105 active:scale-95"
        >
          <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:from-transparent group-hover:via-cyan-500/50 group-hover:to-transparent ease-in-out duration-500 transform -translate-x-full group-hover:translate-x-full"></span>
          <div className="relative flex items-center gap-4">
            <span className="h-[1px] w-12 bg-cyan-500/50 group-hover:w-8 transition-all duration-300"></span>
            <span className="font-mono text-lg text-cyan-400 group-hover:text-white tracking-widest font-bold transition-colors">
              INITIALIZE
            </span>
            <span className="h-[1px] w-12 bg-cyan-500/50 group-hover:w-8 transition-all duration-300"></span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
        </button>

        {/* Footer Status */}
        <div className="absolute bottom-12 font-mono text-[10px] text-cyan-700/50 tracking-widest">
          SYSTEM.READY :: WAITING_FOR_INPUT
        </div>
      </div>

      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
