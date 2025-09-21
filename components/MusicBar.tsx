import React from 'react';

interface MusicBarProps {
  currentTrack: { title: string; artist?: string } | null;
  isPlaying: boolean;
  isBuffering: boolean; // Add this
  error: string | null; // Add this
  onPlayPause: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function MusicBar({ 
  currentTrack, 
  isPlaying, 
  isBuffering, 
  error, 
  onPlayPause, 
  isExpanded, 
  onToggleExpand 
}: MusicBarProps) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-black bg-opacity-80 backdrop-blur-xl text-white z-50 border-t border-gray-700">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
              {isBuffering ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <span className="text-xl">🎵</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white font-medium text-sm truncate">
                {error ? "Error loading track" : currentTrack?.title || "No track selected"}
              </div>
              <div className="text-gray-400 text-xs truncate">
                {error || currentTrack?.artist || "Choose a track to play"}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 mx-8">
            <button
              onClick={onPlayPause}
              disabled={isBuffering || !!error}
              className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-all duration-200 shadow-lg disabled:opacity-50"
            >
              {isBuffering ? (
                <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
              ) : isPlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>

          <div className="flex items-center justify-end flex-1">
            <button
              onClick={onToggleExpand}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-800"
            >
              <span className="text-sm font-medium">Queue</span>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M7 14l5-5 5 5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
