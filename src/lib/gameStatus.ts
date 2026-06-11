import type { MatchResult } from "../types";

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
