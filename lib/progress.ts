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

  if (typeof window !== "undefined") {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("progressUpdate"));
    }, 0);
  }
}

function getAll(): ProgressEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ProgressEvent[]) : [];
  } catch {
    return [];
  }
}

function saveAll(events: ProgressEvent[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(events));
  } catch {
    // ignore
  }
}

export function getWeeklyDataTotalMinutes(): DayData[] {
  const events = getAll();
  const now = new Date();
  const last7Days: DayData[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    let totalSeconds = 0;
    for (const e of events) {
      const eventDate = new Date(e.at ?? Date.now());
      if (eventDate >= dayStart && eventDate <= dayEnd && e.type === "work") {
        totalSeconds += e.seconds;
      }
    }

    last7Days.push({
      label: dayLabel,
      totalMinutes: Math.round(totalSeconds / 60),
    });
  }

  return last7Days;
}

export function getTodayTotalMinutes(): number {
  const events = getAll();
  const now = new Date();

  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(now);
  dayEnd.setHours(23, 59, 59, 999);

  let totalSeconds = 0;
  for (const e of events) {
    const eventDate = new Date(e.at ?? Date.now());
    if (eventDate >= dayStart && eventDate <= dayEnd && e.type === "work") {
      totalSeconds += e.seconds;
    }
  }

  return Math.round(totalSeconds / 60);
}

export function isDataEqual(data1: DayData[], data2: DayData[]): boolean {
  if (!data1 || !data2 || data1.length !== data2.length) return false;
  return data1.every((item, index) => {
    const other = data2[index];
    return item?.label === other?.label && item?.totalMinutes === other?.totalMinutes;
  });
}
