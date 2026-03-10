import type { Card } from "./types";

const SUIT_SYMBOLS: Record<string, string> = {
  hearts: "\u2665",
  diamonds: "\u2666",
  clubs: "\u2663",
  spades: "\u2660",
};

const SUIT_COLORS: Record<string, string> = {
  hearts: "text-rose-500",
  diamonds: "text-orange-400",
  clubs: "text-gray-800",
  spades: "text-gray-800",
};

export function CardComponent({
  card,
  index,
}: {
  card: Card;
  index: number;
}) {
  const symbol = SUIT_SYMBOLS[card.suit];
  const color = SUIT_COLORS[card.suit];

  return (
    <div
      className="relative transition-all duration-500 ease-out"
      style={{
        animationDelay: `${index * 120}ms`,
        animation: "deal 0.5s ease-out both",
      }}
    >
      {card.faceUp ? (
        <div
          className={`
            w-20 h-28 sm:w-24 sm:h-34 rounded-xl shadow-lg
            bg-gradient-to-br from-white to-amber-50
            border border-amber-200/60
            flex flex-col justify-between p-1.5 sm:p-2
            hover:shadow-xl hover:-translate-y-1 transition-all duration-200
            ${color}
          `}
        >
          <div className="text-left leading-none">
            <div className="text-sm sm:text-base font-bold">{card.rank}</div>
            <div className="text-xs sm:text-sm">{symbol}</div>
          </div>
          <div className="text-2xl sm:text-3xl self-center">{symbol}</div>
          <div className="text-right leading-none rotate-180">
            <div className="text-sm sm:text-base font-bold">{card.rank}</div>
            <div className="text-xs sm:text-sm">{symbol}</div>
          </div>
        </div>
      ) : (
        <div
          className="
            w-20 h-28 sm:w-24 sm:h-34 rounded-xl shadow-lg
            bg-gradient-to-br from-orange-700 via-rose-700 to-purple-800
            border border-orange-500/40
            flex items-center justify-center
            hover:shadow-xl hover:-translate-y-1 transition-all duration-200
          "
        >
          <div className="w-14 h-22 sm:w-18 sm:h-28 rounded-lg border-2 border-orange-400/30 flex items-center justify-center">
            <div className="text-orange-300/60 text-2xl sm:text-3xl font-serif">
              &#9788;
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
