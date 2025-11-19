
import React, { useRef } from 'react';
import WindowFrame from '../ui/WindowFrame';
import { useMusic, Track } from '../../context/MusicContext';

interface MusicPlayerAppProps {
  onClose: () => void;
}

const MusicPlayerApp: React.FC<MusicPlayerAppProps> = ({ onClose }) => {
  const { 
    isPlaying, togglePlay, volume, setVolume, 
    currentTrack, playlist, addTrack, playTrack, 
    nextTrack, prevTrack, duration, currentTime, seek 
  } = useMusic();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addTrack(e.target.files[0]);
    }
  };

  return (
    <WindowFrame title="Groove Player" onClose={onClose} className="bg-zinc-900 text-white">
      <div className="flex flex-col h-full animate-fadeIn">
        
        {/* Top Player Section */}
        <div className="p-6 bg-gradient-to-b from-zinc-800 to-zinc-900 border-b border-zinc-700">
          <div className="flex flex-col items-center">
            {/* Album Art Placeholder */}
            <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-2xl mb-4 flex items-center justify-center relative overflow-hidden group">
               <div className={`absolute inset-0 bg-black/20 ${isPlaying ? 'hidden' : 'block'}`}></div>
               <span className="text-4xl select-none">🎵</span>
            </div>
            
            <h2 className="text-xl font-bold text-white truncate max-w-xs">{currentTrack?.title || "No Track Selected"}</h2>
            <p className="text-zinc-400 text-sm mb-6">{currentTrack?.artist || "Unknown Artist"}</p>

            {/* Progress Bar */}
            <div className="w-full max-w-md mb-2 flex items-center gap-2 text-xs text-zinc-400">
               <span>{formatTime(currentTime)}</span>
               <input 
                 type="range" 
                 min="0" 
                 max={duration || 100} 
                 value={currentTime}
                 onChange={(e) => seek(parseFloat(e.target.value))}
                 className="flex-1 h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
               />
               <span>{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 mb-4">
              <button onClick={prevTrack} className="text-zinc-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
              </button>
              
              <button 
                onClick={togglePlay} 
                className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>

              <button onClick={nextTrack} className="text-zinc-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
              </button>
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-2 w-full max-w-[200px]">
              <svg className="w-4 h-4 text-zinc-500" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
          </div>
        </div>

        {/* Playlist Section */}
        <div className="flex-1 bg-zinc-950 overflow-y-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Playlist</h3>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded text-zinc-300 flex items-center gap-1 transition-colors"
            >
              <span>+ Add Local File</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="audio/*" 
              className="hidden" 
            />
          </div>
          
          <div className="space-y-1">
            {playlist.map((track, idx) => (
              <div 
                key={track.id}
                onClick={() => playTrack(track)}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors group ${currentTrack?.id === track.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
              >
                <span className="w-6 text-xs text-zinc-500 group-hover:text-zinc-300">
                  {currentTrack?.id === track.id && isPlaying ? (
                    <span className="animate-pulse">▶</span>
                  ) : (
                    idx + 1
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium truncate ${currentTrack?.id === track.id ? 'text-white' : 'text-zinc-300'}`}>
                    {track.title}
                  </div>
                  <div className="text-xs text-zinc-500 truncate">{track.artist}</div>
                </div>
                {track.isLocal && <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 ml-2">LOCAL</span>}
              </div>
            ))}
          </div>
        </div>

      </div>
    </WindowFrame>
  );
};

export default MusicPlayerApp;
