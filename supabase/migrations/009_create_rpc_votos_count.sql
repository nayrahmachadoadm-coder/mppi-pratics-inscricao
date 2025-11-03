-- Função RPC pública para contagem de votos por categoria
-- Retorna apenas agregados (inscricao_id, votos), sem expor dados sensíveis
create or replace function public.votos_count(categoria text)
returns table (inscricao_id uuid, votos integer)
language sql
security definer
set search_path = public
as $$
  select vp.inscricao_id, count(*)::int as votos
  from public.votos_populares vp
  where vp.categoria = categoria
  group by vp.inscricao_id
  order by votos desc;
$$;

-- Permitir execução para usuários anônimos e autenticados
grant execute on function public.votos_count(text) to anon;
grant execute on function public.votos_count(text) to authenticated;