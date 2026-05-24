-- =====================================================================
--  THE IN — Tabelle für automatische Backups
--  Einmal im Supabase-Dashboard unter  SQL Editor  ausführen.
-- =====================================================================

create table if not exists backups (
  id         text primary key,
  created_at timestamptz default now(),
  data       jsonb not null
);

alter table backups enable row level security;

-- Nur eingeloggte Nutzer dürfen Backups lesen/schreiben (wie die übrigen Tabellen).
drop policy if exists "auth backups" on backups;
create policy "auth backups" on backups for all to authenticated using (true) with check (true);
