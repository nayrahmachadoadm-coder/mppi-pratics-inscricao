-- Criação da tabela de votos populares
create table if not exists public.votos_populares (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  categoria text not null,
  inscricao_id uuid not null references public.inscricoes(id) on delete cascade,
  fingerprint text not null,
  email text null
);

-- Habilitar RLS
alter table public.votos_populares enable row level security;

-- Regra: permitir INSERT para usuários anônimos (voto público)
create policy if not exists "anon_can_insert_votos" 
on public.votos_populares
for insert
to anon
with check (true);

-- Regra: permitir SELECT apenas para usuários autenticados (admin)
create policy if not exists "authenticated_can_select_votos" 
on public.votos_populares
for select
to authenticated
using (true);

-- Unicidade: um voto por categoria por fingerprint (dispositivo)
create unique index if not exists votos_unq_categoria_fingerprint
on public.votos_populares (categoria, fingerprint);