-- Script para corrigir os campos do Step 5 no Supabase
-- Execute este script diretamente no SQL Editor do Supabase

-- Adicionar o campo participou_edicoes_anteriores se não existir
ALTER TABLE public.inscricoes 
ADD COLUMN IF NOT EXISTS participou_edicoes_anteriores BOOLEAN DEFAULT false;

-- Verificar se o campo foi_vencedor_anterior existe
ALTER TABLE public.inscricoes 
ADD COLUMN IF NOT EXISTS foi_vencedor_anterior BOOLEAN DEFAULT false;

-- Adicionar campo observacoes se não existir
ALTER TABLE public.inscricoes 
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Comentários para documentação
COMMENT ON COLUMN public.inscricoes.participou_edicoes_anteriores IS 'Indica se o participante já participou de edições anteriores do concurso';
COMMENT ON COLUMN public.inscricoes.foi_vencedor_anterior IS 'Indica se o participante foi vencedor em edições anteriores';
COMMENT ON COLUMN public.inscricoes.observacoes IS 'Observações adicionais sobre a participação em edições anteriores';

-- Verificar a estrutura atual da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'inscricoes'
AND column_name IN ('participou_edicoes_anteriores', 'foi_vencedor_anterior', 'observacoes')
ORDER BY column_name;

-- Verificar se há dados na tabela
SELECT COUNT(*) as total_registros FROM public.inscricoes;

-- Mostrar alguns registros para verificar os campos
SELECT 
    id,
    nome_completo,
    participou_edicoes_anteriores,
    foi_vencedor_anterior,
    observacoes,
    created_at
FROM public.inscricoes 
ORDER BY created_at DESC 
LIMIT 5;