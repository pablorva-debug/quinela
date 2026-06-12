import { Save } from "lucide-react";
import { useMemo, useState } from "react";
import { sortMatchesByKickoff } from "../lib/matchOrder";
import { getResultStatus, getResultWinner } from "../lib/results";
import type { Match, MatchResult } from "../types";

interface ResultsScreenProps {
  busy: boolean;
  matches: Match[];
  results: MatchResult[];
  onSave: (result: MatchResult) => void;
}

export function ResultsScreen({ busy, matches, results, onSave }: ResultsScreenProps) {
  const resultByMatch = useMemo(() => new Map(results.map((result) => [result.matchId, result])), [results]);
  const [selectedPhase, setSelectedPhase] = useState<Match["phase"]>("group");
  const phaseMatches = useMemo(
    () => sortMatchesByKickoff(matches.filter((match) => match.phase === selectedPhase)),
    [matches, selectedPhase]
  );

  return (
    <section className="screen-stack">
      <div className="section-title">
        <Save aria-hidden="true" size={20} />
        <h2>Resultados</h2>
      </div>
      <p className="warning-note">Fase 1: captura manual. El botón mágico de API viene después.</p>
      <select value={selectedPhase} onChange={(event) => setSelectedPhase(event.target.value as Match["phase"])}>
        <option value="group">Fase de grupos</option>
        <option value="roundOf32">Dieciseisavos</option>
        <option value="roundOf16">Octavos</option>
        <option value="quarterfinal">Cuartos</option>
        <option value="semifinal">Semifinales</option>
        <option value="thirdPlace">Tercer lugar</option>
        <option value="final">Final</option>
      </select>
      <div className="match-list">
        {phaseMatches.map((match) => (
          <ResultEditor
            busy={busy}
            key={match.id}
            match={match}
            result={resultByMatch.get(match.id)}
            onSave={onSave}
          />
        ))}
      </div>
    </section>
  );
}

interface ResultEditorProps {
  busy: boolean;
  match: Match;
  result?: MatchResult;
  onSave: (result: MatchResult) => void;
}

function ResultEditor({ busy, match, result, onSave }: ResultEditorProps) {
  const [homeScore, setHomeScore] = useState<number | "">(result?.homeScore ?? "");
  const [awayScore, setAwayScore] = useState<number | "">(result?.awayScore ?? "");
  const status = getResultStatus(homeScore, awayScore);
  const winner = getResultWinner(match, homeScore, awayScore);
  const tiedKnockout =
    match.knockout && homeScore !== "" && awayScore !== "" && Number(homeScore) === Number(awayScore);
  const kickoff = new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short"
  }).format(new Date(match.kickoff));

  function save() {
    onSave({
      matchId: match.id,
      homeScore,
      awayScore,
      status,
      winner,
      updatedAt: new Date().toISOString()
    });
  }

  return (
    <article className="match-card">
      <div className="match-meta">
        <span>{match.label}</span>
        <span>{status === "finished" ? "Final" : "Pendiente"}</span>
      </div>
      <p className="fixture-line">
        {kickoff} - {match.venue}
      </p>
      <div className="score-row">
        <span className="team-name">{match.home}</span>
        <input
          inputMode="numeric"
          min={0}
          type="number"
          value={homeScore}
          onChange={(event) => setHomeScore(event.target.value === "" ? "" : Number(event.target.value))}
        />
        <span className="score-divider">-</span>
        <input
          inputMode="numeric"
          min={0}
          type="number"
          value={awayScore}
          onChange={(event) => setAwayScore(event.target.value === "" ? "" : Number(event.target.value))}
        />
        <span className="team-name right">{match.away}</span>
      </div>
      <div className="result-actions">
        <p className={tiedKnockout ? "advance-line invalid" : "advance-line"}>
          {winner
            ? winner === "home"
              ? `Ganador: ${match.home}`
              : winner === "away"
                ? `Ganador: ${match.away}`
                : winner === "draw"
                  ? "Empate"
                  : `Ganador: ${winner}`
            : "Marcador pendiente."}
        </p>
        <button className="secondary-button" disabled={busy || tiedKnockout} type="button" onClick={save}>
          Guardar
        </button>
      </div>
    </article>
  );
}
