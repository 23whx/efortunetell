-- Minimal schema for Supabase migration (fresh start)
-- You can run this in Supabase SQL editor.

-- Profiles: role-based access (admin via profiles.role='admin')
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are readable by everyone"
on public.profiles for select
to anon, authenticated
using (true);

create policy "users can insert own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id);

-- Articles
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id),
  title text not null,
  slug text not null unique,
  summary text,
  content_html text not null,
  category text,
  tags text[] not null default '{}',
  status text not null default 'published' check (status in ('draft', 'published')),
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.articles enable row level security;

create policy "published articles are readable by everyone"
on public.articles for select
to anon, authenticated
using (status = 'published' or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

create policy "admins can insert articles"
on public.articles for insert
to authenticated
with check (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

create policy "admins can update articles"
on public.articles for update
to authenticated
using (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

create policy "admins can delete articles"
on public.articles for delete
to authenticated
using (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

-- Bookings / contact requests
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id),
  service_type text not null,
  email text not null,
  birth_datetime text,
  notes text,
  status text not null default 'contact_requested',
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

create policy "owners can read their bookings"
on public.bookings for select
to authenticated
using (user_id = auth.uid());

create policy "anyone can create a booking"
on public.bookings for insert
to anon, authenticated
with check (true);

create policy "admins can read all bookings"
on public.bookings for select
to authenticated
using (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

create policy "admins can update bookings"
on public.bookings for update
to authenticated
using (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));


