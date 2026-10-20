-- ==============================================================================
-- Script: limpar_notas_testes_edicao_2026.sql
-- Objetivo: Limpar notas, avaliações dos jurados e dados de teste da Edição 2026
-- Instruções: Copie todo o conteúdo deste arquivo e execute no SQL Editor do Supabase
--             (https://supabase.com/dashboard/project/ljbxctmywdpsfmjvmlmh/sql)
--
-- ATENÇÃO: As INSCRIÇÕES e USUÁRIOS são 100% PRESERVADOS.
-- ==============================================================================

BEGIN;

-- 1. Excluir avaliações (notas atribuídas pelos jurados) referentes às iniciativas de 2026
DELETE FROM public.avaliacoes
WHERE inscricao_id IN (
    SELECT id FROM public.inscricoes 
    WHERE COALESCE(edicao_ano, 2025) = 2026
);

-- 2. Excluir registros de votação finalizada por jurados de 2026 / recentes
-- (necessário para que as categorias fiquem liberadas para o julgamento oficial)
DELETE FROM public.votacao_finalizada
WHERE jurado_username IN (
    SELECT username FROM public.profiles WHERE edicao_ano = 2026
) 
OR created_at >= '2026-09-01' 
OR finalized_at >= '2026-09-01';

-- 3. Excluir snapshots de finalistas gerados em testes anteriores
DELETE FROM public.finalistas_snapshot
WHERE inscricao_id IN (
    SELECT id FROM public.inscricoes 
    WHERE COALESCE(edicao_ano, 2025) = 2026
);

DELETE FROM public.finalistas_execucoes
WHERE created_at >= '2026-09-01';

-- 4. Excluir resultados de apurações e memórias de cálculo de teste
DELETE FROM public.apuracao_resultados
WHERE inscricao_id IN (
    SELECT id FROM public.inscricoes 
    WHERE COALESCE(edicao_ano, 2025) = 2026
);

DELETE FROM public.apuracao_execucoes
WHERE data_execucao >= '2026-09-01';

-- 5. Excluir votos populares registrados durante os testes
DELETE FROM public.votos_populares
WHERE inscricao_id IN (
    SELECT id FROM public.inscricoes 
    WHERE COALESCE(edicao_ano, 2025) = 2026
) 
OR created_at >= '2026-09-01';

COMMIT;

-- Consulta de conferência pós-limpeza:
SELECT 
    (SELECT COUNT(*) FROM public.inscricoes WHERE COALESCE(edicao_ano, 2025) = 2026) AS inscricoes_2026_ativas,
    (SELECT COUNT(*) FROM public.avaliacoes a JOIN public.inscricoes i ON i.id = a.inscricao_id WHERE COALESCE(i.edicao_ano, 2025) = 2026) AS avaliacoes_2026_restantes,
    (SELECT COUNT(*) FROM public.votacao_finalizada WHERE finalized_at >= '2026-09-01' OR created_at >= '2026-09-01') AS finalizacoes_restantes,
    (SELECT COUNT(*) FROM public.finalistas_snapshot) AS finalistas_snapshot_restantes,
    (SELECT COUNT(*) FROM public.votos_populares WHERE created_at >= '2026-09-01') AS votos_populares_restantes;
