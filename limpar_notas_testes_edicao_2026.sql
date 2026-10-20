-- ==============================================================================
-- Script: limpar_notas_testes_edicao_2026.sql
-- Objetivo: Limpar notas, avaliações dos jurados e dados de teste da Edição 2026
-- Instruções: Copie todo o conteúdo deste arquivo e execute no SQL Editor do Supabase
--             (https://supabase.com/dashboard/project/ljbxctmywdpsfmjvmlmh/sql)
--
-- ATENÇÃO: As INSCRIÇÕES e USUÁRIOS são 100% PRESERVADOS.
-- ==============================================================================

-- 0. Garantir existência da coluna edicao_ano em profiles (caso ainda não exista)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS edicao_ano INTEGER DEFAULT 2026;

BEGIN;

-- 1. Excluir avaliações (notas atribuídas pelos jurados) referentes às iniciativas de 2026
DELETE FROM public.avaliacoes
WHERE inscricao_id IN (
    SELECT id FROM public.inscricoes 
    WHERE COALESCE(edicao_ano, 2026) = 2026
);

-- 2. Excluir registros de votação finalizada por jurados em testes
-- (libera as categorias para que a comissão oficial possa julgar os trabalhos)
DELETE FROM public.votacao_finalizada;

-- 3. Excluir snapshots e execuções de finalistas gerados em testes anteriores
DELETE FROM public.finalistas_snapshot;
DELETE FROM public.finalistas_execucoes;

-- 4. Excluir resultados de apurações e memórias de cálculo de teste
DELETE FROM public.apuracao_resultados;
DELETE FROM public.apuracao_execucoes;

-- 5. Excluir votos populares registrados durante os testes da edição 2026
DELETE FROM public.votos_populares
WHERE inscricao_id IN (
    SELECT id FROM public.inscricoes 
    WHERE COALESCE(edicao_ano, 2026) = 2026
) 
OR created_at >= '2026-01-01';

COMMIT;

-- Consulta de conferência pós-limpeza:
SELECT 
    (SELECT COUNT(*) FROM public.inscricoes WHERE COALESCE(edicao_ano, 2026) = 2026) AS inscricoes_2026_ativas,
    (SELECT COUNT(*) FROM public.avaliacoes a JOIN public.inscricoes i ON i.id = a.inscricao_id WHERE COALESCE(i.edicao_ano, 2026) = 2026) AS avaliacoes_restantes,
    (SELECT COUNT(*) FROM public.votacao_finalizada) AS finalizacoes_restantes,
    (SELECT COUNT(*) FROM public.finalistas_snapshot) AS finalistas_snapshot_restantes,
    (SELECT COUNT(*) FROM public.votos_populares WHERE created_at >= '2026-01-01') AS votos_populares_restantes;
