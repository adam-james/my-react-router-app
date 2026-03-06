import { DAY_NAMES } from "./utils";
import type { DayCell } from "./types";

interface CalendarGridProps {
  grid: DayCell[];
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
  formatDateKey: (date: Date) => string;
}

export function CalendarGrid({
  grid,
  selectedDate,
  onSelectDate,
  formatDateKey,
}: CalendarGridProps) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800/50">
        {DAY_NAMES.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 bg-white dark:bg-gray-900">
        {grid.map((cell, i) => {
          const dateKey = formatDateKey(cell.date);
          const isSelected = selectedDate === dateKey;
          return (
            <button
              key={i}
              onClick={() => onSelectDate(dateKey)}
              className={`
                relative min-h-[5.5rem] p-2 text-left border-t border-r border-gray-100 dark:border-gray-800
                transition-colors duration-100
                ${i % 7 === 0 ? "border-l-0" : ""}
                ${!cell.isCurrentMonth ? "bg-gray-50/50 dark:bg-gray-900/50" : ""}
                ${isSelected ? "bg-blue-50 dark:bg-blue-950/30 ring-2 ring-inset ring-blue-500" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"}
              `}
            >
              <span
                className={`
                  inline-flex items-center justify-center w-7 h-7 rounded-full text-sm
                  ${cell.isToday ? "bg-blue-600 text-white font-bold" : ""}
                  ${!cell.isToday && cell.isCurrentMonth ? "text-gray-900 dark:text-gray-100 font-medium" : ""}
                  ${!cell.isToday && !cell.isCurrentMonth ? "text-gray-400 dark:text-gray-600" : ""}
                `}
              >
                {cell.date.getDate()}
              </span>
              {cell.events.length > 0 && (
                <div className="mt-1 space-y-1">
                  {cell.events.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={`${event.color} text-white text-[11px] leading-tight px-1.5 py-0.5 rounded truncate`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {cell.events.length > 2 && (
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 pl-1">
                      +{cell.events.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
