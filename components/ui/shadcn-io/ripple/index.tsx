"use client";

import React, { ComponentPropsWithoutRef, CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { ColorTheme } from "@/lib/theme"; // Import your theme type

interface RippleProps extends ComponentPropsWithoutRef<"div"> {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  currentTheme: ColorTheme; // Add theme prop
}

export const Ripple = React.memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  currentTheme, // Destructure theme
  className,
  ...props
}: RippleProps) {
  // Calculate theme-aware colors for better visibility
  const getRippleColors = (theme: ColorTheme) => {
    // For dark/space themes, use bright colors
   if (theme.backgroundImage) {
  return {
    backgroundColor: 'rgba(255, 255, 255, 0.12)', // White background for universal visibility
    borderColor: 'rgba(255, 255, 255, 0.8)', // Bright white border
    glowColor: 'rgba(255, 255, 255, 0.4)', // White glow
    outlineColor: 'rgba(0, 0, 0, 0.6)', // Dark outline for contrast
    shadowColor: 'rgba(0, 0, 0, 0.3)', // Dark shadow for depth
  };
}

    
   // For light themes, use much darker theme colors for better visibility
return {
  backgroundColor: `${theme.digitColor}20`, // Much higher opacity (67%)
  borderColor: `${theme.cardBorder}DD`, // Very high opacity (87%) 
  glowColor: `${theme.cardBorder}66`, // Medium opacity (40%)
  outlineColor: 'rgba(0, 0, 0, 0.4)', // Dark outline for extra contrast
  shadowColor: 'rgba(0, 0, 0, 0.2)', // Subtle dark shadow
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
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = Math.max(mainCircleOpacity - i * 0.03, 0.05); // Ensure minimum visibility
        const animationDelay = `${i * 0.06}s`;

        return (
          <div
            key={i}
            className="absolute animate-ripple rounded-full border"
            style={{
              "--i": i,
              width: `${size}px`,
              height: `${size}px`,
              opacity,
              animationDelay,
              borderWidth: "2px", // Thicker border for visibility
              borderColor: rippleColors.borderColor,
              backgroundColor: rippleColors.backgroundColor,
              boxShadow: `
                0 0 ${20 + i * 10}px ${rippleColors.glowColor},
                inset 0 0 ${15 + i * 5}px ${rippleColors.glowColor}
              `, // Add glow effect
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
