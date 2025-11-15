WITH user_data AS (
  SELECT p.id AS profile_id
  FROM public.profiles p
  JOIN auth.users a ON a.id = p.auth_user_id
  WHERE a.email = 'planejamento@mppi.mp.br'
  LIMIT 1
)
INSERT INTO public.user_roles (user_id, role)
SELECT profile_id, 'admin'::app_role
FROM user_data
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = (SELECT profile_id FROM user_data)
    AND ur.role = 'admin'::app_role
);
SELECT a.email, a.id AS auth_user_id, p.id AS profile_id, p.username, ur.role
FROM auth.users a
JOIN public.profiles p ON p.auth_user_id = a.id
LEFT JOIN public.user_roles ur ON ur.user_id = p.id
WHERE a.email = 'planejamento@mppi.mp.br';
