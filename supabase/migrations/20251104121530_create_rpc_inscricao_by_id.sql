-- RPC para obter uma inscrição por ID contornando RLS
-- Usa SECURITY DEFINER para permitir leitura pública controlada

create or replace function public.rpc_inscricao_by_id(_id uuid)
returns setof public.inscricoes
language sql
security definer
set search_path = public
as $$
  select i.*
  from public.inscricoes i
  where i.id = _id
  order by i.created_at desc
  limit 1;
$$;

grant execute on function public.rpc_inscricao_by_id(uuid) to anon;
grant execute on function public.rpc_inscricao_by_id(uuid) to authenticated;