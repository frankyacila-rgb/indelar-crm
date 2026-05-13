-- ============================================================
-- INDELAR CRM — Schema SQL para Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Extensión para UUIDs
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLA: profiles (extiende auth.users de Supabase)
-- ============================================================
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  email       text not null,
  full_name   text not null,
  role        text not null default 'vendedor' check (role in ('admin', 'vendedor')),
  avatar_url  text,
  whatsapp_number text,
  created_at  timestamptz default now()
);

-- Agregar columnas faltantes si la tabla ya existía
alter table public.profiles add column if not exists role text not null default 'vendedor' check (role in ('admin', 'vendedor'));
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists whatsapp_number text;

-- Trigger: crear profile automáticamente al registrar usuario
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TABLA: leads
-- ============================================================
create table if not exists public.leads (
  id                uuid default uuid_generate_v4() primary key,
  code              text not null unique,
  full_name         text not null,
  phone             text not null,
  email             text,
  source            text not null check (source in ('whatsapp','instagram','facebook','web','referido')),
  product_interest  text not null check (product_interest in ('roller_screen','blackout','duo','pvc','multiple')),
  stage             text not null default 'nuevo' check (stage in ('nuevo','contactado','cotizado','seguimiento','visita','ganado','perdido')),
  assigned_to       uuid references public.profiles(id) on delete set null,
  estimated_value   numeric(10,2),
  address           text,
  district          text,
  lost_reason       text,
  last_contact_at   timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ============================================================
-- TABLA: activities (historial/timeline del lead)
-- ============================================================
create table if not exists public.activities (
  id        uuid default uuid_generate_v4() primary key,
  lead_id   uuid references public.leads(id) on delete cascade not null,
  user_id   uuid references public.profiles(id) on delete set null,
  type      text not null check (type in ('note','call','whatsapp','email','stage_change','task','visit')),
  content   text not null,
  metadata  jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLA: tasks
-- ============================================================
create table if not exists public.tasks (
  id          uuid default uuid_generate_v4() primary key,
  lead_id     uuid references public.leads(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  title       text not null,
  description text,
  due_date    timestamptz not null,
  priority    text not null default 'medium' check (priority in ('low','medium','high')),
  status      text not null default 'pending' check (status in ('pending','done','overdue')),
  reminder_sent_at timestamptz,
  created_at  timestamptz default now()
);

-- ============================================================
-- TABLA: quotes (cotizaciones)
-- ============================================================
create table if not exists public.quotes (
  id           uuid default uuid_generate_v4() primary key,
  code         text not null unique,
  lead_id      uuid references public.leads(id) on delete cascade not null,
  created_by   uuid references public.profiles(id) on delete set null,
  status       text not null default 'borrador' check (status in ('borrador','enviada','aceptada','rechazada','vencida')),
  subtotal     numeric(10,2) not null default 0,
  discount_pct numeric(5,2) not null default 0,
  igv          numeric(10,2) not null default 0,
  total        numeric(10,2) not null default 0,
  valid_until  date not null,
  sent_at      timestamptz,
  accepted_at  timestamptz,
  notes        text,
  created_at   timestamptz default now()
);

-- ============================================================
-- TABLA: quote_items (líneas de cotización)
-- ============================================================
create table if not exists public.quote_items (
  id            uuid default uuid_generate_v4() primary key,
  quote_id      uuid references public.quotes(id) on delete cascade not null,
  product_type  text not null check (product_type in ('roller_screen','blackout','duo','pvc','multiple')),
  description   text not null,
  width_cm      numeric(8,2),
  height_cm     numeric(8,2),
  quantity      integer not null default 1,
  unit_price    numeric(10,2) not null,
  total_price   numeric(10,2) not null
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.activities enable row level security;
alter table public.tasks enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;

-- Profiles
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Admin can view all profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Admin can view all profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Leads
drop policy if exists "Vendedor can view assigned leads" on public.leads;
drop policy if exists "Authenticated users can insert leads" on public.leads;
drop policy if exists "Vendedor can update assigned leads" on public.leads;

create policy "Vendedor can view assigned leads" on public.leads
  for select using (
    assigned_to = auth.uid() or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Authenticated users can insert leads" on public.leads
  for insert with check (auth.uid() is not null);

create policy "Vendedor can update assigned leads" on public.leads
  for update using (
    assigned_to = auth.uid() or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Activities
drop policy if exists "Can view activities of own leads" on public.activities;
drop policy if exists "Authenticated users can insert activities" on public.activities;

create policy "Can view activities of own leads" on public.activities
  for select using (
    exists (
      select 1 from public.leads
      where leads.id = activities.lead_id
      and (leads.assigned_to = auth.uid() or
           exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
    )
  );

create policy "Authenticated users can insert activities" on public.activities
  for insert with check (auth.uid() is not null);

-- Tasks
drop policy if exists "Can view own tasks" on public.tasks;
drop policy if exists "Authenticated users can insert tasks" on public.tasks;
drop policy if exists "Can update own tasks" on public.tasks;

create policy "Can view own tasks" on public.tasks
  for select using (
    assigned_to = auth.uid() or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Authenticated users can insert tasks" on public.tasks
  for insert with check (auth.uid() is not null);

create policy "Can update own tasks" on public.tasks
  for update using (
    assigned_to = auth.uid() or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Quotes
drop policy if exists "Can view quotes of own leads" on public.quotes;
drop policy if exists "Authenticated users can insert quotes" on public.quotes;
drop policy if exists "Can update own quotes" on public.quotes;

create policy "Can view quotes of own leads" on public.quotes
  for select using (
    created_by = auth.uid() or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Authenticated users can insert quotes" on public.quotes
  for insert with check (auth.uid() is not null);

create policy "Can update own quotes" on public.quotes
  for update using (
    created_by = auth.uid() or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Quote items
drop policy if exists "Can view quote items" on public.quote_items;
drop policy if exists "Authenticated users can insert quote items" on public.quote_items;

create policy "Can view quote items" on public.quote_items
  for select using (
    exists (
      select 1 from public.quotes
      where quotes.id = quote_items.quote_id
      and (quotes.created_by = auth.uid() or
           exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
    )
  );

create policy "Authenticated users can insert quote items" on public.quote_items
  for insert with check (auth.uid() is not null);

-- ============================================================
-- ÍNDICES (performance)
-- ============================================================
create index if not exists leads_stage_idx on public.leads (stage);
create index if not exists leads_assigned_idx on public.leads (assigned_to);
create index if not exists leads_source_idx on public.leads (source);
create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists activities_lead_idx on public.activities (lead_id);
create index if not exists activities_created_idx on public.activities (created_at desc);
create index if not exists tasks_assigned_idx on public.tasks (assigned_to);
create index if not exists tasks_status_idx on public.tasks (status);
create index if not exists tasks_due_idx on public.tasks (due_date);
create index if not exists quotes_lead_idx on public.quotes (lead_id);
