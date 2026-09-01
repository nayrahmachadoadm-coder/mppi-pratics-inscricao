-- Migration para Telas de Apuração, Divisores Parametrizados e Travas de Execução

-- 1. Remoção das funções antigas (Segurança)
DROP FUNCTION IF EXISTS public.consolidar_finalistas(text);
DROP FUNCTION IF EXISTS public.apurar_resultados_finais(text);

-- 2. Parametrização do Divisor
CREATE TABLE IF NOT EXISTS public.categoria_parametros (
    tipo_iniciativa TEXT PRIMARY KEY,
    divisor NUMERIC(5,2) NOT NULL
);

INSERT INTO public.categoria_parametros (tipo_iniciativa, divisor) VALUES
('pratica', 25.0),
('projeto', 30.0)
ON CONFLICT (tipo_iniciativa) DO UPDATE SET divisor = EXCLUDED.divisor;

ALTER TABLE public.categoria_parametros ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura publica categoria_parametros" ON public.categoria_parametros;
CREATE POLICY "Leitura publica categoria_parametros" ON public.categoria_parametros FOR SELECT USING (true);


-- 3. Tabela de Execuções de Consolidar Finalistas
CREATE TABLE IF NOT EXISTS public.finalistas_execucoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    executor UUID NOT NULL,
    justificativa TEXT,
    ignorar_pendencias BOOLEAN DEFAULT false,
    julgadores_considerados INTEGER NOT NULL,
    data_execucao TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.finalistas_execucoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso restrito finalistas_execucoes" ON public.finalistas_execucoes;
CREATE POLICY "Acesso restrito finalistas_execucoes" ON public.finalistas_execucoes FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'admin')
);

-- Tabela para guardar os critérios de desempate
ALTER TABLE public.apuracao_resultados
ADD COLUMN IF NOT EXISTS criterio_desempate TEXT;

-- Atualizar votos_populares para rastreabilidade de anulação
ALTER TABLE public.votos_populares
ADD COLUMN IF NOT EXISTS motivo_invalidacao TEXT,
ADD COLUMN IF NOT EXISTS execucao_id UUID;


-- 4. Função Wrapper Consolidar Finalistas (COM DRY RUN E POOLING FIX)
DROP TYPE IF EXISTS public.finalista_preview CASCADE;
CREATE TYPE public.finalista_preview AS (
    inscricao_id UUID,
    categoria TEXT,
    nota_tecnica_calculada NUMERIC(5,2),
    posicao_tecnica INTEGER,
    julgadores_count INTEGER,
    status_diff TEXT -- 'NOVO', 'MANTIDO', 'REMOVIDO'
);

CREATE OR REPLACE FUNCTION consolidar_finalistas_v2(
    p_ignorar_pendencias BOOLEAN DEFAULT false,
    p_justificativa TEXT DEFAULT NULL,
    p_dry_run BOOLEAN DEFAULT true
)
RETURNS SETOF public.finalista_preview
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
    v_uid UUID := auth.uid();
    v_total_jurados INTEGER;
    v_aval_count RECORD;
    v_votos_existentes INTEGER;
    v_execucao_id UUID;
