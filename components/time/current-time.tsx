"use client"

import { useEffect, useState } from "react"
import { usePomodoro } from "@/components/timer/pomodoro-provider"
import { cn } from "@/lib/utils"

export function CurrentTime({ className }: { className?: string }) {
  const { timeFormat } = usePomodoro()
  const [now, setNow] = useState<Date>(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: timeFormat === "12h",
  })

  return <div className={cn("font-mono tabular-nums", className)}>Now: {formatter.format(now)}</div>
}
