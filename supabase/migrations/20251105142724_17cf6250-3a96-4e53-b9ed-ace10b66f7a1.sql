-- Criar função RPC para registrar jurado
CREATE OR REPLACE FUNCTION public.register_jurado(
  _auth_user_id uuid,
  _username text,
  _full_name text,
  _email text,
  _seat_code text,
  _seat_label text,
  _must_change boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _profile_id uuid;
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
  -- Criar perfil
  INSERT INTO public.profiles (auth_user_id, username, full_name, email, seat_code, seat_label, must_change_password)
  VALUES (_auth_user_id, _username, _full_name, _email, _seat_code, _seat_label, _must_change)
  RETURNING id INTO _profile_id;
  
  -- Atribuir role de jurado
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_profile_id, 'jurado'::app_role);
  
  RETURN _profile_id;
END;
$$;

-- Criar função RPC para registrar admin
CREATE OR REPLACE FUNCTION public.register_admin(
  _auth_user_id uuid,
  _username text,
  _full_name text,
  _email text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _profile_id uuid;
BEGIN
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') != 'service_role' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.profiles p ON p.id = ur.user_id
      WHERE p.auth_user_id = auth.uid()
        AND ur.role = 'admin'
    ) THEN
      RAISE EXCEPTION 'permission denied: only admin can register admin';
    END IF;
  END IF;
  -- Criar perfil
  INSERT INTO public.profiles (auth_user_id, username, full_name, email)
  VALUES (_auth_user_id, _username, _full_name, _email)
  RETURNING id INTO _profile_id;
  
  -- Atribuir role de admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_profile_id, 'admin'::app_role);
  
  RETURN _profile_id;
END;
$$;

-- Criar função RPC para atualizar senha e flag must_change_password
CREATE OR REPLACE FUNCTION public.update_profile_password_flag(
  _profile_id uuid,
  _must_change boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET must_change_password = _must_change
  WHERE id = _profile_id;
END;
$$;
