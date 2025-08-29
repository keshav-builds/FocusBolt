"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { getRandomQuote } from "@/lib/quotes"
import { usePomodoro } from "./pomodoro-provider"

export function SessionQuote() {
  const [visible, setVisible] = useState(false)
  const [quote, setQuote] = useState(getRandomQuote())
  const { start } = usePomodoro()

  useEffect(() => {
    let raf: number
    const check = () => {
      if (window.localStorage.getItem("pomodoro:quote:show") === "1") {
        setQuote(getRandomQuote())
        setVisible(true)
        window.localStorage.removeItem("pomodoro:quote:show")
      }
    }
    check()
    // slight delay helps render order after state transition
    raf = requestAnimationFrame(check)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-background/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-lg">
        <p className="text-balance text-center text-lg font-medium">&ldquo;{quote.text}&rdquo;</p>
        <p className="mt-2 text-center text-sm text-muted-foreground">— {quote.author}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            onClick={() => {
              setVisible(false)
              start()
            }}
          >
            Start Next Session
          </Button>
          <Button variant="ghost" onClick={() => setVisible(false)}>
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  )
}
