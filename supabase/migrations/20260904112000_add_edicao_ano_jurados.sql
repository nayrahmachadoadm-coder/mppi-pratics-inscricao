-- Adicionar edicao_ano a profiles para separar jurados de 2025 e 2026
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS edicao_ano INTEGER DEFAULT 2025;

-- Atualiza a RPC rpc_list_jurados para retornar a nova coluna (se utilizada)
DROP FUNCTION IF EXISTS public.rpc_list_jurados();

CREATE OR REPLACE FUNCTION public.rpc_list_jurados()
RETURNS TABLE(
    username text,
    full_name text,
    created_at timestamptz,
    seat_code text,
    seat_label text,
    edicao_ano integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.username,
        p.full_name,
        p.created_at,
        p.seat_code,
        p.seat_label,
        p.edicao_ano
    FROM public.profiles p
    JOIN public.user_roles ur ON p.id = ur.user_id
    WHERE ur.role = 'jurado'
    ORDER BY p.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_list_jurados() TO authenticated;

-- Atualizar register_jurado para aceitar _edicao_ano
DROP FUNCTION IF EXISTS public.register_jurado(uuid, text, text, text, text, text, boolean);
DROP FUNCTION IF EXISTS public.register_jurado(uuid, text, text, text, text, text, boolean, integer);

CREATE OR REPLACE FUNCTION public.register_jurado(
  _auth_user_id uuid,
  _username text,
  _full_name text,
  _email text,
  _seat_code text,
  _seat_label text,
  _must_change boolean,
  _edicao_ano integer DEFAULT 2026
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _profile_id uuid := gen_random_uuid();
BEGIN
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') != 'service_role' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.profiles p ON p.id = ur.user_id
      WHERE p.auth_user_id = auth.uid()
        AND ur.role = 'admin'
    ) THEN
      RAISE EXCEPTION 'permission denied: only admin can register jurado';
    END IF;
  END IF;
  
  INSERT INTO public.profiles (
    id, auth_user_id, username, full_name, email, seat_code, seat_label, must_change_password, edicao_ano
  ) VALUES (
    _profile_id, _auth_user_id, _username, _full_name, _email, _seat_code, _seat_label, _must_change, _edicao_ano
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_profile_id, 'jurado')
  ON CONFLICT DO NOTHING;

  RETURN _profile_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_jurado(uuid, text, text, text, text, text, boolean, integer) TO authenticated;
