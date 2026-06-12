import { UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { getGamePredictionRows } from "../lib/gamePredictions";
import { getGameResultState } from "../lib/gameStatus";
import { sortMatchesByKickoff } from "../lib/matchOrder";
import type { Match, MatchResult, Submission } from "../types";

interface GamePredictionsScreenProps {
  matches: Match[];
  results: MatchResult[];
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

function formatKickoff(kickoff: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short"
  }).format(new Date(kickoff));
}

export function GamePredictionsScreen({ matches, results, submissions }: GamePredictionsScreenProps) {
  const [selectedPhase, setSelectedPhase] = useState<Match["phase"]>("group");
  const phaseMatches = useMemo(
    () => sortMatchesByKickoff(matches.filter((match) => match.phase === selectedPhase)),
    [matches, selectedPhase]
  );
  const resultByMatch = useMemo(() => new Map(results.map((result) => [result.matchId, result])), [results]);

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
            const resultState = getGameResultState(resultByMatch.get(match.id));
            return (
              <article className={resultState.logged ? "game-picks-card is-logged" : "game-picks-card"} key={match.id}>
                <div className="game-card-head">
                  <div>
                    <p className="game-card-kicker">{match.label}</p>
                    <h3>
                      {match.home} <span>vs</span> {match.away}
                    </h3>
                    <p className="fixture-line">
                      {formatKickoff(match.kickoff)} - {match.venue}
                    </p>
                  </div>
                  <div className={resultState.logged ? "result-pill logged" : "result-pill"}>
                    <strong>{resultState.label}</strong>
                    {resultState.score ? <span>{resultState.score}</span> : null}
                  </div>
                </div>

                <div className="game-card-subhead">
                  <span>{rows.length} picks enviados</span>
                  {resultState.logged ? <span>Resultado cargado</span> : <span>Sin resultado</span>}
                </div>

                <div className="game-picks-list">
                  {rows.map((row, index) => (
                    <div className="pick-row" key={`${match.id}-${row.playerName}-${index}`}>
                      <div>
                        <strong>{row.playerName}</strong>
                        {row.advances ? <small>Avanza: {row.advances}</small> : null}
                      </div>
                      <span className="pick-score">
                        {row.homeScore}-{row.awayScore}
                      </span>
                      <span className="pick-teams">
                        {row.home} / {row.away}
                      </span>
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
