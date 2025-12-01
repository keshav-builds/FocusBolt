"use client";

import { useState, useEffect, useCallback } from "react";

interface DailyFocusData {
  date: string;
  totalMinutes: number;
}

export function useDailyFocus() {
  const [dailyMinutes, setDailyMinutes] = useState<number>(0);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = useCallback(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }, []);

  // Load daily focus data from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("focusBolt:dailyFocus");
    if (stored) {
      try {
        const data: DailyFocusData = JSON.parse(stored);
        const today = getTodayDate();

        if (data.date === today) {
          // Same day - use stored value
          setDailyMinutes(data.totalMinutes);
          setHasStarted(data.totalMinutes > 0);
        } else {
          // New day - reset
          const newData: DailyFocusData = {
            date: today,
            totalMinutes: 0,
          };
          localStorage.setItem("focusBolt:dailyFocus", JSON.stringify(newData));
          setDailyMinutes(0);
          setHasStarted(false);
        }
      } catch (error) {
        console.error("Failed to parse daily focus data:", error);
        setDailyMinutes(0);
        setHasStarted(false);
      }
    } else {
      // No stored data - initialize
      const newData: DailyFocusData = {
        date: getTodayDate(),
        totalMinutes: 0,
      };
      localStorage.setItem("focusBolt:dailyFocus", JSON.stringify(newData));
      setDailyMinutes(0);
      setHasStarted(false);
    }
  }, [getTodayDate]);

  // Add minutes to today's total
  const addMinutes = useCallback(
    (minutes: number) => {
      if (typeof window === "undefined" || minutes <= 0) return;

      const today = getTodayDate();
      const newTotal = dailyMinutes + minutes;

      const data: DailyFocusData = {
        date: today,
        totalMinutes: newTotal,
      };

      localStorage.setItem("focusBolt:dailyFocus", JSON.stringify(data));
      setDailyMinutes(newTotal);
      setHasStarted(true);
    },
    [dailyMinutes, getTodayDate]
  );

  return {
    dailyMinutes,
    hasStarted,
    addMinutes,
  };
}
