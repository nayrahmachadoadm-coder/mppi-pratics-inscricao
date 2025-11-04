-- Corrigir search_path da função votos_count
CREATE OR REPLACE FUNCTION public.votos_count(categoria text)
RETURNS TABLE(inscricao_id uuid, votos bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT inscricao_id, COUNT(*) as votos
  FROM public.votos_populares
  WHERE votos_populares.categoria = votos_count.categoria
  GROUP BY inscricao_id;
$$;