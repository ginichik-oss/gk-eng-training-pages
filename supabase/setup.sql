-- GK Eng Training encrypted vault storage.
--
-- Run this in the Supabase SQL Editor for the project used by the app.
-- This stores only encrypted vault envelopes. It must never store plaintext notes
-- or vault passphrases.

create table if not exists public.user_vaults (
  user_id uuid primary key references auth.users(id) on delete cascade,
  encrypted_vault jsonb not null,
  client_updated_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.user_vaults enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_vaults_updated_at on public.user_vaults;

create trigger set_user_vaults_updated_at
before update on public.user_vaults
for each row
execute function public.set_updated_at();

drop policy if exists "Users can read own vault" on public.user_vaults;
drop policy if exists "Users can create own vault" on public.user_vaults;
drop policy if exists "Users can update own vault" on public.user_vaults;

create policy "Users can read own vault"
on public.user_vaults
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create own vault"
on public.user_vaults
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own vault"
on public.user_vaults
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
