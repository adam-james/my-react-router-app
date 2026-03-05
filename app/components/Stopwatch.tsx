import { useState, useRef, useCallback } from "react";

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
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

  const bestLap =
    laps.length > 1
      ? Math.min(
          ...laps.map((l, i) => (i < laps.length - 1 ? l - laps[i + 1] : l))
        )
      : null;
  const worstLap =
    laps.length > 1
      ? Math.max(
          ...laps.map((l, i) => (i < laps.length - 1 ? l - laps[i + 1] : l))
        )
      : null;

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-6xl sm:text-7xl font-light tracking-wider text-white tabular-nums">
        {formatTime(elapsed)}
      </div>

      <div className="flex gap-4">
        {!running ? (
          <>
            <button
              onClick={start}
              className="px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
            >
              {elapsed > 0 ? "Resume" : "Start"}
            </button>
            {elapsed > 0 && (
              <button
                onClick={reset}
                className="px-8 py-3 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-colors"
              >
                Reset
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={stop}
              className="px-8 py-3 rounded-full bg-red-600/80 hover:bg-red-500/80 text-white font-medium transition-colors"
            >
              Stop
            </button>
            <button
              onClick={lap}
              className="px-8 py-3 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-colors"
            >
              Lap
            </button>
          </>
        )}
      </div>

      {laps.length > 0 && (
        <div className="w-full max-w-sm">
          <div className="border-t border-gray-800 max-h-60 overflow-y-auto">
            {laps.map((lapTime, i) => {
              const diff =
                i < laps.length - 1 ? lapTime - laps[i + 1] : lapTime;
              const isBest = bestLap !== null && diff === bestLap;
              const isWorst = worstLap !== null && diff === worstLap;
              return (
                <div
                  key={i}
                  className={`flex justify-between py-2.5 px-3 border-b border-gray-800/50 text-sm tabular-nums ${
                    isBest
                      ? "text-emerald-400"
                      : isWorst
                        ? "text-red-400"
                        : "text-gray-400"
                  }`}
                >
                  <span>Lap {laps.length - i}</span>
                  <span>{formatTime(diff)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
