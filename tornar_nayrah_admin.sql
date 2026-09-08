-- Script para conceder privilégios de administrador para nayrah@mppi.mp.br
-- Execute este script no SQL Editor do seu painel do Supabase

DO $$
DECLARE
  v_auth_user_id UUID;
  v_profile_id UUID;
BEGIN
  -- 1. Buscar o ID do usuário no Supabase Auth usando o email
  SELECT id INTO v_auth_user_id 
  FROM auth.users 
  WHERE email = 'nayrah@mppi.mp.br';
  
  IF v_auth_user_id IS NULL THEN
    RAISE NOTICE 'Usuária nayrah@mppi.mp.br não encontrada em auth.users. Certifique-se de que ela já fez cadastro/login.';
    RETURN;
  END IF;

  -- 2. Verificar se a usuária já tem um perfil na tabela profiles
  SELECT id INTO v_profile_id 
  FROM public.profiles 
  WHERE auth_user_id = v_auth_user_id;

  -- 3. Se não tiver perfil, cria um
  IF v_profile_id IS NULL THEN
    INSERT INTO public.profiles (auth_user_id, username, full_name, email)
    VALUES (v_auth_user_id, 'nayrah', 'Nayrah', 'nayrah@mppi.mp.br')
    RETURNING id INTO v_profile_id;
    RAISE NOTICE 'Perfil criado para nayrah@mppi.mp.br.';
  END IF;

  -- 4. Conceder a role de admin na tabela user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_profile_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RAISE NOTICE 'Role de administrador concedida com sucesso para nayrah@mppi.mp.br!';
END $$;
