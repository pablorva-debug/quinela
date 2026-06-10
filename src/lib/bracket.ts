import type { BracketSource, Match, Prediction } from "../types";
import { getAutoAdvance } from "./predictions";

interface Standing {
  team: string;
  group: string;
  points: number;
  goalDifference: number;
  goalsFor: number;
}

export interface ResolvedTeams {
  home: string;
  away: string;
}

function groupName(match: Match): string {
  return match.id.slice(1, 2);
}

function getStanding(map: Map<string, Standing>, team: string, group: string): Standing {
  const existing = map.get(team);
  if (existing) {
    return existing;
  }

  const standing = { team, group, points: 0, goalDifference: 0, goalsFor: 0 };
  map.set(team, standing);
  return standing;
}

function groupStandings(matches: Match[], predictions: Record<string, Prediction>): Standing[] {
  const standings = new Map<string, Standing>();

  for (const match of matches.filter((item) => item.phase === "group")) {
    const prediction = predictions[match.id];
    const group = groupName(match);
    const home = getStanding(standings, match.home, group);
    const away = getStanding(standings, match.away, group);

    if (!prediction || prediction.homeScore === "" || prediction.awayScore === "") {
      continue;
    }

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
  }

  return [...standings.values()].sort(
    (a, b) =>
      a.group.localeCompare(b.group) ||
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      a.team.localeCompare(b.team)
  );
}

function qualifiers(matches: Match[], predictions: Record<string, Prediction>): string[] {
  const byGroup = groupStandings(matches, predictions).reduce<Map<string, Standing[]>>((acc, standing) => {
    const current = acc.get(standing.group) ?? [];
    current.push(standing);
    acc.set(standing.group, current);
    return acc;
  }, new Map());
  const winners: Standing[] = [];
  const runnersUp: Standing[] = [];
  const thirds: Standing[] = [];

  for (const group of [...byGroup.keys()].sort()) {
    const ranked = byGroup.get(group) ?? [];
    if (ranked[0]) winners.push(ranked[0]);
    if (ranked[1]) runnersUp.push(ranked[1]);
    if (ranked[2]) thirds.push(ranked[2]);
  }

  const bestThirds = thirds
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goalDifference - a.goalDifference ||
        b.goalsFor - a.goalsFor ||
        a.team.localeCompare(b.team)
    )
    .slice(0, 8);

  return [...winners, ...runnersUp, ...bestThirds].map((standing) => standing.team);
}

function resolveSource(
  source: BracketSource | undefined,
  matches: Match[],
  predictions: Record<string, Prediction>
): string | undefined {
  if (!source) {
    return undefined;
  }

  if (source.type === "qualifier") {
    return qualifiers(matches, predictions)[source.seed - 1];
  }

  const sourceMatch = matches.find((match) => match.id === source.matchId);
  const sourcePrediction = predictions[source.matchId];
  if (!sourceMatch || !sourcePrediction) {
    return undefined;
  }

  const teams = resolveMatchTeams(sourceMatch, matches, predictions);
  const winner = getAutoAdvance({ ...sourceMatch, home: teams.home, away: teams.away }, sourcePrediction);

  if (!winner) {
    return undefined;
  }

  if (source.type === "winner") {
    return winner;
  }

  return winner === teams.home ? teams.away : teams.home;
}

export function resolveMatchTeams(
  match: Match,
  matches: Match[],
  predictions: Record<string, Prediction>
): ResolvedTeams {
  if (!match.knockout) {
    return { home: match.home, away: match.away };
  }

  return {
    home: resolveSource(match.homeSource, matches, predictions) ?? match.home,
    away: resolveSource(match.awaySource, matches, predictions) ?? match.away
  };
}
