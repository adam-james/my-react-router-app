import { useState, useCallback } from "react";
import {
  commands,
  categories,
  getCommandsByCategory,
  type Category,
  type BashCommand,
} from "../data/bash-commands";

export function meta() {
  return [
    { title: "Study Flashcards — BashDojo" },
    { name: "description", content: "Study bash commands with interactive flashcards." },
  ];
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Study() {
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [deck, setDeck] = useState<BashCommand[]>(() => shuffleArray(commands));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());

  const startDeck = useCallback(
    (cat: Category | "all") => {
      setSelectedCategory(cat);
      const pool = cat === "all" ? commands : getCommandsByCategory(cat);
      setDeck(shuffleArray(pool));
      setIndex(0);
      setFlipped(false);
      setKnownIds(new Set());
    },
    []
  );

  const current = deck[index];
  const progress = deck.length > 0 ? ((index + 1) / deck.length) * 100 : 0;

  const next = () => {
    setFlipped(false);
    setIndex((i) => Math.min(i + 1, deck.length - 1));
  };

  const prev = () => {
    setFlipped(false);
    setIndex((i) => Math.max(i - 1, 0));
  };

  const markKnown = () => {
    if (current) {
      setKnownIds((prev) => new Set(prev).add(current.id));
    }
    next();
  };

  const isComplete = index >= deck.length - 1 && flipped;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Flashcard Study</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Flip cards to reveal descriptions and examples. Mark commands you know.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => startDeck("all")}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
            selectedCategory === "all"
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          All ({commands.length})
        </button>
        {categories.map((cat) => {
          const count = getCommandsByCategory(cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => startDeck(cat.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                selectedCategory === cat.id
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {cat.icon} {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {deck.length > 0 && (
        <>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span>
              Card {index + 1} of {deck.length}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {knownIds.size} known
            </span>
          </div>

          {current && (
            <div className="perspective-1000">
              <button
                onClick={() => setFlipped(!flipped)}
                className="w-full text-left"
                aria-label={flipped ? "Show command name" : "Show description"}
              >
                <div
                  className={`min-h-[320px] rounded-2xl border-2 transition-all duration-300 shadow-lg ${
                    knownIds.has(current.id)
                      ? "border-emerald-300 dark:border-emerald-700"
                      : "border-gray-200 dark:border-gray-800"
                  } ${flipped ? "bg-white dark:bg-gray-900" : "bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900"}`}
                >
                  {!flipped ? (
                    <div className="flex h-full min-h-[320px] flex-col items-center justify-center p-8">
                      <code className="text-4xl font-bold text-green-400 font-mono">
                        {current.name}
                      </code>
                      <code className="mt-3 text-sm text-gray-400 font-mono">
                        {current.synopsis}
                      </code>
                      <p className="mt-6 text-xs text-gray-500">Click to reveal</p>
                    </div>
                  ) : (
                    <div className="p-6 space-y-4 animate-flip">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">
                          {current.name}
                        </code>
                        <span className="text-xs text-gray-400">
                          {categories.find((c) => c.id === current.category)?.icon}{" "}
                          {categories.find((c) => c.id === current.category)?.label}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{current.description}</p>
                      <div className="space-y-2">
                        {current.examples.slice(0, 3).map((ex, i) => (
                          <div key={i} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                            <code className="block font-mono text-sm text-green-700 dark:text-green-400">
                              $ {ex.code}
                            </code>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{ex.explanation}</p>
                          </div>
                        ))}
                      </div>
                      {current.tips && current.tips.length > 0 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">Tip:</span>{" "}
                          {current.tips[0]}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={prev}
              disabled={index === 0}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              &larr; Previous
            </button>
            <div className="flex gap-2">
              <button
                onClick={markKnown}
                disabled={!current}
                className="rounded-xl bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
              >
                &#x2713; I know this
              </button>
              <button
                onClick={next}
                disabled={index >= deck.length - 1}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                Next &rarr;
              </button>
            </div>
          </div>

          {isComplete && (
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-900/20">
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                Deck complete!
              </p>
              <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
                You marked {knownIds.size} of {deck.length} commands as known.
              </p>
              <button
                onClick={() => startDeck(selectedCategory)}
                className="mt-4 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Restart Deck
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
