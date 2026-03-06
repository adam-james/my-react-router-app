import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { Team, Game, LeagueSettings, LeagueState } from "./types";
import { generateSchedule } from "./scheduler";

const STORAGE_KEY = "softball-league-state";

const TEAM_COLORS = [
  "#dc2626", "#ea580c", "#d97706", "#16a34a", "#0891b2",
  "#2563eb", "#7c3aed", "#c026d3", "#e11d48", "#059669",
  "#4f46e5", "#9333ea", "#0d9488", "#b91c1c", "#1d4ed8",
  "#15803d",
];

const DEFAULT_SETTINGS: LeagueSettings = {
  leagueName: "Softball League",
  seasonStartDate: new Date().toISOString().split("T")[0],
  gamesPerWeek: 4,
  weeksInSeason: 10,
  fields: ["Field 1", "Field 2"],
  gameTimes: ["6:00 PM", "7:30 PM", "9:00 PM"],
  daysOfWeek: [2, 4], // Tuesday, Thursday
};

function loadState(): LeagueState {
  if (typeof window === "undefined") {
    return { teams: [], games: [], settings: DEFAULT_SETTINGS };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { teams: [], games: [], settings: DEFAULT_SETTINGS };
}

function saveState(state: LeagueState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

interface LeagueContextValue {
  teams: Team[];
  games: Game[];
  settings: LeagueSettings;
  addTeam: (name: string) => void;
  removeTeam: (id: string) => void;
  updateSettings: (settings: Partial<LeagueSettings>) => void;
  generateNewSchedule: () => void;
  updateGameScore: (
    gameId: string,
    homeScore: number,
    awayScore: number
  ) => void;
  clearSchedule: () => void;
  resetAll: () => void;
  getTeamById: (id: string) => Team | undefined;
}

const LeagueContext = createContext<LeagueContextValue | null>(null);

export function LeagueProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LeagueState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addTeam = useCallback((name: string) => {
    setState((prev) => {
      const color = TEAM_COLORS[prev.teams.length % TEAM_COLORS.length];
      const newTeam: Team = {
        id: Math.random().toString(36).substring(2, 10),
        name,
        color,
      };
      return { ...prev, teams: [...prev.teams, newTeam] };
    });
  }, []);

  const removeTeam = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      teams: prev.teams.filter((t) => t.id !== id),
      games: prev.games.filter(
        (g) => g.homeTeamId !== id && g.awayTeamId !== id
      ),
    }));
  }, []);

  const updateSettings = useCallback((patch: Partial<LeagueSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));
  }, []);

  const generateNewSchedule = useCallback(() => {
    setState((prev) => ({
      ...prev,
      games: generateSchedule(prev.teams, prev.settings),
    }));
  }, []);

  const updateGameScore = useCallback(
    (gameId: string, homeScore: number, awayScore: number) => {
      setState((prev) => ({
        ...prev,
        games: prev.games.map((g) =>
          g.id === gameId
            ? { ...g, homeScore, awayScore, completed: true }
            : g
        ),
      }));
    },
    []
  );

  const clearSchedule = useCallback(() => {
    setState((prev) => ({ ...prev, games: [] }));
  }, []);

  const resetAll = useCallback(() => {
    setState({ teams: [], games: [], settings: DEFAULT_SETTINGS });
  }, []);

  const getTeamById = useCallback(
    (id: string) => state.teams.find((t) => t.id === id),
    [state.teams]
  );

  return (
    <LeagueContext.Provider
      value={{
        teams: state.teams,
        games: state.games,
        settings: state.settings,
        addTeam,
        removeTeam,
        updateSettings,
        generateNewSchedule,
        updateGameScore,
        clearSchedule,
        resetAll,
        getTeamById,
      }}
    >
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeague() {
  const ctx = useContext(LeagueContext);
  if (!ctx) throw new Error("useLeague must be used within LeagueProvider");
  return ctx;
}
