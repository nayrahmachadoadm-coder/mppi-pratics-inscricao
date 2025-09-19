-- Script para corrigir políticas RLS - Execute no SQL Editor do Supabase
-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Anyone can insert inscricoes" ON public.inscricoes;
DROP POLICY IF EXISTS "Permitir inserção pública" ON public.inscricoes;
DROP POLICY IF EXISTS "Authenticated users can view inscricoes" ON public.inscricoes;
DROP POLICY IF EXISTS "Permitir leitura para administradores" ON public.inscricoes;
DROP POLICY IF EXISTS "Permitir atualização para administradores" ON public.inscricoes;
DROP POLICY IF EXISTS "public_insert_policy" ON public.inscricoes;
DROP POLICY IF EXISTS "authenticated_select_policy" ON public.inscricoes;
DROP POLICY IF EXISTS "authenticated_update_policy" ON public.inscricoes;
DROP POLICY IF EXISTS "authenticated_delete_policy" ON public.inscricoes;

-- Recriar política para permitir inserções públicas
CREATE POLICY "allow_public_insert" ON public.inscricoes
    FOR INSERT 
    WITH CHECK (true);

-- Verificar se a política foi criada
SELECT policyname, cmd, with_check 
FROM pg_policies 
WHERE tablename = 'inscricoes' AND cmd = 'INSERT';