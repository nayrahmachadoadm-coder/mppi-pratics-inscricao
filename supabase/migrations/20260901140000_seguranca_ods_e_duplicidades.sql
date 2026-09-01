-- Correções de segurança e regras do Edital (Duplicidades, ODS, Permissões)

-- 1. Campos de identificação de institucionalização
ALTER TABLE public.inscricoes 
ADD COLUMN IF NOT EXISTS identificacao_banco_praticas TEXT,
ADD COLUMN IF NOT EXISTS identificacao_projeto_metodologia TEXT;

-- 2. Trigger para validação de ODS e Recálculo da Nota Total em Avaliações
CREATE OR REPLACE FUNCTION public.trg_check_ods_e_calcula_total()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_tipo_iniciativa TEXT;
BEGIN
    -- Busca o tipo da iniciativa da inscrição avaliada
    SELECT tipo_iniciativa INTO v_tipo_iniciativa 
    FROM public.inscricoes 
    WHERE id = NEW.inscricao_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inscrição % não encontrada.', NEW.inscricao_id;
    END IF;

    -- Regra ODS
    IF v_tipo_iniciativa = 'pratica' AND NEW.alinhamento_ods IS NOT NULL THEN
        RAISE EXCEPTION 'Práticas não devem pontuar Alinhamento aos ODS.';
    ELSIF v_tipo_iniciativa = 'projeto' AND NEW.alinhamento_ods IS NULL THEN
        RAISE EXCEPTION 'Projetos devem obrigatoriamente pontuar Alinhamento aos ODS.';
    END IF;

    -- Recálculo do Total
    IF v_tipo_iniciativa = 'pratica' THEN
        NEW.total := COALESCE(NEW.cooperacao, 0) + 
                     COALESCE(NEW.inovacao, 0) + 
                     COALESCE(NEW.resolutividade, 0) + 
                     COALESCE(NEW.impacto_social, 0) + 
                     COALESCE(NEW.replicabilidade, 0);
    ELSE
        NEW.total := COALESCE(NEW.cooperacao, 0) + 
                     COALESCE(NEW.inovacao, 0) + 
                     COALESCE(NEW.resolutividade, 0) + 
                     COALESCE(NEW.impacto_social, 0) + 
                     COALESCE(NEW.alinhamento_ods, 0) + 
                     COALESCE(NEW.replicabilidade, 0);
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_avaliacoes_ods_total ON public.avaliacoes;
CREATE TRIGGER trg_avaliacoes_ods_total
BEFORE INSERT OR UPDATE ON public.avaliacoes
FOR EACH ROW
EXECUTE FUNCTION public.trg_check_ods_e_calcula_total();

-- 3. RPC para verificar duplicidade de inscrição (Segura, retorna apenas boolean/count)
CREATE OR REPLACE FUNCTION public.verificar_duplicidade_inscricao(p_matricula TEXT, p_tipo_iniciativa TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.inscricoes
    WHERE matricula = p_matricula
      AND tipo_iniciativa = p_tipo_iniciativa
      AND edicao_ano = 2026;

    RETURN v_count > 0;
END;
$$;

-- 4. Reescrever voto_popular_top3_por_categoria com PL/pgSQL para blindagem real de papel
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
    -- Verificação estrita de autorização no DB
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role::text IN ('admin', 'jurado')
    ) THEN
      RAISE EXCEPTION 'Acesso negado';
    END IF;

    RETURN QUERY
    WITH ranking AS (
      SELECT
        i.area_atuacao AS categoria,
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
        ROW_NUMBER() OVER (
          ORDER BY 
            COALESCE(SUM(a.total), 0) DESC,
            COALESCE(SUM(a.resolutividade), 0) DESC,
            COALESCE(SUM(a.replicabilidade), 0) DESC,
            i.titulo_iniciativa ASC
        ) AS posicao
      FROM public.inscricoes i
      LEFT JOIN public.avaliacoes a ON a.inscricao_id = i.id
      WHERE i.area_atuacao = area_key
      GROUP BY i.id
    )
    SELECT * FROM ranking
    WHERE ranking.posicao <= 3
    ORDER BY ranking.posicao;
END;
$$;

-- Revoke execução para papel anônimo na função reescrita (caso tenha ficado de antes)
REVOKE EXECUTE ON FUNCTION public.voto_popular_top3_por_categoria(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.voto_popular_top3_por_categoria(text) TO authenticated;

-- 5. Bloquear tabelas de auditoria/resultados para anon
REVOKE SELECT ON public.finalistas_snapshot FROM anon;
REVOKE SELECT ON public.apuracao_resultados FROM anon;
REVOKE SELECT ON public.avaliacoes FROM anon;

-- Redefinir políticas de SELECT nas tabelas sensíveis para reforçar
DO $$
BEGIN
    DROP POLICY IF EXISTS "Acesso apenas via RPC ou autenticado" ON public.finalistas_snapshot;
    DROP POLICY IF EXISTS "Acesso restrito ranking_resultado" ON public.apuracao_resultados;
    DROP POLICY IF EXISTS "Acesso restrito avaliacoes" ON public.avaliacoes;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Acesso restrito finalistas" ON public.finalistas_snapshot FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text IN ('admin', 'jurado'))
);

CREATE POLICY "Acesso restrito apuracao_resultados" ON public.apuracao_resultados FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text IN ('admin', 'jurado'))
);
