-- CORREÇÃO COMPLETA DO SUPABASE PARA SISTEMA ADMINISTRATIVO
-- Execute este script no Supabase Dashboard > SQL Editor
-- Projeto: ljbxctmywdpsfmjvmlmh

-- ========================================
-- 1. VERIFICAR E CORRIGIR ESTRUTURA DA TABELA
-- ========================================

-- Verificar se a tabela existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'inscricoes') THEN
        RAISE EXCEPTION 'Tabela inscricoes não existe! Execute as migrações primeiro.';
    END IF;
END $$;

-- Adicionar colunas que podem estar faltando (com IF NOT EXISTS para segurança)
ALTER TABLE public.inscricoes 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS nome_completo TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS email_institucional TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS telefone TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS matricula TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS lotacao TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS area_atuacao TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS titulo_iniciativa TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS data_inicio TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS data_fim TEXT,
ADD COLUMN IF NOT EXISTS publico_alvo TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS descricao_iniciativa TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS objetivos TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS metodologia TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS principais_resultados TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS situacao_atual TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS data_conclusao TEXT,
ADD COLUMN IF NOT EXISTS problema_necessidade TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS declaracao BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS foi_vencedor_anterior BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS local_data TEXT DEFAULT '';

-- ========================================
-- 2. CORRIGIR POLÍTICAS RLS
-- ========================================

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "public_insert_policy" ON public.inscricoes;
DROP POLICY IF EXISTS "authenticated_select_policy" ON public.inscricoes;
DROP POLICY IF EXISTS "authenticated_update_policy" ON public.inscricoes;
DROP POLICY IF EXISTS "authenticated_delete_policy" ON public.inscricoes;
DROP POLICY IF EXISTS "Anyone can insert inscricoes" ON public.inscricoes;
DROP POLICY IF EXISTS "Permitir inserção pública" ON public.inscricoes;
DROP POLICY IF EXISTS "Authenticated users can view inscricoes" ON public.inscricoes;
DROP POLICY IF EXISTS "Permitir leitura para administradores" ON public.inscricoes;
DROP POLICY IF EXISTS "Permitir atualização para administradores" ON public.inscricoes;
DROP POLICY IF EXISTS "allow_public_insert" ON public.inscricoes;
DROP POLICY IF EXISTS "allow_authenticated_select" ON public.inscricoes;
DROP POLICY IF EXISTS "inscricoes_public_insert" ON public.inscricoes;
DROP POLICY IF EXISTS "inscricoes_authenticated_select" ON public.inscricoes;
DROP POLICY IF EXISTS "inscricoes_authenticated_update" ON public.inscricoes;
DROP POLICY IF EXISTS "inscricoes_authenticated_delete" ON public.inscricoes;

-- Desabilitar RLS temporariamente
ALTER TABLE public.inscricoes DISABLE ROW LEVEL SECURITY;

-- Reabilitar RLS
ALTER TABLE public.inscricoes ENABLE ROW LEVEL SECURITY;

-- Criar políticas corretas para o sistema administrativo

-- 1. Permitir inserções públicas (formulário de inscrição)
CREATE POLICY "admin_public_insert" ON public.inscricoes
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- 2. Permitir leitura para usuários anônimos (sistema administrativo)
CREATE POLICY "admin_public_select" ON public.inscricoes
    FOR SELECT 
    TO public
    USING (true);

-- 3. Permitir atualização para usuários anônimos (sistema administrativo)
CREATE POLICY "admin_public_update" ON public.inscricoes
    FOR UPDATE 
    TO public
    USING (true)
    WITH CHECK (true);

-- 4. Permitir exclusão para usuários anônimos (sistema administrativo)
CREATE POLICY "admin_public_delete" ON public.inscricoes
    FOR DELETE 
    TO public
    USING (true);

-- ========================================
-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_inscricoes_area_atuacao ON public.inscricoes(area_atuacao);
CREATE INDEX IF NOT EXISTS idx_inscricoes_created_at ON public.inscricoes(created_at);
CREATE INDEX IF NOT EXISTS idx_inscricoes_email ON public.inscricoes(email_institucional);
CREATE INDEX IF NOT EXISTS idx_inscricoes_nome ON public.inscricoes(nome_completo);
CREATE INDEX IF NOT EXISTS idx_inscricoes_titulo ON public.inscricoes(titulo_iniciativa);

-- ========================================
-- 4. CRIAR FUNÇÃO PARA ATUALIZAR updated_at
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_inscricoes_updated_at ON public.inscricoes;
CREATE TRIGGER update_inscricoes_updated_at
    BEFORE UPDATE ON public.inscricoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 5. INSERIR DADOS DE TESTE (OPCIONAL)
