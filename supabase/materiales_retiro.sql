-- Ejecuta este script una vez en Supabase > SQL Editor.
create table if not exists public.materiales_retiro (
  id uuid primary key default gen_random_uuid(),
  detalle text not null check (char_length(trim(detalle)) > 0),
  placa text,
  cantidad integer not null check (cantidad > 0),
  condicion text not null,
  procedencia text not null check (procedencia in ('Equipo Pastoral', 'Oratorio', 'Confirma', 'Otros')),
  bloque text not null check (bloque in ('Bloque 1', 'Bloque 2', 'Bloque 3', 'Bloque 4', 'Bloque 5')),
  ubicacion_guardado text not null check (char_length(trim(ubicacion_guardado)) > 0),
  check_out boolean not null default false,
  check_in boolean not null default false,
  registrado_por text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint materiales_retiro_check_in_requires_check_out check (not check_in or check_out)
);

create index if not exists materiales_retiro_bloque_idx on public.materiales_retiro (bloque);
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
