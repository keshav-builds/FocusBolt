"use client";

import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useVisibility } from "@/hooks/use-visibility";
import { notify, ensurePermission } from "@/lib/notifications";
import { addProgressEvent, markTodayWorkComplete } from "@/lib/progress";

type Mode = "work" | "short" | "long";
type ViewMode = Mode;

type Settings = {
  durations: { work: number; short: number; long: number }; // seconds
  longInterval: number;
  autoStartNext: boolean;
  autoPauseOnBlur: boolean;
  autoResumeOnFocus: boolean;
  notifications: boolean;
  timeFormat: "24h" | "12h";
};

type PersistedState = {
  mode: Mode;
  remaining: number;
  isRunning: boolean;
  epochMs: number | null; // wall clock at start for drift-free calc
  cycleCount: number;
  viewMode: ViewMode;
  focusMode: boolean;
  workSessionStart: number; // Track work session start time for progress tracking
};

const DEFAULT_SETTINGS: Settings = {
  durations: { work: 25 * 60, short: 5 * 60, long: 15 * 60 },
  longInterval: 4,
  autoStartNext: false,
  autoPauseOnBlur: false,
  autoResumeOnFocus: true,
  notifications: false,
  timeFormat: "24h",
};

const DEFAULT_STATE: PersistedState = {
  mode: "work",
  remaining: DEFAULT_SETTINGS.durations.work,
  isRunning: false,
  epochMs: null,
  cycleCount: 0,
  viewMode: "work",
  focusMode: false,
  workSessionStart: 0,
};

