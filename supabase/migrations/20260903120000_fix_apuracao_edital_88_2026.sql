-- 1. Atualizar consolidar_finalistas
DROP FUNCTION IF EXISTS public.consolidar_finalistas(text);
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
            25.0 as divisor,
            (media_total / 25.0) * 100.0 as nota_tecnica_calculada
        FROM notas_cruas
    ),
    ranking_tecnico AS (
        SELECT 
            *,
            ROW_NUMBER() OVER (
                PARTITION BY categoria 
                ORDER BY 
                    nota_tecnica_calculada DESC,
                    media_cooperacao DESC,
                    media_resolutividade DESC,
                    media_impacto DESC,
                    media_replicabilidade DESC,
                    media_inovacao DESC
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


-- 2. Atualizar consolidar_finalistas_v2
DROP FUNCTION IF EXISTS public.consolidar_finalistas_v2(text, boolean, boolean);
CREATE OR REPLACE FUNCTION consolidar_finalistas_v2(
    p_justificativa TEXT DEFAULT NULL,
    p_ignorar_pendencias BOOLEAN DEFAULT false,
    p_dry_run BOOLEAN DEFAULT true
)
RETURNS SETOF public.finalista_preview
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
    v_uid UUID := auth.uid();
    v_pendencias INTEGER;
    v_total_jurados INTEGER;
    v_votos_existentes INTEGER;
    v_execucao_id UUID;
BEGIN
    DROP TABLE IF EXISTS temp_novos_finalistas;

    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_uid AND role::text = 'admin') THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem consolidar finalistas.';
    END IF;

    SELECT COUNT(*) INTO v_pendencias 
    FROM public.avaliacoes a 
    JOIN public.inscricoes i ON i.id = a.inscricao_id
    WHERE a.status != 'Finalizada' AND i.status_inscricao NOT IN ('Indeferida', 'Cancelada', 'Substituída')
    AND coalesce(i.edicao_ano, 2025) = 2026;

    IF v_pendencias > 0 AND NOT p_ignorar_pendencias THEN
        RAISE EXCEPTION 'Ainda existem % avaliações não finalizadas. Use p_ignorar_pendencias = true se quiser ignorá-las.', v_pendencias;
    END IF;

    SELECT COUNT(DISTINCT user_id) INTO v_total_jurados FROM public.user_roles WHERE role::text = 'jurado';

    SELECT COUNT(*) INTO v_votos_existentes FROM public.votos_populares WHERE valido = true;
    
    IF v_votos_existentes > 0 AND p_justificativa IS NULL AND NOT p_dry_run THEN
        RAISE EXCEPTION 'Já existem % votos registrados. A reconsolidação alterará os finalistas e invalidará os votos. Forneça uma justificativa expressa para anular os votos e prosseguir.', v_votos_existentes;
    END IF;

    CREATE TEMP TABLE temp_novos_finalistas ON COMMIT DROP AS
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
            AVG(a.replicabilidade::NUMERIC) as media_replicabilidade,
            AVG(a.total::NUMERIC) as media_total
        FROM public.avaliacoes a
        JOIN public.inscricoes i ON i.id = a.inscricao_id
        WHERE i.status_inscricao NOT IN ('Indeferida', 'Cancelada', 'Substituída')
        AND coalesce(i.edicao_ano, 2025) = 2026
        GROUP BY a.inscricao_id, i.area, i.tipo_iniciativa
    ),
    notas_normalizadas AS (
        SELECT 
            nc.*,
            25.0 as divisor,
            (nc.media_total / 25.0) * 100.0 as nota_tecnica_calculada
        FROM notas_cruas nc
    ),
    ranking_tecnico AS (
        SELECT 
            *,
            ROW_NUMBER() OVER (
                PARTITION BY categoria 
                ORDER BY 
                    nota_tecnica_calculada DESC,
                    media_cooperacao DESC,
                    media_resolutividade DESC,
                    media_impacto DESC,
                    media_replicabilidade DESC,
                    media_inovacao DESC
            ) as posicao_tecnica
        FROM notas_normalizadas
    )
    SELECT * FROM ranking_tecnico WHERE posicao_tecnica <= 3;

    IF p_dry_run THEN
        RETURN QUERY
        SELECT 
            COALESCE(n.inscricao_id, a.inscricao_id),
            COALESCE(n.categoria, a.categoria),
            ROUND(COALESCE(n.nota_tecnica_calculada, a.nota_tecnica_calculada), 2),
            COALESCE(n.posicao_tecnica, a.posicao_tecnica),
            COALESCE(n.julgadores_count, a.julgadores_count),
            CASE 
                WHEN a.inscricao_id IS NULL THEN 'NOVO'::TEXT
                WHEN n.inscricao_id IS NULL THEN 'REMOVIDO'::TEXT
                ELSE 'MANTIDO'::TEXT
            END as status_diff
        FROM temp_novos_finalistas n
        FULL OUTER JOIN public.finalistas_snapshot a ON a.inscricao_id = n.inscricao_id;
        RETURN;
    END IF;

    INSERT INTO public.finalistas_execucoes (executor, justificativa, ignorar_pendencias, julgadores_considerados)
    VALUES (v_uid, p_justificativa, p_ignorar_pendencias, v_total_jurados)
    RETURNING id INTO v_execucao_id;

    IF v_votos_existentes > 0 AND p_justificativa IS NOT NULL THEN
        UPDATE public.votos_populares 
        SET 
            valido = false, 
            motivo_invalidacao = p_justificativa,
            execucao_id = v_execucao_id
        WHERE valido = true;
    END IF;

    DELETE FROM public.finalistas_snapshot;
    
    INSERT INTO public.finalistas_snapshot (
        inscricao_id, categoria, nota_tecnica_calculada, posicao_tecnica,
        media_resolutividade, media_impacto, media_replicabilidade, media_inovacao, media_cooperacao,
        divisor, julgadores_count, execucao_id
    )
    SELECT 
        inscricao_id, categoria, nota_tecnica_calculada, posicao_tecnica,
        media_resolutividade, media_impacto, media_replicabilidade, media_inovacao, media_cooperacao,
        divisor, julgadores_count, v_execucao_id
    FROM temp_novos_finalistas;

    RETURN QUERY
    SELECT 
        inscricao_id, categoria, ROUND(nota_tecnica_calculada, 2), posicao_tecnica, julgadores_count, 'MANTIDO'::TEXT
    FROM temp_novos_finalistas;
