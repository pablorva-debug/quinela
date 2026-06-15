import { describe, expect, it } from "vitest";
import type { Match, MatchResult } from "../types";
import { filterMatchesByResultView, getGameResultState } from "./gameStatus";

function result(overrides: Partial<MatchResult>): MatchResult {
  return {
    matchId: "m1",
    homeScore: "",
    awayScore: "",
    status: "pending",
    updatedAt: "2026-06-11T12:00:00.000Z",
    ...overrides
  };
}

function match(id: string): Match {
  return {
    id,
    phase: "group",
    label: id,
    home: "A",
    away: "B",
    kickoff: "2026-06-11T19:00:00.000Z",
    venue: "Venue",
    knockout: false
  };
}

describe("getGameResultState", () => {
  it("marks finished results as logged with score label", () => {
    expect(getGameResultState(result({ homeScore: 2, awayScore: 1, status: "finished" }))).toEqual({
      logged: true,
      label: "Final",
      score: "2-1"
    });
  });

  it("does not mark pending results as logged", () => {
    expect(getGameResultState(result({ status: "pending" }))).toEqual({
      logged: false,
      label: "Pendiente",
      score: ""
    });
  });

  it("marks postponed and cancelled statuses as logged", () => {
    expect(getGameResultState(result({ status: "postponed" })).logged).toBe(true);
    expect(getGameResultState(result({ status: "cancelled" })).logged).toBe(true);
  });
});

describe("filterMatchesByResultView", () => {
  it("separates upcoming matches from historical matches by logged result", () => {
    const upcoming = match("upcoming");
    const historical = match("historical");
    const pending = match("pending");
    const results = [
      result({ matchId: historical.id, homeScore: 2, awayScore: 1, status: "finished" }),
      result({ matchId: pending.id, status: "pending" })
    ];

    expect(filterMatchesByResultView([upcoming, historical, pending], results, "upcoming")).toEqual([
      upcoming,
      pending
    ]);
    expect(filterMatchesByResultView([upcoming, historical, pending], results, "historical")).toEqual([historical]);
  });
});
