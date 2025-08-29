"use client"

import { useEffect, useState } from "react"

export function useVisibility() {
  const [state, setState] = useState<"visible" | "hidden">(
    typeof document !== "undefined" && document.visibilityState === "hidden" ? "hidden" : "visible",
  )
  useEffect(() => {
    const onVis = () => setState(document.visibilityState === "hidden" ? "hidden" : "visible")
    document.addEventListener("visibilitychange", onVis)
    return () => document.removeEventListener("visibilitychange", onVis)
  }, [])
  return state
}
