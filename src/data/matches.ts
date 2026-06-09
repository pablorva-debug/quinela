import type { Match, MatchPhase } from "../types";

const groupNames = Array.from({ length: 12 }, (_, index) =>
  String.fromCharCode("A".charCodeAt(0) + index)
);

const groupTeams = groupNames.flatMap((group) =>
  Array.from({ length: 4 }, (_, index) => `Grupo ${group}${index + 1}`)
);

const roundRobinPairs = [
  [0, 1],
  [2, 3],
  [0, 2],
  [1, 3],
  [0, 3],
  [1, 2]
] as const;

const phaseLabels: Record<MatchPhase, string> = {
  group: "Fase de grupos",
  roundOf32: "Dieciseisavos",
  roundOf16: "Octavos",
  quarterfinal: "Cuartos",
  semifinal: "Semifinal",
  thirdPlace: "Tercer lugar",
  final: "Final"
};

function kickoffDate(dayOffset: number): string {
  const date = new Date(Date.UTC(2026, 5, 11 + dayOffset, 19, 0, 0));
  return date.toISOString();
}

function makeMatch(
  id: string,
  phase: MatchPhase,
  label: string,
  home: string,
  away: string,
  index: number,
  knockout = false
): Match {
  return {
    id,
    phase,
    label,
    home,
    away,
    kickoff: kickoffDate(index),
    knockout
  };
}

const groupMatches = groupNames.flatMap((group, groupIndex) => {
  const teams = groupTeams.slice(groupIndex * 4, groupIndex * 4 + 4);
  return roundRobinPairs.map(([homeIndex, awayIndex], matchIndex) => {
    const globalIndex = groupIndex * roundRobinPairs.length + matchIndex;
    return makeMatch(
      `G${group}-${matchIndex + 1}`,
      "group",
      `${phaseLabels.group} - Grupo ${group}`,
      teams[homeIndex],
      teams[awayIndex],
      globalIndex
    );
  });
});

function makeKnockoutMatches(phase: MatchPhase, count: number, startIndex: number): Match[] {
  return Array.from({ length: count }, (_, index) =>
    makeMatch(
      `${phase}-${index + 1}`,
      phase,
      `${phaseLabels[phase]} ${index + 1}`,
      `${phaseLabels[phase]} Local ${index + 1}`,
      `${phaseLabels[phase]} Visitante ${index + 1}`,
      startIndex + index,
      true
    )
  );
}

export const matches: Match[] = [
  ...groupMatches,
  ...makeKnockoutMatches("roundOf32", 16, 72),
  ...makeKnockoutMatches("roundOf16", 8, 88),
  ...makeKnockoutMatches("quarterfinal", 4, 96),
  ...makeKnockoutMatches("semifinal", 2, 100),
  ...makeKnockoutMatches("thirdPlace", 1, 102),
  ...makeKnockoutMatches("final", 1, 103)
];

export const teams = Array.from(new Set(matches.flatMap((match) => [match.home, match.away])));
