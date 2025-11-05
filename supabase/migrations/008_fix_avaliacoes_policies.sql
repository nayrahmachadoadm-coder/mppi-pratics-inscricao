-- Migração 008: Corrigir políticas RLS da tabela avaliacoes
-- Objetivo: Permitir que jurados insiram/atualizem suas próprias avaliações
--           e que administradores possam ler (e opcionalmente inserir/atualizar)

-- Garantir que RLS esteja habilitado na tabela
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas/broken
DROP POLICY IF EXISTS "allow_jurado_insert_own" ON public.avaliacoes;
DROP POLICY IF EXISTS "allow_jurado_update_own" ON public.avaliacoes;
DROP POLICY IF EXISTS "allow_admin_select_avaliacoes" ON public.avaliacoes;
DROP POLICY IF EXISTS "allow_jurado_select_own" ON public.avaliacoes;
DROP POLICY IF EXISTS "allow_admin_insert_avaliacoes" ON public.avaliacoes;
DROP POLICY IF EXISTS "allow_admin_update_avaliacoes" ON public.avaliacoes;

-- Jurados podem inserir suas próprias avaliações
CREATE POLICY "allow_jurado_insert_own" ON public.avaliacoes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      JOIN public.user_roles ur ON ur.user_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND ur.role = 'jurado'
        AND p.username = jurado_username
    )
  );

-- Jurados podem atualizar suas próprias avaliações
CREATE POLICY "allow_jurado_update_own" ON public.avaliacoes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      JOIN public.user_roles ur ON ur.user_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND ur.role = 'jurado'
        AND p.username = jurado_username
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      JOIN public.user_roles ur ON ur.user_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND ur.role = 'jurado'
        AND p.username = jurado_username
    )
  );

-- Jurados podem ver suas próprias avaliações
CREATE POLICY "allow_jurado_select_own" ON public.avaliacoes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      JOIN public.user_roles ur ON ur.user_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND ur.role = 'jurado'
        AND p.username = jurado_username
    )
  );

-- Administradores podem ver todas as avaliações
CREATE POLICY "allow_admin_select_avaliacoes" ON public.avaliacoes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.profiles p ON p.id = ur.user_id
      WHERE p.auth_user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );

-- Administradores podem inserir/atualizar avaliações (opcional)
CREATE POLICY "allow_admin_insert_avaliacoes" ON public.avaliacoes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.profiles p ON p.id = ur.user_id
      WHERE p.auth_user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );

CREATE POLICY "allow_admin_update_avaliacoes" ON public.avaliacoes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.profiles p ON p.id = ur.user_id
      WHERE p.auth_user_id = auth.uid()
        AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.profiles p ON p.id = ur.user_id
      WHERE p.auth_user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );