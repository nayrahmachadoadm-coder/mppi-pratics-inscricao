-- Cria RPC para registrar jurado (perfil + role) com SECURITY DEFINER
-- Permite que o cliente chame após criar usuário via Supabase Auth

CREATE OR REPLACE FUNCTION public.register_jurado(
  _auth_user_id uuid,
  _username text,
  _full_name text,
  _email text,
  _seat_code text,
  _seat_label text,
  _must_change boolean
)
RETURNS uuid
LANGUAGE plpgsql
STABLE
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
    id, auth_user_id, username, full_name, email, seat_code, seat_label, must_change_password
  ) VALUES (
    _profile_id, _auth_user_id, _username, _full_name, _email, _seat_code, _seat_label, _must_change
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_profile_id, 'jurado')
  ON CONFLICT DO NOTHING;

  RETURN _profile_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_jurado(uuid, text, text, text, text, text, boolean) TO authenticated;
