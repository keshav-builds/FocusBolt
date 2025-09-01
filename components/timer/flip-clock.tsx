"use client";
import { useEffect, useRef, useState } from "react";

// FlipClock component
type Props = {
  seconds: number;      // total seconds remaining
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
        padding: "48px 0",
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
        userSelect: "none",
        boxShadow: "0 6px 56px #000d",
      }}
    >
      {digits.map((d, i) =>
        d === ":" ? (
          <span
            key={i}
            style={{
              fontSize: 170,
              fontWeight: 600,
              color: "#232323",
              margin: "0 18px",
              alignSelf: "center",
              lineHeight: 0.8,
              textShadow: "0 4px 24px #0007",
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

// Single Flip Digit component
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
      <div className="divider-line" />

      <div className="half top">
        <span>{flipping ? prevValue.current : current}</span>
      </div>
      <div className="half bottom">
        <span>{current}</span>
      </div>

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
          width: 130px;
          height: 220px;
          background: linear-gradient(180deg, #2b2b2b 0%, #181818 100%);
          border-radius: 18px;
          margin: 0 5px;
          box-shadow: 0 4px 24px #000a, 0 2px 16px #112a;
          display: inline-block;
          overflow: hidden;
        }
        .divider-line {
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 2px;
          background: linear-gradient(90deg, #444 0%, #fff6 50%, #444 100%);
          z-index: 10;
          opacity: 0.7;
        }
        .half {
          position: absolute;
          left: 0;
          width: 100%;
          height: 50%;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2;
          background: transparent;
        }
        .half.top {
          top: 0;
          border-radius: 18px 18px 0 0;
        }
        .half.bottom {
          bottom: 0;
          border-radius: 0 0 18px 18px;
        }
        .half span {
          font-size: 170px;
          font-weight: 600;
          color: #fff;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          font-variant-numeric: tabular-nums;
          line-height: 1.1;
          letter-spacing: -2px;
          text-shadow: 0 4px 12px #0008;
          user-select: none;
        }
        .half.top span {
          filter: brightness(1.16) drop-shadow(0 1px 0 #fff4);
        }
        .half.bottom span {
          filter: brightness(0.8);
        }
        .flip-leaf {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          width: 100%;
          height: 50%;
          z-index: 5;
          perspective: 500px;
        }
        .flip-leaf-inner {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transform-origin: bottom;
          animation: flipDown 1s forwards cubic-bezier(0.23, 1, 0.32, 1);
        }
        .face {
          position: absolute;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          background: linear-gradient(180deg, #232323, #181818 100%);
          border-radius: 18px 18px 0 0;
          overflow: hidden;
          backface-visibility: hidden;
        }
        .face.front span,
        .face.back span {
          font-size: 170px;
          font-weight: 600;
          color: #fff;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.1;
          letter-spacing: -2px;
          filter: brightness(1.1);
          width: 100%;
          text-align: center;
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
