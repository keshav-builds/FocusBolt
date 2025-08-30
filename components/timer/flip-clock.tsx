"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  seconds: number;
  ariaLabel?: string;
};

export function FlipClock({ seconds, ariaLabel }: Props) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const digits = [
    ...mins.toString().padStart(2, "0"),
    ":",
    ...secs.toString().padStart(2, "0"),
  ];

  return (
    <div
      aria-label={ariaLabel}
      role="timer"
      style={{
        display: "flex",
        gap: 24,
        background: "#111",
        padding: "40px 56px",
        borderRadius: 24,
        justifyContent: "center",
        userSelect: "none",
      }}
    >
      {digits.map((d, i) =>
        d === ":" ? (
          <span
            key={i}
            style={{
              fontSize: 90,
              fontWeight: 700,
              color: "#222",
              margin: "0 16px",
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            :
          </span>
        ) : (
          <FlipDigit key={i} value={d} />
        )
      )}
    </div>
  );
}

function FlipDigit({ value }: { value: string }) {
  const [current, setCurrent] = useState(value);
  const [flipping, setFlipping] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      setFlipping(true);
      const timer = setTimeout(() => {
        setCurrent(value);
        setFlipping(false);
        prevValue.current = value;
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <div className="flip-digit">
      {/* Horizontal dividing line */}
      <div className="divider-line" />

      {/* Top half static */}
      <div className="half top">
        <span>{flipping ? prevValue.current : current}</span>
      </div>

      {/* Bottom half static */}
      <div className="half bottom">
        <span>{current}</span>
      </div>

      {/* Flip animation overlay top half only */}
      {flipping && (
        <div className="flip-leaf">
          <div className="flip-leaf-inner">
            <div className="face front">
              <span>{prevValue.current}</span>
            </div>
            <div className="face back">
              <span>{current}</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .flip-digit {
          position: relative;
          width: 116px;
          height: 164px;
          perspective: 320px;
          display: inline-block;
          user-select: none;
        }
        .divider-line {
          position: absolute;
          left: 12px;
          right: 12px;
          top: 50%;
          height: 2px;
          background: linear-gradient(90deg, #444 0%, #999 50%, #444 100%);
          z-index: 10;
          border-radius: 1px;
          pointer-events: none;
          box-shadow: 0 1px 2px rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
        }
        .half {
          position: absolute;
          left: 0;
          width: 100%;
         height: calc(50% + 1px);
          overflow: hidden;
          background: #232323;
          display: flex;
          justify-content: center;
          z-index: 1;
        }
        .half.top {
          top: 0;
          align-items: flex-end;
          border-radius: 18px 18px 0 0;
        }
        .half.bottom {
          bottom: 0;
          align-items: flex-start;
          border-radius: 0 0 18px 18px;
        }
        .half span {
          display: block;
          width: 100%;
          font-size: 120px;
          line-height: 82px;
          color: #eaeaea;
          font-weight: 700;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          text-align: center;
          font-variant-numeric: tabular-nums;
          user-select: none;
        }
        .half.top span {
          clip-path: inset(0 0 50% 0);
        }
        .half.bottom span {
          clip-path: inset(50% 0 0 0);
        }

        /* Flip animation leaf */
        .flip-leaf {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 50%;
          perspective: 320px;
          z-index: 5;
          user-select: none;
        }
        .flip-leaf-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transform-origin: bottom;
          animation: flipDown 0.6s forwards cubic-bezier(0.77, 0, 0.175, 1);
          /* ensure smooth animation */
        }
        .face {
          position: absolute;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
          background: #232323;
          border-radius: 18px 18px 0 0;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          overflow: hidden;
          backface-visibility: hidden;
          user-select: none;
        }
        .face.front span,
        .face.back span {
          font-size: 120px;
          font-weight: 700;
          color: #eaeaea;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          text-align: center;
          font-variant-numeric: tabular-nums;
          line-height: 82px;
          width: 100%;
          display: block;
          clip-path: inset(0 0 50% 0);
          user-select: none;
          user-drag: none;
        }
        .face.back {
          transform: rotateX(-180deg);
        }

        @keyframes flipDown {
          0% {
            transform: rotateX(0deg);
          }
          100% {
            transform: rotateX(-180deg);
          }
        }
      `}</style>
    </div>
  );
}
