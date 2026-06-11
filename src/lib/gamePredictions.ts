import type { Match, Prediction, Submission } from "../types";
import { resolveMatchTeams } from "./bracket";

export interface GamePredictionRow {
  playerName: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  advances?: string;
}

function submissionPredictionMap(submission: Submission): Record<string, Prediction> {
  return Object.fromEntries(
    submission.predictions.map((prediction) => [
      prediction.matchId,
      {
        matchId: prediction.matchId,
        homeScore: prediction.homeScore,
        awayScore: prediction.awayScore,
        advances: prediction.advances
      }
    ])
  );
}

export function getGamePredictionRows(
  match: Match,
  matches: Match[],
  submissions: Submission[]
): GamePredictionRow[] {
  return submissions
    .map<GamePredictionRow | undefined>((submission) => {
      const prediction = submission.predictions.find((item) => item.matchId === match.id);
      if (!prediction) {
        return undefined;
      }

      const predictionMap = submissionPredictionMap(submission);
      const resolvedTeams = resolveMatchTeams(match, matches, predictionMap);

      return {
        playerName: submission.playerName,
        home: resolvedTeams.home,
        away: resolvedTeams.away,
        homeScore: prediction.homeScore,
        awayScore: prediction.awayScore,
        ...(prediction.advances ? { advances: prediction.advances } : {})
      };
    })
    .filter((row): row is GamePredictionRow => Boolean(row))
    .sort((a, b) => a.playerName.localeCompare(b.playerName));
}
