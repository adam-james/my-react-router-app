import type { Team, Game, TeamStanding } from "./types";

export function calculateStandings(
  teams: Team[],
  games: Game[]
): TeamStanding[] {
  const map = new Map<string, TeamStanding>();

  for (const team of teams) {
    map.set(team.id, {
      team,
      wins: 0,
      losses: 0,
      ties: 0,
      runsFor: 0,
      runsAgainst: 0,
      winPct: 0,
      gamesPlayed: 0,
    });
  }

  for (const game of games) {
    if (!game.completed || game.homeScore === null || game.awayScore === null)
      continue;

    const home = map.get(game.homeTeamId);
    const away = map.get(game.awayTeamId);
    if (!home || !away) continue;

    home.gamesPlayed++;
    away.gamesPlayed++;
    home.runsFor += game.homeScore;
    home.runsAgainst += game.awayScore;
    away.runsFor += game.awayScore;
    away.runsAgainst += game.homeScore;

    if (game.homeScore > game.awayScore) {
      home.wins++;
      away.losses++;
    } else if (game.awayScore > game.homeScore) {
      away.wins++;
      home.losses++;
    } else {
      home.ties++;
      away.ties++;
    }
  }

  const standings = Array.from(map.values());
  for (const s of standings) {
    const totalDecisions = s.wins + s.losses + s.ties;
    s.winPct = totalDecisions > 0 ? (s.wins + s.ties * 0.5) / totalDecisions : 0;
  }

  standings.sort((a, b) => {
    if (b.winPct !== a.winPct) return b.winPct - a.winPct;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return (b.runsFor - b.runsAgainst) - (a.runsFor - a.runsAgainst);
  });

  return standings;
}
