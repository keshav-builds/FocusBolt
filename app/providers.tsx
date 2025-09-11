"use client"

import type * as React from "react"

import { PomodoroProvider } from "@/components/timer/pomodoro-provider"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    
      <PomodoroProvider>{children}</PomodoroProvider>
   
  )
}
