import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  CompletedPrediction,
  MatchResult,
  Player,
  PodiumPick,
  Submission
} from "../types";

const STORAGE_KEY = "quiniela-pollito-v1";

interface StoredState {
  players: Player[];
  submissions: Submission[];
  results: MatchResult[];
  officialPodium?: Partial<PodiumPick>;
}

interface SubmissionRow {
  id: string;
  player_id: string;
  submitted_at: string;
  locked: boolean;
  champion: string;
  runner_up: string;
  third_place: string;
  players?: { name: string } | { name: string }[] | null;
}

interface PredictionRow {
  submission_id: string;
  match_id: string;
  home_score: number;
  away_score: number;
  advances: string | null;
}

interface ResultRow {
  match_id: string;
  home_score: number | null;
  away_score: number | null;
  winner: string | null;
  status: MatchResult["status"];
  updated_at: string;
}

const emptyState: StoredState = {
  players: [],
  submissions: [],
  results: []
};

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
}

function readLocalState(): StoredState {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { ...emptyState };
  }

  try {
    return { ...emptyState, ...JSON.parse(raw) };
  } catch {
    return { ...emptyState };
  }
}

function writeLocalState(state: StoredState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getSupabase(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}

function toSubmission(row: SubmissionRow, predictions: PredictionRow[]): Submission {
  const playerRecord = Array.isArray(row.players) ? row.players[0] : row.players;

  return {
    id: row.id,
    playerId: row.player_id,
    playerName: playerRecord?.name ?? "Jugador",
    submittedAt: row.submitted_at,
    locked: true,
    podium: {
      champion: row.champion,
      runnerUp: row.runner_up,
      thirdPlace: row.third_place
    },
    predictions: predictions
      .filter((prediction) => prediction.submission_id === row.id)
      .map((prediction) => ({
        matchId: prediction.match_id,
        homeScore: prediction.home_score,
        awayScore: prediction.away_score,
        advances: prediction.advances ?? undefined
      }))
  };
}

function toResult(row: ResultRow): MatchResult {
  return {
    matchId: row.match_id,
    homeScore: row.home_score ?? "",
    awayScore: row.away_score ?? "",
    winner: row.winner ?? undefined,
    status: row.status,
    updatedAt: row.updated_at
  };
}

export function storageMode(): "supabase" | "demo" {
  return getSupabase() ? "supabase" : "demo";
}

export async function getOrCreatePlayer(name: string): Promise<Player> {
  const cleanName = name.trim().slice(0, 80);
  const supabase = getSupabase();

  if (supabase) {
    const { data: existing, error: existingError } = await supabase
      .from("players")
      .select("id,name,created_at")
      .ilike("name", cleanName)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }
    if (existing) {
      return { id: existing.id, name: existing.name, createdAt: existing.created_at };
    }

    const { data, error } = await supabase
      .from("players")
      .insert({ name: cleanName })
      .select("id,name,created_at")
      .single();

    if (error) {
      throw error;
    }

    return { id: data.id, name: data.name, createdAt: data.created_at };
  }

  const state = readLocalState();
  const existing = state.players.find((player) => player.name.toLowerCase() === cleanName.toLowerCase());
  if (existing) {
    return existing;
  }

  const player = { id: createId("player"), name: cleanName, createdAt: nowIso() };
  writeLocalState({ ...state, players: [...state.players, player] });
  return player;
}

export async function loadSubmissions(): Promise<Submission[]> {
  const supabase = getSupabase();
  if (supabase) {
    const [{ data: submissions, error: submissionsError }, { data: predictions, error: predictionsError }] =
      await Promise.all([
        supabase
          .from("submissions")
          .select("id,player_id,submitted_at,locked,champion,runner_up,third_place,players(name)")
          .order("submitted_at", { ascending: true }),
        supabase.from("predictions").select("submission_id,match_id,home_score,away_score,advances")
      ]);

    if (submissionsError) {
      throw submissionsError;
    }
    if (predictionsError) {
      throw predictionsError;
    }

    return (submissions ?? []).map((submission) =>
      toSubmission(submission as SubmissionRow, (predictions ?? []) as PredictionRow[])
    );
  }

  return readLocalState().submissions;
}

export async function saveSubmission(
  player: Player,
  podium: PodiumPick,
  predictions: CompletedPrediction[]
): Promise<Submission> {
  const supabase = getSupabase();

  if (supabase) {
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .insert({
        player_id: player.id,
        locked: true,
        champion: podium.champion,
        runner_up: podium.runnerUp,
        third_place: podium.thirdPlace
      })
      .select("id,player_id,submitted_at,locked,champion,runner_up,third_place")
      .single();

    if (submissionError) {
      throw submissionError;
    }

    const rows = predictions.map((prediction) => ({
      submission_id: submission.id,
      match_id: prediction.matchId,
      home_score: prediction.homeScore,
      away_score: prediction.awayScore,
      advances: prediction.advances ?? null
    }));
    const { error: predictionsError } = await supabase.from("predictions").insert(rows);

    if (predictionsError) {
      throw predictionsError;
    }

    return {
      id: submission.id,
      playerId: player.id,
      playerName: player.name,
      submittedAt: submission.submitted_at,
      locked: true,
      podium,
      predictions
    };
  }

  const state = readLocalState();
  const existing = state.submissions.find((submission) => submission.playerId === player.id);
  if (existing) {
    return existing;
  }

  const submission: Submission = {
    id: createId("submission"),
    playerId: player.id,
    playerName: player.name,
    submittedAt: nowIso(),
    locked: true,
    podium,
    predictions
  };

  writeLocalState({ ...state, submissions: [...state.submissions, submission] });
  return submission;
}

export async function loadResults(): Promise<MatchResult[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.from("results").select("*").order("match_id");
    if (error) {
      throw error;
    }
    return ((data ?? []) as ResultRow[]).map(toResult);
  }

  return readLocalState().results;
}

export async function saveResult(result: MatchResult): Promise<MatchResult> {
  const next = { ...result, updatedAt: nowIso() };
  const supabase = getSupabase();

  if (supabase) {
    const { error } = await supabase.from("results").upsert({
      match_id: next.matchId,
      home_score: next.homeScore === "" ? null : next.homeScore,
      away_score: next.awayScore === "" ? null : next.awayScore,
      winner: next.winner ?? null,
      status: next.status,
      updated_at: next.updatedAt
    });

    if (error) {
      throw error;
    }
    return next;
  }

  const state = readLocalState();
  const results = state.results.filter((stored) => stored.matchId !== next.matchId);
  writeLocalState({ ...state, results: [...results, next] });
  return next;
}

export function clearDemoData(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
