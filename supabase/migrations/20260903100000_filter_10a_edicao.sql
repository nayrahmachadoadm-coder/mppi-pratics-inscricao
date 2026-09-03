-- Filtros para a 10ª Edição (2026)
-- Adiciona a cláusula WHERE edicao_ano = 2026 nas consultas RPC para evitar exibir dados de 2025.

-- 1. rpc_inscricoes_list_by_area
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
  where coalesce(i.edicao_ano, 2025) = 2026 and (
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

-- 2. rpc_inscricoes_por_area
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
  where coalesce(edicao_ano, 2025) = 2026
  group by 1
  order by 1;
$$;

-- 3. consolidar_finalistas (Ajuste apenas no WITH notas_cruas)
CREATE OR REPLACE FUNCTION consolidar_finalistas(p_publicado_por TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public.finalistas_snapshot;

    WITH notas_cruas AS (
        SELECT 
            a.inscricao_id,
            i.area as categoria,
            i.tipo_iniciativa,
            COUNT(a.id)::INTEGER as julgadores_count,
            AVG(a.cooperacao::NUMERIC) as media_cooperacao,
            AVG(a.inovacao::NUMERIC) as media_inovacao,
            AVG(a.resolutividade::NUMERIC) as media_resolutividade,
            AVG(a.impacto_social::NUMERIC) as media_impacto,
            AVG(COALESCE(a.alinhamento_ods, 0)::NUMERIC) as media_ods,
            AVG(a.replicabilidade::NUMERIC) as media_replicabilidade,
            AVG(a.total::NUMERIC) as media_total
        FROM public.avaliacoes a
        JOIN public.inscricoes i ON i.id = a.inscricao_id
        WHERE coalesce(i.edicao_ano, 2025) = 2026
        GROUP BY a.inscricao_id, i.area, i.tipo_iniciativa
    ),
    notas_normalizadas AS (
        SELECT 
            *,
            CASE WHEN tipo_iniciativa = 'pratica' THEN 25 ELSE 30 END as divisor,
            CASE WHEN tipo_iniciativa = 'pratica' THEN (media_total / 25.0) * 100.0 ELSE (media_total / 30.0) * 100.0 END as nota_tecnica_calculada
        FROM notas_cruas
    ),
    ranking_tecnico AS (
        SELECT 
            *,
            ROW_NUMBER() OVER (
                PARTITION BY categoria 
                ORDER BY 
                    nota_tecnica_calculada DESC,
                    media_resolutividade DESC,
                    media_impacto DESC,
                    media_replicabilidade DESC,
                    media_inovacao DESC,
                    media_cooperacao DESC
            ) as posicao_tecnica
        FROM notas_normalizadas
    )
    INSERT INTO public.finalistas_snapshot (
        inscricao_id, categoria, nota_tecnica_calculada, posicao_tecnica,
        media_resolutividade, media_impacto, media_replicabilidade, media_inovacao, media_cooperacao,
        divisor, julgadores_count, publicado_por
    )
    SELECT 
        inscricao_id, categoria, ROUND(nota_tecnica_calculada, 2), posicao_tecnica,
        media_resolutividade, media_impacto, media_replicabilidade, media_inovacao, media_cooperacao,
        divisor, julgadores_count, p_publicado_por
    FROM ranking_tecnico
    WHERE posicao_tecnica <= 3;

    RETURN true;
END;
$$;


-- 4. apurar_resultados_finais (Ajuste apenas no WITH notas_cruas)
CREATE OR REPLACE FUNCTION apurar_resultados_finais(p_executor TEXT)
RETURNS UUID
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    v_execucao_id UUID;
BEGIN
    INSERT INTO public.apuracao_execucoes (executor, hash_insumos) 
    VALUES (p_executor, 'hash_placeholder')
    RETURNING id INTO v_execucao_id;

    WITH notas_cruas AS (
        SELECT 
            a.inscricao_id,
            i.area as categoria,
            i.tipo_iniciativa,
            COUNT(a.id)::INTEGER as julgadores_count,
            AVG(a.cooperacao::NUMERIC) as media_cooperacao,
            AVG(a.inovacao::NUMERIC) as media_inovacao,
            AVG(a.resolutividade::NUMERIC) as media_resolutividade,
            AVG(a.impacto_social::NUMERIC) as media_impacto,
            AVG(COALESCE(a.alinhamento_ods, 0)::NUMERIC) as media_ods,
            AVG(a.replicabilidade::NUMERIC) as media_replicabilidade,
            AVG(a.total::NUMERIC) as media_total
        FROM public.avaliacoes a
        JOIN public.inscricoes i ON i.id = a.inscricao_id
        WHERE coalesce(i.edicao_ano, 2025) = 2026
        GROUP BY a.inscricao_id, i.area, i.tipo_iniciativa
    ),
    notas_normalizadas AS (
        SELECT 
            *,
            CASE WHEN tipo_iniciativa = 'pratica' THEN 25 ELSE 30 END as divisor,
            CASE WHEN tipo_iniciativa = 'pratica' THEN (media_total / 25.0) * 100.0 ELSE (media_total / 30.0) * 100.0 END as nota_tecnica_calculada
        FROM notas_cruas
    ),
    ranking_tecnico AS (
        SELECT 
            *,
            ROW_NUMBER() OVER (
                PARTITION BY categoria 
                ORDER BY 
                    nota_tecnica_calculada DESC,
                    media_resolutividade DESC,
                    media_impacto DESC,
                    media_replicabilidade DESC,
                    media_inovacao DESC,
                    media_cooperacao DESC
            ) as posicao_tecnica
        FROM notas_normalizadas
    ),
    votos_agrupados AS (
        SELECT 
            inscricao_id, 
            COUNT(*)::INTEGER as qtd_votos
        FROM public.votos_populares
        WHERE valido = true
        GROUP BY inscricao_id
    ),
    max_votos_cat AS (
        SELECT 
            rt.categoria,
            MAX(COALESCE(va.qtd_votos, 0))::INTEGER as max_votos
        FROM ranking_tecnico rt
        LEFT JOIN votos_agrupados va ON va.inscricao_id = rt.inscricao_id
        WHERE rt.posicao_tecnica <= 3
        GROUP BY rt.categoria
    )

    INSERT INTO public.apuracao_resultados (
        execucao_id, inscricao_id, categoria, is_finalista, nota_tecnica, 
        votos_validos, maior_voto_categoria, nota_popular, pontuacao_final, classificacao_final
    )
    SELECT 
        v_execucao_id,
        rt.inscricao_id,
        rt.categoria,
        (rt.posicao_tecnica <= 3) as is_finalista,
        ROUND(rt.nota_tecnica_calculada, 2) as nota_tecnica,
        COALESCE(va.qtd_votos, 0) as votos_validos,
        COALESCE(mvc.max_votos, 0) as maior_voto_categoria,
        
        CASE 
            WHEN rt.posicao_tecnica <= 3 THEN
                CASE WHEN mvc.max_votos > 0 THEN ((COALESCE(va.qtd_votos, 0)::NUMERIC / mvc.max_votos::NUMERIC) * 100.0)
                ELSE 0.0 END
            ELSE NULL
        END as nota_popular,
        
        CASE 
            WHEN rt.posicao_tecnica <= 3 THEN
                ROUND(
                    (rt.nota_tecnica_calculada * 0.80) + 
                    (
                        CASE WHEN mvc.max_votos > 0 THEN ((COALESCE(va.qtd_votos, 0)::NUMERIC / mvc.max_votos::NUMERIC) * 100.0)
                        ELSE 0.0 END
                    ) * 0.20
                , 2)
            ELSE NULL
        END as pontuacao_final,
        
        CASE 
            WHEN rt.posicao_tecnica <= 3 THEN
                ROW_NUMBER() OVER (
                    PARTITION BY rt.categoria 
                    ORDER BY 
                        (rt.nota_tecnica_calculada * 0.80) + (CASE WHEN COALESCE(mvc.max_votos, 0) > 0 THEN ((COALESCE(va.qtd_votos, 0)::NUMERIC / mvc.max_votos::NUMERIC) * 100.0) ELSE 0.0 END) * 0.20 DESC,
                        rt.nota_tecnica_calculada DESC,
                        rt.media_resolutividade DESC,
                        rt.media_impacto DESC,
                        rt.media_replicabilidade DESC,
                        rt.media_inovacao DESC,
                        rt.media_cooperacao DESC
                )
            ELSE NULL
        END as classificacao_final
    FROM ranking_tecnico rt
    LEFT JOIN votos_agrupados va ON va.inscricao_id = rt.inscricao_id
    LEFT JOIN max_votos_cat mvc ON mvc.categoria = rt.categoria;

    RETURN v_execucao_id;
END;
$$;
