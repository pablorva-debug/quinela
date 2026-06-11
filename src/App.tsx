import { useEffect, useMemo, useState } from "react";
import { matches } from "./data/matches";
import { resolveMatchTeams } from "./lib/bracket";
import { scoreSubmission, sortLeaderboard } from "./lib/scoring";
import { isPredictionComplete, toCompletedPredictions } from "./lib/predictions";
import { loadRememberedPlayerName, saveRememberedPlayerName } from "./lib/playerMemory";
import {
  getOrCreatePlayer,
  loadResults,
  loadSubmissions,
  saveResult,
  saveSubmission,
  storageMode
} from "./lib/storage";
import { suggestPodium } from "./lib/podium";
import type {
  Match,
  MatchResult,
  Player,
  PodiumPick,
  Prediction,
  Submission
} from "./types";
import { BottomNav, type Tab } from "./components/BottomNav";
import { GamePredictionsScreen } from "./components/GamePredictionsScreen";
import { LeaderboardScreen } from "./components/LeaderboardScreen";
import { NameGate } from "./components/NameGate";
import { PredictionsScreen } from "./components/PredictionsScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import { RulesScreen } from "./components/RulesScreen";

const draftKeyPrefix = "quiniela-pollito-draft";

function emptyPredictions(): Record<string, Prediction> {
  return Object.fromEntries(
    matches.map((match) => [
      match.id,
      {
        matchId: match.id,
        homeScore: "",
        awayScore: "",
        advances: undefined
      }
    ])
  );
}

function officialPodiumFromResults(results: MatchResult[]): Partial<PodiumPick> {
  const final = results.find((result) => result.matchId === "final-1" && result.status === "finished");
  const third = results.find((result) => result.matchId === "thirdPlace-1" && result.status === "finished");
  const finalMatch = matches.find((match) => match.id === "final-1");
  const thirdMatch = matches.find((match) => match.id === "thirdPlace-1");

  const champion =
    final?.winner && final.winner !== "draw" && finalMatch
      ? final.winner === "home"
        ? finalMatch.home
        : final.winner === "away"
          ? finalMatch.away
          : final.winner
      : undefined;
  const runnerUp =
    champion && finalMatch ? (champion === finalMatch.home ? finalMatch.away : finalMatch.home) : undefined;
  const thirdPlace =
    third?.winner && third.winner !== "draw" && thirdMatch
      ? third.winner === "home"
        ? thirdMatch.home
        : third.winner === "away"
          ? thirdMatch.away
          : third.winner
      : undefined;

  return { champion, runnerUp, thirdPlace };
}

