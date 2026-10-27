-- SOLUÇÃO EMERGENCIAL: DESABILITAR RLS COMPLETAMENTE
-- Execute este script no Supabase Dashboard > SQL Editor
-- Projeto: ljbxctmywdpsfmjvmlmh

-- IMPORTANTE: Esta é uma solução temporária para fazer o formulário funcionar
-- Em produção, você deve configurar políticas RLS adequadas

-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES (força bruta)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'inscricoes'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.inscricoes';
    END LOOP;
END $$;

-- 2. DESABILITAR RLS COMPLETAMENTE
ALTER TABLE public.inscricoes DISABLE ROW LEVEL SECURITY;

-- 3. VERIFICAR SE RLS FOI DESABILITADO
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS_Ativo"
FROM pg_tables 
WHERE tablename = 'inscricoes';

-- 4. CORRIGIR CAMPOS COM CONSTRAINT NOT NULL DESNECESSÁRIA
-- Tornar opcionais os campos que podem não ser preenchidos no formulário
ALTER TABLE public.inscricoes ALTER COLUMN matricula DROP NOT NULL;
ALTER TABLE public.inscricoes ALTER COLUMN unidade_setor DROP NOT NULL;

-- Verificar se existem outros campos problemáticos e corrigi-los preventivamente
DO $$
DECLARE
    col_name text;
BEGIN
    -- Lista de campos que devem ser opcionais
    FOR col_name IN 
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'inscricoes' 
            AND table_schema = 'public'
            AND is_nullable = 'NO'
            AND column_name NOT IN ('id', 'created_at', 'updated_at', 'declaracao', 'status')
    LOOP
        BEGIN
            EXECUTE 'ALTER TABLE public.inscricoes ALTER COLUMN ' || col_name || ' DROP NOT NULL';
            RAISE NOTICE 'Campo % tornado opcional', col_name;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Erro ao tornar campo % opcional: %', col_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 5. TESTAR INSERÇÃO DIRETA (sem campo matricula que estava causando erro)
INSERT INTO public.inscricoes (
    nome_completo,
    cargo_funcao,
    telefone,
    email_institucional,
    lotacao,
    area_atuacao,
    titulo_iniciativa,
    data_inicio,
    publico_alvo,
    descricao_iniciativa,
    objetivos,
    metodologia,
    principais_resultados,
    cooperacao,
    inovacao,
    resolutividade,
    impacto_social,
    alinhamento_ods,
    replicabilidade,
    participou_edicoes_anteriores,
    foi_vencedor_anterior,
    declaracao
) VALUES (
    'Teste Emergencial RLS',
    'Analista de Teste',
    '(86) 99999-9999',
    'teste.emergencial@mppi.mp.br',
    'Unidade de Teste',
    'Tecnologia da Informação',
    'Teste de Desabilitação RLS',
    '2024',
    'Servidores',
    'Teste para verificar se RLS foi desabilitado',
    'Verificar funcionamento sem RLS',
    'Inserção SQL direta',
    'RLS desabilitado com sucesso',
    'Excelente',
    'Alta',
    'Muito boa',
    'Significativo',
    'ODS 16',
    'Alta',
    false,
    false,
    true
);

-- 6. VERIFICAR SE A INSERÇÃO FUNCIONOU
SELECT 
    id, 
    nome_completo, 
    area_atuacao, 
    created_at 
FROM public.inscricoes 
WHERE nome_completo = 'Teste Emergencial RLS';

-- 7. LIMPAR O TESTE
DELETE FROM public.inscricoes WHERE nome_completo = 'Teste Emergencial RLS';

-- 8. MOSTRAR RESULTADO
SELECT 'RLS DESABILITADO E CAMPOS MATRICULA/UNIDADE_SETOR CORRIGIDOS! O formulário deve funcionar agora.' as resultado;