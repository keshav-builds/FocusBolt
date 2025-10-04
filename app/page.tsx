"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ripple } from "@/components/ui/shadcn-io/ripple";
import { SettingsSheet } from "@/components/settings/settings-sheet";
import { TodoList } from "@/components/todo/TodoList";
import { FocusToggleIcon } from "@/components/timer/focus-mode-toggle";
import { SessionQuote } from "@/components/timer/quote";
import { MusicBar } from "../components/music/MusicBar";
import { ExpandedPlayer } from "@/components/music/ExpandedPlayer";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { samplePlaylists } from "@/data/playlists";
import { FlipClock } from "@/components/timer/flip-clock";
import { usePomodoro } from "@/components/timer/pomodoro-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PomodoroInfoModal } from "@/components/infoPomodoro/PomodoroInfoModal";
import { NotificationPrompt } from "@/components/ui/NotificationPrompt";
import { ensurePermission } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { RegisterSW } from "@/components/register-sw";
import { LoaderThree } from "@/components/ui/loader";
import { ColorPicker } from "@/components/themeColor/ColorPicker";
import { colorThemes } from "@/config/themes";
import { ColorTheme } from "@/lib/theme";
import { getColor } from "@/lib/colorUtils";

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
    setNotifications 
  } = usePomodoro();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;

      setIsMobile(mobile);
      setIsTablet(tablet);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Separate effect to handle focus mode on mobile
  useEffect(() => {
    if (isMobile && focusMode) {
      setFocusMode(false);
    }
  }, [isMobile, focusMode, setFocusMode]);

  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(() => {
    if (typeof window === "undefined") return colorThemes[2];
    const saved = localStorage.getItem("focusBoltTheme");
    if (saved) {
      const savedTheme = colorThemes.find((t) => t.id === saved);
      if (savedTheme) return savedTheme;
    }
    return colorThemes[2];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("focusBoltTheme", currentTheme.id);
    }
  }, [currentTheme]);

  const isImageTheme = Boolean(currentTheme.backgroundImage);
  const color = getColor(currentTheme, isImageTheme);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement.style;

    if (currentTheme.backgroundImage && currentTheme.backgroundOverlay) {
      root.setProperty(
        "--theme-background",
        `linear-gradient(${currentTheme.backgroundOverlay}, ${currentTheme.backgroundOverlay}), url('${currentTheme.backgroundImage}')`
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

  const tabs = useMemo(
    () => [
      { value: "work", label: "Work" },
      { value: "short", label: "Short Break" },
      { value: "long", label: "Long Break" },
    ],
    []
  );

  const [showPomodoroInfo, setShowPomodoroInfo] = React.useState(false);

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

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (isRunning) pause();
          else start();
          break;
        default:
          switch (e.key.toLowerCase()) {
            case "f":
              if (!isMobile) {
                e.preventDefault();
                const target = document.getElementById(
                  "pomodoro-focus-section"
                );
                if (!target) return;

                // Check actual fullscreen state
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                  setFocusMode(false);
                } else {
                  target.requestFullscreen();
                  setFocusMode(true);
                }
              }
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
    [
      isRunning,
      pause,
      start,
      setFocusMode,
      currentTheme,
      isMobile,
      isTablet,
      focusMode,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  const [isExpanded, setIsExpanded] = useState(false);
  const audioPlayer = useAudioPlayer();

  const handleToggleExpand = () => setIsExpanded(!isExpanded);

  const handleSelectTrack = (track: any) => {
    const playlist = samplePlaylists.find((p) =>
      p.tracks.some((t) => t.id === track.id)
    );
    if (playlist) {
      audioPlayer.playTrack(track, playlist.tracks);
    }
  };

  const [todoOpen, setTodoOpen] = React.useState(false);
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
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

const handleAcceptNotifications = async () => {
  setShowNotifPrompt(false);
  localStorage.setItem("notifPromptDismissed", "true");
  
  const granted = await ensurePermission();
  if (granted) {
    setNotifications(true); // ✅ This turns ON the toggle in settings
  } else {
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
    setShowNotifPrompt(false);
  };

  return (
    <main
      className="min-h-dvh  overflow-x-hidden text-foreground transition-all duration-500 ease-in-out relative"
      style={{
        ...(currentTheme.backgroundImage && {
          backgroundColor: "#2a2f36",
          backgroundImage: currentTheme.backgroundOverlay
            ? `linear-gradient(${currentTheme.backgroundOverlay}, ${currentTheme.backgroundOverlay}), url('${currentTheme.backgroundImage}')`
            : `url('${currentTheme.backgroundImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
        }),
        ...(!currentTheme.backgroundImage && {
          background: currentTheme.background,
        }),
        color: currentTheme.digitColor,
      }}
    >
      <RegisterSW />

      <div className="flex flex-col min-h-dvh">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <div
            className={cn(
              "mx-auto w-full max-w-4xl px-3 sm:px-6 md:px-8",
              focusMode && "max-w-3xl"
            )}
          >
            {/* HEADER */}

            <header className="flex items-center justify-between gap-2 py-3 sm:py-4 md:py-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  fill="none"
                  stroke={color}
                  className="w-8 h-8  flex-shrink-0"
                  aria-hidden="true"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M13 2l.018 .001l.016 .001l.083 .005l.011 .002h.011l.038 .009l.052 .008l.016 .006l.011 .001l.029 .011l.052 .014l.019 .009l.015 .004l.028 .014l.04 .017l.021 .012l.022 .01l.023 .015l.031 .017l.034 .024l.018 .011l.013 .012l.024 .017l.038 .034l.022 .017l.008 .01l.014 .012l.036 .041l.026 .027l.006 .009c.12 .147 .196 .322 .218 .513l.001 .012l.002 .041l.004 .064v6h5a1 1 0 0 1 .868 1.497l-.06 .091l-8 11c-.568 .783 -1.808 .38 -1.808 -.588v-6h-5a1 1 0 0 1 -.868 -1.497l.06 -.091l8 -11l.01 -.013l.018 -.024l.033 -.038l.018 -.022l.009 -.008l.013 -.014l.04 -.036l.028 -.026l.008 -.006a1 1 0 0 1 .402 -.199l.011 -.001l.027 -.005l.074 -.013l.011 -.001l.041 -.002z" />
                </svg>

                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <h1
                    className="text-lg md:text-2xl font-semibold transition-colors duration-300 tracking-tight"
                    style={{
                      color: isImageTheme
                        ? currentTheme.background
                        : currentTheme.digitColor,
                      textShadow: isImageTheme
                        ? "0 2px 4px rgba(0,0,0,0.1)"
                        : "none",
                    }}
                  >
                    Focus Bolt
                  </h1>

                  {/* Vertical line separator */}
                  <span
                    className="hidden sm:inline-block w-[2px] h-6"
                    style={{
                      backgroundColor: color,
                    }}
                  />

                  <span
                    className="text-md  md:text-lg font-semibold transition-colors duration-300 tracking-tight"
                    style={{
                      color: isImageTheme
                        ? currentTheme.background
                        : currentTheme.digitColor,
                      opacity: 0.9,
                    }}
                  >
                    Work Sessions with Breaks
                  </span>
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setTodoOpen(true)}
                  className="hover:opacity-80 transition-opacity"
                  style={{
                    background: currentTheme.background,
                    color: currentTheme.digitColor,
                    border: `1px solid ${currentTheme.cardBorder}`,
                    cursor: "pointer",
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
                    <path d="M5 7.2a2.2 2.2 0 0 1 2.2 -2.2h1a2.2 2.2 0 0 0 1.55 -.64l.7 -.7a2.2 2.2 0 0 1 3.12 0l.7 .7c.412 .41 .97 .64 1.55 .64h1a2.2 2.2 0 0 1 2.2 2.2v1c0 .58 .23 1.138 .64 1.55l.7 .7a2.2 2.2 0 0 1 0 3.12l-.7 .7a2.2 2.2 0 0 0 -.64 1.55v1a2.2 2.2 0 0 1 -2.2 2.2h-1a2.2 2.2 0 0 0 -1.55 .64l-.7 .7a2.2 2.2 0 0 1 -3.12 0l-.7 -.7a2.2 2.2 0 0 0 -1.55 -.64h-1a2.2 2.2 0 0 1 -2.2 -2.2v-1a2.2 2.2 0 0 0 -.64 -1.55l-.7 -.7a2.2 2.2 0 0 1 0 -3.12l.7 -.7a2.2 2.2 0 0 0 .64 -1.55v-1" />
                    <path d="M9 12l2 2l4 -4" />
                  </svg>
                  Tasks
                </Button>
                <ColorPicker
                  currentTheme={currentTheme}
                  onThemeChange={setCurrentTheme}
                  variant="header"
                />
                <Button
                  variant="outline"
                  onClick={() => setSettingsOpen(true)}
                  className="hover:opacity-80 transition-opacity"
                  style={{
                    background: currentTheme.background,
                    color: currentTheme.digitColor,
                    border: `1px solid ${currentTheme.cardBorder}`,
                    cursor: "pointer",
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
              </div>

              {/* Mobile/Tablet Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg transition-opacity hover:opacity-80"
                style={{
                  background: isImageTheme
                    ? "rgba(255,255,255,0.15)"
                    : currentTheme.cardBackground,
                  border: `1px solid ${currentTheme.cardBorder}`,
                }}
                aria-label="Toggle menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {mobileMenuOpen ? (
                    <>
                      <path d="M18 6l-12 12" />
                      <path d="M6 6l12 12" />
                    </>
                  ) : (
                    <>
                      <path d="M4 6h16" />
                      <path d="M4 12h16" />
                      <path d="M4 18h16" />
                    </>
                  )}
                </svg>
              </button>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[35] md:hidden"
                  />

                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="fixed right-0 top-0 h-full w-64 z-[36] md:hidden shadow-2xl overflow-y-auto"
                    style={{
                      background: currentTheme.background,
                      borderLeft: `1px solid ${currentTheme.cardBorder}`,
                    }}
                  >
                    <div className="flex flex-col min-h-full p-6 gap-4">
                      <div className="flex items-center justify-between mb-4">
                        <h2
                          className="text-lg font-semibold"
                          style={{ color: currentTheme.digitColor }}
                        >
                          Menu
                        </h2>
                        <button
                          onClick={() => setMobileMenuOpen(false)}
                          className="p-2 hover:opacity-70 transition-opacity"
                          aria-label="Close menu"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={currentTheme.digitColor}
                            strokeWidth="2"
                          >
                            <path d="M18 6l-12 12" />
                            <path d="M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setTodoOpen(true);
                          }}
                          className="flex items-center gap-3 p-3 rounded-lg transition-opacity hover:opacity-80"
                          style={{
                            background: currentTheme.cardBackground,
                            border: `1px solid ${currentTheme.cardBorder}`,
                            color: currentTheme.digitColor,
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M9 11l3 3l8 -8" />
                            <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9" />
                          </svg>
                          <span className="font-medium">Tasks</span>
                        </button>

                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setSettingsOpen(true);
                          }}
                          className="flex items-center gap-3 p-3 rounded-lg transition-opacity hover:opacity-80"
                          style={{
                            background: currentTheme.cardBackground,
                            border: `1px solid ${currentTheme.cardBorder}`,
                            color: currentTheme.digitColor,
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
                            <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                          </svg>
                          <span className="font-medium">Settings</span>
                        </button>
                      </div>

                      <div className="w-full">
                        <ColorPicker
                          currentTheme={currentTheme}
                          onThemeChange={(theme) => {
                            setCurrentTheme(theme);
                          }}
                          variant="mobile"
                        />
                      </div>
                      <div
                        className="mt-auto p-3 rounded-lg text-xs"
                        style={{
                          background: `${currentTheme.cardBorder}20`,
                          color: currentTheme.separatorColor,
                        }}
                      >
                        <p className="opacity-80">
                          💡 Focus Mode is available on tablet and desktop
                          devices only.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* MAIN CONTENT */}
            <section className="flex-1 pb-2">
              <Card
                id="pomodoro-focus-section"
                className={cn(
                  "relative transition-all duration-300",
                  focusMode && "fullscreen-mode"
                )}
                style={{
                  background: "transparent",
                  border: "none",
                  boxShadow: "none",
                }}
              >
                <CardHeader className="pb-2 sm:pb-3 md:pb-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    {!focusMode && (
                      <CardTitle
                        onClick={() => setShowPomodoroInfo(true)}
                        className="cursor-pointer text-lg tracking-tight underline hover:opacity-80 transition-opacity"
                        style={{
                          color: isImageTheme
                            ? currentTheme.background
                            : currentTheme.digitColor,
                          textShadow: isImageTheme
                            ? "0 2px 4px rgba(0,0,0,0.1)"
                            : "none",
                        }}
                      >
                        Pomodoro ?
                      </CardTitle>
                    )}

                    <PomodoroInfoModal
                      isOpen={showPomodoroInfo}
                      onClose={() => setShowPomodoroInfo(false)}
                      currentTheme={currentTheme}
                    />

                    <div className="w-full sm:w-auto">
                      <div
                        className="flex rounded-lg p-1 shadow-[0_3px_10px_rgb(0,0,0,0.2)] w-full sm:w-auto"
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
                            } relative rounded-md px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium transition-colors flex-1 sm:flex-none`}
                            style={{
                              color:
                                viewMode === tab.value
                                  ? currentTheme.digitColor
                                  : `${currentTheme.digitColor}80`,
                              WebkitTapHighlightColor: "transparent",
                            }}
                            aria-label={`Switch to ${tab.label}`}
                          >
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
                            <span className="relative z-10 whitespace-nowrap">
                              {tab.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col items-center gap-1 px-2 sm:px-4 md:px-6 relative">
                  {/* RESET BUTTON */}
                  {!focusMode && (
                    <button
                      onClick={reset}
                      aria-label="Reset"
                      className="absolute p-1.5 sm:p-2 rounded-full focus:outline-none z-10 hover:opacity-80 transition-opacity"
                      style={{
                        top: isTablet ? "60px" : isMobile ? "15px" : "25px",
                        right: isTablet ? "10px" : isMobile ? "1px" : "50px",
                        background: isImageTheme
                          ? "rgba(255,255,255,0.82)"
                          : currentTheme.background,
                        color: currentTheme.digitColor,
                        border: `1px solid ${currentTheme.cardBorder}`,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                        width: isMobile ? 36 : 40,
                        height: isMobile ? 36 : 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                      title="Reset"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="sm:w-5 sm:h-5"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M19.933 13.041a8 8 0 1 1 -9.925 -8.788c3.899 -1 7.935 1.007 9.425 4.747" />
                        <path d="M20 4v5h-5" />
                      </svg>
                    </button>
                  )}

                  {/* FLIP CLOCK  && Ripple effect*/}
                  <div className="relative w-full flex items-center justify-center">
                    {/* Ripple positioned relative to clock container */}
                    {(mode === "short" || mode === "long") && (
                      <div className="absolute inset-0 overflow-hidden rounded-xl">
                        <Ripple
                          mainSize={isMobile ? 250 : isTablet ? 350 : 400}
                          mainOpacity={isImageTheme ? 0.75 : 0.55}
                          numWaves={isMobile ? 4 : isTablet ? 5 : 6}
                          currentTheme={currentTheme}
                          className="absolute inset-0 z-0 pointer-events-none"
                        />
                      </div>
                    )}
                    <div className=" relative z-10 scale-[0.6] min-[640px]:scale-[0.95] min-[768px]:scale-100 min-[1024px]:scale-110">
                      <FlipClock
                        seconds={remaining}
                        theme={currentTheme}
                        ariaLabel={`${modeLabel(mode)} time remaining`}
                      />
                    </div>
                  </div>

                  {/* QUOTE */}
                  <div
                    className=" hidden sm:block transition-colors duration-300 text-center px-2 sm:px-4 mt-2"
                    style={{ color: currentTheme.separatorColor, opacity: 0.8 }}
                  >
                    <SessionQuote currentTheme={currentTheme} />
                  </div>

                  {/* CONTROL BUTTONS */}
                  <div
                    className={cn(
                      "flex items-center justify-center gap-4",
                      isTablet ? "mt-6" : "mt-0"
                    )}
                  >
                    {isRunning ? (
                      <Button
                        size="xl"
                        onClick={pause}
                        className="relative px-6 transition-all duration-200 hover:opacity-80"
                        title="Press Space to start/pause timer"
                        style={{
                          background: `${currentTheme.background}`,
                          color: currentTheme.digitColor,
                          border: isImageTheme
                            ? `1px solid ${currentTheme.digitColor}`
                            : `1px solid ${color}`,
                          boxShadow: isImageTheme
                            ? "4px 4px 0 0 rgba(255,255,255,0.78)"
                            : `4px 4px 0 0 ${color}`,
                          cursor: "pointer",
                        }}
                      >
                        Pause
                      </Button>
                    ) : (
                      <Button
                        size="xl"
                        onClick={start}
                        className="relative px-6 transition-all duration-200 hover:opacity-80"
                        title="Press Space to start/pause timer"
                        style={{
                          background: `${currentTheme.background}`,
                          color: currentTheme.digitColor,
                          border: isImageTheme
                            ? `1px solid ${currentTheme.digitColor}`
                            : `1px solid ${color}`,
                          boxShadow: isImageTheme
                            ? "4px 4px 0 0 rgba(255,255,255,0.78)"
                            : `4px 4px 0 0 ${color}`,
                          cursor: "pointer",
                        }}
                      >
                        Start
                      </Button>
                    )}

                    {/* focus toggle */}
                    <div className="">
                      <FocusToggleIcon currentTheme={currentTheme} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <ExpandedPlayer
                isExpanded={isExpanded}
                currentTheme={currentTheme}
                playlists={samplePlaylists}
                currentTrack={audioPlayer.currentTrack}
                onSelectTrack={handleSelectTrack}
                onClose={() => setIsExpanded(false)}
              />
            </section>
          </div>
        </div>

        {/* MUSIC BAR - STICKY BOTTOM */}
        <div
          className="sticky bottom-7 left-0 right-0 z-30 w-full"
          style={{ marginTop: "auto" }}
        >
          <div
            className={cn(
              "mx-auto w-full max-w-4xl px-3 sm:px-6 md:px-8",
              focusMode && "max-w-3xl"
            )}
          >
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
                if (
                  samplePlaylists.length > 0 &&
                  samplePlaylists[0].tracks.length > 0
                ) {
                  const firstTrack = samplePlaylists[0].tracks[0];
                  handleSelectTrack(firstTrack);
                }
              }}
            />
          </div>
        </div>
        <footer
          className="  text-center"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <p
            className="text-sm font-light backdrop-blur-sm py-2 px-4 rounded-full inline-block transition-colors duration-300 opacity-80"
            style={{
              color: isImageTheme
                ? currentTheme.background
                : currentTheme.digitColor,
            }}
          >
            Made with ❤️ by{" "}
            <a
              href="https://github.com/keshav-builds"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-100 transition-opacity duration-200 underline"
            >
              Keshav
            </a>
          </p>
        </footer>
      </div>

      {/* MODALS */}
      {todoOpen && (
        <>
          <div
            className="fixed inset-0 z-40 backdrop-blur-[2px]"
            style={{
              backgroundColor: isImageTheme
                ? "rgba(0, 0, 0, 0.35)"
                : "rgba(0, 0, 0, 0.25)",
            }}
            onClick={() => setTodoOpen(false)}
          />
          <TodoList
            open={todoOpen}
            onOpenChange={setTodoOpen}
            currentTheme={currentTheme}
          />
        </>
      )}

      {settingsOpen && (
        <SettingsSheet
          currentTheme={currentTheme}
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
      )}

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
          />
          <NotificationPrompt
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 2000,
              maxWidth: "90vw",
              width: "360px",
            }}
            currentTheme={currentTheme}
            onAccept={handleAcceptNotifications}
            onDismiss={handleDismissNotifications}
            onClose={handleClose}
          />
        </>
      )}
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
          position: "fixed",
          top: 0,
          left: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
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
