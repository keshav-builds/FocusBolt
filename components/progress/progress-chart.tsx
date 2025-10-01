"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { CardDescription } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getWeeklyData, isDataEqual, type DayData } from "@/lib/progress";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-black rounded-lg px-3 py-2 shadow-xl text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div>
            <p className="text-gray-500 dark:text-white text-xs font-medium">
              {label}
            </p>
            <p className="text-gray-900 dark:text-white font-semibold">
              {data.value} session{data.value !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const MemoizedBarChart = memo(({ data }: { data: DayData[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
      <XAxis
        dataKey="label"
        tick={{ fontSize: 12, fontWeight: 500 }}
        axisLine={{ stroke: "#374151", strokeWidth: 1 }}
        tickLine={{ stroke: "#374151", strokeWidth: 1 }}
        height={50}
        className="dark:fill-white"
      />
      <YAxis
        allowDecimals={false}
        tick={{ fontSize: 12, fontWeight: 500 }}
        axisLine={{ stroke: "#374151", strokeWidth: 1 }}
        tickLine={{ stroke: "#374151", strokeWidth: 1 }}
        width={50}
        domain={[0, "dataMax + 2"]}
        className="dark:fill-white"
      />
      <Tooltip
        content={<CustomTooltip />}
        cursor={false}
        wrapperStyle={{ outline: "none" }}
      />
      <Bar
        dataKey="sessions"
        fill="#FFD700"
        radius={[4, 4, 0, 0]}
        maxBarSize={50}
      />
    </BarChart>
  </ResponsiveContainer>
));

export const ProgressChart = memo(() => {
  const [data, setData] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const updateData = useCallback(() => {
    try {
      const newData = getWeeklyData();
      const validatedData = newData.map((item) => ({
        label: item.label || "Unknown",
        sessions: typeof item.sessions === "number" ? item.sessions : 0,
      }));

      setData((prevData) =>
        isDataEqual(prevData, validatedData) ? prevData : validatedData
      );
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setData([
        { label: "Mon", sessions: 0 },
        { label: "Tue", sessions: 0 },
        { label: "Wed", sessions: 0 },
        { label: "Thu", sessions: 0 },
        { label: "Fri", sessions: 0 },
        { label: "Sat", sessions: 0 },
        { label: "Sun", sessions: 0 },
      ]);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    updateData();
  }, [updateData]);

  useEffect(() => {
    const handleProgressUpdate = () => updateData();
    if (typeof window !== "undefined") {
      window.addEventListener("progressUpdate", handleProgressUpdate);
      return () =>
        window.removeEventListener("progressUpdate", handleProgressUpdate);
    }
  }, [updateData]);

  useEffect(() => {
    const interval = setInterval(updateData, 30000);
    return () => clearInterval(interval);
  }, [updateData]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <CardDescription>Completed work sessions (last 7 days)</CardDescription>
        <div className="h-[260px] flex items-center justify-center text-gray-500 dark:text-white">
          Loading chart...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CardDescription>Completed work sessions (last 7 days)</CardDescription>
      <div className="w-full h-[260px] p-4">
        <MemoizedBarChart data={data} />
      </div>
    </div>
  );
});
