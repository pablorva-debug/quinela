import { describe, expect, it } from "vitest";
import type { CompletedPrediction, MatchResult, PodiumPick, Submission } from "../types";
import { scoreMatch, scorePodium, scoreSubmission } from "./scoring";

const basePrediction: CompletedPrediction = {
  matchId: "m1",
  homeScore: 2,
  awayScore: 1,
  advances: "A"
};

function result(overrides: Partial<MatchResult>): MatchResult {
  return {
    matchId: "m1",
    homeScore: 2,
    awayScore: 1,
    winner: "A",
    status: "finished",
    updatedAt: "2026-07-01T00:00:00.000Z",
    ...overrides
  };
}

describe("scoreMatch", () => {
  it("returns 10 when winner and exact score are correct", () => {
    expect(scoreMatch(basePrediction, result({}))).toBe(10);
  });

  it("returns 5 when winner is correct but score is not exact", () => {
    expect(scoreMatch(basePrediction, result({ homeScore: 3, awayScore: 2 }))).toBe(5);
  });

  it("returns 0 when winner is wrong", () => {
    expect(scoreMatch(basePrediction, result({ homeScore: 0, awayScore: 1, winner: "B" }))).toBe(0);
  });

  it("returns 5 when both prediction and result are draws", () => {
    expect(
      scoreMatch(
        { matchId: "m1", homeScore: 1, awayScore: 1 },
        result({ homeScore: 2, awayScore: 2, winner: "draw" })
      )
    ).toBe(5);
  });

  it("ignores postponed and cancelled matches", () => {
    expect(scoreMatch(basePrediction, result({ status: "postponed" }))).toBe(0);
    expect(scoreMatch(basePrediction, result({ status: "cancelled" }))).toBe(0);
  });
});

describe("scorePodium", () => {
  it("scores each podium slot independently", () => {
    const pick: PodiumPick = {
      champion: "Mexico",
      runnerUp: "Brazil",
      thirdPlace: "Japan"
    };

    expect(
      scorePodium(pick, {
        champion: "Mexico",
        runnerUp: "Argentina",
        thirdPlace: "Japan"
      })
    ).toBe(40);
  });
});

describe("scoreSubmission", () => {
  it("combines match and podium points", () => {
    const submission: Submission = {
      id: "s1",
      playerId: "p1",
      playerName: "Pablo",
      submittedAt: "2026-06-10T10:00:00.000Z",
      locked: true,
      podium: {
        champion: "Mexico",
        runnerUp: "Brazil",
        thirdPlace: "Japan"
      },
      predictions: [basePrediction]
    };

    expect(
      scoreSubmission(submission, [result({})], {
        champion: "Mexico",
        runnerUp: "Brazil",
        thirdPlace: "Canada"
      })
    ).toEqual({
      playerId: "p1",
      playerName: "Pablo",
      points: 60,
      completedMatches: 1,
      matchPoints: 10,
      podiumPoints: 50
    });
  });
});
