-- ==============================================================================
-- Migração: 20261020133000_limpar_notas_testes_2026.sql
-- Objetivo: Limpar notas, avaliações e dados de teste da Edição 2026,
--           preservando integralmente todas as inscrições e contas de usuários.
-- ==============================================================================

-- 1. Criar a RPC segura para limpeza de notas de teste da edição 2026
CREATE OR REPLACE FUNCTION public.rpc_limpar_avaliacoes_teste_2026(p_confirmacao text DEFAULT '')
RETURNS jsonb
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
    v_uid uuid := auth.uid();
    v_is_admin boolean := false;
    v_count_avaliacoes integer := 0;
    v_count_finalizacoes integer := 0;
    v_count_snapshots integer := 0;
    v_count_apuracoes integer := 0;
    v_count_votos_pop integer := 0;
BEGIN
    -- Permitir execução se for admin autenticado OU se executado via SQL Editor direto no console
    IF v_uid IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 
            FROM public.user_roles ur
            LEFT JOIN public.profiles p ON p.id = ur.user_id
            WHERE (p.auth_user_id = v_uid OR ur.user_id = v_uid)
              AND ur.role::text = 'admin'
        ) INTO v_is_admin;

        IF NOT v_is_admin THEN
            RAISE EXCEPTION 'Acesso negado: Apenas administradores podem executar a limpeza de notas de teste.';
        END IF;
    END IF;

    IF UPPER(TRIM(COALESCE(p_confirmacao, ''))) != 'LIMPAR_2026' THEN
        RAISE EXCEPTION 'Confirmação obrigatória: informe o valor ''LIMPAR_2026'' para autorizar a limpeza.';
    END IF;

    -- 1. Contar e excluir avaliações (notas dos jurados) referentes às iniciativas de 2026
    SELECT COUNT(*) INTO v_count_avaliacoes
    FROM public.avaliacoes a
    WHERE a.inscricao_id IN (
        SELECT id FROM public.inscricoes WHERE COALESCE(edicao_ano, 2025) = 2026
    );

    DELETE FROM public.avaliacoes a
    WHERE a.inscricao_id IN (
        SELECT id FROM public.inscricoes WHERE COALESCE(edicao_ano, 2025) = 2026
    );

    -- 2. Contar e excluir registros de votação finalizada de testes
    SELECT COUNT(*) INTO v_count_finalizacoes
    FROM public.votacao_finalizada
    WHERE jurado_username IN (
        SELECT username FROM public.profiles WHERE edicao_ano = 2026
    ) OR created_at >= '2026-09-01' OR finalized_at >= '2026-09-01';

    DELETE FROM public.votacao_finalizada
    WHERE jurado_username IN (
        SELECT username FROM public.profiles WHERE edicao_ano = 2026
    ) OR created_at >= '2026-09-01' OR finalized_at >= '2026-09-01';

    -- 3. Contar e excluir snapshots e execuções de finalistas gerados em testes
    SELECT COUNT(*) INTO v_count_snapshots
    FROM public.finalistas_snapshot
    WHERE inscricao_id IN (
        SELECT id FROM public.inscricoes WHERE COALESCE(edicao_ano, 2025) = 2026
    );

    DELETE FROM public.finalistas_snapshot
    WHERE inscricao_id IN (
        SELECT id FROM public.inscricoes WHERE COALESCE(edicao_ano, 2025) = 2026
    );

    DELETE FROM public.finalistas_execucoes
    WHERE created_at >= '2026-09-01';

    -- 4. Contar e excluir apurações e memórias de cálculo de teste
    SELECT COUNT(*) INTO v_count_apuracoes
    FROM public.apuracao_resultados
    WHERE inscricao_id IN (
        SELECT id FROM public.inscricoes WHERE COALESCE(edicao_ano, 2025) = 2026
    );

    DELETE FROM public.apuracao_resultados
    WHERE inscricao_id IN (
        SELECT id FROM public.inscricoes WHERE COALESCE(edicao_ano, 2025) = 2026
    );

    DELETE FROM public.apuracao_execucoes
    WHERE data_execucao >= '2026-09-01';

    -- 5. Contar e excluir votos populares de teste da edição 2026
    SELECT COUNT(*) INTO v_count_votos_pop
    FROM public.votos_populares
    WHERE inscricao_id IN (
        SELECT id FROM public.inscricoes WHERE COALESCE(edicao_ano, 2025) = 2026
    ) OR created_at >= '2026-09-01';

    DELETE FROM public.votos_populares
    WHERE inscricao_id IN (
        SELECT id FROM public.inscricoes WHERE COALESCE(edicao_ano, 2025) = 2026
    ) OR created_at >= '2026-09-01';

    RETURN jsonb_build_object(
        'sucesso', true,
        'mensagem', 'Limpeza concluída com sucesso. O banco de dados está pronto para o julgamento oficial.',
        'avaliacoes_excluidas', v_count_avaliacoes,
        'finalizacoes_excluidas', v_count_finalizacoes,
        'snapshots_excluidos', v_count_snapshots,
        'apuracoes_excluidas', v_count_apuracoes,
        'votos_populares_excluidos', v_count_votos_pop
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_limpar_avaliacoes_teste_2026(text) TO authenticated;

-- 2. Executar a limpeza imediatamente nesta migração
SELECT public.rpc_limpar_avaliacoes_teste_2026('LIMPAR_2026');
