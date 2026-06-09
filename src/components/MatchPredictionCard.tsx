import type { Match, Prediction } from "../types";
import { getAutoAdvance, isPredictionComplete } from "../lib/predictions";

interface MatchPredictionCardProps {
  locked: boolean;
  match: Match;
  prediction: Prediction;
  onChange: (matchId: string, patch: Partial<Prediction>) => void;
}

export function MatchPredictionCard({ locked, match, prediction, onChange }: MatchPredictionCardProps) {
  const complete = isPredictionComplete(match, prediction);
  const autoAdvance = getAutoAdvance(match, prediction);
  const tiedKnockout =
    match.knockout &&
    prediction.homeScore !== "" &&
    prediction.awayScore !== "" &&
    prediction.homeScore === prediction.awayScore;

  return (
    <article className={complete ? "match-card complete" : "match-card"}>
      <div className="match-meta">
        <span>{match.label}</span>
        <span>{match.knockout ? "Gana y avanza" : "Marcador exacto"}</span>
      </div>
      <div className="score-row">
        <span className="team-name">{match.home}</span>
        <input
          aria-label={`Goles de ${match.home}`}
          disabled={locked}
          inputMode="numeric"
          min={0}
          type="number"
          value={prediction.homeScore}
          onChange={(event) => onChange(match.id, { homeScore: event.target.value === "" ? "" : Number(event.target.value) })}
        />
        <span className="score-divider">-</span>
        <input
          aria-label={`Goles de ${match.away}`}
          disabled={locked}
          inputMode="numeric"
          min={0}
          type="number"
          value={prediction.awayScore}
          onChange={(event) => onChange(match.id, { awayScore: event.target.value === "" ? "" : Number(event.target.value) })}
        />
        <span className="team-name right">{match.away}</span>
      </div>
      {match.knockout ? (
        <p className={tiedKnockout ? "advance-line invalid" : "advance-line"}>
          {autoAdvance ? `Avanza: ${autoAdvance}` : "Debe haber ganador en eliminatoria."}
        </p>
      ) : null}
    </article>
  );
}
