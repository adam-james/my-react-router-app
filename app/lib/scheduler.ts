import type { Team, Week, Match, LeagueConfig } from "./types";

/**
 * Generates a round-robin schedule. If the team count is odd, a "BYE" placeholder
 * is added so every team sits out exactly once per cycle. Lanes are assigned
 * sequentially to each match within a week.
 */
export function generateSchedule(
  teams: Team[],
  config: LeagueConfig
): Week[] {
  const ids = teams.map((t) => t.id);
  const hasBye = ids.length % 2 !== 0;
  if (hasBye) ids.push("BYE");

  const n = ids.length;
  const roundCount = n - 1;
  const matchesPerRound = n / 2;
  const weeks: Week[] = [];

  const fixed = ids[0];
  const rotating = ids.slice(1);

  for (let week = 0; week < config.weeksCount; week++) {
    const roundIndex = week % roundCount;

    const current = [fixed, ...rotate(rotating, roundIndex)];
    const matches: Match[] = [];
    let lane = 1;

    for (let i = 0; i < matchesPerRound; i++) {
      const home = current[i];
      const away = current[n - 1 - i];

      if (home === "BYE" || away === "BYE") continue;

      matches.push({ home, away, lane });
      lane++;
      if (lane > config.lanesAvailable) lane = 1;
    }

    const weekDate = new Date(config.startDate);
    weekDate.setDate(weekDate.getDate() + week * 7);

    weeks.push({
      weekNumber: week + 1,
      date: weekDate.toISOString().split("T")[0],
      matches,
    });
  }

  return weeks;
}

function rotate<T>(arr: T[], times: number): T[] {
  const len = arr.length;
  if (len === 0) return arr;
  const shift = ((times % len) + len) % len;
  return [...arr.slice(shift), ...arr.slice(0, shift)];
}
