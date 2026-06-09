import type { Match, Prediction } from "../types";

interface MatchPredictionCardProps {
  locked: boolean;
  match: Match;
  prediction: Prediction;
  onChange: (matchId: string, patch: Partial<Prediction>) => void;
}

export function MatchPredictionCard({ locked, match, prediction, onChange }: MatchPredictionCardProps) {
  const complete =
    prediction.homeScore !== "" && prediction.awayScore !== "" && (!match.knockout || Boolean(prediction.advances));

  return (
    <article className={complete ? "match-card complete" : "match-card"}>
      <div className="match-meta">
        <span>{match.label}</span>
        <span>{match.knockout ? "Avanza requerido" : "Marcador exacto"}</span>
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
        <select
          aria-label={`Quien avanza en ${match.label}`}
          disabled={locked}
          value={prediction.advances ?? ""}
          onChange={(event) => onChange(match.id, { advances: event.target.value || undefined })}
        >
          <option value="">Avanza...</option>
          <option value={match.home}>{match.home}</option>
          <option value={match.away}>{match.away}</option>
        </select>
      ) : null}
    </article>
  );
}
