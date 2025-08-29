type ProgressEvent = {
  type: "work"
  seconds: number
  at?: number
}

const KEY = "pomodoro:progress"

export function addProgressEvent(evt: ProgressEvent) {
  const data = getAll()
  data.push({ ...evt, at: evt.at ?? Date.now() })
  saveAll(data)
}

export function markTodayWorkComplete() {
  addProgressEvent({ type: "work", seconds: 0 })
}

function getAll(): ProgressEvent[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ProgressEvent[]) : []
  } catch {
    return []
  }
}

function saveAll(events: ProgressEvent[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(events))
  } catch {}
}

export function getWeeklyData() {
  const events = getAll()
  const now = new Date()
  const days: { label: string; sessions: number; dateKey: string }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const label = d.toLocaleDateString(undefined, { weekday: "short" })
    const dateKey = d.toISOString().slice(0, 10)
    days.push({ label, sessions: 0, dateKey })
  }
  for (const e of events) {
    const dateKey = new Date(e.at ?? Date.now()).toISOString().slice(0, 10)
    const hit = days.find((d) => d.dateKey === dateKey)
    if (hit && e.type === "work") hit.sessions += 1
  }
  return days.map((d) => ({ label: d.label, sessions: d.sessions }))
}
