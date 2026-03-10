import { useState, useCallback } from "react";

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

interface Card {
  suit: Suit;
  rank: Rank;
  hidden?: boolean;
}

type GameState = "betting" | "playing" | "dealerTurn" | "resolved";

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

function shuffleDeck(deck: Card[]): Card[] {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

function cardValue(card: Card): number[] {
  if (card.rank === "A") return [1, 11];
  if (["J", "Q", "K"].includes(card.rank)) return [10];
  return [parseInt(card.rank)];
}

function handValues(hand: Card[]): number[] {
  let totals = [0];
  for (const card of hand) {
    const vals = cardValue(card);
    const newTotals: number[] = [];
    for (const t of totals) {
      for (const v of vals) {
        newTotals.push(t + v);
      }
    }
    totals = [...new Set(newTotals)];
  }
  return totals;
}

function bestValue(hand: Card[]): number {
  const vals = handValues(hand);
  const under = vals.filter((v) => v <= 21);
  if (under.length > 0) return Math.max(...under);
  return Math.min(...vals);
}

function isBusted(hand: Card[]): boolean {
  return bestValue(hand) > 21;
}

function isBlackjack(hand: Card[]): boolean {
  return hand.length === 2 && bestValue(hand) === 21;
}

function isRed(suit: Suit): boolean {
  return suit === "♥" || suit === "♦";
}

function CardComponent({ card }: { card: Card }) {
  if (card.hidden) {
    return (
      <div className="relative w-20 h-28 sm:w-24 sm:h-34 rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 border-2 border-blue-400 shadow-lg flex items-center justify-center select-none">
        <div className="absolute inset-2 rounded-lg border border-blue-400/40" />
        <span className="text-blue-300 text-3xl font-bold">?</span>
      </div>
    );
  }

  const red = isRed(card.suit);

  return (
    <div
      className={`relative w-20 h-28 sm:w-24 sm:h-34 rounded-xl bg-white border-2 shadow-lg flex flex-col justify-between p-1.5 sm:p-2 select-none ${
        red ? "border-red-300 text-red-600" : "border-gray-300 text-gray-900"
      }`}
    >
      <div className="flex flex-col items-start leading-none">
        <span className="text-sm sm:text-base font-bold">{card.rank}</span>
        <span className="text-xs sm:text-sm">{card.suit}</span>
      </div>
      <div className="flex items-center justify-center">
        <span className="text-2xl sm:text-3xl">{card.suit}</span>
      </div>
      <div className="flex flex-col items-end leading-none rotate-180">
        <span className="text-sm sm:text-base font-bold">{card.rank}</span>
        <span className="text-xs sm:text-sm">{card.suit}</span>
      </div>
    </div>
  );
}

function HandDisplay({
  cards,
  label,
  score,
  isActive,
}: {
  cards: Card[];
  label: string;
  score?: number;
  isActive?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <span className="text-white/80 text-sm font-semibold uppercase tracking-wider">
          {label}
        </span>
        {score !== undefined && (
          <span className="bg-black/40 text-white text-sm font-bold px-2 py-0.5 rounded-full">
            {score}
          </span>
        )}
      </div>
      <div
        className={`flex gap-2 sm:gap-3 p-3 rounded-2xl transition-all ${
          isActive ? "bg-white/10 ring-2 ring-yellow-400/50" : ""
        }`}
      >
        {cards.map((card, i) => (
          <div
            key={i}
            className="transform transition-all duration-300"
            style={{
              animationDelay: `${i * 100}ms`,
            }}
          >
            <CardComponent card={card} />
          </div>
        ))}
      </div>
    </div>
  );
}

const CHIP_VALUES = [5, 10, 25, 50, 100] as const;
const CHIP_COLORS: Record<number, string> = {
  5: "from-red-500 to-red-700 border-red-400",
  10: "from-blue-500 to-blue-700 border-blue-400",
  25: "from-green-500 to-green-700 border-green-400",
  50: "from-orange-500 to-orange-700 border-orange-400",
  100: "from-purple-500 to-purple-700 border-purple-400",
};

export function Blackjack() {
  const [deck, setDeck] = useState<Card[]>(() => shuffleDeck(createDeck()));
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<GameState>("betting");
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(0);
  const [message, setMessage] = useState("");
  const [hasDoubled, setHasDoubled] = useState(false);

  const draw = useCallback(
    (count: number): [Card[], Card[]] => {
      const remaining = [...deck];
      const drawn: Card[] = [];
      for (let i = 0; i < count; i++) {
        if (remaining.length === 0) {
          const fresh = shuffleDeck(createDeck());
          remaining.push(...fresh);
        }
        drawn.push(remaining.pop()!);
      }
      return [drawn, remaining];
    },
    [deck]
  );

  const addBet = (amount: number) => {
    if (amount > balance - bet) return;
    setBet((b) => b + amount);
  };

  const clearBet = () => setBet(0);

  const deal = () => {
    if (bet === 0) return;

    let fresh = shuffleDeck(createDeck());
    const pCards = [fresh.pop()!, fresh.pop()!];
    const dCards = [fresh.pop()!, { ...fresh.pop()!, hidden: true }];

    setDeck(fresh);
    setPlayerHand(pCards);
    setDealerHand(dCards);
    setHasDoubled(false);

    if (isBlackjack(pCards)) {
      const revealedDealer = dCards.map((c) => ({ ...c, hidden: false }));
      setDealerHand(revealedDealer);
      if (isBlackjack(revealedDealer)) {
        setMessage("Both have Blackjack — Push!");
        setGameState("resolved");
      } else {
        const winnings = Math.floor(bet * 1.5);
        setBalance((b) => b + winnings);
        setMessage(`Blackjack! You win $${winnings}!`);
        setGameState("resolved");
      }
    } else {
      setMessage("");
      setGameState("playing");
    }
  };

  const hit = () => {
    const [drawn, remaining] = draw(1);
    const newHand = [...playerHand, ...drawn];
    setDeck(remaining);
    setPlayerHand(newHand);

    if (isBusted(newHand)) {
      const revealedDealer = dealerHand.map((c) => ({ ...c, hidden: false }));
      setDealerHand(revealedDealer);
      setBalance((b) => b - bet);
      setMessage(`Bust! You lose $${bet}.`);
      setGameState("resolved");
    }
  };

  const stand = () => {
    const revealedDealer = dealerHand.map((c) => ({ ...c, hidden: false }));
    setDealerHand(revealedDealer);
    runDealer(revealedDealer, playerHand, bet);
  };

  const doubleDown = () => {
    if (balance - bet < bet) return;
    setHasDoubled(true);
    const newBet = bet * 2;
    setBet(newBet);

    const [drawn, remaining] = draw(1);
    const newHand = [...playerHand, ...drawn];
    setDeck(remaining);
    setPlayerHand(newHand);

    if (isBusted(newHand)) {
      const revealedDealer = dealerHand.map((c) => ({ ...c, hidden: false }));
      setDealerHand(revealedDealer);
      setBalance((b) => b - newBet);
      setMessage(`Bust! You lose $${newBet}.`);
      setGameState("resolved");
    } else {
      const revealedDealer = dealerHand.map((c) => ({ ...c, hidden: false }));
      setDealerHand(revealedDealer);
      runDealer(revealedDealer, newHand, newBet);
    }
  };

  const runDealer = (dHand: Card[], pHand: Card[], currentBet: number) => {
    let currentDeck = [...deck];
    let dh = [...dHand];

    const dealerDraw = () => {
      if (currentDeck.length === 0) {
        currentDeck = shuffleDeck(createDeck());
      }
      dh = [...dh, currentDeck.pop()!];
    };

    while (bestValue(dh) < 17) {
      dealerDraw();
    }

    setDeck(currentDeck);
    setDealerHand(dh);

    const pVal = bestValue(pHand);
    const dVal = bestValue(dh);

    if (isBusted(dh)) {
      setBalance((b) => b + currentBet);
      setMessage(`Dealer busts! You win $${currentBet}!`);
    } else if (dVal > pVal) {
      setBalance((b) => b - currentBet);
      setMessage(`Dealer wins. You lose $${currentBet}.`);
    } else if (pVal > dVal) {
      setBalance((b) => b + currentBet);
      setMessage(`You win $${currentBet}!`);
    } else {
      setMessage("Push! It's a tie.");
    }

    setGameState("resolved");
  };

  const newRound = () => {
    setBet(0);
    setPlayerHand([]);
    setDealerHand([]);
    setMessage("");
    setHasDoubled(false);
    if (balance <= 0) {
      setBalance(1000);
      setMessage("You've been given $1000 to keep playing!");
    }
    setGameState("betting");
  };

  const dealerVisibleScore =
    gameState === "playing"
      ? cardValue(dealerHand[0])![0] === 1
        ? "A"
        : bestValue([dealerHand[0]])
      : dealerHand.length > 0
        ? bestValue(dealerHand)
        : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-green-950 flex flex-col items-center">
      <header className="w-full py-4 px-6 flex items-center justify-between bg-black/30 border-b border-green-700/50">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Blackjack
        </h1>
        <div className="flex items-center gap-4">
          <div className="bg-black/40 rounded-xl px-4 py-2 text-yellow-400 font-bold text-lg">
            ${balance}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl flex flex-col items-center justify-center gap-6 p-4 sm:p-8">
        {/* Dealer Hand */}
        {dealerHand.length > 0 && (
          <HandDisplay
            cards={dealerHand}
            label="Dealer"
            score={
              typeof dealerVisibleScore === "number"
                ? dealerVisibleScore
                : undefined
            }
            isActive={gameState === "dealerTurn"}
          />
        )}

        {/* Message */}
        {message && (
          <div
            className={`text-center text-lg sm:text-xl font-bold px-6 py-3 rounded-xl ${
              message.includes("win") || message.includes("Blackjack")
                ? "bg-yellow-400/20 text-yellow-300"
                : message.includes("lose") || message.includes("Bust")
                  ? "bg-red-400/20 text-red-300"
                  : "bg-white/10 text-white"
            }`}
          >
            {message}
          </div>
        )}

        {/* Player Hand */}
        {playerHand.length > 0 && (
          <HandDisplay
            cards={playerHand}
            label="Your Hand"
            score={bestValue(playerHand)}
            isActive={gameState === "playing"}
          />
        )}

        {/* Betting UI */}
        {gameState === "betting" && (
          <div className="flex flex-col items-center gap-5 bg-black/20 rounded-2xl p-6 sm:p-8">
            <p className="text-white/70 text-sm uppercase tracking-wider font-semibold">
              Place Your Bet
            </p>
            <div className="flex gap-2 sm:gap-3 flex-wrap justify-center">
              {CHIP_VALUES.map((val) => (
                <button
                  key={val}
                  onClick={() => addBet(val)}
                  disabled={val > balance - bet}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${CHIP_COLORS[val]} border-2 text-white font-bold text-sm sm:text-base shadow-lg hover:scale-110 active:scale-95 transition-transform disabled:opacity-30 disabled:hover:scale-100`}
                >
                  ${val}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white text-xl font-bold">
                Bet: ${bet}
              </span>
              {bet > 0 && (
                <button
                  onClick={clearBet}
                  className="text-white/60 hover:text-white text-sm underline transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              onClick={deal}
              disabled={bet === 0}
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-lg rounded-xl shadow-lg hover:shadow-yellow-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
            >
              Deal
            </button>
          </div>
        )}

        {/* Game Actions */}
        {gameState === "playing" && (
          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={hit}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              Hit
            </button>
            <button
              onClick={stand}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              Stand
            </button>
            {playerHand.length === 2 && !hasDoubled && balance >= bet * 2 && (
              <button
                onClick={doubleDown}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                Double Down
              </button>
            )}
          </div>
        )}

        {/* New Round */}
        {gameState === "resolved" && (
          <button
            onClick={newRound}
            className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-lg rounded-xl shadow-lg hover:shadow-yellow-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            {balance <= 0 ? "Start Fresh" : "New Hand"}
          </button>
        )}
      </main>

      <footer className="w-full py-3 text-center text-white/30 text-xs bg-black/20 border-t border-green-700/30">
        Hit on 16, stand on 17 &bull; Dealer stands on 17 &bull; Blackjack pays
        3:2
      </footer>
    </div>
  );
}
