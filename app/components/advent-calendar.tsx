import { useState, useEffect } from "react";
import { CalendarDoor } from "./calendar-door";

const SURPRISES = [
  { emoji: "🎄", message: "Merry Christmas spirit!" },
  { emoji: "⭐", message: "You're a star!" },
  { emoji: "🎁", message: "A gift of kindness today" },
  { emoji: "☃️", message: "Build a snowman!" },
  { emoji: "🕯️", message: "Light up someone's day" },
  { emoji: "🍪", message: "Bake some cookies!" },
  { emoji: "❄️", message: "Every snowflake is unique" },
  { emoji: "🎶", message: "Sing a carol!" },
  { emoji: "🧣", message: "Stay warm & cozy" },
  { emoji: "🌟", message: "Make a wish!" },
  { emoji: "🎅", message: "Ho ho ho!" },
  { emoji: "🦌", message: "Dash through the snow!" },
  { emoji: "🔔", message: "Jingle all the way!" },
  { emoji: "🍫", message: "Treat yourself!" },
  { emoji: "💝", message: "Share some love" },
  { emoji: "🧤", message: "Warm hands, warm heart" },
  { emoji: "🎿", message: "Hit the slopes!" },
  { emoji: "🏠", message: "Home sweet home" },
  { emoji: "✨", message: "Sparkle & shine!" },
  { emoji: "🎀", message: "Wrap it up!" },
  { emoji: "🍷", message: "Cheers to the season!" },
  { emoji: "📖", message: "Read by the fire" },
  { emoji: "🌲", message: "Nature is beautiful" },
  { emoji: "🎉", message: "Merry Christmas Eve!" },
];

function getDecemberDay(): number {
  const now = new Date();
  if (now.getMonth() === 11) {
    return now.getDate();
  }
  return 0;
}

const GRID_POSITIONS = [
  3, 1, 4, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 3, 4, 2, 3, 1, 2, 4, 1, 3, 2, 4,
];

export function AdventCalendar() {
  const [openedDoors, setOpenedDoors] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set();
    const saved = localStorage.getItem("advent-opened");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [todayInDec, setTodayInDec] = useState(getDecemberDay);

  useEffect(() => {
    const interval = setInterval(() => {
      setTodayInDec(getDecemberDay());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("advent-opened", JSON.stringify([...openedDoors]));
    }
  }, [openedDoors]);

  function handleOpen(day: number) {
    if (day > todayInDec && todayInDec > 0) return;
    setOpenedDoors((prev) => new Set([...prev, day]));
  }

  function handleReset() {
    setOpenedDoors(new Set());
    localStorage.removeItem("advent-opened");
  }

  const allOpen = openedDoors.size === 24;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#132044] to-[#1a0a2e] text-white relative overflow-hidden">
      <Snowfall />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-amber-300 via-red-400 to-amber-300 bg-clip-text text-transparent drop-shadow-lg">
            Advent Calendar
          </h1>
          <p className="mt-3 text-lg text-blue-200/70">
            {todayInDec > 0 && todayInDec <= 24
              ? `December ${todayInDec} — Open today's door!`
              : todayInDec > 24
                ? "Merry Christmas! Open all the doors!"
                : "Explore the magic of December!"}
          </p>
          {allOpen && (
            <button
              onClick={handleReset}
              className="mt-4 px-4 py-2 text-sm rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
            >
              Reset Calendar
            </button>
          )}
        </header>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 24 }, (_, i) => {
            const day = i + 1;
            const isOpenable = todayInDec === 0 || day <= todayInDec;
            const isToday = day === todayInDec;
            const isOpened = openedDoors.has(day);

            return (
              <CalendarDoor
                key={day}
                day={day}
                surprise={SURPRISES[i]}
                isOpenable={isOpenable}
                isToday={isToday}
                isOpened={isOpened}
                onOpen={() => handleOpen(day)}
                gridPosition={GRID_POSITIONS[i]}
              />
            );
          })}
        </div>

        <footer className="text-center mt-10 text-blue-300/40 text-sm">
          {openedDoors.size} of 24 doors opened
        </footer>
      </div>
    </div>
  );
}

function Snowfall() {
  const flakes = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 10}s`,
    duration: `${8 + Math.random() * 12}s`,
    size: `${2 + Math.random() * 4}px`,
    opacity: 0.3 + Math.random() * 0.5,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      {flakes.map((f) => (
        <div
          key={f.id}
          className="absolute rounded-full bg-white animate-snowfall"
          style={{
            left: f.left,
            width: f.size,
            height: f.size,
            opacity: f.opacity,
            animationDelay: f.delay,
            animationDuration: f.duration,
          }}
        />
      ))}
    </div>
  );
}
