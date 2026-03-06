import type { Route } from "./+types/home";
import { useLeague } from "~/lib/league-context";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Bowling League Scheduler" },
    { name: "description", content: "Manage your bowling league schedule" },
  ];
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

export default function Home() {
  const { state } = useLeague();
  const { config, teams, schedule } = state;

  const totalMatches = schedule.reduce((s, w) => s + w.matches.length, 0);
  const nextWeek = schedule.find(
    (w) => new Date(w.date) >= new Date(new Date().toISOString().split("T")[0])
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {config.name}
        </h1>
        <p className="text-gray-400">
          Season overview and quick actions
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Teams" value={teams.length} accent="text-indigo-400" />
        <StatCard label="Weeks" value={config.weeksCount} accent="text-emerald-400" />
        <StatCard label="Total Matches" value={totalMatches} accent="text-amber-400" />
        <StatCard
          label="Lanes Available"
          value={config.lanesAvailable}
          accent="text-cyan-400"
        />
      </div>

      {teams.length < 2 && (
        <div className="bg-indigo-950/50 border border-indigo-800 rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-indigo-300 mb-2">
            Get Started
          </h2>
          <p className="text-gray-400 mb-4">
            Add at least 2 teams to start building your schedule.
          </p>
          <Link
            to="/teams"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
          >
            Add Teams
          </Link>
        </div>
      )}

      {teams.length >= 2 && schedule.length === 0 && (
        <div className="bg-emerald-950/50 border border-emerald-800 rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-emerald-300 mb-2">
            Ready to Schedule
          </h2>
          <p className="text-gray-400 mb-4">
            You have {teams.length} teams. Generate your season schedule now.
          </p>
          <Link
            to="/schedule"
            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
          >
            Generate Schedule
          </Link>
        </div>
      )}

      {nextWeek && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Up Next &mdash; Week {nextWeek.weekNumber}{" "}
            <span className="text-gray-400 text-base font-normal">
              ({formatDate(nextWeek.date)})
            </span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {nextWeek.matches.map((m, i) => {
              const home = teams.find((t) => t.id === m.home);
              const away = teams.find((t) => t.id === m.away);
              return (
                <div
                  key={i}
                  className="flex items-center justify-between bg-gray-800/60 rounded-lg px-4 py-3"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: home?.color }}
                    />
                    <span className="font-medium">{home?.name ?? "?"}</span>
                  </span>
                  <span className="text-gray-500 text-sm mx-2">vs</span>
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{away?.name ?? "?"}</span>
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: away?.color }}
                    />
                  </span>
                  <span className="text-xs text-gray-500 ml-3">
                    Lane {m.lane}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
