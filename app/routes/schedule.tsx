import { useState } from "react";
import { useLeague } from "~/lib/league-context";

export function meta() {
  return [{ title: "Schedule | Bowling League Scheduler" }];
}

export default function SchedulePage() {
  const { state, generateNewSchedule, clearSchedule } = useLeague();
  const { teams, schedule, config } = state;
  const [expandedWeek, setExpandedWeek] = useState<number | null>(
    schedule.length > 0 ? 1 : null
  );

  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const canGenerate = teams.length >= 2;

  function toggle(weekNum: number) {
    setExpandedWeek((prev) => (prev === weekNum ? null : weekNum));
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Schedule</h1>
          <p className="text-gray-400">
            {schedule.length > 0
              ? `${schedule.length} weeks scheduled`
              : "No schedule generated yet"}
          </p>
        </div>
        <div className="flex gap-3">
          {schedule.length > 0 && (
            <button
              onClick={clearSchedule}
              className="px-4 py-2 border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => {
              generateNewSchedule();
              setExpandedWeek(1);
            }}
            disabled={!canGenerate}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors text-sm"
          >
            {schedule.length > 0 ? "Regenerate" : "Generate Schedule"}
          </button>
        </div>
      </div>

      {!canGenerate && (
        <div className="bg-amber-950/40 border border-amber-800 rounded-xl p-5 text-amber-300 text-sm">
          You need at least 2 teams to generate a schedule. Go to the Teams page
          to add more.
        </div>
      )}

      {schedule.length > 0 && (
        <div className="space-y-3">
          {schedule.map((week) => {
            const isOpen = expandedWeek === week.weekNumber;
            const isPast = new Date(week.date) < new Date(new Date().toISOString().split("T")[0]);
            return (
              <div
                key={week.weekNumber}
                className={`border rounded-xl overflow-hidden transition-colors ${
                  isPast
                    ? "border-gray-800 bg-gray-900/50"
                    : "border-gray-800 bg-gray-900"
                }`}
              >
                <button
                  onClick={() => toggle(week.weekNumber)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isPast
                          ? "bg-gray-800 text-gray-500"
                          : "bg-indigo-600/20 text-indigo-400"
                      }`}
                    >
                      {week.weekNumber}
                    </span>
                    <div>
                      <span className="font-semibold text-white">
                        Week {week.weekNumber}
                      </span>
                      <span className="text-gray-500 text-sm ml-3">
                        {formatDate(week.date)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm">
                      {week.matches.length} match
                      {week.matches.length !== 1 ? "es" : ""}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-gray-800">
                    <table className="w-full mt-3">
                      <thead>
                        <tr className="text-gray-500 text-xs uppercase tracking-wider">
                          <th className="text-left py-2 font-medium">Lane</th>
                          <th className="text-left py-2 font-medium">Home</th>
                          <th className="py-2 font-medium"></th>
                          <th className="text-left py-2 font-medium">Away</th>
                        </tr>
                      </thead>
                      <tbody>
                        {week.matches.map((m, i) => {
                          const home = teamMap.get(m.home);
                          const away = teamMap.get(m.away);
                          return (
                            <tr
                              key={i}
                              className="border-t border-gray-800/60"
                            >
                              <td className="py-3 text-gray-500 font-mono text-sm w-16">
                                {m.lane}
                              </td>
                              <td className="py-3">
                                <span className="flex items-center gap-2">
                                  <span
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                      backgroundColor: home?.color,
                                    }}
                                  />
                                  <span className="font-medium">
                                    {home?.name ?? "Unknown"}
                                  </span>
                                </span>
                              </td>
                              <td className="py-3 text-center text-gray-600 text-sm">
                                vs
                              </td>
                              <td className="py-3">
                                <span className="flex items-center gap-2">
                                  <span
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                      backgroundColor: away?.color,
                                    }}
                                  />
                                  <span className="font-medium">
                                    {away?.name ?? "Unknown"}
                                  </span>
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