END;
$$;


-- 3. Atualizar apurar_resultados_finais
DROP FUNCTION IF EXISTS public.apurar_resultados_finais(text);
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
            25.0 as divisor,
            (media_total / 25.0) * 100.0 as nota_tecnica_calculada
        FROM notas_cruas
    ),
    ranking_tecnico AS (
        SELECT 
            *,
            ROW_NUMBER() OVER (
                PARTITION BY categoria 
                ORDER BY 
                    nota_tecnica_calculada DESC,
                    media_cooperacao DESC,
                    media_resolutividade DESC,
                    media_impacto DESC,
                    media_replicabilidade DESC,
                    media_inovacao DESC
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
    ),
    apuracao AS (
        SELECT 
            rt.inscricao_id,
            rt.categoria,
            (rt.posicao_tecnica <= 3) as is_finalista,
            rt.nota_tecnica_calculada as nota_tecnica,
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
                    (rt.nota_tecnica_calculada * 0.80) + 
                    (
                        CASE WHEN mvc.max_votos > 0 THEN ((COALESCE(va.qtd_votos, 0)::NUMERIC / mvc.max_votos::NUMERIC) * 100.0)
                        ELSE 0.0 END
                    ) * 0.20
                ELSE NULL
            END as pontuacao_final,
            ROW_NUMBER() OVER (
                PARTITION BY rt.categoria 
                ORDER BY 
                    (rt.nota_tecnica_calculada * 0.80) + (CASE WHEN rt.posicao_tecnica <= 3 THEN (CASE WHEN mvc.max_votos > 0 THEN ((COALESCE(va.qtd_votos, 0)::NUMERIC / mvc.max_votos::NUMERIC) * 100.0) ELSE 0.0 END) ELSE 0 END) * 0.20 DESC,
                    rt.nota_tecnica_calculada DESC,
                    rt.media_cooperacao DESC,
                    rt.media_resolutividade DESC,
                    rt.media_impacto DESC,
                    rt.media_replicabilidade DESC,
                    rt.media_inovacao DESC
            ) as classificacao_final
        FROM ranking_tecnico rt
        LEFT JOIN votos_agrupados va ON va.inscricao_id = rt.inscricao_id
        LEFT JOIN max_votos_cat mvc ON mvc.categoria = rt.categoria
    )
    INSERT INTO public.apuracao_resultados (
        execucao_id, inscricao_id, categoria, is_finalista, nota_tecnica,
        votos_validos, maior_voto_categoria, nota_popular, pontuacao_final, classificacao_final
    )
    SELECT 
        v_execucao_id, inscricao_id, categoria, is_finalista, ROUND(nota_tecnica, 2),
        votos_validos, maior_voto_categoria, ROUND(nota_popular, 2), ROUND(pontuacao_final, 2),
        CASE WHEN is_finalista THEN classificacao_final ELSE NULL END
    FROM apuracao;

    RETURN v_execucao_id;
END;
$$;


-- 4. Atualizar apurar_resultados_finais_v2
DROP FUNCTION IF EXISTS public.apurar_resultados_finais_v2(text, boolean);
CREATE OR REPLACE FUNCTION apurar_resultados_finais_v2(
    p_justificativa TEXT DEFAULT NULL,
    p_dry_run BOOLEAN DEFAULT true
)
RETURNS SETOF public.apuracao_preview
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
    v_uid UUID := auth.uid();
    v_fim_votacao TIMESTAMP;
    v_execucao_id UUID;
BEGIN
    DROP TABLE IF EXISTS temp_apuracao_resultados;

    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_uid AND role::text = 'admin') THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem apurar resultados.';
    END IF;

    SELECT valor_data INTO v_fim_votacao FROM public.cronograma_parametros WHERE chave = 'fim_votacao';
    IF now() < v_fim_votacao AND NOT p_dry_run THEN
        RAISE EXCEPTION 'A votação ainda não foi encerrada. A apuração definitiva só pode ser gerada após o fim da votação.';
    END IF;

    CREATE TEMP TABLE temp_apuracao_resultados ON COMMIT DROP AS
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
            AVG(a.replicabilidade::NUMERIC) as media_replicabilidade,
            AVG(a.total::NUMERIC) as media_total
        FROM public.avaliacoes a
        JOIN public.inscricoes i ON i.id = a.inscricao_id
        WHERE i.status_inscricao NOT IN ('Indeferida', 'Cancelada', 'Substituída')
        AND coalesce(i.edicao_ano, 2025) = 2026
        GROUP BY a.inscricao_id, i.area, i.tipo_iniciativa
    ),
    notas_normalizadas AS (
        SELECT 
            nc.*,
            25.0 as divisor,
            (nc.media_total / 25.0) * 100.0 as nota_tecnica_calculada
        FROM notas_cruas nc
    ),
    ranking_tecnico AS (
        SELECT 
            *,
            ROW_NUMBER() OVER (
                PARTITION BY categoria 
                ORDER BY 
                    nota_tecnica_calculada DESC,
                    media_cooperacao DESC,
                    media_resolutividade DESC,
                    media_impacto DESC,
                    media_replicabilidade DESC,
                    media_inovacao DESC
            ) as posicao_tecnica
        FROM notas_normalizadas
    ),
    votos_agrupados AS (
        SELECT 
            vp.inscricao_id, 
            COUNT(*)::INTEGER as qtd_votos
        FROM public.votos_populares vp
        JOIN public.inscricoes ins ON ins.id = vp.inscricao_id
        WHERE vp.valido = true AND coalesce(ins.edicao_ano, 2025) = 2026
        GROUP BY vp.inscricao_id
    ),
    max_votos_cat AS (
        SELECT 
            rt.categoria,
            MAX(COALESCE(va.qtd_votos, 0))::INTEGER as max_votos
        FROM ranking_tecnico rt
        LEFT JOIN votos_agrupados va ON va.inscricao_id = rt.inscricao_id
        WHERE rt.posicao_tecnica <= 3
        GROUP BY rt.categoria
    ),
    apuracao_pre_calc AS (
        SELECT 
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
            rt.media_resolutividade,
            rt.media_impacto,
            rt.media_replicabilidade,
            rt.media_inovacao,
            rt.media_cooperacao
        FROM ranking_tecnico rt
        LEFT JOIN votos_agrupados va ON va.inscricao_id = rt.inscricao_id
        LEFT JOIN max_votos_cat mvc ON mvc.categoria = rt.categoria
    ),
    apuracao_ordered AS (
        SELECT *,
            ROW_NUMBER() OVER (
                PARTITION BY categoria 
                ORDER BY 
                    pontuacao_final DESC,
                    nota_tecnica DESC,
                    media_cooperacao DESC,
                    media_resolutividade DESC,
                    media_impacto DESC,
                    media_replicabilidade DESC,
                    media_inovacao DESC
            ) as classificacao_final
        FROM apuracao_pre_calc
        WHERE is_finalista = true
    ),
    apuracao_com_lag AS (
        SELECT *,
            LAG(pontuacao_final) OVER (PARTITION BY categoria ORDER BY classificacao_final) as lag_pf,
            LAG(nota_tecnica) OVER (PARTITION BY categoria ORDER BY classificacao_final) as lag_nt,
            LAG(media_cooperacao) OVER (PARTITION BY categoria ORDER BY classificacao_final) as lag_coop,
            LAG(media_resolutividade) OVER (PARTITION BY categoria ORDER BY classificacao_final) as lag_res,
            LAG(media_impacto) OVER (PARTITION BY categoria ORDER BY classificacao_final) as lag_imp,
            LAG(media_replicabilidade) OVER (PARTITION BY categoria ORDER BY classificacao_final) as lag_rep,
            LAG(media_inovacao) OVER (PARTITION BY categoria ORDER BY classificacao_final) as lag_ino
        FROM apuracao_ordered
    )
    SELECT 
        apc.inscricao_id,
        apc.categoria,
        apc.is_finalista,
        apc.nota_tecnica,
        apc.votos_validos,
        apc.maior_voto_categoria,
        ROUND(apc.nota_popular, 2) as nota_popular,
        apc.pontuacao_final,
        apc.classificacao_final,
        CASE
            WHEN apc.is_finalista THEN
                CASE
                    WHEN lag_pf IS NULL OR pontuacao_final != lag_pf THEN 'Sem empate'
                    WHEN nota_tecnica != lag_nt THEN '8.9, I (Nota Técnica)'
                    WHEN media_cooperacao != lag_coop THEN '8.9, II (Cooperação)'
                    WHEN media_resolutividade != lag_res THEN '8.9, III (Resolutividade)'
                    WHEN media_impacto != lag_imp THEN '8.9, IV (Impacto Social)'
                    WHEN media_replicabilidade != lag_rep THEN '8.9, V (Replicabilidade)'
                    WHEN media_inovacao != lag_ino THEN '8.9, VI (Inovação)'
                    ELSE '8.9, VII (Decisão Comissão)'
                END
            ELSE NULL
        END::TEXT as criterio_desempate
    FROM apuracao_com_lag apc
    
    UNION ALL
    
    SELECT 
        apc.inscricao_id,
        apc.categoria,
        apc.is_finalista,
        apc.nota_tecnica,
        apc.votos_validos,
        apc.maior_voto_categoria,
        ROUND(apc.nota_popular, 2) as nota_popular,
        apc.pontuacao_final,
        NULL as classificacao_final,
        NULL as criterio_desempate
    FROM apuracao_pre_calc apc
    WHERE NOT apc.is_finalista;

    IF p_dry_run THEN
        RETURN QUERY SELECT * FROM temp_apuracao_resultados;
        RETURN;
    END IF;

    INSERT INTO public.apuracao_execucoes (executor, hash_insumos, justificativa) 
    VALUES (v_uid, 'hash_placeholder', p_justificativa)
    RETURNING id INTO v_execucao_id;

    INSERT INTO public.apuracao_resultados (
        execucao_id, inscricao_id, categoria, is_finalista, nota_tecnica,
        votos_validos, maior_voto_categoria, nota_popular, pontuacao_final, classificacao_final, criterio_desempate
    )
    SELECT 
        v_execucao_id, inscricao_id, categoria, is_finalista, nota_tecnica,
        votos_validos, maior_voto_categoria, nota_popular, pontuacao_final, classificacao_final, criterio_desempate
    FROM temp_apuracao_resultados;

    RETURN QUERY SELECT * FROM temp_apuracao_resultados;
END;
$$;
