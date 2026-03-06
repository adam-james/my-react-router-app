import { useState, useCallback } from "react";

type Player = "X" | "O";
type Cell = Player | null;

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function getWinner(board: Cell[]): { player: Player; line: number[] } | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], line };
    }
  }
  return null;
}

function Sun() {
  return (
    <svg
      className="sun-glow"
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="32" cy="32" r="16" fill="#f9ca24" />
      <circle cx="32" cy="32" r="20" fill="#f9ca24" opacity="0.3" />
      {[...Array(8)].map((_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        const x1 = 32 + Math.cos(angle) * 23;
        const y1 = 32 + Math.sin(angle) * 23;
        const x2 = 32 + Math.cos(angle) * 30;
        const y2 = 32 + Math.sin(angle) * 30;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#f9ca24"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function XMark({ highlight }: { highlight: boolean }) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      className={`transition-all duration-300 ${highlight ? "scale-110" : ""}`}
    >
      <line
        x1="12"
        y1="12"
        x2="36"
        y2="36"
        stroke={highlight ? "#f9ca24" : "#e67e22"}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="36"
        y1="12"
        x2="12"
        y2="36"
        stroke={highlight ? "#f9ca24" : "#e67e22"}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function OMark({ highlight }: { highlight: boolean }) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      className={`transition-all duration-300 ${highlight ? "scale-110" : ""}`}
    >
      <circle
        cx="24"
        cy="24"
        r="13"
        stroke={highlight ? "#ffeaa7" : "#c0392b"}
        strokeWidth="4"
        fill="none"
      />
    </svg>
  );
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [scores, setScores] = useState({ X: 0, O: 0 });

  const winner = getWinner(board);
  const isDraw = !winner && board.every((cell) => cell !== null);

  const handleClick = useCallback(
    (index: number) => {
      if (board[index] || winner) return;

      const newBoard = [...board];
      newBoard[index] = currentPlayer;
      setBoard(newBoard);

      const result = getWinner(newBoard);
      if (result) {
        setScores((s) => ({ ...s, [result.player]: s[result.player] + 1 }));
      }

      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    },
    [board, currentPlayer, winner]
  );

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
  };

  const resetAll = () => {
    resetGame();
    setScores({ X: 0, O: 0 });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 select-none">
      <div className="animate-fade-in flex flex-col items-center gap-2 mb-8">
        <Sun />
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-amber-100 drop-shadow-lg">
          Tic Tac Toe
        </h1>
        <p className="text-amber-200/60 text-sm tracking-widest uppercase">
          Sunset Edition
        </p>
      </div>

      <div
        className="animate-fade-in flex justify-center gap-8 mb-6 text-sm font-semibold"
        style={{ animationDelay: "100ms" }}
      >
        <div
          className={`px-5 py-2.5 rounded-xl backdrop-blur-sm transition-all duration-300 ${
            currentPlayer === "X" && !winner && !isDraw
              ? "bg-orange-500/30 ring-2 ring-orange-400/50 text-orange-200 scale-105"
              : "bg-white/5 text-amber-200/50"
          }`}
        >
          <span className="text-orange-400 mr-1.5">X</span>
          {scores.X}
        </div>
        <div
          className={`px-5 py-2.5 rounded-xl backdrop-blur-sm transition-all duration-300 ${
            currentPlayer === "O" && !winner && !isDraw
              ? "bg-red-500/30 ring-2 ring-red-400/50 text-red-200 scale-105"
              : "bg-white/5 text-amber-200/50"
          }`}
        >
          <span className="text-red-400 mr-1.5">O</span>
          {scores.O}
        </div>
      </div>

      <div
        className="animate-fade-in grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10 shadow-2xl"
        style={{ animationDelay: "200ms" }}
      >
        {board.map((cell, i) => {
          const isWinning = winner?.line.includes(i);
          return (
            <button
              key={i}
              onClick={() => handleClick(i)}
              disabled={!!cell || !!winner}
              className={`
                w-24 h-24 sm:w-28 sm:h-28
                flex items-center justify-center
                rounded-xl
                backdrop-blur-sm
                transition-all duration-200
                cell-hover
                cursor-pointer
                ${isWinning ? "winner-cell bg-amber-400/15" : "bg-white/5 hover:bg-white/10"}
                ${!cell && !winner ? "cursor-pointer" : "cursor-default"}
                border border-white/10
              `}
            >
              {cell === "X" && <XMark highlight={!!isWinning} />}
              {cell === "O" && <OMark highlight={!!isWinning} />}
            </button>
          );
        })}
      </div>

      <div
        className="animate-fade-in mt-6 h-16 flex flex-col items-center justify-center"
        style={{ animationDelay: "300ms" }}
      >
        {winner && (
          <p className="text-2xl font-bold text-amber-100 drop-shadow-lg animate-fade-in">
            <span className={winner.player === "X" ? "text-orange-400" : "text-red-400"}>
              {winner.player}
            </span>{" "}
            wins!
          </p>
        )}
        {isDraw && (
          <p className="text-2xl font-bold text-amber-200/70 animate-fade-in">
            It's a draw!
          </p>
        )}
        {!winner && !isDraw && (
          <p className="text-amber-200/40 text-sm">
            <span className={currentPlayer === "X" ? "text-orange-400" : "text-red-400"}>
              {currentPlayer}
            </span>
            's turn
          </p>
        )}
      </div>

      <div
        className="animate-fade-in flex gap-3 mt-2"
        style={{ animationDelay: "400ms" }}
      >
        <button
          onClick={resetGame}
          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-100 text-sm font-medium backdrop-blur-sm border border-white/10 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          New Game
        </button>
        <button
          onClick={resetAll}
          className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-amber-200/50 hover:text-amber-200/80 text-sm font-medium backdrop-blur-sm border border-white/5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          Reset Scores
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-32 pointer-events-none">
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0 60 Q 360 0 720 60 T 1440 60 V 120 H 0 Z"
            fill="rgba(26, 5, 51, 0.3)"
          />
          <path
            d="M0 80 Q 360 30 720 80 T 1440 80 V 120 H 0 Z"
            fill="rgba(26, 5, 51, 0.5)"
          />
        </svg>
      </div>
    </div>
  );
}
