-- Run in Supabase → SQL Editor

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  product_price text,
  sector text,
  quantity text default '1',
  notes text,
  contact_phone text,
  user_email text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz default now()
);

alter table public.quote_requests enable row level security;
alter table public.contact_messages enable row level security;

-- Inserts (public forms)
drop policy if exists "Anyone can insert quote_requests" on public.quote_requests;
create policy "Anyone can insert quote_requests"
  on public.quote_requests for insert
  with check (true);

drop policy if exists "Anyone can insert contact_messages" on public.contact_messages;
create policy "Anyone can insert contact_messages"
  on public.contact_messages for insert
  with check (true);

-- Users read their own quotes
drop policy if exists "Users can read own quote_requests" on public.quote_requests;
create policy "Users can read own quote_requests"
  on public.quote_requests for select
  using (user_email = auth.jwt() ->> 'email');

-- Authenticated staff can read all rows (tighten later if needed)
drop policy if exists "Authenticated read all quote_requests" on public.quote_requests;
create policy "Authenticated read all quote_requests"
  on public.quote_requests for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated read all contact_messages" on public.contact_messages;
create policy "Authenticated read all contact_messages"
  on public.contact_messages for select
  using (auth.role() = 'authenticated');

-- If problems / custom_requests already exist, ensure authenticated can read for admin:
-- (safe to run even if policies already exist — drop first)
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'problems') then
    execute 'alter table public.problems enable row level security';
    execute 'drop policy if exists "Authenticated read all problems" on public.problems';
    execute 'create policy "Authenticated read all problems" on public.problems for select using (auth.role() = ''authenticated'')';
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'custom_requests') then
    execute 'alter table public.custom_requests enable row level security';
    execute 'drop policy if exists "Authenticated read all custom_requests" on public.custom_requests';
    execute 'create policy "Authenticated read all custom_requests" on public.custom_requests for select using (auth.role() = ''authenticated'')';
  end if;
end $$;
