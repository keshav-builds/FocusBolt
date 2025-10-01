"use client";

import { useEffect, useState, useCallback, memo } from "react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { getWeeklyDataTotalMinutes, isDataEqual } from "@/lib/progress";
import { ColorTheme } from "@/lib/theme";

interface ProgressChartProps {
  currentTheme: ColorTheme;
}

type DayData = {
  label: string;
  totalMinutes: number;
};

// Helper function to format minutes to hours and minutes
const formatMinutesToTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
};

// Get color based on work time (gradient from low to high)
const getBarColor = (
  minutes: number,
  maxMinutes: number,
  isImageTheme: boolean
) => {
  if (maxMinutes === 0) {
    return isImageTheme ? "rgba(255, 255, 255, 0.15)" : "#E5E7EB";
  }

  const ratio = minutes / maxMinutes;

  if (ratio < 0.33) return "#EF4444"; // Red - lowest turnout
  if (ratio < 0.66) return "#94A3B8"; // Gray - average
  return "#3B82F6"; // Blue - highest turnout
};

const CustomTooltip = ({
  active,
  payload,
  label,
  isImageTheme,
}: any) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0];
    const formattedTime = formatMinutesToTime(data.value);
    return (
      <div
        className="rounded-lg px-3 py-2 shadow-lg border"
        style={{
          backgroundColor: isImageTheme
            ? "rgba(0, 0, 0, 0.9)"
            : "rgba(255, 255, 255, 1)",
          borderColor: isImageTheme
            ? "rgba(255, 255, 255, 0.3)"
            : "#e5e7eb",
        }}
      >
        <p
          className="text-xs font-medium mb-1"
          style={{
            color: isImageTheme ? "rgba(255, 255, 255, 0.8)" : "#6b7280",
          }}
        >
          {label}
        </p>
        <p
          className="font-bold text-sm"
          style={{
            color: isImageTheme ? "rgba(255, 255, 255, 0.95)" : "#111827",
          }}
        >
          {formattedTime}
        </p>
      </div>
    );
  }
  return null;
};

// Custom label component for bars
const renderCustomLabel = (
  props: any,
  isImageTheme: boolean,
  digitColor: string
) => {
  const { x, y, width, height, value } = props;

  if (value === 0) return null;

  const formattedValue = formatMinutesToTime(value);

  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      fill={isImageTheme ? "rgba(255, 255, 255, 0.9)" : digitColor}
      fontSize={12}
      fontWeight={600}
      textAnchor="start"
      dominantBaseline="middle"
    >
      {formattedValue}
    </text>
  );
};

const MemoizedBarChart = memo(
  ({
    data,
    isImageTheme,
    digitColor,
    separatorColor,
  }: {
    data: DayData[];
    isImageTheme: boolean;
    digitColor: string;
    separatorColor: string;
  }) => {
    const maxMinutes = Math.max(...data.map((d) => d.totalMinutes));

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 80, left: 5, bottom: 5 }}
          barCategoryGap="12%"
        >
          <XAxis
            type="number"
            domain={[0, maxMinutes > 0 ? maxMinutes + 20 : 120]}
            tick={{
              fontSize: 11,
              fontWeight: 500,
              fill: isImageTheme ? "rgba(255, 255, 255, 0.7)" : separatorColor,
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => {
              if (value >= 60) {
                return `${Math.floor(value / 60)}h`;
              }
              return value === 0 ? "0" : `${value}m`;
            }}
          />
          <YAxis
            dataKey="label"
            type="category"
            tick={{
              fontSize: 12,
              fontWeight: 500,
              fill: isImageTheme ? "rgba(255, 255, 255, 0.85)" : digitColor,
            }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip
            content={<CustomTooltip isImageTheme={isImageTheme} />}
            cursor={{
              fill: isImageTheme
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0,0,0,0.03)",
            }}
            wrapperStyle={{ outline: "none" }}
          />
          <Bar dataKey="totalMinutes" radius={[0, 4, 4, 0]} barSize={24}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(entry.totalMinutes, maxMinutes, isImageTheme)}
              />
            ))}
            <LabelList
              dataKey="totalMinutes"
              content={(props) =>
                renderCustomLabel(props, isImageTheme, digitColor)
              }
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }
);