-- ========================================

-- Verificar se já existem dados
DO $$
DECLARE
    record_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO record_count FROM public.inscricoes;
    
    IF record_count = 0 THEN
        -- Inserir dados de teste apenas se a tabela estiver vazia
        INSERT INTO public.inscricoes (
            nome_completo,
            email_institucional,
            telefone,
            matricula,
            lotacao,
            area_atuacao,
            titulo_iniciativa,
            data_inicio,
            data_fim,
            publico_alvo,
            descricao_iniciativa,
            objetivos,
            metodologia,
            principais_resultados,
            situacao_atual,
            problema_necessidade,
            declaracao
        ) VALUES 
        (
            'Ana Silva Santos',
            'ana.silva@mppi.mp.br',
            '(86) 99999-1111',
            'ANA001',
            'Procuradoria Geral',
            'Gestão de Pessoas',
            'Sistema de Avaliação de Desempenho Digital',
            '2024-02-01',
            '2024-12-31',
            'Servidores do MPPI',
            'Implementação de sistema digital para avaliação de desempenho dos servidores, substituindo o processo manual anterior.',
            'Modernizar o processo de avaliação de desempenho e torná-lo mais eficiente e transparente.',
            'Desenvolvimento iterativo com participação dos usuários finais e testes contínuos.',
            'Redução de 70% no tempo de processamento das avaliações e aumento da satisfação dos servidores.',
            'Em execução',
            'Processo manual demorado e propenso a erros, com baixa adesão dos servidores.',
            true
        ),
        (
            'Carlos Eduardo Lima',
            'carlos.lima@mppi.mp.br',
            '(86) 99999-2222',
            'CAR002',
            'Corregedoria',
            'Gestão Administrativa',
            'Portal de Transparência Avançado',
            '2024-03-15',
            '2024-11-30',
            'Cidadãos e servidores',
            'Desenvolvimento de portal com funcionalidades avançadas de transparência e acesso à informação pública.',
            'Aumentar a transparência institucional e facilitar o acesso dos cidadãos às informações públicas.',
            'Design centrado no usuário com metodologia ágil e testes de usabilidade.',
            'Aumento de 200% no acesso às informações públicas e melhoria na satisfação dos usuários.',
            'Concluído',
            'Portal antigo com baixa usabilidade e informações desatualizadas.',
            true
        ),
        (
            'Maria Oliveira Costa',
            'maria.oliveira@mppi.mp.br',
            '(86) 99999-3333',
            'MAR003',
            'Promotoria de Justiça',
            'Tecnologia da Informação',
            'Sistema de Gestão de Processos Digitais',
            '2024-01-10',
            '2025-01-10',
            'Promotores e servidores',
            'Sistema integrado para gestão digital de processos judiciais e administrativos.',
            'Digitalizar completamente o fluxo de processos e reduzir o uso de papel.',
            'Implementação gradual por setores com treinamento contínuo e suporte técnico.',
            'Redução de 85% no uso de papel e agilização de 60% no trâmite de processos.',
            'Em execução',
            'Processo manual lento e grande volume de documentos físicos.',
            true
        );
        
        RAISE NOTICE 'Dados de teste inseridos com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela já contém % registros. Dados de teste não inseridos.', record_count;
    END IF;
END $$;

-- ========================================
-- 6. VERIFICAÇÃO FINAL
-- ========================================

-- Verificar estrutura final
SELECT 
    'Configuração concluída!' as status,
    COUNT(*) as total_registros,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'inscricoes') as total_colunas,
    (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inscricoes') as rls_ativo
FROM public.inscricoes;

-- Listar políticas ativas
SELECT 
    policyname as politica,
    cmd as comando,
    roles as funcoes
FROM pg_policies 
WHERE tablename = 'inscricoes'
ORDER BY policyname;

-- Verificar se as consultas básicas funcionam
SELECT 
    'Teste de consulta básica' as teste,
    COUNT(*) as total_registros,
    COUNT(DISTINCT area_atuacao) as areas_diferentes
FROM public.inscricoes;

-- Mensagens finais
DO $$
BEGIN
    RAISE NOTICE 'Configuração do Supabase concluída com sucesso!';
    RAISE NOTICE 'O sistema administrativo agora deve funcionar corretamente.';
    RAISE NOTICE 'Acesse: http://localhost:8080/admin/login';
    RAISE NOTICE 'Usuário: admin | Senha: admin123';
END $$;