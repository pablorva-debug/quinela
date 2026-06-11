import { describe, expect, it } from "vitest";
import { matches } from "./matches";

describe("matches template", () => {
  it("contains 104 matches with unique ids", () => {
    const ids = new Set(matches.map((match) => match.id));

    expect(matches).toHaveLength(104);
    expect(ids.size).toBe(104);
  });

  it("contains the expected phase distribution", () => {
    const byPhase = matches.reduce<Record<string, number>>((acc, match) => {
      acc[match.phase] = (acc[match.phase] ?? 0) + 1;
      return acc;
    }, {});

    expect(byPhase.group).toBe(72);
    expect(byPhase.roundOf32).toBe(16);
    expect(byPhase.roundOf16).toBe(8);
    expect(byPhase.quarterfinal).toBe(4);
    expect(byPhase.semifinal).toBe(2);
    expect(byPhase.thirdPlace).toBe(1);
    expect(byPhase.final).toBe(1);
  });

  it("uses country names instead of generic group placeholders", () => {
    const allTeams = matches.flatMap((match) => [match.home, match.away]);

    expect(allTeams).toContain("Mexico");
    expect(allTeams).toContain("Argentina");
    expect(allTeams.every((team) => !team.startsWith("Grupo "))).toBe(true);
    expect(allTeams.every((team) => !team.includes(" Local "))).toBe(true);
    expect(allTeams.every((team) => !team.includes(" Visitante "))).toBe(true);
  });

  it("includes kickoff date and venue for every match", () => {
    expect(
      matches.every((match) => Number.isFinite(new Date(match.kickoff).getTime()) && match.venue.length > 0)
    ).toBe(true);
  });

  it("uses official kickoff and venue for key fixtures", () => {
    expect(matches.find((match) => match.id === "GA-1")).toMatchObject({
      home: "Mexico",
      away: "South Africa",
      kickoff: "2026-06-11T19:00:00.000Z",
      venue: "Estadio Azteca"
    });
    expect(matches.find((match) => match.id === "GA-4")).toMatchObject({
      home: "Mexico",
      away: "Korea Republic",
      kickoff: "2026-06-19T01:00:00.000Z",
      venue: "Estadio Akron"
    });
    expect(matches.find((match) => match.id === "roundOf32-1")).toMatchObject({
      kickoff: "2026-06-28T19:00:00.000Z",
      venue: "SoFi Stadium"
    });
    expect(matches.find((match) => match.id === "final-1")).toMatchObject({
      kickoff: "2026-07-19T19:00:00.000Z",
      venue: "MetLife Stadium"
    });
  });

  it("does not schedule a group-stage team twice on the same UTC date", () => {
    const datesByTeam = new Map<string, Set<string>>();

    for (const match of matches.filter((item) => item.phase === "group")) {
      const date = match.kickoff.slice(0, 10);
      for (const team of [match.home, match.away]) {
        const dates = datesByTeam.get(team) ?? new Set<string>();
        expect(dates.has(date), `${team} is scheduled more than once on ${date}`).toBe(false);
        dates.add(date);
        datesByTeam.set(team, dates);
      }
    }
  });
});
