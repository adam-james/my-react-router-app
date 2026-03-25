import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  categories,
  commands,
  searchCommands,
  getCommandsByCategory,
  type Category,
  type BashCommand,
} from "../data/bash-commands";

export function meta() {
  return [
    { title: "Browse Commands — BashDojo" },
    { name: "description", content: "Search and browse all bash commands by category." },
  ];
}

function CommandCard({ cmd }: { cmd: BashCommand }) {
  const cat = categories.find((c) => c.id === cmd.category);
  return (
    <Link
      to={`/browse/${cmd.id}`}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-emerald-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-emerald-700"
    >
      <div className="flex items-center gap-2">
        <code className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-base font-semibold text-emerald-700 dark:bg-gray-800 dark:text-emerald-400">
          {cmd.name}
        </code>
        {cat && (
          <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {cat.icon} {cat.label}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-600 line-clamp-2 dark:text-gray-400">{cmd.description}</p>
      <code className="mt-3 block truncate rounded-md bg-gray-50 px-2 py-1 font-mono text-xs text-gray-500 dark:bg-gray-800/60 dark:text-gray-500">
        {cmd.synopsis}
      </code>
    </Link>
  );
}

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category") as Category | null;
  const [query, setQuery] = useState("");

  let filtered: BashCommand[];
  if (query.trim()) {
    filtered = searchCommands(query);
    if (categoryFilter) {
      filtered = filtered.filter((c) => c.category === categoryFilter);
    }
  } else if (categoryFilter) {
    filtered = getCommandsByCategory(categoryFilter);
  } else {
    filtered = commands;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Browse Commands</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {filtered.length} command{filtered.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-emerald-500"
          />
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSearchParams({})}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              !categoryFilter
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSearchParams({ category: cat.id })}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                categoryFilter === cat.id
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((cmd) => (
          <CommandCard key={cmd.id} cmd={cmd} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-gray-400">
          <p className="text-lg">No commands found</p>
          <p className="mt-1 text-sm">Try a different search term or category</p>
        </div>
      )}
    </div>
  );
}
