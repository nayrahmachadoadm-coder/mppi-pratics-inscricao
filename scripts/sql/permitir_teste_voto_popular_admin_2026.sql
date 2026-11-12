-- ==============================================================================
-- Script SQL: permitir_teste_voto_popular_admin_2026.sql
-- Execute no SQL Editor do Supabase para:
-- 1. Desvincular totalmente os votos populares de 2026 dos registros de 2025.
-- 2. Corrigir a verificação de Administrador (vinculando profiles.auth_user_id = auth.uid()
--    a user_roles.user_id = profiles.id via função SECURITY DEFINER sem bloqueio de RLS).
-- 3. Permitir que administradores realizem e limpem votos de teste antes de 12/11/2026.
-- ==============================================================================

-- 1. Garantir coluna edicao_ano em votos_populares e preencher registros antigos
ALTER TABLE public.votos_populares
ADD COLUMN IF NOT EXISTS edicao_ano INTEGER DEFAULT 2026;

UPDATE public.votos_populares vp
SET edicao_ano = COALESCE(i.edicao_ano, 2025)
FROM public.inscricoes i
WHERE vp.inscricao_id = i.id
  AND (vp.edicao_ano IS NULL OR vp.edicao_ano != COALESCE(i.edicao_ano, 2025));

-- 2. Substituir constraint/índice antigo (categoria, fingerprint) por índice único parcial por edição (2026 separado de 2025)
ALTER TABLE public.votos_populares
DROP CONSTRAINT IF EXISTS votos_populares_categoria_fingerprint_key;

DROP INDEX IF EXISTS public.votos_unq_categoria_fingerprint;
DROP INDEX IF EXISTS public.votos_unq_categoria_fingerprint_edicao;

CREATE UNIQUE INDEX votos_unq_categoria_fingerprint_edicao
ON public.votos_populares (categoria, fingerprint, COALESCE(edicao_ano, 2026))
WHERE COALESCE(valido, true) = true;

-- 3. Função helper SECURITY DEFINER para checar role sem recursão de RLS
--    Considera: profiles.auth_user_id = auth.uid(), user_roles.user_id = auth.uid(), ou e-mail do JWT
CREATE OR REPLACE FUNCTION public.current_user_has_role(_role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    LEFT JOIN public.profiles p ON p.id = ur.user_id
    WHERE (
      p.auth_user_id = auth.uid()
      OR ur.user_id = auth.uid()
      OR (
        COALESCE(auth.jwt() ->> 'email', '') <> ''
        AND lower(p.email) = lower(auth.jwt() ->> 'email')
      )
    )
    AND ur.role = _role
  );
$$;

GRANT EXECUTE ON FUNCTION public.current_user_has_role(public.app_role) TO anon, authenticated;

-- 4. Atualizar trigger check_periodo_voto_popular usando current_user_has_role('admin')
CREATE OR REPLACE FUNCTION public.check_periodo_voto_popular()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_inicio TIMESTAMP WITH TIME ZONE;
    v_fim TIMESTAMP WITH TIME ZONE;
    v_is_admin BOOLEAN := false;
    v_edicao INTEGER := 2026;
BEGIN
    SELECT COALESCE(edicao_ano, 2026) INTO v_edicao
    FROM public.inscricoes
    WHERE id = NEW.inscricao_id;

    NEW.edicao_ano := COALESCE(v_edicao, 2026);

    SELECT valor_data INTO v_inicio FROM public.cronograma_parametros WHERE chave = 'inicio_votacao';
    SELECT valor_data INTO v_fim FROM public.cronograma_parametros WHERE chave = 'fim_votacao';

    IF auth.uid() IS NOT NULL THEN
        v_is_admin := public.current_user_has_role('admin'::public.app_role);
    END IF;

    IF v_inicio IS NOT NULL AND v_fim IS NOT NULL AND NOT v_is_admin THEN
        IF now() < v_inicio OR now() > v_fim THEN
            RAISE EXCEPTION 'Votação popular bloqueada. O período oficial de votação é de % a %.',
                to_char(v_inicio AT TIME ZONE 'America/Fortaleza', 'DD/MM/YYYY'),
                to_char(v_fim AT TIME ZONE 'America/Fortaleza', 'DD/MM/YYYY');
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

