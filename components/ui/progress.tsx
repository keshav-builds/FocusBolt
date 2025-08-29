"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

export function Progress({ value = 0, className, ...props }: React.ComponentProps<"div"> & { value?: number }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <div
        className="h-full w-0 rounded-full bg-primary transition-[width] duration-300 ease-out"
        style={{ width: `${v}%`, transition: "width 0.3s ease-out" }}
      />
    </div>
  )
}
