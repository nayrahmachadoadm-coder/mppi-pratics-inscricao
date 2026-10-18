ALTER TABLE public.inscricoes DROP CONSTRAINT IF EXISTS inscricoes_user_id_fkey;
NOTIFY pgrst, 'reload schema';