-- Users dihandle oleh Supabase Auth (auth.users).
-- Matikan "Confirm email" di Authentication > Providers > Email agar signup langsung login tanpa verifikasi.

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  invoice_number text not null,
  company_name text,
  client_name text,
  total numeric not null default 0,
  data_json jsonb not null,
  status text not null default 'draft' check (status in ('draft','paid')),
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  midtrans_order_id text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.invoices enable row level security;
alter table public.payments enable row level security;

create policy "own invoices" on public.invoices for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own payments select" on public.payments for select using (auth.uid() = user_id);
create policy "own payments insert" on public.payments for insert with check (auth.uid() = user_id);

-- Storage bucket publik untuk logo, stamp, qris
insert into storage.buckets (id, name, public) values ('assets', 'assets', true) on conflict (id) do nothing;
create policy "assets public read" on storage.objects for select using (bucket_id = 'assets');
create policy "assets auth upload" on storage.objects for insert to authenticated with check (bucket_id = 'assets');
create policy "assets own delete" on storage.objects for delete to authenticated using (bucket_id = 'assets' and owner = auth.uid());
