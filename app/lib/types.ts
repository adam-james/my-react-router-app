export interface Team {
  id: string;
  name: string;
  color: string;
}

export interface Match {
  home: string; // team id
  away: string; // team id
  lane: number;
}

export interface Week {
  weekNumber: number;
  date: string;
  matches: Match[];
}

export interface LeagueConfig {
  name: string;
  startDate: string;
  weeksCount: number;
  lanesAvailable: number;
}

export interface LeagueState {
  config: LeagueConfig;
  teams: Team[];
  schedule: Week[];
}
