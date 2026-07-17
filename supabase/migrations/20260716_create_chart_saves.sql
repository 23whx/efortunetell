-- Chart parameter saves (recalculate on open; do not store chart result JSON)
create table if not exists public.chart_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  chart_type text not null check (chart_type in ('bazi', 'qimen', 'daliuren', 'naming', 'almanac')),
  title text,
  params jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chart_saves_user_type_idx
  on public.chart_saves (user_id, chart_type, created_at desc);

alter table public.chart_saves enable row level security;

drop policy if exists "users read own chart saves" on public.chart_saves;
create policy "users read own chart saves"
on public.chart_saves for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users insert own chart saves" on public.chart_saves;
create policy "users insert own chart saves"
on public.chart_saves for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users update own chart saves" on public.chart_saves;
create policy "users update own chart saves"
on public.chart_saves for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users delete own chart saves" on public.chart_saves;
create policy "users delete own chart saves"
on public.chart_saves for delete
to authenticated
using (auth.uid() = user_id);
