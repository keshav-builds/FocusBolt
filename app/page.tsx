"use client";
import React, { useState, useEffect, useMemo } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { SettingsSheet } from "@/components/settings/settings-sheet";
import { FocusModeToggle } from "@/components/timer/focus-mode-toggle";
import { SessionQuote } from "@/components/timer/session-quote";
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
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isRunning, pause, start, reset, skip, focusMode, setFocusMode]);

  const tabs = useMemo(
    () => [
      { value: "work", label: "Work" },
      { value: "short", label: "Short Break" },
      { value: "long", label: "Long Break" },
    ],
    []
  );

  return (
    <main className="min-h-dvh bg-background text-foreground transition-colors duration-300">
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
              className="h-8 w-8 rounded-md bg-primary/10 object-contain"
            />
            <h1 className="text-pretty text-xl font-semibold md:text-2xl">
              Focus Bolt
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <FocusModeToggle />
            <ModeToggle />
            <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
          </div>
        </header>

        <section className={cn("mt-6")}>
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-balance text-lg">Pomodoro</CardTitle>
                <Tabs
                  value={viewMode}
                  onValueChange={(v) => setViewMode(v as any)}
                >
                  <TabsList className="grid grid-cols-3">
                    {tabs.map((t) => (
                      <TabsTrigger
                        key={t.value}
                        value={t.value}
                        onClick={() => switchMode(t.value as any)}
                        className="text-sm"
                        aria-label={`Switch to ${t.label}`}
                      >
                        {t.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              <FlipClock
                seconds={remaining}
                ariaLabel={`${modeLabel(mode)} time remaining`}
              />
              <CurrentTime className="text-xs text-muted-foreground" />
              <div className="flex items-center justify-center gap-3">
                {isRunning ? (
                  <Button size="lg" onClick={pause} className="px-6">
                    Pause
                  </Button>
                ) : (
                  <Button size="lg" onClick={start} className="px-6">
                    Start
                  </Button>
                )}
                <Button variant="secondary" onClick={reset}>
                  Reset
                </Button>
                <Button variant="ghost" onClick={skip}>
                  Skip
                </Button>
              </div>
              <div className="text-center text-xs text-muted-foreground">
                {autoPauseOnBlur
                  ? "Auto-pause when tab hidden. "
                  : "Auto-pause off. "}
                {autoResumeOnFocus
                  ? "Auto-resume on return."
                  : "Manual resume on return."}
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-8" />

        <section
          className={cn(
            "grid gap-6 md:grid-cols-2",
            focusMode && "opacity-40 pointer-events-none"
          )}
        >
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Today&apos;s Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressChart />
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Press Space to start/pause, R to reset, S to skip, F for Focus
                Mode.
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

        <SessionQuote />
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
