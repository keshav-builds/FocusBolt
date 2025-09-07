"use client"

import type * as React from "react"
// import { ThemeProvider } from "@/components/theme-provider"
import { PomodoroProvider } from "@/components/timer/pomodoro-provider"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    // <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <PomodoroProvider>{children}</PomodoroProvider>
    // {/* </ThemeProvider> */}
  )
}
