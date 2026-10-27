-- Script para verificar os dados do Step 5 e possíveis problemas de migração

-- 1. Verificar a estrutura atual da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'inscricoes'
AND column_name IN ('participou_edicoes_anteriores', 'foi_vencedor_anterior', 'observacoes', 'declaracao')
ORDER BY column_name;

-- 2. Verificar os dados atuais do Step 5
SELECT 
    id,
    nome_completo,
    participou_edicoes_anteriores,
    foi_vencedor_anterior,
    observacoes,
    declaracao,
    created_at
FROM public.inscricoes
ORDER BY created_at DESC;

-- 3. Verificar se há registros com valores NULL nos campos do Step 5
SELECT 
    'Registros com participou_edicoes_anteriores NULL' as tipo,
    COUNT(*) as quantidade
FROM public.inscricoes 
WHERE participou_edicoes_anteriores IS NULL

UNION ALL

SELECT 
    'Registros com foi_vencedor_anterior NULL' as tipo,
    COUNT(*) as quantidade
FROM public.inscricoes 
WHERE foi_vencedor_anterior IS NULL

UNION ALL

SELECT 
    'Registros com declaracao NULL' as tipo,
    COUNT(*) as quantidade
FROM public.inscricoes 
WHERE declaracao IS NULL;

-- 4. Estatísticas dos dados do Step 5
SELECT 
    'Total de registros' as estatistica,
    COUNT(*) as valor
FROM public.inscricoes

UNION ALL

SELECT 
    'Participaram de edições anteriores (TRUE)' as estatistica,
    COUNT(*) as valor
FROM public.inscricoes 
WHERE participou_edicoes_anteriores = true

UNION ALL

SELECT 
    'Foram vencedores anteriores (TRUE)' as estatistica,
    COUNT(*) as valor
FROM public.inscricoes 
WHERE foi_vencedor_anterior = true

UNION ALL

SELECT 
    'Com observações preenchidas' as estatistica,
    COUNT(*) as valor
FROM public.inscricoes 
WHERE observacoes IS NOT NULL AND observacoes != ''

UNION ALL

SELECT 
    'Declaração aceita (TRUE)' as estatistica,
    COUNT(*) as valor
FROM public.inscricoes 
WHERE declaracao = true;

-- 5. Verificar se há inconsistências nos dados
SELECT 
    id,
    nome_completo,
    participou_edicoes_anteriores,
    foi_vencedor_anterior,
    CASE 
        WHEN participou_edicoes_anteriores IS NULL THEN 'participou_edicoes_anteriores é NULL'
        WHEN foi_vencedor_anterior IS NULL THEN 'foi_vencedor_anterior é NULL'
        WHEN declaracao IS NULL THEN 'declaracao é NULL'
        WHEN declaracao = false THEN 'declaracao é FALSE'
        ELSE 'OK'
    END as status_verificacao
FROM public.inscricoes
WHERE participou_edicoes_anteriores IS NULL 
   OR foi_vencedor_anterior IS NULL 
   OR declaracao IS NULL 
   OR declaracao = false;

-- 6. Corrigir possíveis valores NULL (se necessário)
-- ATENÇÃO: Execute apenas se identificar problemas nos dados

-- UPDATE public.inscricoes 
-- SET participou_edicoes_anteriores = false 
-- WHERE participou_edicoes_anteriores IS NULL;

-- UPDATE public.inscricoes 
-- SET foi_vencedor_anterior = false 
-- WHERE foi_vencedor_anterior IS NULL;

-- UPDATE public.inscricoes 
-- SET declaracao = true 
-- WHERE declaracao IS NULL;

-- Mensagem final
DO $$
BEGIN
    RAISE NOTICE 'Verificação dos dados do Step 5 concluída!';
    RAISE NOTICE 'Analise os resultados acima para identificar possíveis problemas.';
END $$;