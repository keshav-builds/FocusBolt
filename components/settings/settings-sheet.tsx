"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePomodoro } from "@/components/timer/pomodoro-provider";
import { ensurePermission } from "@/lib/notifications";
import { ColorTheme } from "@/lib/theme";

interface SettingsSheetProps {
  open?: boolean;
  onOpenChange?: (b: boolean) => void;
  currentTheme: ColorTheme;
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
    timeFormat,
    setTimeFormat,
  } = usePomodoro();

  const [work, setWork] = React.useState(Math.round(durations.work / 60));
  const [shortB, setShortB] = React.useState(Math.round(durations.short / 60));
  const [longB, setLongB] = React.useState(Math.round(durations.long / 60));
  const [longInt, setLongInt] = React.useState(longInterval);

  React.useEffect(() => {
    setWork(Math.round(durations.work / 60));
    setShortB(Math.round(durations.short / 60));
    setLongB(Math.round(durations.long / 60));
  }, [durations]);

  React.useEffect(() => {
    setLongInt(longInterval);
  }, [longInterval]);

  const save = () => {
    setDurations({
      work: clampMins(work) * 60,
      short: clampMins(shortB) * 60,
      long: clampMins(longB) * 60,
    });
    setLongInterval(Math.max(2, Math.min(12, longInt)));
    onOpenChange?.(false);
  };

  const requestNotif = async () => {
    if (await ensurePermission()) setNotifications(true);
  };

  const isImageTheme = currentTheme.backgroundImage;

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
        Settings
      </Button>

      {/* Modal */}
      {open && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 backdrop-blur-[2px]"
            style={{
              backgroundColor: isImageTheme ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.25)'
            }}
            onClick={() => onOpenChange?.(false)}
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div 
              className="rounded-3xl shadow-2xl overflow-hidden max-w-lg w-full max-h-[85vh] border animate-in zoom-in-95 duration-300"
              style={{
                background: isImageTheme ? 'rgba(0, 0, 0, 0.55)' : currentTheme.background,
                borderColor: isImageTheme ? 'rgba(255, 255, 255, 0.25)' : `${currentTheme.cardBorder}80`,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: isImageTheme 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15)' 
                  : `0 25px 50px -12px ${currentTheme.cardBorder}40`,
              }}
            >
              {/* Header */}
              <div 
                className="flex items-center justify-between px-6 py-5 border-b"
                style={{
                  borderBottomColor: isImageTheme ? 'rgba(255, 255, 255, 0.15)' : currentTheme.cardBorder,
                  background: isImageTheme ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
                }}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                      backgroundColor: isImageTheme ? 'rgba(255, 255, 255, 0.15)' : `${currentTheme.cardBorder}40`,
                      border: `1px solid ${isImageTheme ? 'rgba(255, 255, 255, 0.3)' : currentTheme.cardBorder}`,
                    }}
                  >
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <div>
                    <h2 
                      className="text-xl font-bold"
                      style={{ color: isImageTheme ? 'rgba(255, 255, 255, 0.95)' : currentTheme.digitColor }}
                    >
                      Settings
                    </h2>
                    <p 
                      className="text-sm"
                      style={{ color: isImageTheme ? 'rgba(255, 255, 255, 0.8)' : currentTheme.separatorColor }}
                    >
                      Customize sessions and behavior
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChange?.(false)}
                  className="p-2 rounded-full transition-all duration-200 hover:scale-110 border"
                  style={{
                    color: isImageTheme ? 'rgba(255, 255, 255, 0.9)' : currentTheme.separatorColor,
                    backgroundColor: isImageTheme ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    borderColor: isImageTheme ? 'rgba(255, 255, 255, 0.3)' : currentTheme.cardBorder,
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div 
                className="p-6 overflow-y-auto max-h-[60vh] space-y-6 custom-scrollbar"
                style={{
                  background: isImageTheme ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
                }}
              >
                {/* Session Durations */}
                <div 
                  className="p-4 rounded-2xl border"
                  style={{
                    backgroundColor: isImageTheme ? 'rgba(255, 255, 255, 0.08)' : `${currentTheme.background}20`,
                    borderColor: isImageTheme ? 'rgba(255, 255, 255, 0.2)' : currentTheme.cardBorder,
                  }}
                >
                  <h3 
                    className="text-base font-semibold mb-4"
                    style={{ color: isImageTheme ? 'rgba(255, 255, 255, 0.95)' : currentTheme.digitColor }}
                  >
                    Session Durations
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label 
                        htmlFor="work"
                        style={{ color: isImageTheme ? 'rgba(255, 255, 255, 0.9)' : currentTheme.digitColor }}
                      >
                        Work (minutes)
                      </Label>
                      <input
                        id="work"
                        type="number"
                        min={1}
                        max={180}
                        value={work}
                        onChange={(e) => setWork(Number(e.target.value))}
                        className="w-20 px-2 py-1 text-sm rounded-lg border"
                        style={{
                          backgroundColor: isImageTheme ? 'rgba(255, 255, 255, 0.1)' : currentTheme.background,
                          color: isImageTheme ? 'rgba(255, 255, 255, 0.9)' : currentTheme.digitColor,
                          borderColor: isImageTheme ? 'rgba(255, 255, 255, 0.3)' : currentTheme.cardBorder,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label 
                        htmlFor="short"
                        style={{ color: isImageTheme ? 'rgba(255, 255, 255, 0.9)' : currentTheme.digitColor }}
                      >
                        Short break (minutes)
                      </Label>
                      <input
                        id="short"
                        type="number"
                        min={1}
                        max={60}
                        value={shortB}
                        onChange={(e) => setShortB(Number(e.target.value))}
                        className="w-20 px-2 py-1 text-sm rounded-lg border"
                        style={{
                          backgroundColor: isImageTheme ? 'rgba(255, 255, 255, 0.1)' : currentTheme.background,
                          color: isImageTheme ? 'rgba(255, 255, 255, 0.9)' : currentTheme.digitColor,
                          borderColor: isImageTheme ? 'rgba(255, 255, 255, 0.3)' : currentTheme.cardBorder,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label 
                        htmlFor="long"
                        style={{ color: isImageTheme ? 'rgba(255, 255, 255, 0.9)' : currentTheme.digitColor }}
                      >
                        Long break (minutes)
                      </Label>
                      <input
                        id="long"
                        type="number"
                        min={1}
                        max={120}
                        value={longB}
                        onChange={(e) => setLongB(Number(e.target.value))}
                        className="w-20 px-2 py-1 text-sm rounded-lg border"
                        style={{
                          backgroundColor: isImageTheme ? 'rgba(255, 255, 255, 0.1)' : currentTheme.background,
                          color: isImageTheme ? 'rgba(255, 255, 255, 0.9)' : currentTheme.digitColor,
                          borderColor: isImageTheme ? 'rgba(255, 255, 255, 0.3)' : currentTheme.cardBorder,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label 
                        htmlFor="interval"
                        style={{ color: isImageTheme ? 'rgba(255, 255, 255, 0.9)' : currentTheme.digitColor }}
                      >
                        Long break every
                      </Label>
                      <input
                        id="interval"
                        type="number"
                        min={2}
                        max={12}
                        value={longInt}
                        onChange={(e) => setLongInt(Number(e.target.value))}
                        className="w-20 px-2 py-1 text-sm rounded-lg border"
                        style={{
                          backgroundColor: isImageTheme ? 'rgba(255, 255, 255, 0.1)' : currentTheme.background,
                          color: isImageTheme ? 'rgba(255, 255, 255, 0.9)' : currentTheme.digitColor,
                          borderColor: isImageTheme ? 'rgba(255, 255, 255, 0.3)' : currentTheme.cardBorder,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div 
                  className="p-4 rounded-2xl border"
                  style={{
                    backgroundColor: isImageTheme ? 'rgba(255, 255, 255, 0.08)' : `${currentTheme.background}20`,
                    borderColor: isImageTheme ? 'rgba(255, 255, 255, 0.2)' : currentTheme.cardBorder,
                  }}
                >
                  <h3 
                    className="text-base font-semibold mb-4"
                    style={{ color: isImageTheme ? 'rgba(255, 255, 255, 0.95)' : currentTheme.digitColor }}
                  >
                    Preferences
                  </h3>
                  <div className="space-y-4">
                    {/* Clock Format */}
                    <div className="flex items-center justify-between">
                      <Label 
                        style={{ color: isImageTheme ? 'rgba(255, 255, 255, 0.9)' : currentTheme.digitColor }}
                      >
                        Clock format
                      </Label>
                      <select
                        value={timeFormat}
                        onChange={(e) => setTimeFormat(e.target.value as "12h" | "24h")}
                        className="px-3 py-1 text-sm rounded-lg border"
                        style={{
                          backgroundColor: isImageTheme ? 'rgba(255, 255, 255, 0.1)' : currentTheme.background,
                          color: isImageTheme ? 'rgba(255, 255, 255, 0.9)' : currentTheme.digitColor,
                          borderColor: isImageTheme ? 'rgba(255, 255, 255, 0.3)' : currentTheme.cardBorder,
                        }}
                      >
                        <option value="24h">24-hour</option>
                        <option value="12h">12-hour (AM/PM)</option>
                      </select>
                    </div>

                    {/* Switches */}
                    <div className="flex items-center justify-between">
                      <div>
                        <Label 
                          style={{ color: isImageTheme ? 'rgba(255, 255, 255, 0.9)' : currentTheme.digitColor }}
                        >
                          Auto start next session
                        </Label>
                        <p 
                          className="text-xs mt-1"
                          style={{ color: isImageTheme ? 'rgba(255, 255, 255, 0.7)' : currentTheme.separatorColor }}
                        >
                          Automatically begin the next work/break session
                        </p>
                      </div>
                      <Switch
                        checked={autoStartNext}
                        onCheckedChange={setAutoStartNext}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label 
                          style={{ color: isImageTheme ? 'rgba(255, 255, 255, 0.9)' : currentTheme.digitColor }}
                        >
                          Pause when the tab is hidden
                        </Label>
                        <p 
                          className="text-xs mt-1"
                          style={{ color: isImageTheme ? 'rgba(255, 255, 255, 0.7)' : currentTheme.separatorColor }}
                        >
                          Pause when switching tabs
                        </p>
                      </div>
                      <Switch
                        checked={autoPauseOnBlur}
                        onCheckedChange={setAutoPauseOnBlur}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label 
                          style={{ color: isImageTheme ? 'rgba(255, 255, 255, 0.9)' : currentTheme.digitColor }}
                        >
                          Desktop notifications
                        </Label>
                        <p 
                          className="text-xs mt-1"
                          style={{ color: isImageTheme ? 'rgba(255, 255, 255, 0.7)' : currentTheme.separatorColor }}
                        >
                          Show alerts when sessions end
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={notifications}
                          onCheckedChange={(b) => b ? requestNotif() : setNotifications(false)}
                        />
                   
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div 
                className="flex justify-end gap-3 p-6 border-t"
                style={{
                  borderTopColor: isImageTheme ? 'rgba(255, 255, 255, 0.15)' : currentTheme.cardBorder,
                  background: isImageTheme ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
                }}
              >
                <button
                  onClick={() => onOpenChange?.(false)}
                  className="px-4 py-2 text-sm rounded-xl border hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: isImageTheme ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    color: isImageTheme ? 'rgba(255, 255, 255, 0.9)' : currentTheme.separatorColor,
                    borderColor: isImageTheme ? 'rgba(255, 255, 255, 0.3)' : currentTheme.cardBorder,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  className="px-4 py-2 text-sm rounded-xl border hover:opacity-90 transition-opacity"
                  style={{
                    backgroundColor: isImageTheme ? 'rgba(255, 255, 255, 0.2)' : currentTheme.digitColor,
                    color: isImageTheme ? 'rgba(255, 255, 255, 0.95)' : currentTheme.background,
                    borderColor: isImageTheme ? 'rgba(255, 255, 255, 0.4)' : 'transparent',
                    border: isImageTheme ? '1px solid' : 'none',
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
              background: ${isImageTheme ? 'rgba(255, 255, 255, 0.1)' : currentTheme.cardBorder + '20'};
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: ${isImageTheme ? 'rgba(255, 255, 255, 0.4)' : currentTheme.cardBorder};
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: ${isImageTheme ? 'rgba(255, 255, 255, 0.6)' : currentTheme.digitColor + '80'};
            }
            
            @keyframes zoom-in-95 {
              0% { transform: scale(0.95); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
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

            /* Input focus styles */
            input:focus, select:focus {
              outline: none;
              box-shadow: 0 0 0 2px ${isImageTheme ? 'rgba(255, 255, 255, 0.3)' : currentTheme.digitColor + '40'};
            }

            /* Select dropdown styling */
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

function clampMins(n: number) {
  if (Number.isNaN(n)) return 1;
  return Math.max(1, Math.min(180, Math.round(n)));
}
