-- Migration: Adicionar recursos para a Triagem (Edital 6.7)

-- 1. Adicionar coluna parecer_triagem
ALTER TABLE public.inscricoes
ADD COLUMN IF NOT EXISTS parecer_triagem TEXT;

COMMENT ON COLUMN public.inscricoes.parecer_triagem IS 'Parecer ou justificativa registrada pela comissão durante a triagem da inscrição.';

-- 2. Criar RPC para atualizar o status e o parecer da inscrição, restrita a admins
CREATE OR REPLACE FUNCTION public.rpc_update_status_inscricao(
    p_inscricao_id UUID,
    p_status TEXT,
    p_parecer TEXT DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
    v_uid UUID := auth.uid();
    v_is_admin BOOLEAN;
    v_current_status TEXT;
BEGIN
    -- Verifica se usuário é admin
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = v_uid AND role::text = 'admin'
    ) INTO v_is_admin;

    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem atualizar o status da inscrição.';
    END IF;

    -- Pega o status atual
    SELECT status_inscricao INTO v_current_status 
    FROM public.inscricoes 
    WHERE id = p_inscricao_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inscrição % não encontrada.', p_inscricao_id;
    END IF;

    -- Atualiza a inscrição
    UPDATE public.inscricoes
    SET 
        status_inscricao = p_status,
        parecer_triagem = p_parecer,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_inscricao_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Status atualizado com sucesso'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;
