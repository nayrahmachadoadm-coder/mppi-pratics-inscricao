-- 1. Remoção da exigência do critério "Alinhamento aos ODS" para Projetos na edição de 2026.
-- Esse script atualiza a trigger que validava e somava os pontos, removendo qualquer referência ao alinhamento_ods.

CREATE OR REPLACE FUNCTION public.trg_check_ods_e_calcula_total()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_tipo_iniciativa TEXT;
BEGIN
    -- Busca o tipo da iniciativa da inscrição avaliada
    SELECT tipo_iniciativa INTO v_tipo_iniciativa 
    FROM public.inscricoes 
    WHERE id = NEW.inscricao_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inscrição % não encontrada.', NEW.inscricao_id;
    END IF;

    -- Regra ODS (Removida para 2026)
    -- Não exige mais que Projetos pontuem ODS, nem proíbe Práticas.

    -- Recálculo do Total unificado para ambos os tipos (sem ODS)
    NEW.total := COALESCE(NEW.cooperacao, 0) + 
                 COALESCE(NEW.inovacao, 0) + 
                 COALESCE(NEW.resolutividade, 0) + 
                 COALESCE(NEW.impacto_social, 0) + 
                 COALESCE(NEW.replicabilidade, 0);

    RETURN NEW;
END;
$$;
