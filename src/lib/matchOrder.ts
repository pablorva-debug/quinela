import type { Match } from "../types";

export function sortMatchesByKickoff(matches: Match[]): Match[] {
  return [...matches].sort(
    (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime() || a.id.localeCompare(b.id)
  );
}
