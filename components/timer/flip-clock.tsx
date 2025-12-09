"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { ColorTheme } from "../../lib/theme";

type Props = {
  seconds: number;
  ariaLabel?: string;
  theme: ColorTheme;
  animationDuration?: number;
};

export function FlipClock({
  seconds,
  ariaLabel,
  theme,
  animationDuration = 600,
}: Props) {
  const safeSeconds = Math.max(0, seconds);
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;

  // Show 3 digits for minutes if >= 100
  const show3DigitMinutes = mins >= 100;

  const formatTime = useCallback(
    (time: number, digits: number = 2) =>
      Math.max(0, time).toString().padStart(digits, "0"),
    []
  );

  const minStr = formatTime(mins, show3DigitMinutes ? 3 : 2);
  const secStr = formatTime(secs, 2);

  return (
    <div aria-label={ariaLabel} role="timer" className="flip-clock">
      {/* Minutes - 2 or 3 digits */}
      {show3DigitMinutes && (
        <FlipDigit
          value={minStr[0]}
          theme={theme}
          animationDuration={animationDuration}
        />
      )}
      <FlipDigit
        value={minStr[show3DigitMinutes ? 1 : 0]}
        theme={theme}
        animationDuration={animationDuration}
      />
      <FlipDigit
        value={minStr[show3DigitMinutes ? 2 : 1]}
        theme={theme}
        animationDuration={animationDuration}
      />

      <div className="separator">:</div>

      {/* Seconds - always 2 digits */}
      <FlipDigit
        value={secStr[0]}
        theme={theme}
        animationDuration={animationDuration}
      />
      <FlipDigit
        value={secStr[1]}
        theme={theme}
        animationDuration={animationDuration}
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
          max-width: 100vw;
          box-sizing: border-box;
        }

        .separator {
          font-size: 120px;
          font-weight: 300;
          margin: 0 16px;
          line-height: 0.8;
          color: ${theme.separatorColor};
          user-select: none;
        }

        @media (max-width: 640px) {
          .flip-clock {
            padding: 20px;
            gap: 8px;
          }

          .separator {
            font-size: 96px;
            margin: 0 8px;
          }
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
  theme: ColorTheme;
  animationDuration: number;
}) {
  const [currentValue, setCurrentValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevValue = useRef(value);
  const timeouts = useRef<NodeJS.Timeout[]>([]);
  const isAnimating = useRef(false);

  const clearAllTimeouts = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  }, []);

  const executeFlip = useCallback(
    (newValue: string) => {
      if (newValue === prevValue.current) return;

      if (isAnimating.current) {
        clearAllTimeouts();
        setCurrentValue(newValue);
        prevValue.current = newValue;
        setIsFlipping(false);
        isAnimating.current = false;
        return;
      }

      isAnimating.current = true;
      setIsFlipping(true);

      timeouts.current.push(
        setTimeout(() => setCurrentValue(newValue), animationDuration / 2)
      );

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

  useEffect(() => {
    executeFlip(value);
  }, [value, executeFlip]);

  useEffect(() => {
    setCurrentValue(value);
    prevValue.current = value;
  }, []);

  useEffect(() => {
    return () => {
      clearAllTimeouts();
      isAnimating.current = false;
    };
  }, [clearAllTimeouts]);

  return (
    <div className="flip-digit-container">
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
          flex-shrink: 0;
        }

        .digit-half {
          position: absolute;
          width: 100%;
          height: 50%;
          overflow: hidden;
          background: ${theme.cardBackground};
          border: 1px solid ${theme.cardBorder};
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
          background: ${theme.cardBackground};
          border: 1px solid ${theme.cardBorder};
        }

        .top-card {
          top: 0;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
          transform-origin: center bottom;
          animation: topFlipDown ${animationDuration / 2}ms ease-in forwards;
          z-index: 20;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .bottom-card {
          bottom: 0;
          border-top: none;
          border-radius: 0 0 8px 8px;
          transform-origin: center top;
          transform: rotateX(90deg);
          animation: bottomFlipUp ${animationDuration / 2}ms ease-out
            ${animationDuration / 2}ms forwards;
          z-index: 10;
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15);
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
          color: ${theme.digitColor};
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          user-select: none;
        }

        .divider {
          position: absolute;
          top: 50%;
          left: -2px;
          right: -2px;
          height: 3px;
          background: rgba(0, 0, 0, 0.15);
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

        /* Responsive styles for mobile */
        @media (max-width: 640px) {
          .flip-digit-container {
            width: 130px;
            height: 185px;
          }

          .digit-text {
            font-size: 130px;
            line-height: 1;
          }
        }
      `}</style>
    </div>
  );
}
