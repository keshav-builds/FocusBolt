"use client";

import type * as React from "react";

import { PomodoroProvider } from "@/components/timer/pomodoro-provider";
import { useDynamicTitleAndFavicon } from "@/hooks/useDynamicTitleAndFavicon";
function PomodoroTitleUpdater() {
  useDynamicTitleAndFavicon();
  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <PomodoroProvider>
      <PomodoroTitleUpdater />
      {children}
    </PomodoroProvider>
  );
}
