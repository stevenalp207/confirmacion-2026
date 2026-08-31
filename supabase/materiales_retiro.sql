-- Ejecuta este script una vez en Supabase > SQL Editor.
create table if not exists public.materiales_retiro (
  id uuid primary key default gen_random_uuid(),
  detalle text not null check (char_length(trim(detalle)) > 0),
  placa text,
  cantidad integer not null check (cantidad > 0),
  condicion text not null,
  procedencia text not null check (procedencia in ('Equipo Pastoral', 'Oratorio', 'Confirma', 'Otros')),
  bloques text[] not null default array['Uso general'],
  ubicacion_guardado text not null check (char_length(trim(ubicacion_guardado)) > 0),
  check_out boolean not null default false,
  check_in boolean not null default false,
  registrado_por text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint materiales_retiro_check_in_requires_check_out check (not check_in or check_out)
);

-- Si se ejecutó una versión anterior del script, conserva el bloque anterior
-- dentro de la nueva lista y elimina la columna ya reemplazada.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'materiales_retiro' and column_name = 'bloque'
  ) then
    alter table public.materiales_retiro add column if not exists bloques text[];
    update public.materiales_retiro
    set bloques = array[bloque]
    where (bloques is null or cardinality(bloques) = 0) and bloque is not null;
    alter table public.materiales_retiro drop column bloque;
  end if;
end;
$$;

update public.materiales_retiro
set bloques = array['Uso general']
where bloques is null or cardinality(bloques) = 0;

alter table public.materiales_retiro
  alter column bloques set default array['Uso general'],
  alter column bloques set not null;

alter table public.materiales_retiro drop constraint if exists materiales_retiro_bloques_validos;
alter table public.materiales_retiro add constraint materiales_retiro_bloques_validos check (
  cardinality(bloques) > 0
  and bloques <@ array['Uso general', 'Bloque 1', 'Bloque 2', 'Bloque 3', 'Bloque 4', 'Bloque 5']
  and (not ('Uso general' = any(bloques)) or cardinality(bloques) = 1)
);

drop index if exists public.materiales_retiro_bloque_idx;
create index if not exists materiales_retiro_bloques_idx on public.materiales_retiro using gin (bloques);
create index if not exists materiales_retiro_procedencia_idx on public.materiales_retiro (procedencia);

create or replace function public.set_materiales_retiro_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists materiales_retiro_set_updated_at on public.materiales_retiro;
create trigger materiales_retiro_set_updated_at
before update on public.materiales_retiro
for each row execute function public.set_materiales_retiro_updated_at();
