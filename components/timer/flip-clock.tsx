"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  seconds: number;
  ariaLabel?: string;
  theme?: "light" | "dark";
};

export function FlipClock({ seconds, ariaLabel, theme = "dark" }: Props) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const formatTime = (time: number) => time.toString().padStart(2, "0");

  return (
    <div aria-label={ariaLabel} role="timer" className={`flip-clock ${theme}`}>
      <FlipDigit value={formatTime(mins)[0]} theme={theme} />
      <FlipDigit value={formatTime(mins)[1]} theme={theme} />
      <div className="separator">:</div>
      <FlipDigit value={formatTime(secs)[0]} theme={theme} />
      <FlipDigit value={formatTime(secs)[1]} theme={theme} />

      <style jsx>{`
        .flip-clock {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 40px;
          border-radius: 20px;
          user-select: none;
          font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif;
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

function FlipDigit({ value, theme }: { value: string; theme: "light" | "dark" }) {
  const [currentValue, setCurrentValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      setIsFlipping(true);
      
      const timer = setTimeout(() => {
        setCurrentValue(value);
        setIsFlipping(false);
        prevValue.current = value;
      }, 250); // Fixed timing to match CSS animation

      return () => clearTimeout(timer);
    }
  }, [value]); // Removed currentValue from dependencies - it was causing unnecessary re-renders

  const digitHalfStyle = `
    position: absolute;
    width: 100%;
    height: 50%;
    overflow: hidden;
    border-radius: 8px;
    background: ${
      theme === "dark"
        ? "linear-gradient(180deg, #333 0%, #222 100%)"
        : "linear-gradient(180deg, #fff 0%, #f0f0f0 100%)"
    };
    border: ${theme === "dark" ? "1px solid #444" : "1px solid #ddd"};
  `;

  const flipCardStyle = `
    position: absolute;
    width: 100%;
    height: 50%;
    overflow: hidden;
    border-radius: 8px;
    background: ${
      theme === "dark"
        ? "linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)"
        : "linear-gradient(180deg, #ffffff 0%, #e8e8e8 100%)"
    };
    border: ${theme === "dark" ? "1px solid #555" : "1px solid #bbb"};
  `;

  return (
    <div className={`flip-digit-container ${theme}`}>
      {/* Top Half */}
      <div className="digit-half top-half">
        <div className="digit-content">
          <span>{currentValue}</span>
        </div>
      </div>

      {/* Bottom Half */}
      <div className="digit-half bottom-half">
        <div className="digit-content">
          <span>{currentValue}</span>
        </div>
      </div>

      {/* Flip Animation */}
      {isFlipping && (
        <>
          <div className="flip-card top-flip">
            <div className="digit-content">
              <span>{prevValue.current}</span>
            </div>
          </div>

          <div className="flip-card bottom-flip">
            <div className="digit-content">
              <span>{value}</span>
            </div>
          </div>
        </>
      )}

      {/* Center divider */}
      <div className="divider" />

      <style jsx>{`
        .flip-digit-container {
          position: relative;
          width: 100px;
          height: 140px;
          perspective: 1000px;
        }

        .digit-half {
          ${digitHalfStyle}
        }

        .top-half {
          top: 0;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
        }

        .bottom-half {
          bottom: 0;
          border-top: none;
          border-radius: 0 0 8px 8px;
        }

        .digit-content {
          position: absolute;
          width: 100%;
          height: 200%;
          display: flex;
          align-items: center;
          justify-content: center;
          
        }

        .top-half .digit-content {
          top: 0;
        }

        .bottom-half .digit-content {
          top: -100%;
        }

        .digit-content span {
          font-size: 100px;
          font-weight: 700;
          line-height: 1;
          font-variant-numeric: tabular-nums;
          color: ${theme === "dark" ? "#fff" : "#333"};
          text-shadow: ${
            theme === "dark"
              ? "0 2px 4px rgba(0, 0, 0, 0.8)"
              : "0 1px 2px rgba(0, 0, 0, 0.2)"
          };
        }

        .divider {
          position: absolute;
          top: 50%;
          left: -2px;
          right: -2px;
          height: 2px;
          background: ${theme === "dark" ? "#111" : "#ccc"};
          transform: translateY(-50%);
          z-index: 5;
          border-radius: 1px;
        }

        .flip-card {
          ${flipCardStyle}
        }

        .top-flip {
          top: 0;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
          transform-origin: center bottom;
          animation: flipDown 0.25s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
          z-index: 10;
          box-shadow: ${
            theme === "dark"
              ? "0 4px 8px rgba(0, 0, 0, 0.6)"
              : "0 3px 6px rgba(0, 0, 0, 0.2)"
          };
        }

        .top-flip .digit-content {
          top: 0;
        }

        .bottom-flip {
          bottom: 0;
          border-top: none;
          border-radius: 0 0 8px 8px;
          transform: rotateX(90deg);
          transform-origin: center top;
          animation: flipUp 0.25s cubic-bezier(0.4, 0.0, 0.2, 1) 0.25s forwards;
          z-index: 9;
          box-shadow: ${
            theme === "dark"
              ? "0 -2px 4px rgba(0, 0, 0, 0.4)"
              : "0 -2px 3px rgba(0, 0, 0, 0.15)"
          };
        }

        .bottom-flip .digit-content {
          top: -100%;
        }

   @keyframes flipDown {
          0% {
            transform: rotateX(0deg);
          }
          100% {
            transform: rotateX(-90deg);
          }
        }

        @keyframes flipUp {
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
