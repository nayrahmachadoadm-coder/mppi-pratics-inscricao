-- Script de correção para adicionar coluna status se não existir
-- Migração 002: Correção da coluna status

-- Verificar se a coluna status existe, se não, adicionar
DO $$ 
BEGIN
    -- Tentar adicionar a coluna status se ela não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'inscricoes' 
        AND column_name = 'status'
    ) THEN
        -- Adicionar a coluna status
        ALTER TABLE public.inscricoes 
        ADD COLUMN status TEXT DEFAULT 'pendente' 
        CHECK (status IN ('pendente', 'em_analise', 'aprovado', 'rejeitado'));
        
        -- Adicionar comentário
        COMMENT ON COLUMN public.inscricoes.status IS 'Status da inscrição: pendente, em_analise, aprovado, rejeitado';
        
        RAISE NOTICE 'Coluna status adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna status já existe';
    END IF;
    
    -- Verificar se a coluna observacoes existe, se não, adicionar
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'inscricoes' 
        AND column_name = 'observacoes'
    ) THEN
        -- Adicionar a coluna observacoes
        ALTER TABLE public.inscricoes 
        ADD COLUMN observacoes TEXT;
        
        -- Adicionar comentário
        COMMENT ON COLUMN public.inscricoes.observacoes IS 'Observações administrativas sobre a inscrição';
        
        RAISE NOTICE 'Coluna observacoes adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna observacoes já existe';
    END IF;
END $$;

-- Criar índice para status se não existir
CREATE INDEX IF NOT EXISTS idx_inscricoes_status ON public.inscricoes(status);

-- Verificar se a tabela foi criada corretamente
DO $$
BEGIN
    -- Verificar se todas as colunas essenciais existem
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'inscricoes'
    ) THEN
        RAISE NOTICE 'Tabela inscricoes existe';
        
        -- Listar colunas para debug
        RAISE NOTICE 'Verificando estrutura da tabela...';
    ELSE
        RAISE EXCEPTION 'Tabela inscricoes não foi encontrada!';
    END IF;
END $$;

-- Query para verificar a estrutura da tabela (para debug)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'inscricoes'
ORDER BY ordinal_position;