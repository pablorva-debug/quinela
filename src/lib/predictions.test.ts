import { describe, expect, it } from "vitest";
import type { Match, Prediction } from "../types";
import { getAutoAdvance, isPredictionComplete, toCompletedPredictions } from "./predictions";

const knockout: Match = {
  id: "ko-1",
  phase: "roundOf16",
  label: "Octavos 1",
  home: "Mexico",
  away: "Brazil",
  kickoff: "2026-07-01T00:00:00.000Z",
  venue: "Dallas Stadium",
  knockout: true
};

const group: Match = {
  ...knockout,
  id: "g-1",
  phase: "group",
  label: "Grupo A",
  knockout: false
};

describe("prediction helpers", () => {
  it("auto-calculates the advancing team from a knockout score", () => {
    expect(getAutoAdvance(knockout, { matchId: "ko-1", homeScore: 2, awayScore: 1 })).toBe("Mexico");
    expect(getAutoAdvance(knockout, { matchId: "ko-1", homeScore: 0, awayScore: 3 })).toBe("Brazil");
  });

  it("does not complete a knockout prediction when the score is tied", () => {
    const prediction: Prediction = { matchId: "ko-1", homeScore: 1, awayScore: 1 };

    expect(isPredictionComplete(knockout, prediction)).toBe(false);
  });

  it("allows ties in group predictions", () => {
    const prediction: Prediction = { matchId: "g-1", homeScore: 1, awayScore: 1 };

    expect(isPredictionComplete(group, prediction)).toBe(true);
  });

  it("adds advances automatically when converting completed knockout predictions", () => {
    expect(
      toCompletedPredictions([knockout], {
        "ko-1": { matchId: "ko-1", homeScore: 4, awayScore: 2 }
      })
    ).toEqual([{ matchId: "ko-1", homeScore: 4, awayScore: 2, advances: "Mexico" }]);
  });
});
