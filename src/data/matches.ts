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
  if (source.type === "groupPosition") {
    const position = source.position === 1 ? "Ganador" : source.position === 2 ? "2do" : "3ro";
    return `${position} Grupo ${source.group}`;
  }
  if (source.type === "thirdPlace") {
    return `3ro ${source.eligibleGroups.join("/")}`;
  }
  return `${source.type === "winner" ? "Ganador" : "Perdedor"} ${source.matchId}`;
}

function groupPosition(group: string, position: 1 | 2 | 3): BracketSource {
  return { type: "groupPosition", group, position };
}

function thirdPlace(slot: string, eligibleGroups: string[]): BracketSource {
  return { type: "thirdPlace", slot, eligibleGroups };
}

function winner(matchId: string): BracketSource {
  return { type: "winner", matchId };
}

function loser(matchId: string): BracketSource {
  return { type: "loser", matchId };
}

const roundOf32Pairings: Array<readonly [BracketSource, BracketSource]> = [
  [groupPosition("A", 2), groupPosition("B", 2)],
  [groupPosition("E", 1), thirdPlace("M74", ["A", "B", "C", "D", "F"])],
  [groupPosition("F", 1), groupPosition("C", 2)],
  [groupPosition("C", 1), groupPosition("F", 2)],
  [groupPosition("I", 1), thirdPlace("M77", ["C", "D", "F", "G", "H"])],
  [groupPosition("E", 2), groupPosition("I", 2)],
  [groupPosition("A", 1), thirdPlace("M79", ["C", "E", "F", "H", "I"])],
  [groupPosition("L", 1), thirdPlace("M80", ["E", "H", "I", "J", "K"])],
  [groupPosition("D", 1), thirdPlace("M81", ["B", "E", "F", "I", "J"])],
  [groupPosition("G", 1), thirdPlace("M82", ["A", "E", "H", "I", "J"])],
  [groupPosition("K", 2), groupPosition("L", 2)],
  [groupPosition("H", 1), groupPosition("J", 2)],
  [groupPosition("B", 1), thirdPlace("M85", ["E", "F", "G", "I", "J"])],
  [groupPosition("J", 1), groupPosition("H", 2)],
  [groupPosition("K", 1), thirdPlace("M87", ["D", "E", "I", "J", "L"])],
  [groupPosition("D", 2), groupPosition("G", 2)]
];
const roundOf16Pairings: Array<readonly [BracketSource, BracketSource]> = [
  [winner("roundOf32-1"), winner("roundOf32-3")],
  [winner("roundOf32-2"), winner("roundOf32-5")],
  [winner("roundOf32-4"), winner("roundOf32-6")],
  [winner("roundOf32-7"), winner("roundOf32-8")],
  [winner("roundOf32-11"), winner("roundOf32-12")],
  [winner("roundOf32-9"), winner("roundOf32-10")],
  [winner("roundOf32-14"), winner("roundOf32-16")],
  [winner("roundOf32-13"), winner("roundOf32-15")]
];
const quarterfinalPairings: Array<readonly [BracketSource, BracketSource]> = [
  [winner("roundOf16-1"), winner("roundOf16-2")],
  [winner("roundOf16-5"), winner("roundOf16-6")],
  [winner("roundOf16-3"), winner("roundOf16-4")],
  [winner("roundOf16-7"), winner("roundOf16-8")]
];
const semifinalPairings: Array<readonly [BracketSource, BracketSource]> = [
  [winner("quarterfinal-1"), winner("quarterfinal-2")],
  [winner("quarterfinal-3"), winner("quarterfinal-4")]
];
const thirdPlacePairings: Array<readonly [BracketSource, BracketSource]> = [
  [loser("semifinal-1"), loser("semifinal-2")]
];
const finalPairings: Array<readonly [BracketSource, BracketSource]> = [
  [winner("semifinal-1"), winner("semifinal-2")]
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
