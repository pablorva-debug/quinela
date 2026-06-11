import { describe, expect, it } from "vitest";
import type { Match, Submission } from "../types";
import { getGamePredictionRows } from "./gamePredictions";

const matches: Match[] = [
  {
    id: "m1",
    phase: "group",
    label: "Grupo A",
    home: "Mexico",
    away: "Canada",
    kickoff: "2026-06-11T18:00:00.000Z",
    venue: "Mexico City Stadium",
    knockout: false
  },
  {
    id: "ko-source",
    phase: "roundOf32",
    label: "Dieciseisavos fuente",
    home: "Mexico",
    away: "Canada",
    kickoff: "2026-06-28T18:00:00.000Z",
    venue: "Dallas Stadium",
    knockout: true
  },
  {
    id: "m2",
    phase: "roundOf16",
    label: "Dieciseisavos 1",
    home: "Ganador m1",
    away: "Canada",
    kickoff: "2026-06-28T18:00:00.000Z",
    venue: "Dallas Stadium",
    knockout: true,
    homeSource: { type: "winner", matchId: "ko-source" }
  }
];

const submissions: Submission[] = [
  {
    id: "s1",
    playerId: "p1",
    playerName: "Ana",
    submittedAt: "2026-06-10T10:00:00.000Z",
    locked: true,
    podium: { champion: "Mexico", runnerUp: "Canada", thirdPlace: "Brazil" },
    predictions: [
      { matchId: "m1", homeScore: 2, awayScore: 0 },
      { matchId: "ko-source", homeScore: 2, awayScore: 0, advances: "Mexico" },
      { matchId: "m2", homeScore: 1, awayScore: 0, advances: "Mexico" }
    ]
  },
  {
    id: "s2",
    playerId: "p2",
    playerName: "Luis",
    submittedAt: "2026-06-10T11:00:00.000Z",
    locked: true,
    podium: { champion: "Canada", runnerUp: "Mexico", thirdPlace: "Brazil" },
    predictions: [
      { matchId: "m1", homeScore: 0, awayScore: 1 },
      { matchId: "ko-source", homeScore: 0, awayScore: 2, advances: "Canada" },
      { matchId: "m2", homeScore: 0, awayScore: 2, advances: "Canada" }
    ]
  }
];

describe("getGamePredictionRows", () => {
  it("returns submitted predictions for a group match sorted by player", () => {
    expect(getGamePredictionRows(matches[0], matches, submissions)).toEqual([
      {
        playerName: "Ana",
        home: "Mexico",
        away: "Canada",
        homeScore: 2,
        awayScore: 0,
        advances: undefined
      },
      {
        playerName: "Luis",
        home: "Mexico",
        away: "Canada",
        homeScore: 0,
        awayScore: 1,
        advances: undefined
      }
    ]);
  });

  it("resolves knockout teams from each user's submitted bracket", () => {
    expect(getGamePredictionRows(matches[2], matches, submissions)).toEqual([
      {
        playerName: "Ana",
        home: "Mexico",
        away: "Canada",
        homeScore: 1,
        awayScore: 0,
        advances: "Mexico"
      },
      {
        playerName: "Luis",
        home: "Canada",
        away: "Canada",
        homeScore: 0,
        awayScore: 2,
        advances: "Canada"
      }
    ]);
  });
});
