-- Nail Lab — Supabase şema + RLS + storage (SQL Editor’da bir kez çalıştırın)

create table public.services (
  id text primary key,
  name text not null,
  category text not null,
  price numeric not null default 0,
  duration int not null,
  description text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  updated_at timestamptz default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  phone_normalized text not null default '',
  notes text,
  created_at timestamptz not null default now()
);

create index idx_clients_phone_normalized on public.clients (phone_normalized);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  client_name text not null,
  client_phone text not null,
  service_ids jsonb not null default '[]',
  date date not null,
  time_slot text not null,
  status text not null,
  total_price numeric not null,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_appointments_date on public.appointments (date);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  amount numeric not null,
  category text not null,
  description text not null,
  date date not null,
  appointment_id uuid references public.appointments (id) on delete set null
);

create table public.client_photos (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  photo_type text not null,
  storage_path text not null,
  image_url text not null,
  service_id text,
  photo_date date not null,
  notes text,
  is_public boolean not null default false
);

alter table public.services enable row level security;
alter table public.clients enable row level security;
alter table public.appointments enable row level security;
alter table public.transactions enable row level security;
alter table public.client_photos enable row level security;

create policy "services_select_active_anon"
  on public.services for select to anon
  using (is_active = true);

create policy "services_all_authenticated"
  on public.services for all to authenticated
  using (true) with check (true);

create policy "clients_insert_anon"
  on public.clients for insert to anon
  with check (true);

create policy "clients_all_authenticated"
  on public.clients for all to authenticated
  using (true) with check (true);

create policy "appointments_insert_anon"
  on public.appointments for insert to anon
  with check (true);

create policy "appointments_all_authenticated"
  on public.appointments for all to authenticated
  using (true) with check (true);

create policy "transactions_all_authenticated"
  on public.transactions for all to authenticated
  using (true) with check (true);

create policy "client_photos_select_public_anon"
  on public.client_photos for select to anon
  using (is_public = true);

create policy "client_photos_all_authenticated"
  on public.client_photos for all to authenticated
  using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('client-photos', 'client-photos', true)
on conflict (id) do nothing;

drop policy if exists "storage_client_photos_select" on storage.objects;
create policy "storage_client_photos_select"
  on storage.objects for select
  using (bucket_id = 'client-photos');

drop policy if exists "storage_client_photos_insert" on storage.objects;
create policy "storage_client_photos_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'client-photos');

drop policy if exists "storage_client_photos_update" on storage.objects;
create policy "storage_client_photos_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'client-photos');

drop policy if exists "storage_client_photos_delete" on storage.objects;
create policy "storage_client_photos_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'client-photos');

insert into public.services (id, name, category, price, duration, is_active, sort_order) values
  ('1', 'Kalıcı Oje', 'kalici_oje', 0, 45, true, 0),
  ('2', 'Protez Tırnak', 'protez_tirnak', 0, 90, true, 1),
  ('3', 'Protez Bakım', 'protez_bakim', 0, 60, true, 2),
  ('4', 'Manikür', 'manikur', 0, 45, true, 3),
  ('5', 'Pedikür', 'pedikur', 0, 60, true, 4),
  ('6', 'Jel Güçlendirme', 'jel_guclendirme', 0, 60, true, 5),
  ('7', 'Tırnak Yeme Tedavisi', 'tirnak_yeme_tedavisi', 0, 75, true, 6),
  ('8', 'Kaş Şekillendirme', 'kas_sekillendirme', 0, 30, true, 7)
on conflict (id) do nothing;
