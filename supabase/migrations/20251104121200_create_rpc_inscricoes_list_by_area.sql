-- RPC para listar inscrições por categoria com paginação
-- Usa SECURITY DEFINER para leitura agregada contornando RLS nas linhas

-- Extensão para remover acentos em comparações (se disponível)
create extension if not exists unaccent;

create or replace function public.rpc_inscricoes_list_by_area(
  area_key text,
  p_offset int default 0,
  p_limit_rows int default 10
)
returns setof public.inscricoes
language sql
security definer
set search_path = public
as $$
  select i.*
  from public.inscricoes i
  where (
    case area_key
      when 'finalistica-projeto' then unaccent(lower(coalesce(i.area_atuacao, ''))) like '%projeto%' and unaccent(lower(coalesce(i.area_atuacao, ''))) like '%finalist%'
      when 'estruturante-projeto' then unaccent(lower(coalesce(i.area_atuacao, ''))) like '%projeto%' and unaccent(lower(coalesce(i.area_atuacao, ''))) like '%estruturante%'
      when 'finalistica-pratica' then unaccent(lower(coalesce(i.area_atuacao, ''))) like '%pratica%' and unaccent(lower(coalesce(i.area_atuacao, ''))) like '%finalist%'
      when 'estruturante-pratica' then unaccent(lower(coalesce(i.area_atuacao, ''))) like '%pratica%' and unaccent(lower(coalesce(i.area_atuacao, ''))) like '%estruturante%'
      when 'categoria-especial-ia' then (unaccent(lower(coalesce(i.area_atuacao, ''))) like '%categoria%' and unaccent(lower(coalesce(i.area_atuacao, ''))) like '%especial%') or unaccent(lower(coalesce(i.area_atuacao, ''))) like '%inteligencia%' or unaccent(lower(coalesce(i.area_atuacao, ''))) like '% ia %' or unaccent(lower(coalesce(i.area_atuacao, ''))) like '%(ia%)%'
      else false
    end
  )
  order by i.created_at desc
  offset p_offset
  limit p_limit_rows;
$$;

grant execute on function public.rpc_inscricoes_list_by_area(text, int, int) to anon;
grant execute on function public.rpc_inscricoes_list_by_area(text, int, int) to authenticated;