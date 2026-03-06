import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { LeagueState, Team, LeagueConfig } from "./types";
import { loadState, saveState } from "./storage";
import { generateSchedule } from "./scheduler";

const TEAM_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f43f5e",
  "#a855f7", "#6366f1", "#0ea5e9", "#84cc16", "#d946ef",
  "#fb923c",
];

interface LeagueContextValue {
  state: LeagueState;
  updateConfig: (config: LeagueConfig) => void;
  addTeam: (name: string) => void;
  removeTeam: (id: string) => void;
  renameTeam: (id: string, name: string) => void;
  generateNewSchedule: () => void;
  clearSchedule: () => void;
  resetAll: () => void;
}

const LeagueContext = createContext<LeagueContextValue | null>(null);

export function LeagueProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LeagueState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const updateConfig = useCallback((config: LeagueConfig) => {
    setState((prev) => ({ ...prev, config, schedule: [] }));
  }, []);

  const addTeam = useCallback((name: string) => {
    setState((prev) => {
      const colorIndex = prev.teams.length % TEAM_COLORS.length;
      const team: Team = {
        id: crypto.randomUUID(),
        name,
        color: TEAM_COLORS[colorIndex],
      };
      return { ...prev, teams: [...prev.teams, team], schedule: [] };
    });
  }, []);

  const removeTeam = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      teams: prev.teams.filter((t) => t.id !== id),
      schedule: [],
    }));
  }, []);

  const renameTeam = useCallback((id: string, name: string) => {
    setState((prev) => ({
      ...prev,
      teams: prev.teams.map((t) => (t.id === id ? { ...t, name } : t)),
    }));
  }, []);

  const generateNewSchedule = useCallback(() => {
    setState((prev) => ({
      ...prev,
      schedule: generateSchedule(prev.teams, prev.config),
    }));
  }, []);

  const clearSchedule = useCallback(() => {
    setState((prev) => ({ ...prev, schedule: [] }));
  }, []);

  const resetAll = useCallback(() => {
    setState({
      config: {
        name: "Thursday Night Bowling League",
        startDate: new Date().toISOString().split("T")[0],
        weeksCount: 12,
        lanesAvailable: 8,
      },
      teams: [],
      schedule: [],
    });
  }, []);

  return (
    <LeagueContext.Provider
      value={{
        state,
        updateConfig,
        addTeam,
        removeTeam,
        renameTeam,
        generateNewSchedule,
        clearSchedule,
        resetAll,
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
