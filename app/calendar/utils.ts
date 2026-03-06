import type { CalendarEvent, DayCell } from "./types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export { MONTH_NAMES, DAY_NAMES };

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function buildCalendarGrid(
  year: number,
  month: number,
  events: CalendarEvent[]
): DayCell[] {
  const today = new Date();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: DayCell[] = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthDays - i);
    cells.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      events: events.filter((e) => e.date === formatDateKey(date)),
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    cells.push({
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      events: events.filter((e) => e.date === formatDateKey(date)),
    });
  }

  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d);
    cells.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      events: events.filter((e) => e.date === formatDateKey(date)),
    });
  }

  return cells;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export const EVENT_COLORS = [
  { name: "Blue", value: "bg-blue-500" },
  { name: "Red", value: "bg-red-500" },
  { name: "Green", value: "bg-emerald-500" },
  { name: "Purple", value: "bg-purple-500" },
  { name: "Amber", value: "bg-amber-500" },
  { name: "Pink", value: "bg-pink-500" },
];
