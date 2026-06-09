import type { Match, MatchPhase } from "../types";

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

const countryPool = groupNames.flatMap((group) => groupTeamsByGroup[group]);

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
  const teams = groupTeamsByGroup[group];
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

function makeKnockoutMatches(
  phase: MatchPhase,
  pairings: ReadonlyArray<readonly [string, string]>,
  startIndex: number
): Match[] {
  return pairings.map(([home, away], index) =>
    makeMatch(
      `${phase}-${index + 1}`,
      phase,
      `${phaseLabels[phase]} ${index + 1}`,
      home,
      away,
      startIndex + index,
      true
    )
  );
}

function pairTeams(teams: string[]): Array<readonly [string, string]> {
  return Array.from({ length: teams.length / 2 }, (_, index) => [
    teams[index],
    teams[teams.length - 1 - index]
  ]);
}

const roundOf32Teams = countryPool.slice(0, 32);
const roundOf16Teams = [
  "Mexico",
  "Brazil",
  "Germany",
  "Argentina",
  "France",
  "Portugal",
  "England",
  "Spain",
  "Canada",
  "Netherlands",
  "Belgium",
  "Uruguay",
  "USA",
  "Colombia",
  "Japan",
  "Morocco"
];
const quarterfinalTeams = ["Mexico", "Brazil", "Argentina", "France", "Portugal", "England", "Spain", "Germany"];
const semifinalTeams = ["Mexico", "Argentina", "France", "Portugal"];
const thirdPlaceTeams = ["Mexico", "Portugal"];
const finalTeams = ["Argentina", "France"];

export const matches: Match[] = [
  ...groupMatches,
  ...makeKnockoutMatches("roundOf32", pairTeams(roundOf32Teams), 72),
  ...makeKnockoutMatches("roundOf16", pairTeams(roundOf16Teams), 88),
  ...makeKnockoutMatches("quarterfinal", pairTeams(quarterfinalTeams), 96),
  ...makeKnockoutMatches("semifinal", pairTeams(semifinalTeams), 100),
  ...makeKnockoutMatches("thirdPlace", pairTeams(thirdPlaceTeams), 102),
  ...makeKnockoutMatches("final", pairTeams(finalTeams), 103)
];

export const teams = Array.from(new Set(matches.flatMap((match) => [match.home, match.away])));