BEGIN
    -- Limpeza defensiva de pooling
    DROP TABLE IF EXISTS temp_novos_finalistas;

    -- Validação de Permissão
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_uid AND role::text = 'admin') THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem consolidar finalistas.';
    END IF;

    SELECT COUNT(DISTINCT user_id) INTO v_total_jurados FROM public.user_roles WHERE role::text = 'jurado';

    IF NOT p_ignorar_pendencias THEN
        FOR v_aval_count IN (
            SELECT i.id, COUNT(a.id) as qtd
            FROM public.inscricoes i
            LEFT JOIN public.avaliacoes a ON a.inscricao_id = i.id
            WHERE i.status_inscricao NOT IN ('Indeferida', 'Cancelada', 'Em Análise') 
            GROUP BY i.id
            HAVING COUNT(a.id) < v_total_jurados
        ) LOOP
            RAISE EXCEPTION 'Existem avaliações pendentes (Inscrição % possui %/% avaliações). Use ignorar_pendencias=true e forneça justificativa para forçar.', v_aval_count.id, v_aval_count.qtd, v_total_jurados;
        END LOOP;
    END IF;

    SELECT COUNT(*) INTO v_votos_existentes FROM public.votos_populares WHERE valido = true;
    
    IF v_votos_existentes > 0 AND p_justificativa IS NULL AND NOT p_dry_run THEN
        RAISE EXCEPTION 'Já existem % votos registrados. A reconsolidação alterará os finalistas e invalidará os votos. Forneça uma justificativa expressa para anular os votos e prosseguir.', v_votos_existentes;
    END IF;

    -- CREATE TEMP TABLE ON COMMIT DROP
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
            AVG(COALESCE(a.alinhamento_ods, 0)::NUMERIC) as media_ods,
            AVG(a.replicabilidade::NUMERIC) as media_replicabilidade,
            AVG(a.total::NUMERIC) as media_total
        FROM public.avaliacoes a
        JOIN public.inscricoes i ON i.id = a.inscricao_id
        GROUP BY a.inscricao_id, i.area, i.tipo_iniciativa
    ),
    notas_normalizadas AS (
        SELECT 
            nc.*,
            cp.divisor,
            (nc.media_total / cp.divisor) * 100.0 as nota_tecnica_calculada
        FROM notas_cruas nc
        JOIN public.categoria_parametros cp ON cp.tipo_iniciativa = nc.tipo_iniciativa
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

    -- Gravar execução ANTES de anular votos para ter o ID
    INSERT INTO public.finalistas_execucoes (executor, justificativa, ignorar_pendencias, julgadores_considerados)
    VALUES (v_uid, p_justificativa, p_ignorar_pendencias, v_total_jurados)
    RETURNING id INTO v_execucao_id;

    -- Anular votos se houver justificativa
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
        divisor, julgadores_count, publicado_por
    )
    SELECT 
        inscricao_id, categoria, ROUND(nota_tecnica_calculada, 2), posicao_tecnica,
        media_resolutividade, media_impacto, media_replicabilidade, media_inovacao, media_cooperacao,
        divisor::INTEGER, julgadores_count, v_uid::TEXT
    FROM temp_novos_finalistas;

    RETURN QUERY
    SELECT 
        inscricao_id, categoria, ROUND(nota_tecnica_calculada, 2), posicao_tecnica, julgadores_count, 'MANTIDO'::TEXT
    FROM temp_novos_finalistas;
END;
$$;


