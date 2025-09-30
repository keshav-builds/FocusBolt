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
import { PomodoroInfoModal } from "@/components/PomodoroInfoModal";
import { NotificationPrompt } from "@/components/ui/NotificationPrompt";
import { ensurePermission } from "@/lib/notifications";
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
  //pomodorInfo
  const [showPomodoroInfo, setShowPomodoroInfo] = React.useState(false);

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

  //get the color based on theme id
  const getColor = () => {
    if (isImageTheme) return "white"; // white for image theme

    if (currentTheme.id === "pure-white" || currentTheme.id === "light-gray")
      // blue for light themes

      return "#60A5FA";
    if (currentTheme.id === "pure-black" || currentTheme.id === "dark-gray")
      // yellow for dark themes

      return "#FCD34D";

    return currentTheme.cardBorder; //return default
  };
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
            // case "r":
            //   reset();
            //   break;
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

  //notification prompt
  const [showNotifPrompt, setShowNotifPrompt] = React.useState(false);

  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      const promptedBefore = localStorage.getItem("notifPromptDismissed");
      if (!promptedBefore) {
        const timer = setTimeout(() => {
          setShowNotifPrompt(true);
        }, 5000); // 5 seconds delay
        return () => clearTimeout(timer);
      }
    }
  }, []);
  const handleAcceptNotifications = async () => {
    setShowNotifPrompt(false);
    localStorage.setItem("notifPromptDismissed", "true");

    const granted = await ensurePermission();
    if (!granted) {
      alert(
        "Notifications are blocked. Please enable them in browser settings."
      );
    }
  };

  const handleDismissNotifications = () => {
    setShowNotifPrompt(false);
    localStorage.setItem("notifPromptDismissed", "true");
  };
  const handleClose = () => {
    console.log("Notification prompt closed temporarily");
    setShowNotifPrompt(false);
    // No persistence here, so prompt will be shown again on reload
  };

  return (
    <main
      className="min-h-dvh text-foreground transition-all duration-500 ease-in-out relative"
      style={{
        // Handle image themes
        ...(currentTheme.backgroundImage && {
          backgroundColor: "#2a2f36", // fallback color if image fails gun metal color
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
          mainCircleSize={250}
          mainCircleOpacity={0.55}
          numCircles={5}
          currentTheme={currentTheme}
          className="fixed inset-0 z-0 "
          style={{ bottom: "80px" }}
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              strokeWidth="2"
              fill="none"
              stroke={getColor()}
              className="icon icon-tabler icons-tabler-filled icon-tabler-bolt "
              aria-hidden="true"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M13 2l.018 .001l.016 .001l.083 .005l.011 .002h.011l.038 .009l.052 .008l.016 .006l.011 .001l.029 .011l.052 .014l.019 .009l.015 .004l.028 .014l.04 .017l.021 .012l.022 .01l.023 .015l.031 .017l.034 .024l.018 .011l.013 .012l.024 .017l.038 .034l.022 .017l.008 .01l.014 .012l.036 .041l.026 .027l.006 .009c.12 .147 .196 .322 .218 .513l.001 .012l.002 .041l.004 .064v6h5a1 1 0 0 1 .868 1.497l-.06 .091l-8 11c-.568 .783 -1.808 .38 -1.808 -.588v-6h-5a1 1 0 0 1 -.868 -1.497l.06 -.091l8 -11l.01 -.013l.018 -.024l.033 -.038l.018 -.022l.009 -.008l.013 -.014l.04 -.036l.028 -.026l.008 -.006a1 1 0 0 1 .402 -.199l.011 -.001l.027 -.005l.074 -.013l.011 -.001l.041 -.002z" />
            </svg>
            <h1
              className="text-pretty text-xl font-semibold md:text-2xl transition-colors duration-300 tracking-tight text-shadow-md"
              style={{
                color: isImageTheme
                  ? currentTheme.background
                  : currentTheme.digitColor,
              }}
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
                  onClick={() => setShowPomodoroInfo(true)}
                  className="cursor-pointer text-lg tracking-tight text-shadow-md underline"
                  style={{
                    color: isImageTheme
                      ? currentTheme.background
                      : currentTheme.digitColor,
                  }}
                >
                  Pomodoro ?
                </CardTitle>

                <PomodoroInfoModal
                  isOpen={showPomodoroInfo}
                  onClose={() => setShowPomodoroInfo(false)}
                  currentTheme={currentTheme}
                />

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
           
                {/* Reset Button - absolutely positioned near the upper right of FlipClock */}
                <button
                  onClick={reset}
                  aria-label="Reset"
                  className="p-2 rounded-full focus:outline-none"
                  style={{
                    position: "fixed",
                      
        right: "27%",
        top: "25%",
                    background: isImageTheme
                      ? "rgba(255,255,255,0.82)"
                      : currentTheme.background,
                    color: currentTheme.digitColor,
                    border: `1px solid ${currentTheme.cardBorder}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 2,
                  }}
                  title="Reset"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-reload"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M19.933 13.041a8 8 0 1 1 -9.925 -8.788c3.899 -1 7.935 1.007 9.425 4.747" />
                    <path d="M20 4v5h-5" />
                  </svg>
                </button>

                {/* Flip Clock */}
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

              <div className="flex items-center justify-center gap-4 mt-4">
                {isRunning ? (
                  <Button
                    size="xl"
                    onClick={pause}
                    className="relative px-6 transition-all duration-200 group "
                    title="Press Space to start/pause timer"
                    style={{
                      background: `${currentTheme.background}`,
                      color: currentTheme.digitColor,

                      border: isImageTheme
                        ? `1px solid ${currentTheme.digitColor} `
                        : `1px solid ${getColor()}`,
                      boxShadow: isImageTheme
                        ? "4px 4px 0 0 rgba(255,255,255,0.78)"
                        : `4px 4px 0 0 ${getColor()}`,

                      cursor: "pointer",
                    }}
                  >
                    Pause
                  </Button>
                ) : (
                  <Button
                    size="xl"
                    onClick={start}
                    className=" relative px-6 transition-all duration-200 group "
                    title="Press Space to start/pause timer"
                    style={{
                      background: `${currentTheme.background}`,
                      color: currentTheme.digitColor,

                      border: isImageTheme
                        ? `1px solid ${currentTheme.digitColor} `
                        : `1px solid ${getColor()}`,
                      boxShadow: isImageTheme
                        ? "4px 4px 0 0 rgba(255,255,255,0.78)"
                        : `4px 4px 0 0 ${getColor()}`,

                      cursor: "pointer",
                    }}
                  >
                    Start
                  </Button>
                )}
                {/* skip button removed */}
                <FocusToggleIcon currentTheme={currentTheme}  />
              </div>
              {/* {music bar} */}

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
              {/* Soft notification prompt */}
              {showNotifPrompt && (
                <>
                  <div
                    style={{
                      position: "fixed",
                      inset: 0,
                      background: "rgba(24,24,24,0.35)",
                      backdropFilter: "blur(3px)",
                      WebkitBackdropFilter: "blur(3px)",
                      zIndex: 1000,
                    }}
                    // onClick={handleDismissNotifications}
                    // optional: click outside to dismiss
                  />
                  <NotificationPrompt
                    style={{
                      position: "fixed",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      zIndex: 2000,
                      maxWidth: 360,
                    }}
                    currentTheme={currentTheme}
                    onAccept={handleAcceptNotifications}
                    onDismiss={handleDismissNotifications}
                    onClose={handleClose}
                  />
                </>
              )}
            </CardContent>
          </Card>
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
