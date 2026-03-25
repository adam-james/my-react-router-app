import { Link, useParams } from "react-router";
import { commands, categories } from "../data/bash-commands";

export function meta() {
  return [{ title: "Command Detail — BashDojo" }];
}

export default function CommandDetail() {
  const { commandId } = useParams();
  const cmd = commands.find((c) => c.id === commandId);

  if (!cmd) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">Command not found</h1>
        <Link to="/browse" className="mt-4 inline-block text-sm text-emerald-600 hover:underline">
          &larr; Back to browse
        </Link>
      </div>
    );
  }

  const cat = categories.find((c) => c.id === cmd.category);
  const relatedCmds = cmd.related
    ?.map((name) => commands.find((c) => c.name === name))
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-fade-in">
      <Link to="/browse" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to browse
      </Link>

      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <h1 className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400">{cmd.name}</h1>
          {cat && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {cat.icon} {cat.label}
            </span>
          )}
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300">{cmd.description}</p>
        <div className="rounded-xl bg-gray-900 px-4 py-3 dark:bg-gray-800">
          <code className="font-mono text-sm text-green-400">{cmd.synopsis}</code>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Examples</h2>
        <div className="space-y-3">
          {cmd.examples.map((ex, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="bg-gray-900 px-4 py-3 dark:bg-gray-800">
                <code className="font-mono text-sm text-green-400">$ {ex.code}</code>
              </div>
              <div className="bg-white px-4 py-2.5 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-400">
                {ex.explanation}
              </div>
            </div>
          ))}
        </div>
      </section>

      {cmd.tips && cmd.tips.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">Tips</h2>
          <ul className="space-y-2">
            {cmd.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="mt-0.5 text-emerald-500">&#x2713;</span>
                {tip}
              </li>
            ))}
          </ul>
        </section>
      )}

      {relatedCmds && relatedCmds.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">Related Commands</h2>
          <div className="flex flex-wrap gap-2">
            {relatedCmds.map((rc) =>
              rc ? (
                <Link
                  key={rc.id}
                  to={`/browse/${rc.id}`}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-mono text-sm font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-gray-700 dark:bg-gray-900 dark:text-emerald-400 dark:hover:border-emerald-600"
                >
                  {rc.name}
                </Link>
              ) : null
            )}
          </div>
        </section>
      )}
    </div>
  );
}
