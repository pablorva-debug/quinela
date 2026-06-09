import type { CompletedPrediction, Match, Prediction } from "../types";

function hasScores(prediction: Prediction): prediction is Prediction & { homeScore: number; awayScore: number } {
  return prediction.homeScore !== "" && prediction.awayScore !== "";
}

export function getAutoAdvance(match: Match, prediction: Prediction): string | undefined {
  if (!match.knockout || !hasScores(prediction) || prediction.homeScore === prediction.awayScore) {
    return undefined;
  }

  return prediction.homeScore > prediction.awayScore ? match.home : match.away;
}

export function isPredictionComplete(match: Match, prediction: Prediction): boolean {
  if (!hasScores(prediction)) {
    return false;
  }

  return !match.knockout || prediction.homeScore !== prediction.awayScore;
}

export function toCompletedPredictions(
  matches: Match[],
  predictions: Record<string, Prediction>
): CompletedPrediction[] {
  return matches.map((match) => {
    const prediction = predictions[match.id];
    return {
      matchId: match.id,
      homeScore: Number(prediction.homeScore),
      awayScore: Number(prediction.awayScore),
      advances: getAutoAdvance(match, prediction)
    };
  });
}
