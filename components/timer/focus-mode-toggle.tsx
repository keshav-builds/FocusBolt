"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { usePomodoro } from "./pomodoro-provider"

export function FocusModeToggle() {
  const { focusMode, setFocusMode } = usePomodoro()

  useEffect(() => {
    const root = document.documentElement
    if (focusMode) {
      const el = document.documentElement as any
      if (el.requestFullscreen) el.requestFullscreen().catch(() => {})
      root.classList.add("cursor-none")
    } else {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
      root.classList.remove("cursor-none")
    }
  }, [focusMode])

  return (
    <Button
      variant={focusMode ? "secondary" : "outline"}
      onClick={() => setFocusMode(!focusMode)}
      title="Toggle Focus Mode (F)"
    >
      {focusMode ? "Exit Focus" : "Focus Mode"}
    </Button>
  )
}
