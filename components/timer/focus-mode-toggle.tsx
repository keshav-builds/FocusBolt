"use client";

import { EnterFullScreenIcon, ExitFullScreenIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";
import { usePomodoro } from "./pomodoro-provider";
import { ColorTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
interface Props {
  currentTheme: ColorTheme;
}

export function FocusToggleIcon({ currentTheme }: Props) {
  const { focusMode, setFocusMode } = usePomodoro();

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) setFocusMode(false);
    };
    document.addEventListener("fullscreenchange", onFsChange);

    const target = document.getElementById("pomodoro-focus-section");
    if (focusMode) {
      target?.requestFullscreen().catch(() => {});
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [focusMode, setFocusMode]);

  return (
    <button
      aria-label={focusMode ? "Exit focus mode" : "Enter focus mode"}
      onClick={() => setFocusMode(!focusMode)}
      title={
        focusMode
          ? "Exit focus mode (Press Esc)"
          : "Toggle focus mode (Press F)"
      }
      className={cn(
        "absolute focus:outline-none bottom-34 right-28 rounded-md p-2 transition-colors ",
        "shadow-[0_3px_10px_rgb(0,0,0,0.2)] cursor-pointer"
      )}
      style={{
        background: `${currentTheme.background}`,
        color: currentTheme.digitColor,
        border: `1px solid ${currentTheme.cardBorder}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        position: "fixed",
        right: "27%",
        bottom: "25%",
      }}
    >
      {focusMode ? (
        <ExitFullScreenIcon width={22} height={22} />
      ) : (
        <EnterFullScreenIcon width={22} height={22} />
      )}
    </button>
  );
}
