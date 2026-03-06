import { AppLayout } from "../components/layout";
import { useLeague } from "../lib/league-context";
import { calculateStandings } from "../lib/standings";

export function meta() {
  return [{ title: "Standings - Softball League Scheduler" }];
}

export default function Standings() {
  const { teams, games } = useLeague();
  const standings = calculateStandings(teams, games);
  const hasGames = games.some((g) => g.completed);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Standings</h2>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Current league standings and statistics
          </p>
        </div>

        {standings.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <p className="text-lg">No teams in the league</p>
            <p className="text-sm mt-1">Add teams to see standings</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 text-left text-gray-500 dark:text-gray-400">
                    <th className="px-6 py-3 font-medium w-10">#</th>
                    <th className="px-6 py-3 font-medium">Team</th>
                    <th className="px-6 py-3 font-medium text-center">GP</th>
                    <th className="px-6 py-3 font-medium text-center">W</th>
                    <th className="px-6 py-3 font-medium text-center">L</th>
                    <th className="px-6 py-3 font-medium text-center">T</th>
                    <th className="px-6 py-3 font-medium text-right">PCT</th>
                    <th className="px-6 py-3 font-medium text-center">RF</th>
                    <th className="px-6 py-3 font-medium text-center">RA</th>
                    <th className="px-6 py-3 font-medium text-center">DIFF</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((s, i) => {
                    const diff = s.runsFor - s.runsAgainst;
                    return (
                      <tr
                        key={s.team.id}
                        className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition"
                      >
                        <td className="px-6 py-4 text-gray-400 font-medium">{i + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: s.team.color }}
                            />
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {s.team.name}
                            </span>
                            {i === 0 && hasGames && (
                              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs px-1.5 py-0.5 rounded font-medium">
                                1st
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                          {s.gamesPlayed}
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-gray-900 dark:text-white">
                          {s.wins}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                          {s.losses}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                          {s.ties}
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-medium text-gray-900 dark:text-white">
                          {s.winPct.toFixed(3)}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                          {s.runsFor}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                          {s.runsAgainst}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`font-medium ${
                              diff > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : diff < 0
                                ? "text-red-500 dark:text-red-400"
                                : "text-gray-400"
                            }`}
                          >
                            {diff > 0 ? "+" : ""}
                            {diff}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!hasGames && standings.length > 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
            Standings will update once game scores are entered
          </p>
        )}
      </div>
    </AppLayout>
  );
}
