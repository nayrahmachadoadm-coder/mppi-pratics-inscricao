-- ==============================================================================
-- Migration: Restaurar RLS para Inscrições Públicas
-- Data: 2026-10-16
-- Descrição: Permite que participantes enviem inscrições diretamente pelo portal público
-- ==============================================================================

DROP POLICY IF EXISTS "proponente_insert_policy" ON public.inscricoes;
DROP POLICY IF EXISTS "allow_public_insert" ON public.inscricoes;
DROP POLICY IF EXISTS "inscricoes_public_insert" ON public.inscricoes;
DROP POLICY IF EXISTS "Anyone can insert inscricoes" ON public.inscricoes;
DROP POLICY IF EXISTS "public_insert_policy" ON public.inscricoes;
DROP POLICY IF EXISTS "Permitir inserção pública" ON public.inscricoes;

CREATE POLICY "inscricoes_public_insert" ON public.inscricoes
    FOR INSERT 
    TO public
    WITH CHECK (true);

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

DO $$
BEGIN
    ALTER TABLE public.inscricoes ALTER COLUMN user_id DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;
