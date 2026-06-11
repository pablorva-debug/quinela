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
  it("uses official round of 32 sources", () => {
    const firstRoundOf32 = matches.find((match) => match.id === "roundOf32-1")!;
    const seventhRoundOf32 = matches.find((match) => match.id === "roundOf32-7")!;

    expect(firstRoundOf32.homeSource).toEqual({ type: "groupPosition", group: "A", position: 2 });
    expect(firstRoundOf32.awaySource).toEqual({ type: "groupPosition", group: "B", position: 2 });
    expect(seventhRoundOf32.homeSource).toEqual({ type: "groupPosition", group: "A", position: 1 });
    expect(seventhRoundOf32.awaySource).toEqual({
      type: "thirdPlace",
      slot: "M79",
      eligibleGroups: ["C", "E", "F", "H", "I"]
    });
  });

  it("uses official knockout continuity after the round of 32", () => {
    expect(matches.find((match) => match.id === "roundOf16-1")).toMatchObject({
      homeSource: { type: "winner", matchId: "roundOf32-1" },
      awaySource: { type: "winner", matchId: "roundOf32-3" }
    });
    expect(matches.find((match) => match.id === "roundOf16-2")).toMatchObject({
      homeSource: { type: "winner", matchId: "roundOf32-2" },
      awaySource: { type: "winner", matchId: "roundOf32-5" }
    });
    expect(matches.find((match) => match.id === "quarterfinal-2")).toMatchObject({
      homeSource: { type: "winner", matchId: "roundOf16-5" },
      awaySource: { type: "winner", matchId: "roundOf16-6" }
    });
    expect(matches.find((match) => match.id === "semifinal-1")).toMatchObject({
      homeSource: { type: "winner", matchId: "quarterfinal-1" },
      awaySource: { type: "winner", matchId: "quarterfinal-2" }
    });
    expect(matches.find((match) => match.id === "final-1")).toMatchObject({
      homeSource: { type: "winner", matchId: "semifinal-1" },
      awaySource: { type: "winner", matchId: "semifinal-2" }
    });
  });

  it("resolves official group-position sources in the round of 32", () => {
    const predictions = filledPredictions();
    const firstRoundOf32 = matches.find((match) => match.id === "roundOf32-1")!;

    expect(resolveMatchTeams(firstRoundOf32, matches, predictions)).toEqual({
      home: "South Africa",
      away: "Qatar"
    });
  });

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
