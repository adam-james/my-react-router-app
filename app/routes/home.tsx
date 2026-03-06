import type { Route } from "./+types/home";
import { Link } from "react-router";
import { AppLayout } from "../components/layout";
import { useLeague } from "../lib/league-context";
import { calculateStandings } from "../lib/standings";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Softball League Scheduler" },
    { name: "description", content: "Manage your softball league schedule, teams, and standings" },
  ];
}

export default function Home() {
  const { teams, games, settings } = useLeague();
  const standings = calculateStandings(teams, games);

  const completedGames = games.filter((g) => g.completed);
  const upcomingGames = games.filter((g) => !g.completed);
  const nextGame = upcomingGames[0];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {settings.leagueName}
          </h2>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Season overview and quick stats
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Teams" value={teams.length} color="emerald" />
          <StatCard label="Total Games" value={games.length} color="blue" />
          <StatCard label="Completed" value={completedGames.length} color="violet" />
          <StatCard label="Remaining" value={upcomingGames.length} color="amber" />
        </div>

        {teams.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Get started
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Add teams to your league, configure settings, then generate a schedule.
            </p>
            <Link
              to="/teams"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
            >
              Add Teams
            </Link>
          </div>
        )}

        {nextGame && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Next Game
            </h3>
            <NextGameCard game={nextGame} />
          </div>
        )}

        {standings.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Standings
              </h3>
              <Link
                to="/standings"
                className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                View full standings
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">Team</th>
                    <th className="pb-2 font-medium text-center">W</th>
                    <th className="pb-2 font-medium text-center">L</th>
                    <th className="pb-2 font-medium text-center">T</th>
                    <th className="pb-2 font-medium text-right">PCT</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.slice(0, 5).map((s, i) => (
                    <tr key={s.team.id} className="border-b border-gray-50 dark:border-gray-800/50">
                      <td className="py-2 text-gray-400">{i + 1}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: s.team.color }}
                          />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {s.team.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 text-center text-gray-700 dark:text-gray-300">{s.wins}</td>
                      <td className="py-2 text-center text-gray-700 dark:text-gray-300">{s.losses}</td>
                      <td className="py-2 text-center text-gray-700 dark:text-gray-300">{s.ties}</td>
                      <td className="py-2 text-right font-mono text-gray-700 dark:text-gray-300">
                        {s.winPct.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    violet: "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${colors[color]?.split(" ").slice(2).join(" ") || ""}`}>
        {value}
      </p>
    </div>
  );
}

function NextGameCard({ game }: { game: import("../lib/types").Game }) {
  const { getTeamById } = useLeague();
  const home = getTeamById(game.homeTeamId);
  const away = getTeamById(game.awayTeamId);

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: home?.color }} />
        <span className="font-semibold text-gray-900 dark:text-white truncate">
          {home?.name || "TBD"}
        </span>
      </div>
      <span className="text-gray-400 font-medium">vs</span>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: away?.color }} />
        <span className="font-semibold text-gray-900 dark:text-white truncate">
          {away?.name || "TBD"}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span>{game.date}</span>
        <span>{game.time}</span>
        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{game.field}</span>
      </div>
    </div>
  );
}
