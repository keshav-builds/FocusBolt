"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Ripple } from "@/components/ui/shadcn-io/ripple";
import { SettingsSheet } from "@/components/settings/settings-sheet";
import { TodoList } from "@/components/todo/TodoList";
import { FocusToggleIcon } from "@/components/timer/focus-mode-toggle";
import { SessionQuote } from "@/components/timer/quote";
import { ProgressChart } from "@/components/progress/progress-chart";
import { MusicBar } from "../components/MusicBar";
import { ExpandedPlayer } from "@/components/ExpandedPlayer";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { samplePlaylists } from "@/data/playlists";
import { FlipClock } from "@/components/timer/flip-clock";
import { usePomodoro } from "@/components/timer/pomodoro-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
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

  // Initialize theme state with lazy initializer (safe for SSR/CSR differences)
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(() => {
    if (typeof window === "undefined") return colorThemes[2]; // fallback for SSR
    const saved = localStorage.getItem("focusBoltTheme");
    if (saved) {
      const savedTheme = colorThemes.find((t) => t.id === saved);
      if (savedTheme) return savedTheme;
    }
    return colorThemes[2];
  });

  // Persist theme selection in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("focusBoltTheme", currentTheme.id);
    }
  }, [currentTheme]);
const isImageTheme = currentTheme.backgroundImage;
  // Apply theme CSS variables to document root
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement.style;

    // Handle background with image overlay
    if (currentTheme.backgroundImage && currentTheme.backgroundOverlay) {
      root.setProperty(
        "--theme-background",
        `
      linear-gradient(${currentTheme.backgroundOverlay}, ${currentTheme.backgroundOverlay}),
      url('${currentTheme.backgroundImage}')
    `
      );
      root.setProperty("--theme-background-size", "cover");
      root.setProperty("--theme-background-position", "center");
      root.setProperty("--theme-background-attachment", "fixed");
    } else {
      root.setProperty("--theme-background", currentTheme.background);
      root.setProperty("--theme-background-size", "auto");
      root.setProperty("--theme-background-position", "initial");
      root.setProperty("--theme-background-attachment", "initial");
    }

    root.setProperty("--theme-card-background", currentTheme.cardBackground);
    root.setProperty("--theme-card-border", currentTheme.cardBorder);
    root.setProperty("--theme-digit-color", currentTheme.digitColor);
    root.setProperty("--theme-separator-color", currentTheme.separatorColor);
    root.setProperty("--theme-shadow", currentTheme.shadow);
  }, [currentTheme]);

  // Memoize tabs config to prevent re-creation on every render
  const tabs = useMemo(
    () => [
      { value: "work", label: "Work" },
      { value: "short", label: "Short Break" },
      { value: "long", label: "Long Break" },
    ],
    []
  );
  
  // Memoize mode label function to avoid redeclaration
  const modeLabel = useCallback((mode: "work" | "short" | "long") => {
    switch (mode) {
      case "work":
        return "Work";
      case "short":
        return "Short Break";
      case "long":
        return "Long Break";
    }
  }, []);

  // Keyboard event handler wrapped with useCallback and stable deps for performance
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      // Ignore key presses if focus is on input to prevent unintended triggers
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (isRunning) pause();
          else start();
          break;
        default:
          switch (e.key.toLowerCase()) {
            case "r":
              reset();
              break;
            case "s":
              skip();
              break;
            case "f":
              setFocusMode(!focusMode);
              break;
            case "c": {
              const currentIndex = colorThemes.findIndex(
                (t) => t.id === currentTheme.id
              );
              const nextIndex = (currentIndex + 1) % colorThemes.length;
              setCurrentTheme(colorThemes[nextIndex]);
              break;
            }
          }
      }
    },
    [isRunning, pause, start, reset, skip, setFocusMode, currentTheme]
  );

  // Register and clean up keyboard event listener once
  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [onKey]);
  // Music player states
  const [isExpanded, setIsExpanded] = useState(false);
  const audioPlayer = useAudioPlayer();

  const handleToggleExpand = () => setIsExpanded(!isExpanded);

  const handleSelectTrack = (track: any) => {
    // Find the playlist that contains this track
    const playlist = samplePlaylists.find((p) =>
      p.tracks.some((t) => t.id === track.id)
    );
    if (playlist) {
      audioPlayer.playTrack(track, playlist.tracks);
    }
  };
  const [todoOpen, setTodoOpen] = React.useState(false);
  return (
    <main
      className="min-h-dvh text-foreground transition-all duration-500 ease-in-out relative"
      style={{
        // Handle image themes
        ...(currentTheme.backgroundImage && {
          backgroundColor: "transparent",
          backgroundImage: currentTheme.backgroundOverlay
            ? `linear-gradient(${currentTheme.backgroundOverlay}, ${currentTheme.backgroundOverlay}), url('${currentTheme.backgroundImage}')`
            : `url('${currentTheme.backgroundImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
        }),
        // Handle gradient and solid color themes
        ...(!currentTheme.backgroundImage && {
          background: currentTheme.background,
        }),
        color: currentTheme.digitColor,
      }}
    >
      {(mode === "short" || mode === "long") && (
        <Ripple
          mainCircleSize={350}
          mainCircleOpacity={0.55}
          numCircles={5}
          currentTheme={currentTheme}
          className="fixed inset-0 z-0" // Fixed positioning to cover entire viewport
        />
      )}
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
            <TodoList
              open={todoOpen}
              onOpenChange={setTodoOpen}
              currentTheme={currentTheme}
            />

            <ColorPicker
              currentTheme={currentTheme}
              onThemeChange={setCurrentTheme}
              variant="header"
            />
            <SettingsSheet
              currentTheme={currentTheme}
              open={settingsOpen}
              onOpenChange={setSettingsOpen}
            />
          </div>
        </header>

        <section className="mt-4">
          <Card
            id="pomodoro-focus-section"
            className={cn(
              "relative",
              "border transition-all duration-300",
              focusMode && "fullscreen-mode"
            )}
            style={{
              background: "transparent",
              border: "none",
              boxShadow: "none",
              minHeight: "600px",
            }}
          >
            <CardHeader className="pb-0 card-header">
              <div className="flex items-center justify-between gap-4">
                <CardTitle
                  className="text-balance text-lg"
                  style={{ color: currentTheme.digitColor }}
                >
                  Pomodoro
                </CardTitle>

                <div className="flex-shrink-0">
                  <div className="relative">
                    {/* Custom animated tabs container */}
                    <div
                      className="flex rounded-lg p-1 shadow-[0_3px_10px_rgb(0,0,0,0.2)]"
                      style={{
                        background: currentTheme.background,
                        border: `1px solid ${currentTheme.cardBorder}`,
                        
                      }}
                    >
                      {tabs.map((tab) => (
                        <button
                          key={tab.value}
                          onClick={() => {
                            setViewMode(tab.value as any);
                            switchMode(tab.value as any);
                          }}
                          className={`${
                            viewMode === tab.value ? "" : "hover:opacity-50"
                          } relative rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2  cursor-pointer `}
                          style={{
                            color:
                              viewMode === tab.value
                                ? currentTheme.digitColor
                                : `${currentTheme.digitColor}80`,
                            WebkitTapHighlightColor: "transparent",
                           
                          }}
                          aria-label={`Switch to ${tab.label}`}
                        >
                          {/* Animated background bubble */}
                          {viewMode === tab.value && (
                            <motion.span
                              layoutId="activeTabBubble"
                              className="absolute inset-0 z-0"
                              style={{
                                borderRadius: 6,
                                backgroundColor: currentTheme.cardBorder,
                                boxShadow: `0 1px 3px ${currentTheme.cardBorder}40`,
                              }}
                              transition={{
                                type: "spring",
                                bounce: 0.2,
                                duration: 0.6,
                              }}
                            />
                          )}
                          <span className="relative z-10">{tab.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-1">
              <FlipClock
                seconds={remaining}
                theme={currentTheme}
                ariaLabel={`${modeLabel(mode)} time remaining`}
              />
              <div
                className="text-xs transition-colors duration-300"
                style={{ color: currentTheme.separatorColor, opacity: 0.8 }}
              >
                {/* {quote} */}

                <SessionQuote currentTheme={currentTheme} />
              </div>

              <div className="flex items-center justify-center gap-4 mt-2">
                {isRunning ? (
                  <Button
                    size="xl"
                    onClick={pause}
                    className="relative px-6 transition-all duration-200 group "
                    style={{
                    background: isImageTheme
                        ? "rgba(255,255,255,0.78) "
                        : `${currentTheme.background}`,
                      color: currentTheme.digitColor,
                   
                      border: isImageTheme
                        ? `1px solid ${currentTheme.digitColor} `
                        : `1px solid ${currentTheme.digitColor}`,
                      boxShadow: isImageTheme
                        ? `5px 5px 0 0 ${currentTheme.background}`
                        : `5px 5px 0 0 ${currentTheme.digitColor}`,
                      cursor: "pointer",
                    }}
                  >
                    Pause
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={start}
                    className=" relative px-6 transition-all duration-200 group "
                    style={{
                      
                      background: isImageTheme
                        ? "rgba(255,255,255,0.78) "
                        : `${currentTheme.background}`,
                      color: currentTheme.digitColor,
                   
                      border: isImageTheme
                        ? `1px solid ${currentTheme.digitColor} `
                        : `1px solid ${currentTheme.digitColor}`,
                      boxShadow: isImageTheme
                        ? `5px 5px 0 0 ${currentTheme.background}`
                        : `5px 5px 0 0 ${currentTheme.digitColor}`,
                      
                      cursor: "pointer",
                    }}
                  >
                    Start
                  </Button>
                )}
                {/* <Button
                  size="lg"
                  variant="secondary"
                  onClick={reset}
                  className="transition-all duration-200"
                  style={{
                    background: currentTheme.background,
                    color: currentTheme.digitColor,
                    border: `1px solid ${currentTheme.cardBorder}`,
                    cursor: "pointer",
                  }}
                >
                  Reset
                </Button> */}
                {/* <Button
                  variant="ghost"
                  onClick={skip}
                  className="transition-all duration-200"
                  style={{
                    color: currentTheme.separatorColor,
                  }}
                >
                  Skip
                </Button> */}
              </div>
              <FocusToggleIcon currentTheme={currentTheme} />
            </CardContent>
          </Card>
          {/* {music bar} */}
          <div className="-mt-16 -mb-2">
            <MusicBar
              currentTrack={audioPlayer.currentTrack}
              isPlaying={audioPlayer.isPlaying}
              isBuffering={audioPlayer.isBuffering}
              error={audioPlayer.error}
              onPlayPause={audioPlayer.togglePlayPause}
              onNext={audioPlayer.playNext}
              onPrevious={audioPlayer.playPrevious}
              currentTime={audioPlayer.currentTime}
              duration={audioPlayer.duration}
              volume={audioPlayer.volume}
              onSeek={audioPlayer.seek}
              onVolumeChange={audioPlayer.changeVolume}
              isExpanded={isExpanded}
              onToggleExpand={handleToggleExpand}
              currentTheme={currentTheme}
              onSelectFirstTrack={() => {
                // Get first track from first playlist
                if (
                  samplePlaylists.length > 0 &&
                  samplePlaylists[0].tracks.length > 0
                ) {
                  const firstTrack = samplePlaylists[0].tracks[0];
                  handleSelectTrack(firstTrack); // Use your existing function
                }
              }}
            />
          </div>

          {/* Expandable Player Popup */}
          <ExpandedPlayer
            isExpanded={isExpanded}
            currentTheme={currentTheme}
            playlists={samplePlaylists}
            currentTrack={audioPlayer.currentTrack}
            onSelectTrack={handleSelectTrack}
            onClose={() => setIsExpanded(false)}
          />
        </section>

        {/* <section
          className={cn(
            "grid gap-6 md:grid-cols-2 transition-all duration-300",
            focusMode && "opacity-40 pointer-events-none"
          )}
        >
          <Card
            className="border transition-all duration-300"
            style={{
              backgroundColor: "transparent",
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
              backgroundColor: "transparent",
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
              <p>Press C to cycle through color themes, or use the color picker.</p>
              <p>
                Enable notifications in Settings to get alerts even if the tab is
                in the background.
              </p>
              <p>
                Customize durations, long break interval, and behavior in Settings.
              </p>
            </CardContent>
          </Card>
        </section> */}
      </div>
    </main>
  );
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
