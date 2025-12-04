"use client";

import { useState, useEffect, useCallback } from "react";
import { getTodayTotalMinutes } from "@/lib/progress";

export function useDailyFocus() {
  const [dailyMinutes, setDailyMinutes] = useState<number>(0);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  const updateDailyMinutes = useCallback(() => {
    if (typeof window === "undefined") return;
    const total = getTodayTotalMinutes();
    setDailyMinutes(total);
    setHasStarted(total > 0);
  }, []);

  useEffect(() => {
    updateDailyMinutes();
  }, [updateDailyMinutes]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleProgressUpdate = () => updateDailyMinutes();
    window.addEventListener("progressUpdate", handleProgressUpdate);
    return () => window.removeEventListener("progressUpdate", handleProgressUpdate);
  }, [updateDailyMinutes]);

  return {
    dailyMinutes,
    hasStarted,
  };
}
