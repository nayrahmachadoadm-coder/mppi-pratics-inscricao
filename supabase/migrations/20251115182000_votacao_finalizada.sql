-- Tabela para controle de finalização de votação por jurado e categoria
CREATE TABLE IF NOT EXISTS public.votacao_finalizada (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurado_username text NOT NULL,
  categoria text NOT NULL,
  finalized_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (jurado_username, categoria)
);

ALTER TABLE public.votacao_finalizada ENABLE ROW LEVEL SECURITY;

-- Políticas: o próprio jurado pode inserir/consultar seu estado
CREATE POLICY IF NOT EXISTS "allow_jurado_manage_own_finalizacao" ON public.votacao_finalizada
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.auth_user_id = auth.uid()
        AND p.username = jurado_username
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.auth_user_id = auth.uid()
        AND p.username = jurado_username
    )
  );

-- Bloqueio de inserção/atualização de avaliações após finalização
CREATE POLICY IF NOT EXISTS "block_insert_after_finalizacao" ON public.avaliacoes
  FOR INSERT TO authenticated
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM public.votacao_finalizada vf
      JOIN public.inscricoes i ON i.id = inscricao_id
      WHERE vf.jurado_username = jurado_username
        AND vf.categoria = i.area_atuacao
    )
  );

CREATE POLICY IF NOT EXISTS "block_update_after_finalizacao" ON public.avaliacoes
  FOR UPDATE TO authenticated
  USING (
    NOT EXISTS (
      SELECT 1 FROM public.votacao_finalizada vf
      JOIN public.inscricoes i ON i.id = inscricao_id
      WHERE vf.jurado_username = jurado_username
        AND vf.categoria = i.area_atuacao
    )
  );

