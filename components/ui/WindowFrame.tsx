import React from 'react';

interface WindowFrameProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const WindowFrame: React.FC<WindowFrameProps> = ({ title, onClose, children, className = "" }) => {
  return (
    <div 
      className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85%] h-[75%] bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/50 flex flex-col overflow-hidden animate-scaleIn ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Window Header */}
      <div className="h-9 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-3 select-none draggable">
        <div className="flex items-center gap-2">
           <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              {title}
           </span>
        </div>
        <div className="flex gap-2">
           <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 active:scale-90 transition-transform"></button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-auto relative bg-white/50 text-gray-800">
        {children}
      </div>
    </div>
  );
};

export default WindowFrame;
