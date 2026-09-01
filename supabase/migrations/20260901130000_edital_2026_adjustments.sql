-- Migration para adequações do Edital 2026 do Prêmio Melhores Práticas MPPI

-- 1. Tabela de parâmetros do cronograma
CREATE TABLE IF NOT EXISTS public.cronograma_parametros (
    chave TEXT PRIMARY KEY,
    valor_data TIMESTAMP WITH TIME ZONE,
    descricao TEXT
);

INSERT INTO public.cronograma_parametros (chave, valor_data, descricao) VALUES
('inicio_inscricoes', '2026-09-04 00:00:00-03', 'Início do período de inscrições'),
('fim_inscricoes', '2026-10-04 23:59:59-03', 'Fim do período de inscrições'),
('inicio_votacao', '2026-11-04 00:00:00-03', 'Início da votação popular'),
('fim_votacao', '2026-11-13 23:59:59-03', 'Fim da votação popular')
ON CONFLICT (chave) DO NOTHING;

ALTER TABLE public.cronograma_parametros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública cronograma" ON public.cronograma_parametros FOR SELECT USING (true);


-- 2. Modificações em Inscrições e Votos
ALTER TABLE public.inscricoes 
ADD COLUMN IF NOT EXISTS cadastro_banco_praticas BOOLEAN,
ADD COLUMN IF NOT EXISTS institucionalizado_ato BOOLEAN,
ADD COLUMN IF NOT EXISTS status_inscricao TEXT DEFAULT 'Em Análise',
ADD COLUMN IF NOT EXISTS edicao_ano INTEGER DEFAULT 2026,
ADD COLUMN IF NOT EXISTS tipo_iniciativa TEXT GENERATED ALWAYS AS (
    CASE 
        WHEN area IN ('finalistica-pratica', 'estruturante-pratica') THEN 'pratica' 
        ELSE 'projeto' 
    END
) STORED;

CREATE INDEX IF NOT EXISTS idx_inscricoes_matricula_tipo ON public.inscricoes(matricula, tipo_iniciativa, edicao_ano);

ALTER TABLE public.votos_populares 
ADD COLUMN IF NOT EXISTS valido BOOLEAN DEFAULT true;


-- 3. Histórico de Status da Inscrição (Item 6.10 a 6.12)
CREATE TABLE IF NOT EXISTS public.inscricao_status_historico (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inscricao_id UUID REFERENCES public.inscricoes(id) ON DELETE CASCADE,
    status_anterior TEXT,
    status_novo TEXT NOT NULL,
    motivo TEXT,
    autor TEXT NOT NULL,
    numero_sei TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.inscricao_status_historico ENABLE ROW LEVEL SECURITY;


-- 4. Snapshot de Finalistas (Item 9.9)
CREATE TABLE IF NOT EXISTS public.finalistas_snapshot (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inscricao_id UUID REFERENCES public.inscricoes(id) ON DELETE CASCADE,
    categoria TEXT NOT NULL,
    nota_tecnica_calculada NUMERIC(5,2) NOT NULL,
    posicao_tecnica INTEGER NOT NULL,
    media_resolutividade NUMERIC(10,4),
    media_impacto NUMERIC(10,4),
    media_replicabilidade NUMERIC(10,4),
    media_inovacao NUMERIC(10,4),
    media_cooperacao NUMERIC(10,4),
    divisor INTEGER NOT NULL,
    julgadores_count INTEGER NOT NULL,
    publicado_por TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.finalistas_snapshot ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso apenas via RPC ou autenticado" ON public.finalistas_snapshot FOR SELECT USING (auth.role() = 'authenticated');


-- 5. Tabelas de Apuração e Memória de Cálculo (Item 9.9)
CREATE TABLE IF NOT EXISTS public.apuracao_execucoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    executor TEXT NOT NULL,
    data_execucao TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    hash_insumos TEXT
);

CREATE TABLE IF NOT EXISTS public.apuracao_resultados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    execucao_id UUID REFERENCES public.apuracao_execucoes(id) ON DELETE CASCADE,
    inscricao_id UUID REFERENCES public.inscricoes(id) ON DELETE CASCADE,
    categoria TEXT NOT NULL,
    is_finalista BOOLEAN NOT NULL DEFAULT false,
    nota_tecnica NUMERIC(5,2) NOT NULL,
    votos_validos INTEGER NOT NULL DEFAULT 0,
    maior_voto_categoria INTEGER NOT NULL DEFAULT 0,
    nota_popular NUMERIC(5,2),
    pontuacao_final NUMERIC(5,2),
    classificacao_final INTEGER
);

ALTER TABLE public.apuracao_execucoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apuracao_resultados ENABLE ROW LEVEL SECURITY;


-- 6. RPC para Voto Popular com segurança
CREATE OR REPLACE FUNCTION get_voto_popular_candidatos(p_categoria TEXT, p_session_seed DOUBLE PRECISION)
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
LANGUAGE plpgsql
AS $$
DECLARE
    v_inicio TIMESTAMP;
    v_fim TIMESTAMP;
BEGIN
    SELECT valor_data INTO v_inicio FROM public.cronograma_parametros WHERE chave = 'inicio_votacao';
    SELECT valor_data INTO v_fim FROM public.cronograma_parametros WHERE chave = 'fim_votacao';

    IF now() < v_inicio OR now() > v_fim THEN
        RAISE EXCEPTION 'Fora do período de votação.';
    END IF;

    RETURN QUERY
    SELECT 
        i.id,
        i.titulo_iniciativa,
        i.nome_completo,
        i.unidade_setor as lotacao,
        i.resumo_executivo as descricao_iniciativa,
        i.problema_necessidade,
        i.etapas_metodologia as metodologia,
        i.resultados_alcancados as principais_resultados
    FROM public.finalistas_snapshot fs
    JOIN public.inscricoes i ON i.id = fs.inscricao_id
    WHERE fs.categoria = p_categoria
    ORDER BY md5(fs.inscricao_id::text || p_session_seed::text);
END;
$$;


-- 7. Policy de inserção no voto popular limitando à janela
DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir voto na janela de votacao" ON public.votos_populares;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Permitir voto na janela de votacao" ON public.votos_populares
    FOR INSERT 
    WITH CHECK (
        now() >= (SELECT valor_data FROM public.cronograma_parametros WHERE chave = 'inicio_votacao') AND
        now() <= (SELECT valor_data FROM public.cronograma_parametros WHERE chave = 'fim_votacao')
    );


-- 8. RPC de Apuração de Resultados Finais (A principal)
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


-- 9. RPC para Criar Snapshot de Finalistas
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

-- 10. View para triagem de duplicidades (Security Invoker para evitar vazamento RLS)
CREATE OR REPLACE VIEW public.triagem_duplicidades
WITH (security_invoker = on) AS
SELECT
  i.id,
  i.matricula,
  i.area,
  i.tipo_iniciativa,
  i.titulo_iniciativa,
  i.created_at,
  i.status_inscricao,
  row_number() OVER (
    PARTITION BY i.matricula, i.tipo_iniciativa, i.edicao_ano
    ORDER BY i.created_at, i.id
  ) AS ordem_envio,
  row_number() OVER (
    PARTITION BY i.matricula, i.tipo_iniciativa, i.edicao_ano
    ORDER BY i.created_at, i.id
  ) > 1 AS is_duplicata_posterior
FROM public.inscricoes i;