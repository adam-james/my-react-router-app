export interface Team {
  id: string;
  name: string;
  color: string;
}

export interface Game {
  id: string;
  weekNumber: number;
  date: string;
  time: string;
  field: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  completed: boolean;
}

export interface LeagueSettings {
  leagueName: string;
  seasonStartDate: string;
  gamesPerWeek: number;
  weeksInSeason: number;
  fields: string[];
  gameTimes: string[];
  daysOfWeek: number[]; // 0=Sun, 1=Mon, etc.
}

export interface LeagueState {
  teams: Team[];
  games: Game[];
  settings: LeagueSettings;
}

export interface TeamStanding {
  team: Team;
  wins: number;
  losses: number;
  ties: number;
  runsFor: number;
  runsAgainst: number;
  winPct: number;
  gamesPlayed: number;
}
