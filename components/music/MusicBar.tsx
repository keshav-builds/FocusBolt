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

  const handlePlayClick = () => {
    if (!currentTrack) {
      onSelectFirstTrack();
    } else {
      onPlayPause();
    }
  };
  
  const progressBarRef = React.useRef<HTMLDivElement>(null);

  function getSeekPercent(e: React.MouseEvent | React.TouchEvent, node: HTMLDivElement) {
    let clientX = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
    } else if ('clientX' in e) {
      clientX = e.clientX;
    }
    const rect = node.getBoundingClientRect();
    let percent = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(1, percent));
  }

  function handleSeek(e: React.MouseEvent | React.TouchEvent) {
    e.stopPropagation();
    const node = progressBarRef.current;
    if (!node) return;
    const percent = getSeekPercent(e, node);
    onSeek(percent * duration);
  }

  function handleDragSeekStart(e: React.MouseEvent | React.TouchEvent) {
    e.stopPropagation();
    handleSeek(e);

    function moveHandler(ev: MouseEvent | TouchEvent) {
      ev.stopPropagation();
      let clientX = 0;
      if (ev instanceof TouchEvent && ev.touches.length) {
        clientX = ev.touches[0].clientX;
      } else if (ev instanceof MouseEvent) {
        clientX = ev.clientX;
      }
      const node = progressBarRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      let percent = (clientX - rect.left) / rect.width;
      percent = Math.max(0, Math.min(1, percent));
      onSeek(percent * duration);
    }

    function upHandler(ev: MouseEvent | TouchEvent) {
      ev.stopPropagation();
      window.removeEventListener('mousemove', moveHandler as any);
      window.removeEventListener('mouseup', upHandler as any);
      window.removeEventListener('touchmove', moveHandler as any);
      window.removeEventListener('touchend', upHandler as any);
    }

    window.addEventListener('mousemove', moveHandler as any);
    window.addEventListener('mouseup', upHandler as any);
    window.addEventListener('touchmove', moveHandler as any);
    window.addEventListener('touchend', upHandler as any);
  }

  return (
    <div className="w-full mx-auto pb-4 sm:pb-3">
      {/* Theme-Adaptive Music Bar */}
      <div
      className="rounded-xl sm:rounded-2xl p-2 sm:p-3 backdrop-blur-xl transition-all duration-300 hover:scale-[1.005] sm:hover:scale-[1.01] border cursor-pointer min-h-[68px] sm:min-h-[76px]"
 onClick={onToggleExpand} 
        style={{
          cursor: 'pointer',
          background: isImageTheme 
            ? 'rgba(255, 255, 255, 0.08)' 
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
        <div
          ref={progressBarRef}
          className={`w-full h-1 sm:h-1.5 rounded-full  overflow-hidden mb-1.5 sm:mb-2 transition-opacity duration-200 ${
            currentTrack ? 'opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'
          }`}
          style={{
            backgroundColor: isImageTheme 
              ? 'rgba(255, 255, 255, 0.3)'
              : `${currentTheme.separatorColor}30`
          }}
          onClick={currentTrack ? handleSeek : undefined}
          onMouseDown={currentTrack ? handleDragSeekStart : undefined}
          onTouchStart={currentTrack ? handleDragSeekStart : undefined}
        >
          <div
            className="h-full rounded-full transition-all duration-200 "
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

        {/* MOBILE LAYOUT (< 640px) */}
        <div className="sm:hidden ">
          <div className="flex items-center gap-3 ">
            {/* Track Info - Mobile */}
            <div className="flex-1 min-w-0">
              {currentTrack ? (
                <>
                  <div 
                    className="text-md font-semibold truncate"
                    style={{ 
                      color: isImageTheme 
                        ? 'rgba(255, 255, 255, 0.95)' 
                        : currentTheme.digitColor 
                    }}
                  >
                    {currentTrack.title}
                  </div>
                  <div 
                    className="text-[12px] truncate mt-0.5"
                    style={{ 
                      color: isImageTheme 
                        ? 'rgba(255, 255, 255, 0.7)' 
                        : currentTheme.separatorColor 
                    }}
                  >
                    {currentTrack.artist}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: isImageTheme 
                        ? 'rgba(255, 255, 255, 0.2)' 
                        : `${currentTheme.separatorColor}20`,
                      border: `1px solid ${isImageTheme ? 'rgba(255, 255, 255, 0.3)' : currentTheme.cardBorder}`,
                    }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{
                      color: isImageTheme 
                        ? 'rgba(255, 255, 255, 0.8)' 
                        : currentTheme.digitColor 
                    }}>
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div
                      className="text-md font-medium truncate"
                      style={{ 
                        color: isImageTheme 
                          ? 'rgba(255, 255, 255, 0.9)' 
                          : currentTheme.digitColor 
                      }}
                    >
                      {error || "No track"}
                    </div>
                    <div 
                      className="text-[12px] opacity-70 truncate"
                      style={{ 
                        color: isImageTheme 
                          ? 'rgba(255, 255, 255, 0.6)' 
                          : currentTheme.separatorColor 
                      }}
                    >
                      Tap to browse
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Compact Controls - Mobile */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPrevious();
                }}
                disabled={!currentTrack}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 disabled:opacity-40 border"
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
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayClick();
                }}
                disabled={isBuffering || !!error}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-50 shadow-lg"
                style={{
                  backgroundColor: isImageTheme 
                    ? 'rgba(255, 255, 255, 0.9)' 
                    : currentTheme.digitColor,
                  color: isImageTheme 
                    ? 'rgba(0, 0, 0, 0.8)' 
                    : currentTheme.background,
                  boxShadow: isImageTheme 
                    ? '0 4px 12px rgba(255, 255, 255, 0.3)' 
                    : `0 4px 12px ${currentTheme.digitColor}40`,
                }}
              >
                {isBuffering ? (
                  <div className="animate-spin w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" />
                ) : !currentTrack ? (
                  <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
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

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                disabled={!currentTrack}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 disabled:opacity-40 border"
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
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Time Display */}
          {currentTrack && (
            <div 
              className="flex items-center justify-between mt-1.5 text-[10px]"
              style={{ 
                color: isImageTheme 
                  ? 'rgba(255, 255, 255, 0.6)' 
                  : currentTheme.separatorColor 
              }}
            >
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          )}
        </div>

        {/* DESKTOP LAYOUT (≥ 640px) */}
        <div className="hidden sm:flex items-center">
          {/* Track Info - Desktop */}
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
                      : currentTheme.digitColor 
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

          {/* Music Controls - Desktop */}
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
                cursor:'pointer',
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
                cursor:'pointer',
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
                cursor:'pointer',
              }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>

          {/* Volume Control - Desktop Only */}
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
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
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
