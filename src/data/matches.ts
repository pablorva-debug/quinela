import type { BracketSource, Match, MatchPhase } from "../types";

const groupNames = Array.from({ length: 12 }, (_, index) =>
  String.fromCharCode("A".charCodeAt(0) + index)
);

const groupTeamsByGroup: Record<string, string[]> = {
  A: ["Mexico", "South Africa", "Korea Republic", "Czechia"],
  B: ["Canada", "Qatar", "Switzerland", "Bosnia and Herzegovina"],
  C: ["Brazil", "Haiti", "Scotland", "Morocco"],
  D: ["USA", "Australia", "Türkiye", "Paraguay"],
  E: ["Germany", "Côte d'Ivoire", "Ecuador", "Curaçao"],
  F: ["Netherlands", "Sweden", "Tunisia", "Japan"],
  G: ["Belgium", "IR Iran", "New Zealand", "Egypt"],
  H: ["Spain", "Saudi Arabia", "Uruguay", "Cabo Verde"],
  I: ["France", "Senegal", "Iraq", "Norway"],
  J: ["Argentina", "Algeria", "Austria", "Jordan"],
  K: ["Portugal", "Congo DR", "Uzbekistan", "Colombia"],
  L: ["England", "Croatia", "Ghana", "Panama"]
};

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

const venues = [
  "Mexico City Stadium",
  "Estadio Guadalajara",
  "Toronto Stadium",
  "Los Angeles Stadium",
  "Boston Stadium",
  "BC Place Vancouver",
  "New York New Jersey Stadium",
  "San Francisco Bay Area Stadium",
  "Philadelphia Stadium",
  "Houston Stadium",
  "Dallas Stadium",
  "Estadio Monterrey",
  "Miami Stadium",
  "Atlanta Stadium",
  "Seattle Stadium",
  "Kansas City Stadium"
];

const kickoffHours = [18, 21, 0, 3];

function kickoffDate(dayOffset: number, slot: number): string {
  const date = new Date(Date.UTC(2026, 5, 11 + dayOffset, kickoffHours[slot % kickoffHours.length], 0, 0));
  return date.toISOString();
}

function makeMatch(
  id: string,
  phase: MatchPhase,
  label: string,
  home: string,
  away: string,
  index: number,
  venue: string,
  knockout = false,
  homeSource?: BracketSource,
  awaySource?: BracketSource
): Match {
  return {
    id,
    phase,
    label,
    home,
    away,
    kickoff: kickoffDate(Math.floor(index / 4), index),
    venue,
    knockout,
    homeSource,
    awaySource
  };
}

const groupMatches = groupNames.flatMap((group, groupIndex) => {
  const teams = groupTeamsByGroup[group];
  return roundRobinPairs.map(([homeIndex, awayIndex], matchIndex) => {
    const globalIndex = groupIndex * roundRobinPairs.length + matchIndex;
    return makeMatch(
      `G${group}-${matchIndex + 1}`,
      "group",
      `${phaseLabels.group} - Grupo ${group}`,
      teams[homeIndex],
      teams[awayIndex],
      globalIndex,
      venues[globalIndex % venues.length]
    );
  });
});

function makeKnockoutMatches(
  phase: MatchPhase,
  pairings: ReadonlyArray<readonly [BracketSource, BracketSource]>,
  startIndex: number
): Match[] {
  return pairings.map(([homeSource, awaySource], index) =>
    makeMatch(
      `${phase}-${index + 1}`,
      phase,
      `${phaseLabels[phase]} ${index + 1}`,
      sourceLabel(homeSource),
      sourceLabel(awaySource),
      startIndex + index,
      venues[(startIndex + index) % venues.length],
      true,
      homeSource,
      awaySource
    )
  );
}

function sourceLabel(source: BracketSource): string {
  if (source.type === "qualifier") {
    return `Clasificado ${source.seed}`;
  }
  return `${source.type === "winner" ? "Ganador" : "Perdedor"} ${source.matchId}`;
}

function pairSources(sources: BracketSource[]): Array<readonly [BracketSource, BracketSource]> {
  return Array.from({ length: sources.length / 2 }, (_, index) => [
    sources[index],
    sources[sources.length - 1 - index]
  ]);
}

const qualifierSources: BracketSource[] = Array.from({ length: 32 }, (_, index) => ({
  type: "qualifier",
  seed: index + 1
}));

const roundOf32Pairings = pairSources(qualifierSources);
const roundOf16Pairings = pairSources(
  Array.from({ length: 16 }, (_, index) => ({ type: "winner", matchId: `roundOf32-${index + 1}` }) as BracketSource)
);
const quarterfinalPairings = pairSources(
  Array.from({ length: 8 }, (_, index) => ({ type: "winner", matchId: `roundOf16-${index + 1}` }) as BracketSource)
);
const semifinalPairings = pairSources(
  Array.from({ length: 4 }, (_, index) => ({ type: "winner", matchId: `quarterfinal-${index + 1}` }) as BracketSource)
);
const thirdPlacePairings: Array<readonly [BracketSource, BracketSource]> = [
  [
    { type: "loser", matchId: "semifinal-1" },
    { type: "loser", matchId: "semifinal-2" }
  ]
];
const finalPairings: Array<readonly [BracketSource, BracketSource]> = [
  [
    { type: "winner", matchId: "semifinal-1" },
    { type: "winner", matchId: "semifinal-2" }
  ]
];

export const matches: Match[] = [
  ...groupMatches,
  ...makeKnockoutMatches("roundOf32", roundOf32Pairings, 72),
  ...makeKnockoutMatches("roundOf16", roundOf16Pairings, 88),
  ...makeKnockoutMatches("quarterfinal", quarterfinalPairings, 96),
  ...makeKnockoutMatches("semifinal", semifinalPairings, 100),
  ...makeKnockoutMatches("thirdPlace", thirdPlacePairings, 102),
  ...makeKnockoutMatches("final", finalPairings, 103)
];

export const teams = Array.from(new Set(matches.flatMap((match) => [match.home, match.away])));
