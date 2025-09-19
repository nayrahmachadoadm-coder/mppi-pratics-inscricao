-- Migração 004: Corrigir políticas RLS para permitir inserções públicas
-- Data: 2025-01-19

-- Remover políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "Anyone can insert inscricoes" ON public.inscricoes;
DROP POLICY IF EXISTS "Permitir inserção pública" ON public.inscricoes;
DROP POLICY IF EXISTS "Authenticated users can view inscricoes" ON public.inscricoes;
DROP POLICY IF EXISTS "Permitir leitura para administradores" ON public.inscricoes;
DROP POLICY IF EXISTS "Permitir atualização para administradores" ON public.inscricoes;

-- Desabilitar RLS temporariamente para limpeza
ALTER TABLE public.inscricoes DISABLE ROW LEVEL SECURITY;

-- Reabilitar RLS
ALTER TABLE public.inscricoes ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir inserções públicas (formulário é público)
CREATE POLICY "public_insert_policy" ON public.inscricoes
    FOR INSERT 
    WITH CHECK (true);

-- Criar política para permitir leitura apenas para usuários autenticados (admin)
CREATE POLICY "authenticated_select_policy" ON public.inscricoes
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

-- Criar política para permitir atualização apenas para usuários autenticados (admin)
CREATE POLICY "authenticated_update_policy" ON public.inscricoes
    FOR UPDATE 
    USING (auth.uid() IS NOT NULL);

-- Criar política para permitir exclusão apenas para usuários autenticados (admin)
CREATE POLICY "authenticated_delete_policy" ON public.inscricoes
    FOR DELETE 
    USING (auth.uid() IS NOT NULL);

-- Verificar se as políticas foram criadas corretamente
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