# Quiniela Pollito Fase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first usable Quiniela Pollito 2026 web app with a loaded 104-match template, local demo persistence, Supabase-ready persistence, predictions, manual results, scoring, and leaderboard.

**Architecture:** Create a Vite + React + TypeScript SPA. Keep tournament data, scoring, podium suggestions, persistence adapters, and UI components in focused files. Use localStorage as a complete demo adapter and expose Supabase SQL/config for deployment.

**Tech Stack:** Vite, React, TypeScript, Vitest, Supabase JS, Netlify static deploy.

---

## File Structure

- `package.json`: scripts and pinned dependencies.
- `index.html`, `vite.config.ts`, `tsconfig*.json`: Vite app setup.
- `netlify.toml`, `public/_redirects`: Netlify build and SPA routing.
- `.env.example`: Supabase public environment variable names.
- `supabase/schema.sql`: SQL tables, grants, and RLS policies for Fase 1.
- `src/types.ts`: shared app contracts.
- `src/data/matches.ts`: deterministic 104-match placeholder template.
- `src/lib/scoring.ts`: pure scoring functions.
- `src/lib/podium.ts`: pure podium suggestion function.
- `src/lib/storage.ts`: localStorage demo adapter and Supabase-ready repository functions.
- `src/App.tsx`: app shell and screen orchestration.
- `src/components/*.tsx`: focused UI components.
- `src/styles.css`: mobile-first visual system.
- `src/lib/*.test.ts`: unit tests for scoring, podium, and match template count.

## Tasks

### Task 1: Scaffold Vite App

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`

- [ ] Create minimal Vite React TypeScript files.
- [ ] Run `npm install`.
- [ ] Run `npm run build`.
- [ ] Commit: `chore: scaffold vite react app`.

### Task 2: Add Domain Types And Match Template

**Files:**
- Create: `src/types.ts`
- Create: `src/data/matches.ts`
- Create: `src/data/matches.test.ts`

- [ ] Write failing test asserting `matches` has 104 unique ids.
- [ ] Run `npm test -- src/data/matches.test.ts` and confirm failure.
- [ ] Implement types and generate a deterministic 104-match placeholder template: 72 group matches, 32 knockout matches.
- [ ] Run test and confirm pass.
- [ ] Commit: `feat: add 104 match template`.

### Task 3: Add Scoring Logic With TDD

**Files:**
- Create: `src/lib/scoring.ts`
- Create: `src/lib/scoring.test.ts`

- [ ] Write failing tests for 0, 5, 10 point outcomes and ignored postponed/cancelled matches.
- [ ] Run `npm test -- src/lib/scoring.test.ts` and confirm failure.
- [ ] Implement `scoreMatch`, `scorePodium`, and `scoreSubmission`.
- [ ] Run test and confirm pass.
- [ ] Commit: `feat: add scoring rules`.

### Task 4: Add Podium Suggestion With TDD

**Files:**
- Create: `src/lib/podium.ts`
- Create: `src/lib/podium.test.ts`

- [ ] Write failing test that ranks teams from predicted wins and advances picks.
- [ ] Run `npm test -- src/lib/podium.test.ts` and confirm failure.
- [ ] Implement `suggestPodium`.
- [ ] Run test and confirm pass.
- [ ] Commit: `feat: suggest podium from predictions`.

### Task 5: Add Persistence And Supabase Schema

**Files:**
- Create: `.env.example`
- Create: `supabase/schema.sql`
- Create: `src/lib/storage.ts`

- [ ] Implement localStorage repository for players, submissions, predictions, and results.
- [ ] Add optional Supabase client loading using `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, with legacy `VITE_SUPABASE_ANON_KEY` fallback.
- [ ] Add SQL schema with explicit grants and RLS policies for public no-login flow.
- [ ] Run `npm run build`.
- [ ] Commit: `feat: add persistence adapters`.

### Task 6: Build Mobile-First UI

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/NameGate.tsx`
- Create: `src/components/BottomNav.tsx`
- Create: `src/components/PredictionsScreen.tsx`
- Create: `src/components/MatchPredictionCard.tsx`
- Create: `src/components/LeaderboardScreen.tsx`
- Create: `src/components/ResultsScreen.tsx`
- Create: `src/components/RulesScreen.tsx`
- Modify: `src/styles.css`

- [ ] Build name entry flow.
- [ ] Build bottom navigation.
- [ ] Build predictions screen with progress, podium, grouped phases, knockout advances, and send lock.
- [ ] Build leaderboard from scoring functions.
- [ ] Build manual results screen for Fase 1.
- [ ] Build compact rules screen.
- [ ] Run `npm run build`.
- [ ] Commit: `feat: build quiniela fase 1 ui`.

### Task 7: Verify And Polish

**Files:**
- Modify as needed based on verification.

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Start local dev server.
- [ ] Inspect mobile and desktop in browser.
- [ ] Fix layout or runtime issues.
- [ ] Commit: `chore: verify fase 1 app`.

