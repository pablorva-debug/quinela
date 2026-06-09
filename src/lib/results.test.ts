import { describe, expect, it } from "vitest";
import type { Match } from "../types";
import { getResultStatus, getResultWinner } from "./results";

const groupMatch: Match = {
  id: "g-1",
  phase: "group",
  label: "Grupo A",
  home: "Mexico",
  away: "South Africa",
  kickoff: "2026-06-11T19:00:00.000Z",
  venue: "Mexico City Stadium",
  knockout: false
};

const knockoutMatch: Match = {
  ...groupMatch,
  id: "ko-1",
  phase: "roundOf16",
  label: "Octavos",
  knockout: true
};

describe("getResultWinner", () => {
  it("derives home, away, and draw outcomes for group matches", () => {
    expect(getResultWinner(groupMatch, 2, 0)).toBe("home");
    expect(getResultWinner(groupMatch, 0, 1)).toBe("away");
    expect(getResultWinner(groupMatch, 1, 1)).toBe("draw");
  });

  it("derives the country that advances for knockout matches", () => {
    expect(getResultWinner(knockoutMatch, 2, 0)).toBe("Mexico");
    expect(getResultWinner(knockoutMatch, 0, 3)).toBe("South Africa");
  });

  it("leaves knockout ties unresolved", () => {
    expect(getResultWinner(knockoutMatch, 1, 1)).toBeUndefined();
  });
});

describe("getResultStatus", () => {
  it("marks complete scores as finished and incomplete scores as pending", () => {
    expect(getResultStatus(2, 1)).toBe("finished");
    expect(getResultStatus("", 1)).toBe("pending");
    expect(getResultStatus(2, "")).toBe("pending");
  });
});
