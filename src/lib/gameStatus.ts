import type { Match, MatchResult } from "../types";

export type GameResultView = "upcoming" | "historical";

interface GameResultState {
  logged: boolean;
  label: string;
  score: string;
}

export function getGameResultState(result?: MatchResult): GameResultState {
  if (!result || result.status === "pending") {
    return {
      logged: false,
      label: "Pendiente",
      score: ""
    };
  }

  if (result.status === "finished") {
    return {
      logged: true,
      label: "Final",
      score: result.homeScore === "" || result.awayScore === "" ? "" : `${result.homeScore}-${result.awayScore}`
    };
  }

  return {
    logged: true,
    label: result.status === "postponed" ? "Postponed" : "Cancelado",
    score: ""
  };
}

export function filterMatchesByResultView(
  matches: Match[],
  results: MatchResult[],
  view: GameResultView
): Match[] {
  const resultByMatch = new Map(results.map((result) => [result.matchId, result]));

  return matches.filter((match) => {
    const logged = getGameResultState(resultByMatch.get(match.id)).logged;
    return view === "historical" ? logged : !logged;
  });
}
