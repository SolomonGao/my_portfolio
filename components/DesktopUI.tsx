
import React, { useState } from 'react';
import { AppID } from '../types';
import { ResumeApp, ProjectsApp, SettingsApp, LibraryApp, HeatApp } from './apps/SystemApps';
import GymApp from './apps/GymApp';
import MusicPlayerApp from './apps/MusicPlayerApp';
import { useMusic } from '../context/MusicContext';

interface DesktopUIProps {
  onExit: () => void;
}

const DesktopUI: React.FC<DesktopUIProps> = ({ onExit }) => {
  const [activeApp, setActiveApp] = useState<AppID | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  
  const { volume, setVolume } = useMusic();

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  const getVolumeIcon = () => {
    if (volume === 0) return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>;
    if (volume < 0.5) return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>;
    return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>;
  };

  const DesktopIcon: React.FC<{ label: string, icon: string, onClick: () => void, color: string }> = ({ label, icon, onClick, color }) => (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-2 w-24 p-2 hover:bg-white/10 rounded-lg border border-transparent hover:border-white/20 transition-all group mb-2"
    >
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 group-active:scale-95 transition-transform`}>
        {icon}
      </div>
      <span className="text-white text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-medium text-center leading-tight">{label}</span>
    </button>
  );

  return (
    <div className="absolute inset-0 z-50 flex flex-col overflow-hidden select-none animate-fadeIn font-sans">
      
      {/* Wallpaper Background */}
      <div className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat scale-105" 
           style={{ 
             backgroundImage: 'url(https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)',
           }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Desktop Workspace */}
      <div className="flex-1 w-full relative p-6 flex flex-col items-start" onClick={() => { setIsMenuOpen(false); setShowVolumeControl(false); }}>
        
        <div className="grid grid-cols-1 gap-4">
          <DesktopIcon label="My Resume" icon="📄" color="bg-blue-500" onClick={() => setActiveApp('RESUME')} />
          <DesktopIcon label="Projects" icon="🌐" color="bg-purple-500" onClick={() => setActiveApp('PROJECTS')} />
          <DesktopIcon label="System" icon="⚙️" color="bg-gray-600" onClick={() => setActiveApp('SETTINGS')} />
          <div className="h-4"></div>
          <DesktopIcon label="Gym Tracker" icon="💪" color="bg-orange-500" onClick={() => setActiveApp('GYM')} />
          <DesktopIcon label="Library" icon="📚" color="bg-emerald-600" onClick={() => setActiveApp('LIBRARY')} />
          <DesktopIcon label="Heat Hub" icon="🔥" color="bg-red-600" onClick={() => setActiveApp('HEAT')} />
          <DesktopIcon label="Music Player" icon="🎵" color="bg-pink-600" onClick={() => setActiveApp('MUSIC')} />
        </div>

        {/* Window Manager - Rendering active app */}
        {activeApp === 'RESUME' && <ResumeApp onClose={() => setActiveApp(null)} />}
        {activeApp === 'PROJECTS' && <ProjectsApp onClose={() => setActiveApp(null)} />}
        {activeApp === 'SETTINGS' && <SettingsApp onClose={() => setActiveApp(null)} />}
        {activeApp === 'LIBRARY' && <LibraryApp onClose={() => setActiveApp(null)} />}
        {activeApp === 'HEAT' && <HeatApp onClose={() => setActiveApp(null)} />}
        {activeApp === 'GYM' && <GymApp onClose={() => setActiveApp(null)} />}
        {activeApp === 'MUSIC' && <MusicPlayerApp onClose={() => setActiveApp(null)} />}

      </div>

      {/* Taskbar */}
      <div className="h-12 w-full bg-white/70 backdrop-blur-2xl border-t border-white/40 flex items-center justify-between px-4 z-50 relative shadow-2xl">
        
        {/* Start Button */}
        <div className="flex items-center gap-4">
           <button 
             onClick={() => { setIsMenuOpen(!isMenuOpen); setShowVolumeControl(false); }} 
             className={`h-9 w-9 flex items-center justify-center rounded hover:bg-white/50 transition-colors ${isMenuOpen ? 'bg-white/50' : ''}`}
           >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-blue-600 drop-shadow-sm"><path d="M4 4h7v7H4V4zm8 0h7v7h-7V4zM4 12h7v7H4v-7zm8 0h7v7h-7v-7z" /></svg>
           </button>
        </div>

        {/* System Tray */}
        <div className="flex items-center gap-3 h-full py-1.5">
           
           {/* Volume Control Icon */}
           <div className="relative h-full">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowVolumeControl(!showVolumeControl); setIsMenuOpen(false); }}
                className={`h-full px-2 rounded hover:bg-white/50 flex items-center justify-center transition-colors text-gray-700 ${showVolumeControl ? 'bg-white/50' : ''}`}
              >
                {getVolumeIcon()}
              </button>

              {/* Volume Popup Flyout */}
              {showVolumeControl && (
                <div className="absolute bottom-14 right-0 -mr-12 w-72 bg-white/90 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/40 p-4 animate-slideUp text-gray-800 z-50 cursor-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setVolume(volume === 0 ? 0.5 : 0)} className="text-gray-600 hover:text-blue-600 transition-colors">
                           {getVolumeIcon()}
                        </button>
                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="flex-1 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="text-xs font-bold w-6 text-right text-gray-600">{Math.round(volume * 100)}</span>
                    </div>
                </div>
              )}
           </div>

           {/* Date & Time */}
           <div className="flex flex-col items-end px-2 hover:bg-white/50 rounded cursor-default justify-center h-full transition-colors">
             <span className="text-xs font-semibold text-gray-800 leading-none mb-0.5">{currentTime}</span>
             <span className="text-[10px] text-gray-600 leading-none">{currentDate}</span>
           </div>

           {/* Shutdown Button */}
           <button onClick={onExit} className="group relative bg-red-500/10 hover:bg-red-500 p-2 rounded-lg transition-colors ml-2">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           </button>
        </div>

        {/* Start Menu Popup */}
        {isMenuOpen && (
          <div className="absolute bottom-14 left-2 w-72 bg-white/80 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/50 p-4 animate-slideUp origin-bottom-left">
            <div className="mb-4 px-2">
               <div className="text-xs font-bold text-gray-500 mb-2">Pinned Apps</div>
               <div className="grid grid-cols-4 gap-2">
                  <button className="aspect-square rounded-lg hover:bg-white/50 flex items-center justify-center text-xl bg-white/20 transition-colors" onClick={() => { setActiveApp('RESUME'); setIsMenuOpen(false); }}>📄</button>
                  <button className="aspect-square rounded-lg hover:bg-white/50 flex items-center justify-center text-xl bg-white/20 transition-colors" onClick={() => { setActiveApp('GYM'); setIsMenuOpen(false); }}>💪</button>
                  <button className="aspect-square rounded-lg hover:bg-white/50 flex items-center justify-center text-xl bg-white/20 transition-colors" onClick={() => { setActiveApp('MUSIC'); setIsMenuOpen(false); }}>🎵</button>
                  <button className="aspect-square rounded-lg hover:bg-white/50 flex items-center justify-center text-xl bg-white/20 transition-colors" onClick={() => { setActiveApp('PROJECTS'); setIsMenuOpen(false); }}>🌐</button>
               </div>
            </div>
            <div className="mt-2 pt-3 border-t border-gray-200/50 flex items-center gap-3 px-2">
               <div className="w-9 h-9 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full shadow-inner"></div>
               <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-800">Alex</span>
                  <span className="text-[10px] text-gray-500">Administrator</span>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopUI;
