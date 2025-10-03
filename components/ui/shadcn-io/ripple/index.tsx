"use client";

import React, { ComponentPropsWithoutRef, CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { ColorTheme } from "@/lib/theme";

interface RippleProps extends ComponentPropsWithoutRef<"div"> {
  mainSize?: number;
  mainOpacity?: number;
  numWaves?: number;
  currentTheme: ColorTheme;
}

export const Ripple = React.memo(function Ripple({
  mainSize = 210,
  mainOpacity = 0.24,
  numWaves = 8,
  currentTheme,
  className,
  ...props
}: RippleProps) {
  const getRippleColors = (theme: ColorTheme) => {
    if (theme.backgroundImage) {
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderColor: 'rgba(255, 255, 255, 0.5)',
        glowColor: 'rgba(255, 255, 255, 0.4)',
      };
    }
    
    return {
      backgroundColor: `${theme.digitColor}20`,
      borderColor: `${theme.cardBorder}DD`,
      glowColor: `${theme.cardBorder}66`,
    };
  };

  const rippleColors = getRippleColors(currentTheme);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 select-none",
        className,
      )}
      {...props}
    >
      {Array.from({ length: numWaves }, (_, i) => {
        const width = mainSize + i * 120;
        const height = mainSize + i * 60;
        const opacity = Math.max(mainOpacity - i * 0.03, 0.05);
        const animationDelay = `${i * 0.06}s`;

        return (
          <div
            key={i}
            className="absolute animate-ripple border"
            style={{
              "--i": i,
              width: `${width}px`,
              height: `${height}px`,
              opacity,
              animationDelay,
              borderWidth: "2px",
              borderRadius: "20px",
              borderColor: rippleColors.borderColor,
              backgroundColor: rippleColors.backgroundColor,
              boxShadow: `
                0 0 ${20 + i * 10}px ${rippleColors.glowColor},
                inset 0 0 ${15 + i * 5}px ${rippleColors.glowColor}
              `,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) scale(1)",
            } as CSSProperties}
          />
        );
      })}
    </div>
  );
});

Ripple.displayName = "Ripple";

export type { RippleProps };
