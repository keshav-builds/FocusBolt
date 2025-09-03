"use client";
import { useEffect, useRef, useState, useCallback } from "react";

type Props = {
  seconds: number;
  ariaLabel?: string;
  theme?: "light" | "dark";
  animationDuration?: number;
};

export function FlipClock({
  seconds,
  ariaLabel,
  theme = "dark",
  animationDuration = 600,
}: Props) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const formatTime = useCallback(
    (time: number) => time.toString().padStart(2, "0"),
    []
  );

  return (
    <div aria-label={ariaLabel} role="timer" className={`flip-clock ${theme}`}>
      <FlipDigit
        value={formatTime(mins)[0]}
        theme={theme}
        animationDuration={animationDuration}
        key="min-tens"
      />
      <FlipDigit
        value={formatTime(mins)[1]}
        theme={theme}
        animationDuration={animationDuration}
        key="min-ones"
      />
      <div className="separator">:</div>
      <FlipDigit
        value={formatTime(secs)[0]}
        theme={theme}
        animationDuration={animationDuration}
        key="sec-tens"
      />
      <FlipDigit
        value={formatTime(secs)[1]}
        theme={theme}
        animationDuration={animationDuration}
        key="sec-ones"
      />

      <style jsx>{`
        .flip-clock {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 40px;
          border-radius: 20px;
          user-select: none;
          font-family: "SF Pro Display", "Fira Code", "Space Mono",
            -apple-system, BlinkMacSystemFont, sans-serif;
          font-variant-numeric: tabular-nums;
          font-weight: 700;
        }

        .flip-clock.dark {
          background: #1a1a1a;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .flip-clock.light {
          background: #f5f5f5;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .separator {
          font-size: 120px;
          font-weight: 300;
          margin: 0 16px;
          line-height: 0.8;
          color: ${theme === "dark" ? "#666" : "#999"};
        }
      `}</style>
    </div>
  );
}

function FlipDigit({
  value,
  theme,
  animationDuration = 600,
}: {
  value: string;
  theme: "light" | "dark";
  animationDuration: number;
}) {
  const [currentValue, setCurrentValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevValue = useRef(value);
  const timeouts = useRef<NodeJS.Timeout[]>([]);
  const isAnimating = useRef(false);

  // Clear all timeouts
  const clearAllTimeouts = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  }, []);

  // Execute flip animation
  const executeFlip = useCallback(
    (newValue: string) => {
      if (isAnimating.current || newValue === prevValue.current) return;

      clearAllTimeouts();
      isAnimating.current = true;
      setIsFlipping(true);

      // Update value at midpoint
      timeouts.current.push(
        setTimeout(() => setCurrentValue(newValue), animationDuration / 2)
      );

      // Complete animation
      timeouts.current.push(
        setTimeout(() => {
          setIsFlipping(false);
          prevValue.current = newValue;
          isAnimating.current = false;
        }, animationDuration)
      );
    },
    [animationDuration, clearAllTimeouts]
  );

  // Handle value changes
  useEffect(() => {
    executeFlip(value);
  }, [value, executeFlip]);

  // Initialize
  useEffect(() => {
    setCurrentValue(value);
    prevValue.current = value;
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      clearAllTimeouts();
      isAnimating.current = false;
    };
  }, [clearAllTimeouts]);

  const halfDuration = animationDuration / 2;

  return (
    <div className="flip-digit-container">
      {/* Static base */}
      <div className="digit-half top-base">
        <div className="digit-content">
          <span className="digit-text">{currentValue}</span>
        </div>
      </div>

      <div className="digit-half bottom-base">
        <div className="digit-content">
          <span className="digit-text">{currentValue}</span>
        </div>
      </div>

      {/* Animation overlay */}
      {isFlipping && (
        <div className="flip-overlay">
          <div className="flip-card top-card">
            <div className="digit-content">
              <span className="digit-text">{prevValue.current}</span>
            </div>
          </div>

          <div className="flip-card bottom-card">
            <div className="digit-content">
              <span className="digit-text">{value}</span>
            </div>
          </div>
        </div>
      )}

      <div className="divider" />

      <style jsx>{`
        .flip-digit-container {
          position: relative;
          width: 100px;
          height: 140px;
          perspective: 1000px;
        }

        .digit-half {
          position: absolute;
          width: 100%;
          height: 50%;
          overflow: hidden;
          background: ${theme === "dark"
            ? "linear-gradient(180deg, #333 0%, #222 100%)"
            : "linear-gradient(180deg, #fff 0%, #f0f0f0 100%)"};
          border: ${theme === "dark" ? "1px solid #444" : "1px solid #ddd"};
        }

        .top-base {
          top: 0;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
          z-index: 1;
        }

        .bottom-base {
          bottom: 0;
          border-top: none;
          border-radius: 0 0 8px 8px;
          z-index: 1;
        }

        .flip-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .flip-card {
          position: absolute;
          width: 100%;
          height: 50%;
          overflow: hidden;
          backface-visibility: hidden;
          background: ${theme === "dark"
            ? "linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)"
            : "linear-gradient(180deg, #ffffff 0%, #e8e8e8 100%)"};
          border: ${theme === "dark" ? "1px solid #555" : "1px solid #bbb"};
        }

        .top-card {
          top: 0;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
          transform-origin: center bottom;
          animation: topFlipDown ${halfDuration}ms ease-in forwards;
          z-index: 20;
          box-shadow: ${theme === "dark"
            ? "0 4px 8px rgba(0, 0, 0, 0.6)"
            : "0 3px 6px rgba(0, 0, 0, 0.2)"};
        }

        .bottom-card {
          bottom: 0;
          border-top: none;
          border-radius: 0 0 8px 8px;
          transform-origin: center top;
          transform: rotateX(90deg);
          animation: bottomFlipUp ${halfDuration}ms ease-out ${halfDuration}ms
            forwards;
          z-index: 10;
          box-shadow: ${theme === "dark"
            ? "0 -2px 4px rgba(0, 0, 0, 0.4)"
            : "0 -2px 3px rgba(0, 0, 0, 0.15)"};
        }

        .digit-content {
          position: absolute;
          width: 100%;
          height: 200%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .top-base .digit-content,
        .top-card .digit-content {
          top: 0;
        }

        .bottom-base .digit-content,
        .bottom-card .digit-content {
          top: -100%;
        }

        .digit-text {
          font-size: 100px;
          font-weight: 700;
          line-height: 1;
          font-variant-numeric: tabular-nums;
          color: ${theme === "dark" ? "#fff" : "#333"};
          text-shadow: ${theme === "dark"
            ? "0 2px 4px rgba(0, 0, 0, 0.8)"
            : "0 1px 2px rgba(0, 0, 0, 0.2)"};
        }

        .divider {
          position: absolute;
          top: 50%;
          left: -2px;
          right: -2px;
          height: 2px;
          background: ${theme === "dark" ? "#111" : "#ccc"};
          transform: translateY(-50%);
          z-index: 25;
          border-radius: 1px;
        }

        @keyframes topFlipDown {
          0% {
            transform: rotateX(0deg);
          }
          100% {
            transform: rotateX(-90deg);
          }
        }

        @keyframes bottomFlipUp {
          0% {
            transform: rotateX(90deg);
          }
          100% {
            transform: rotateX(0deg);
          }
        }
      `}</style>
    </div>
  );
}