-- 5. Atualizar política de INSERT em votos_populares usando a função SECURITY DEFINER (evita bloqueio/recursão de RLS em user_roles)
DROP POLICY IF EXISTS "Permitir voto na janela de votacao" ON public.votos_populares;
CREATE POLICY "Permitir voto na janela de votacao" ON public.votos_populares
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        (
            now() >= (SELECT valor_data FROM public.cronograma_parametros WHERE chave = 'inicio_votacao') AND
            now() <= (SELECT valor_data FROM public.cronograma_parametros WHERE chave = 'fim_votacao')
        )
        OR public.current_user_has_role('admin'::public.app_role)
    );

-- 6. RPC administrativa para limpar votos de teste da Edição 2026 antes da abertura oficial
CREATE OR REPLACE FUNCTION public.limpar_votos_teste_admin(p_fingerprint TEXT DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_deleted INTEGER := 0;
BEGIN
    IF NOT public.current_user_has_role('admin'::public.app_role) THEN
        RAISE EXCEPTION 'Acesso negado: apenas administradores podem limpar votos de teste.';
    END IF;

    DELETE FROM public.votos_populares vp
    USING public.inscricoes i
    WHERE vp.inscricao_id = i.id
      AND COALESCE(i.edicao_ano, 2025) = 2026
      AND (p_fingerprint IS NULL OR vp.fingerprint = p_fingerprint);

    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$;

GRANT EXECUTE ON FUNCTION public.limpar_votos_teste_admin(TEXT) TO authenticated;

-- 7. Garantir datas oficiais de votação popular no cronograma_parametros (12/11/2026 a 23/11/2026)
INSERT INTO public.cronograma_parametros (chave, valor_data, descricao) VALUES
('inicio_votacao', '2026-11-12 00:00:00-03', 'Início da votação popular'),
('fim_votacao', '2026-11-23 23:59:59-03', 'Fim da votação popular')
ON CONFLICT (chave) DO UPDATE
SET valor_data = EXCLUDED.valor_data;

-- 8. Atualizar get_voto_popular_candidatos para calcular sempre os 3 finalistas com maior Nota Técnica
--    no julgamento dos jurados (Item 8.3, 8.9 e 9.1 do Edital nº 88/2026) na Edição 2026, em ordem alfabética
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
BEGIN
    RETURN QUERY
    WITH ranking AS (
        SELECT
            i.id,
            i.titulo_iniciativa,
            i.nome_completo,
            COALESCE(i.lotacao, i.unidade_setor) AS lotacao,
            COALESCE(i.descricao_iniciativa, i.resumo_executivo) AS descricao_iniciativa,
            i.problema_necessidade,
            COALESCE(i.metodologia, i.etapas_metodologia) AS metodologia,
            COALESCE(i.principais_resultados, i.resultados_alcancados) AS principais_resultados,
            ROW_NUMBER() OVER (
                ORDER BY
                    COALESCE(AVG(a.total::NUMERIC), 0) DESC,
                    COALESCE(AVG(a.cooperacao::NUMERIC), 0) DESC,
                    COALESCE(AVG(a.resolutividade::NUMERIC), 0) DESC,
                    COALESCE(AVG(a.impacto_social::NUMERIC), 0) DESC,
                    COALESCE(AVG(a.replicabilidade::NUMERIC), 0) DESC,
                    COALESCE(AVG(a.inovacao::NUMERIC), 0) DESC,
                    i.titulo_iniciativa ASC
            ) AS pos
        FROM public.inscricoes i
        LEFT JOIN public.avaliacoes a ON a.inscricao_id = i.id
        WHERE COALESCE(i.area_atuacao, i.area) = p_categoria
          AND COALESCE(i.status_inscricao, '') NOT IN ('Indeferida', 'Indeferido', 'Cancelada', 'Substituída')
          AND COALESCE(i.edicao_ano, 2025) = 2026
        GROUP BY i.id
    )
    SELECT
        r.id,
        r.titulo_iniciativa,
        r.nome_completo,
        r.lotacao,
        r.descricao_iniciativa,
        r.problema_necessidade,
        r.metodologia,
        r.principais_resultados
    FROM ranking r
    WHERE r.pos <= 3
    ORDER BY r.titulo_iniciativa ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_voto_popular_candidatos(text, double precision) TO anon, authenticated;
