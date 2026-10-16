-- Migration: Habilitar Banco de Práticas (Auth, RLS, Storage)
-- Data: 2026-10-08

-- 1. Adicionar user_id à tabela inscricoes
ALTER TABLE public.inscricoes
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Limpar políticas de RLS antigas na tabela inscricoes
DROP POLICY IF EXISTS "public_insert_policy" ON public.inscricoes;
DROP POLICY IF EXISTS "authenticated_select_policy" ON public.inscricoes;
DROP POLICY IF EXISTS "authenticated_update_policy" ON public.inscricoes;
DROP POLICY IF EXISTS "authenticated_delete_policy" ON public.inscricoes;

-- 3. Novas Políticas RLS para inscricoes

-- A) SELECT (Vitrine Pública): Práticas validadas são visíveis por TODOS (anon e authenticated)
CREATE POLICY "vitrine_select_policy" ON public.inscricoes
FOR SELECT
USING (status_inscricao = 'Validada');

-- B) SELECT (Dono e Admin/Jurado): Donos veem as suas, Admin e Jurado veem todas
CREATE POLICY "auth_select_policy" ON public.inscricoes
FOR SELECT TO authenticated
USING (
    user_id = auth.uid() 
    OR public.has_role_text(auth.uid(), 'admin') 
    OR public.has_role_text(auth.uid(), 'jurado')
);

-- C) INSERT (Proponentes): Usuários logados podem inserir práticas vinculadas a eles
CREATE POLICY "proponente_insert_policy" ON public.inscricoes
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- D) UPDATE (Proponentes e Admin): Donos atualizam as suas, Admins atualizam todas
CREATE POLICY "auth_update_policy" ON public.inscricoes
FOR UPDATE TO authenticated
USING (
    user_id = auth.uid() 
    OR public.has_role_text(auth.uid(), 'admin')
)
WITH CHECK (
    user_id = auth.uid() 
    OR public.has_role_text(auth.uid(), 'admin')
);

-- E) DELETE (Apenas Admin)
CREATE POLICY "admin_delete_policy" ON public.inscricoes
FOR DELETE TO authenticated
USING (public.has_role_text(auth.uid(), 'admin'));

-- 4. Criar bucket de armazenamento para Anexos Nativos (Opcional, mas já deixamos preparado)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('praticas-anexos', 'praticas-anexos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de RLS para o Storage
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Proponentes Upload" ON storage.objects;

-- Todos podem baixar os anexos (Vitrine)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'praticas-anexos' );

-- Proponentes podem subir seus próprios anexos
CREATE POLICY "Proponentes Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'praticas-anexos' AND (storage.foldername(name))[1] = auth.uid()::text );

-- Proponentes podem deletar seus anexos
CREATE POLICY "Proponentes Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'praticas-anexos' AND (storage.foldername(name))[1] = auth.uid()::text );