MemoizedBarChart.displayName = "MemoizedBarChart";

// Empty State Component
const EmptyState = ({
  isImageTheme,
  digitColor,
  separatorColor,
}: {
  isImageTheme: boolean;
  digitColor: string;
  separatorColor: string;
}) => (
  <div className="flex flex-col items-center justify-center h-[280px] space-y-4">
    <div className="relative">
      <svg
        className="w-16 h-16"
        fill="none"
        viewBox="0 0 24 24"
        stroke={isImageTheme ? "rgba(255, 255, 255, 0.3)" : separatorColor}
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
        <svg
          className="w-3 h-3 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
    </div>
    <div className="text-center space-y-2">
      <h4
        className="text-sm font-semibold"
        style={{
          color: isImageTheme ? "rgba(255, 255, 255, 0.95)" : digitColor,
        }}
      >
        No work sessions yet
      </h4>
      <p
        className="text-xs max-w-[240px]"
        style={{
          color: isImageTheme ? "rgba(255, 255, 255, 0.7)" : separatorColor,
        }}
      >
        Start a work session to track your deep work time and build your
        productivity streak!
      </p>
    </div>
    <div
      className="flex items-center gap-2 px-3 py-2 border rounded-lg"
      style={{
        backgroundColor: isImageTheme
          ? "rgba(59, 130, 246, 0.15)"
          : "rgba(239, 246, 255, 1)",
        borderColor: isImageTheme
          ? "rgba(59, 130, 246, 0.3)"
          : "rgba(191, 219, 254, 1)",
      }}
    >
      <svg
        className="w-4 h-4"
        fill={isImageTheme ? "rgba(96, 165, 250, 1)" : "#2563eb"}
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
      <span
        className="text-xs font-medium"
        style={{
          color: isImageTheme ? "rgba(147, 197, 253, 1)" : "#1e40af",
        }}
      >
        Click Start to begin your first session
      </span>
    </div>
  </div>
);

