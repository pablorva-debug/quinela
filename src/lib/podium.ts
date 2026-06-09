import type { CompletedPrediction, Match, PodiumPick } from "../types";

interface TeamScore {
  team: string;
  points: number;
  goalDifference: number;
  goalsFor: number;
}

function ensureScore(scores: Map<string, TeamScore>, team: string): TeamScore {
  const existing = scores.get(team);
  if (existing) {
    return existing;
  }

  const score = { team, points: 0, goalDifference: 0, goalsFor: 0 };
  scores.set(team, score);
  return score;
}

export function suggestPodium(matches: Match[], predictions: CompletedPrediction[]): PodiumPick {
  const matchById = new Map(matches.map((match) => [match.id, match]));
  const scores = new Map<string, TeamScore>();

  for (const match of matches) {
    ensureScore(scores, match.home);
    ensureScore(scores, match.away);
  }

  for (const prediction of predictions) {
    const match = matchById.get(prediction.matchId);
    if (!match) {
      continue;
    }

    const home = ensureScore(scores, match.home);
    const away = ensureScore(scores, match.away);
    home.goalsFor += prediction.homeScore;
    away.goalsFor += prediction.awayScore;
    home.goalDifference += prediction.homeScore - prediction.awayScore;
    away.goalDifference += prediction.awayScore - prediction.homeScore;

    if (prediction.homeScore > prediction.awayScore) {
      home.points += 3;
    } else if (prediction.awayScore > prediction.homeScore) {
      away.points += 3;
    } else {
      home.points += 1;
      away.points += 1;
    }

    if (prediction.advances) {
      ensureScore(scores, prediction.advances).points += match.knockout ? 8 : 3;
    }
  }

  const ranked = [...scores.values()].sort(
    (a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      a.team.localeCompare(b.team)
  );

  return {
    champion: ranked[0]?.team ?? "",
    runnerUp: ranked[1]?.team ?? "",
    thirdPlace: ranked[2]?.team ?? ""
  };
}
