-- Minimal schema for Supabase migration (fresh start)
-- You can run this in Supabase SQL editor.

-- Required for gen_random_uuid()
create extension if not exists pgcrypto;

-- Profiles: role-based access (admin via profiles.role='admin')
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are readable by everyone" on public.profiles;
create policy "profiles are readable by everyone"
on public.profiles for select
to anon, authenticated
using (true);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id);

-- Helper for RLS checks
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

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

drop policy if exists "published articles are readable by everyone" on public.articles;
create policy "published articles are readable by everyone"
on public.articles for select
to anon, authenticated
using (status = 'published' or public.is_admin());

drop policy if exists "admins can insert articles" on public.articles;
create policy "admins can insert articles"
on public.articles for insert
to authenticated
with check (public.is_admin() and author_id = auth.uid());

drop policy if exists "admins can update articles" on public.articles;
create policy "admins can update articles"
on public.articles for update
to authenticated
using (public.is_admin());

drop policy if exists "admins can delete articles" on public.articles;
create policy "admins can delete articles"
on public.articles for delete
to authenticated
using (public.is_admin());

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_articles_updated_at on public.articles;
create trigger set_articles_updated_at
before update on public.articles
for each row execute function public.set_updated_at();

create index if not exists articles_status_created_at_idx
  on public.articles (status, created_at desc);
create index if not exists articles_author_id_idx
  on public.articles (author_id);

-- Bookings / contact requests
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id),
  service_type text not null,
  email text not null,
  birth_datetime text,
  notes text,
  status text not null default 'contact_requested'
    check (status in ('contact_requested', 'pending', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

drop policy if exists "owners can read their bookings" on public.bookings;
create policy "owners can read their bookings"
on public.bookings for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "anyone can create a booking" on public.bookings;
create policy "anyone can create a booking"
on public.bookings for insert
to anon, authenticated
with check (
  (auth.uid() is null and user_id is null)
  or
  (auth.uid() is not null and user_id = auth.uid())
);

drop policy if exists "admins can read all bookings" on public.bookings;
create policy "admins can read all bookings"
on public.bookings for select
to authenticated
using (public.is_admin());

drop policy if exists "admins can update bookings" on public.bookings;
create policy "admins can update bookings"
on public.bookings for update
to authenticated
using (public.is_admin());

drop policy if exists "admins can delete bookings" on public.bookings;
create policy "admins can delete bookings"
on public.bookings for delete
to authenticated
using (public.is_admin());

create index if not exists bookings_created_at_idx
  on public.bookings (created_at desc);
create index if not exists bookings_user_id_idx
  on public.bookings (user_id);

-- Article images (cover + inline)
create table if not exists public.article_images (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.articles (id) on delete cascade,
  draft_key text,
  kind text not null check (kind in ('cover', 'inline')),
  storage_bucket text not null default 'blog-images',
  storage_path text not null,
  public_url text not null,
  mime_type text,
  size_bytes integer,
  width integer,
  height integer,
  created_at timestamptz not null default now(),
  -- Ensure either we are linked to an article or a draft session
  constraint article_images_link_check check (
    article_id is not null or draft_key is not null
  )
);

create index if not exists article_images_article_id_idx
  on public.article_images (article_id);
create index if not exists article_images_draft_key_idx
  on public.article_images (draft_key);
create index if not exists article_images_kind_idx
  on public.article_images (kind);

alter table public.article_images enable row level security;

drop policy if exists "admins can read article_images" on public.article_images;
create policy "admins can read article_images"
on public.article_images for select
to authenticated
using (public.is_admin());

drop policy if exists "admins can insert article_images" on public.article_images;
create policy "admins can insert article_images"
on public.article_images for insert
to authenticated
with check (public.is_admin());

drop policy if exists "admins can update article_images" on public.article_images;
create policy "admins can update article_images"
on public.article_images for update
to authenticated
using (public.is_admin());

drop policy if exists "admins can delete article_images" on public.article_images;
create policy "admins can delete article_images"
on public.article_images for delete
to authenticated
using (public.is_admin());


