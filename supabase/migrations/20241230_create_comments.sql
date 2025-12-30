-- Create comments table for article comments
-- Author: AI Assistant
-- Date: 2024-12-30
-- Description: Add commenting functionality with rate limiting and validation

-- Comments table
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  author_name text not null, -- For anonymous users or display name
  author_email text, -- Optional, for notifications
  content text not null check (char_length(content) >= 6 and char_length(content) <= 66),
  parent_id uuid references public.comments (id) on delete cascade, -- For nested replies
  status text not null default 'approved' check (status in ('approved', 'pending', 'spam', 'deleted')),
  ip_address inet, -- For rate limiting
  user_agent text, -- For spam detection
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for better query performance
create index if not exists comments_article_id_idx on public.comments (article_id);
create index if not exists comments_user_id_idx on public.comments (user_id);
create index if not exists comments_parent_id_idx on public.comments (parent_id);
create index if not exists comments_created_at_idx on public.comments (created_at desc);
create index if not exists comments_status_idx on public.comments (status);
create index if not exists comments_ip_created_idx on public.comments (ip_address, created_at desc);

-- Enable RLS
alter table public.comments enable row level security;

-- RLS Policies
-- Anyone can read approved comments
drop policy if exists "approved comments are readable by everyone" on public.comments;
create policy "approved comments are readable by everyone"
on public.comments for select
to anon, authenticated
using (status = 'approved' or public.is_admin());

-- Authenticated users can insert comments
drop policy if exists "authenticated users can create comments" on public.comments;
create policy "authenticated users can create comments"
on public.comments for insert
to authenticated
with check (
  user_id = auth.uid()
  and char_length(content) >= 6
  and char_length(content) <= 66
);

-- Anonymous users can create comments (with email)
drop policy if exists "anonymous users can create comments" on public.comments;
create policy "anonymous users can create comments"
on public.comments for insert
to anon
with check (
  user_id is null
  and author_email is not null
  and char_length(content) >= 6
  and char_length(content) <= 66
);

-- Users can update their own comments (within 5 minutes)
drop policy if exists "users can update own comments" on public.comments;
create policy "users can update own comments"
on public.comments for update
to authenticated
using (
  user_id = auth.uid()
  and created_at > now() - interval '5 minutes'
)
with check (
  char_length(content) >= 6
  and char_length(content) <= 66
);

-- Users can delete their own comments
drop policy if exists "users can delete own comments" on public.comments;
create policy "users can delete own comments"
on public.comments for delete
to authenticated
using (user_id = auth.uid());

-- Admins can do everything
drop policy if exists "admins can manage all comments" on public.comments;
create policy "admins can manage all comments"
on public.comments for all
to authenticated
using (public.is_admin());

-- Trigger to update updated_at
drop trigger if exists set_comments_updated_at on public.comments;
create trigger set_comments_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

-- Function to check rate limit (prevent spam)
create or replace function public.check_comment_rate_limit(
  p_ip_address inet,
  p_user_id uuid default null
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_recent_count integer;
begin
  -- Check comments from same IP in last 5 minutes
  select count(*)
  into v_recent_count
  from public.comments
  where ip_address = p_ip_address
    and created_at > now() - interval '5 minutes';
  
  -- Allow max 3 comments per 5 minutes from same IP
  if v_recent_count >= 3 then
    return false;
  end if;
  
  -- If user is authenticated, check user-specific rate limit
  if p_user_id is not null then
    select count(*)
    into v_recent_count
    from public.comments
    where user_id = p_user_id
      and created_at > now() - interval '1 minute';
    
    -- Allow max 1 comment per minute per user
    if v_recent_count >= 1 then
      return false;
    end if;
  end if;
  
  return true;
end;
$$;

-- Comment: To use this function in application, call it before inserting:
-- SELECT public.check_comment_rate_limit('192.168.1.1'::inet, auth.uid());

