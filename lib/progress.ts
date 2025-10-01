type ProgressEvent = {
  type: "work"
  seconds: number
  at?: number
}
 
export type DayData = { 
  label: string
  sessions: number 
}

const KEY = "pomodoro:progress"

export function addProgressEvent(evt: ProgressEvent) {
  const data = getAll()
  data.push({ ...evt, at: evt.at ?? Date.now() })
  saveAll(data)
  
  //  event for real-time updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('progressUpdate'))
  }
}

export function markTodayWorkComplete() {
  addProgressEvent({ type: "work", seconds: 0 })
}

function getAll(): ProgressEvent[] {
  if (typeof window === 'undefined') return []
  
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ProgressEvent[]) : []
  } catch (error) {
    console.warn('Failed to parse progress data:', error)
    return []
  }
}

function saveAll(events: ProgressEvent[]) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(KEY, JSON.stringify(events))
  } catch (error) {
    console.error('Failed to save progress data:', error)
  }
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

// Helper function to compare data arrays
export function isDataEqual(data1: DayData[], data2: DayData[]): boolean {
  if (!data1 || !data2 || data1.length !== data2.length) return false
  
  return data1.every((item, index) => {
    const other = data2[index]
    return (
      item?.label === other?.label && 
      item?.sessions === other?.sessions
    )
  })
}