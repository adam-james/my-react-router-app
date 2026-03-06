import { useCalendar } from "./use-calendar";
import { CalendarHeader } from "./calendar-header";
import { CalendarGrid } from "./calendar-grid";
import { EventPanel } from "./event-panel";
import { formatDateKey } from "./utils";

export function Calendar() {
  const {
    year,
    month,
    grid,
    selectedDate,
    selectedDateEvents,
    setSelectedDate,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    addEvent,
    deleteEvent,
  } = useCalendar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <CalendarHeader
              year={year}
              month={month}
              onPrev={goToPrevMonth}
              onNext={goToNextMonth}
              onToday={goToToday}
            />
            <CalendarGrid
              grid={grid}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              formatDateKey={formatDateKey}
            />
          </div>

          <aside className="w-full lg:w-80 shrink-0">
            <div className="sticky top-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
              <EventPanel
                selectedDate={selectedDate}
                events={selectedDateEvents}
                onAddEvent={addEvent}
                onDeleteEvent={deleteEvent}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
