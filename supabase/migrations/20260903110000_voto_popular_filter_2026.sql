-- 1. Atualizar RPC de contagem de votos para filtrar por edicao_ano = 2026
DROP FUNCTION IF EXISTS public.votos_count(text);
CREATE OR REPLACE FUNCTION public.votos_count(categoria text)
RETURNS TABLE (inscricao_id uuid, votos integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT vp.inscricao_id, count(*)::int AS votos
  FROM public.votos_populares vp
  JOIN public.inscricoes i ON i.id = vp.inscricao_id
  WHERE vp.categoria = categoria AND i.edicao_ano = 2026
  GROUP BY vp.inscricao_id
  ORDER BY votos DESC;
$$;

-- 2. Atualizar RPC de obter candidatos do voto popular para filtrar por edicao_ano = 2026
DROP FUNCTION IF EXISTS public.get_voto_popular_candidatos(text, double precision);
CREATE OR REPLACE FUNCTION public.get_voto_popular_candidatos(p_categoria TEXT, p_session_seed DOUBLE PRECISION)
RETURNS TABLE (
    inscricao_id UUID,
    titulo_iniciativa TEXT,
    nome_completo TEXT,
    lotacao TEXT,
    descricao_iniciativa TEXT,
    problema_necessidade TEXT,
    metodologia TEXT,
    principais_resultados TEXT
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    v_inicio TIMESTAMP;
    v_fim TIMESTAMP;
BEGIN
    SELECT valor_data INTO v_inicio FROM public.cronograma_parametros WHERE chave = 'inicio_votacao';
    SELECT valor_data INTO v_fim FROM public.cronograma_parametros WHERE chave = 'fim_votacao';

    IF now() < v_inicio OR now() > v_fim THEN
        RAISE EXCEPTION 'Fora do período de votação.';
    END IF;

    RETURN QUERY
    SELECT 
        i.id,
        i.titulo_iniciativa,
        i.nome_completo,
        i.unidade_setor AS lotacao,
        i.resumo_executivo AS descricao_iniciativa,
        i.problema_necessidade,
        i.etapas_metodologia AS metodologia,
        i.resultados_alcancados AS principais_resultados
    FROM public.finalistas_snapshot fs
    JOIN public.inscricoes i ON i.id = fs.inscricao_id
    WHERE fs.categoria = p_categoria AND i.edicao_ano = 2026
    ORDER BY md5(fs.inscricao_id::text || p_session_seed::text);
END;
$$;
