"use client"

import { useEffect, useState } from "react"
import { CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { getWeeklyData } from "@/lib/progress"

type DayData = { label: string; sessions: number }

export function ProgressChart() {
  const [data, setData] = useState<DayData[]>([])

  useEffect(() => {
    setData(getWeeklyData())
    const i = setInterval(() => setData(getWeeklyData()), 5000)
    return () => clearInterval(i)
  }, [])

  return (
    <div className="space-y-4">
      <CardDescription>Completed work sessions (last 7 days)</CardDescription>
      <ChartContainer
        config={{
          sessions: { label: "Sessions", color: "hsl(var(--chart-1))" },
        }}
        className="h-[220px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="sessions" fill="#FFD700" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
