-- Função para retornar o progresso (contagem de avaliações) por jurado ignorando RLS
CREATE OR REPLACE FUNCTION get_jury_evaluations_count()
RETURNS TABLE (jurado_username text, avaliacoes_count bigint)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT a.jurado_username, count(*) as avaliacoes_count
  FROM public.avaliacoes a
  JOIN public.inscricoes i ON i.id = a.inscricao_id
  WHERE i.edicao_ano = 2026
  GROUP BY a.jurado_username;
END;
$$ LANGUAGE plpgsql;
