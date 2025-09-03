"use client";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { usePomodoro } from "./pomodoro-provider";

export function FocusModeToggle() {
  const { focusMode, setFocusMode } = usePomodoro();

  useEffect(() => {
    // Target the specific Pomodoro section instead of the whole document
    const targetElement = document.getElementById('pomodoro-focus-section');
    
    // Listen for fullscreen change event
    function onFullscreenChange() {
      // Update focusMode state to false if no fullscreen
      if (!document.fullscreenElement) {
        setFocusMode(false);
      }
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);

    // Request or exit fullscreen when focusMode changes
    if (focusMode) {
      if (targetElement && targetElement.requestFullscreen) {
        targetElement.requestFullscreen().catch(() => {
          console.log("Fullscreen request failed");
        });
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {
          console.log("Exit fullscreen failed");
        });
      }
    }

    // Cleanup listener on unmount
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [focusMode, setFocusMode]);

  return (
    <Button
      variant={focusMode ? "secondary" : "outline"}
      onClick={() => setFocusMode(!focusMode)}
      title="Toggle Focus Mode (F)"
    >
      {focusMode ? "Exit Focus" : "Focus Mode"}
    </Button>
  );
}
