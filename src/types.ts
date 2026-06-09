export type MatchPhase =
  | "group"
  | "roundOf32"
  | "roundOf16"
  | "quarterfinal"
  | "semifinal"
  | "thirdPlace"
  | "final";

export type MatchStatus = "pending" | "finished" | "postponed" | "cancelled";

export type TeamCode = string;

export interface Match {
  id: string;
  phase: MatchPhase;
  label: string;
  home: TeamCode;
  away: TeamCode;
  kickoff: string;
  knockout: boolean;
}

export interface Player {
  id: string;
  name: string;
  createdAt: string;
}

export interface Prediction {
  matchId: string;
  homeScore: number | "";
  awayScore: number | "";
  advances?: TeamCode;
}

export interface CompletedPrediction {
  matchId: string;
  homeScore: number;
  awayScore: number;
  advances?: TeamCode;
}

export interface PodiumPick {
  champion: TeamCode;
  runnerUp: TeamCode;
  thirdPlace: TeamCode;
}

export interface Submission {
  id: string;
  playerId: string;
  playerName: string;
  submittedAt: string;
  locked: true;
  podium: PodiumPick;
  predictions: CompletedPrediction[];
}

export interface MatchResult {
  matchId: string;
  homeScore: number | "";
  awayScore: number | "";
  winner?: TeamCode | "draw";
  status: MatchStatus;
  updatedAt: string;
}

export interface LeaderboardRow {
  playerId: string;
  playerName: string;
  points: number;
  completedMatches: number;
  podiumPoints: number;
  matchPoints: number;
}
