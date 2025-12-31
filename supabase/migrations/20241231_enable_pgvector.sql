-- Enable pgvector extension for vector similarity search
create extension if not exists vector;

-- Create table for article embeddings
create table if not exists public.article_embeddings (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  content text not null, -- 文章内容片段
  embedding vector(1024), -- DeepSeek embeddings 维度是 1024
  metadata jsonb, -- 存储额外元数据（标题、分类等）
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create index for vector similarity search
create index if not exists article_embeddings_embedding_idx 
  on public.article_embeddings 
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Create index for article_id lookup
create index if not exists article_embeddings_article_id_idx 
  on public.article_embeddings (article_id);

-- Enable RLS
alter table public.article_embeddings enable row level security;

-- RLS Policies
-- Everyone can read embeddings (for search)
create policy "everyone can read embeddings"
  on public.article_embeddings for select
  to anon, authenticated
  using (true);

-- Only admins can insert/update/delete embeddings
create policy "admins can insert embeddings"
  on public.article_embeddings for insert
  to authenticated
  with check (public.is_admin());

create policy "admins can update embeddings"
  on public.article_embeddings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins can delete embeddings"
  on public.article_embeddings for delete
  to authenticated
  using (public.is_admin());

-- Function to update updated_at timestamp
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger article_embeddings_updated_at
  before update on public.article_embeddings
  for each row
  execute function public.set_updated_at();

-- Function for vector similarity search
create or replace function public.search_articles_by_embedding(
  query_embedding vector(1024),
  match_threshold float default 0.7,
  match_count int default 5
)
returns table (
  id uuid,
  article_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    article_embeddings.id,
    article_embeddings.article_id,
    article_embeddings.content,
    article_embeddings.metadata,
    1 - (article_embeddings.embedding <=> query_embedding) as similarity
  from public.article_embeddings
  where 1 - (article_embeddings.embedding <=> query_embedding) > match_threshold
  order by article_embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Comment on tables and columns
comment on table public.article_embeddings is '文章向量嵌入表，用于 RAG 检索';
comment on column public.article_embeddings.embedding is 'DeepSeek 生成的 1024 维向量';
comment on column public.article_embeddings.content is '文章内容片段（用于检索后展示上下文）';
comment on column public.article_embeddings.metadata is '元数据：标题、分类、标签等';

