-- Migração 005: Corrigir política RLS para permitir inserções públicas
-- Data: 2025-01-19
-- Problema: new row violates row-level security policy for table "inscricoes"

-- Remover todas as políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "public_insert_policy" ON public.inscricoes;
DROP POLICY IF EXISTS "authenticated_select_policy" ON public.inscricoes;
DROP POLICY IF EXISTS "authenticated_update_policy" ON public.inscricoes;
DROP POLICY IF EXISTS "authenticated_delete_policy" ON public.inscricoes;
DROP POLICY IF EXISTS "Anyone can insert inscricoes" ON public.inscricoes;
DROP POLICY IF EXISTS "Permitir inserção pública" ON public.inscricoes;
DROP POLICY IF EXISTS "Authenticated users can view inscricoes" ON public.inscricoes;
DROP POLICY IF EXISTS "Permitir leitura para administradores" ON public.inscricoes;
DROP POLICY IF EXISTS "Permitir atualização para administradores" ON public.inscricoes;

-- Desabilitar RLS temporariamente para limpeza completa
ALTER TABLE public.inscricoes DISABLE ROW LEVEL SECURITY;

-- Reabilitar RLS
ALTER TABLE public.inscricoes ENABLE ROW LEVEL SECURITY;

-- Criar política MUITO PERMISSIVA para inserções públicas
-- Esta política permite que QUALQUER pessoa insira dados (formulário público)
CREATE POLICY "allow_public_insert" ON public.inscricoes
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- Política para permitir leitura apenas para usuários autenticados
CREATE POLICY "allow_authenticated_select" ON public.inscricoes
    FOR SELECT 
    TO authenticated
    USING (true);

-- Política para permitir atualização apenas para usuários autenticados
CREATE POLICY "allow_authenticated_update" ON public.inscricoes
    FOR UPDATE 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para permitir exclusão apenas para usuários autenticados
CREATE POLICY "allow_authenticated_delete" ON public.inscricoes
    FOR DELETE 
    TO authenticated
    USING (true);

-- Verificar se as políticas foram criadas corretamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'inscricoes' 
ORDER BY policyname;

-- Testar inserção simples para verificar se funciona
-- (Esta linha será comentada após o teste)
-- INSERT INTO public.inscricoes (nome_completo, cargo_funcao, matricula, unidade_setor, telefone_institucional, email_institucional, equipe_envolvida, area, titulo_iniciativa, ano_inicio_execucao, situacao_atual, resumo_executivo, problema_necessidade, objetivos_estrategicos, etapas_metodologia, resultados_alcancados, cooperacao, inovacao, resolutividade, impacto_social, alinhamento_ods, replicabilidade, participou_edicoes_anteriores, foi_vencedor_anterior, concorda_termos, local_data) VALUES ('Teste RLS', 'Teste', 'TEST001', 'Teste', '(85) 99999-9999', 'teste@mppi.mp.br', 'Equipe Teste', 'Administrativa', 'Teste de RLS', '2025', 'Em andamento', 'Teste', 'Teste', 'Teste', 'Teste', 'Teste', 'Teste', 'Teste', 'Teste', 'Teste', 'Teste', 'Teste', 'nao', 'nao', true, 'Fortaleza, 19 de janeiro de 2025');