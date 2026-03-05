import { useState, useRef, useCallback, useEffect } from "react";

function formatDisplay(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

type Phase = "set" | "running" | "paused" | "done";

export function Timer() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [phase, setPhase] = useState<Phase>("set");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const tick = useCallback(() => {
    const left = Math.max(
      0,
      Math.round((endTimeRef.current - Date.now()) / 1000)
    );
    setRemaining(left);
    if (left <= 0) {
      clearTimer();
      setPhase("done");
    }
  }, [clearTimer]);

  const start = useCallback(() => {
    const total =
      phase === "set" ? hours * 3600 + minutes * 60 + seconds : remaining;
    if (total <= 0) return;
    if (phase === "set") setTotalDuration(total);
    endTimeRef.current = Date.now() + total * 1000;
    setRemaining(total);
    setPhase("running");
    intervalRef.current = setInterval(tick, 200);
  }, [phase, hours, minutes, seconds, remaining, tick]);

  const pause = useCallback(() => {
    clearTimer();
    setPhase("paused");
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setRemaining(0);
    setPhase("set");
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  const progress =
    totalDuration > 0 ? (remaining / totalDuration) * 100 : 100;
  const circumference = 2 * Math.PI * 108;
  const offset = circumference - (progress / 100) * circumference;

  const presets = [
    { label: "1m", h: 0, m: 1, s: 0 },
    { label: "5m", h: 0, m: 5, s: 0 },
    { label: "10m", h: 0, m: 10, s: 0 },
    { label: "15m", h: 0, m: 15, s: 0 },
    { label: "30m", h: 0, m: 30, s: 0 },
    { label: "1h", h: 1, m: 0, s: 0 },
  ];

  if (phase === "set") {
    return (
      <div className="flex flex-col items-center gap-8">
        <div className="flex items-center gap-2 text-5xl sm:text-6xl font-light text-white tabular-nums">
          <ScrollInput value={hours} onChange={setHours} max={23} label="h" />
          <span className="text-gray-600">:</span>
          <ScrollInput
            value={minutes}
            onChange={setMinutes}
            max={59}
            label="m"
          />
          <span className="text-gray-600">:</span>
          <ScrollInput
            value={seconds}
            onChange={setSeconds}
            max={59}
            label="s"
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setHours(p.h);
                setMinutes(p.m);
                setSeconds(p.s);
              }}
              className="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          onClick={start}
          disabled={hours === 0 && minutes === 0 && seconds === 0}
          className="px-10 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium transition-colors"
        >
          Start
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative w-64 h-64 sm:w-72 sm:h-72">
        <svg viewBox="0 0 240 240" className="w-full h-full -rotate-90">
          <circle
            cx="120"
            cy="120"
            r="108"
            fill="none"
            stroke="#1f2937"
            strokeWidth="6"
          />
          <circle
            cx="120"
            cy="120"
            r="108"
            fill="none"
            stroke={phase === "done" ? "#ef4444" : "#818cf8"}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`text-5xl sm:text-6xl font-light tabular-nums ${phase === "done" ? "text-red-400" : "text-white"}`}
          >
            {formatDisplay(remaining)}
          </span>
          {phase === "done" && (
            <span className="text-red-400 text-sm mt-1 animate-pulse">
              Time's up!
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        {phase === "running" && (
          <button
            onClick={pause}
            className="px-8 py-3 rounded-full bg-amber-600/80 hover:bg-amber-500/80 text-white font-medium transition-colors"
          >
            Pause
          </button>
        )}
        {phase === "paused" && (
          <button
            onClick={start}
            className="px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
          >
            Resume
          </button>
        )}
        <button
          onClick={reset}
          className="px-8 py-3 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-colors"
        >
          {phase === "done" ? "Done" : "Cancel"}
        </button>
      </div>
    </div>
  );
}

function ScrollInput({
  value,
  onChange,
  max,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  max: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => onChange(value >= max ? 0 : value + 1)}
        className="text-gray-600 hover:text-gray-300 transition-colors text-2xl leading-none"
        aria-label={`Increase ${label}`}
      >
        ▲
      </button>
      <span className="w-16 text-center">{value.toString().padStart(2, "0")}</span>
      <button
        onClick={() => onChange(value <= 0 ? max : value - 1)}
        className="text-gray-600 hover:text-gray-300 transition-colors text-2xl leading-none"
        aria-label={`Decrease ${label}`}
      >
        ▼
      </button>
      <span className="text-xs text-gray-600 uppercase">{label}</span>
    </div>
  );
}
