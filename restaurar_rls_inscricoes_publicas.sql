-- ==============================================================================
-- CORREÇÃO EMERGENCIAL DE RLS: LIBERAR INSCRIÇÕES PÚBLICAS
-- Prêmio Melhores Práticas MPPI 2026
-- Execute este script no SQL Editor do painel do Supabase (https://supabase.com/dashboard)
-- Projeto: ljbxctmywdpsfmjvmlmh
-- ==============================================================================

-- 1. Remover políticas que estejam bloqueando a inserção pública do formulário
DROP POLICY IF EXISTS "proponente_insert_policy" ON public.inscricoes;
DROP POLICY IF EXISTS "allow_public_insert" ON public.inscricoes;
DROP POLICY IF EXISTS "inscricoes_public_insert" ON public.inscricoes;
DROP POLICY IF EXISTS "Anyone can insert inscricoes" ON public.inscricoes;
DROP POLICY IF EXISTS "public_insert_policy" ON public.inscricoes;
DROP POLICY IF EXISTS "Permitir inserção pública" ON public.inscricoes;

-- 2. Criar política de inserção pública (permite que qualquer servidor/membro envie sua inscrição)
CREATE POLICY "inscricoes_public_insert" ON public.inscricoes
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- 3. Garantir políticas de leitura e gerenciamento para o painel administrativo e jurados
DROP POLICY IF EXISTS "inscricoes_authenticated_select" ON public.inscricoes;
CREATE POLICY "inscricoes_authenticated_select" ON public.inscricoes
    FOR SELECT 
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "inscricoes_authenticated_update" ON public.inscricoes;
CREATE POLICY "inscricoes_authenticated_update" ON public.inscricoes
    FOR UPDATE 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Garantir que a coluna user_id seja opcional (nullable) para envios anônimos
DO $$
BEGIN
    ALTER TABLE public.inscricoes ALTER COLUMN user_id DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 5. Conferir as políticas ativas da tabela inscricoes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    with_check
FROM pg_policies 
WHERE tablename = 'inscricoes'
ORDER BY policyname;
