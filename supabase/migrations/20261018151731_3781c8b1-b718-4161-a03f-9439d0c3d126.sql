ALTER TABLE public.inscricoes ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
COMMENT ON COLUMN public.inscricoes.user_id IS 'Conta do proponente autenticado; opcional para inscrições públicas.';
NOTIFY pgrst, 'reload schema';