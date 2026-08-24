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

drop policy if exists "Users upsert own profile" on public.profiles;
create policy "Users upsert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Authenticated read all profiles" on public.profiles;
create policy "Authenticated read all profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');

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

drop policy if exists "Authenticated insert admin_actions" on public.admin_actions;
create policy "Authenticated insert admin_actions"
  on public.admin_actions for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated read admin_actions" on public.admin_actions;
create policy "Authenticated read admin_actions"
  on public.admin_actions for select
  using (auth.role() = 'authenticated');

-- Allow security definer function to insert action logs
drop policy if exists "Service insert admin_actions" on public.admin_actions;
create policy "Service insert admin_actions"
  on public.admin_actions for insert
  with check (true);

-- Auto-log status / admin_notes changes on request tables
create or replace function public.log_admin_row_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_email text;
  actor_id uuid;
  summary_text text;
  action text;
begin
  actor_id := auth.uid();
  actor_email := coalesce(auth.jwt() ->> 'email', 'unknown');

  if TG_OP = 'UPDATE' then
    if to_jsonb(NEW) ? 'status' and (OLD.status is distinct from NEW.status) then
      action := 'status_change';
      summary_text := format('Status %s → %s on %s', coalesce(OLD.status, 'null'), coalesce(NEW.status, 'null'), TG_TABLE_NAME);
      insert into public.admin_actions (admin_email, admin_id, action_type, target_table, target_id, summary, details)
      values (
        actor_email,
        actor_id,
        action,
        TG_TABLE_NAME,
        NEW.id::text,
        summary_text,
        jsonb_build_object('from', OLD.status, 'to', NEW.status)
      );
    end if;

    if to_jsonb(NEW) ? 'admin_notes' and (OLD.admin_notes is distinct from NEW.admin_notes) then
      action := 'note_update';
      summary_text := format('Updated admin notes on %s', TG_TABLE_NAME);
      insert into public.admin_actions (admin_email, admin_id, action_type, target_table, target_id, summary, details)
      values (
        actor_email,
        actor_id,
        action,
        TG_TABLE_NAME,
        NEW.id::text,
        summary_text,
        jsonb_build_object('notes_preview', left(coalesce(NEW.admin_notes, ''), 120))
      );
    end if;
  end if;

  return NEW;
end;
$$;

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'quote_requests') then
    execute 'drop trigger if exists trg_log_quote_requests on public.quote_requests';
    execute 'create trigger trg_log_quote_requests after update on public.quote_requests for each row execute function public.log_admin_row_update()';
  end if;
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'problems') then
    execute 'drop trigger if exists trg_log_problems on public.problems';
    execute 'create trigger trg_log_problems after update on public.problems for each row execute function public.log_admin_row_update()';
  end if;
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'custom_requests') then
    execute 'drop trigger if exists trg_log_custom_requests on public.custom_requests';
    execute 'create trigger trg_log_custom_requests after update on public.custom_requests for each row execute function public.log_admin_row_update()';
  end if;
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'contact_messages') then
    execute 'drop trigger if exists trg_log_contact_messages on public.contact_messages';
    execute 'create trigger trg_log_contact_messages after update on public.contact_messages for each row execute function public.log_admin_row_update()';
  end if;
end $$;
