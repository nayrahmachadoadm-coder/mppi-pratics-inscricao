-- Migration 007: Adicionar campo participou_edicoes_anteriores
-- Este campo estava faltando na migração anterior

-- Adicionar o campo participou_edicoes_anteriores
ALTER TABLE public.inscricoes 
ADD COLUMN IF NOT EXISTS participou_edicoes_anteriores BOOLEAN DEFAULT false;

-- Adicionar campo observacoes se não existir
ALTER TABLE public.inscricoes 
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Comentários para documentação
COMMENT ON COLUMN public.inscricoes.participou_edicoes_anteriores IS 'Indica se o participante já participou de edições anteriores do concurso';
COMMENT ON COLUMN public.inscricoes.observacoes IS 'Observações adicionais sobre a participação em edições anteriores';

-- Verificar se os campos foram adicionados corretamente
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