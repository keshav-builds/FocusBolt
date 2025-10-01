"use client";
import { useState, useRef, useEffect, useCallback } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration?: string;
}

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState<string | null>(null);
  
  // Keep track of current play promise to avoid interruptions
  const playPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = volume;
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handlePlaying = () => setIsBuffering(false);
    const handleEnded = () => {
      // nothing: just loop
    };
    const handleError = () => {
      setError('Failed to load audio');
      setIsBuffering(false);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, [volume]);

  const playTrack = useCallback(async (track: Track, playlist: Track[] = []) => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    try {
      // Wait for any existing play promise to resolve/reject
      if (playPromiseRef.current) {
        await playPromiseRef.current.catch(() => {}); // Ignore errors from previous promise
      }
      
      // Stop current playback
      audio.pause();
      
      // Reset states
      setError(null);
      setIsBuffering(true);
      setCurrentTime(0);
      
      // Set new track info
      setCurrentTrack(track);
      setCurrentPlaylist(playlist);
      
      const trackIndex = playlist.findIndex(t => t.id === track.id);
      setCurrentIndex(trackIndex >= 0 ? trackIndex : 0);
      
      // Load new track
      audio.src = track.url;
      audio.loop = true;
      audio.load();
      
      // Wait for audio to be ready and then play
      const playPromise = new Promise<void>((resolve, reject) => {
        const onCanPlay = () => {
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          
          // safe play
          const actualPlayPromise = audio.play();
          actualPlayPromise.then(() => {
            setIsPlaying(true);
            setIsBuffering(false);
            resolve();
          }).catch(reject);
        };
        
        const onError = () => {
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          reject(new Error('Failed to load audio'));
        };
        
        audio.addEventListener('canplay', onCanPlay, { once: true });
        audio.addEventListener('error', onError, { once: true });
      });
      
      // Store the promise reference
      playPromiseRef.current = playPromise;
      await playPromise;
      
    } catch (err) {
      console.error('Playback failed:', err);
      setError('Playback failed');
      setIsBuffering(false);
      setIsPlaying(false);
    } finally {
      playPromiseRef.current = null;
    }
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (!audioRef.current || !currentTrack) return;
    
    const audio = audioRef.current;
    
    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        // Wait for any existing play promise
        if (playPromiseRef.current) {
          await playPromiseRef.current.catch(() => {});
        }
        
        const playPromise = audio.play();
        playPromiseRef.current = playPromise;
        
        await playPromise;
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Toggle playback failed:', err);
      setError('Playback failed');
      setIsPlaying(false);
    } finally {
      if (!isPlaying) { // Only clear if trying to play
        playPromiseRef.current = null;
      }
    }
  }, [isPlaying, currentTrack]);

  const playNext = useCallback(() => {
    if (currentPlaylist.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % currentPlaylist.length;
    const nextTrack = currentPlaylist[nextIndex];
    
    if (nextTrack) {
      playTrack(nextTrack, currentPlaylist);
    }
  }, [currentIndex, currentPlaylist, playTrack]);

  const playPrevious = useCallback(() => {
    if (currentPlaylist.length === 0) return;
    
    const prevIndex = currentIndex === 0 ? currentPlaylist.length - 1 : currentIndex - 1;
    const prevTrack = currentPlaylist[prevIndex];
    
    if (prevTrack) {
      playTrack(prevTrack, currentPlaylist);
    }
  }, [currentIndex, currentPlaylist, playTrack]);

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const changeVolume = useCallback((newVolume: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  }, []);

  return {
    currentTrack,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    volume,
    error,
    playTrack,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    changeVolume,
  };
}
