"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useVisibility } from "@/hooks/use-visibility"
import { notify, ensurePermission } from "@/lib/notifications"
import { addProgressEvent, markTodayWorkComplete } from "@/lib/progress"

type Mode = "work" | "short" | "long"
type ViewMode = Mode

type Settings = {
  durations: { work: number; short: number; long: number } // seconds
  longInterval: number
  autoStartNext: boolean
  autoPauseOnBlur: boolean
  autoResumeOnFocus: boolean
  notifications: boolean
  timeFormat: "24h" | "12h"
}

type PersistedState = {
  mode: Mode
  remaining: number
  isRunning: boolean
  epochMs: number | null // wall clock at start for drift-free calc
  cycleCount: number
  viewMode: ViewMode
  focusMode: boolean
}

const DEFAULT_SETTINGS: Settings = {
  durations: { work: 25 * 60, short: 5 * 60, long: 15 * 60 },
  longInterval: 4,
  autoStartNext: true,
  autoPauseOnBlur: false,
  autoResumeOnFocus: true,
  notifications: false,
  timeFormat: "24h",
}

const DEFAULT_STATE: PersistedState = {
  mode: "work",
  remaining: DEFAULT_SETTINGS.durations.work,
  isRunning: false,
  epochMs: null,
  cycleCount: 0,
  viewMode: "work",
  focusMode: false,
}

type Ctx = {
  // state
  mode: Mode
  viewMode: ViewMode
  isRunning: boolean
  remaining: number
  focusMode: boolean
  // settings
  durations: Settings["durations"]
  longInterval: number
  autoStartNext: boolean
  autoPauseOnBlur: boolean
  autoResumeOnFocus: boolean
  notifications: boolean
  timeFormat: Settings["timeFormat"]
  // actions
  setViewMode: (v: ViewMode) => void
  switchMode: (mode: Mode) => void
  start: () => void
  pause: () => void
  reset: () => void
  skip: () => void
  setDurations: (d: Settings["durations"]) => void
  setLongInterval: (n: number) => void
  setAutoStartNext: (b: boolean) => void
  setAutoPauseOnBlur: (b: boolean) => void
  setAutoResumeOnFocus: (b: boolean) => void
  setNotifications: (b: boolean) => void
  settingsOpen: boolean
  setSettingsOpen: (b: boolean) => void
  setFocusMode: (b: boolean) => void
  setTimeFormat: (f: Settings["timeFormat"]) => void
}

