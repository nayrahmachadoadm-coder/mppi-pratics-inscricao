-- Script SQL para criar perfil e role do usuário planejamento
-- Execute este script no Supabase Dashboard > SQL Editor

-- Buscar o ID do usuário na tabela auth.users pelo email
WITH user_info AS (
  SELECT id as auth_user_id
  FROM auth.users 
  WHERE email = 'planejamento@mppi.mp.br'
  LIMIT 1
)

-- Inserir o perfil na tabela profiles (se não existir)
INSERT INTO public.profiles (auth_user_id, username, full_name, email, seat_code, seat_label, must_change_password)
SELECT 
  auth_user_id,
  'planejamento',
  'Assessoria de Planejamento e Gestão',
  'planejamento@mppi.mp.br',
  'PLANEJAMENTO',
  'Assessoria de Planejamento e Gestão',
  false
FROM user_info
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.auth_user_id = (SELECT auth_user_id FROM user_info)
);

-- Obter o ID do perfil criado/recuperado
WITH user_data AS (
  SELECT p.id as profile_id
  FROM public.profiles p
  JOIN auth.users a ON a.id = p.auth_user_id
  WHERE a.email = 'planejamento@mppi.mp.br'
  LIMIT 1
)

-- Inserir o registro na tabela user_roles (se não existir)
INSERT INTO public.user_roles (user_id, role)
SELECT profile_id, 'admin'
FROM user_data
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = (SELECT profile_id FROM user_data)
);

-- Verificar se tudo foi criado corretamente
SELECT 
  '✅ Usuário configurado com sucesso!' as status,
  a.email,
  a.id as auth_user_id,
  p.id as profile_id,
  p.username,
  p.full_name,
  ur.role
FROM auth.users a
JOIN public.profiles p ON p.auth_user_id = a.id
JOIN public.user_roles ur ON ur.user_id = p.id
WHERE a.email = 'planejamento@mppi.mp.br';