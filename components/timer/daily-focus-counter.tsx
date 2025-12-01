"use client";

import { motion } from "framer-motion";
import { ColorTheme } from "@/lib/theme";

interface DailyFocusCounterProps {
  minutes: number;
  currentTheme: ColorTheme;
  isMobile?: boolean;
}

export function DailyFocusCounter({
  minutes,
  currentTheme,
  isMobile = false,
}: DailyFocusCounterProps) {
  const isImageTheme = Boolean(currentTheme.backgroundImage);

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const displayText =
    hours > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${remainingMinutes}m`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="inline-flex items-center gap-2"
    >
      <span className={isMobile ? "text-sm" : "text-base"}>
        🔥
      </span>

      <span
        className={`font-semibold whitespace-nowrap ${
          isMobile ? "text-sm" : "text-md"
        }`}
        style={{
          color: isImageTheme
            ? currentTheme.background
            : currentTheme.digitColor,
          textShadow: isImageTheme ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
        }}
      >
        {displayText} <span style={{ opacity: 0.7 }}>focused today</span>
      </span>
    </motion.div>
  );
}
