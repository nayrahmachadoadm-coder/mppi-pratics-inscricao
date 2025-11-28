-- Função RPC para retornar os top 3 finalistas por categoria (com SECURITY DEFINER para acesso público)
CREATE OR REPLACE FUNCTION public.voto_popular_top3_por_categoria(area_key text)
RETURNS TABLE (
  categoria text,
  inscricao_id uuid,
  titulo_iniciativa text,
  nome_completo text,
  lotacao text,
  descricao_iniciativa text,
  problema_necessidade text,
  metodologia text,
  principais_resultados text,
  publico_alvo text,
  objetivos text,
  cooperacao text,
  inovacao text,
  resolutividade text,
  impacto_social text,
  alinhamento_ods text,
  replicabilidade text,
  data_inicio text,
  cargo_funcao text,
  area_atuacao text,
  avaliacoes_count bigint,
  total_geral numeric,
  total_resolutividade numeric,
  total_replicabilidade numeric,
  posicao bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH ranking AS (
    SELECT
      i.area_atuacao AS categoria,
      i.id AS inscricao_id,
      i.titulo_iniciativa,
      i.nome_completo,
      i.lotacao,
      i.descricao_iniciativa,
      i.problema_necessidade,
      i.metodologia,
      i.principais_resultados,
      i.publico_alvo,
      i.objetivos,
      i.cooperacao,
      i.inovacao,
      i.resolutividade,
      i.impacto_social,
      i.alinhamento_ods,
      i.replicabilidade,
      i.data_inicio,
      i.cargo_funcao,
      i.area_atuacao,
      COUNT(a.id) AS avaliacoes_count,
      COALESCE(SUM(a.total), 0) AS total_geral,
      COALESCE(SUM(a.resolutividade), 0) AS total_resolutividade,
      COALESCE(SUM(a.replicabilidade), 0) AS total_replicabilidade,
      ROW_NUMBER() OVER (
        ORDER BY 
          COALESCE(SUM(a.total), 0) DESC,
          COALESCE(SUM(a.resolutividade), 0) DESC,
          COALESCE(SUM(a.replicabilidade), 0) DESC,
          i.titulo_iniciativa ASC
      ) AS posicao
    FROM inscricoes i
    LEFT JOIN avaliacoes a ON a.inscricao_id = i.id
    WHERE i.area_atuacao = area_key
    GROUP BY i.id
  )
  SELECT * FROM ranking
  WHERE posicao <= 3
  ORDER BY posicao;
$$;

-- Conceder permissão para anon e authenticated chamarem a função
GRANT EXECUTE ON FUNCTION public.voto_popular_top3_por_categoria(text) TO anon;
GRANT EXECUTE ON FUNCTION public.voto_popular_top3_por_categoria(text) TO authenticated;