export const ProgressChart = memo(({ currentTheme }: ProgressChartProps) => {
  const [data, setData] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isImageTheme = Boolean(currentTheme.backgroundImage);

  const updateData = useCallback(() => {
    try {
      const newData = getWeeklyDataTotalMinutes();

      // Validate data
      const validatedData = newData.map((item) => ({
        label: item.label || "Unknown",
        totalMinutes:
          typeof item.totalMinutes === "number" ? item.totalMinutes : 0,
      }));

      setData((prevData) =>
        isDataEqual(prevData, validatedData) ? prevData : validatedData
      );
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching chart data:", error);

      // Fallback data with proper day ordering
      const fallbackData: DayData[] = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const label = d.toLocaleDateString("en-US", { weekday: "short" });
        fallbackData.push({ label, totalMinutes: 0 });
      }

      setData(fallbackData);
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

  const totalMinutes = data.reduce((sum, d) => sum + d.totalMinutes, 0);
  const hasData = totalMinutes > 0;

  if (isLoading) {
    return (
      <div
        className="w-full space-y-4 p-4 sm:p-6 rounded-2xl border"
        style={{
          backgroundColor: isImageTheme
            ? "rgba(255, 255, 255, 0.08)"
            : `${currentTheme.background}20`,
          borderColor: isImageTheme
            ? "rgba(255, 255, 255, 0.2)"
            : currentTheme.cardBorder,
        }}
      >
        <div className="space-y-2">
          <h3
            className="text-base font-semibold"
            style={{
              color: isImageTheme
                ? "rgba(255, 255, 255, 0.95)"
                : currentTheme.digitColor,
            }}
          >
            Weekly Progress
          </h3>
          <p
            className="text-sm"
            style={{
              color: isImageTheme
                ? "rgba(255, 255, 255, 0.7)"
                : currentTheme.separatorColor,
            }}
          >
            Deep work time (last 7 days)
          </p>
        </div>
        <div className="h-[280px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 border-3 rounded-full animate-spin"
              style={{
                borderColor: isImageTheme
                  ? "rgba(255, 255, 255, 0.2)"
                  : `${currentTheme.cardBorder}40`,
                borderTopColor: isImageTheme
                  ? "rgba(255, 255, 255, 0.8)"
                  : currentTheme.digitColor,
              }}
            />
            <p
              className="text-sm"
              style={{
                color: isImageTheme
                  ? "rgba(255, 255, 255, 0.7)"
                  : currentTheme.separatorColor,
              }}
            >
              Loading...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full space-y-4 p-4 sm:p-6 rounded-2xl border"
      style={{
        backgroundColor: isImageTheme
          ? "rgba(255, 255, 255, 0.08)"
          : `${currentTheme.background}20`,
        borderColor: isImageTheme
          ? "rgba(255, 255, 255, 0.2)"
          : currentTheme.cardBorder,
      }}
    >
      {/* Header */}
      <div className="space-y-1">
        <h3
          className="text-base sm:text-lg font-semibold"
          style={{
            color: isImageTheme
              ? "rgba(255, 255, 255, 0.95)"
              : currentTheme.digitColor,
          }}
        >
          Weekly Progress
        </h3>
        <p
          className="text-xs sm:text-sm"
          style={{
            color: isImageTheme
              ? "rgba(255, 255, 255, 0.7)"
              : currentTheme.separatorColor,
          }}
        >
          Deep work time (last 7 days)
        </p>
      </div>

      {/* Show Empty State or Chart */}
      {!hasData ? (
        <EmptyState
          isImageTheme={isImageTheme}
          digitColor={currentTheme.digitColor}
          separatorColor={currentTheme.separatorColor}
        />
      ) : (
        <>
          {/* Legend */}
          <div className="flex items-center justify-center sm:justify-start gap-4 text-xs sm:text-sm pb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-red-500" />
              <span
                style={{
                  color: isImageTheme
                    ? "rgba(255, 255, 255, 0.8)"
                    : currentTheme.separatorColor,
                }}
              >
                lowest
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-gray-400" />
              <span
                style={{
                  color: isImageTheme
                    ? "rgba(255, 255, 255, 0.8)"
                    : currentTheme.separatorColor,
                }}
              >
                average
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-blue-500" />
              <span
                style={{
                  color: isImageTheme
                    ? "rgba(255, 255, 255, 0.8)"
                    : currentTheme.separatorColor,
                }}
              >
                highest
              </span>
            </div>
          </div>

          {/* Horizontal Bar Chart */}
          <div className="w-full h-[260px] sm:h-[280px]">
            <MemoizedBarChart
              data={data}
              isImageTheme={isImageTheme}
              digitColor={currentTheme.digitColor}
              separatorColor={currentTheme.separatorColor}
            />
          </div>

          {/* Total Summary */}
          <div
            className="pt-2 border-t"
            style={{
              borderColor: isImageTheme
                ? "rgba(255, 255, 255, 0.15)"
                : currentTheme.cardBorder,
            }}
          >
            <div className="flex items-center justify-between text-sm">
              <span
                style={{
                  color: isImageTheme
                    ? "rgba(255, 255, 255, 0.8)"
                    : currentTheme.separatorColor,
                }}
              >
                Total this week
              </span>
              <span
                className="font-semibold"
                style={{
                  color: isImageTheme
                    ? "rgba(255, 255, 255, 0.95)"
                    : currentTheme.digitColor,
                }}
              >
                {formatMinutesToTime(totalMinutes)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

ProgressChart.displayName = "ProgressChart";
