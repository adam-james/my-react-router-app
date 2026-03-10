import { useState, useEffect, useCallback, useRef } from "react";

interface Alarm {
  id: string;
  hour: number;
  minute: number;
  enabled: boolean;
  label: string;
  triggered: boolean;
}

function padZero(n: number) {
  return n.toString().padStart(2, "0");
}

function formatTime12(h: number, m: number) {
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return { hour: hour12, minute: padZero(m), period };
}

function getSunrisePhase(hour: number): string {
  if (hour >= 5 && hour < 7) return "dawn";
  if (hour >= 7 && hour < 9) return "sunrise";
  if (hour >= 9 && hour < 17) return "day";
  if (hour >= 17 && hour < 19) return "sunset";
  if (hour >= 19 && hour < 21) return "dusk";
  return "night";
}

function useAudioContext() {
  const ctxRef = useRef<AudioContext | null>(null);

  const playAlarmTone = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    const ctx = ctxRef.current;
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.3);
      gain.gain.setValueAtTime(0, now + i * 0.3);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.3 + 0.05);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.3 + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.3);
      osc.stop(now + i * 0.3 + 0.6);
    });
  }, []);

  return playAlarmTone;
}

function SunIcon({ phase, alarming }: { phase: string; alarming: boolean }) {
  const isVisible = phase !== "night" || alarming;
  const yPos =
    phase === "dawn" || phase === "dusk"
      ? "70%"
      : phase === "sunrise" || phase === "sunset"
        ? "45%"
        : phase === "day"
          ? "20%"
          : alarming
            ? "45%"
            : "110%";

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 transition-all duration-[2000ms] ease-in-out"
      style={{ top: yPos, opacity: isVisible ? 1 : 0 }}
    >
      <div
        className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full ${alarming ? "animate-pulse" : ""}`}
      >
        <div className="absolute inset-0 rounded-full bg-yellow-200/30 blur-3xl scale-[2.5]" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-yellow-300 to-orange-400 blur-xl scale-150 opacity-60" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-yellow-200 via-yellow-300 to-orange-400 shadow-[0_0_80px_rgba(251,191,36,0.6)]" />
      </div>
    </div>
  );
}

function MountainSilhouette() {
  return (
    <svg
      className="absolute bottom-0 left-0 w-full"
      viewBox="0 0 1440 200"
      preserveAspectRatio="none"
      style={{ height: "25vh" }}
    >
      <path
        d="M0,200 L0,140 Q120,60 240,110 Q360,30 480,90 Q560,40 660,70 Q740,20 840,80 Q920,35 1020,65 Q1120,15 1200,85 Q1300,45 1380,100 L1440,80 L1440,200 Z"
        className="fill-[#1a1020]/80 dark:fill-[#0a0510]/90"
      />
      <path
        d="M0,200 L0,160 Q180,100 320,140 Q440,80 580,120 Q680,75 780,110 Q880,70 1000,105 Q1120,65 1260,120 L1440,100 L1440,200 Z"
        className="fill-[#1a1020]/90 dark:fill-[#0a0510]"
      />
    </svg>
  );
}

function StarField({ phase }: { phase: string }) {
  const showStars = phase === "night" || phase === "dusk" || phase === "dawn";
  const opacity = phase === "night" ? 1 : phase === "dusk" || phase === "dawn" ? 0.4 : 0;

  return (
    <div
      className="absolute inset-0 transition-opacity duration-[3000ms]"
      style={{ opacity }}
    >
      {showStars &&
        Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
    </div>
  );
}

const phaseGradients: Record<string, string> = {
  night: "from-[#0b0d2e] via-[#1a1040] to-[#2d1b4e]",
  dawn: "from-[#1a1040] via-[#4a2060] to-[#c0506080]",
  sunrise: "from-[#3b2070] via-[#e06040] to-[#f0a030]",
  day: "from-[#2080c0] via-[#60b0e0] to-[#a0d8f0]",
  sunset: "from-[#2d1b6e] via-[#c04060] to-[#f08030]",
  dusk: "from-[#1a1050] via-[#602868] to-[#c04060]",
};

export default function AlarmClock() {
  const [now, setNow] = useState(new Date());
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHour, setNewHour] = useState("6");
  const [newMinute, setNewMinute] = useState("00");
  const [newLabel, setNewLabel] = useState("");
  const [alarming, setAlarming] = useState(false);
  const [alarmingId, setAlarmingId] = useState<string | null>(null);
  const playAlarmTone = useAudioContext();
  const alarmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    if (s !== 0) return;

    alarms.forEach((alarm) => {
      if (alarm.enabled && !alarm.triggered && alarm.hour === h && alarm.minute === m) {
        setAlarming(true);
        setAlarmingId(alarm.id);
        setAlarms((prev) =>
          prev.map((a) => (a.id === alarm.id ? { ...a, triggered: true } : a))
        );
        playAlarmTone();
        alarmIntervalRef.current = setInterval(playAlarmTone, 2500);
      }
    });
  }, [now, alarms, playAlarmTone]);

  const dismissAlarm = useCallback(() => {
    setAlarming(false);
    setAlarmingId(null);
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    setAlarms((prev) =>
      prev.map((a) => (a.id === alarmingId ? { ...a, triggered: false, enabled: false } : a))
    );
  }, [alarmingId]);

  const addAlarm = useCallback(() => {
    const h = Math.min(23, Math.max(0, parseInt(newHour) || 0));
    const m = Math.min(59, Math.max(0, parseInt(newMinute) || 0));
    setAlarms((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        hour: h,
        minute: m,
        enabled: true,
        label: newLabel || `Alarm ${prev.length + 1}`,
        triggered: false,
      },
    ]);
    setNewHour("6");
    setNewMinute("00");
    setNewLabel("");
    setShowAddForm(false);
  }, [newHour, newMinute, newLabel]);

  const toggleAlarm = useCallback((id: string) => {
    setAlarms((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, enabled: !a.enabled, triggered: false } : a
      )
    );
  }, []);

  const deleteAlarm = useCallback((id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const phase = alarming ? "sunrise" : getSunrisePhase(now.getHours());
  const { hour, minute, period } = formatTime12(now.getHours(), now.getMinutes());
  const seconds = padZero(now.getSeconds());

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden bg-gradient-to-b ${phaseGradients[phase]} transition-all duration-[3000ms]`}
    >
      <StarField phase={phase} />
      <SunIcon phase={phase} alarming={alarming} />
      <MountainSilhouette />

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 pt-12 pb-8">
        {/* Clock display */}
        <div className="mt-8 md:mt-16 text-center select-none">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-8xl md:text-[10rem] font-extralight tracking-tight text-white/95 drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)] tabular-nums">
              {hour}
            </span>
            <span className="text-7xl md:text-[8rem] font-extralight text-white/70 animate-[blink_2s_ease-in-out_infinite]">
              :
            </span>
            <span className="text-8xl md:text-[10rem] font-extralight tracking-tight text-white/95 drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)] tabular-nums">
              {minute}
            </span>
          </div>
          <div className="flex items-center justify-center gap-4 -mt-2 md:-mt-4">
            <span className="text-2xl md:text-4xl font-light text-white/60 tabular-nums">
              {seconds}
            </span>
            <span className="text-2xl md:text-4xl font-light text-white/50">
              {period}
            </span>
          </div>
          <p className="mt-4 text-lg text-white/40 font-light tracking-widest uppercase">
            {now.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Alarm ringing overlay */}
        {alarming && (
          <div className="mt-10 animate-bounce">
            <button
              onClick={dismissAlarm}
              className="px-10 py-4 rounded-full bg-gradient-to-r from-orange-400 to-yellow-300 text-gray-900 font-semibold text-xl shadow-[0_0_40px_rgba(251,191,36,0.5)] hover:shadow-[0_0_60px_rgba(251,191,36,0.7)] transition-shadow cursor-pointer"
            >
              Rise &amp; Shine — Dismiss
            </button>
          </div>
        )}

        {/* Alarms list */}
        <div className="mt-auto w-full max-w-md space-y-3 mb-4">
          {alarms.map((alarm) => {
            const { hour: aH, minute: aM, period: aP } = formatTime12(alarm.hour, alarm.minute);
            return (
              <div
                key={alarm.id}
                className={`flex items-center justify-between rounded-2xl px-5 py-4 backdrop-blur-md transition-colors ${
                  alarm.enabled
                    ? "bg-white/10 border border-white/20"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                <div className="flex flex-col">
                  <span
                    className={`text-2xl font-light tabular-nums ${alarm.enabled ? "text-white/90" : "text-white/40"}`}
                  >
                    {aH}:{aM} <span className="text-base">{aP}</span>
                  </span>
                  <span className="text-sm text-white/40">{alarm.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleAlarm(alarm.id)}
                    className={`w-12 h-7 rounded-full relative transition-colors cursor-pointer ${
                      alarm.enabled
                        ? "bg-gradient-to-r from-orange-400 to-yellow-400"
                        : "bg-white/20"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                        alarm.enabled ? "translate-x-5.5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => deleteAlarm(alarm.id)}
                    className="text-white/30 hover:text-red-400 transition-colors text-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add alarm */}
          {showAddForm ? (
            <div className="rounded-2xl px-5 py-5 backdrop-blur-md bg-white/10 border border-white/20 space-y-4">
              <div className="flex gap-3 items-center justify-center">
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={newHour}
                  onChange={(e) => setNewHour(e.target.value)}
                  className="w-20 text-center text-3xl font-light bg-white/10 border border-white/20 rounded-xl py-2 text-white/90 focus:outline-none focus:border-orange-400/50"
                  placeholder="HH"
                />
                <span className="text-3xl text-white/50 font-light">:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={newMinute}
                  onChange={(e) => setNewMinute(e.target.value)}
                  className="w-20 text-center text-3xl font-light bg-white/10 border border-white/20 rounded-xl py-2 text-white/90 focus:outline-none focus:border-orange-400/50"
                  placeholder="MM"
                />
              </div>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Label (optional)"
                className="w-full text-center bg-white/10 border border-white/20 rounded-xl py-2 px-4 text-white/80 placeholder:text-white/30 focus:outline-none focus:border-orange-400/50"
              />
              <p className="text-xs text-white/30 text-center">Use 24-hour format (0–23)</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 rounded-xl border border-white/20 text-white/60 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={addAlarm}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-orange-400 to-yellow-400 text-gray-900 font-medium hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Set Alarm
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-white/20 text-white/40 hover:border-orange-400/40 hover:text-orange-300/60 transition-colors text-lg font-light cursor-pointer"
            >
              + Add Alarm
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
