-- Script SQL para corrigir o acesso completo do administrador planejamento
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. Buscar o auth_user_id do usuário planejamento
WITH admin_user AS (
  SELECT id as auth_user_id
  FROM auth.users 
  WHERE email = 'planejamento@mppi.mp.br'
  LIMIT 1
)

-- 2. Criar o perfil na tabela profiles (se não existir)
INSERT INTO public.profiles (
  auth_user_id, 
  username, 
  full_name, 
  email, 
  seat_code, 
  seat_label, 
  must_change_password
)
SELECT 
  auth_user_id,
  'planejamento',
  'Assessoria de Planejamento e Gestão',
  'planejamento@mppi.mp.br',
  'PLANEJAMENTO',
  'Assessoria de Planejamento e Gestão',
  false
FROM admin_user
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.auth_user_id = (SELECT auth_user_id FROM admin_user)
);

-- 3. Obter o ID do perfil criado/recuperado
WITH admin_profile AS (
  SELECT p.id as profile_id
  FROM public.profiles p
  JOIN admin_user au ON p.auth_user_id = au.auth_user_id
  LIMIT 1
)

-- 4. Criar o registro na tabela user_roles com role 'admin'
INSERT INTO public.user_roles (user_id, role)
SELECT profile_id, 'admin'
FROM admin_profile
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = (SELECT profile_id FROM admin_profile)
);

-- 5. Verificar se existe alguma role 'jurado' e removê-la (opcional)
-- DELETE FROM public.user_roles ur
-- USING admin_profile ap
-- WHERE ur.user_id = ap.profile_id AND ur.role = 'jurado';

-- 6. Confirmar que tudo foi criado corretamente
SELECT 
  '✅ CONFIGURAÇÃO CONCLUÍDA!' as status,
  a.email,
  a.id as auth_user_id,
  p.id as profile_id,
  p.username,
  p.full_name,
  ur.role,
  CASE 
    WHEN ur.role = 'admin' THEN '✅ Acesso completo de administrador'
    WHEN ur.role = 'jurado' THEN '⚠️  Acesso limitado de jurado'
    ELSE '❌ Sem role definida'
  END as access_level
FROM auth.users a
JOIN public.profiles p ON p.auth_user_id = a.id
JOIN public.user_roles ur ON ur.user_id = p.id
WHERE a.email = 'planejamento@mppi.mp.br';

-- 7. Verificar todas as roles do usuário
SELECT 
  '📋 ROLES DO USUÁRIO:' as info,
  ur.role,
  ur.created_at
FROM public.user_roles ur
JOIN public.profiles p ON p.id = ur.user_id
JOIN auth.users a ON a.id = p.auth_user_id
WHERE a.email = 'planejamento@mppi.mp.br'
ORDER BY ur.created_at DESC;

-- 8. Testar a função has_role
SELECT 
  '🔍 TESTE DA FUNÇÃO has_role:' as test,
  public.has_role(p.id, 'admin') as has_admin_role,
  public.has_role(p.id, 'jurado') as has_jurado_role
FROM public.profiles p
JOIN auth.users a ON a.id = p.auth_user_id
WHERE a.email = 'planejamento@mppi.mp.br';