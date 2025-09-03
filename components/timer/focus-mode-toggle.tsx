'use client';

import {  EnterFullScreenIcon,
  ExitFullScreenIcon, } from '@radix-ui/react-icons';
import { useEffect } from 'react';
import { usePomodoro } from './pomodoro-provider';
import { ColorTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
interface Props {
  currentTheme: ColorTheme;
}

export function FocusToggleIcon({ currentTheme }: Props) {
  const { focusMode, setFocusMode } = usePomodoro();

 
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) setFocusMode(false);
    };
    document.addEventListener('fullscreenchange', onFsChange);

    const target = document.getElementById('pomodoro-focus-section');
    if (focusMode) {
      target?.requestFullscreen().catch(() => {});
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [focusMode, setFocusMode]);

  return (
    <button
      aria-label={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
      onClick={() => setFocusMode(!focusMode)}
      className={cn(
        'absolute bottom-4 right-4 rounded-md p-2 transition-colors outline-0',
        'shadow-sm hover:shadow',
      )}
      style={{
        backgroundColor: currentTheme.digitColor,
        color: currentTheme.background,
      }}
    >
      {focusMode ?  <ExitFullScreenIcon width={20} height={20} /> : <EnterFullScreenIcon width={20} height={20} />}
    </button>
  );
}
