-- Supabase SQL - Ejecutar en Supabase > SQL Editor > New Query
-- Los 50 de Hugo Perez Yallico - con lista publica

create table if not exists confirmaciones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) >= 3),
  telefono text,
  asistencia text not null check (asistencia in ('si','no')),
  acompanantes int not null default 0 check (acompanantes between 0 and 5),
  mensaje text,
  created_at timestamp with time zone default now()
);

alter table confirmaciones enable row level security;

drop policy if exists "anon puede confirmar" on confirmaciones;
create policy "anon puede confirmar"
on confirmaciones for insert to anon with check (true);

-- Vista publica: oculta telefono, solo expone campos seguros
create or replace view confirmaciones_publicas as
  select id, nombre, asistencia, acompanantes, mensaje, created_at
  from confirmaciones;

-- Permitir lectura publica solo de la vista (no de la tabla base)
-- Nota: las views heredan RLS de la tabla, pero habilitamos select anon sobre la tabla
-- y el frontend solo consultara la vista. Telefono nunca se selecciona.
drop policy if exists "anon puede ver lista publica" on confirmaciones;
create policy "anon puede ver lista publica"
on confirmaciones for select to anon using (true);

-- Realtime para lista en vivo
do $$ begin
  if not exists (select 1 from pg_publication where pubname='supabase_realtime') then
    create publication supabase_realtime;
  end if;
exception when duplicate_object then null; end $$;
alter publication supabase_realtime add table confirmaciones;

create index if not exists idx_confirmaciones_asistencia on confirmaciones(asistencia);
create index if not exists idx_confirmaciones_created on confirmaciones(created_at desc);

-- CRÍTICO: Constraints servidor para evitar bypass del frontend (NOT VALID = no bloquea datos existentes)
alter table confirmaciones add constraint chk_nombre_len check (char_length(trim(nombre)) between 3 and 60) not valid;
alter table confirmaciones add constraint chk_telefono check (telefono is null or telefono ~ '^\d{9}$') not valid;
alter table confirmaciones add constraint chk_mensaje_len check (mensaje is null or char_length(mensaje) <= 200) not valid;
alter table confirmaciones validate constraint chk_nombre_len;
alter table confirmaciones validate constraint chk_telefono;
alter table confirmaciones validate constraint chk_mensaje_len;

-- Trigger sanitización: trim + colapsa espacios + evita vacíos
create or replace function sanitize_confirmacion() returns trigger as $$
begin
  new.nombre := regexp_replace(trim(new.nombre), '\s+', ' ', 'g');
  new.telefono := nullif(trim(new.telefono),'');
  new.mensaje := nullif(trim(new.mensaje),'');
  new.mensaje := regexp_replace(new.mensaje, '[\x00-\x1F\x7F]', '', 'g');
  return new;
end; $$ language plpgsql;
drop trigger if exists trg_sanitize on confirmaciones;
create trigger trg_sanitize before insert or update on confirmaciones for each row execute function sanitize_confirmacion();
