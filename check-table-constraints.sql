-- VERIFICAR TODAS AS CONSTRAINTS NOT NULL DA TABELA INSCRICOES
-- Execute este script no Supabase Dashboard > SQL Editor
-- Projeto: ljbxctmywdpsfmjvmlmh

-- Verificar todos os campos obrigatórios (NOT NULL)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN is_nullable = 'NO' THEN 'OBRIGATÓRIO' 
        ELSE 'OPCIONAL' 
    END as status
FROM information_schema.columns 
WHERE table_name = 'inscricoes' 
    AND table_schema = 'public'
ORDER BY 
    CASE WHEN is_nullable = 'NO' THEN 1 ELSE 2 END,
    column_name;

-- Mostrar apenas os campos obrigatórios
SELECT 
    'CAMPOS OBRIGATÓRIOS (NOT NULL):' as titulo;

SELECT 
    column_name as "Campo_Obrigatório"
FROM information_schema.columns 
WHERE table_name = 'inscricoes' 
    AND table_schema = 'public'
    AND is_nullable = 'NO'
ORDER BY column_name;