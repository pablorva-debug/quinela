import { describe, expect, it } from "vitest";
import type { Match } from "../types";
import { sortMatchesByKickoff } from "./matchOrder";

function match(id: string, kickoff: string): Match {
  return {
    id,
    phase: "group",
    label: id,
    home: "A",
    away: "B",
    kickoff,
    venue: "Venue",
    knockout: false
  };
}

describe("sortMatchesByKickoff", () => {
  it("orders matches chronologically without mutating the source list", () => {
    const source = [
      match("late", "2026-06-12T20:00:00.000Z"),
      match("early", "2026-06-11T19:00:00.000Z"),
      match("same-time", "2026-06-11T19:00:00.000Z")
    ];

    expect(sortMatchesByKickoff(source).map((item) => item.id)).toEqual(["early", "same-time", "late"]);
    expect(source.map((item) => item.id)).toEqual(["late", "early", "same-time"]);
  });
});
