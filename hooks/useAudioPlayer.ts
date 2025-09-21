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

  const playTrack = useCallback((track: Track, playlist: Track[] = []) => {
    if (!audioRef.current) return;
    
    setError(null);
    setCurrentTrack(track);
    setCurrentPlaylist(playlist);
    
    const trackIndex = playlist.findIndex(t => t.id === track.id);
    setCurrentIndex(trackIndex >= 0 ? trackIndex : 0);
    
    setIsBuffering(true);
    setCurrentTime(0);
    audioRef.current.src = track.url;
     audioRef.current.loop = true;
    audioRef.current.load();
    
    audioRef.current.play().then(() => {
      setIsPlaying(true);
      setIsBuffering(false);
    }).catch((err) => {
      console.error('Playback failed:', err);
      setError('Playback failed');
      setIsBuffering(false);
      setIsPlaying(false);
    });
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
        setIsPlaying(false);
      });
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
    playNext,     // Make sure this is here
    playPrevious, // Make sure this is here
    seek,
    changeVolume,
  };
}
