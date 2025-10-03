"use client";

import { EnterFullScreenIcon, ExitFullScreenIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { usePomodoro } from "./pomodoro-provider";
import { ColorTheme } from "@/lib/theme";

interface Props {
  currentTheme: ColorTheme;
}

export function FocusToggleIcon({ currentTheme }: Props) {
  const { focusMode, setFocusMode } = usePomodoro();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 1024;
      setIsMobile(isTouchDevice && isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Listen for fullscreen changes (ESC key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      // Only update if state doesn't match actual fullscreen state
      if (focusMode !== !!document.fullscreenElement) {
        setFocusMode(!!document.fullscreenElement);
      }
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [focusMode, setFocusMode]);

  const isImageTheme = Boolean(currentTheme.backgroundImage);

  if (isMobile) return null;

  const handleClick = async () => {
    const target = document.getElementById("pomodoro-focus-section");
    if (!target) return;

    try {
      if (focusMode) {
        // Exit fullscreen
        await document.exitFullscreen();
        setFocusMode(false);
      } else {
        // Enter fullscreen
        await target.requestFullscreen();
        setFocusMode(true);
      }
    } catch (err) {
      console.error("Fullscreen toggle failed:", err);
      setFocusMode(false);
    }
  };

  return (
    <button
      aria-label={focusMode ? "Exit focus mode" : "Enter focus mode"}
      onClick={handleClick}
      title={focusMode ? "Exit focus mode (Press Esc)" : "Toggle focus mode (Press F)"}
      className="fixed bottom-24 right-6 lg:right-8 rounded-md p-2 transition-all duration-200 hover:opacity-100 z-40 shadow-lg"
      style={{
        background: isImageTheme ? "rgba(255,255,255,0.9)" : currentTheme.background,
        color: currentTheme.digitColor,
        border: `1px solid ${currentTheme.cardBorder}`,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        opacity: 0.85,
        position: 'fixed',
  bottom: 24,           // 6rem from bottom
  right: 24,
        cursor: "pointer",
      }}
    >
      {focusMode ? <ExitFullScreenIcon width={22} height={22} /> : <EnterFullScreenIcon width={22} height={22} />}
    </button>
  );
}
