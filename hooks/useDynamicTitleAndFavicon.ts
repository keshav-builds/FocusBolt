import { useEffect } from "react"
import { usePomodoro } from "@/components/timer/pomodoro-provider"

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0")
  const s = (seconds % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}

export function useDynamicTitleAndFavicon() {
  const { mode, remaining } = usePomodoro()

  useEffect(() => {
    
    const modeText = mode === "work" ? "Time to Focus" : "Break Time"
    const timeFormatted = formatTime(remaining)
    document.title = ` ${timeFormatted} - ${modeText}`

    // Change favicon dynamically
    const favicon = document.getElementById("favicon") as HTMLLinkElement | null
    if (favicon) {
      favicon.href = mode === "work" ? "/favicon.ico" : "/cup.png"
    }
  }, [mode, remaining])
}
