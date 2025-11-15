-- Fase 1: Criar função helper segura que bypassa RLS
CREATE OR REPLACE FUNCTION public.current_user_has_role(_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE p.auth_user_id = auth.uid()
      AND ur.role = _role
  );
$$;

-- Fase 2: Substituir políticas RLS recursivas

-- 2.1 - Tabela user_roles
DROP POLICY IF EXISTS "allow_admin_manage_roles" ON user_roles;

CREATE POLICY "allow_admin_manage_roles" 
  ON user_roles
  FOR ALL
  TO authenticated
  USING (public.current_user_has_role('admin'::app_role));

-- 2.2 - Tabela avaliacoes
DROP POLICY IF EXISTS "allow_admin_select_avaliacoes" ON avaliacoes;

CREATE POLICY "allow_admin_select_avaliacoes"
  ON avaliacoes
  FOR SELECT
  TO authenticated
  USING (public.current_user_has_role('admin'::app_role));

-- 2.3 - Tabela inscricoes (3 políticas)
DROP POLICY IF EXISTS "allow_admin_delete" ON inscricoes;
DROP POLICY IF EXISTS "allow_admin_update" ON inscricoes;
DROP POLICY IF EXISTS "allow_jurado_admin_select" ON inscricoes;

CREATE POLICY "allow_admin_delete"
  ON inscricoes
  FOR DELETE
  TO authenticated
  USING (public.current_user_has_role('admin'::app_role));

CREATE POLICY "allow_admin_update"
  ON inscricoes
  FOR UPDATE
  TO authenticated
  USING (public.current_user_has_role('admin'::app_role));

CREATE POLICY "allow_jurado_admin_select"
  ON inscricoes
  FOR SELECT
  TO authenticated
  USING (
    public.current_user_has_role('admin'::app_role) OR
    public.current_user_has_role('jurado'::app_role)
  );

-- 2.4 - Tabela profiles
DROP POLICY IF EXISTS "allow_admin_all_profiles" ON profiles;

CREATE POLICY "allow_admin_all_profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (public.current_user_has_role('admin'::app_role));

-- 2.5 - Adicionar política para jurados verem seu próprio perfil
CREATE POLICY "allow_jurado_own_profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Verificação final
SELECT 'Função current_user_has_role criada com sucesso!' as status;