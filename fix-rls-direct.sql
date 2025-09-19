-- Script para corrigir RLS diretamente
-- Execute este script no Supabase Dashboard > SQL Editor

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

-- Desabilitar RLS temporariamente
ALTER TABLE public.inscricoes DISABLE ROW LEVEL SECURITY;

-- Reabilitar RLS
ALTER TABLE public.inscricoes ENABLE ROW LEVEL SECURITY;

-- Criar política MUITO PERMISSIVA para inserções públicas
CREATE POLICY "allow_public_insert" ON public.inscricoes
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- Política para leitura autenticada
CREATE POLICY "allow_authenticated_select" ON public.inscricoes
    FOR SELECT 
    TO authenticated
    USING (true);

-- Verificar políticas criadas
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'inscricoes';