export default function App() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("predictions");
  const [predictions, setPredictions] = useState<Record<string, Prediction>>(emptyPredictions);
  const [podium, setPodium] = useState<PodiumPick>({ champion: "", runnerUp: "", thirdPlace: "" });
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string>("");

  const mode = storageMode();
  const resolvedMatches = useMemo(
    () =>
      matches.map((match) => ({
        ...match,
        ...resolveMatchTeams(match, matches, predictions)
      })),
    [predictions]
  );
  const currentSubmission = useMemo(
    () => submissions.find((submission) => submission.playerId === player?.id),
    [player?.id, submissions]
  );
  const completedPredictions = useMemo(() => toCompletedPredictions(resolvedMatches, predictions), [predictions, resolvedMatches]);
  const suggestedPodium = useMemo(() => suggestPodium(resolvedMatches, completedPredictions), [completedPredictions, resolvedMatches]);
  const finishedPodium = useMemo(() => officialPodiumFromResults(results), [results]);
  const leaderboard = useMemo(
    () =>
      sortLeaderboard(
        submissions.map((submission) => scoreSubmission(submission, results, finishedPodium))
      ),
    [finishedPodium, results, submissions]
  );
  const completeCount = resolvedMatches.filter((match) => isPredictionComplete(match, predictions[match.id])).length;
  const canSubmit =
    Boolean(player) &&
    !currentSubmission &&
    completeCount === matches.length &&
    podium.champion &&
    podium.runnerUp &&
    podium.thirdPlace;

  useEffect(() => {
    const rememberedName = loadRememberedPlayerName();
    if (rememberedName) {
      void handleName(rememberedName);
      return;
    }

    void refreshData();
  }, []);

  useEffect(() => {
    if (!currentSubmission) {
      return;
    }

    setPodium(currentSubmission.podium);
    setPredictions((current) => ({
      ...current,
      ...Object.fromEntries(
        currentSubmission.predictions.map((prediction) => [
          prediction.matchId,
          {
            matchId: prediction.matchId,
            homeScore: prediction.homeScore,
            awayScore: prediction.awayScore,
            advances: prediction.advances
          }
        ])
      )
    }));
  }, [currentSubmission]);

  useEffect(() => {
    if (!player || currentSubmission) {
      return;
    }

    const raw = window.localStorage.getItem(`${draftKeyPrefix}-${player.id}`);
    if (!raw) {
      return;
    }

    try {
      const draft = JSON.parse(raw) as {
        podium?: PodiumPick;
        predictions?: Record<string, Prediction>;
        savedAt?: string;
      };
      if (draft.predictions) {
        setPredictions((current) => ({ ...current, ...draft.predictions }));
      }
      if (draft.podium) {
        setPodium(draft.podium);
      }
      if (draft.savedAt) {
        setDraftSavedAt(draft.savedAt);
      }
    } catch {
      window.localStorage.removeItem(`${draftKeyPrefix}-${player.id}`);
    }
  }, [currentSubmission, player]);

  async function refreshData() {
    try {
      const [nextSubmissions, nextResults] = await Promise.all([loadSubmissions(), loadResults()]);
      setSubmissions(nextSubmissions);
      setResults(nextResults);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo cargar la quiniela.");
    }
  }

  async function handleName(name: string) {
    setBusy(true);
    setMessage("");
    try {
      const nextPlayer = await getOrCreatePlayer(name);
      saveRememberedPlayerName(nextPlayer.name);
      setPlayer(nextPlayer);
      await refreshData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo registrar el nombre.");
    } finally {
      setBusy(false);
    }
  }

  function updatePrediction(matchId: string, patch: Partial<Prediction>) {
    setPredictions((current) => ({
      ...current,
      [matchId]: {
        ...current[matchId],
        ...patch
      }
    }));
  }

  async function handleSubmit() {
    if (!player || !canSubmit) {
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const saved = await saveSubmission(player, podium, completedPredictions);
      setSubmissions((current) => [...current.filter((item) => item.id !== saved.id), saved]);
      window.localStorage.removeItem(`${draftKeyPrefix}-${player.id}`);
      setActiveTab("leaderboard");
      setMessage("Predicciones enviadas. Ya quedaron bloqueadas.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo enviar. Intenta otra vez.");
    } finally {
      setBusy(false);
    }
  }

  function handleSaveDraft() {
    if (!player || currentSubmission) {
      return;
    }

    const savedAt = new Date().toISOString();
    window.localStorage.setItem(
      `${draftKeyPrefix}-${player.id}`,
      JSON.stringify({
        predictions,
        podium,
        savedAt
      })
    );
    setDraftSavedAt(savedAt);
    setMessage("Borrador guardado en este navegador.");
  }

  async function handleResult(result: MatchResult) {
    setBusy(true);
    setMessage("");
    try {
      const saved = await saveResult(result);
      setResults((current) => [...current.filter((item) => item.matchId !== saved.matchId), saved]);
      setMessage("Resultado guardado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar el resultado.");
    } finally {
      setBusy(false);
    }
  }

  if (!player) {
    return <NameGate busy={busy} message={message} mode={mode} onSubmit={handleName} />;
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Quiniela Pollito 2026</p>
          <h1>Hola, {player.name}</h1>
        </div>
        <span className="mode-pill">{mode === "supabase" ? "Supabase" : "Demo local"}</span>
      </header>

      {message ? <p className="toast">{message}</p> : null}

      {activeTab === "predictions" ? (
        <PredictionsScreen
          busy={busy}
          canSubmit={Boolean(canSubmit)}
          completeCount={completeCount}
          currentSubmission={currentSubmission}
          draftSavedAt={draftSavedAt}
          matches={resolvedMatches}
          podium={podium}
          predictions={predictions}
          suggestedPodium={suggestedPodium}
          onPodiumChange={setPodium}
          onPredictionChange={updatePrediction}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmit}
        />
      ) : null}

      {activeTab === "leaderboard" ? <LeaderboardScreen rows={leaderboard} submissions={submissions} /> : null}
      {activeTab === "gamePredictions" ? (
        <GamePredictionsScreen matches={matches} results={results} submissions={submissions} />
      ) : null}
      {activeTab === "results" ? (
        <ResultsScreen busy={busy} matches={matches} results={results} onSave={handleResult} />
      ) : null}
      {activeTab === "rules" ? <RulesScreen /> : null}

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </main>
  );
}
