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
import { addProgressEvent } from "@/lib/progress";
import { useDailyFocus } from "@/hooks/use-daily-focus";

type Mode = "work" | "short" | "long";
type ViewMode = Mode;

type Settings = {
  durations: { work: number; short: number; long: number };
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
  epochMs: number | null;
  cycleCount: number;
  viewMode: ViewMode;
  focusMode: boolean;
  workSessionStart: number;
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
  mode: Mode;
  viewMode: ViewMode;
  isRunning: boolean;
  remaining: number;
  focusMode: boolean;
  durations: Settings["durations"];
  longInterval: number;
  autoStartNext: boolean;
  autoPauseOnBlur: boolean;
  autoResumeOnFocus: boolean;
  notifications: boolean;
  timeFormat: Settings["timeFormat"];
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
  dailyMinutes: number;
  hasStartedToday: boolean;
};

const PomodoroContext = createContext<Ctx | null>(null);

// flag to track if save already happened this session
let sessionSaveCompleted = false;

// ---- Notification helpers ----

async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch {
    return false;
  }
}

async function sendSwNotification(
  title: string,
  options: NotificationOptions
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator)) return false;
  if (!("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;

  try {
    const reg = await navigator.serviceWorker.ready;
    if (reg && reg.active) {
      reg.active.postMessage({
        type: "FOCUSBOLT_NOTIFY",
        payload: {
          title,
          options,
        },
      });
      return true;
    }
  } catch {
    // ignore, will fall back
  }
  return false;
}

function showPageNotificationFallback(
  title: string,
  options: NotificationOptions
): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    // Works well on desktop and localhost; mobile may ignore it,
    // but SW path covers that in production.
    // eslint-disable-next-line no-new
    new Notification(title, options);
  } catch {
    // ignore
  }
}

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

  // Counter daily focus minutes
  const { dailyMinutes, hasStarted } = useDailyFocus();

  // Notify sound
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      notificationSound.current = new Audio("/sounds/notify.mp3");
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
        if (Notification.permission !== "granted") {
          const granted = await requestNotificationPermission();
          if (!granted) return;
        }

        const baseOptions: NotificationOptions = {
          requireInteraction: true,
          silent: false,
          ...options,
          body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
        };

        const sentViaSw = await sendSwNotification(title, baseOptions);
        if (!sentViaSw) {
          showPageNotificationFallback(title, baseOptions);
        }

        if (sound) {
          sound.play().catch(() => {});
        }
      } catch (error) {
        // Non-fatal: logging is enough
        // eslint-disable-next-line no-console
        console.warn("Notification failed:", error);
      }
    },
    [settings.notifications]
  );

  const onComplete = useCallback(
    (finishedMode: Mode) => {
      // Block duplicate saves for same session
      if (sessionSaveCompleted) {
        return;
      }
      sessionSaveCompleted = true;

      if (finishedMode === "work") {
        const fullDuration = durationFor("work");
        addProgressEvent({
          type: "work",
          seconds: fullDuration,
        });

        safeNotify(
          "Work session complete 🍃",
          "Great job! Time for a break.",
          { tag: `work-complete-${Date.now()}` },
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

      setState((prev) => {
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

    

        return {
          ...prev,
          mode: nextMode,
          viewMode: nextMode,
          cycleCount,
          remaining: nextRemaining,
          isRunning: willAutoStart,
          epochMs: willAutoStart ? Date.now() : null,
          workSessionStart:
            willAutoStart && nextMode === "work" ? nextRemaining : 0,
        };
      });
    },
    [
      durationFor,
      safeNotify,
      setState,
      settings.longInterval,
      settings.autoStartNext,
    ]
  );

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
  }, [setState, durationFor, onComplete]);

  useEffect(() => {
    setState((prev) => {
      if (prev.isRunning) {
        return prev;
      }
      const newDuration = durationFor(prev.mode);
      return { ...prev, remaining: newDuration };
    });
  }, [settings.durations, durationFor, setState]);

  // Restore after browser reopen
  useEffect(() => {
    setState((prev) => {
      if (prev.epochMs && prev.isRunning) {
        const elapsed = Math.floor((Date.now() - prev.epochMs) / 1000);
        const total = durationFor(prev.mode);
        const left = Math.max(0, total - elapsed);
        if (left === 0) {
          queueMicrotask(() => onComplete(prev.mode));
          return { ...prev, isRunning: false, epochMs: null, remaining: 0 };
        }
        return { ...prev, remaining: left, isRunning: false, epochMs: null };
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Visibility-based auto pause/resume
  const wasPausedByBlur = useRef(false);

  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }

    if (
      visibility === "hidden" &&
      settings.autoPauseOnBlur &&
      state.isRunning
    ) {
      wasPausedByBlur.current = true;
      setState((s) => ({
        ...s,
        isRunning: false,
        epochMs: null,
        workSessionStart: 0,
      }));
    } else if (
      visibility === "visible" &&
      settings.autoResumeOnFocus &&
      !state.isRunning &&
      wasPausedByBlur.current
    ) {
      wasPausedByBlur.current = false;
      setState((s) => {
        const fullDuration = durationFor(s.mode);
        if (s.remaining > 0 && s.remaining < fullDuration) {
          return {
            ...s,
            isRunning: true,
            epochMs: Date.now() - (fullDuration - s.remaining) * 1000,
            workSessionStart: s.mode === "work" ? s.remaining : 0,
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
    durationFor,
  ]);

  const start = useCallback(() => {
    // Reset save flag when starting new session
    sessionSaveCompleted = false;

    setState((prev) => {
      const fullDuration = durationFor(prev.mode);
      const remaining = prev.remaining > 0 ? prev.remaining : fullDuration;
      const alreadyElapsed = fullDuration - remaining;
      const adjustedEpochMs = Date.now() - alreadyElapsed * 1000;
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
    setState((prev) => ({
      ...prev,
      isRunning: false,
      epochMs: null,
    }));
  }, [setState]);

  const reset = useCallback(() => {
    // Reset save flag on reset
    sessionSaveCompleted = false;

    setState((prev) => ({
      ...prev,
      remaining: durationFor(prev.mode),
      isRunning: false,
      epochMs: null,
      workSessionStart: 0,
    }));
  }, [durationFor, setState]);

  const skip = useCallback(() => {
    // Reset save flag before skip triggers onComplete
    sessionSaveCompleted = false;
    onComplete(state.mode);
  }, [onComplete, state.mode]);

  const switchMode = useCallback(
    (mode: Mode) => {
      // Reset save flag on mode switch
      sessionSaveCompleted = false;

      setState((prev) => ({
        ...prev,
        mode,
        viewMode: mode,
        remaining: durationFor(mode),
        isRunning: false,
        epochMs: null,
        workSessionStart: 0,
      }));
    },
    [durationFor, setState]
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
    async (b: boolean) => {
      if (b) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          // eslint-disable-next-line no-console
          console.log("Notification permission not granted");
          return;
        }
      }
      setSettings((s) => ({ ...s, notifications: b }));
    },
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
      dailyMinutes,
      hasStartedToday: hasStarted,
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
      setSettingsOpen,
      setFocusMode,
      setTimeFormat,
      dailyMinutes,
      hasStarted,
    ]
  );

  return (
    <PomodoroContext.Provider value={ctx}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const ctx = useContext(PomodoroContext);
  if (!ctx) throw new Error("usePomodoro must be used within PomodoroProvider");
  return ctx;
}
