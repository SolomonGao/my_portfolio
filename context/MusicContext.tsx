import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  isLocal: boolean;
}

interface MusicContextType {
  isPlaying: boolean;
  togglePlay: () => void;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  currentTrack: Track | null;
  playlist: Track[];
  addTrack: (file: File) => void;
  playTrack: (track: Track) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  duration: number;
  currentTime: number;
  seek: (time: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const DEFAULT_TRACKS: Track[] = [
  {
    id: 'default-1',
    title: 'Chill Lofi Beats',
    artist: 'System Default',
    url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', // Royalty free placeholder
    isLocal: false
  },
  {
    id: 'default-2',
    title: 'Coding Vibes',
    artist: 'System Default',
    url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d2166e5b7f.mp3',
    isLocal: false
  }
];

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [playlist, setPlaylist] = useState<Track[]>(DEFAULT_TRACKS);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(DEFAULT_TRACKS[0]);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Initialize Audio
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;
    
    const handleEnded = () => nextTrack();
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    // Initial load
    if (currentTrack) {
        if (audio.src !== currentTrack.url) {
             audio.src = currentTrack.url;
        }
    }

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.pause();
    };
  }, []);

  // Handle Track Changes
  useEffect(() => {
    const audio = audioRef.current;
    if (currentTrack && audio.src !== currentTrack.url) {
        const wasPlaying = !audio.paused;
        audio.src = currentTrack.url;
        if (wasPlaying || isPlaying) {
            audio.play().catch(e => console.error("Play error:", e));
            setIsPlaying(true);
        }
    }
  }, [currentTrack]);

  // Handle Volume Changes
  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  // Handle Play/Pause
  useEffect(() => {
    if (isPlaying) {
        audioRef.current.play().catch(e => {
            console.warn("Autoplay prevented", e);
            setIsPlaying(false);
        });
    } else {
        audioRef.current.pause();
    }
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const addTrack = (file: File) => {
    const url = URL.createObjectURL(file);
    const newTrack: Track = {
      id: `local-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: 'Local Upload',
      url,
      isLocal: true
    };
    setPlaylist(prev => [...prev, newTrack]);
    // Auto play the new track
    setCurrentTrack(newTrack);
    setIsPlaying(true);
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const nextTrack = () => {
    if (!currentTrack) return;
    const idx = playlist.findIndex(t => t.id === currentTrack.id);
    const nextIdx = (idx + 1) % playlist.length;
    setCurrentTrack(playlist[nextIdx]);
  };

  const prevTrack = () => {
    if (!currentTrack) return;
    const idx = playlist.findIndex(t => t.id === currentTrack.id);
    const prevIdx = (idx - 1 + playlist.length) % playlist.length;
    setCurrentTrack(playlist[prevIdx]);
  };

  const seek = (time: number) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  return (
    <MusicContext.Provider value={{
      isPlaying, togglePlay, volume, setVolume, currentTrack, playlist,
      addTrack, playTrack, nextTrack, prevTrack, duration, currentTime, seek
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used within a MusicProvider');
  return context;
};
