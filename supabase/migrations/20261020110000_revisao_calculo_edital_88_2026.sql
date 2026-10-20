-- ==============================================================================
-- Migração: 20261020110000_revisao_calculo_edital_88_2026.sql
-- Objetivo: Alinhar completamente o cálculo e armazenamento de notas dos jurados
--           ao Edital nº 88/2026 (Item 8.1 a 8.9 e Item 4.1 a 4.3).
--
-- Regras implementadas:
-- 1. Avaliação Técnica (Item 8.2 e 8.2.3): Média aritmética das notas válidas.
--    Ausência de nota por qualquer motivo não conta como zero nem integra o divisor.
-- 2. Nota Técnica (Item 8.3): (Média das notas válidas / 25) * 100.
-- 3. Nota Popular (Item 8.4 e 8.5): Proporcional por categoria (100 para o mais votado).
-- 4. Pontuação Final (Item 8.6 e 8.8): (Nota Técnica * 0,80) + (Nota Popular * 0,20)
--    com até 2 casas decimais.
-- 5. Critérios Sucessivos de Desempate (Item 8.9):
--    I   — Maior Nota Técnica atribuída pela Comissão Julgadora;
--    II  — Maior nota no critério cooperação;
--    III — Maior nota no critério resolutividade;
--    IV  — Maior nota no critério impacto social ou institucional;
--    V   — Maior nota no critério replicabilidade;
--    VI  — Maior nota no critério inovação; e
--    VII — Persistindo o empate, decisão fundamentada da Comissão Julgadora.
-- ==============================================================================

