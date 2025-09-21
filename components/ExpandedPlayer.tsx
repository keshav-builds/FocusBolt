"use client";
import React from 'react';
import { ColorTheme } from '@/lib/theme';

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration?: string;
  url: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  category: 'focus' | 'nature' | 'user';
}

interface ExpandedPlayerProps {
  isExpanded: boolean;
  currentTheme: ColorTheme;
  playlists: Playlist[];
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onSelectTrack: (track: Track) => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function ExpandedPlayer({
  isExpanded,
  playlists,
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  onSelectTrack,
  onSeek,
  onVolumeChange,
  onNext,
  onPrevious,
}: ExpandedPlayerProps) {
  if (!isExpanded) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    onSeek(percent * duration);
  };

  return (
    <div className="fixed bottom-20 left-0 w-full bg-black bg-opacity-90 backdrop-blur-xl text-white z-40 border-t border-gray-700 max-h-96 overflow-hidden">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Now Playing</h2>
          <div className="flex items-center space-x-2 text-gray-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-sm">Queue</span>
          </div>
        </div>

        {/* Now Playing Section */}
        {currentTrack && (
          <div className="bg-gray-900 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-700 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎵</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{currentTrack.title}</h3>
                  <p className="text-gray-400">{currentTrack.artist}</p>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={onPrevious}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                  </svg>
                </button>
                <button className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={onNext}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div 
                className="w-full h-1.5 bg-gray-700 rounded-full cursor-pointer overflow-hidden"
                onClick={handleSeekClick}
              >
                <div 
                  className="h-full bg-white rounded-full transition-all duration-100"
                  style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            {/* Volume Control */}
            <div className="flex items-center space-x-3 mt-4">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #fff 0%, #fff ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
                }}
              />
            </div>
          </div>
        )}

        {/* Playlists Grid */}
        <div className="space-y-6 max-h-64 overflow-y-auto custom-scrollbar">
          {playlists.map((playlist) => (
            <div key={playlist.id}>
              <h4 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
                <span>{playlist.name}</span>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
                  {playlist.tracks.length} tracks
                </span>
              </h4>
              <div className="grid gap-2">
                {playlist.tracks.map((track, index) => (
                  <button
                    key={track.id}
                    onClick={() => onSelectTrack(track)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-gray-800 group ${
                      currentTrack?.id === track.id ? 'bg-gray-800 border border-gray-600' : 'bg-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 text-gray-500 text-sm font-mono">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <div className={`text-sm font-medium truncate ${
                            currentTrack?.id === track.id ? 'text-white' : 'text-gray-200 group-hover:text-white'
                          }`}>
                            {track.title}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {track.artist}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {track.duration}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
}
