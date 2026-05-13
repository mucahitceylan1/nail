-- Nail Lab — staff (İldem/Tuğba), appointment extensions, gallery assets, buckets, complete_appointment RPC

-- ---------------------------------------------------------------------------
-- 1) Staff
-- ---------------------------------------------------------------------------
create table if not exists public.staff (
  id uuid primary key,
  display_name text not null,
  sort_order int not null default 0
);

insert into public.staff (id, display_name, sort_order) values
  ('019bd1e2-1d45-4888-9520-40f2d5dabb01', 'İldem', 0),
  ('019bd1e2-1d45-4888-9520-40f2d5dabb02', 'Tuğba', 1)
on conflict (id) do update set display_name = excluded.display_name, sort_order = excluded.sort_order;

alter table public.staff enable row level security;

drop policy if exists "staff_select_public" on public.staff;
create policy "staff_select_public"
  on public.staff for select
  using (true);

drop policy if exists "staff_admin_all" on public.staff;
create policy "staff_admin_all"
  on public.staff for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 2) Appointments: staff, source, pricing, completion, overlap bypass
-- ---------------------------------------------------------------------------
alter table public.appointments
  add column if not exists staff_id uuid references public.staff (id);

alter table public.appointments
  add column if not exists source text not null default 'web';

alter table public.appointments
  add column if not exists list_total_price numeric;

alter table public.appointments
  add column if not exists collected_amount numeric;

alter table public.appointments
  add column if not exists completion_notes text;

alter table public.appointments
  add column if not exists allow_overlap boolean not null default false;

-- Backfill staff + list price
update public.appointments a
set staff_id = coalesce(
  a.staff_id,
  (select s.id from public.staff s order by s.sort_order asc limit 1)
)
where a.staff_id is null;

update public.appointments
set list_total_price = coalesce(list_total_price, total_price)
where list_total_price is null;

alter table public.appointments alter column staff_id set not null;
alter table public.appointments alter column list_total_price set not null;

create or replace function public.default_staff_id()
returns uuid
language sql
stable
as $$
  select s.id from public.staff s order by s.sort_order asc limit 1;
$$;

alter table public.appointments alter column staff_id set default public.default_staff_id();

create unique index if not exists idx_appointments_slot_staff_unique
  on public.appointments (date, time_slot, staff_id)
  where status <> 'cancelled' and coalesce(allow_overlap, false) = false;

-- ---------------------------------------------------------------------------
-- 3) Clients email
-- ---------------------------------------------------------------------------
alter table public.clients add column if not exists email text;

-- ---------------------------------------------------------------------------
-- 4) Client photos: appointment + bucket
-- ---------------------------------------------------------------------------
alter table public.client_photos
  add column if not exists appointment_id uuid references public.appointments (id) on delete set null;

alter table public.client_photos
  add column if not exists storage_bucket text not null default 'client-photos';

-- image_url already text in 001

-- ---------------------------------------------------------------------------
-- 5) Public gallery CMS
-- ---------------------------------------------------------------------------
create table if not exists public.public_gallery_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  sort_order int not null default 0,
  alt_text text,
  created_at timestamptz not null default now()
);

alter table public.public_gallery_assets enable row level security;

drop policy if exists "public_gallery_select_anon" on public.public_gallery_assets;
create policy "public_gallery_select_anon"
  on public.public_gallery_assets for select to anon
  using (true);

drop policy if exists "public_gallery_select_authenticated" on public.public_gallery_assets;
create policy "public_gallery_select_authenticated"
  on public.public_gallery_assets for select to authenticated
  using (true);

drop policy if exists "public_gallery_admin_all" on public.public_gallery_assets;
create policy "public_gallery_admin_all"
  on public.public_gallery_assets for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 6) Storage buckets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('appointment-media', 'appointment-media', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('site-gallery', 'site-gallery', true)
on conflict (id) do nothing;

-- appointment-media: admin only
drop policy if exists "storage_appointment_media_select_public" on storage.objects;
drop policy if exists "storage_appointment_media_select_admin" on storage.objects;
create policy "storage_appointment_media_select_public"
  on storage.objects for select
  using (bucket_id = 'appointment-media');

drop policy if exists "storage_appointment_media_insert_admin" on storage.objects;
create policy "storage_appointment_media_insert_admin"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'appointment-media' and public.is_admin());

drop policy if exists "storage_appointment_media_update_admin" on storage.objects;
create policy "storage_appointment_media_update_admin"
  on storage.objects for update to authenticated
  using (bucket_id = 'appointment-media' and public.is_admin());

drop policy if exists "storage_appointment_media_delete_admin" on storage.objects;
create policy "storage_appointment_media_delete_admin"
  on storage.objects for delete to authenticated
  using (bucket_id = 'appointment-media' and public.is_admin());

-- site-gallery: public read, admin write
drop policy if exists "storage_site_gallery_select" on storage.objects;
create policy "storage_site_gallery_select"
  on storage.objects for select
  using (bucket_id = 'site-gallery');

drop policy if exists "storage_site_gallery_insert_admin" on storage.objects;
create policy "storage_site_gallery_insert_admin"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'site-gallery' and public.is_admin());

drop policy if exists "storage_site_gallery_update_admin" on storage.objects;
create policy "storage_site_gallery_update_admin"
  on storage.objects for update to authenticated
  using (bucket_id = 'site-gallery' and public.is_admin());

drop policy if exists "storage_site_gallery_delete_admin" on storage.objects;
create policy "storage_site_gallery_delete_admin"
  on storage.objects for delete to authenticated
  using (bucket_id = 'site-gallery' and public.is_admin());

-- ---------------------------------------------------------------------------
-- 7) Admin user seed (auth user must exist first)
-- ---------------------------------------------------------------------------
-- Seed removed for fresh project compatibility


-- ---------------------------------------------------------------------------
-- 8) Atomic complete appointment + income transaction
-- ---------------------------------------------------------------------------
create or replace function public.complete_appointment(
  p_appointment_id uuid,
  p_collected_amount numeric,
  p_completion_notes text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_amt numeric;
  v_name text;
  v_date date;
  v_done uuid;
begin
  if not public.is_admin() then
    raise exception 'complete_appointment: not admin';
  end if;

  update public.appointments a
  set
    status = 'completed',
    collected_amount = coalesce(p_collected_amount, a.list_total_price),
    completion_notes = nullif(trim(p_completion_notes), '')
  where a.id = p_appointment_id
    and a.status in ('pending', 'confirmed')
  returning a.id into v_done;

  if v_done is null then
    raise exception 'complete_appointment: appointment not found or not completable';
  end if;

  select
    coalesce(a.collected_amount, a.list_total_price),
    a.client_name,
    a.date
  into v_amt, v_name, v_date
  from public.appointments a
  where a.id = p_appointment_id;

  insert into public.transactions (id, type, amount, category, description, date, appointment_id)
  values (
    gen_random_uuid(),
    'income',
    v_amt,
    'randevu',
    'Randevu: ' || coalesce(v_name, ''),
    v_date,
    p_appointment_id
  );
end;
$$;

revoke all on function public.complete_appointment(uuid, numeric, text) from public;
grant execute on function public.complete_appointment(uuid, numeric, text) to authenticated;
