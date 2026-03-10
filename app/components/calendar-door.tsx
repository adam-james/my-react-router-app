import { useState } from "react";

interface Surprise {
  emoji: string;
  message: string;
}

interface CalendarDoorProps {
  day: number;
  surprise: Surprise;
  isOpenable: boolean;
  isToday: boolean;
  isOpened: boolean;
  onOpen: () => void;
  gridPosition: number;
}

const DOOR_COLORS = [
  "from-red-700 to-red-900",
  "from-green-700 to-green-900",
  "from-amber-700 to-amber-900",
  "from-emerald-700 to-emerald-900",
  "from-rose-700 to-rose-900",
  "from-teal-700 to-teal-900",
];

export function CalendarDoor({
  day,
  surprise,
  isOpenable,
  isToday,
  isOpened,
  onOpen,
}: CalendarDoorProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const colorIdx = (day - 1) % DOOR_COLORS.length;

  function handleClick() {
    if (!isOpenable || isOpened) return;
    setIsFlipping(true);
    setTimeout(() => {
      onOpen();
      setIsFlipping(false);
    }, 400);
  }

  const isLocked = !isOpenable && !isOpened;

  return (
    <button
      onClick={handleClick}
      disabled={isLocked}
      className={`
        relative aspect-square rounded-xl transition-all duration-300
        ${isOpened ? "scale-[0.97]" : "hover:scale-105 hover:z-10"}
        ${isToday && !isOpened ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-[#132044] shadow-lg shadow-amber-400/30 animate-pulse-subtle" : ""}
        ${isLocked ? "opacity-40 cursor-not-allowed grayscale" : "cursor-pointer"}
        ${isFlipping ? "animate-door-flip" : ""}
        group
      `}
      aria-label={
        isOpened
          ? `Day ${day}: ${surprise.message}`
          : isLocked
            ? `Day ${day}: locked`
            : `Day ${day}: click to open`
      }
    >
      {isOpened ? (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex flex-col items-center justify-center p-2 backdrop-blur-sm">
          <span className="text-2xl sm:text-4xl mb-1" role="img">
            {surprise.emoji}
          </span>
          <span className="text-[9px] sm:text-xs text-amber-200/80 text-center leading-tight hidden sm:block">
            {surprise.message}
          </span>
          <span className="absolute top-1.5 right-2 text-[10px] text-amber-300/50 font-mono">
            {day}
          </span>
        </div>
      ) : (
        <div
          className={`
            absolute inset-0 rounded-xl bg-gradient-to-br ${DOOR_COLORS[colorIdx]}
            border border-white/10 flex flex-col items-center justify-center
            shadow-lg group-hover:shadow-xl transition-shadow
          `}
        >
          <span className="text-2xl sm:text-3xl font-bold text-white/90 drop-shadow">
            {day}
          </span>
          {isLocked && (
            <span className="text-xs mt-1 opacity-50">🔒</span>
          )}
          {isToday && !isLocked && (
            <span className="text-[10px] sm:text-xs mt-1 text-amber-300 animate-bounce">
              Open me!
            </span>
          )}
          <div className="absolute inset-0 rounded-xl border-2 border-white/5 pointer-events-none" />
          <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-white/10" />
          <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-white/10" />
        </div>
      )}
    </button>
  );
}
