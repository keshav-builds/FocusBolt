"use client";
import React, { useState, useEffect, useMemo } from "react";
import { SettingsSheet } from "@/components/settings/settings-sheet";
import { FocusToggleIcon } from '@/components/timer/focus-mode-toggle';
import { SessionQuote } from "@/components/timer/quote";
import { ProgressChart } from "@/components/progress/progress-chart";
import { FlipClock } from "@/components/timer/flip-clock";
import { usePomodoro } from "@/components/timer/pomodoro-provider";
import { CurrentTime } from "@/components/time/current-time";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { RegisterSW } from "@/components/register-sw";
import { LoaderThree } from "@/components/ui/loader";
import { ColorPicker } from "@/components/ColorPicker";
import { colorThemes } from "@/config/themes";
import { ColorTheme } from "@/lib/theme";

function AppBody() {
  const {
    viewMode,
    setViewMode,
    mode,
    switchMode,
    isRunning,
    remaining,
    start,
    pause,
    reset,
    skip,
    settingsOpen,
    setSettingsOpen,
    focusMode,
    setFocusMode,
    autoPauseOnBlur,
    autoResumeOnFocus,
  } = usePomodoro();

  // Color theme state with localStorage persistence
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("focusBoltTheme");
      if (saved) {
        const savedTheme = colorThemes.find((t) => t.id === saved);
        if (savedTheme) return savedTheme;
      }
    }
    return colorThemes[0]; // Default to first theme
  });

  // Persist theme selection
  useEffect(() => {
    localStorage.setItem("focusBoltTheme", currentTheme.id);
  }, [currentTheme]);

  // Apply theme to document root for global styling
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--theme-background",
      currentTheme.background
    );
    document.documentElement.style.setProperty(
      "--theme-card-background",
      currentTheme.cardBackground
    );
    document.documentElement.style.setProperty(
      "--theme-card-border",
      currentTheme.cardBorder
    );
    document.documentElement.style.setProperty(
      "--theme-digit-color",
      currentTheme.digitColor
    );
    document.documentElement.style.setProperty(
      "--theme-separator-color",
      currentTheme.separatorColor
    );
    document.documentElement.style.setProperty(
      "--theme-shadow",
      currentTheme.shadow
    );
  }, [currentTheme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.code === "Space") {
        e.preventDefault();
        isRunning ? pause() : start();
      } else if (e.key.toLowerCase() === "r") {
        reset();
      } else if (e.key.toLowerCase() === "s") {
        skip();
      } else if (e.key.toLowerCase() === "f") {
        setFocusMode(!focusMode);
      } else if (e.key.toLowerCase() === "c") {
        // Quick color theme cycling with 'C' key
        const currentIndex = colorThemes.findIndex(
          (t) => t.id === currentTheme.id
        );
        const nextIndex = (currentIndex + 1) % colorThemes.length;
        setCurrentTheme(colorThemes[nextIndex]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    isRunning,
    pause,
    start,
    reset,
    skip,
    focusMode,
    setFocusMode,
    currentTheme,
  ]);

  const tabs = useMemo(
    () => [
      { value: "work", label: "Work" },
      { value: "short", label: "Short Break" },
      { value: "long", label: "Long Break" },
    ],
    []
  );

  return (
    <main
      className="min-h-dvh text-foreground transition-all duration-500 ease-in-out"
      style={{
        background: currentTheme.background,
        color: currentTheme.digitColor,
      }}
    >
      <RegisterSW />
      <div
        className={cn(
          "mx-auto flex min-h-dvh max-w-4xl flex-col p-4 md:p-8",
          focusMode && "max-w-3xl"
        )}
      >
        <header className={cn("flex items-center justify-between gap-2")}>
          <div className="flex items-center gap-3">
            <img
              src="/favicon.ico"
              alt=""
              aria-hidden="true"
              className="h-8 w-8 rounded-md object-contain"
             
            />
            <h1
              className="text-pretty text-xl font-semibold md:text-2xl transition-colors duration-300"
              style={{ color: currentTheme.digitColor }}
            >
              Focus Bolt
            </h1>
          </div>
          <div className="flex items-center gap-2">
            
            {/* ColorPicker */}
            <ColorPicker
              currentTheme={currentTheme}
              onThemeChange={setCurrentTheme}
              variant="header"
            />
            <SettingsSheet  currentTheme={currentTheme} open={settingsOpen} onOpenChange={setSettingsOpen}  />
          </div>
        </header>

        <section className={cn("mt-6")}>
          <Card
            id="pomodoro-focus-section"
            className={cn(
               'relative',
              "border transition-all duration-300",
              focusMode && "fullscreen-mode"
            )}
            style={{
              backgroundColor: currentTheme.background,
              borderColor: currentTheme.cardBorder,
              boxShadow: currentTheme.shadow,
            }}
          >
            <CardHeader className="pb-2 card-header">
              <div className="flex items-center justify-between gap-4 ">
                <CardTitle
                  className="text-balance text-lg"
                  style={{ color: currentTheme.digitColor }}
                >
                  Pomodoro
                </CardTitle>
                <div className="flex-shrink-0">
                  <Tabs
                    value={viewMode}
                    onValueChange={(v) => setViewMode(v as any)}
                  >
                    <TabsList
                      className="grid grid-cols-3"
                      themeStyle={{
                        backgroundColor: `${currentTheme.cardBorder}20`,
                        border: `1px solid ${currentTheme.cardBorder}`,
                      }}
                    >
                      {tabs.map((t) => (
                        <TabsTrigger
                          key={t.value}
                          value={t.value}
                          onClick={() => switchMode(t.value as any)}
                          className="text-sm data-[state=active]:shadow-sm"
                          isActive={viewMode === t.value}
                          themeStyle={{
                            color: `${currentTheme.digitColor}80`,
                          }}
                          activeThemeStyle={{
                            backgroundColor: currentTheme.background,
                            color: currentTheme.digitColor,
                            boxShadow: `0 1px 3px ${currentTheme.cardBorder}40`,
                          }}
                          aria-label={`Switch to ${t.label}`}
                        >
                          {t.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              <FlipClock
                seconds={remaining}
                theme={currentTheme}
                ariaLabel={`${modeLabel(mode)} time remaining`}
              />
              <div
                className="text-xs transition-colors duration-300"
                style={{ color: currentTheme.separatorColor, opacity: 0.8 }}
              >
                <CurrentTime />
              </div>
              <div className="flex items-center justify-center gap-3">
                {isRunning ? (
                  <Button
                    size="lg"
                    onClick={pause}
                    className="px-6 transition-all duration-200"
                    style={{
                      backgroundColor: currentTheme.digitColor,
                      color: currentTheme.background,
                      border: `1px solid ${currentTheme.cardBorder}`,
                    }}
                  >
                    Pause
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={start}
                    className="px-6 transition-all duration-200"
                    style={{
                      backgroundColor: currentTheme.digitColor,
                      color: currentTheme.background,
                      border: `1px solid ${currentTheme.cardBorder}`,
                    }}
                  >
                    Start
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={reset}
                  className="transition-all duration-200"
                  style={{
                    backgroundColor: `${currentTheme.cardBorder}20`,
                    color: currentTheme.digitColor,
                    border: `1px solid ${currentTheme.cardBorder}`,
                  }}
                >
                  Reset
                </Button>
                <Button
                  variant="ghost"
                  onClick={skip}
                  className="transition-all duration-200"
                  style={{
                    color: currentTheme.separatorColor,
                  }}
                >
                  Skip
                </Button>
              </div>
             
              <div
                className="text-center text-xs transition-colors duration-300"
                style={{ color: `${currentTheme.separatorColor}60` }}
              >
                {autoPauseOnBlur
                  ? "Auto-pause when tab hidden. "
                  : "Auto-pause off. "}
                {autoResumeOnFocus
                  ? "Auto-resume on return. "
                  : "Manual resume on return. "}
                <span className="opacity-70">Press C to cycle themes.</span>
               
              </div>
            </CardContent>
                <FocusToggleIcon currentTheme={currentTheme} />
          </Card>
        </section>

        <Separator
          className="my-8 transition-colors duration-300"
          style={{ backgroundColor: `${currentTheme.cardBorder}40` }}
        />

        <section
          className={cn(
            "grid gap-6 md:grid-cols-2 transition-all duration-300",
            focusMode && "opacity-40 pointer-events-none"
          )}
        >
          <Card
            className="border transition-all duration-300"
            style={{
              backgroundColor: currentTheme.background,
              borderColor: currentTheme.cardBorder,
              boxShadow: `0 4px 12px ${currentTheme.cardBorder}20`,
            }}
          >
            <CardHeader>
              <CardTitle
                className="text-lg transition-colors duration-300"
                style={{ color: currentTheme.digitColor }}
              >
                Today&apos;s Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressChart />
            </CardContent>
          </Card>
          <Card
            className="border transition-all duration-300"
            style={{
              backgroundColor: currentTheme.background,
              borderColor: currentTheme.cardBorder,
              boxShadow: `0 4px 12px ${currentTheme.cardBorder}20`,
            }}
          >
            <CardHeader>
              <CardTitle
                className="text-lg transition-colors duration-300"
                style={{ color: currentTheme.digitColor }}
              >
                Tips
              </CardTitle>
            </CardHeader>
            <CardContent
              className="space-y-3 text-sm transition-colors duration-300"
              style={{ color: `${currentTheme.separatorColor}80` }}
            >
              <p>
                Press Space to start/pause, R to reset, S to skip, F for Focus
                Mode.
              </p>
              <p>
                Press C to cycle through color themes, or use the color picker.
              </p>
              <p>
                Enable notifications in Settings to get alerts even if the tab
                is in the background.
              </p>
              <p>
                Customize durations, long break interval, and behavior in
                Settings.
              </p>
            </CardContent>
          </Card>
        </section>

           {/* Add rotating quotes at the bottom */}
      <SessionQuote currentTheme={currentTheme} />
      </div>
    </main>
  );
}

function modeLabel(mode: "work" | "short" | "long") {
  if (mode === "work") return "Work";
  if (mode === "short") return "Short Break";
  return "Long Break";
}

export default function Page() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100dvh",
          width: "100vw",
          overflow: "hidden",
        }}
      >
        <LoaderThree />
      </div>
    );
  }

  return <AppBody />;
}
