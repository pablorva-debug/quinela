import { UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { getGamePredictionRows } from "../lib/gamePredictions";
import type { Match, Submission } from "../types";

interface GamePredictionsScreenProps {
  matches: Match[];
  submissions: Submission[];
}

const phaseNames: Record<Match["phase"], string> = {
  group: "Fase de grupos",
  roundOf32: "Dieciseisavos",
  roundOf16: "Octavos",
  quarterfinal: "Cuartos",
  semifinal: "Semifinales",
  thirdPlace: "Tercer lugar",
  final: "Final"
};

const phases: Match["phase"][] = [
  "group",
  "roundOf32",
  "roundOf16",
  "quarterfinal",
  "semifinal",
  "thirdPlace",
  "final"
];

export function GamePredictionsScreen({ matches, submissions }: GamePredictionsScreenProps) {
  const [selectedPhase, setSelectedPhase] = useState<Match["phase"]>("group");
  const phaseMatches = useMemo(
    () => matches.filter((match) => match.phase === selectedPhase),
    [matches, selectedPhase]
  );

  return (
    <section className="screen-stack">
      <div className="section-title">
        <UsersRound aria-hidden="true" size={20} />
        <h2>Picks por juego</h2>
      </div>
      <select value={selectedPhase} onChange={(event) => setSelectedPhase(event.target.value as Match["phase"])}>
        {phases.map((phase) => (
          <option key={phase} value={phase}>
            {phaseNames[phase]}
          </option>
        ))}
      </select>

      {submissions.length === 0 ? (
        <p className="empty-state">Todavia no hay picks enviados.</p>
      ) : (
        <div className="match-list">
          {phaseMatches.map((match) => {
            const rows = getGamePredictionRows(match, matches, submissions);
            return (
              <article className="game-picks-card" key={match.id}>
                <div className="match-meta">
                  <span>{match.label}</span>
                  <span>{rows.length} picks</span>
                </div>
                <div className="game-picks-list">
                  {rows.map((row, index) => (
                    <div className="pick-row" key={`${match.id}-${row.playerName}-${index}`}>
                      <strong>{row.playerName}</strong>
                      <span>
                        {row.home} {row.homeScore} - {row.awayScore} {row.away}
                      </span>
                      {row.advances ? <small>Avanza: {row.advances}</small> : null}
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
