-- Run in Supabase → SQL Editor
-- Profiles (registered users) + admin action history for the admin dashboard

-- ─── profiles ───────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  last_seen_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists profiles_email_idx on public.profiles (lower(email));
create index if not exists profiles_last_seen_idx on public.profiles (last_seen_at desc);

alter table public.profiles enable row level security;

-- Users can upsert / update their own profile
drop policy if exists "Users upsert own profile" on public.profiles;
create policy "Users upsert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Authenticated users (admins use this to list everyone) can read all profiles
drop policy if exists "Authenticated read all profiles" on public.profiles;
create policy "Authenticated read all profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');

-- Auto-create profile when a user signs up via Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill existing auth users into profiles (safe to re-run)
insert into public.profiles (id, email, full_name, avatar_url, created_at)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  coalesce(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture'),
  u.created_at
from auth.users u
on conflict (id) do nothing;

-- ─── admin_actions ──────────────────────────────────────────────────────────
create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  admin_id uuid references auth.users(id) on delete set null,
  action_type text not null,
  target_table text,
  target_id text,
  summary text not null,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists admin_actions_created_idx on public.admin_actions (created_at desc);
create index if not exists admin_actions_admin_email_idx on public.admin_actions (lower(admin_email));

alter table public.admin_actions enable row level security;

-- Authenticated users can insert their own actions (client-side log from admin UI)
drop policy if exists "Authenticated insert admin_actions" on public.admin_actions;
create policy "Authenticated insert admin_actions"
  on public.admin_actions for insert
  with check (auth.role() = 'authenticated');

-- Authenticated can read all (admin dashboard filters by isAdminEmail client-side)
drop policy if exists "Authenticated read admin_actions" on public.admin_actions;
create policy "Authenticated read admin_actions"
  on public.admin_actions for select
  using (auth.role() = 'authenticated');