type Ctx = {
  // state
  mode: Mode;
  viewMode: ViewMode;
  isRunning: boolean;
  remaining: number;
  focusMode: boolean;
  // settings
  durations: Settings["durations"];
  longInterval: number;
  autoStartNext: boolean;
  autoPauseOnBlur: boolean;
  autoResumeOnFocus: boolean;
  notifications: boolean;
  timeFormat: Settings["timeFormat"];
  // actions
  setViewMode: (v: ViewMode) => void;
  switchMode: (mode: Mode) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  setDurations: (d: Settings["durations"]) => void;
  setLongInterval: (n: number) => void;
  setAutoStartNext: (b: boolean) => void;
  setAutoPauseOnBlur: (b: boolean) => void;
  setAutoResumeOnFocus: (b: boolean) => void;
  setNotifications: (b: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (b: boolean) => void;
  setFocusMode: (b: boolean) => void;
  setTimeFormat: (f: Settings["timeFormat"]) => void;
};

const PomodoroContext = createContext<Ctx | null>(null);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useLocalStorage<Settings>(
    "pomodoro:settings",
    DEFAULT_SETTINGS
  );
  const [state, setState] = useLocalStorage<PersistedState>(
    "pomodoro:state",
    DEFAULT_STATE
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const visibility = useVisibility();
  const intervalRef = useRef<number | null>(null);

  const durationFor = useCallback(
    (mode: Mode) => settings.durations[mode],
    [settings.durations]
  );

  // Helper function to save work progress
  const saveWorkProgress = useCallback(
    (currentState: PersistedState) => {
      if (
        currentState.mode === "work" &&
        currentState.workSessionStart > 0 &&
        currentState.remaining >= 0
      ) {
        const secondsWorked = currentState.workSessionStart - currentState.remaining;

        if (secondsWorked > 0) {
          addProgressEvent({
            type: "work",
            seconds: secondsWorked,
          });
          console.log(`Saved ${secondsWorked} seconds of work`);
        }
      }
    },
    []
  );

  // Recompute remaining when durations change (new duration)
  useEffect(() => {
    setState((prev) => {
      const max = durationFor(prev.mode);
      return { ...prev, remaining: Math.min(prev.remaining, max) };
    });
  }, [durationFor, setState]);

  // Restore after browser reopen if a session was running - but don't auto-start
  useEffect(() => {
    setState((prev) => {
      if (prev.epochMs && prev.isRunning) {
        const elapsed = Math.floor((Date.now() - prev.epochMs) / 1000);
        const total = durationFor(prev.mode);
        const left = Math.max(0, total - elapsed);
        if (left === 0) {
          // Session completed while away - finalize immediately
          queueMicrotask(() => onComplete(prev.mode));
          return { ...prev, isRunning: false, epochMs: null, remaining: 0 };
        }
        // Keep paused on page load - user must manually resume
        return { ...prev, remaining: left, isRunning: false, epochMs: null };
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tick = useCallback(() => {
    setState((prev) => {
      if (!prev.isRunning || prev.epochMs == null) return prev;
      const elapsed = Math.floor((Date.now() - prev.epochMs) / 1000);
      const total = durationFor(prev.mode);
      const nextRemaining = Math.max(0, total - elapsed);
      if (nextRemaining === 0) {
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        queueMicrotask(() => onComplete(prev.mode));
        return { ...prev, isRunning: false, remaining: 0, epochMs: null };
      }
      return { ...prev, remaining: nextRemaining };
    });
  }, [setState, durationFor]);

  useEffect(() => {
    if (state.isRunning && intervalRef.current == null) {
      intervalRef.current = window.setInterval(tick, 1000) as unknown as number;
    }
    return () => {
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isRunning, tick]);

  // Visibility-based auto pause/resume - prevent auto-start on initial page load
  useEffect(() => {
    // Skip auto-resume on initial page load
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }

    if (
      visibility === "hidden" &&
      settings.autoPauseOnBlur &&
      state.isRunning
    ) {
      // Save work progress before pausing
      setState((s) => {
        saveWorkProgress(s);
        return { ...s, isRunning: false, epochMs: null, workSessionStart: 0 };
      });
    } else if (
      visibility === "visible" &&
      settings.autoResumeOnFocus &&
      !state.isRunning
    ) {
      setState((s) => {
        // Only auto-resume if there's time remaining and it was previously running
        if (s.remaining > 0 && s.epochMs !== null) {
          // Restart work session tracking on resume
          const newWorkSessionStart = s.mode === "work" ? s.remaining : 0;
          return {
            ...s,
            isRunning: true,
            epochMs: Date.now(),
            workSessionStart: newWorkSessionStart,
          };
        }
        return s;
      });
    }
  }, [
    visibility,
    settings.autoPauseOnBlur,
    settings.autoResumeOnFocus,
    setState,
    isInitialLoad,
    state.isRunning,
    saveWorkProgress,
  ]);

  //notify sound
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      notificationSound.current = new Audio("/sounds/notify.wav");
    }
  }, []);

  const safeNotify = useCallback(
    async (
      title: string,
      body: string,
      options?: NotificationOptions,
      sound?: HTMLAudioElement
    ) => {
      if (!settings.notifications) return;
      try {
        const granted = await ensurePermission();
        if (granted) {
          notify(title, {
            requireInteraction: true,
            silent: false,
            ...options,
            body,
          });
          if (sound) {
            sound.play().catch(() => {
              // Ignore autoplay errors
            });
          }
        }
      } catch (error) {
        console.warn("Notification failed:", error);
      }
    },
    [settings.notifications]
  );

  const onComplete = useCallback(
    (finishedMode: Mode) => {
      // Save work progress when session completes
      setState((prev) => {
        if (finishedMode === "work") {
          saveWorkProgress(prev);
          markTodayWorkComplete();
          safeNotify(
            "Work session complete 🍃",
            "Great job! Time for a break.",
            { tag: `session-complete-${Date.now()}` },
            notificationSound.current ?? undefined
          );
        } else {
          safeNotify(
            "Break complete ⏰",
            "Time to focus. Start your next work session.",
            { tag: `break-complete-${Date.now()}` },
            notificationSound.current ?? undefined
          );
        }

        let cycleCount = prev.cycleCount;
        let nextMode: Mode = prev.mode;
        if (finishedMode === "work") {
          cycleCount += 1;
          const isLong = cycleCount % settings.longInterval === 0;
          nextMode = isLong ? "long" : "short";
        } else {
          nextMode = "work";
        }
        const nextRemaining = durationFor(nextMode);
        const willAutoStart = settings.autoStartNext;

        if (nextMode === "work" && !willAutoStart) {
          safeNotify(
            "Time to start work ⏰",
            "Press Start to begin your next focus block.",
            { tag: `start-work-${Date.now()}` }
          );
        }

        return {
          ...prev,
          mode: nextMode,
          viewMode: nextMode,
          cycleCount,
          remaining: nextRemaining,
          isRunning: willAutoStart,
          epochMs: willAutoStart ? Date.now() : null,
          workSessionStart: willAutoStart && nextMode === "work" ? nextRemaining : 0,
        };
      });
    },
    [
      durationFor,
      safeNotify,
      setState,
      settings.longInterval,
      settings.autoStartNext,
      saveWorkProgress,
    ]
  );

  const start = useCallback(() => {
    setState((prev) => {
      const fullDuration = durationFor(prev.mode);
      const remaining = prev.remaining > 0 ? prev.remaining : fullDuration;

      // Adjust epochMs to account for already elapsed time
      const alreadyElapsed = fullDuration - remaining;
      const adjustedEpochMs = Date.now() - alreadyElapsed * 1000;

      // Track work session start for progress tracking
      const workSessionStart = prev.mode === "work" ? remaining : 0;

      return {
        ...prev,
        isRunning: true,
        remaining,
        epochMs: adjustedEpochMs,
        workSessionStart,
      };
    });
  }, [durationFor, setState]);

  const pause = useCallback(() => {
    setState((prev) => {
      // Save work progress before pausing
      saveWorkProgress(prev);
      return {
        ...prev,
        isRunning: false,
        epochMs: null,
        workSessionStart: 0,
      };
    });
  }, [setState, saveWorkProgress]);

  const reset = useCallback(() => {
    setState((prev) => {
      // Save work progress before resetting
      saveWorkProgress(prev);
      return {
        ...prev,
        remaining: durationFor(prev.mode),
        isRunning: false,
        epochMs: null,
        workSessionStart: 0,
      };
    });
  }, [durationFor, setState, saveWorkProgress]);

  const skip = useCallback(() => {
    setState((prev) => {
      // Save work progress before skipping
      saveWorkProgress(prev);
      return prev;
    });
    onComplete(state.mode);
  }, [onComplete, state.mode, setState, saveWorkProgress]);

  const switchMode = useCallback(
    (mode: Mode) => {
      setState((prev) => {
        // Save work progress before switching modes
        saveWorkProgress(prev);
        return {
          ...prev,
          mode,
          viewMode: mode,
          remaining: durationFor(mode),
          isRunning: false,
          epochMs: null,
          workSessionStart: 0,
        };
      });
    },
    [durationFor, setState, saveWorkProgress]
  );

  const setDurations = useCallback(
    (d: Settings["durations"]) => setSettings((s) => ({ ...s, durations: d })),
    [setSettings]
  );
  const setLongInterval = useCallback(
    (n: number) => setSettings((s) => ({ ...s, longInterval: n })),
    [setSettings]
  );
  const setAutoStartNext = useCallback(
    (b: boolean) => setSettings((s) => ({ ...s, autoStartNext: b })),
    [setSettings]
  );
  const setAutoPauseOnBlur = useCallback(
    (b: boolean) => setSettings((s) => ({ ...s, autoPauseOnBlur: b })),
    [setSettings]
  );
  const setAutoResumeOnFocus = useCallback(
    (b: boolean) => setSettings((s) => ({ ...s, autoResumeOnFocus: b })),
    [setSettings]
  );
  const setNotifications = useCallback(
    (b: boolean) => setSettings((s) => ({ ...s, notifications: b })),
    [setSettings]
  );
  const setViewMode = useCallback(
    (v: ViewMode) => setState((prev) => ({ ...prev, viewMode: v })),
    [setState]
  );
  const setFocusMode = useCallback(
    (b: boolean) => setState((prev) => ({ ...prev, focusMode: b })),
    [setState]
  );
  const setTimeFormat = useCallback(
    (f: Settings["timeFormat"]) =>
      setSettings((s) => ({ ...s, timeFormat: f })),
    [setSettings]
  );

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
    ]
  );

  return (
    <PomodoroContext.Provider value={ctx}>{children}</PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const ctx = useContext(PomodoroContext);
  if (!ctx) throw new Error("usePomodoro must be used within PomodoroProvider");
  return ctx;
}
