import { CheckCircle2, Lock, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import type { Match, PodiumPick, Prediction, Submission } from "../types";
import { MatchPredictionCard } from "./MatchPredictionCard";

interface PredictionsScreenProps {
  busy: boolean;
  canSubmit: boolean;
  completeCount: number;
  currentSubmission?: Submission;
  deadline: Date;
  matches: Match[];
  podium: PodiumPick;
  predictions: Record<string, Prediction>;
  suggestedPodium: PodiumPick;
  onPodiumChange: (podium: PodiumPick) => void;
  onPredictionChange: (matchId: string, patch: Partial<Prediction>) => void;
  onSubmit: () => void;
}

const phaseOrder: Match["phase"][] = [
  "group",
  "roundOf32",
  "roundOf16",
  "quarterfinal",
  "semifinal",
  "thirdPlace",
  "final"
];

const phaseNames: Record<Match["phase"], string> = {
  group: "Fase de grupos",
  roundOf32: "Dieciseisavos",
  roundOf16: "Octavos",
  quarterfinal: "Cuartos",
  semifinal: "Semifinales",
  thirdPlace: "Tercer lugar",
  final: "Final"
};

export function PredictionsScreen({
  busy,
  canSubmit,
  completeCount,
  currentSubmission,
  deadline,
  matches,
  podium,
  predictions,
  suggestedPodium,
  onPodiumChange,
  onPredictionChange,
  onSubmit
}: PredictionsScreenProps) {
  const locked = Boolean(currentSubmission);
  const progress = Math.round((completeCount / matches.length) * 100);

  function useSuggestion() {
    onPodiumChange(suggestedPodium);
  }

  return (
    <section className="screen-stack">
      <section className="status-band">
        <div>
          <p className="eyebrow">Cierra el 11 de junio de 2026</p>
          <h2>{locked ? "Tus picks ya quedaron bloqueados." : `${completeCount}/${matches.length} partidos`}</h2>
        </div>
        <div className="progress-ring" style={{ "--progress": `${progress}%` } as CSSProperties}>
          {progress}%
        </div>
      </section>

      {phaseOrder.map((phase) => {
        const phaseMatches = matches.filter((match) => match.phase === phase);
        return (
          <details className="phase-group" key={phase} open={phase === "group" || phase === "final"}>
            <summary>
              <span>{phaseNames[phase]}</span>
              <span>{phaseMatches.length}</span>
            </summary>
            <div className="match-list">
              {phaseMatches.map((match) => (
                <MatchPredictionCard
                  key={match.id}
                  locked={locked}
                  match={match}
                  prediction={predictions[match.id]}
                  onChange={onPredictionChange}
                />
              ))}
            </div>
          </details>
        );
      })}

      <section className="podium-panel">
        <div className="section-title">
          <Sparkles aria-hidden="true" size={20} />
          <h2>Pódium</h2>
        </div>
        <div className="suggestion-line">
          Sugerido: {suggestedPodium.champion || "-"} / {suggestedPodium.runnerUp || "-"} /{" "}
          {suggestedPodium.thirdPlace || "-"}
          {!locked ? (
            <button className="ghost-button" type="button" onClick={useSuggestion}>
              Usar
            </button>
          ) : null}
        </div>
        <div className="podium-grid">
          <label>
            Campeón
            <input
              disabled={locked}
              value={podium.champion}
              onChange={(event) => onPodiumChange({ ...podium, champion: event.target.value })}
            />
          </label>
          <label>
            Subcampeón
            <input
              disabled={locked}
              value={podium.runnerUp}
              onChange={(event) => onPodiumChange({ ...podium, runnerUp: event.target.value })}
            />
          </label>
          <label>
            3er lugar
            <input
              disabled={locked}
              value={podium.thirdPlace}
              onChange={(event) => onPodiumChange({ ...podium, thirdPlace: event.target.value })}
            />
          </label>
        </div>
      </section>

      <div className="submit-dock">
        <div>
          {locked ? <Lock aria-hidden="true" size={18} /> : <CheckCircle2 aria-hidden="true" size={18} />}
          <span>{locked ? "Enviado" : deadline.getTime() <= Date.now() ? "Cerrado" : "Sin empates en KO"}</span>
        </div>
        {!locked ? (
          <button className="primary-button" disabled={!canSubmit || busy} type="button" onClick={onSubmit}>
            {busy ? "Enviando..." : "Enviar picks"}
          </button>
        ) : null}
      </div>
    </section>
  );
}
