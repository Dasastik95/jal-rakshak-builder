-- =====================================================================
-- PURULIA PROPERTIES — ADMIN PANEL MIGRATIONS
-- Run this in your Supabase SQL Editor (Database → SQL Editor → New Query)
-- =====================================================================

-- 1. App role enum
do $$ begin
  create type public.app_role as enum ('super_admin', 'sub_admin');
exception when duplicate_object then null; end $$;

-- 2. user_roles table
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- 3. has_role security-definer function (avoids RLS recursion)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- 4. is_admin convenience function (true for super_admin OR sub_admin)
create or replace function public.is_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id
      and role in ('super_admin','sub_admin')
  );
$$;

-- 5. Policies for user_roles
drop policy if exists "users can read their own roles" on public.user_roles;
create policy "users can read their own roles" on public.user_roles
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "admins can read all roles" on public.user_roles;
create policy "admins can read all roles" on public.user_roles
  for select to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists "super admins can manage roles" on public.user_roles;
create policy "super admins can manage roles" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

-- 6. admin_audit_logs
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_logs enable row level security;

drop policy if exists "admins can read audit logs" on public.admin_audit_logs;
create policy "admins can read audit logs" on public.admin_audit_logs
  for select to authenticated
  using (public.is_admin(auth.uid()));

create index if not exists admin_audit_logs_created_at_idx
  on public.admin_audit_logs (created_at desc);

-- 7. Add is_blocked to profiles
alter table public.profiles
  add column if not exists is_blocked boolean not null default false;

-- 8. Site settings (single-row config)
create table if not exists public.site_settings (
  id int primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);

insert into public.site_settings (id, data) values (1, '{}'::jsonb)
  on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "anyone can read site settings" on public.site_settings;
create policy "anyone can read site settings" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "admins can update site settings" on public.site_settings;
create policy "admins can update site settings" on public.site_settings
  for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- 9. Admin RLS on existing tables (read-everything + manage)
drop policy if exists "admins can read all profiles" on public.profiles;
create policy "admins can read all profiles" on public.profiles
  for select to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists "admins can update all profiles" on public.profiles;
create policy "admins can update all profiles" on public.profiles
  for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "admins can delete profiles" on public.profiles;
create policy "admins can delete profiles" on public.profiles
  for delete to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists "admins can read all properties" on public.properties;
create policy "admins can read all properties" on public.properties
  for select to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists "admins can update all properties" on public.properties;
create policy "admins can update all properties" on public.properties
  for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "admins can delete properties" on public.properties;
create policy "admins can delete properties" on public.properties
  for delete to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists "admins can read saved_properties" on public.saved_properties;
create policy "admins can read saved_properties" on public.saved_properties
  for select to authenticated
  using (public.is_admin(auth.uid()));

-- =====================================================================
-- 10. CREATE YOUR FIRST SUPER ADMIN
-- After signing up via the admin login page, run:
--
--   insert into public.user_roles (user_id, role)
--   values ('<YOUR-AUTH-USER-ID>', 'super_admin');
--
-- Find your user id in: Authentication → Users
-- =====================================================================