-- 5. Função Wrapper Apuração Final (COM DRY RUN, POOLING FIX E LAG DE DESEMPATE)
DROP TYPE IF EXISTS public.apuracao_preview CASCADE;
CREATE TYPE public.apuracao_preview AS (
    inscricao_id UUID,
    categoria TEXT,
    is_finalista BOOLEAN,
    nota_tecnica NUMERIC(5,2),
    votos_validos INTEGER,
    maior_voto_categoria INTEGER,
    nota_popular NUMERIC(5,2),
    pontuacao_final NUMERIC(5,2),
    classificacao_final INTEGER,
    criterio_desempate TEXT,
    status_diff TEXT
);

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

    -- Validação de Permissão
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_uid AND role::text = 'admin') THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem apurar resultados.';
    END IF;

    -- Validação Cronograma intransponível para persistência
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
            AVG(COALESCE(a.alinhamento_ods, 0)::NUMERIC) as media_ods,
            AVG(a.replicabilidade::NUMERIC) as media_replicabilidade,
            AVG(a.total::NUMERIC) as media_total
        FROM public.avaliacoes a
        JOIN public.inscricoes i ON i.id = a.inscricao_id
        GROUP BY a.inscricao_id, i.area, i.tipo_iniciativa
    ),
    notas_normalizadas AS (
        SELECT 
            nc.*,
            cp.divisor,
            (nc.media_total / cp.divisor) * 100.0 as nota_tecnica_calculada
        FROM notas_cruas nc
        JOIN public.categoria_parametros cp ON cp.tipo_iniciativa = nc.tipo_iniciativa
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
    -- Identificando a ordem exata para usar LAG
    apuracao_ordered AS (
        SELECT *,
            ROW_NUMBER() OVER (
                PARTITION BY categoria 
                ORDER BY 
                    pontuacao_final DESC,
                    nota_tecnica DESC,
                    media_resolutividade DESC,
                    media_impacto DESC,
                    media_replicabilidade DESC,
                    media_inovacao DESC,
                    media_cooperacao DESC
            ) as classificacao_final
        FROM apuracao_pre_calc
        WHERE is_finalista = true
    ),
    apuracao_com_lag AS (
        SELECT *,
            LAG(pontuacao_final) OVER (PARTITION BY categoria ORDER BY classificacao_final) as lag_pf,
            LAG(nota_tecnica) OVER (PARTITION BY categoria ORDER BY classificacao_final) as lag_nt,
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
        -- LOGICA DE DESEMPATE ITEM 8.9 (Compara com o row acima)
        CASE
            WHEN apc.is_finalista THEN
                CASE
                    WHEN lag_pf IS NULL OR pontuacao_final != lag_pf THEN 'Sem empate'
                    WHEN nota_tecnica != lag_nt THEN '8.9, I (Nota Técnica)'
                    WHEN media_resolutividade != lag_res THEN '8.9, II (Resolutividade)'
                    WHEN media_impacto != lag_imp THEN '8.9, III (Impacto)'
                    WHEN media_replicabilidade != lag_rep THEN '8.9, IV (Replicabilidade)'
                    WHEN media_inovacao != lag_ino THEN '8.9, V (Inovação)'
                    ELSE '8.9, VI (Decisão Comissão)'
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
    WHERE apc.is_finalista = false;

    IF p_dry_run THEN
        RETURN QUERY
        SELECT 
            COALESCE(n.inscricao_id, a.inscricao_id),
            COALESCE(n.categoria, a.categoria),
            COALESCE(n.is_finalista, a.is_finalista),
            COALESCE(n.nota_tecnica, a.nota_tecnica),
            COALESCE(n.votos_validos, a.votos_validos),
            COALESCE(n.maior_voto_categoria, a.maior_voto_categoria),
            COALESCE(n.nota_popular, a.nota_popular),
            COALESCE(n.pontuacao_final, a.pontuacao_final),
            COALESCE(n.classificacao_final, a.classificacao_final),
            COALESCE(n.criterio_desempate, a.criterio_desempate),
            CASE 
                WHEN a.inscricao_id IS NULL THEN 'NOVO'::TEXT
                WHEN n.inscricao_id IS NULL THEN 'REMOVIDO'::TEXT
                WHEN COALESCE(n.classificacao_final, 0) != COALESCE(a.classificacao_final, 0) THEN 'POSICAO_ALTERADA'::TEXT
                ELSE 'MANTIDO'::TEXT
            END as status_diff
        FROM temp_apuracao_resultados n
        FULL OUTER JOIN (
            SELECT * FROM public.apuracao_resultados WHERE execucao_id = (SELECT id FROM public.apuracao_execucoes ORDER BY data_execucao DESC LIMIT 1)
        ) a ON a.inscricao_id = n.inscricao_id;
        
        RETURN;
    END IF;

    -- NÃO É DRY RUN
    INSERT INTO public.apuracao_execucoes (executor, hash_insumos) 
    VALUES (v_uid::TEXT, COALESCE(p_justificativa, 'Apuração Final Oficial'))
    RETURNING id INTO v_execucao_id;

    INSERT INTO public.apuracao_resultados (
        execucao_id, inscricao_id, categoria, is_finalista, nota_tecnica, 
        votos_validos, maior_voto_categoria, nota_popular, pontuacao_final, classificacao_final, criterio_desempate
    )
    SELECT 
        v_execucao_id, inscricao_id, categoria, is_finalista, nota_tecnica, 
        votos_validos, maior_voto_categoria, nota_popular, pontuacao_final, classificacao_final, criterio_desempate
    FROM temp_apuracao_resultados;

    RETURN QUERY
    SELECT 
        inscricao_id, categoria, is_finalista, nota_tecnica, votos_validos, maior_voto_categoria, 
        nota_popular, pontuacao_final, classificacao_final, criterio_desempate, 'MANTIDO'::TEXT
    FROM temp_apuracao_resultados;

END;
$$;
