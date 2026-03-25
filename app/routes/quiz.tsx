import { useState, useCallback, useMemo } from "react";
import {
  commands,
  categories,
  getCommandsByCategory,
  type Category,
  type BashCommand,
} from "../data/bash-commands";

export function meta() {
  return [
    { title: "Quiz — BashDojo" },
    { name: "description", content: "Test your bash command knowledge with interactive quizzes." },
  ];
}

type QuizMode = "identify" | "example" | "mixed";

interface Question {
  type: "identify" | "example";
  prompt: string;
  correctAnswer: string;
  options: string[];
  command: BashCommand;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffleArray(arr).slice(0, n);
}

function generateQuestions(pool: BashCommand[], count: number, mode: QuizMode): Question[] {
  const questions: Question[] = [];
  const shuffledPool = shuffleArray(pool);

  for (let i = 0; i < Math.min(count, shuffledPool.length); i++) {
    const cmd = shuffledPool[i];
    const questionType: "identify" | "example" =
      mode === "mixed"
        ? Math.random() > 0.5
          ? "identify"
          : "example"
        : mode;

    const distractors = pickRandom(
      pool.filter((c) => c.id !== cmd.id),
      3
    ).map((c) => c.name);

    const options = shuffleArray([cmd.name, ...distractors]);

    if (questionType === "identify") {
      questions.push({
        type: "identify",
        prompt: cmd.description,
        correctAnswer: cmd.name,
        options,
        command: cmd,
      });
    } else {
      const example = cmd.examples[Math.floor(Math.random() * cmd.examples.length)];
      questions.push({
        type: "example",
        prompt: `Which command does this? \n${example.code}`,
        correctAnswer: cmd.name,
        options,
        command: cmd,
      });
    }
  }

  return questions;
}

export default function Quiz() {
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [mode, setMode] = useState<QuizMode>("mixed");
  const [questionCount, setQuestionCount] = useState(10);
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [showResult, setShowResult] = useState(false);

  const pool = useMemo(
    () => (selectedCategory === "all" ? commands : getCommandsByCategory(selectedCategory)),
    [selectedCategory]
  );

  const startQuiz = useCallback(() => {
    const q = generateQuestions(pool, questionCount, mode);
    setQuestions(q);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResult(false);
    setStarted(true);
  }, [pool, questionCount, mode]);

  const submitAnswer = () => {
    setAnswers((prev) => [...prev, selectedAnswer]);
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setShowResult(true);
    }
  };

  const current = questions[currentIndex];
  const hasAnswered = answers.length > currentIndex;
  const isCorrect = hasAnswered && answers[currentIndex] === current?.correctAnswer;
  const score = answers.filter((a, i) => a === questions[i]?.correctAnswer).length;

  if (!started) {
    return (
      <div className="mx-auto max-w-xl space-y-8 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Quiz Mode</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Test your knowledge of bash commands with multiple-choice questions.
          </p>
        </div>

        <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedCategory("all")}
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
                    onClick={() => setSelectedCategory(cat.id)}
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Question Type</label>
            <div className="flex gap-2">
              {(["mixed", "identify", "example"] as QuizMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                    mode === m
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {m === "identify" ? "Description → Command" : m === "example" ? "Example → Command" : "Mixed"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Number of Questions
            </label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    questionCount === n
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startQuiz}
            disabled={pool.length < 4}
            className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition hover:shadow-green-500/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pool.length < 4 ? "Need at least 4 commands in pool" : "Start Quiz"}
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="mx-auto max-w-xl space-y-8 animate-fade-in">
        <div className="rounded-2xl border-2 border-emerald-200 bg-white p-8 text-center shadow-lg dark:border-emerald-800 dark:bg-gray-900">
          <div className="text-5xl font-extrabold text-emerald-600 dark:text-emerald-400">{pct}%</div>
          <p className="mt-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
            {score} of {questions.length} correct
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {pct === 100 ? "Perfect score!" : pct >= 80 ? "Great job!" : pct >= 60 ? "Good effort!" : "Keep studying!"}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={startQuiz}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Retry
            </button>
            <button
              onClick={() => setStarted(false)}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              Change Settings
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-bold text-lg">Review</h2>
          {questions.map((q, i) => {
            const correct = answers[i] === q.correctAnswer;
            return (
              <div
                key={i}
                className={`rounded-xl border p-4 ${
                  correct
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10"
                    : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`text-lg ${correct ? "text-emerald-500" : "text-red-500"}`}>
                    {correct ? "\u2713" : "\u2717"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {q.prompt}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-sm">
                      {!correct && (
                        <>
                          <span className="text-red-600 dark:text-red-400 line-through font-mono">{answers[i]}</span>
                          <span className="text-gray-400">&rarr;</span>
                        </>
                      )}
                      <span className="text-emerald-700 dark:text-emerald-400 font-mono font-medium">{q.correctAnswer}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        <span>
          Question {currentIndex + 1} of {questions.length}
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
        <span className="font-medium text-emerald-600 dark:text-emerald-400">{score}/{answers.length}</span>
      </div>

      {current && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
            {current.type === "identify" ? "Which command does this describe?" : "Identify the command"}
          </p>

          {current.type === "example" ? (
            <div className="rounded-xl bg-gray-900 px-4 py-3 mb-4 dark:bg-gray-800">
              <code className="font-mono text-sm text-green-400">$ {current.prompt.split("\n")[1]}</code>
            </div>
          ) : (
            <p className="text-gray-700 dark:text-gray-300 mb-4">{current.prompt}</p>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            {current.options.map((opt) => {
              let variant = "border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700";
              if (hasAnswered) {
                if (opt === current.correctAnswer) {
                  variant = "border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300";
                } else if (opt === selectedAnswer && !isCorrect) {
                  variant = "border-red-400 bg-red-50 text-red-800 dark:border-red-600 dark:bg-red-900/30 dark:text-red-300";
                } else {
                  variant = "border-gray-200 bg-gray-50 opacity-50 dark:border-gray-700 dark:bg-gray-800";
                }
              } else if (opt === selectedAnswer) {
                variant = "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-400/30 dark:border-emerald-600 dark:bg-emerald-900/20";
              }

              return (
                <button
                  key={opt}
                  onClick={() => !hasAnswered && setSelectedAnswer(opt)}
                  disabled={hasAnswered}
                  className={`rounded-xl border px-4 py-3 text-left font-mono text-sm font-medium transition ${variant}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {hasAnswered && (
            <div className={`mt-4 rounded-xl p-3 text-sm ${
              isCorrect
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
            }`}>
              {isCorrect ? (
                <span>Correct! <code className="font-mono font-bold">{current.correctAnswer}</code> — {current.command.description}</span>
              ) : (
                <span>The answer is <code className="font-mono font-bold">{current.correctAnswer}</code> — {current.command.description}</span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2">
        {!hasAnswered ? (
          <button
            onClick={submitAnswer}
            disabled={!selectedAnswer}
            className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition hover:shadow-green-500/40 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition hover:shadow-green-500/40 hover:brightness-110"
          >
            {currentIndex < questions.length - 1 ? "Next Question" : "See Results"}
          </button>
        )}
      </div>
    </div>
  );
}
