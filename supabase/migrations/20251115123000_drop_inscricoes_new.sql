-- Remover tabela inscricoes_new se existir e estiver vazia
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'inscricoes_new'
  ) THEN
    IF (SELECT COUNT(*) FROM public.inscricoes_new) = 0 THEN
      DROP TABLE public.inscricoes_new CASCADE;
      RAISE NOTICE 'Tabela inscricoes_new removida (estava vazia)';
    ELSE
      RAISE NOTICE 'Tabela inscricoes_new possui registros e não foi removida';
    END IF;
  ELSE
    RAISE NOTICE 'Tabela inscricoes_new não existe';
  END IF;
END $$;

-- Verificação pós-remoção
SELECT 
  t.table_name, 
  t.rowsecurity
FROM pg_tables t
WHERE t.schemaname = 'public' 
  AND t.table_name IN ('inscricoes', 'inscricoes_new')
ORDER BY t.table_name;
