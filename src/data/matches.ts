import type { BracketSource, Match, MatchPhase } from "../types";

const phaseLabels: Record<MatchPhase, string> = {
  group: "Fase de grupos",
  roundOf32: "Dieciseisavos",
  roundOf16: "Octavos",
  quarterfinal: "Cuartos",
  semifinal: "Semifinal",
  thirdPlace: "Tercer lugar",
  final: "Final"
};

const venueUtcOffsets: Record<string, number> = {
  "Arrowhead Stadium": -5,
  "AT&T Stadium": -5,
  "BC Place": -7,
  "BMO Field": -4,
  "Estadio Akron": -6,
  "Estadio Azteca": -6,
  "Estadio BBVA": -6,
  "Gillette Stadium": -4,
  "Hard Rock Stadium": -4,
  "Levi's Stadium": -7,
  "Lincoln Financial Field": -4,
  "Lumen Field": -7,
  "Mercedes-Benz Stadium": -4,
  "MetLife Stadium": -4,
  "NRG Stadium": -5,
  "SoFi Stadium": -7
};

interface GroupFixture {
  id: string;
  group: string;
  home: string;
  away: string;
  date: string;
  hour: number;
  minute?: number;
  venue: string;
}

interface KnockoutFixture {
  phase: MatchPhase;
  index: number;
  homeSource: BracketSource;
  awaySource: BracketSource;
  date: string;
  hour: number;
  minute?: number;
  venue: string;
}

function kickoffAtVenue(date: string, hour: number, minute: number, venue: string): string {
  const offset = venueUtcOffsets[venue];
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour - offset, minute, 0)).toISOString();
}

function makeMatch(
  id: string,
  phase: MatchPhase,
  label: string,
  home: string,
  away: string,
  kickoff: string,
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
    kickoff,
    venue,
    knockout,
    homeSource,
    awaySource
  };
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

