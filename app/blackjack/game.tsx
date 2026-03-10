import { useState, useCallback } from "react";

type Suit = "hearts" | "diamonds" | "clubs" | "spades";
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
  faceUp: boolean;
}

type GameState = "betting" | "playing" | "dealer-turn" | "finished";
type Result = "win" | "lose" | "push" | "blackjack" | null;

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
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

const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: "\u2665",
  diamonds: "\u2666",
  clubs: "\u2663",
  spades: "\u2660",
};

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, faceUp: true });
    }
  }
  return shuffle(deck);
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function cardValue(card: Card): number[] {
  if (card.rank === "A") return [1, 11];
  if (["J", "Q", "K"].includes(card.rank)) return [10];
  return [parseInt(card.rank)];
}

function handScore(hand: Card[]): number {
  const visibleCards = hand.filter((c) => c.faceUp);
  let totals = [0];
  for (const card of visibleCards) {
    const values = cardValue(card);
    const newTotals: number[] = [];
    for (const total of totals) {
      for (const v of values) {
        newTotals.push(total + v);
      }
    }
    totals = [...new Set(newTotals)];
  }
  const under21 = totals.filter((t) => t <= 21);
  return under21.length > 0 ? Math.max(...under21) : Math.min(...totals);
}

function isBusted(hand: Card[]): boolean {
  return handScore(hand) > 21;
}

function isBlackjack(hand: Card[]): boolean {
  return hand.length === 2 && handScore(hand) === 21;
}

function isRed(suit: Suit): boolean {
  return suit === "hearts" || suit === "diamonds";
}

function CardComponent({
  card,
  index,
  total,
}: {
  card: Card;
  index: number;
  total: number;
}) {
  if (!card.faceUp) {
    return (
      <div
        className="relative w-20 h-28 sm:w-24 sm:h-34 rounded-xl shadow-lg flex-shrink-0 transition-all duration-500"
        style={{
          marginLeft: index === 0 ? 0 : -20,
          zIndex: index,
          background:
            "linear-gradient(135deg, #0e4a6e 0%, #155e85 25%, #0e4a6e 50%, #155e85 75%, #0e4a6e 100%)",
          backgroundSize: "20px 20px",
          border: "2px solid rgba(255,255,255,0.2)",
        }}
      >
        <div className="absolute inset-2 rounded-lg border border-white/20 flex items-center justify-center">
          <span className="text-white/40 text-2xl sm:text-3xl">~</span>
        </div>
      </div>
    );
  }

  const red = isRed(card.suit);
  const symbol = SUIT_SYMBOLS[card.suit];

  return (
    <div
      className="relative w-20 h-28 sm:w-24 sm:h-34 bg-gradient-to-br from-white to-sky-50 rounded-xl shadow-lg flex-shrink-0 transition-all duration-500 hover:translate-y-[-2px] hover:shadow-xl"
      style={{
        marginLeft: index === 0 ? 0 : -20,
        zIndex: index,
        border: "1px solid rgba(14,74,110,0.15)",
      }}
    >
      <div className="absolute top-1.5 left-2 flex flex-col items-center leading-none">
        <span
          className={`text-xs sm:text-sm font-bold ${red ? "text-rose-500" : "text-slate-700"}`}
        >
          {card.rank}
        </span>
        <span
          className={`text-xs sm:text-sm ${red ? "text-rose-500" : "text-slate-700"}`}
        >
          {symbol}
        </span>
      </div>
      <div className="flex items-center justify-center h-full">
        <span
          className={`text-3xl sm:text-4xl ${red ? "text-rose-500" : "text-slate-700"}`}
        >
          {symbol}
        </span>
      </div>
      <div className="absolute bottom-1.5 right-2 flex flex-col items-center leading-none rotate-180">
        <span
          className={`text-xs sm:text-sm font-bold ${red ? "text-rose-500" : "text-slate-700"}`}
        >
          {card.rank}
        </span>
        <span
          className={`text-xs sm:text-sm ${red ? "text-rose-500" : "text-slate-700"}`}
        >
          {symbol}
        </span>
      </div>
    </div>
  );
}

function ScoreBadge({
  score,
  busted,
  blackjack,
}: {
  score: number;
  busted: boolean;
  blackjack: boolean;
}) {
  if (blackjack) {
    return (
      <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-amber-400/90 text-amber-900 shadow">
        Blackjack!
      </span>
    );
  }
  if (busted) {
    return (
      <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-rose-400/90 text-white shadow">
        Bust
      </span>
    );
  }
  return (
    <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-white/20 text-white backdrop-blur-sm">
      {score}
    </span>
  );
}

const BET_OPTIONS = [10, 25, 50, 100];

