import type { Match, MatchResult } from "../types";

export function getResultWinner(
  match: Match,
  homeScore: number | "",
  awayScore: number | ""
): MatchResult["winner"] | undefined {
  if (homeScore === "" || awayScore === "") {
    return undefined;
  }

  if (homeScore === awayScore) {
    return match.knockout ? undefined : "draw";
  }

  if (match.knockout) {
    return homeScore > awayScore ? match.home : match.away;
  }

  return homeScore > awayScore ? "home" : "away";
}
