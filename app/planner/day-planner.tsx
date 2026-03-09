import { useState, useEffect, useRef, useCallback } from "react";

interface FocusTask {
  id: string;
  text: string;
  completed: boolean;
}

interface BacklogTask {
  id: string;
  text: string;
  completed: boolean;
}

interface DayData {
  date: string;
  focusTasks: FocusTask[];
  backlogTasks: BacklogTask[];
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function loadDay(): DayData {
  const key = getTodayKey();
  try {
    const raw = localStorage.getItem(`dayplanner:${key}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { date: key, focusTasks: [], backlogTasks: [] };
}

function saveDay(data: DayData) {
  localStorage.setItem(`dayplanner:${data.date}`, JSON.stringify(data));
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function DayPlanner() {
  const [day, setDay] = useState<DayData>(loadDay);
  const [focusInput, setFocusInput] = useState("");
  const [backlogInput, setBacklogInput] = useState("");
  const focusInputRef = useRef<HTMLInputElement>(null);
  const backlogInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveDay(day);
  }, [day]);

  const addFocusTask = useCallback(() => {
    const text = focusInput.trim();
    if (!text || day.focusTasks.length >= 2) return;
    setDay((d) => ({
      ...d,
      focusTasks: [...d.focusTasks, { id: uid(), text, completed: false }],
    }));
    setFocusInput("");
    focusInputRef.current?.focus();
  }, [focusInput, day.focusTasks.length]);

  const addBacklogTask = useCallback(() => {
    const text = backlogInput.trim();
    if (!text) return;
    setDay((d) => ({
      ...d,
      backlogTasks: [...d.backlogTasks, { id: uid(), text, completed: false }],
    }));
    setBacklogInput("");
    backlogInputRef.current?.focus();
  }, [backlogInput]);

  const toggleFocus = (id: string) => {
    setDay((d) => ({
      ...d,
      focusTasks: d.focusTasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }));
  };

  const removeFocus = (id: string) => {
    setDay((d) => ({
      ...d,
      focusTasks: d.focusTasks.filter((t) => t.id !== id),
    }));
  };

  const toggleBacklog = (id: string) => {
    setDay((d) => ({
      ...d,
      backlogTasks: d.backlogTasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }));
  };

  const removeBacklog = (id: string) => {
    setDay((d) => ({
      ...d,
      backlogTasks: d.backlogTasks.filter((t) => t.id !== id),
    }));
  };

  const promoteToFocus = (id: string) => {
    if (day.focusTasks.length >= 2) return;
    const task = day.backlogTasks.find((t) => t.id === id);
    if (!task) return;
    setDay((d) => ({
      ...d,
      focusTasks: [
        ...d.focusTasks,
        { id: task.id, text: task.text, completed: task.completed },
      ],
      backlogTasks: d.backlogTasks.filter((t) => t.id !== id),
    }));
  };

  const focusCompleted = day.focusTasks.filter((t) => t.completed).length;
  const focusTotal = day.focusTasks.length;
  const allFocusDone = focusTotal > 0 && focusCompleted === focusTotal;

  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      <div className="max-w-xl mx-auto px-5 py-12 sm:py-20">
        {/* Header */}
        <header className="mb-12">
          <p className="text-sm font-medium text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-1">
            {dateLabel}
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            {getGreeting()}.
          </h1>
        </header>

        {/* Focus Section */}
        <section className="mb-14">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-lg font-semibold">
              What matters most today?
            </h2>
            {focusTotal > 0 && (
              <span className="text-sm text-stone-400 dark:text-stone-500">
                {focusCompleted}/{focusTotal}
              </span>
            )}
          </div>

          {allFocusDone && (
            <div className="mb-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-5 py-4 text-emerald-800 dark:text-emerald-300 text-sm font-medium">
              You finished what mattered most. Well done.
            </div>
          )}

          {/* Focus task list */}
          <div className="space-y-2 mb-4">
            {day.focusTasks.map((task) => (
              <div
                key={task.id}
                className={`group flex items-start gap-3 rounded-xl border px-5 py-4 transition-all ${
                  task.completed
                    ? "bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-800"
                    : "bg-white dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 shadow-sm"
                }`}
              >
                <button
                  onClick={() => toggleFocus(task.id)}
                  className={`mt-0.5 flex-none w-5 h-5 rounded-full border-2 transition-colors flex items-center justify-center ${
                    task.completed
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-stone-300 dark:border-stone-600 hover:border-emerald-400"
                  }`}
                  aria-label={
                    task.completed ? "Mark incomplete" : "Mark complete"
                  }
                >
                  {task.completed && (
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
                <span
                  className={`flex-1 text-base leading-snug ${
                    task.completed
                      ? "line-through text-stone-400 dark:text-stone-500"
                      : ""
                  }`}
                >
                  {task.text}
                </span>
                <button
                  onClick={() => removeFocus(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 dark:text-stone-600 dark:hover:text-red-400 transition-opacity"
                  aria-label="Remove task"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Add focus task input */}
          {day.focusTasks.length < 2 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addFocusTask();
              }}
              className="flex gap-2"
            >
              <input
                ref={focusInputRef}
                type="text"
                value={focusInput}
                onChange={(e) => setFocusInput(e.target.value)}
                placeholder={
                  day.focusTasks.length === 0
                    ? "The one thing I must do today..."
                    : "One more thing (max 2)..."
                }
                className="flex-1 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-3 text-base placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-shadow"
              />
              <button
                type="submit"
                disabled={!focusInput.trim()}
                className="rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-5 py-3 text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </form>
          )}
          {day.focusTasks.length >= 2 && !allFocusDone && (
            <p className="text-sm text-stone-400 dark:text-stone-500 italic">
              Two priorities set. Focus on finishing these first.
            </p>
          )}
        </section>

        {/* Divider */}
        <div className="border-t border-stone-200 dark:border-stone-800 mb-10" />

        {/* Backlog / Other tasks */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-sm font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              Also on my plate
            </h2>
            {day.backlogTasks.length > 0 && (
              <span className="text-xs text-stone-400 dark:text-stone-500">
                {day.backlogTasks.filter((t) => t.completed).length}/
                {day.backlogTasks.length}
              </span>
            )}
          </div>

          <div className="space-y-1.5 mb-4">
            {day.backlogTasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors"
              >
                <button
                  onClick={() => toggleBacklog(task.id)}
                  className={`flex-none w-4 h-4 rounded border transition-colors flex items-center justify-center ${
                    task.completed
                      ? "bg-stone-400 border-stone-400 text-white dark:bg-stone-500 dark:border-stone-500"
                      : "border-stone-300 dark:border-stone-600 hover:border-stone-400"
                  }`}
                  aria-label={
                    task.completed ? "Mark incomplete" : "Mark complete"
                  }
                >
                  {task.completed && (
                    <svg
                      className="w-2.5 h-2.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
                <span
                  className={`flex-1 text-sm ${
                    task.completed
                      ? "line-through text-stone-400 dark:text-stone-600"
                      : "text-stone-600 dark:text-stone-400"
                  }`}
                >
                  {task.text}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!task.completed && day.focusTasks.length < 2 && (
                    <button
                      onClick={() => promoteToFocus(task.id)}
                      className="text-stone-300 hover:text-amber-500 dark:text-stone-600 dark:hover:text-amber-400"
                      aria-label="Promote to focus"
                      title="Make this a priority"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => removeBacklog(task.id)}
                    className="text-stone-300 hover:text-red-400 dark:text-stone-600 dark:hover:text-red-400"
                    aria-label="Remove task"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              addBacklogTask();
            }}
            className="flex gap-2"
          >
            <input
              ref={backlogInputRef}
              type="text"
              value={backlogInput}
              onChange={(e) => setBacklogInput(e.target.value)}
              placeholder="Add a smaller task..."
              className="flex-1 rounded-lg border border-stone-200 dark:border-stone-800 bg-transparent px-3 py-2 text-sm placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-300/50 dark:focus:ring-stone-700/50 focus:border-stone-300 dark:focus:border-stone-600 transition-shadow"
            />
            <button
              type="submit"
              disabled={!backlogInput.trim()}
              className="rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-300 dark:hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </form>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800 text-center">
          <p className="text-xs text-stone-400 dark:text-stone-600">
            Less is more. Focus on what matters.
          </p>
        </footer>
      </div>
    </div>
  );
}
