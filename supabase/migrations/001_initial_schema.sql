-- MOJ BAR: začetna shema + RLS (multi-tenant)
-- Vsak lastnik ima svojo lokacijo; zaposleni so omejeni na svojo lokacijo.

create extension if not exists "pgcrypto";

-- Profili (vezani na auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Lokacije (tenant)
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  logo_url text,
  facebook_url text,
  address text,
  working_hours jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index locations_owner_id_idx on public.locations (owner_id);

-- Člani lokacije (owner / employee)
create type public.member_role as enum ('owner', 'employee');

create table public.location_members (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  role public.member_role not null default 'employee',
  display_name text not null,
  email text,
  color text not null default '#0d9488',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (location_id, user_id)
);

create index location_members_location_id_idx on public.location_members (location_id);
create index location_members_user_id_idx on public.location_members (user_id);

-- Definicije smen
create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations (id) on delete cascade,
  name text not null,
  start_time time not null,
  end_time time not null,
  color text not null default '#14b8a6',
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index shifts_location_id_idx on public.shifts (location_id);

-- Urnik: dodelitve (dan × smena × zaposleni)
create table public.schedule_assignments (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations (id) on delete cascade,
  member_id uuid not null references public.location_members (id) on delete cascade,
  shift_id uuid not null references public.shifts (id) on delete cascade,
  work_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  unique (location_id, member_id, shift_id, work_date)
);

create index schedule_assignments_location_date_idx
  on public.schedule_assignments (location_id, work_date);

-- Dejansko oddelane smene
create table public.actual_shifts (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations (id) on delete cascade,
  member_id uuid not null references public.location_members (id) on delete cascade,
  shift_id uuid references public.shifts (id) on delete set null,
  work_date date not null,
  hours numeric(5,2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create index actual_shifts_location_date_idx on public.actual_shifts (location_id, work_date);

-- Dopusti / bolniške
create type public.leave_type as enum ('leave', 'sick');
create type public.leave_status as enum ('pending', 'approved', 'rejected');

create table public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations (id) on delete cascade,
  member_id uuid not null references public.location_members (id) on delete cascade,
  leave_type public.leave_type not null,
  status public.leave_status not null default 'pending',
  start_date date not null,
  end_date date not null,
  notes text,
  created_at timestamptz not null default now()
);

create index leave_requests_location_idx on public.leave_requests (location_id, start_date, end_date);

-- Analiza prometa
create table public.traffic_entries (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations (id) on delete cascade,
  entry_date date not null,
  amount numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  unique (location_id, entry_date)
);

-- Opomniki / checkliste
create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations (id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  completed boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Dolžniki
create table public.debtors (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations (id) on delete cascade,
  name text not null,
  amount numeric(12,2) not null default 0,
  note text,
  settled boolean not null default false,
  created_at timestamptz not null default now()
);

-- Uspešnost zaposlenih (ročni vnosi / ocene)
create table public.performance_entries (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations (id) on delete cascade,
  member_id uuid not null references public.location_members (id) on delete cascade,
  entry_date date not null,
  score numeric(4,1) not null default 0,
  sales numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

-- Pomožne funkcije za RLS
create or replace function public.is_location_member(loc_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.location_members m
    where m.location_id = loc_id
      and m.user_id = auth.uid()
      and m.active = true
  );
$$;

create or replace function public.is_location_owner(loc_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.location_members m
    where m.location_id = loc_id
      and m.user_id = auth.uid()
      and m.role = 'owner'
      and m.active = true
  )
  or exists (
    select 1 from public.locations l
    where l.id = loc_id and l.owner_id = auth.uid()
  );
$$;

-- Trigger: ob registraciji ustvari profil
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.locations enable row level security;
alter table public.location_members enable row level security;
alter table public.shifts enable row level security;
alter table public.schedule_assignments enable row level security;
alter table public.actual_shifts enable row level security;
alter table public.leave_requests enable row level security;
alter table public.traffic_entries enable row level security;
alter table public.checklist_items enable row level security;
alter table public.debtors enable row level security;
alter table public.performance_entries enable row level security;

-- profiles
create policy "Uporabnik vidi svoj profil"
  on public.profiles for select
  using (id = auth.uid());

create policy "Uporabnik ureja svoj profil"
  on public.profiles for update
  using (id = auth.uid());

-- locations
create policy "Člani vidijo lokacijo"
  on public.locations for select
  using (public.is_location_member(id) or owner_id = auth.uid());

create policy "Lastnik ustvari lokacijo"
  on public.locations for insert
  with check (owner_id = auth.uid());

create policy "Lastnik ureja lokacijo"
  on public.locations for update
  using (public.is_location_owner(id));

create policy "Lastnik zbriše lokacijo"
  on public.locations for delete
  using (public.is_location_owner(id));

-- location_members
create policy "Člani vidijo člane"
  on public.location_members for select
  using (public.is_location_member(location_id));

create policy "Lastnik doda člane"
  on public.location_members for insert
  with check (public.is_location_owner(location_id));

create policy "Lastnik ureja člane"
  on public.location_members for update
  using (public.is_location_owner(location_id));

create policy "Lastnik zbriše člane"
  on public.location_members for delete
  using (public.is_location_owner(location_id));

-- Generic tenant policies for remaining tables
create policy "Člani berejo smene"
  on public.shifts for select using (public.is_location_member(location_id));
create policy "Lastnik ureja smene"
  on public.shifts for all using (public.is_location_owner(location_id))
  with check (public.is_location_owner(location_id));

create policy "Člani berejo urnik"
  on public.schedule_assignments for select using (public.is_location_member(location_id));
create policy "Lastnik ureja urnik"
  on public.schedule_assignments for all using (public.is_location_owner(location_id))
  with check (public.is_location_owner(location_id));

create policy "Člani berejo dejansko"
  on public.actual_shifts for select using (public.is_location_member(location_id));
create policy "Lastnik ureja dejansko"
  on public.actual_shifts for all using (public.is_location_owner(location_id))
  with check (public.is_location_owner(location_id));

create policy "Člani berejo dopuste"
  on public.leave_requests for select using (public.is_location_member(location_id));
create policy "Lastnik ureja dopuste"
  on public.leave_requests for all using (public.is_location_owner(location_id))
  with check (public.is_location_owner(location_id));
create policy "Zaposleni doda svoj dopust"
  on public.leave_requests for insert
  with check (
    public.is_location_member(location_id)
    and member_id in (
      select id from public.location_members
      where location_id = leave_requests.location_id and user_id = auth.uid()
    )
  );

create policy "Lastnik bere promet"
  on public.traffic_entries for select using (public.is_location_owner(location_id));
create policy "Lastnik ureja promet"
  on public.traffic_entries for all using (public.is_location_owner(location_id))
  with check (public.is_location_owner(location_id));

create policy "Člani berejo checkliste"
  on public.checklist_items for select using (public.is_location_member(location_id));
create policy "Lastnik ureja checkliste"
  on public.checklist_items for all using (public.is_location_owner(location_id))
  with check (public.is_location_owner(location_id));

create policy "Lastnik bere dolžnike"
  on public.debtors for select using (public.is_location_owner(location_id));
create policy "Lastnik ureja dolžnike"
  on public.debtors for all using (public.is_location_owner(location_id))
  with check (public.is_location_owner(location_id));

create policy "Lastnik bere uspešnost"
  on public.performance_entries for select using (public.is_location_owner(location_id));
create policy "Lastnik ureja uspešnost"
  on public.performance_entries for all using (public.is_location_owner(location_id))
  with check (public.is_location_owner(location_id));

-- Storage bucket za logotipe
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

create policy "Javno branje logotipov"
  on storage.objects for select
  using (bucket_id = 'logos');

create policy "Lastniki nalagajo logotipe"
  on storage.objects for insert
  with check (
    bucket_id = 'logos'
    and auth.role() = 'authenticated'
  );

create policy "Lastniki posodabljajo logotipe"
  on storage.objects for update
  using (bucket_id = 'logos' and auth.role() = 'authenticated');
