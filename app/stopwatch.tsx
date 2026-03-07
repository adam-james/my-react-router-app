import { useState, useRef, useCallback } from "react";

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

export function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  const start = useCallback(() => {
    startTimeRef.current = Date.now() - elapsed;
    intervalRef.current = setInterval(() => {
      setElapsed(Date.now() - startTimeRef.current);
    }, 10);
    setRunning(true);
  }, [elapsed]);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setElapsed(0);
    setRunning(false);
    setLaps([]);
  }, []);

  const lap = useCallback(() => {
    setLaps((prev) => [elapsed, ...prev]);
  }, [elapsed]);

  const bestLapTime =
    laps.length >= 2
      ? Math.min(
          ...laps.map((t, i) => (i < laps.length - 1 ? t - laps[i + 1] : t))
        )
      : null;
  const worstLapTime =
    laps.length >= 2
      ? Math.max(
          ...laps.map((t, i) => (i < laps.length - 1 ? t - laps[i + 1] : t))
        )
      : null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white px-4 select-none">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <h1 className="text-lg font-medium tracking-widest uppercase text-gray-500">
          Stopwatch
        </h1>

        <div className="relative flex items-center justify-center w-64 h-64 rounded-full border-2 border-gray-800">
          <div
            className="absolute inset-1 rounded-full"
            style={{
              background: `conic-gradient(#6366f1 ${(elapsed % 60000) / 60000 * 360}deg, transparent 0deg)`,
              mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #fff calc(100% - 3px))",
              WebkitMask:
                "radial-gradient(farthest-side, transparent calc(100% - 3px), #fff calc(100% - 3px))",
            }}
          />
          <time className="text-5xl font-mono font-light tracking-tight tabular-nums">
            {formatTime(elapsed)}
          </time>
        </div>

        <div className="flex gap-4">
          {!running && elapsed === 0 && (
            <button
              onClick={start}
              className="w-28 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 font-medium transition-colors cursor-pointer"
            >
              Start
            </button>
          )}

          {running && (
            <>
              <button
                onClick={lap}
                className="w-28 py-3 rounded-full bg-gray-800 hover:bg-gray-700 active:bg-gray-900 font-medium transition-colors cursor-pointer"
              >
                Lap
              </button>
              <button
                onClick={stop}
                className="w-28 py-3 rounded-full bg-red-600 hover:bg-red-500 active:bg-red-700 font-medium transition-colors cursor-pointer"
              >
                Stop
              </button>
            </>
          )}

          {!running && elapsed > 0 && (
            <>
              <button
                onClick={reset}
                className="w-28 py-3 rounded-full bg-gray-800 hover:bg-gray-700 active:bg-gray-900 font-medium transition-colors cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={start}
                className="w-28 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 font-medium transition-colors cursor-pointer"
              >
                Resume
              </button>
            </>
          )}
        </div>

        {laps.length > 0 && (
          <div className="w-full mt-2">
            <div className="flex justify-between text-xs text-gray-500 uppercase tracking-wider px-4 pb-2 border-b border-gray-800">
              <span>Lap</span>
              <span>Split</span>
              <span>Time</span>
            </div>
            <ul className="max-h-56 overflow-y-auto divide-y divide-gray-800/60">
              {laps.map((lapTime, i) => {
                const split =
                  i < laps.length - 1 ? lapTime - laps[i + 1] : lapTime;
                const isBest = laps.length >= 2 && split === bestLapTime;
                const isWorst = laps.length >= 2 && split === worstLapTime;
                return (
                  <li
                    key={`${laps.length - i}`}
                    className={`flex justify-between px-4 py-2.5 text-sm font-mono tabular-nums ${
                      isBest
                        ? "text-emerald-400"
                        : isWorst
                          ? "text-red-400"
                          : "text-gray-300"
                    }`}
                  >
                    <span className="w-12">{laps.length - i}</span>
                    <span>{formatTime(split)}</span>
                    <span>{formatTime(lapTime)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
