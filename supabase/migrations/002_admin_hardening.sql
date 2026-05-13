-- Nail Lab — Admin yetkilendirme sıkılaştırması
-- Bu migration, authenticated kullanıcılara açık full erişimi kapatır
-- ve admin_users tablosu üzerinden admin yetkisi zorunlu kılar.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "admin_users_select_authenticated" on public.admin_users;
create policy "admin_users_select_authenticated"
  on public.admin_users for select to authenticated
  using (auth.uid() = user_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "services_all_authenticated" on public.services;
create policy "services_admin_all"
  on public.services for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "clients_all_authenticated" on public.clients;
create policy "clients_admin_all"
  on public.clients for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "appointments_all_authenticated" on public.appointments;
create policy "appointments_admin_all"
  on public.appointments for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "transactions_all_authenticated" on public.transactions;
create policy "transactions_admin_all"
  on public.transactions for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "client_photos_all_authenticated" on public.client_photos;
create policy "client_photos_admin_all"
  on public.client_photos for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "storage_client_photos_insert" on storage.objects;
drop policy if exists "storage_client_photos_update" on storage.objects;
drop policy if exists "storage_client_photos_delete" on storage.objects;

create policy "storage_client_photos_insert_admin"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'client-photos' and public.is_admin());

create policy "storage_client_photos_update_admin"
  on storage.objects for update to authenticated
  using (bucket_id = 'client-photos' and public.is_admin());

create policy "storage_client_photos_delete_admin"
  on storage.objects for delete to authenticated
  using (bucket_id = 'client-photos' and public.is_admin());
