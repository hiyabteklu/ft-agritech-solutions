-- Run this in Supabase → SQL Editor if quote_requests / contact_messages tables do not exist yet.

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

-- Optional: allow anon/authenticated inserts (adjust RLS to your security needs)
alter table public.quote_requests enable row level security;
alter table public.contact_messages enable row level security;

create policy "Anyone can insert quote_requests"
  on public.quote_requests for insert
  with check (true);

create policy "Users can read own quote_requests"
  on public.quote_requests for select
  using (user_email = auth.jwt() ->> 'email');

create policy "Anyone can insert contact_messages"
  on public.contact_messages for insert
  with check (true);
