"use client";
import React from "react";
import { ColorTheme } from "@/lib/theme";

interface PomodoroInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ColorTheme;
}

export function PomodoroInfoModal({
  isOpen,
  onClose,
  currentTheme,
}: PomodoroInfoModalProps) {
  if (!isOpen) return null;

  const isImageTheme = currentTheme.backgroundImage;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 backdrop-blur-[2px]"
        style={{
          backgroundColor: isImageTheme
            ? "rgba(0,0,0,0.25)"
            : "rgba(0,0,0,0.4)",
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div
          className="rounded-3xl shadow-2xl overflow-hidden max-w-lg w-full animate-in zoom-in-95"
          style={{
            background: isImageTheme
              ? "rgba(0,0,0,0.8)"
              : currentTheme.background,
            border: `1px solid ${
              isImageTheme
                ? "rgba(255,255,255,0.3)"
                : currentTheme.cardBorder
            }`,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{
              borderBottomColor: isImageTheme
                ? "rgba(255,255,255,0.2)"
                : currentTheme.cardBorder,
            }}
          >
            <h2
              className="text-xl font-bold"
              style={{
                color: isImageTheme
                  ? "rgba(255,255,255,0.95)"
                  : currentTheme.digitColor,
              }}
            >
              What is Pomodoro?
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full border-none transition-transform hover:scale-110"
              style={{
                color: isImageTheme
                  ? "rgba(255,255,255,0.9)"
                  : currentTheme.separatorColor,
                borderColor: isImageTheme
                  ? "rgba(255,255,255,0.3)"
                  : currentTheme.cardBorder,
                  cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 text-md leading-relaxed">
            <p
              style={{
                color: isImageTheme
                  ? "rgba(255,255,255,0.9)"
                  : currentTheme.digitColor,
              }}
            >
              The Pomodoro Technique is a time-management method that breaks
              work into focused intervals— usually <strong>25 minutes of work</strong> followed
              by a <strong>5‑minute break</strong>. Each cycle is called a"Pomodoro".
            </p>
            <p
              style={{
                color: isImageTheme
                  ? "rgba(255,255,255,0.8)"
                  : currentTheme.separatorColor,
              }}
            >
              Why it works:
            </p>
            <ul
              className="list-disc pl-5 space-y-2"
              style={{
                color: isImageTheme
                  ? "rgba(255,255,255,0.85)"
                  : currentTheme.separatorColor,
              }}
            >
              <li>Keeps your brain fresh and focused</li>
              <li>Reduces burnout by balancing work and rest</li>
              <li>Makes big tasks feel less overwhelming</li>
              <li>Boosts motivation with small wins every cycle</li>
            </ul>
            <p
              style={{
                color: isImageTheme
                  ? "rgba(255,255,255,0.9)"
                  : currentTheme.digitColor,
              }}
            >
              Think of each Pomodoro as a power-sprint: short bursts of deep focus,
              followed by rest that recharges you.
            </p>
          </div>

          {/* Footer */}
          <div
            className="flex justify-end px-6 py-4 border-t"
            style={{
              borderTopColor: isImageTheme
                ? "rgba(255,255,255,0.2)"
                : currentTheme.cardBorder,
            }}
          >
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl  transition-all hover:scale-105"
              style={{
                backgroundColor: isImageTheme
                  ? "rgba(255,255,255,0.15)"
                  : currentTheme.digitColor,
                color: isImageTheme
                  ? "rgba(255,255,255,0.9)"
                  : currentTheme.background,
                  cursor: "pointer",
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes zoom-in-95 {
          0% {
            transform: scale(0.95);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-in {
          animation-fill-mode: both;
          animation-duration: 300ms;
        }
        .zoom-in-95 {
          animation-name: zoom-in-95;
        }
      `}</style>
    </>
  );
}