-- 1. Atualizar RPC voto_popular_top3_por_categoria para usar média aritmética e desempate 8.9
DROP FUNCTION IF EXISTS public.voto_popular_top3_por_categoria(text);
CREATE OR REPLACE FUNCTION public.voto_popular_top3_por_categoria(area_key text)
RETURNS TABLE (
  categoria text,
  inscricao_id uuid,
  titulo_iniciativa text,
  nome_completo text,
  lotacao text,
  descricao_iniciativa text,
  problema_necessidade text,
  metodologia text,
  principais_resultados text,
  publico_alvo text,
  objetivos text,
  cooperacao text,
  inovacao text,
  resolutividade text,
  impacto_social text,
  alinhamento_ods text,
  replicabilidade text,
  data_inicio text,
  cargo_funcao text,
  area_atuacao text,
  avaliacoes_count bigint,
  total_geral numeric,
  total_resolutividade numeric,
  total_replicabilidade numeric,
  posicao bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Verificação de autorização
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role::text IN ('admin', 'jurado')
    ) THEN
      RAISE EXCEPTION 'Acesso negado: Apenas administradores e jurados podem visualizar finalistas.';
    END IF;

    RETURN QUERY
    WITH notas_cruas AS (
      SELECT
        COALESCE(i.area_atuacao, i.area) AS categoria,
        i.id AS inscricao_id,
        i.titulo_iniciativa,
        i.nome_completo,
        i.lotacao,
        i.descricao_iniciativa,
        i.problema_necessidade,
        i.metodologia,
        i.principais_resultados,
        i.publico_alvo,
        i.objetivos,
        i.cooperacao,
        i.inovacao,
        i.resolutividade,
        i.impacto_social,
        i.alinhamento_ods,
        i.replicabilidade,
        i.data_inicio,
        i.cargo_funcao,
        i.area_atuacao,
        COUNT(a.id) AS avaliacoes_count,
        COALESCE(SUM(a.total), 0) AS total_geral,
        COALESCE(SUM(a.resolutividade), 0) AS total_resolutividade,
        COALESCE(SUM(a.replicabilidade), 0) AS total_replicabilidade,
        COALESCE(AVG(a.total::NUMERIC), 0) AS media_total,
        COALESCE(AVG(a.cooperacao::NUMERIC), 0) AS media_cooperacao,
        COALESCE(AVG(a.resolutividade::NUMERIC), 0) AS media_resolutividade,
        COALESCE(AVG(a.impacto_social::NUMERIC), 0) AS media_impacto,
        COALESCE(AVG(a.replicabilidade::NUMERIC), 0) AS media_replicabilidade,
        COALESCE(AVG(a.inovacao::NUMERIC), 0) AS media_inovacao
      FROM public.inscricoes i
      LEFT JOIN public.avaliacoes a ON a.inscricao_id = i.id
      WHERE COALESCE(i.area_atuacao, i.area) = area_key
        AND i.status_inscricao NOT IN ('Indeferida', 'Cancelada', 'Substituída')
        AND COALESCE(i.edicao_ano, 2025) = 2026
      GROUP BY i.id
    ),
    ranking AS (
      SELECT
        nc.categoria,
        nc.inscricao_id,
        nc.titulo_iniciativa,
        nc.nome_completo,
        nc.lotacao,
        nc.descricao_iniciativa,
        nc.problema_necessidade,
        nc.metodologia,
        nc.principais_resultados,
        nc.publico_alvo,
        nc.objetivos,
        nc.cooperacao,
        nc.inovacao,
        nc.resolutividade,
        nc.impacto_social,
        nc.alinhamento_ods,
        nc.replicabilidade,
        nc.data_inicio,
        nc.cargo_funcao,
        nc.area_atuacao,
        nc.avaliacoes_count,
        nc.total_geral,
        nc.total_resolutividade,
        nc.total_replicabilidade,
        ROW_NUMBER() OVER (
          ORDER BY 
            nc.media_total DESC,
            nc.media_cooperacao DESC,
            nc.media_resolutividade DESC,
            nc.media_impacto DESC,
            nc.media_replicabilidade DESC,
            nc.media_inovacao DESC,
            nc.titulo_iniciativa ASC
        ) AS posicao
      FROM notas_cruas nc
    )
    SELECT 
      r.categoria,
      r.inscricao_id,
      r.titulo_iniciativa,
      r.nome_completo,
      r.lotacao,
      r.descricao_iniciativa,
      r.problema_necessidade,
      r.metodologia,
      r.principais_resultados,
      r.publico_alvo,
      r.objetivos,
      r.cooperacao,
      r.inovacao,
      r.resolutividade,
      r.impacto_social,
      r.alinhamento_ods,
      r.replicabilidade,
      r.data_inicio,
      r.cargo_funcao,
      r.area_atuacao,
      r.avaliacoes_count,
      r.total_geral,
      r.total_resolutividade,
      r.total_replicabilidade,
      r.posicao
    FROM ranking r
    WHERE r.posicao <= 3
    ORDER BY r.posicao;
END;
$$;

GRANT EXECUTE ON FUNCTION public.voto_popular_top3_por_categoria(text) TO authenticated;


