import { useEffect, useRef, useState, useCallback } from "react";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getTimeOfDayGradient(hours: number) {
  if (hours >= 5 && hours < 8)
    return ["#0f0c29", "#302b63", "#24243e", "#e96443", "#904e95"];
  if (hours >= 8 && hours < 12)
    return ["#2193b0", "#6dd5ed", "#cc2b5e", "#753a88", "#2193b0"];
  if (hours >= 12 && hours < 17)
    return ["#4568dc", "#b06ab3", "#eecda3", "#ef629f", "#4568dc"];
  if (hours >= 17 && hours < 20)
    return ["#e96443", "#904e95", "#0f0c29", "#302b63", "#e96443"];
  return ["#0f0c29", "#1a1a3e", "#16213e", "#0f3460", "#0f0c29"];
}

function useAnimationFrame(callback: (time: number) => void) {
  const requestRef = useRef<number>(0);
  const animate = useCallback(
    (time: number) => {
      callback(time);
      requestRef.current = requestAnimationFrame(animate);
    },
    [callback]
  );
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);
}

function AuroraBackground({ hours }: { hours: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorsRef = useRef(getTimeOfDayGradient(hours));

  useEffect(() => {
    colorsRef.current = getTimeOfDayGradient(hours);
  }, [hours]);

  const draw = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);

    ctx.fillStyle = "#050510";
    ctx.fillRect(0, 0, w, h);

    const colors = colorsRef.current;
    const t = time * 0.0003;

    for (let i = 0; i < 5; i++) {
      const x = w * (0.2 + 0.15 * Math.sin(t + i * 1.3));
      const y = h * (0.3 + 0.15 * Math.cos(t * 0.7 + i * 0.9));
      const radius = Math.max(w, h) * (0.3 + 0.1 * Math.sin(t * 0.5 + i));

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, colors[i] + "40");
      gradient.addColorStop(0.5, colors[i] + "15");
      gradient.addColorStop(1, colors[i] + "00");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }

    const starCount = 80;
    for (let i = 0; i < starCount; i++) {
      const sx =
        ((Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1) * w;
      const rawY =
        ((Math.sin(i * 269.5 + 183.3) * 43758.5453) % 1);
      const sy = Math.abs(rawY) * h;
      const brightness = 0.3 + 0.7 * ((Math.sin(t * 2 + i * 0.5) + 1) / 2);
      const size = 0.5 + brightness * 1.5;
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.6})`;
      ctx.fill();
    }
  }, []);

  useAnimationFrame(draw);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}

function OrbitingSeconds({ seconds, millis }: { seconds: number; millis: number }) {
  const totalDots = 60;
  const radius = "min(40vw, 40vh)";

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {Array.from({ length: totalDots }, (_, i) => {
        const angle = (i / totalDots) * 360 - 90;
        const isActive = i <= seconds;
        const isCurrent = i === seconds;
        const progress = millis / 1000;
        const opacity = isCurrent
          ? 0.5 + 0.5 * progress
          : isActive
            ? 0.15 + 0.55 * (i / seconds)
            : 0.06;
        const size = isCurrent ? 8 : isActive ? 3.5 : 2;

        return (
          <div
            key={i}
            className="absolute rounded-full transition-all duration-100"
            style={{
              width: size,
              height: size,
              background: isActive
                ? `rgba(167, 139, 250, ${opacity})`
                : `rgba(255, 255, 255, ${opacity})`,
              boxShadow: isCurrent
                ? "0 0 15px 5px rgba(167, 139, 250, 0.5)"
                : isActive
                  ? `0 0 6px 1px rgba(167, 139, 250, ${opacity * 0.4})`
                  : "none",
              left: `calc(50% + cos(${angle}deg) * ${radius} - ${size / 2}px)`,
              top: `calc(50% + sin(${angle}deg) * ${radius} - ${size / 2}px)`,
            }}
          />
        );
      })}
    </div>
  );
}

function MinuteArc({ minutes, seconds }: { minutes: number; seconds: number }) {
  const progress = (minutes * 60 + seconds) / 3600;
  const circumference = 2 * Math.PI * 140;
  const offset = circumference * (1 - progress);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <svg
        width="min(70vw, 70vh)"
        height="min(70vw, 70vh)"
        viewBox="0 0 300 300"
        className="opacity-25"
      >
        <circle
          cx="150"
          cy="150"
          r="140"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
        <circle
          cx="150"
          cy="150"
          r="140"
          fill="none"
          stroke="url(#minuteGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 150 150)"
          className="transition-all duration-1000 ease-linear"
        />
        <defs>
          <linearGradient id="minuteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function TimeDisplay({
  hours,
  minutes,
  seconds,
}: {
  hours: number;
  minutes: number;
  seconds: number;
}) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-2 select-none">
      <div className="flex items-baseline tabular-nums">
        <span className="text-[clamp(4rem,15vw,12rem)] font-extralight tracking-tighter bg-gradient-to-br from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
          {pad(hours)}
        </span>
        <span className="text-[clamp(3rem,10vw,8rem)] font-thin text-purple-300/60 animate-pulse mx-1">
          :
        </span>
        <span className="text-[clamp(4rem,15vw,12rem)] font-extralight tracking-tighter bg-gradient-to-br from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
          {pad(minutes)}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-purple-400/40" />
        <span className="text-[clamp(1.5rem,4vw,3rem)] font-thin tabular-nums text-purple-300/50 tracking-widest">
          {pad(seconds)}
        </span>
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-purple-400/40" />
      </div>
    </div>
  );
}

function DateDisplay({ date }: { date: Date }) {
  return (
    <div className="relative z-10 text-center select-none mt-8">
      <p className="text-[clamp(0.75rem,2vw,1.1rem)] font-light tracking-[0.3em] uppercase text-white/30">
        {DAYS[date.getDay()]}
      </p>
      <p className="text-[clamp(0.65rem,1.5vw,0.9rem)] font-light tracking-[0.2em] text-white/20 mt-1">
        {MONTHS[date.getMonth()]} {date.getDate()}, {date.getFullYear()}
      </p>
    </div>
  );
}

function Greeting({ hours }: { hours: number }) {
  let greeting = "Good evening";
  if (hours >= 5 && hours < 12) greeting = "Good morning";
  else if (hours >= 12 && hours < 17) greeting = "Good afternoon";
  else if (hours >= 17 && hours < 21) greeting = "Good evening";
  else greeting = "Good night";

  return (
    <p className="relative z-10 text-[clamp(0.7rem,1.8vw,1rem)] font-light tracking-[0.4em] uppercase text-white/20 select-none mb-6">
      {greeting}
    </p>
  );
}

export default function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 50);
    return () => clearInterval(id);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const millis = now.getMilliseconds();

  return (
    <div className="fixed inset-0 overflow-hidden flex items-center justify-center cursor-default">
      <AuroraBackground hours={hours} />
      <MinuteArc minutes={minutes} seconds={seconds} />
      <OrbitingSeconds seconds={seconds} millis={millis} />
      <div className="relative z-10 flex flex-col items-center">
        <Greeting hours={hours} />
        <TimeDisplay hours={hours} minutes={minutes} seconds={seconds} />
        <DateDisplay date={now} />
      </div>
    </div>
  );
}
