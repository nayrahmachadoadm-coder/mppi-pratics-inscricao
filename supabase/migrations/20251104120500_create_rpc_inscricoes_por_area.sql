-- Cria função RPC (SECURITY DEFINER) para contagem de inscrições por área
-- Permite leitura dos agregados sem expor linhas individuais e contorna RLS para esta operação

create or replace function public.rpc_inscricoes_por_area()
returns table(area text, count bigint)
language sql
security definer
set search_path = public
as $$
  select
    coalesce(trim(area_atuacao), '')::text as area,
    count(*)::bigint as count
  from public.inscricoes
  group by 1
  order by 1;
$$;

-- Concede permissão de execução para clientes anônimos e autenticados
grant execute on function public.rpc_inscricoes_por_area() to anon;
grant execute on function public.rpc_inscricoes_por_area() to authenticated;