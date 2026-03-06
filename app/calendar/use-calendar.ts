import { useState, useCallback, useMemo } from "react";
import type { CalendarEvent } from "./types";
import { buildCalendarGrid, generateId, formatDateKey } from "./utils";

export function useCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const grid = useMemo(
    () => buildCalendarGrid(year, month, events),
    [year, month, events]
  );

  const goToPrevMonth = useCallback(() => {
    setMonth((m) => {
      if (m === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setMonth((m) => {
      if (m === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const goToToday = useCallback(() => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setSelectedDate(formatDateKey(now));
  }, []);

  const addEvent = useCallback(
    (event: Omit<CalendarEvent, "id">) => {
      setEvents((prev) => [...prev, { ...event, id: generateId() }]);
    },
    []
  );

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const selectedDateEvents = useMemo(
    () => (selectedDate ? events.filter((e) => e.date === selectedDate) : []),
    [events, selectedDate]
  );

  return {
    year,
    month,
    grid,
    events,
    selectedDate,
    selectedDateEvents,
    setSelectedDate,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    addEvent,
    deleteEvent,
  };
}
