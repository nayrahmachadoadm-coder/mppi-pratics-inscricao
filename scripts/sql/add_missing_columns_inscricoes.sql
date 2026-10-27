-- Adiciona as colunas ausentes na tabela inscricoes para evitar erros ao salvar
-- Execute no Supabase SQL Editor

ALTER TABLE public.inscricoes 
ADD COLUMN IF NOT EXISTS cargo_funcao TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS cooperacao TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS inovacao TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS resolutividade TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS impacto_social TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS alinhamento_ods TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS replicabilidade TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS participou_edicoes_anteriores BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS observacoes TEXT,
ADD COLUMN IF NOT EXISTS cadastro_banco_praticas BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS identificacao_banco_praticas TEXT,
ADD COLUMN IF NOT EXISTS institucionalizado_ato BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS identificacao_projeto_metodologia TEXT;

-- Mensagem de confirmação
DO $$
BEGIN
    RAISE NOTICE 'Colunas adicionadas com sucesso à tabela inscricoes!';
END $$;
