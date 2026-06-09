import type {
  CompletedPrediction,
  LeaderboardRow,
  MatchResult,
  PodiumPick,
  Submission,
  TeamCode
} from "../types";

type Outcome = TeamCode | "draw";

function predictionOutcome(prediction: CompletedPrediction): Outcome {
  if (prediction.advances) {
    return prediction.advances;
  }

  if (prediction.homeScore === prediction.awayScore) {
    return "draw";
  }

  return prediction.homeScore > prediction.awayScore ? "home" : "away";
}

function resultOutcome(result: MatchResult): Outcome | undefined {
  if (result.winner) {
    return result.winner;
  }

  if (result.homeScore === "" || result.awayScore === "") {
    return undefined;
  }

  if (result.homeScore === result.awayScore) {
    return "draw";
  }

  return result.homeScore > result.awayScore ? "home" : "away";
}

export function scoreMatch(prediction: CompletedPrediction, result?: MatchResult): number {
  if (!result || result.status !== "finished") {
    return 0;
  }

  const officialOutcome = resultOutcome(result);
  if (!officialOutcome || predictionOutcome(prediction) !== officialOutcome) {
    return 0;
  }

  if (prediction.homeScore === result.homeScore && prediction.awayScore === result.awayScore) {
    return 10;
  }

  return 5;
}

export function scorePodium(prediction: PodiumPick, official?: Partial<PodiumPick>): number {
  if (!official) {
    return 0;
  }

  let points = 0;
  if (official.champion && prediction.champion === official.champion) {
    points += 30;
  }
  if (official.runnerUp && prediction.runnerUp === official.runnerUp) {
    points += 20;
  }
  if (official.thirdPlace && prediction.thirdPlace === official.thirdPlace) {
    points += 10;
  }

  return points;
}

export function scoreSubmission(
  submission: Submission,
  results: MatchResult[],
  officialPodium?: Partial<PodiumPick>
): LeaderboardRow {
  const resultByMatch = new Map(results.map((result) => [result.matchId, result]));
  const matchPoints = submission.predictions.reduce(
    (total, prediction) => total + scoreMatch(prediction, resultByMatch.get(prediction.matchId)),
    0
  );
  const podiumPoints = scorePodium(submission.podium, officialPodium);
  const completedMatches = results.filter((result) => result.status === "finished").length;

  return {
    playerId: submission.playerId,
    playerName: submission.playerName,
    points: matchPoints + podiumPoints,
    completedMatches,
    matchPoints,
    podiumPoints
  };
}

export function sortLeaderboard(rows: LeaderboardRow[]): LeaderboardRow[] {
  return [...rows].sort((a, b) => b.points - a.points || a.playerName.localeCompare(b.playerName));
}
