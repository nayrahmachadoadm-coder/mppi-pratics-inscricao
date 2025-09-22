-- Migration 006: Corrigir estrutura da tabela inscricoes
-- Adicionar campos faltantes e renomear campos para corresponder ao código

-- Primeiro, vamos adicionar as colunas que estão faltando
ALTER TABLE public.inscricoes 
ADD COLUMN IF NOT EXISTS area_atuacao TEXT,
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS lotacao TEXT,
ADD COLUMN IF NOT EXISTS data_inicio TEXT,
ADD COLUMN IF NOT EXISTS data_fim TEXT,
ADD COLUMN IF NOT EXISTS publico_alvo TEXT,
ADD COLUMN IF NOT EXISTS descricao_iniciativa TEXT,
ADD COLUMN IF NOT EXISTS objetivos TEXT,
ADD COLUMN IF NOT EXISTS metodologia TEXT,
ADD COLUMN IF NOT EXISTS principais_resultados TEXT,
ADD COLUMN IF NOT EXISTS declaracao BOOLEAN DEFAULT false;

-- Migrar dados existentes se houver
UPDATE public.inscricoes SET 
  area_atuacao = area,
  telefone = telefone_institucional,
  lotacao = unidade_setor,
  data_inicio = ano_inicio_execucao,
  publico_alvo = equipe_envolvida,
  descricao_iniciativa = resumo_executivo,
  objetivos = objetivos_estrategicos,
  metodologia = etapas_metodologia,
  principais_resultados = resultados_alcancados,
  declaracao = concorda_termos
WHERE area_atuacao IS NULL;

-- Agora podemos remover as colunas antigas (opcional - comentado para segurança)
-- ALTER TABLE public.inscricoes 
-- DROP COLUMN IF EXISTS area,
-- DROP COLUMN IF EXISTS telefone_institucional,
-- DROP COLUMN IF EXISTS unidade_setor,
-- DROP COLUMN IF EXISTS ano_inicio_execucao,
-- DROP COLUMN IF EXISTS equipe_envolvida,
-- DROP COLUMN IF EXISTS resumo_executivo,
-- DROP COLUMN IF EXISTS objetivos_estrategicos,
-- DROP COLUMN IF EXISTS etapas_metodologia,
-- DROP COLUMN IF EXISTS resultados_alcancados,
-- DROP COLUMN IF EXISTS concorda_termos;

-- Adicionar campos que podem estar faltando
ALTER TABLE public.inscricoes 
ADD COLUMN IF NOT EXISTS matricula TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS situacao_atual TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS data_conclusao TEXT,
ADD COLUMN IF NOT EXISTS problema_necessidade TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS foi_vencedor_anterior BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS local_data TEXT DEFAULT '';

-- Atualizar campos NOT NULL para permitir valores padrão
ALTER TABLE public.inscricoes 
ALTER COLUMN area_atuacao SET NOT NULL,
ALTER COLUMN telefone SET NOT NULL,
ALTER COLUMN lotacao SET NOT NULL,
ALTER COLUMN data_inicio SET NOT NULL,
ALTER COLUMN publico_alvo SET NOT NULL,
ALTER COLUMN descricao_iniciativa SET NOT NULL,
ALTER COLUMN objetivos SET NOT NULL,
ALTER COLUMN metodologia SET NOT NULL,
ALTER COLUMN principais_resultados SET NOT NULL,
ALTER COLUMN declaracao SET NOT NULL;

-- Criar índices para os novos campos
CREATE INDEX IF NOT EXISTS idx_inscricoes_area_atuacao ON public.inscricoes(area_atuacao);
CREATE INDEX IF NOT EXISTS idx_inscricoes_lotacao ON public.inscricoes(lotacao);

-- Comentários para documentação
COMMENT ON COLUMN public.inscricoes.area_atuacao IS 'Área de atuação da iniciativa';
COMMENT ON COLUMN public.inscricoes.telefone IS 'Telefone institucional do proponente';
COMMENT ON COLUMN public.inscricoes.lotacao IS 'Lotação/unidade do proponente';
COMMENT ON COLUMN public.inscricoes.data_inicio IS 'Data de início da iniciativa';
COMMENT ON COLUMN public.inscricoes.publico_alvo IS 'Público alvo da iniciativa';
COMMENT ON COLUMN public.inscricoes.descricao_iniciativa IS 'Descrição detalhada da iniciativa';
COMMENT ON COLUMN public.inscricoes.objetivos IS 'Objetivos da iniciativa';
COMMENT ON COLUMN public.inscricoes.metodologia IS 'Metodologia utilizada';
COMMENT ON COLUMN public.inscricoes.principais_resultados IS 'Principais resultados alcançados';
COMMENT ON COLUMN public.inscricoes.declaracao IS 'Declaração de veracidade das informações';

-- Verificar se a estrutura foi atualizada corretamente
SELECT 
    'Estrutura atualizada com sucesso!' as resultado,
    COUNT(*) as total_colunas
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'inscricoes';