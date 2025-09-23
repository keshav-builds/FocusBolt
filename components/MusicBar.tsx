import React from 'react';
import { ColorTheme } from '@/lib/theme';

interface MusicBarProps {
  currentTrack: { title: string; artist?: string } | null;
  isPlaying: boolean;
  isBuffering: boolean;
  error: string | null;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  currentTime: number;
  duration: number;
  volume: number;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  currentTheme: ColorTheme;
  onSelectFirstTrack: () => void;
}

export function MusicBar({ 
  currentTrack, 
  isPlaying, 
  isBuffering, 
  error, 
  onPlayPause, 
  onNext,
  onPrevious,
  currentTime,
  duration,
  volume,
  onSeek,
  onVolumeChange,
  isExpanded, 
  onToggleExpand,
  currentTheme,
  onSelectFirstTrack
}: MusicBarProps) {
  const isImageTheme = currentTheme.backgroundImage;

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

  const handlePlayClick = () => {
    if (!currentTrack) {
      onSelectFirstTrack(); // Auto-play first track when none is selected
    } else {
      onPlayPause(); // Normal play/pause when track is selected
    }
  };

 return (
  <div className="w-full max-w-2xl mx-auto">
    {/* Theme-Adaptive Music Bar */}
    <div
      className="rounded-2xl p-4 backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] border cursor-pointer"
      onClick={onToggleExpand}
      style={{
        cursor: 'pointer',
        background: isImageTheme 
          ? 'rgba(255, 255, 255, 0.02)' 
          : currentTheme.background,
        borderColor: isImageTheme 
          ? 'rgba(255, 255, 255, 0.3)' 
          : `${currentTheme.cardBorder}80`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: isImageTheme 
          ? '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)' 
          : currentTheme.shadow,
      }}
    >
      {/* Progress Bar */}
      {currentTrack && (
        <div 
          className="w-full h-1 rounded-full cursor-pointer overflow-hidden mb-3"
          style={{ 
            backgroundColor: isImageTheme 
              ? 'rgba(255, 255, 255, 0.3)' 
              : `${currentTheme.separatorColor}30`
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleSeekClick(e);
          }}
        >
          <div 
            className="h-full rounded-full transition-all duration-200"
            style={{ 
              width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
              backgroundColor: isImageTheme 
                ? 'rgba(255, 255, 255, 0.9)' 
                : currentTheme.digitColor,
              boxShadow: isImageTheme 
                ? '0 0 8px rgba(255, 255, 255, 0.5)' 
                : `0 0 8px ${currentTheme.digitColor}50`
            }}
          />
        </div>
      )}

      <div className="flex items-center">
        {/* Track Info */}
        <div className="flex-1 min-w-0 mr-6 group">
          {currentTrack ? (
            <>
              <div 
                className="text-sm font-semibold truncate group-hover:opacity-80 transition-opacity"
                style={{ 
                  color: isImageTheme 
                    ? 'rgba(255, 255, 255, 0.95)' 
                    : currentTheme.digitColor 
                }}
              >
                {currentTrack.title}
              </div>
              <div 
                className="text-xs truncate mt-0.5 flex items-center space-x-2 group-hover:opacity-80 transition-opacity"
                style={{ 
                  color: isImageTheme 
                    ? 'rgba(255, 255, 255, 0.7)' 
                    : currentTheme.separatorColor 
                }}
              >
                <span>{currentTrack.artist}</span>
                <span>•</span>
                <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3 group-hover:opacity-80 transition-opacity">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: isImageTheme 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : `${currentTheme.separatorColor}20`,
                  border: `1px solid ${isImageTheme ? 'rgba(255, 255, 255, 0.3)' : currentTheme.cardBorder}`,
                }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{
                  color: isImageTheme 
                    ? 'rgba(255, 255, 255, 0.8)' 
                    : currentTheme.separatorColor 
                }}>
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
              <div>
                <div
                  className="text-sm font-medium"
                  style={{ 
                    color: isImageTheme 
                      ? 'rgba(255, 255, 255, 0.9)' 
                      : currentTheme.digitColor 
                  }}
                >
                  {error || "No track selected"}
                </div>
                <div 
                  className="text-xs opacity-70"
                  style={{ 
                    color: isImageTheme 
                      ? 'rgba(255, 255, 255, 0.6)' 
                      : currentTheme.separatorColor 
                  }}
                >
                  Click to browse music
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Music Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
            disabled={!currentTrack}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-40 border"
            style={{
              backgroundColor: isImageTheme 
                ? 'rgba(255, 255, 255, 0.2)' 
                : currentTheme.cardBackground,
              color: isImageTheme 
                ? 'rgba(255, 255, 255, 0.9)' 
                : currentTheme.digitColor,
              borderColor: isImageTheme 
                ? 'rgba(255, 255, 255, 0.3)' 
                : currentTheme.cardBorder,
            }}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlayClick();
            }}
            disabled={isBuffering || !!error}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-50 shadow-xl"
            style={{
              backgroundColor: isImageTheme 
                ? 'rgba(255, 255, 255, 0.9)' 
                : currentTheme.digitColor,
              color: isImageTheme 
                ? 'rgba(0, 0, 0, 0.8)' 
                : currentTheme.background,
              boxShadow: isImageTheme 
                ? '0 4px 16px rgba(255, 255, 255, 0.3)' 
                : `0 4px 16px ${currentTheme.digitColor}40`,
            }}
            title={!currentTrack ? "Play first track" : isPlaying ? "Pause" : "Play"}
          >
            {isBuffering ? (
              <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            ) : !currentTrack ? (
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : isPlaying ? (
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
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            disabled={!currentTrack}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-40 border"
            style={{
              backgroundColor: isImageTheme 
                ? 'rgba(255, 255, 255, 0.2)' 
                : currentTheme.cardBackground,
              color: isImageTheme 
                ? 'rgba(255, 255, 255, 0.9)' 
                : currentTheme.digitColor,
              borderColor: isImageTheme 
                ? 'rgba(255, 255, 255, 0.3)' 
                : currentTheme.cardBorder,
            }}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        {/* Volume Control - KEEP ORIGINAL LAYOUT WITH flex-1 */}
        <div className="flex items-center justify-end flex-1 ml-6">
          <div className="flex items-center space-x-2">
            <svg 
              className="w-4 h-4 flex-shrink-0" 
              fill="currentColor" 
              viewBox="0 0 24 24" 
              style={{ 
                color: isImageTheme 
                  ? 'rgba(255, 255, 255, 0.8)' 
                  : currentTheme.separatorColor 
              }}
            >
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              onMouseDown={(e) => e.stopPropagation()} // PREVENT DRAG FROM OPENING
              onClick={(e) => e.stopPropagation()} // PREVENT CLICK FROM OPENING
              className="w-16 h-1.5 rounded-lg appearance-none cursor-pointer"
              style={{
                cursor: 'pointer',
                background: `linear-gradient(to right, ${
                  isImageTheme 
                    ? 'rgba(255, 255, 255, 0.8)' 
                    : currentTheme.digitColor
                } 0%, ${
                  isImageTheme 
                    ? 'rgba(255, 255, 255, 0.8)' 
                    : currentTheme.digitColor
                } ${volume * 100}%, ${
                  isImageTheme 
                    ? 'rgba(255, 255, 255, 0.3)' 
                    : currentTheme.separatorColor + '40'
                } ${volume * 100}%, ${
                  isImageTheme 
                    ? 'rgba(255, 255, 255, 0.3)' 
                    : currentTheme.separatorColor + '40'
                } 100%)`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

}
