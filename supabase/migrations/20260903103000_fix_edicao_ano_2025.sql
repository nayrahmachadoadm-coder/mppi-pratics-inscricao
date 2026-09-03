-- Corrige os registros antigos da 9ª Edição (2025) que receberam o valor default de 2026
-- ao adicionar a coluna edicao_ano.
-- Qualquer inscrição criada antes de 1º de agosto de 2026 é considerada como sendo da 9ª Edição (2025).

UPDATE public.inscricoes
SET edicao_ano = 2025
WHERE created_at < '2026-08-01 00:00:00-03';
