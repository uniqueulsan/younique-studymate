-- Supabase SQL Editor에 이 내용을 그대로 붙여넣고 실행하세요.

create table if not exists kv_store (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value text not null,
  shared boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, key, shared)
);

alter table kv_store enable row level security;

create policy "select own rows" on kv_store
  for select using (auth.uid() = user_id);

create policy "insert own rows" on kv_store
  for insert with check (auth.uid() = user_id);

create policy "update own rows" on kv_store
  for update using (auth.uid() = user_id);

create policy "delete own rows" on kv_store
  for delete using (auth.uid() = user_id);
