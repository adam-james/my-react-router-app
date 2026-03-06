import type { LeagueState } from "./types";

const STORAGE_KEY = "bowling-league-state";

const DEFAULT_STATE: LeagueState = {
  config: {
    name: "Thursday Night Bowling League",
    startDate: new Date().toISOString().split("T")[0],
    weeksCount: 12,
    lanesAvailable: 8,
  },
  teams: [],
  schedule: [],
};

export function loadState(): LeagueState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return JSON.parse(raw) as LeagueState;
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: LeagueState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