const groupFixtures: GroupFixture[] = [
  { id: "GA-1", group: "A", home: "Mexico", away: "South Africa", date: "2026-06-11", hour: 13, venue: "Estadio Azteca" },
  { id: "GA-2", group: "A", home: "Korea Republic", away: "Czechia", date: "2026-06-11", hour: 20, venue: "Estadio Akron" },
  { id: "GA-3", group: "A", home: "Czechia", away: "South Africa", date: "2026-06-18", hour: 12, venue: "Mercedes-Benz Stadium" },
  { id: "GA-4", group: "A", home: "Mexico", away: "Korea Republic", date: "2026-06-18", hour: 19, venue: "Estadio Akron" },
  { id: "GA-5", group: "A", home: "Czechia", away: "Mexico", date: "2026-06-24", hour: 19, venue: "Estadio Azteca" },
  { id: "GA-6", group: "A", home: "South Africa", away: "Korea Republic", date: "2026-06-24", hour: 19, venue: "Estadio BBVA" },

  { id: "GB-1", group: "B", home: "Canada", away: "Bosnia and Herzegovina", date: "2026-06-12", hour: 15, venue: "BMO Field" },
  { id: "GB-2", group: "B", home: "Qatar", away: "Switzerland", date: "2026-06-13", hour: 12, venue: "Levi's Stadium" },
  { id: "GB-3", group: "B", home: "Switzerland", away: "Bosnia and Herzegovina", date: "2026-06-18", hour: 12, venue: "SoFi Stadium" },
  { id: "GB-4", group: "B", home: "Canada", away: "Qatar", date: "2026-06-18", hour: 15, venue: "BC Place" },
  { id: "GB-5", group: "B", home: "Switzerland", away: "Canada", date: "2026-06-24", hour: 12, venue: "BC Place" },
  { id: "GB-6", group: "B", home: "Bosnia and Herzegovina", away: "Qatar", date: "2026-06-24", hour: 12, venue: "Lumen Field" },

  { id: "GC-1", group: "C", home: "Brazil", away: "Morocco", date: "2026-06-13", hour: 18, venue: "Gillette Stadium" },
  { id: "GC-2", group: "C", home: "Haiti", away: "Scotland", date: "2026-06-13", hour: 21, venue: "MetLife Stadium" },
  { id: "GC-3", group: "C", home: "Scotland", away: "Morocco", date: "2026-06-19", hour: 18, venue: "Lincoln Financial Field" },
  { id: "GC-4", group: "C", home: "Brazil", away: "Haiti", date: "2026-06-19", hour: 21, venue: "Gillette Stadium" },
  { id: "GC-5", group: "C", home: "Scotland", away: "Brazil", date: "2026-06-24", hour: 18, venue: "Hard Rock Stadium" },
  { id: "GC-6", group: "C", home: "Morocco", away: "Haiti", date: "2026-06-24", hour: 18, venue: "Mercedes-Benz Stadium" },

  { id: "GD-1", group: "D", home: "USA", away: "Paraguay", date: "2026-06-12", hour: 18, venue: "SoFi Stadium" },
  { id: "GD-2", group: "D", home: "Australia", away: "Turkiye", date: "2026-06-13", hour: 21, venue: "BC Place" },
  { id: "GD-3", group: "D", home: "Turkiye", away: "Paraguay", date: "2026-06-19", hour: 21, venue: "Levi's Stadium" },
  { id: "GD-4", group: "D", home: "USA", away: "Australia", date: "2026-06-19", hour: 12, venue: "Lumen Field" },
  { id: "GD-5", group: "D", home: "Turkiye", away: "USA", date: "2026-06-25", hour: 19, venue: "SoFi Stadium" },
  { id: "GD-6", group: "D", home: "Paraguay", away: "Australia", date: "2026-06-25", hour: 19, venue: "Levi's Stadium" },

  { id: "GE-1", group: "E", home: "Cote d'Ivoire", away: "Ecuador", date: "2026-06-14", hour: 14, venue: "Lincoln Financial Field" },
  { id: "GE-2", group: "E", home: "Germany", away: "Curacao", date: "2026-06-14", hour: 19, venue: "NRG Stadium" },
  { id: "GE-3", group: "E", home: "Germany", away: "Cote d'Ivoire", date: "2026-06-20", hour: 16, venue: "BMO Field" },
  { id: "GE-4", group: "E", home: "Ecuador", away: "Curacao", date: "2026-06-20", hour: 19, venue: "Arrowhead Stadium" },
  { id: "GE-5", group: "E", home: "Curacao", away: "Cote d'Ivoire", date: "2026-06-25", hour: 16, venue: "Lincoln Financial Field" },
  { id: "GE-6", group: "E", home: "Ecuador", away: "Germany", date: "2026-06-25", hour: 16, venue: "MetLife Stadium" },

  { id: "GF-1", group: "F", home: "Netherlands", away: "Japan", date: "2026-06-14", hour: 15, venue: "AT&T Stadium" },
  { id: "GF-2", group: "F", home: "Sweden", away: "Tunisia", date: "2026-06-14", hour: 20, venue: "Estadio BBVA" },
  { id: "GF-3", group: "F", home: "Netherlands", away: "Sweden", date: "2026-06-20", hour: 12, venue: "NRG Stadium" },
  { id: "GF-4", group: "F", home: "Tunisia", away: "Japan", date: "2026-06-20", hour: 22, venue: "Estadio BBVA" },
  { id: "GF-5", group: "F", home: "Japan", away: "Sweden", date: "2026-06-25", hour: 18, venue: "AT&T Stadium" },
  { id: "GF-6", group: "F", home: "Tunisia", away: "Netherlands", date: "2026-06-25", hour: 18, venue: "Arrowhead Stadium" },

  { id: "GG-1", group: "G", home: "IR Iran", away: "New Zealand", date: "2026-06-15", hour: 18, venue: "SoFi Stadium" },
  { id: "GG-2", group: "G", home: "Belgium", away: "Egypt", date: "2026-06-15", hour: 12, venue: "Lumen Field" },
  { id: "GG-3", group: "G", home: "Belgium", away: "IR Iran", date: "2026-06-21", hour: 12, venue: "SoFi Stadium" },
  { id: "GG-4", group: "G", home: "New Zealand", away: "Egypt", date: "2026-06-21", hour: 18, venue: "BC Place" },
  { id: "GG-5", group: "G", home: "Egypt", away: "IR Iran", date: "2026-06-26", hour: 20, venue: "Lumen Field" },
  { id: "GG-6", group: "G", home: "New Zealand", away: "Belgium", date: "2026-06-26", hour: 20, venue: "BC Place" },

  { id: "GH-1", group: "H", home: "Saudi Arabia", away: "Uruguay", date: "2026-06-15", hour: 18, venue: "Hard Rock Stadium" },
  { id: "GH-2", group: "H", home: "Spain", away: "Cabo Verde", date: "2026-06-15", hour: 12, venue: "Mercedes-Benz Stadium" },
  { id: "GH-3", group: "H", home: "Uruguay", away: "Cabo Verde", date: "2026-06-21", hour: 18, venue: "Hard Rock Stadium" },
  { id: "GH-4", group: "H", home: "Spain", away: "Saudi Arabia", date: "2026-06-21", hour: 12, venue: "Mercedes-Benz Stadium" },
  { id: "GH-5", group: "H", home: "Cabo Verde", away: "Saudi Arabia", date: "2026-06-26", hour: 19, venue: "NRG Stadium" },
  { id: "GH-6", group: "H", home: "Uruguay", away: "Spain", date: "2026-06-26", hour: 18, venue: "Estadio Akron" },

  { id: "GI-1", group: "I", home: "France", away: "Senegal", date: "2026-06-16", hour: 15, venue: "MetLife Stadium" },
  { id: "GI-2", group: "I", home: "Iraq", away: "Norway", date: "2026-06-16", hour: 18, venue: "Gillette Stadium" },
  { id: "GI-3", group: "I", home: "Norway", away: "Senegal", date: "2026-06-22", hour: 20, venue: "MetLife Stadium" },
  { id: "GI-4", group: "I", home: "France", away: "Iraq", date: "2026-06-22", hour: 17, venue: "Lincoln Financial Field" },
  { id: "GI-5", group: "I", home: "Norway", away: "France", date: "2026-06-26", hour: 15, venue: "Gillette Stadium" },
  { id: "GI-6", group: "I", home: "Senegal", away: "Iraq", date: "2026-06-26", hour: 15, venue: "BMO Field" },

  { id: "GJ-1", group: "J", home: "Argentina", away: "Algeria", date: "2026-06-16", hour: 20, venue: "Arrowhead Stadium" },
  { id: "GJ-2", group: "J", home: "Austria", away: "Jordan", date: "2026-06-16", hour: 21, venue: "Levi's Stadium" },
  { id: "GJ-3", group: "J", home: "Argentina", away: "Austria", date: "2026-06-22", hour: 12, venue: "AT&T Stadium" },
  { id: "GJ-4", group: "J", home: "Jordan", away: "Algeria", date: "2026-06-22", hour: 20, venue: "Levi's Stadium" },
  { id: "GJ-5", group: "J", home: "Algeria", away: "Austria", date: "2026-06-27", hour: 21, venue: "Arrowhead Stadium" },
  { id: "GJ-6", group: "J", home: "Jordan", away: "Argentina", date: "2026-06-27", hour: 21, venue: "AT&T Stadium" },

  { id: "GK-1", group: "K", home: "Portugal", away: "Congo DR", date: "2026-06-17", hour: 12, venue: "NRG Stadium" },
  { id: "GK-2", group: "K", home: "Uzbekistan", away: "Colombia", date: "2026-06-17", hour: 20, venue: "Estadio Azteca" },
  { id: "GK-3", group: "K", home: "Portugal", away: "Uzbekistan", date: "2026-06-23", hour: 12, venue: "NRG Stadium" },
  { id: "GK-4", group: "K", home: "Colombia", away: "Congo DR", date: "2026-06-23", hour: 20, venue: "Estadio Akron" },
  { id: "GK-5", group: "K", home: "Colombia", away: "Portugal", date: "2026-06-27", hour: 19, minute: 30, venue: "Hard Rock Stadium" },
  { id: "GK-6", group: "K", home: "Congo DR", away: "Uzbekistan", date: "2026-06-27", hour: 19, minute: 30, venue: "Mercedes-Benz Stadium" },

  { id: "GL-1", group: "L", home: "Ghana", away: "Panama", date: "2026-06-17", hour: 19, venue: "BMO Field" },
  { id: "GL-2", group: "L", home: "England", away: "Croatia", date: "2026-06-17", hour: 15, venue: "AT&T Stadium" },
  { id: "GL-3", group: "L", home: "England", away: "Ghana", date: "2026-06-23", hour: 16, venue: "Gillette Stadium" },
  { id: "GL-4", group: "L", home: "Panama", away: "Croatia", date: "2026-06-23", hour: 19, venue: "BMO Field" },
  { id: "GL-5", group: "L", home: "Panama", away: "England", date: "2026-06-27", hour: 17, venue: "MetLife Stadium" },
  { id: "GL-6", group: "L", home: "Croatia", away: "Ghana", date: "2026-06-27", hour: 17, venue: "Lincoln Financial Field" }
];

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

