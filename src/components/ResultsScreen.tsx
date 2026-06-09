import { Save } from "lucide-react";
import { useMemo, useState } from "react";
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
        {matches
          .filter((match) => match.phase === selectedPhase)
          .map((match) => (
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
  const [status, setStatus] = useState<MatchResult["status"]>(result?.status ?? "pending");
  const [winner, setWinner] = useState<string>(result?.winner ?? "");

  function save() {
    onSave({
      matchId: match.id,
      homeScore,
      awayScore,
      status,
      winner: winner || undefined,
      updatedAt: new Date().toISOString()
    });
  }

  return (
    <article className="match-card">
      <div className="match-meta">
        <span>{match.label}</span>
        <select value={status} onChange={(event) => setStatus(event.target.value as MatchResult["status"])}>
          <option value="pending">Pendiente</option>
          <option value="finished">Final</option>
          <option value="postponed">Postponed</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>
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
        <select value={winner} onChange={(event) => setWinner(event.target.value)}>
          <option value="">Ganador...</option>
          <option value={match.knockout ? match.home : "home"}>{match.home}</option>
          <option value={match.knockout ? match.away : "away"}>{match.away}</option>
          {!match.knockout ? <option value="draw">Empate</option> : null}
        </select>
        <button className="secondary-button" disabled={busy} type="button" onClick={save}>
          Guardar
        </button>
      </div>
    </article>
  );
}
