CREATE OR REPLACE FUNCTION public.has_role_text(_user_id uuid, _role_text text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, _role_text::app_role);
$$;

GRANT EXECUTE ON FUNCTION public.has_role_text(uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION public.has_role_text(uuid, text) TO authenticated;
