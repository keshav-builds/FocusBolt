"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type Props = {
  seconds: number
  ariaLabel?: string
}

export function FlipClock({ seconds, ariaLabel }: Props) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  const digits = useMemo(() => {
    const mm = mins.toString().padStart(2, "0").split("")
    const ss = secs.toString().padStart(2, "0").split("")
    return [mm[0], mm[1], ":", ss[0], ss[1]]
  }, [mins, secs])

  return (
    <div aria-label={ariaLabel} role="timer" className="flex items-center gap-2 rounded-md bg-muted/50 p-3">
      {digits.map((d, i) =>
        d === ":" ? (
          <div key={i} className="mx-1 select-none text-4xl font-semibold md:text-6xl">
            :
          </div>
        ) : (
          <FlipDigit key={i} value={d} />
        ),
      )}
    </div>
  )
}

function FlipDigit({ value }: { value: string }) {
  const [prev, setPrev] = useState(value)
  const [flipping, setFlipping] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (value !== prev) {
      setFlipping(true)
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => {
        setPrev(value)
        setFlipping(false)
      }, 420) as unknown as number
    }
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [value, prev])

  return (
    <div className="relative h-16 w-12 select-none md:h-24 md:w-16 lg:h-28 lg:w-20" aria-hidden>
      <div className="digit-root absolute inset-0 overflow-hidden rounded-md bg-background text-3xl font-bold shadow-sm ring-1 ring-border md:text-5xl">
        {/* Static halves always show current value (single split look) */}
        <div className="flex h-1/2 items-end justify-center border-b border-border/50">
          <span className="pb-0.5 leading-none">{value}</span>
        </div>
        <div className="flex h-1/2 items-start justify-center">
          <span className="pt-0.5 leading-none">{value}</span>
        </div>

        {/* Animated flaps: both render current value to avoid flashing previous digit */}
        <div className={cn("flip-upper", flipping && "animate-flip-upper")}>
          <span>{value}</span>
        </div>
        <div className={cn("flip-lower", flipping && "animate-flip-lower")}>
          <span>{value}</span>
        </div>
      </div>

      <style jsx>{`
        .digit-root {
          perspective: 900px;
          will-change: transform;
        }
        .flip-upper,
        .flip-lower {
          position: absolute;
          left: 0;
          right: 0;
          overflow: hidden;
          backface-visibility: hidden;
          transform-style: preserve-3d;
          background: hsl(var(--background));
        }
        .flip-upper {
          top: 0;
          height: 50%;
          border-bottom: 1px solid hsl(var(--border) / 0.5);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          transform-origin: center bottom;
          box-shadow: 0 1px 0 hsl(var(--border) / 0.6) inset;
        }
        .flip-lower {
          bottom: 0;
          height: 50%;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          transform-origin: center top;
          box-shadow: 0 -1px 0 hsl(var(--border) / 0.6) inset;
        }
        .flip-upper span,
        .flip-lower span {
          font-weight: 700;
          font-size: 1.875rem;
          line-height: 1;
        }
        @media (min-width: 768px) {
          .flip-upper span,
          .flip-lower span {
            font-size: 3rem;
          }
        }
        @keyframes flipDown {
          0% {
            transform: rotateX(0);
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
        .animate-flip-upper {
          animation: flipDown 0.22s ease-in forwards;
        }
        .animate-flip-lower {
          animation: flipUp 0.22s ease-out 0.12s forwards;
        }
      `}</style>
    </div>
  )
}
