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
  const preloadRef = useRef<HTMLAudioElement | null>(null);
  
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Main audio player
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = volume;
    audio.crossOrigin = 'anonymous'; // For CDN compatibility
    audioRef.current = audio;

    // Preload audio for next tracks
    preloadRef.current = new Audio();
    preloadRef.current.preload = 'metadata';

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handlePlaying = () => setIsBuffering(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleError = () => {
      setError('Failed to load audio from CDN');
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
  }, []);

  const playTrack = useCallback((track: Track, playlist: Track[] = []) => {
    if (!audioRef.current) return;
    
    setError(null);
    setCurrentTrack(track);
    setIsBuffering(true);
    
    audioRef.current.src = track.url;
    audioRef.current.load();
    
    audioRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch((err) => {
      console.error('Playback failed:', err);
      setError('Playback failed');
      setIsBuffering(false);
    });

    // Preload next track for smooth transitions
    const currentIndex = playlist.findIndex(t => t.id === track.id);
    const nextTrack = playlist[currentIndex + 1];
    if (nextTrack && preloadRef.current) {
      preloadRef.current.src = nextTrack.url;
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error('Playback failed:', err);
        setError('Playback failed');
      });
    }
  }, [isPlaying, currentTrack]);

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
    seek,
    changeVolume,
  };
}
