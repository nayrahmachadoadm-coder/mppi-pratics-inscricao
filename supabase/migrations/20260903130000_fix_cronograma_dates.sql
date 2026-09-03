-- Atualização das datas do cronograma para a 10ª Edição (2026) conforme Anexo Único do Edital 88/2026

UPDATE public.cronograma_parametros 
SET valor_data = '2026-09-08 00:00:00' 
WHERE chave = 'inicio_inscricoes';

UPDATE public.cronograma_parametros 
SET valor_data = '2026-10-08 23:59:59' 
WHERE chave = 'fim_inscricoes';

UPDATE public.cronograma_parametros 
SET valor_data = '2026-10-13 00:00:00' 
WHERE chave = 'inicio_recursos_inscricao';

UPDATE public.cronograma_parametros 
SET valor_data = '2026-10-16 23:59:59' 
WHERE chave = 'fim_recursos_inscricao';

UPDATE public.cronograma_parametros 
SET valor_data = '2026-10-20 00:00:00' 
WHERE chave = 'inicio_julgamento';

UPDATE public.cronograma_parametros 
SET valor_data = '2026-10-30 23:59:59' 
WHERE chave = 'fim_julgamento';

UPDATE public.cronograma_parametros 
SET valor_data = '2026-11-04 00:00:00' 
WHERE chave = 'inicio_votacao';

UPDATE public.cronograma_parametros 
SET valor_data = '2026-11-13 23:59:59' 
WHERE chave = 'fim_votacao';
