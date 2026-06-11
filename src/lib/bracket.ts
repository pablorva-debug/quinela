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

function standingsByGroup(matches: Match[], predictions: Record<string, Prediction>): Map<string, Standing[]> {
  return groupStandings(matches, predictions).reduce<Map<string, Standing[]>>((acc, standing) => {
    const current = acc.get(standing.group) ?? [];
    current.push(standing);
    acc.set(standing.group, current);
    return acc;
  }, new Map());
}

function groupPositionTeam(
  matches: Match[],
  predictions: Record<string, Prediction>,
  group: string,
  position: 1 | 2 | 3
): string | undefined {
  return standingsByGroup(matches, predictions).get(group)?.[position - 1]?.team;
}

function thirdPlaceStandings(matches: Match[], predictions: Record<string, Prediction>): Standing[] {
  const byGroup = standingsByGroup(matches, predictions);
  return [...byGroup.keys()]
    .sort()
    .map((group) => byGroup.get(group)?.[2])
    .filter((standing): standing is Standing => Boolean(standing))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goalDifference - a.goalDifference ||
        b.goalsFor - a.goalsFor ||
        a.team.localeCompare(b.team)
    );
}

function thirdPlaceAssignments(matches: Match[], predictions: Record<string, Prediction>): Map<string, string> {
  const assigned = new Map<string, string>();
  const usedGroups = new Set<string>();
  const bestThirds = thirdPlaceStandings(matches, predictions).slice(0, 8);
  const slots = matches
    .filter((match) => match.phase === "roundOf32")
    .flatMap((match) => [match.homeSource, match.awaySource])
    .filter((source): source is BracketSource & { type: "thirdPlace" } => source?.type === "thirdPlace");

  for (const slot of slots) {
    const selected = bestThirds.find(
      (standing) => slot.eligibleGroups.includes(standing.group) && !usedGroups.has(standing.group)
    );
    if (selected) {
      assigned.set(slot.slot, selected.team);
      usedGroups.add(selected.group);
    }
  }

  return assigned;
}

function resolveThirdPlaceSource(
  source: BracketSource & { type: "thirdPlace" },
  matches: Match[],
  predictions: Record<string, Prediction>
): string | undefined {
  return thirdPlaceAssignments(matches, predictions).get(source.slot);
}

function resolveGroupPositionSource(
  source: BracketSource & { type: "groupPosition" },
  matches: Match[],
  predictions: Record<string, Prediction>
): string | undefined {
  return groupPositionTeam(matches, predictions, source.group, source.position);
}

function resolveSource(
  source: BracketSource | undefined,
  matches: Match[],
  predictions: Record<string, Prediction>
): string | undefined {
  if (!source) {
    return undefined;
  }

  if (source.type === "groupPosition") {
    return resolveGroupPositionSource(source, matches, predictions);
  }

  if (source.type === "thirdPlace") {
    return resolveThirdPlaceSource(source, matches, predictions);
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
