import { Link } from "react-router";
import type { Route } from "./+types/home";
import { categories, commands, getCommandsByCategory } from "../data/bash-commands";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "BashDojo — Learn Bash Commands" },
    { name: "description", content: "Master essential bash commands with flashcards, quizzes, and a searchable reference." },
  ];
}

export default function Home() {
  return (
    <div className="space-y-12 animate-fade-in">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Master the <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">Command Line</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Learn {commands.length} essential bash commands through interactive flashcards, quizzes, and a comprehensive reference guide.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/study"
            className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition hover:shadow-green-500/40 hover:brightness-110"
          >
            Start Studying
          </Link>
          <Link
            to="/quiz"
            className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Take a Quiz
          </Link>
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Categories</h2>
          <Link to="/browse" className="text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400">
            Browse all commands &rarr;
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const count = getCommandsByCategory(cat.id).length;
            return (
              <Link
                key={cat.id}
                to={`/browse?category=${cat.id}`}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{cat.label}</h3>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{cat.description}</p>
                    <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      {count} command{count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-bold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{commands.length}</div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">Commands</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{categories.length}</div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">Categories</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {commands.reduce((acc, c) => acc + c.examples.length, 0)}
            </div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">Examples</div>
          </div>
        </div>
      </section>
    </div>
  );
}
