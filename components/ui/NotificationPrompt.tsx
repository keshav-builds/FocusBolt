import React, { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { ColorTheme } from "@/lib/theme";

interface NotificationPromptProps {
  currentTheme: ColorTheme;
  onAccept: () => void;
  onDismiss: () => void;
  onClose: () => void;
  style?: CSSProperties;
}

export function NotificationPrompt({
  currentTheme,
  onAccept,
  onDismiss,
  onClose,
  style,
}: NotificationPromptProps) {
  const isImageTheme = currentTheme.backgroundImage;
  const getColor = () => {
    if (isImageTheme) return "white"; // white for image theme

    if (currentTheme.id === "pure-white" || currentTheme.id === "light-gray")
      // blue for light themes

      return "#60A5FA";
    if (currentTheme.id === "pure-black" || currentTheme.id === "dark-gray")
      // yellow for dark themes

      return "#FCD34D";

    return currentTheme.cardBorder; //return default
  };
  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        background: currentTheme.background,

        color: currentTheme.digitColor,
        border: `1.5px solid ${currentTheme.cardBorder}`,
        borderRadius: 18,
        padding: "20px clamp(20px, 5vw, 38px)",
        boxShadow: `0 8px 32px ${currentTheme.cardBorder}22`,
        maxWidth: 440,
        width: "90vw",
        fontSize: "clamp(14px, 2vw, 16px)",
        fontWeight: 500,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 16,
        position: "relative",
        ...style,
      }}
    >
      {/* Cross button */}
      <button
        aria-label="Close notification"
        onClick={onClose}
        style={{
          position: "absolute",
          right: 14,
          top: 10,
          background: "transparent",
          border: "none",
          color: currentTheme.digitColor,
          fontSize: 20,
          cursor: "pointer",
          lineHeight: 1,
          padding: 0,
          margin: 0,
        }}
      >
        &times;
      </button>

      {/* Main content */}
      <span
        style={{
          lineHeight: 1.5,
          marginBottom: 10,
          textAlign: "left",
          wordBreak: "break-word",
        }}
      >
        Enable notifications to get alerts when sessions end.
      </span>

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <Button
          size="sm"
          onClick={onDismiss}
          style={{
            background: `${currentTheme.background}`,
            color: currentTheme.digitColor,
            // border: `1px solid ${currentTheme.cardBorder}`,
            cursor: "pointer",
          }}
        >
          No Thanks
        </Button>
        <Button
          size="sm"
          onClick={onAccept}
          variant="outline"
          style={{
            background: `${currentTheme.background}`,
            color: currentTheme.digitColor,

            border: isImageTheme
              ? `2px solid ${currentTheme.digitColor} `
              : `1px solid ${getColor()}`,
            boxShadow: isImageTheme
              ? " "
              : `4px 4px 0 0 ${getColor()}`,

            cursor: "pointer",
          }}
        >
          Enable
        </Button>
      </div>
    </div>
  );
}
