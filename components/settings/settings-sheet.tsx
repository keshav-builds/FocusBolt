"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePomodoro } from "@/components/timer/pomodoro-provider";
import { ensurePermission } from "@/lib/notifications";
import { ColorTheme } from "@/lib/theme";
import { getColor } from "@/lib/colorUtils";
import { ProgressChart } from "@/components/progress/progress-chart";

interface SettingsSheetProps {
  open?: boolean;
  onOpenChange?: (b: boolean) => void;
  currentTheme: ColorTheme;
}

// Reusable Stepper Component
interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  currentTheme: ColorTheme;
  isImageTheme: boolean;
}

function Stepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  currentTheme,
  isImageTheme,
}: StepperProps) {
  const [displayValue, setDisplayValue] = React.useState(String(value));

  React.useEffect(() => {
    setDisplayValue(String(value));
  }, [value]);

  const handleDecrement = () => {
    if (value > min) onChange(value - step);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + step);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // When empty, set to 0
    if (val === "" || val === "0") {
      onChange(0);
      return;
    }

    // Parse number
    const numValue = parseInt(val, 10);

    // Just enforce max
    if (!isNaN(numValue)) {
      onChange(Math.min(numValue, max));
    }
  };

  return (
    <div className="flex items-center justify-between">
      <Label
        style={{
          color: isImageTheme
            ? "rgba(255, 255, 255, 0.9)"
            : currentTheme.digitColor,
        }}
      >
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrement}
          disabled={value <= min}
          className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          style={{
            backgroundColor: isImageTheme
              ? "rgba(255, 255, 255, 0.1)"
              : currentTheme.background,
            color: isImageTheme
              ? "rgba(255, 255, 255, 0.9)"
              : currentTheme.digitColor,
            borderColor: isImageTheme
              ? "rgba(255, 255, 255, 0.3)"
              : currentTheme.cardBorder,
            cursor: value <= min ? "not-allowed" : "pointer",
          }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        </button>

        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value === 0 ? "" : value} // Show empty when 0
          onChange={handleInputChange}
          onBlur={() => {
            if (value === 0 || value < min) onChange(min); // Set to min when done
          }}
          onFocus={(e) => e.target.select()}
          className="w-16 px-2 py-1.5 text-center text-sm font-semibold rounded-lg border"
          style={{
            backgroundColor: isImageTheme
              ? "rgba(255, 255, 255, 0.1)"
              : currentTheme.background,
            color: isImageTheme
              ? "rgba(255, 255, 255, 0.9)"
              : currentTheme.digitColor,
            borderColor: isImageTheme
              ? "rgba(255, 255, 255, 0.3)"
              : currentTheme.cardBorder,
          }}
        />

        <button
          onClick={handleIncrement}
          disabled={value >= max}
          className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          style={{
            backgroundColor: isImageTheme
              ? "rgba(255, 255, 255, 0.1)"
              : currentTheme.background,
            color: isImageTheme
              ? "rgba(255, 255, 255, 0.9)"
              : currentTheme.digitColor,
            borderColor: isImageTheme
              ? "rgba(255, 255, 255, 0.3)"
              : currentTheme.cardBorder,
            cursor: value >= max ? "not-allowed" : "pointer",
          }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Preset Pills Component
interface PresetPillsProps {
  onSelect: (work: number, shortBreak: number, longBreak: number) => void;
  currentTheme: ColorTheme;
  isImageTheme: boolean;
}

function PresetPills({
  onSelect,
  currentTheme,
  isImageTheme,
}: PresetPillsProps) {
  const presets = [
    { name: "Classic", icon: "⏱️", work: 25, short: 5, long: 15 },
    { name: "Deep Work", icon: "🎯", work: 120, short: 15, long: 30 },
    { name: "Quick", icon: "⚡", work: 15, short: 3, long: 10 },
  ];

  return (
    <div className="space-y-3">
      <Label
        className="text-sm font-medium"
        style={{
          color: isImageTheme
            ? "rgba(255, 255, 255, 0.8)"
            : currentTheme.separatorColor,
        }}
      >
        Quick Presets
      </Label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onSelect(preset.work, preset.short, preset.long)}
            className="p-3 rounded-xl border transition-all hover:scale-105 active:scale-95 text-left"
            style={{
              backgroundColor: isImageTheme
                ? "rgba(255, 255, 255, 0.08)"
                : `${currentTheme.background}40`,
              borderColor: isImageTheme
                ? "rgba(255, 255, 255, 0.2)"
                : currentTheme.cardBorder,
              cursor: "pointer",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{preset.icon}</span>
              <span
                className="text-sm font-semibold"
                style={{
                  color: isImageTheme
                    ? "rgba(255, 255, 255, 0.95)"
                    : currentTheme.digitColor,
                }}
              >
                {preset.name}
              </span>
            </div>
            <p
              className="text-xs"
              style={{
                color: isImageTheme
                  ? "rgba(255, 255, 255, 0.7)"
                  : currentTheme.separatorColor,
              }}
            >
              {preset.work}m / {preset.short}m / {preset.long}m
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SettingsSheet({
  open,
  onOpenChange,
  currentTheme,
}: SettingsSheetProps) {
  const {
    durations,
    setDurations,
    longInterval,
    setLongInterval,
    autoStartNext,
    setAutoStartNext,
    autoPauseOnBlur,
    setAutoPauseOnBlur,
    notifications,
    setNotifications,
  } = usePomodoro();

  const [work, setWork] = React.useState<number>(
    Math.round(durations.work / 60)
  );
  const [shortB, setShortB] = React.useState<number>(
    Math.round(durations.short / 60)
  );
  const [longB, setLongB] = React.useState<number>(
    Math.round(durations.long / 60)
  );
  const [longInt, setLongInt] = React.useState<number>(longInterval);

  React.useEffect(() => {
    setWork(Math.round(durations.work / 60));
    setShortB(Math.round(durations.short / 60));
    setLongB(Math.round(durations.long / 60));
  }, [durations]);

  React.useEffect(() => {
    setLongInt(longInterval);
  }, [longInterval]);

  const handlePresetSelect = (
    workMin: number,
    shortMin: number,
    longMin: number
  ) => {
    setWork(workMin);
    setShortB(shortMin);
    setLongB(longMin);
    setTimeout(() => {
      const saveButton = document.getElementById("save-settings-btn");
      saveButton?.click();
    }, 300);
  };

  const save = () => {
    const workValue = Math.max(1, Math.min(240, work));
    const shortValue = Math.max(1, Math.min(60, shortB));
    const longValue = Math.max(1, Math.min(90, longB));
    const longIntValue = Math.max(2, Math.min(12, longInt));

    setDurations({
      work: workValue * 60,
      short: shortValue * 60,
      long: longValue * 60,
    });
    setLongInterval(longIntValue);
    onOpenChange?.(false);
  };

  const handleNotificationToggle = async (checked: boolean) => {
    if (!checked) {
      setNotifications(false);
      return;
    }
    const granted = await ensurePermission();
    if (granted) {
      setNotifications(true);
    } else {
      setNotifications(false);
      alert(
        "Notifications are blocked by the browser. Please enable them in browser's site settings."
      );
    }
  };

  const isImageTheme = Boolean(currentTheme.backgroundImage);
  const color = getColor(currentTheme, isImageTheme);

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="outline"
        onClick={() => onOpenChange?.(true)}
        style={{
          background: currentTheme.background,
          color: currentTheme.digitColor,
          border: `1px solid ${currentTheme.cardBorder}`,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isImageTheme ? "currentColor" : color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
          <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
        </svg>
        Settings
      </Button>

      {/* Modal */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 backdrop-blur-[2px]"
            style={{
              backgroundColor: isImageTheme
                ? "rgba(0, 0, 0, 0.35)"
                : "rgba(0, 0, 0, 0.25)",
            }}
            onClick={() => onOpenChange?.(false)}
          />

          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div
              className="rounded-3xl shadow-2xl overflow-hidden max-w-lg w-full max-h-[85vh] border animate-in zoom-in-95 duration-300"
              style={{
                background: isImageTheme
                  ? "rgba(0, 0, 0, 0.85)"
                  : currentTheme.background,
                borderColor: isImageTheme
                  ? "rgba(255, 255, 255, 0.25)"
                  : `${currentTheme.cardBorder}80`,
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: isImageTheme
                  ? "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15)"
                  : `0 25px 50px -12px ${currentTheme.cardBorder}40`,
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-5 border-b"
                style={{
                  borderBottomColor: isImageTheme
                    ? "rgba(255, 255, 255, 0.15)"
                    : currentTheme.cardBorder,
                  background: isImageTheme
                    ? "rgba(0, 0, 0, 0.2)"
                    : "transparent",
                }}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                      backgroundColor: isImageTheme
                        ? "rgba(255, 255, 255, 0.15)"
                        : `${currentTheme.cardBorder}40`,
                      border: `1px solid ${
                        isImageTheme
                          ? "rgba(255, 255, 255, 0.3)"
                          : currentTheme.cardBorder
                      }`,
                    }}
                  >
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <div>
                    <h2
                      className="text-xl font-bold"
                      style={{
                        color: isImageTheme
                          ? "rgba(255, 255, 255, 0.95)"
                          : currentTheme.digitColor,
                      }}
                    >
                      Settings
                    </h2>
                    <p
                      className="text-sm"
                      style={{
                        color: isImageTheme
                          ? "rgba(255, 255, 255, 0.8)"
                          : currentTheme.separatorColor,
                      }}
                    >
                      Customize sessions and behavior
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChange?.(false)}
                  className="p-2 rounded-full transition-all duration-200 hover:scale-110 border"
                  style={{
                    color: isImageTheme
                      ? "rgba(255, 255, 255, 0.9)"
                      : currentTheme.separatorColor,
                    backgroundColor: isImageTheme
                      ? "rgba(255, 255, 255, 0.1)"
                      : "transparent",
                    borderColor: isImageTheme
                      ? "rgba(255, 255, 255, 0.3)"
                      : currentTheme.cardBorder,
                    cursor: "pointer",
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div
                className="p-6 overflow-y-auto max-h-[60vh] space-y-6 custom-scrollbar"
                style={{
                  background: isImageTheme
                    ? "rgba(0, 0, 0, 0.1)"
                    : "transparent",
                }}
              >
                {/* Preset Pills */}
                <div
                  className="p-4 rounded-2xl border"
                  style={{
                    backgroundColor: isImageTheme
                      ? "rgba(255, 255, 255, 0.08)"
                      : `${currentTheme.background}20`,
                    borderColor: isImageTheme
                      ? "rgba(255, 255, 255, 0.2)"
                      : currentTheme.cardBorder,
                  }}
                >
                  <PresetPills
                    onSelect={handlePresetSelect}
                    currentTheme={currentTheme}
                    isImageTheme={isImageTheme}
                  />
                </div>

                {/* Session Durations with Steppers */}
                <div
                  className="p-4 rounded-2xl border"
                  style={{
                    backgroundColor: isImageTheme
                      ? "rgba(255, 255, 255, 0.08)"
                      : `${currentTheme.background}20`,
                    borderColor: isImageTheme
                      ? "rgba(255, 255, 255, 0.2)"
                      : currentTheme.cardBorder,
                  }}
                >
                  <h3
                    className="text-base font-semibold mb-4"
                    style={{
                      color: isImageTheme
                        ? "rgba(255, 255, 255, 0.95)"
                        : currentTheme.digitColor,
                    }}
                  >
                    Session Durations
                  </h3>
                  <div className="space-y-3">
                    <Stepper
                      value={work}
                      onChange={setWork}
                      min={1}
                      max={240}
                      step={5}
                      label="Work (minutes)"
                      currentTheme={currentTheme}
                      isImageTheme={isImageTheme}
                    />
                    <Stepper
                      value={shortB}
                      onChange={setShortB}
                      min={1}
                      max={60}
                      step={1}
                      label="Short break (minutes)"
                      currentTheme={currentTheme}
                      isImageTheme={isImageTheme}
                    />
                    <Stepper
                      value={longB}
                      onChange={setLongB}
                      min={1}
                      max={90}
                      step={5}
                      label="Long break (minutes)"
                      currentTheme={currentTheme}
                      isImageTheme={isImageTheme}
                    />
                    <Stepper
                      value={longInt}
                      onChange={setLongInt}
                      min={2}
                      max={12}
                      step={1}
                      label="Long break every"
                      currentTheme={currentTheme}
                      isImageTheme={isImageTheme}
                    />
                  </div>
                </div>

                {/* Preferences */}
                <div
                  className="p-4 rounded-2xl border"
                  style={{
                    backgroundColor: isImageTheme
                      ? "rgba(255, 255, 255, 0.08)"
                      : `${currentTheme.background}20`,
                    borderColor: isImageTheme
                      ? "rgba(255, 255, 255, 0.2)"
                      : currentTheme.cardBorder,
                  }}
                >
                  <h3
                    className="text-base font-semibold mb-4"
                    style={{
                      color: isImageTheme
                        ? "rgba(255, 255, 255, 0.95)"
                        : currentTheme.digitColor,
                    }}
                  >
                    Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label
                          style={{
                            color: isImageTheme
                              ? "rgba(255, 255, 255, 0.9)"
                              : currentTheme.digitColor,
                          }}
                        >
                          Auto start next session
                        </Label>
                        <p
                          className="text-xs mt-1"
                          style={{
                            color: isImageTheme
                              ? "rgba(255, 255, 255, 0.7)"
                              : currentTheme.separatorColor,
                          }}
                        >
                          Automatically begin the next work/break session
                        </p>
                      </div>
                      <Switch
                        checked={autoStartNext}
                        onCheckedChange={setAutoStartNext}
                        style={{
                          cursor: "pointer",
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label
                          style={{
                            color: isImageTheme
                              ? "rgba(255, 255, 255, 0.9)"
                              : currentTheme.digitColor,
                          }}
                        >
                          Pause when the tab is hidden
                        </Label>
                        <p
                          className="text-xs mt-1"
                          style={{
                            color: isImageTheme
                              ? "rgba(255, 255, 255, 0.7)"
                              : currentTheme.separatorColor,
                          }}
                        >
                          Pause when switching tabs
                        </p>
                      </div>
                      <Switch
                        checked={autoPauseOnBlur}
                        onCheckedChange={setAutoPauseOnBlur}
                        style={{
                          cursor: "pointer",
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label
                          style={{
                            color: isImageTheme
                              ? "rgba(255, 255, 255, 0.9)"
                              : currentTheme.digitColor,
                          }}
                        >
                          Notifications
                        </Label>
                        <p
                          className="text-xs mt-1"
                          style={{
                            color: isImageTheme
                              ? "rgba(255, 255, 255, 0.7)"
                              : currentTheme.separatorColor,
                          }}
                        >
                          Show alerts when sessions end
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={notifications}
                          onCheckedChange={handleNotificationToggle}
                          style={{
                            cursor: "pointer",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Keyboard Shortcuts Section */}
                <div
                  className="hidden sm:block p-4 rounded-2xl border"
                  style={{
                    backgroundColor: isImageTheme
                      ? "rgba(255, 255, 255, 0.08)"
                      : `${currentTheme.background}20`,
                    color: isImageTheme
                      ? "rgba(255, 255, 255, 0.95)"
                      : currentTheme.digitColor,
                    borderColor: isImageTheme
                      ? "rgba(255, 255, 255, 0.2)"
                      : currentTheme.cardBorder,
                  }}
                >
                  <h3
                    className="text-base font-semibold mb-4"
                    style={{
                      color: isImageTheme
                        ? "rgba(255, 255, 255, 0.95)"
                        : currentTheme.digitColor,
                    }}
                  >
                    Keyboard Shortcuts
                  </h3>
                  <ul
                    style={{ paddingLeft: 0, margin: 0, listStyleType: "none" }}
                  >
                    {[
                      { key: "Space", description: "Start / Pause timer" },
                      { key: "F", description: "Toggle focus mode" },
                      { key: "Esc", description: "Escape focus mode" },
                      { key: "C", description: "Cycle between themes" },
                    ].map(({ key, description }) => (
                      <li
                        key={key}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 10,
                          color: isImageTheme
                            ? "rgba(255,255,255,0.85)"
                            : currentTheme.digitColor,
                          fontSize: 14,
                          fontWeight: "500",
                        }}
                      >
                        <span>{description}</span>
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            backgroundColor: isImageTheme
                              ? "rgba(255,255,255,0.15)"
                              : currentTheme.cardBorder,
                            border: `1.5px solid ${
                              isImageTheme
                                ? "rgba(255,255,255,0.3)"
                                : currentTheme.cardBorder
                            }`,
                            fontWeight: "700",
                            fontFamily: "monospace",
                            userSelect: "none",
                            minWidth: 48,
                            textAlign: "center",
                            marginLeft: 20,
                          }}
                        >
                          {key}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className="p-4"
                  style={{
                    color: isImageTheme
                      ? "rgba(255, 255, 255, 0.95)"
                      : currentTheme.digitColor,
                    borderColor: isImageTheme
                      ? "rgba(255, 255, 255, 0.2)"
                      : currentTheme.cardBorder,
                  }}
                >
                  <ProgressChart currentTheme={currentTheme} />
                </div>
              </div>

              {/* Footer */}
              <div
                className="flex justify-end gap-3 p-6 border-t"
                style={{
                  borderTopColor: isImageTheme
                    ? "rgba(255, 255, 255, 0.15)"
                    : currentTheme.cardBorder,
                  background: isImageTheme
                    ? "rgba(0, 0, 0, 0.2)"
                    : "transparent",
                }}
              >
                <button
                  onClick={() => onOpenChange?.(false)}
                  className="px-4 py-2 text-sm rounded-xl border hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: isImageTheme
                      ? "rgba(255, 255, 255, 0.1)"
                      : "transparent",
                    color: isImageTheme
                      ? "rgba(255, 255, 255, 0.9)"
                      : currentTheme.separatorColor,
                    borderColor: isImageTheme
                      ? "rgba(255, 255, 255, 0.3)"
                      : currentTheme.cardBorder,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  id="save-settings-btn"
                  onClick={save}
                  className="px-4 py-2 text-sm rounded-xl border hover:opacity-90 transition-opacity"
                  style={{
                    backgroundColor: isImageTheme
                      ? "rgba(255, 255, 255, 0.2)"
                      : currentTheme.digitColor,
                    color: isImageTheme
                      ? "rgba(255, 255, 255, 0.95)"
                      : currentTheme.background,
                    borderColor: isImageTheme
                      ? "rgba(255, 255, 255, 0.4)"
                      : "transparent",
                    border: isImageTheme ? "1px solid" : "none",
                    cursor: "pointer",
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: ${isImageTheme
                ? "rgba(255, 255, 255, 0.1)"
                : currentTheme.cardBorder + "20"};
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: ${isImageTheme
                ? "rgba(255, 255, 255, 0.4)"
                : currentTheme.cardBorder};
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: ${isImageTheme
                ? "rgba(255, 255, 255, 0.6)"
                : currentTheme.digitColor + "80"};
            }

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
            }
            .zoom-in-95 {
              animation-name: zoom-in-95;
            }
            .duration-300 {
              animation-duration: 300ms;
            }

            input:focus,
            select:focus {
              outline: none;
              box-shadow: 0 0 0 2px
                ${isImageTheme
                  ? "rgba(255, 255, 255, 0.3)"
                  : currentTheme.digitColor + "40"};
            }

            select option {
              background: ${currentTheme.background};
              color: ${currentTheme.digitColor};
            }
          `}</style>
        </>
      )}
    </>
  );
}