const PomodoroContext = createContext<Ctx | null>(null)

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useLocalStorage<Settings>("pomodoro:settings", DEFAULT_SETTINGS)
  const [state, setState] = useLocalStorage<PersistedState>("pomodoro:state", DEFAULT_STATE)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const visibility = useVisibility()
  const intervalRef = useRef<number | null>(null)

  const durationFor = useCallback((mode: Mode) => settings.durations[mode], [settings.durations])

  // Recompute remaining when durations change ( new duration)
  useEffect(() => {
    setState((prev) => {
      const max = durationFor(prev.mode)
      return { ...prev, remaining: Math.min(prev.remaining, max) }
    })
  }, [durationFor, setState])

  // Restore after browser reopen if a session was running
  useEffect(() => {
    setState((prev) => {
      if (prev.epochMs && prev.isRunning) {
        const elapsed = Math.floor((Date.now() - prev.epochMs) / 1000)
        const total = durationFor(prev.mode)
        const left = Math.max(0, total - elapsed)
        if (left === 0) {
          // finalize immediately
          queueMicrotask(() => onComplete(prev.mode))
          return { ...prev, isRunning: false, epochMs: null, remaining: 0 }
        }
        // keep paused; visibility effect can auto-resume if enabled
        return { ...prev, remaining: left, isRunning: false, epochMs: null }
      }
      return prev
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tick = useCallback(() => {
    setState((prev) => {
      if (!prev.isRunning || prev.epochMs == null) return prev
      const elapsed = Math.floor((Date.now() - prev.epochMs) / 1000)
      const total = durationFor(prev.mode)
      const nextRemaining = Math.max(0, total - elapsed)
      if (nextRemaining === 0) {
        window.clearInterval(intervalRef.current ?? undefined)
        intervalRef.current = null
        queueMicrotask(() => onComplete(prev.mode))
        return { ...prev, isRunning: false, remaining: 0, epochMs: null }
      }
      return { ...prev, remaining: nextRemaining }
    })
  }, [durationFor])

  useEffect(() => {
    if (state.isRunning && intervalRef.current == null) {
      intervalRef.current = window.setInterval(tick, 1000) as unknown as number
    }
    return () => {
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [state.isRunning, tick])

  // Visibility-based auto pause/resume
  useEffect(() => {
    if (visibility === "hidden" && settings.autoPauseOnBlur) {
      setState((s) => ({ ...s, isRunning: false, epochMs: null }))
    } else if (visibility === "visible" && settings.autoResumeOnFocus) {
      setState((s) => {
        if (s.remaining > 0) {
          return { ...s, isRunning: true, epochMs: Date.now() }
        }
        return s
      })
    }
  }, [visibility, settings.autoPauseOnBlur, settings.autoResumeOnFocus, setState])

  const safeNotify = useCallback(
    async (title: string, body: string, options?: NotificationOptions) => {
      if (!settings.notifications) return
      const granted = await ensurePermission()
      if (granted) notify(title, { requireInteraction: true, silent: false, ...options, body })
    },
    [settings.notifications],
  )

  const onComplete = useCallback(
    (finishedMode: Mode) => {
      if (finishedMode === "work") {
        markTodayWorkComplete()
        addProgressEvent({ type: "work", seconds: durationFor("work") })
        safeNotify("Work session complete", "Great job! Time for a break.", { tag: "session-complete" })
      } else {
        safeNotify("Break complete", "Time to focus. Start your next work session.", { tag: "break-complete" })
      }

      setState((prev) => {
        let cycleCount = prev.cycleCount
        let nextMode: Mode = prev.mode
        if (finishedMode === "work") {
          cycleCount += 1
          const isLong = cycleCount % settings.longInterval === 0
          nextMode = isLong ? "long" : "short"
        } else {
          nextMode = "work"
        }
        const nextRemaining = durationFor(nextMode)
        const willAutoStart = settings.autoStartNext

        if (nextMode === "work" && !willAutoStart) {
          safeNotify("Time to start work", "Press Start to begin your next focus block.", { tag: "start-work" })
        }

        return {
          ...prev,
          mode: nextMode,
          viewMode: nextMode,
          cycleCount,
          remaining: nextRemaining,
          isRunning: willAutoStart,
          epochMs: willAutoStart ? Date.now() : null,
        }
      })

      try {
        window.localStorage.setItem("pomodoro:quote:show", "1")
      } catch {}
    },
    [durationFor, safeNotify, setState, settings.longInterval, settings.autoStartNext],
  )

 const start = useCallback(() => {
  setState((prev) => {
    const fullDuration = durationFor(prev.mode)
    const remaining = prev.remaining > 0 ? prev.remaining : fullDuration
    
    // Adjust epochMs to account for already elapsed time
    const alreadyElapsed = fullDuration - remaining
    const adjustedEpochMs = Date.now() - (alreadyElapsed * 1000)
    
    return { 
      ...prev, 
      isRunning: true, 
      remaining, 
      epochMs: adjustedEpochMs 
    }
  })
}, [durationFor, setState])


  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false, epochMs: null }))
  }, [setState])

  const reset = useCallback(() => {
    setState((prev) => ({ ...prev, remaining: durationFor(prev.mode), isRunning: false, epochMs: null }))
  }, [durationFor, setState])

  const skip = useCallback(() => {
    onComplete(state.mode)
  }, [onComplete, state.mode])

  const switchMode = useCallback(
    (mode: Mode) => {
      setState((prev) => ({
        ...prev,
        mode,
        viewMode: mode,
        remaining: durationFor(mode),
        isRunning: false,
        epochMs: null,
      }))
    },
    [durationFor, setState],
  )

  const setDurations = useCallback(
    (d: Settings["durations"]) => setSettings((s) => ({ ...s, durations: d })),
    [setSettings],
  )
  const setLongInterval = useCallback((n: number) => setSettings((s) => ({ ...s, longInterval: n })), [setSettings])
  const setAutoStartNext = useCallback((b: boolean) => setSettings((s) => ({ ...s, autoStartNext: b })), [setSettings])
  const setAutoPauseOnBlur = useCallback(
    (b: boolean) => setSettings((s) => ({ ...s, autoPauseOnBlur: b })),
    [setSettings],
  )
  const setAutoResumeOnFocus = useCallback(
    (b: boolean) => setSettings((s) => ({ ...s, autoResumeOnFocus: b })),
    [setSettings],
  )
  const setNotifications = useCallback((b: boolean) => setSettings((s) => ({ ...s, notifications: b })), [setSettings])
  const setViewMode = useCallback((v: ViewMode) => setState((prev) => ({ ...prev, viewMode: v })), [setState])
  const setFocusMode = useCallback((b: boolean) => setState((prev) => ({ ...prev, focusMode: b })), [setState])
  const setTimeFormat = useCallback(
    (f: Settings["timeFormat"]) => setSettings((s) => ({ ...s, timeFormat: f })),
    [setSettings],
  )

  const ctx: Ctx = useMemo(
    () => ({
      mode: state.mode,
      viewMode: state.viewMode,
      isRunning: state.isRunning,
      remaining: state.remaining,
      focusMode: state.focusMode,
      durations: settings.durations,
      longInterval: settings.longInterval,
      autoStartNext: settings.autoStartNext,
      autoPauseOnBlur: settings.autoPauseOnBlur,
      autoResumeOnFocus: settings.autoResumeOnFocus,
      notifications: settings.notifications,
      timeFormat: settings.timeFormat,
      setViewMode,
      switchMode,
      start,
      pause,
      reset,
      skip,
      setDurations,
      setLongInterval,
      setAutoStartNext,
      setAutoPauseOnBlur,
      setAutoResumeOnFocus,
      setNotifications,
      settingsOpen,
      setSettingsOpen,
      setFocusMode,
      setTimeFormat,
    }),
    [
      state.mode,
      state.viewMode,
      state.isRunning,
      state.remaining,
      state.focusMode,
      settings.durations,
      settings.longInterval,
      settings.autoStartNext,
      settings.autoPauseOnBlur,
      settings.autoResumeOnFocus,
      settings.notifications,
      settings.timeFormat,
      setViewMode,
      switchMode,
      start,
      pause,
      reset,
      skip,
      setDurations,
      setLongInterval,
      setAutoStartNext,
      setAutoPauseOnBlur,
      setAutoResumeOnFocus,
      setNotifications,
      settingsOpen,
      setTimeFormat,
    ],
  )

  return <PomodoroContext.Provider value={ctx}>{children}</PomodoroContext.Provider>
}

export function usePomodoro() {
  const ctx = useContext(PomodoroContext)
  if (!ctx) throw new Error("usePomodoro must be used within PomodoroProvider")
  return ctx
}
