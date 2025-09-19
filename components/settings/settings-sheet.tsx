"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  currentTheme: ColorTheme; // ← new prop
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
    autoResumeOnFocus,
    setAutoResumeOnFocus,
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

  /* -------------------- render -------------------- */
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          style={{
            background: "transparent",
            color: currentTheme.digitColor,
            border: `1px solid ${currentTheme.cardBorder}`,
          }}
        >
          Settings
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[420px] max-w-full"
        style={{
          backgroundColor: currentTheme.background,
          borderLeft: `1px solid ${currentTheme.cardBorder}`,
          color: currentTheme.digitColor,
          boxShadow: currentTheme.shadow,
        }}
      >
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Customize sessions and behavior</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-4">
          {/* durations */}
          <fieldset className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="work">Work (min)</Label>
            <Input
              id="work"
              type="number"
              min={1}
              max={180}
              value={work}
              onChange={(e) => setWork(Number(e.target.value))}
              className="col-span-2"
            />
            <Label htmlFor="short">Short break (min)</Label>
            <Input
              id="short"
              type="number"
              min={1}
              max={60}
              value={shortB}
              onChange={(e) => setShortB(Number(e.target.value))}
              className="col-span-2"
            />
            <Label htmlFor="long">Long break (min)</Label>
            <Input
              id="long"
              type="number"
              min={1}
              max={120}
              value={longB}
              onChange={(e) => setLongB(Number(e.target.value))}
              className="col-span-2"
            />
          </fieldset>

          {/* long-break interval */}
          <fieldset className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="interval">Long break every</Label>
            <Input
              id="interval"
              type="number"
              min={2}
              max={12}
              value={longInt}
              onChange={(e) => setLongInt(Number(e.target.value))}
              className="col-span-2"
            />
          </fieldset>

          {/* clock format */}
          <fieldset className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="clock">Clock format</Label>
            <div className="col-span-2">
              <Select
                value={timeFormat}
                onValueChange={(v) => setTimeFormat(v as "12h" | "24h")}
              >
                <SelectTrigger id="clock" aria-label="Clock format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24-hour</SelectItem>
                  <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </fieldset>

          {/* switches */}
          <fieldset className="space-y-3">
            {/* Auto-start */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto start next session</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically begin the next work/break session
                </p>
              </div>
              <Switch
                checked={autoStartNext}
                onCheckedChange={setAutoStartNext}
              />
            </div>

            {/* Auto-pause */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-pause on tab switch</Label>
                <p className="text-xs text-muted-foreground">
                  Pause when the tab is hidden
                </p>
              </div>
              <Switch
                checked={autoPauseOnBlur}
                onCheckedChange={setAutoPauseOnBlur}
              />
            </div>

            {/* Auto-resume */}
            {/* not required */}

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Desktop notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Show alerts when sessions end
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={notifications}
                  onCheckedChange={(b) =>
                    b ? requestNotif() : setNotifications(false)
                  }
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={requestNotif}
                  style={{
                    backgroundColor: currentTheme.background,
                    color: currentTheme.digitColor,
                    border: `1px solid ${currentTheme.cardBorder}`,
                  }}
                >
                  Enable
                </Button>
              </div>
            </div>
          </fieldset>
        </div>

        <SheetFooter className="mt-6">
          <Button
            onClick={save}
            style={{
              backgroundColor: currentTheme.digitColor,
              color: currentTheme.background,
              border: `1px solid ${currentTheme.cardBorder}`,
            }}
          >
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function clampMins(n: number) {
  if (Number.isNaN(n)) return 1;
  return Math.max(1, Math.min(180, Math.round(n)));
}
