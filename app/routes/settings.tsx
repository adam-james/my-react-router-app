import { useState } from "react";
import { useLeague } from "~/lib/league-context";
import type { LeagueConfig } from "~/lib/types";

export function meta() {
  return [{ title: "Settings | Bowling League Scheduler" }];
}

export default function SettingsPage() {
  const { state, updateConfig, resetAll } = useLeague();
  const [form, setForm] = useState<LeagueConfig>({ ...state.config });
  const [showReset, setShowReset] = useState(false);

  const dirty =
    form.name !== state.config.name ||
    form.startDate !== state.config.startDate ||
    form.weeksCount !== state.config.weeksCount ||
    form.lanesAvailable !== state.config.lanesAvailable;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateConfig(form);
  }

  function handleReset() {
    resetAll();
    setShowReset(false);
    setForm({
      name: "Thursday Night Bowling League",
      startDate: new Date().toISOString().split("T")[0],
      weeksCount: 12,
      lanesAvailable: 8,
    });
  }

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Configure your league parameters</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Field label="League Name">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </Field>

        <Field label="Season Start Date">
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Number of Weeks">
            <input
              type="number"
              min={1}
              max={52}
              value={form.weeksCount}
              onChange={(e) =>
                setForm({ ...form, weeksCount: parseInt(e.target.value) || 1 })
              }
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </Field>

          <Field label="Lanes Available">
            <input
              type="number"
              min={1}
              max={40}
              value={form.lanesAvailable}
              onChange={(e) =>
                setForm({
                  ...form,
                  lanesAvailable: parseInt(e.target.value) || 1,
                })
              }
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </Field>
        </div>

        {state.schedule.length > 0 && dirty && (
          <p className="text-amber-400 text-sm">
            Saving changes will clear the current schedule. You'll need to
            regenerate it.
          </p>
        )}

        <button
          type="submit"
          disabled={!dirty || !form.name.trim()}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors"
        >
          Save Changes
        </button>
      </form>

      <div className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
        <p className="text-gray-400 text-sm mb-4">
          Reset everything &mdash; teams, schedule, and settings &mdash; back to
          defaults.
        </p>
        {showReset ? (
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Confirm Reset
            </button>
            <button
              onClick={() => setShowReset(false)}
              className="px-4 py-2 border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowReset(true)}
            className="px-4 py-2 border border-red-800 text-red-400 hover:bg-red-950/50 rounded-lg transition-colors text-sm font-medium"
          >
            Reset All Data
          </button>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-300 mb-1.5 block">
        {label}
      </span>
      {children}
    </label>
  );
}
