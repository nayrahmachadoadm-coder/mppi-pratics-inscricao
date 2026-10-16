-- ==============================================================================
-- Migration: RPC para exclusão completa de inscrição pelo Administrador
-- Descrição: Permite eliminar completamente uma inscrição (duplicada ou incorreta)
--            junto a todos os seus dados e registros relacionados.
-- ==============================================================================

-- 1. Garantir política de DELETE na tabela inscricoes para administradores
DROP POLICY IF EXISTS "admin_delete_policy" ON public.inscricoes;
CREATE POLICY "admin_delete_policy" ON public.inscricoes
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE p.auth_user_id = auth.uid() AND ur.role::text = 'admin'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role::text = 'admin'
  )
);

-- 2. Função RPC SECURITY DEFINER para exclusão com integridade referencial completa
CREATE OR REPLACE FUNCTION public.rpc_delete_inscricao(p_inscricao_id UUID)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
    v_uid UUID := auth.uid();
    v_is_admin BOOLEAN := false;
    v_titulo TEXT;
BEGIN
    -- 1. Verificar se usuário logado é administrador
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        LEFT JOIN public.profiles p ON p.id = ur.user_id
        WHERE (p.auth_user_id = v_uid OR ur.user_id = v_uid)
          AND ur.role::text = 'admin'
    ) INTO v_is_admin;

    -- Fallback via has_role_text se existir
    IF NOT v_is_admin THEN
        BEGIN
            SELECT public.has_role_text(v_uid, 'admin') INTO v_is_admin;
        EXCEPTION WHEN OTHERS THEN
            v_is_admin := false;
        END;
    END IF;

    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem excluir inscrições.';
    END IF;

    -- 2. Verificar se a inscrição existe
    SELECT titulo_iniciativa INTO v_titulo
    FROM public.inscricoes
    WHERE id = p_inscricao_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Inscrição não encontrada no banco de dados.'
        );
    END IF;

    -- 3. Excluir dados relacionados de tabelas filhas defensivamente
    -- (caso alguma chave estrangeira não possua ON DELETE CASCADE)
    BEGIN
        DELETE FROM public.avaliacoes WHERE inscricao_id = p_inscricao_id;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    BEGIN
        DELETE FROM public.votos_populares WHERE inscricao_id = p_inscricao_id;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    BEGIN
        DELETE FROM public.inscricao_status_historico WHERE inscricao_id = p_inscricao_id;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    BEGIN
        DELETE FROM public.finalistas_snapshot WHERE inscricao_id = p_inscricao_id;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    BEGIN
        DELETE FROM public.apuracao_resultados WHERE inscricao_id = p_inscricao_id;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    -- 4. Excluir a inscrição principal
    DELETE FROM public.inscricoes WHERE id = p_inscricao_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Trabalho inscrito e registros vinculados excluídos com sucesso.'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;

-- Permissões de execução
REVOKE EXECUTE ON FUNCTION public.rpc_delete_inscricao(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.rpc_delete_inscricao(UUID) TO authenticated;
