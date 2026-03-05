import { useState, useEffect } from "react";

export function AnalogClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = hours * 30 + minutes * 0.5;

  const hourMarkers = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    const outerR = 116;
    const innerR = i % 3 === 0 ? 100 : 106;
    return (
      <line
        key={i}
        x1={128 + innerR * Math.sin(angle)}
        y1={128 - innerR * Math.cos(angle)}
        x2={128 + outerR * Math.sin(angle)}
        y2={128 - outerR * Math.cos(angle)}
        stroke={i % 3 === 0 ? "#818cf8" : "#4b5563"}
        strokeWidth={i % 3 === 0 ? 3 : 1.5}
        strokeLinecap="round"
      />
    );
  });

  const hourLabels = Array.from({ length: 12 }, (_, i) => {
    const num = i === 0 ? 12 : i;
    const angle = (i * 30 * Math.PI) / 180;
    const r = 90;
    return (
      <text
        key={`label-${i}`}
        x={128 + r * Math.sin(angle)}
        y={128 - r * Math.cos(angle)}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#9ca3af"
        fontSize="14"
        fontWeight={i % 3 === 0 ? "600" : "400"}
      >
        {num}
      </text>
    );
  });

  return (
    <div className="flex flex-col items-center gap-6">
      <svg
        viewBox="0 0 256 256"
        className="w-64 h-64 sm:w-80 sm:h-80 clock-glow"
      >
        <circle
          cx="128"
          cy="128"
          r="124"
          fill="#111827"
          stroke="#1f2937"
          strokeWidth="2"
        />
        <circle
          cx="128"
          cy="128"
          r="120"
          fill="none"
          stroke="#1e1b4b"
          strokeWidth="1"
          opacity="0.5"
        />

        {hourMarkers}
        {hourLabels}

        {/* Hour hand */}
        <line
          x1="128"
          y1="128"
          x2="128"
          y2="58"
          stroke="#e5e7eb"
          strokeWidth="4"
          strokeLinecap="round"
          transform={`rotate(${hourDeg}, 128, 128)`}
        />
        {/* Minute hand */}
        <line
          x1="128"
          y1="128"
          x2="128"
          y2="38"
          stroke="#c7d2fe"
          strokeWidth="2.5"
          strokeLinecap="round"
          transform={`rotate(${minuteDeg}, 128, 128)`}
        />
        {/* Second hand */}
        <line
          x1="128"
          y1="140"
          x2="128"
          y2="30"
          stroke="#818cf8"
          strokeWidth="1.2"
          strokeLinecap="round"
          transform={`rotate(${secondDeg}, 128, 128)`}
        />
        {/* Center dot */}
        <circle cx="128" cy="128" r="4" fill="#818cf8" />
        <circle cx="128" cy="128" r="2" fill="#c7d2fe" />
      </svg>

      <DigitalDisplay time={time} />
    </div>
  );
}

function DigitalDisplay({ time }: { time: Date }) {
  const formatted = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const dateStr = time.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="text-center">
      <div className="text-5xl sm:text-6xl font-light tracking-widest text-white tabular-nums">
        {formatted}
      </div>
      <div className="text-gray-500 mt-2 text-sm tracking-wide">{dateStr}</div>
    </div>
  );
}