export default function BlackjackGame() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<GameState>("betting");
  const [result, setResult] = useState<Result>(null);
  const [chips, setChips] = useState(500);
  const [bet, setBet] = useState(0);
  const [message, setMessage] = useState("");

  const deal = useCallback(
    (currentBet: number) => {
      const newDeck = createDeck();
      const pHand: Card[] = [
        { ...newDeck[0], faceUp: true },
        { ...newDeck[2], faceUp: true },
      ];
      const dHand: Card[] = [
        { ...newDeck[1], faceUp: true },
        { ...newDeck[3], faceUp: false },
      ];
      const remaining = newDeck.slice(4);

      setDeck(remaining);
      setPlayerHand(pHand);
      setDealerHand(dHand);
      setBet(currentBet);
      setResult(null);
      setMessage("");

      if (isBlackjack(pHand)) {
        const revealedDealer = dHand.map((c) => ({ ...c, faceUp: true }));
        setDealerHand(revealedDealer);
        if (isBlackjack(revealedDealer)) {
          setResult("push");
          setMessage("Both blackjack — it's a push");
          setGameState("finished");
        } else {
          setResult("blackjack");
          setChips((c) => c + Math.floor(currentBet * 1.5));
          setMessage("Blackjack! Nice catch");
          setGameState("finished");
        }
      } else {
        setGameState("playing");
      }
    },
    []
  );

  const hit = useCallback(() => {
    if (deck.length === 0) return;
    const newCard = { ...deck[0], faceUp: true };
    const newHand = [...playerHand, newCard];
    const remaining = deck.slice(1);
    setDeck(remaining);
    setPlayerHand(newHand);

    if (isBusted(newHand)) {
      const revealedDealer = dealerHand.map((c) => ({ ...c, faceUp: true }));
      setDealerHand(revealedDealer);
      setResult("lose");
      setChips((c) => c - bet);
      setMessage("Busted... the tide will turn");
      setGameState("finished");
    }
  }, [deck, playerHand, dealerHand, bet]);

  const stand = useCallback(() => {
    let currentDeck = [...deck];
    let currentDealer = dealerHand.map((c) => ({ ...c, faceUp: true }));

    while (handScore(currentDealer) < 17) {
      if (currentDeck.length === 0) break;
      currentDealer = [
        ...currentDealer,
        { ...currentDeck[0], faceUp: true },
      ];
      currentDeck = currentDeck.slice(1);
    }

    setDeck(currentDeck);
    setDealerHand(currentDealer);

    const pScore = handScore(playerHand);
    const dScore = handScore(currentDealer);

    if (isBusted(currentDealer)) {
      setResult("win");
      setChips((c) => c + bet);
      setMessage("Dealer busts — smooth sailing");
    } else if (pScore > dScore) {
      setResult("win");
      setChips((c) => c + bet);
      setMessage("You win! Ride the wave");
    } else if (pScore < dScore) {
      setResult("lose");
      setChips((c) => c - bet);
      setMessage("Dealer wins... stay chill");
    } else {
      setResult("push");
      setMessage("Push — even as the horizon");
    }
    setGameState("finished");
  }, [deck, dealerHand, playerHand, bet]);

  const doubleDown = useCallback(() => {
    if (deck.length === 0) return;
    const doubleBet = bet * 2;
    const newCard = { ...deck[0], faceUp: true };
    const newHand = [...playerHand, newCard];
    const remaining = deck.slice(1);

    setDeck(remaining);
    setPlayerHand(newHand);
    setBet(doubleBet);

    if (isBusted(newHand)) {
      const revealedDealer = dealerHand.map((c) => ({ ...c, faceUp: true }));
      setDealerHand(revealedDealer);
      setResult("lose");
      setChips((c) => c - doubleBet);
      setMessage("Busted on the double... the tide will turn");
      setGameState("finished");
      return;
    }

    let currentDeck = [...remaining];
    let currentDealer = dealerHand.map((c) => ({ ...c, faceUp: true }));
    while (handScore(currentDealer) < 17) {
      if (currentDeck.length === 0) break;
      currentDealer = [
        ...currentDealer,
        { ...currentDeck[0], faceUp: true },
      ];
      currentDeck = currentDeck.slice(1);
    }
    setDeck(currentDeck);
    setDealerHand(currentDealer);

    const pScore = handScore(newHand);
    const dScore = handScore(currentDealer);

    if (isBusted(currentDealer)) {
      setResult("win");
      setChips((c) => c + doubleBet);
      setMessage("Double down pays off! Big wave energy");
    } else if (pScore > dScore) {
      setResult("win");
      setChips((c) => c + doubleBet);
      setMessage("Double win! Surf's up");
    } else if (pScore < dScore) {
      setResult("lose");
      setChips((c) => c - doubleBet);
      setMessage("Dealer takes it... stay chill");
    } else {
      setResult("push");
      setMessage("Push on the double");
    }
    setGameState("finished");
  }, [deck, playerHand, dealerHand, bet]);

  const playerScore = handScore(playerHand);
  const dealerScore = handScore(dealerHand);
  const canDouble =
    gameState === "playing" && playerHand.length === 2 && chips >= bet * 2;

  return (
    <div className="min-h-screen ocean-bg relative overflow-hidden flex flex-col">
      {/* Waves decoration */}
      <div className="wave wave-1" />
      <div className="wave wave-2" />
      <div className="wave wave-3" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 pt-6 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light text-white/90 tracking-wide">
            Blackjack
          </h1>
          <p className="text-xs sm:text-sm text-cyan-200/60 font-light tracking-widest uppercase">
            Ocean Breeze Casino
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
          <span className="text-amber-300 text-lg">&#9679;</span>
          <span className="text-white font-semibold text-lg">{chips}</span>
        </div>
      </header>

      {/* Game Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 gap-6 sm:gap-8 pb-8">
        {/* Betting Screen */}
        {gameState === "betting" && (
          <div className="flex flex-col items-center gap-8 animate-fade-in">
            <div className="text-center">
              <p className="text-cyan-100/70 text-sm mb-2 tracking-wide">
                Place your bet
              </p>
              <div className="flex gap-3 sm:gap-4">
                {BET_OPTIONS.map((amount) => (
                  <button
                    key={amount}
                    disabled={amount > chips}
                    onClick={() => {
                      setChips((c) => c);
                      deal(amount);
                    }}
                    className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 font-bold text-sm sm:text-base shadow-lg hover:shadow-amber-400/30 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 border-2 border-amber-300/50"
                  >
                    <span className="relative z-10">{amount}</span>
                    <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            {chips <= 0 && (
              <div className="text-center">
                <p className="text-rose-300 text-sm mb-3">
                  You're out of chips...
                </p>
                <button
                  onClick={() => setChips(500)}
                  className="px-6 py-2 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all text-sm"
                >
                  Fresh start (500 chips)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Playing / Finished Screen */}
        {(gameState === "playing" || gameState === "finished") && (
          <div className="w-full max-w-lg flex flex-col gap-6 sm:gap-8 animate-fade-in">
            {/* Dealer Hand */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                <span className="text-cyan-200/60 text-sm font-light tracking-wide uppercase">
                  Dealer
                </span>
                <ScoreBadge
                  score={dealerScore}
                  busted={isBusted(dealerHand)}
                  blackjack={
                    gameState === "finished" && isBlackjack(dealerHand)
                  }
                />
              </div>
              <div className="flex justify-center items-center">
                {dealerHand.map((card, i) => (
                  <CardComponent
                    key={`d-${i}`}
                    card={card}
                    index={i}
                    total={dealerHand.length}
                  />
                ))}
              </div>
            </div>

            {/* Result Message */}
            {gameState === "finished" && (
              <div className="text-center animate-fade-in">
                <p
                  className={`text-lg sm:text-xl font-light tracking-wide ${
                    result === "win" || result === "blackjack"
                      ? "text-emerald-300"
                      : result === "lose"
                        ? "text-rose-300"
                        : "text-cyan-200"
                  }`}
                >
                  {message}
                </p>
                {result !== "push" && (
                  <p className="text-white/40 text-sm mt-1">
                    {result === "win"
                      ? `+${bet}`
                      : result === "blackjack"
                        ? `+${Math.floor(bet * 1.5)}`
                        : `-${bet}`}
                  </p>
                )}
              </div>
            )}

            {/* Player Hand */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex justify-center items-center">
                {playerHand.map((card, i) => (
                  <CardComponent
                    key={`p-${i}`}
                    card={card}
                    index={i}
                    total={playerHand.length}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-cyan-200/60 text-sm font-light tracking-wide uppercase">
                  You
                </span>
                <ScoreBadge
                  score={playerScore}
                  busted={isBusted(playerHand)}
                  blackjack={isBlackjack(playerHand)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 sm:gap-4">
              {gameState === "playing" && (
                <>
                  <button
                    onClick={hit}
                    className="px-6 sm:px-8 py-2.5 rounded-full bg-white/15 backdrop-blur-sm text-white font-medium border border-white/20 hover:bg-white/25 active:scale-95 transition-all duration-200 shadow-lg"
                  >
                    Hit
                  </button>
                  <button
                    onClick={stand}
                    className="px-6 sm:px-8 py-2.5 rounded-full bg-cyan-500/30 backdrop-blur-sm text-cyan-100 font-medium border border-cyan-400/30 hover:bg-cyan-500/40 active:scale-95 transition-all duration-200 shadow-lg"
                  >
                    Stand
                  </button>
                  {canDouble && (
                    <button
                      onClick={doubleDown}
                      className="px-6 sm:px-8 py-2.5 rounded-full bg-amber-500/25 backdrop-blur-sm text-amber-200 font-medium border border-amber-400/30 hover:bg-amber-500/35 active:scale-95 transition-all duration-200 shadow-lg"
                    >
                      Double
                    </button>
                  )}
                </>
              )}
              {gameState === "finished" && (
                <button
                  onClick={() => setGameState("betting")}
                  className="px-8 py-2.5 rounded-full bg-white/15 backdrop-blur-sm text-white font-medium border border-white/20 hover:bg-white/25 active:scale-95 transition-all duration-200 shadow-lg"
                >
                  New Hand
                </button>
              )}
            </div>

            {/* Current Bet */}
            <div className="text-center">
              <span className="text-white/30 text-xs tracking-widest uppercase">
                Bet: {bet}
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