const knockoutFixtures: KnockoutFixture[] = [
  { phase: "roundOf32", index: 1, homeSource: roundOf32Pairings[0][0], awaySource: roundOf32Pairings[0][1], date: "2026-06-28", hour: 12, venue: "SoFi Stadium" },
  { phase: "roundOf32", index: 2, homeSource: roundOf32Pairings[1][0], awaySource: roundOf32Pairings[1][1], date: "2026-06-29", hour: 16, minute: 30, venue: "Gillette Stadium" },
  { phase: "roundOf32", index: 3, homeSource: roundOf32Pairings[2][0], awaySource: roundOf32Pairings[2][1], date: "2026-06-29", hour: 19, venue: "Estadio BBVA" },
  { phase: "roundOf32", index: 4, homeSource: roundOf32Pairings[3][0], awaySource: roundOf32Pairings[3][1], date: "2026-06-29", hour: 12, venue: "NRG Stadium" },
  { phase: "roundOf32", index: 5, homeSource: roundOf32Pairings[4][0], awaySource: roundOf32Pairings[4][1], date: "2026-06-30", hour: 12, venue: "AT&T Stadium" },
  { phase: "roundOf32", index: 6, homeSource: roundOf32Pairings[5][0], awaySource: roundOf32Pairings[5][1], date: "2026-06-30", hour: 17, venue: "MetLife Stadium" },
  { phase: "roundOf32", index: 7, homeSource: roundOf32Pairings[6][0], awaySource: roundOf32Pairings[6][1], date: "2026-06-30", hour: 19, venue: "Estadio Azteca" },
  { phase: "roundOf32", index: 8, homeSource: roundOf32Pairings[7][0], awaySource: roundOf32Pairings[7][1], date: "2026-07-01", hour: 12, venue: "Mercedes-Benz Stadium" },
  { phase: "roundOf32", index: 9, homeSource: roundOf32Pairings[8][0], awaySource: roundOf32Pairings[8][1], date: "2026-07-01", hour: 17, venue: "Levi's Stadium" },
  { phase: "roundOf32", index: 10, homeSource: roundOf32Pairings[9][0], awaySource: roundOf32Pairings[9][1], date: "2026-07-01", hour: 13, venue: "Lumen Field" },
  { phase: "roundOf32", index: 11, homeSource: roundOf32Pairings[10][0], awaySource: roundOf32Pairings[10][1], date: "2026-07-02", hour: 19, venue: "BMO Field" },
  { phase: "roundOf32", index: 12, homeSource: roundOf32Pairings[11][0], awaySource: roundOf32Pairings[11][1], date: "2026-07-02", hour: 12, venue: "SoFi Stadium" },
  { phase: "roundOf32", index: 13, homeSource: roundOf32Pairings[12][0], awaySource: roundOf32Pairings[12][1], date: "2026-07-02", hour: 20, venue: "BC Place" },
  { phase: "roundOf32", index: 14, homeSource: roundOf32Pairings[13][0], awaySource: roundOf32Pairings[13][1], date: "2026-07-03", hour: 18, venue: "Hard Rock Stadium" },
  { phase: "roundOf32", index: 15, homeSource: roundOf32Pairings[14][0], awaySource: roundOf32Pairings[14][1], date: "2026-07-03", hour: 20, minute: 30, venue: "Arrowhead Stadium" },
  { phase: "roundOf32", index: 16, homeSource: roundOf32Pairings[15][0], awaySource: roundOf32Pairings[15][1], date: "2026-07-03", hour: 13, venue: "AT&T Stadium" },

  { phase: "roundOf16", index: 1, homeSource: roundOf16Pairings[0][0], awaySource: roundOf16Pairings[0][1], date: "2026-07-04", hour: 12, venue: "NRG Stadium" },
  { phase: "roundOf16", index: 2, homeSource: roundOf16Pairings[1][0], awaySource: roundOf16Pairings[1][1], date: "2026-07-04", hour: 17, venue: "Lincoln Financial Field" },
  { phase: "roundOf16", index: 3, homeSource: roundOf16Pairings[2][0], awaySource: roundOf16Pairings[2][1], date: "2026-07-05", hour: 16, venue: "MetLife Stadium" },
  { phase: "roundOf16", index: 4, homeSource: roundOf16Pairings[3][0], awaySource: roundOf16Pairings[3][1], date: "2026-07-05", hour: 18, venue: "Estadio Azteca" },
  { phase: "roundOf16", index: 5, homeSource: roundOf16Pairings[4][0], awaySource: roundOf16Pairings[4][1], date: "2026-07-06", hour: 14, venue: "AT&T Stadium" },
  { phase: "roundOf16", index: 6, homeSource: roundOf16Pairings[5][0], awaySource: roundOf16Pairings[5][1], date: "2026-07-06", hour: 17, venue: "Lumen Field" },
  { phase: "roundOf16", index: 7, homeSource: roundOf16Pairings[6][0], awaySource: roundOf16Pairings[6][1], date: "2026-07-07", hour: 12, venue: "Mercedes-Benz Stadium" },
  { phase: "roundOf16", index: 8, homeSource: roundOf16Pairings[7][0], awaySource: roundOf16Pairings[7][1], date: "2026-07-07", hour: 13, venue: "BC Place" },

  { phase: "quarterfinal", index: 1, homeSource: quarterfinalPairings[0][0], awaySource: quarterfinalPairings[0][1], date: "2026-07-09", hour: 16, venue: "Gillette Stadium" },
  { phase: "quarterfinal", index: 2, homeSource: quarterfinalPairings[1][0], awaySource: quarterfinalPairings[1][1], date: "2026-07-10", hour: 12, venue: "SoFi Stadium" },
  { phase: "quarterfinal", index: 3, homeSource: quarterfinalPairings[2][0], awaySource: quarterfinalPairings[2][1], date: "2026-07-11", hour: 17, venue: "Hard Rock Stadium" },
  { phase: "quarterfinal", index: 4, homeSource: quarterfinalPairings[3][0], awaySource: quarterfinalPairings[3][1], date: "2026-07-11", hour: 20, venue: "Arrowhead Stadium" },

  { phase: "semifinal", index: 1, homeSource: semifinalPairings[0][0], awaySource: semifinalPairings[0][1], date: "2026-07-14", hour: 14, venue: "AT&T Stadium" },
  { phase: "semifinal", index: 2, homeSource: semifinalPairings[1][0], awaySource: semifinalPairings[1][1], date: "2026-07-15", hour: 15, venue: "Mercedes-Benz Stadium" },
  { phase: "thirdPlace", index: 1, homeSource: thirdPlacePairings[0][0], awaySource: thirdPlacePairings[0][1], date: "2026-07-18", hour: 17, venue: "Hard Rock Stadium" },
  { phase: "final", index: 1, homeSource: finalPairings[0][0], awaySource: finalPairings[0][1], date: "2026-07-19", hour: 15, venue: "MetLife Stadium" }
];

const groupMatches = groupFixtures.map((fixture) =>
  makeMatch(
    fixture.id,
    "group",
    `${phaseLabels.group} - Grupo ${fixture.group}`,
    fixture.home,
    fixture.away,
    kickoffAtVenue(fixture.date, fixture.hour, fixture.minute ?? 0, fixture.venue),
    fixture.venue
  )
);

const knockoutMatches = knockoutFixtures.map((fixture) =>
  makeMatch(
    `${fixture.phase}-${fixture.index}`,
    fixture.phase,
    `${phaseLabels[fixture.phase]} ${fixture.index}`,
    sourceLabel(fixture.homeSource),
    sourceLabel(fixture.awaySource),
    kickoffAtVenue(fixture.date, fixture.hour, fixture.minute ?? 0, fixture.venue),
    fixture.venue,
    true,
    fixture.homeSource,
    fixture.awaySource
  )
);

export const matches: Match[] = [...groupMatches, ...knockoutMatches];

export const teams = Array.from(new Set(matches.flatMap((match) => [match.home, match.away])));
