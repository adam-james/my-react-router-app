import { useState } from "react";
import { useLeague } from "~/lib/league-context";

export function meta() {
  return [{ title: "Teams | Bowling League Scheduler" }];
}

export default function TeamsPage() {
  const { state, addTeam, removeTeam, renameTeam } = useLeague();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    addTeam(name);
    setNewName("");
  }

  function startEditing(id: string, currentName: string) {
    setEditingId(id);
    setEditValue(currentName);
  }

  function commitEdit(id: string) {
    const name = editValue.trim();
    if (name) renameTeam(id, name);
    setEditingId(null);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Teams</h1>
        <p className="text-gray-400">
          {state.teams.length} team{state.teams.length !== 1 ? "s" : ""} registered
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-3 max-w-lg">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter team name..."
          className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors"
        >
          Add Team
        </button>
      </form>

      {state.teams.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No teams yet</p>
          <p className="text-sm mt-1">Add your first team above to get started.</p>
        </div>
      ) : (
        <div className="grid gap-3 max-w-lg">
          {state.teams.map((team, index) => (
            <div
              key={team.id}
              className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 group"
            >
              <span
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: team.color }}
              />
              <span className="text-gray-500 text-sm w-6 text-right shrink-0">
                {index + 1}.
              </span>

              {editingId === team.id ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => commitEdit(team.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit(team.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              ) : (
                <span
                  className="flex-1 font-medium cursor-pointer"
                  onClick={() => startEditing(team.id, team.name)}
                  title="Click to rename"
                >
                  {team.name}
                </span>
              )}

              <button
                onClick={() => removeTeam(team.id)}
                className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Remove team"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {state.schedule.length > 0 && (
        <p className="text-amber-400 text-sm">
          Modifying teams will clear the current schedule. You'll need to
          regenerate it.
        </p>
      )}
    </div>
  );
}
