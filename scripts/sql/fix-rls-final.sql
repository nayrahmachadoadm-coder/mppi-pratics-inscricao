-- CORREÇÃO DEFINITIVA DO RLS PARA INSCRICOES
-- Execute este script no Supabase Dashboard > SQL Editor
-- Projeto: ljbxctmywdpsfmjvmlmh

-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES
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

-- 2. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE public.inscricoes DISABLE ROW LEVEL SECURITY;

-- 3. REABILITAR RLS
ALTER TABLE public.inscricoes ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS CORRETAS

-- Política para permitir inserções públicas (formulário de inscrição)
CREATE POLICY "inscricoes_public_insert" ON public.inscricoes
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- Política para permitir leitura para usuários autenticados
CREATE POLICY "inscricoes_authenticated_select" ON public.inscricoes
    FOR SELECT 
    TO authenticated
    USING (true);

-- Política para permitir atualização para usuários autenticados
CREATE POLICY "inscricoes_authenticated_update" ON public.inscricoes
    FOR UPDATE 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para permitir exclusão para usuários autenticados
CREATE POLICY "inscricoes_authenticated_delete" ON public.inscricoes
    FOR DELETE 
    TO authenticated
    USING (true);

-- 5. VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'inscricoes'
ORDER BY policyname;

-- 6. VERIFICAR SE RLS ESTÁ ATIVO
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'inscricoes';

-- 7. TESTAR INSERÇÃO (opcional - remova os comentários para testar)
/*
INSERT INTO public.inscricoes (
    nome_completo,
    cargo_funcao,
    telefone,
    email_institucional,
    lotacao,
    area_atuacao,
    titulo_iniciativa,
    data_inicio,
    publico_alvo,
    descricao_iniciativa,
    objetivos,
    metodologia,
    principais_resultados,
    cooperacao,
    inovacao,
    resolutividade,
    impacto_social,
    alinhamento_ods,
    replicabilidade,
    participou_edicoes_anteriores,
    foi_vencedor_anterior,
    declaracao
) VALUES (
    'Teste RLS',
    'Analista',
    '(86) 99999-9999',
    'teste@mppi.mp.br',
    'TI',
    'Tecnologia',
    'Teste RLS',
    '2024',
    'Servidores',
    'Teste de inserção',
    'Verificar RLS',
    'SQL direto',
    'RLS funcionando',
    'Teste',
    'Teste',
    'Teste',
    'Teste',
    'Teste',
    'Teste',
    false,
    false,
    true
);

-- Verificar se foi inserido
SELECT id, nome_completo, area_atuacao FROM public.inscricoes WHERE nome_completo = 'Teste RLS';

-- Remover teste
DELETE FROM public.inscricoes WHERE nome_completo = 'Teste RLS';
*/