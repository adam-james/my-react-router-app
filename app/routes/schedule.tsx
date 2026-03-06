import { useState } from "react";
import { AppLayout } from "../components/layout";
import { useLeague } from "../lib/league-context";
import type { Game } from "../lib/types";

export function meta() {
  return [{ title: "Schedule - Softball League Scheduler" }];
}

export default function Schedule() {
  const { teams, games, generateNewSchedule, clearSchedule, getTeamById, updateGameScore } = useLeague();
  const [editingGame, setEditingGame] = useState<string | null>(null);
  const [homeInput, setHomeInput] = useState("");
  const [awayInput, setAwayInput] = useState("");

  const weeks = new Map<number, Game[]>();
  for (const g of games) {
    const list = weeks.get(g.weekNumber) || [];
    list.push(g);
    weeks.set(g.weekNumber, list);
  }
  const sortedWeeks = Array.from(weeks.entries()).sort((a, b) => a[0] - b[0]);

  function startEdit(game: Game) {
    setEditingGame(game.id);
    setHomeInput(game.homeScore?.toString() || "");
    setAwayInput(game.awayScore?.toString() || "");
  }

  function saveScore(gameId: string) {
    const h = parseInt(homeInput);
    const a = parseInt(awayInput);
    if (!isNaN(h) && !isNaN(a) && h >= 0 && a >= 0) {
      updateGameScore(gameId, h, a);
    }
    setEditingGame(null);
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Schedule</h2>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              {games.length > 0
                ? `${games.length} games across ${weeks.size} weeks`
                : "Generate a schedule for your league"}
            </p>
          </div>
          <div className="flex gap-3">
            {games.length > 0 && (
              <button
                onClick={clearSchedule}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium text-sm transition-colors"
              >
                Clear Schedule
              </button>
            )}
            <button
              onClick={generateNewSchedule}
              disabled={teams.length < 2}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors"
            >
              {games.length > 0 ? "Regenerate" : "Generate Schedule"}
            </button>
          </div>
        </div>

        {teams.length < 2 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-amber-800 dark:text-amber-300 text-sm">
            You need at least 2 teams to generate a schedule. Go to the Teams page to add more.
          </div>
        )}

        {games.length === 0 && teams.length >= 2 && (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg">No schedule yet</p>
            <p className="text-sm mt-1">Click &ldquo;Generate Schedule&rdquo; to create a round-robin schedule</p>
          </div>
        )}

        {sortedWeeks.map(([weekNum, weekGames]) => (
          <div key={weekNum} className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Week {weekNum}
            </h3>
            <div className="space-y-2">
              {weekGames.map((game) => {
                const home = getTeamById(game.homeTeamId);
                const away = getTeamById(game.awayTeamId);
                const isEditing = editingGame === game.id;

                return (
                  <div
                    key={game.id}
                    className={`bg-white dark:bg-gray-900 rounded-xl border ${
                      game.completed
                        ? "border-gray-100 dark:border-gray-800"
                        : "border-gray-200 dark:border-gray-800"
                    } p-4 flex items-center gap-4 flex-wrap`}
                  >
                    <div className="flex items-center gap-3 min-w-[140px]">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: home?.color }} />
                      <span className={`font-medium ${game.completed ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"}`}>
                        {home?.name || "TBD"}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={homeInput}
                          onChange={(e) => setHomeInput(e.target.value)}
                          className="w-14 px-2 py-1 text-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm"
                          autoFocus
                        />
                        <span className="text-gray-400 text-sm">-</span>
                        <input
                          type="number"
                          min="0"
                          value={awayInput}
                          onChange={(e) => setAwayInput(e.target.value)}
                          className="w-14 px-2 py-1 text-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm"
                        />
                        <button
                          onClick={() => saveScore(game.id)}
                          className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingGame(null)}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : game.completed ? (
                      <button
                        onClick={() => startEdit(game)}
                        className="flex items-center gap-1 text-sm font-bold"
                      >
                        <span className={game.homeScore! > game.awayScore! ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"}>
                          {game.homeScore}
                        </span>
                        <span className="text-gray-300 dark:text-gray-600 mx-1">-</span>
                        <span className={game.awayScore! > game.homeScore! ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"}>
                          {game.awayScore}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(game)}
                        className="text-xs text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-dashed border-gray-300 dark:border-gray-700 rounded px-2 py-0.5 transition"
                      >
                        Enter score
                      </button>
                    )}

                    <div className="flex items-center gap-3 min-w-[140px]">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: away?.color }} />
                      <span className={`font-medium ${game.completed ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"}`}>
                        {away?.name || "TBD"}
                      </span>
                    </div>

                    <div className="ml-auto flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                      <span>{game.date}</span>
                      <span>{game.time}</span>
                      <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                        {game.field}
                      </span>
                      {game.completed && (
                        <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-medium">
                          Final
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
