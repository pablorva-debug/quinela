import { describe, expect, it } from "vitest";
import { matches } from "../data/matches";
import type { Prediction } from "../types";
import { resolveMatchTeams } from "./bracket";

function filledPredictions(): Record<string, Prediction> {
  return Object.fromEntries(
    matches.map((match) => [
      match.id,
      {
        matchId: match.id,
        homeScore: match.knockout ? 1 : 2,
        awayScore: match.knockout ? 0 : 0
      }
    ])
  );
}

describe("resolveMatchTeams", () => {
  it("does not let a quarterfinal loser appear in semifinals", () => {
    const predictions = filledPredictions();
    predictions["quarterfinal-1"] = { matchId: "quarterfinal-1", homeScore: 0, awayScore: 2 };

    const quarterfinal = matches.find((match) => match.id === "quarterfinal-1")!;
    const semifinal = matches.find((match) => match.id === "semifinal-1")!;
    const quarterTeams = resolveMatchTeams(quarterfinal, matches, predictions);
    const semiTeams = resolveMatchTeams(semifinal, matches, predictions);

    expect(semiTeams.home).toBe(quarterTeams.away);
    expect(semiTeams.home).not.toBe(quarterTeams.home);
  });

  it("builds the final from semifinal winners", () => {
    const predictions = filledPredictions();
    predictions["semifinal-1"] = { matchId: "semifinal-1", homeScore: 3, awayScore: 1 };
    predictions["semifinal-2"] = { matchId: "semifinal-2", homeScore: 0, awayScore: 2 };

    const semifinal1 = matches.find((match) => match.id === "semifinal-1")!;
    const semifinal2 = matches.find((match) => match.id === "semifinal-2")!;
    const final = matches.find((match) => match.id === "final-1")!;

    expect(resolveMatchTeams(final, matches, predictions)).toEqual({
      home: resolveMatchTeams(semifinal1, matches, predictions).home,
      away: resolveMatchTeams(semifinal2, matches, predictions).away
    });
  });
});
