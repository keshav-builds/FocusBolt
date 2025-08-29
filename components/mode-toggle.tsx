"use client"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <Button
      variant="outline"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle light/dark mode"
      title="Toggle Theme"
    >
      {isDark ? "Light" : "Dark"}
    </Button>
  )
}
