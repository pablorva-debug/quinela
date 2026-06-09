import { describe, expect, it } from "vitest";
import type { CompletedPrediction, Match } from "../types";
import { suggestPodium } from "./podium";

const matches: Match[] = [
  {
    id: "m1",
    phase: "group",
    label: "Grupo",
    home: "Mexico",
    away: "Canada",
    kickoff: "2026-06-11T00:00:00.000Z",
    venue: "Mexico City Stadium",
    knockout: false
  },
  {
    id: "m2",
    phase: "group",
    label: "Grupo",
    home: "Brazil",
    away: "Japan",
    kickoff: "2026-06-12T00:00:00.000Z",
    venue: "Dallas Stadium",
    knockout: false
  },
  {
    id: "m3",
    phase: "final",
    label: "Final",
    home: "Mexico",
    away: "Brazil",
    kickoff: "2026-07-19T00:00:00.000Z",
    venue: "New York New Jersey Stadium",
    knockout: true
  }
];

describe("suggestPodium", () => {
  it("ranks teams from predicted wins, scores, and advances picks", () => {
    const predictions: CompletedPrediction[] = [
      { matchId: "m1", homeScore: 3, awayScore: 1 },
      { matchId: "m2", homeScore: 2, awayScore: 0 },
      { matchId: "m3", homeScore: 1, awayScore: 1, advances: "Mexico" }
    ];

    expect(suggestPodium(matches, predictions)).toEqual({
      champion: "Mexico",
      runnerUp: "Brazil",
      thirdPlace: "Canada"
    });
  });
});
