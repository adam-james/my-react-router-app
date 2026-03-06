import { AppLayout } from "../components/layout";
import { useLeague } from "../lib/league-context";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function meta() {
  return [{ title: "Settings - Softball League Scheduler" }];
}

export default function Settings() {
  const { settings, updateSettings, resetAll } = useLeague();

  function handleDayToggle(day: number) {
    const current = settings.daysOfWeek;
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort();
    if (next.length > 0) {
      updateSettings({ daysOfWeek: next });
    }
  }

  function handleFieldsChange(value: string) {
    updateSettings({
      fields: value
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
    });
  }

  function handleTimesChange(value: string) {
    updateSettings({
      gameTimes: value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  }

  return (
    <AppLayout>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Configure your league schedule parameters
          </p>
        </div>

        <div className="space-y-6">
          <Section title="League Info">
            <Field label="League Name">
              <input
                type="text"
                value={settings.leagueName}
                onChange={(e) => updateSettings({ leagueName: e.target.value })}
                className="input-field"
              />
            </Field>
            <Field label="Season Start Date">
              <input
                type="date"
                value={settings.seasonStartDate}
                onChange={(e) => updateSettings({ seasonStartDate: e.target.value })}
                className="input-field"
              />
            </Field>
          </Section>

          <Section title="Schedule Parameters">
            <Field label="Weeks in Season">
              <input
                type="number"
                min="1"
                max="52"
                value={settings.weeksInSeason}
                onChange={(e) => updateSettings({ weeksInSeason: parseInt(e.target.value) || 1 })}
                className="input-field"
              />
            </Field>
            <Field label="Game Days">
              <div className="flex flex-wrap gap-2">
                {DAY_NAMES.map((name, i) => (
                  <button
                    key={i}
                    onClick={() => handleDayToggle(i)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      settings.daysOfWeek.includes(i)
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {name.slice(0, 3)}
                  </button>
                ))}
              </div>
            </Field>
          </Section>

          <Section title="Fields & Times">
            <Field label="Fields (comma-separated)">
              <input
                type="text"
                value={settings.fields.join(", ")}
                onChange={(e) => handleFieldsChange(e.target.value)}
                className="input-field"
                placeholder="Field 1, Field 2"
              />
            </Field>
            <Field label="Game Times (comma-separated)">
              <input
                type="text"
                value={settings.gameTimes.join(", ")}
                onChange={(e) => handleTimesChange(e.target.value)}
                className="input-field"
                placeholder="6:00 PM, 7:30 PM"
              />
            </Field>
          </Section>

          <Section title="Danger Zone">
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="font-medium text-red-800 dark:text-red-300">Reset Everything</p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">
                    Delete all teams, games, and reset settings to defaults
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Are you sure? This will delete all data.")) {
                      resetAll();
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Reset All Data
                </button>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </AppLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-5">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {children}
    </div>
  );
}
