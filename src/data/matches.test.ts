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
});
