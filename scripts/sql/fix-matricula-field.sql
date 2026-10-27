-- CORREÇÃO DO CAMPO MATRICULA
-- Execute este script no Supabase Dashboard > SQL Editor
-- Projeto: ljbxctmywdpsfmjvmlmh

-- PROBLEMA: Campo 'matricula' está como NOT NULL mas deveria ser opcional
-- SOLUÇÃO: Tornar o campo matricula opcional (nullable)

-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'inscricoes' 
    AND table_schema = 'public'
    AND column_name IN ('matricula', 'nome_completo', 'area_atuacao')
ORDER BY column_name;

-- 2. TORNAR O CAMPO MATRICULA OPCIONAL
ALTER TABLE public.inscricoes 
ALTER COLUMN matricula DROP NOT NULL;

-- 3. VERIFICAR SE A ALTERAÇÃO FOI APLICADA
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'inscricoes' 
    AND table_schema = 'public'
    AND column_name = 'matricula';

-- 4. TESTAR INSERÇÃO SEM MATRICULA
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
    -- Note que matricula não está sendo fornecida
) VALUES (
    'Teste Sem Matricula',
    'Analista de Teste',
    '(86) 99999-9999',
    'teste.sem.matricula@mppi.mp.br',
    'Unidade de Teste',
    'Tecnologia da Informação',
    'Teste Sem Campo Matricula',
    '2024',
    'Servidores',
    'Teste para verificar se matricula é opcional',
    'Verificar funcionamento sem matricula',
    'Inserção SQL direta',
    'Campo matricula agora é opcional',
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

-- 5. VERIFICAR SE A INSERÇÃO FUNCIONOU
SELECT 
    id, 
    nome_completo, 
    matricula,
    area_atuacao, 
    created_at 
FROM public.inscricoes 
WHERE nome_completo = 'Teste Sem Matricula';

-- 6. LIMPAR O TESTE
DELETE FROM public.inscricoes WHERE nome_completo = 'Teste Sem Matricula';

-- 7. MOSTRAR RESULTADO
SELECT 'CAMPO MATRICULA CORRIGIDO! Agora é opcional.' as resultado;

-- 8. VERIFICAR TODOS OS CAMPOS OBRIGATÓRIOS RESTANTES
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'inscricoes' 
    AND table_schema = 'public'
    AND is_nullable = 'NO'
ORDER BY column_name;