-- RPC para listar inscrições por categoria com paginação
-- Usa SECURITY DEFINER para leitura agregada contornando RLS nas linhas

-- Extensão para remover acentos em comparações (se disponível)
create extension if not exists unaccent;

create or replace function public.rpc_inscricoes_list_by_area(
  area_key text,
  offset int default 0,
  limit_rows int default 10
)
returns setof public.inscricoes
language sql
security definer
set search_path = public
as $$
  with normalized as (
    select *,
           case
             when pg_catalog.current_setting('server_version_num')::int >= 90600 then unaccent(lower(coalesce(area_atuacao, '')))
             else lower(coalesce(area_atuacao, ''))
           end as area_norm
    from public.inscricoes
  )
  select *
  from normalized
  where (
    case area_key
      when 'finalistica-projeto' then area_norm like '%projeto%' and area_norm like '%finalist%'
      when 'estruturante-projeto' then area_norm like '%projeto%' and area_norm like '%estruturante%'
      when 'finalistica-pratica' then area_norm like '%pratica%' and area_norm like '%finalist%'
      when 'estruturante-pratica' then area_norm like '%pratica%' and area_norm like '%estruturante%'
      when 'categoria-especial-ia' then (area_norm like '%categoria%' and area_norm like '%especial%') or area_norm like '%inteligencia%' or area_norm like '% ia %' or area_norm like '%(ia%)%'
      else false
    end
  )
  order by created_at desc
  offset offset
  limit limit_rows;
$$;

grant execute on function public.rpc_inscricoes_list_by_area(text, int, int) to anon;
grant execute on function public.rpc_inscricoes_list_by_area(text, int, int) to authenticated;