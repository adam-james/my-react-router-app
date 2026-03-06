import type { Team, Game, LeagueSettings } from "./types";

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Round-robin pairing: for N teams (pad to even with a "BYE"),
 * rotate N-1 rounds, each round producing N/2 matchups.
 */
function roundRobinRounds(teams: Team[]): [Team, Team][][] {
  const list = [...teams];
  const hasBye = list.length % 2 !== 0;
  if (hasBye) {
    list.push({ id: "BYE", name: "BYE", color: "#000" });
  }

  const n = list.length;
  const rounds: [Team, Team][][] = [];

  for (let round = 0; round < n - 1; round++) {
    const pairings: [Team, Team][] = [];
    for (let i = 0; i < n / 2; i++) {
      const home = list[i];
      const away = list[n - 1 - i];
      if (home.id !== "BYE" && away.id !== "BYE") {
        pairings.push(round % 2 === 0 ? [home, away] : [away, home]);
      }
    }
    rounds.push(pairings);
    // rotate: fix first element, rotate rest
    const last = list.pop()!;
    list.splice(1, 0, last);
  }

  return rounds;
}

function getNextDayOfWeek(from: Date, dayOfWeek: number): Date {
  const d = new Date(from);
  const diff = (dayOfWeek - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + (diff === 0 ? 0 : diff));
  return d;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function generateSchedule(
  teams: Team[],
  settings: LeagueSettings
): Game[] {
  if (teams.length < 2) return [];

  const rounds = roundRobinRounds(teams);
  const games: Game[] = [];
  const startDate = new Date(settings.seasonStartDate + "T00:00:00");

  let roundIndex = 0;

  for (let week = 0; week < settings.weeksInSeason; week++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + week * 7);

    const round = rounds[roundIndex % rounds.length];
    roundIndex++;

    let gameSlot = 0;
    for (const [home, away] of round) {
      const dayOfWeek = settings.daysOfWeek[gameSlot % settings.daysOfWeek.length];
      const gameDate = getNextDayOfWeek(weekStart, dayOfWeek);
      const time = settings.gameTimes[gameSlot % settings.gameTimes.length];
      const field = settings.fields[gameSlot % settings.fields.length];

      games.push({
        id: generateId(),
        weekNumber: week + 1,
        date: formatDate(gameDate),
        time,
        field,
        homeTeamId: home.id,
        awayTeamId: away.id,
        homeScore: null,
        awayScore: null,
        completed: false,
      });

      gameSlot++;
    }
  }

  return games;
}
