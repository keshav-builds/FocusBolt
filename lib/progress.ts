type ProgressEvent = {
  type: "work";
  seconds: number;
  at?: number;
};

export type DayData = {
  label: string;
  totalMinutes: number;
};

const KEY = "pomodoro:progress";

export function addProgressEvent(evt: ProgressEvent) {
  const data = getAll();
  data.push({ ...evt, at: evt.at ?? Date.now() });
  saveAll(data);

  // Defer event dispatch to avoid render-phase updates
  if (typeof window !== "undefined") {
    // Use setTimeout to dispatch after current execution cycle
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("progressUpdate"));
    }, 0);
  }
}

export function markTodayWorkComplete() {
  addProgressEvent({ type: "work", seconds: 0 });
}

function getAll(): ProgressEvent[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ProgressEvent[]) : [];
  } catch (error) {
    console.warn("Failed to parse progress data:", error);
    return [];
  }
}

function saveAll(events: ProgressEvent[]) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(KEY, JSON.stringify(events));
  } catch (error) {
    console.error("Failed to save progress data:", error);
  }
}

export function getWeeklyDataTotalMinutes(): DayData[] {
  const events = getAll();
  const now = new Date();
  
  // Define fixed week order: Mon to Sun
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  // Create a map to accumulate work time by day of week
  const dayMap = new Map<string, number>();
  weekDays.forEach(day => dayMap.set(day, 0));
  
  // Get date range for last 7 days
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  
  // Accumulate work time for each event in last 7 days
  for (const e of events) {
    const eventDate = new Date(e.at ?? Date.now());
    
    // Only include events from last 7 days
    if (eventDate >= sevenDaysAgo && eventDate <= now && e.type === "work") {
      const dayName = eventDate.toLocaleDateString("en-US", { weekday: "short" });
      const currentSeconds = dayMap.get(dayName) || 0;
      dayMap.set(dayName, currentSeconds + e.seconds);
    }
  }
  
  // Return in fixed Mon-Sun order
  return weekDays.map(day => ({
    label: day,
    totalMinutes: Math.round((dayMap.get(day) || 0) / 60),
  }));
}

// Helper function to compare data arrays
export function isDataEqual(data1: DayData[], data2: DayData[]): boolean {
  if (!data1 || !data2 || data1.length !== data2.length) return false;

  return data1.every((item, index) => {
    const other = data2[index];
    return (
      item?.label === other?.label &&
      item?.totalMinutes === other?.totalMinutes
    );
  });
}