-- 2. Atualizar consolidar_finalistas_v2 (correção do bug a.status e alinhamento com Item 8.9)
DROP FUNCTION IF EXISTS public.consolidar_finalistas_v2(text, boolean, boolean);
CREATE OR REPLACE FUNCTION public.consolidar_finalistas_v2(
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
    v_pendencias INTEGER := 0;
    v_total_jurados INTEGER := 0;
    v_votos_existentes INTEGER := 0;
    v_execucao_id UUID;
BEGIN
    DROP TABLE IF EXISTS temp_novos_finalistas;

    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_uid AND role::text = 'admin') THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem consolidar finalistas.';
    END IF;

    -- Contagem de jurados cadastrados
    SELECT COUNT(DISTINCT user_id) INTO v_total_jurados 
    FROM public.user_roles 
    WHERE role::text = 'jurado';

    -- Verificar se há jurados sem votação finalizada por categoria
    SELECT COUNT(*) INTO v_pendencias
    FROM (
        SELECT ur.user_id, c.cat
        FROM public.user_roles ur
        CROSS JOIN (
            VALUES 
                ('finalistica-projeto'),
                ('estruturante-projeto'),
                ('finalistica-pratica'),
                ('estruturante-pratica')
        ) AS c(cat)
        WHERE ur.role::text = 'jurado'
          AND NOT EXISTS (
              SELECT 1 
              FROM public.votacao_finalizada vf
              JOIN public.profiles p ON p.username = vf.jurado_username
              WHERE p.auth_user_id = ur.user_id
                AND vf.categoria = c.cat
          )
    ) AS pend;

    IF v_pendencias > 0 AND NOT p_ignorar_pendencias THEN
        RAISE EXCEPTION 'Existem % finalizações de categoria pendentes por jurados. Conclua os votos ou use ignorar pendências.', v_pendencias;
    END IF;

    SELECT COUNT(*) INTO v_votos_existentes FROM public.votos_populares WHERE valido = true;
    
    IF v_votos_existentes > 0 AND p_justificativa IS NULL AND NOT p_dry_run THEN
        RAISE EXCEPTION 'Já existem % votos populares registrados. A reconsolidação alterará os finalistas. Forneça uma justificativa expressa.', v_votos_existentes;
    END IF;

    CREATE TEMP TABLE temp_novos_finalistas ON COMMIT DROP AS
    WITH notas_cruas AS (
        SELECT 
            a.inscricao_id,
            COALESCE(i.area_atuacao, i.area) as categoria,
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
          AND COALESCE(i.edicao_ano, 2025) = 2026
        GROUP BY a.inscricao_id, COALESCE(i.area_atuacao, i.area), i.tipo_iniciativa
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


-- 3. Atualizar apurar_resultados_finais_v2 com cálculo exato do Edital
DROP FUNCTION IF EXISTS public.apurar_resultados_finais_v2(text, boolean);
CREATE OR REPLACE FUNCTION public.apurar_resultados_finais_v2(
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
    IF now() < v_fim_votacao AND NOT p_dry_run AND p_justificativa IS NULL THEN
        RAISE EXCEPTION 'A votação ainda não foi encerrada. Para apuração prévia/teste, forneça uma justificativa expressa.';
    END IF;

    CREATE TEMP TABLE temp_apuracao_resultados ON COMMIT DROP AS
    WITH notas_cruas AS (
        SELECT 
            a.inscricao_id,
            COALESCE(i.area_atuacao, i.area) as categoria,
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
          AND COALESCE(i.edicao_ano, 2025) = 2026
        GROUP BY a.inscricao_id, COALESCE(i.area_atuacao, i.area), i.tipo_iniciativa
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
        WHERE vp.valido = true AND COALESCE(ins.edicao_ano, 2025) = 2026
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
                    CASE WHEN mvc.max_votos > 0 THEN ROUND(((COALESCE(va.qtd_votos, 0)::NUMERIC / mvc.max_votos::NUMERIC) * 100.0), 2)
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
            rt.media_cooperacao,
            rt.media_resolutividade,
            rt.media_impacto,
            rt.media_replicabilidade,
            rt.media_inovacao
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
        apc.nota_popular,
        apc.pontuacao_final,
        apc.classificacao_final,
        CASE
            WHEN apc.is_finalista THEN
                CASE
                    WHEN lag_pf IS NULL OR pontuacao_final != lag_pf THEN 'Sem empate'
                    WHEN nota_tecnica != lag_nt THEN '8.9, I (Nota Técnica)'
                    WHEN media_cooperacao != lag_coop THEN '8.9, II (Cooperação)'
                    WHEN media_resolutividade != lag_res THEN '8.9, III (Resolutividade)'
                    WHEN media_impacto != lag_imp THEN '8.9, IV (Impacto Social/Institucional)'
                    WHEN media_replicabilidade != lag_rep THEN '8.9, V (Replicabilidade)'
                    WHEN media_inovacao != lag_ino THEN '8.9, VI (Inovação)'
                    ELSE '8.9, VII (Decisão Comissão Julgadora)'
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
        apc.nota_popular,
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
    VALUES (v_uid, 'hash_apuracao_edital_88_2026', p_justificativa)
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


-- 4. Atualizar RPC votos_count para filtrar apenas votos válidos (Item 9.6 e 9.7) e da edição 2026
DROP FUNCTION IF EXISTS public.votos_count(text);
CREATE OR REPLACE FUNCTION public.votos_count(categoria text)
RETURNS TABLE (inscricao_id uuid, votos integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT vp.inscricao_id, count(*)::int AS votos
  FROM public.votos_populares vp
  JOIN public.inscricoes i ON i.id = vp.inscricao_id
  WHERE vp.categoria = categoria 
    AND COALESCE(vp.valido, true) = true
    AND COALESCE(i.edicao_ano, 2025) = 2026
  GROUP BY vp.inscricao_id
  ORDER BY votos DESC;
$$;


-- 5. Atualizar RPC get_voto_popular_candidatos (Item 9.1 a 9.4)
-- Retorna os 3 finalistas consolidados em ordem aleatória para o público (Item 9.2).
-- Permite visualização prévia da comissão julgadora/administração fora do período.
DROP FUNCTION IF EXISTS public.get_voto_popular_candidatos(text, double precision);
CREATE OR REPLACE FUNCTION public.get_voto_popular_candidatos(p_categoria TEXT, p_session_seed DOUBLE PRECISION)
RETURNS TABLE (
    inscricao_id UUID,
    titulo_iniciativa TEXT,
    nome_completo TEXT,
    lotacao TEXT,
    descricao_iniciativa TEXT,
    problema_necessidade TEXT,
    metodologia TEXT,
    principais_resultados TEXT
)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
    v_inicio TIMESTAMP;
    v_fim TIMESTAMP;
    v_is_admin BOOLEAN := false;
BEGIN
    SELECT valor_data INTO v_inicio FROM public.cronograma_parametros WHERE chave = 'inicio_votacao';
    SELECT valor_data INTO v_fim FROM public.cronograma_parametros WHERE chave = 'fim_votacao';

    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role::text IN ('admin', 'jurado')
    ) INTO v_is_admin;

    IF (now() < v_inicio OR now() > v_fim) AND NOT v_is_admin THEN
        RAISE EXCEPTION 'Fora do período de votação popular (período oficial: % a %).', 
            to_char(v_inicio, 'DD/MM/YYYY'), to_char(v_fim, 'DD/MM/YYYY');
    END IF;

    RETURN QUERY
    SELECT 
        i.id,
        i.titulo_iniciativa,
        i.nome_completo,
        COALESCE(i.lotacao, i.unidade_setor) AS lotacao,
        COALESCE(i.descricao_iniciativa, i.resumo_executivo) AS descricao_iniciativa,
        i.problema_necessidade,
        COALESCE(i.metodologia, i.etapas_metodologia) AS metodologia,
        COALESCE(i.principais_resultados, i.resultados_alcancados) AS principais_resultados
    FROM public.finalistas_snapshot fs
    JOIN public.inscricoes i ON i.id = fs.inscricao_id
    WHERE fs.categoria = p_categoria 
      AND COALESCE(i.edicao_ano, 2025) = 2026
    ORDER BY md5(fs.inscricao_id::text || p_session_seed::text);
END;
$$;


-- 6. Garantir restrição de período na inserção direta de votos populares (Item 9.4 e 9.7)
CREATE OR REPLACE FUNCTION public.check_periodo_voto_popular()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_inicio TIMESTAMP;
    v_fim TIMESTAMP;
BEGIN
    SELECT valor_data INTO v_inicio FROM public.cronograma_parametros WHERE chave = 'inicio_votacao';
    SELECT valor_data INTO v_fim FROM public.cronograma_parametros WHERE chave = 'fim_votacao';

    IF v_inicio IS NOT NULL AND v_fim IS NOT NULL THEN
        IF now() < v_inicio OR now() > v_fim THEN
            RAISE EXCEPTION 'Votação popular bloqueada. O período oficial de votação é de % a %.',
                to_char(v_inicio, 'DD/MM/YYYY'), to_char(v_fim, 'DD/MM/YYYY');
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_periodo_voto_popular ON public.votos_populares;
CREATE TRIGGER trg_check_periodo_voto_popular
BEFORE INSERT ON public.votos_populares
FOR EACH ROW
EXECUTE FUNCTION public.check_periodo_voto_popular();

