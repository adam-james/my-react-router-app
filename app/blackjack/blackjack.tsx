import { useState, useCallback } from "react";
import type { Card, GameStatus } from "./types";
import { createDeck, calculateHand, isBlackjack } from "./deck";
import { CardComponent } from "./card";

function drawCards(deck: Card[], count: number): [Card[], Card[]] {
  return [deck.slice(0, count), deck.slice(count)];
}

const RESULT_MESSAGES: Partial<Record<GameStatus, string>> = {
  "player-blackjack": "Blackjack!",
  "player-bust": "Bust!",
  "dealer-bust": "Dealer Busts!",
  "player-win": "You Win!",
  "dealer-win": "Dealer Wins",
  push: "Push",
};

const RESULT_STYLES: Partial<Record<GameStatus, string>> = {
  "player-blackjack": "text-amber-300",
  "player-bust": "text-rose-400",
  "dealer-bust": "text-emerald-400",
  "player-win": "text-emerald-400",
  "dealer-win": "text-rose-400",
  push: "text-amber-200",
};

const CHIP_VALUES = [10, 25, 50, 100];

export function Blackjack() {
  const [deck, setDeck] = useState<Card[]>(createDeck);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [status, setStatus] = useState<GameStatus>("betting");
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(0);

  const isGameOver = [
    "player-bust",
    "dealer-bust",
    "player-blackjack",
    "player-win",
    "dealer-win",
    "push",
  ].includes(status);

  const placeBet = useCallback(
    (amount: number) => {
      if (balance >= amount) {
        setBet((prev) => prev + amount);
        setBalance((prev) => prev - amount);
      }
    },
    [balance]
  );

  const clearBet = useCallback(() => {
    setBalance((prev) => prev + bet);
    setBet(0);
  }, [bet]);

  const deal = useCallback(() => {
    if (bet === 0) return;
    const newDeck = createDeck();
    const playerCards: Card[] = [
      { ...newDeck[0], faceUp: true },
      { ...newDeck[2], faceUp: true },
    ];
    const dealerCards: Card[] = [
      { ...newDeck[1], faceUp: true },
      { ...newDeck[3], faceUp: false },
    ];
    const remaining = newDeck.slice(4);

    setDeck(remaining);
    setPlayerHand(playerCards);
    setDealerHand(dealerCards);

    if (isBlackjack(playerCards)) {
      const revealed = dealerCards.map((c) => ({ ...c, faceUp: true }));
      setDealerHand(revealed);
      setBalance((prev) => prev + Math.floor(bet * 2.5));
      setStatus("player-blackjack");
    } else {
      setStatus("playing");
    }
  }, [bet]);

  const hit = useCallback(() => {
    if (status !== "playing") return;
    const [drawn, remaining] = drawCards(deck, 1);
    const newHand = [...playerHand, { ...drawn[0], faceUp: true }];
    setDeck(remaining);
    setPlayerHand(newHand);

    if (calculateHand(newHand) > 21) {
      setStatus("player-bust");
    }
  }, [status, deck, playerHand]);

  const stand = useCallback(() => {
    if (status !== "playing") return;
    const revealed = dealerHand.map((c) => ({ ...c, faceUp: true }));
    let currentDeck = [...deck];
    let currentHand = [...revealed];

    while (calculateHand(currentHand) < 17) {
      const [drawn, remaining] = drawCards(currentDeck, 1);
      currentHand.push({ ...drawn[0], faceUp: true });
      currentDeck = remaining;
    }

    setDeck(currentDeck);
    setDealerHand(currentHand);

    const dealerTotal = calculateHand(currentHand);
    const playerTotal = calculateHand(playerHand);

    if (dealerTotal > 21) {
      setBalance((prev) => prev + bet * 2);
      setStatus("dealer-bust");
    } else if (playerTotal > dealerTotal) {
      setBalance((prev) => prev + bet * 2);
      setStatus("player-win");
    } else if (dealerTotal > playerTotal) {
      setStatus("dealer-win");
    } else {
      setBalance((prev) => prev + bet);
      setStatus("push");
    }
  }, [status, dealerHand, deck, playerHand, bet]);

  const doubleDown = useCallback(() => {
    if (status !== "playing" || playerHand.length !== 2 || balance < bet)
      return;
    setBalance((prev) => prev - bet);
    setBet((prev) => prev * 2);

    const [drawn, remaining] = drawCards(deck, 1);
    const newHand = [...playerHand, { ...drawn[0], faceUp: true }];
    setDeck(remaining);
    setPlayerHand(newHand);

    if (calculateHand(newHand) > 21) {
      setStatus("player-bust");
      return;
    }

    const revealed = dealerHand.map((c) => ({ ...c, faceUp: true }));
    let currentDeck = [...remaining];
    let currentHand = [...revealed];

    while (calculateHand(currentHand) < 17) {
      const [d, r] = drawCards(currentDeck, 1);
      currentHand.push({ ...d[0], faceUp: true });
      currentDeck = r;
    }

    setDeck(currentDeck);
    setDealerHand(currentHand);

    const dealerTotal = calculateHand(currentHand);
    const playerTotal = calculateHand(newHand);
    const totalBet = bet * 2;

    if (dealerTotal > 21) {
      setBalance((prev) => prev + totalBet * 2);
      setStatus("dealer-bust");
    } else if (playerTotal > dealerTotal) {
      setBalance((prev) => prev + totalBet * 2);
      setStatus("player-win");
    } else if (dealerTotal > playerTotal) {
      setStatus("dealer-win");
    } else {
      setBalance((prev) => prev + totalBet);
      setStatus("push");
    }
  }, [status, playerHand, balance, bet, deck, dealerHand]);

  const newRound = useCallback(() => {
    setPlayerHand([]);
    setDealerHand([]);
    setBet(0);
    setStatus("betting");
    if (balance === 0) setBalance(1000);
  }, [balance]);

  const playerTotal = calculateHand(playerHand);
  const dealerTotal = calculateHand(dealerHand);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-400 via-rose-500 to-purple-900 flex flex-col items-center font-sans relative overflow-hidden select-none">
      <SunsetBackground />

      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-6 gap-4 flex-1">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-lg">
            Sunset Blackjack
          </h1>
          <div className="flex items-center justify-center gap-6 mt-2 text-sm font-medium">
            <span className="text-amber-200 drop-shadow">
              Balance: <span className="font-bold">${balance}</span>
            </span>
            {bet > 0 && (
              <span className="text-orange-200 drop-shadow">
                Bet: <span className="font-bold">${bet}</span>
              </span>
            )}
          </div>
        </div>

        {/* Dealer Section */}
        <div className="w-full">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-white/80 uppercase tracking-wider">
              Dealer
            </span>
            {dealerHand.length > 0 && (
              <span className="text-xs font-mono text-amber-200/80 bg-black/20 rounded-full px-2 py-0.5">
                {dealerHand.some((c) => !c.faceUp) ? "?" : dealerTotal}
              </span>
            )}
          </div>
          <div className="flex gap-2 sm:gap-3 min-h-[7rem] sm:min-h-[8.5rem] items-end flex-wrap">
            {dealerHand.map((card, i) => (
              <CardComponent key={i} card={card} index={i} />
            ))}
          </div>
        </div>

        {/* Result Banner */}
        {isGameOver && (
          <div
            className="text-center py-2 animate-pulse"
            style={{ animation: "fadeIn 0.4s ease-out" }}
          >
            <div
              className={`text-3xl sm:text-4xl font-black drop-shadow-lg ${RESULT_STYLES[status]}`}
            >
              {RESULT_MESSAGES[status]}
            </div>
          </div>
        )}

        {/* Player Section */}
        <div className="w-full">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-white/80 uppercase tracking-wider">
              You
            </span>
            {playerHand.length > 0 && (
              <span className="text-xs font-mono text-amber-200/80 bg-black/20 rounded-full px-2 py-0.5">
                {playerTotal}
              </span>
            )}
          </div>
          <div className="flex gap-2 sm:gap-3 min-h-[7rem] sm:min-h-[8.5rem] items-end flex-wrap">
            {playerHand.map((card, i) => (
              <CardComponent key={i} card={card} index={i} />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-auto w-full pb-4">
          {status === "betting" && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-3">
                {CHIP_VALUES.map((val) => (
                  <button
                    key={val}
                    onClick={() => placeBet(val)}
                    disabled={balance < val}
                    className="
                      w-14 h-14 sm:w-16 sm:h-16 rounded-full font-bold text-sm
                      bg-gradient-to-br from-amber-400 to-orange-600
                      text-white shadow-lg border-2 border-amber-300/50
                      hover:scale-110 hover:shadow-xl active:scale-95
                      disabled:opacity-30 disabled:hover:scale-100
                      transition-all duration-150
                    "
                  >
                    ${val}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                {bet > 0 && (
                  <button
                    onClick={clearBet}
                    className="px-5 py-2.5 rounded-full font-semibold text-sm
                      bg-white/10 text-white/80 backdrop-blur
                      hover:bg-white/20 transition-all duration-150"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={deal}
                  disabled={bet === 0}
                  className="
                    px-8 py-2.5 rounded-full font-bold text-sm uppercase tracking-wider
                    bg-gradient-to-r from-amber-400 to-orange-500
                    text-white shadow-lg
                    hover:shadow-xl hover:scale-105 active:scale-95
                    disabled:opacity-30 disabled:hover:scale-100
                    transition-all duration-150
                  "
                >
                  Deal
                </button>
              </div>
            </div>
          )}

          {status === "playing" && (
            <div className="flex justify-center gap-3 flex-wrap">
              <GameButton onClick={hit} label="Hit" />
              <GameButton onClick={stand} label="Stand" variant="primary" />
              {playerHand.length === 2 && balance >= bet && (
                <GameButton onClick={doubleDown} label="Double" />
              )}
            </div>
          )}

          {isGameOver && (
            <div className="flex justify-center">
              <button
                onClick={newRound}
                className="
                  px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider
                  bg-gradient-to-r from-amber-400 to-orange-500
                  text-white shadow-lg
                  hover:shadow-xl hover:scale-105 active:scale-95
                  transition-all duration-150
                "
              >
                {balance === 0 ? "New Game" : "Next Hand"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GameButton({
  onClick,
  label,
  variant = "default",
}: {
  onClick: () => void;
  label: string;
  variant?: "default" | "primary";
}) {
  const base =
    "px-6 py-2.5 rounded-full font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-150";
  const styles =
    variant === "primary"
      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
      : "bg-white/15 text-white backdrop-blur border border-white/20 hover:bg-white/25";

  return (
    <button onClick={onClick} className={`${base} ${styles}`}>
      {label}
    </button>
  );
}

function SunsetBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Sun */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-[30%]
          w-48 h-48 sm:w-64 sm:h-64 rounded-full
          bg-gradient-to-t from-amber-300 via-orange-400 to-transparent
          opacity-40 blur-3xl"
      />
      {/* Horizon glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3
          bg-gradient-to-t from-purple-950/60 to-transparent"
      />
      {/* Subtle clouds */}
      <div
        className="absolute top-[15%] left-[10%] w-64 h-16
          bg-gradient-to-r from-transparent via-orange-300/15 to-transparent
          rounded-full blur-2xl"
      />
      <div
        className="absolute top-[22%] right-[5%] w-80 h-12
          bg-gradient-to-r from-transparent via-rose-300/10 to-transparent
          rounded-full blur-2xl"
      />
    </div>
  );
}
