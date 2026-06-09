create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  locked boolean not null default true,
  champion text not null,
  runner_up text not null,
  third_place text not null
);

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  match_id text not null,
  home_score integer not null check (home_score >= 0),
  away_score integer not null check (away_score >= 0),
  advances text,
  unique (submission_id, match_id)
);

create table if not exists public.results (
  match_id text primary key,
  home_score integer check (home_score >= 0),
  away_score integer check (away_score >= 0),
  winner text,
  status text not null default 'pending' check (status in ('pending', 'finished', 'postponed', 'cancelled')),
  updated_at timestamptz not null default now()
);

alter table public.players enable row level security;
alter table public.submissions enable row level security;
alter table public.predictions enable row level security;
alter table public.results enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert on public.players to anon, authenticated;
grant select, insert on public.submissions to anon, authenticated;
grant select, insert on public.predictions to anon, authenticated;
grant select, insert, update on public.results to anon, authenticated;

drop policy if exists "players public read" on public.players;
create policy "players public read" on public.players
  for select to anon, authenticated
  using (true);

drop policy if exists "players public insert" on public.players;
create policy "players public insert" on public.players
  for insert to anon, authenticated
  with check (length(trim(name)) between 1 and 80);

drop policy if exists "submissions public read" on public.submissions;
create policy "submissions public read" on public.submissions
  for select to anon, authenticated
  using (true);

drop policy if exists "submissions public insert" on public.submissions;
create policy "submissions public insert" on public.submissions
  for insert to anon, authenticated
  with check (locked = true);

drop policy if exists "predictions public read" on public.predictions;
create policy "predictions public read" on public.predictions
  for select to anon, authenticated
  using (true);

drop policy if exists "predictions public insert" on public.predictions;
create policy "predictions public insert" on public.predictions
  for insert to anon, authenticated
  with check (home_score >= 0 and away_score >= 0);

drop policy if exists "results public read" on public.results;
create policy "results public read" on public.results
  for select to anon, authenticated
  using (true);

drop policy if exists "results fase 1 manual insert" on public.results;
create policy "results fase 1 manual insert" on public.results
  for insert to anon, authenticated
  with check (status in ('pending', 'finished', 'postponed', 'cancelled'));

drop policy if exists "results fase 1 manual update" on public.results;
create policy "results fase 1 manual update" on public.results
  for update to anon, authenticated
  using (true)
  with check (status in ('pending', 'finished', 'postponed', 'cancelled'));
